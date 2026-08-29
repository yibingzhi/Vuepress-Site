---
title: SpringCloud微服务详解
createTime: 2025/08/07 17:29:46
permalink: /微服务/95s829ku/
---

## Spring Cloud 微服务详解

### 一、微服务架构概述

#### 1. 微服务架构特点

**微服务架构** 是一种将单体应用拆分为多个小型、独立服务的架构模式。

**核心特点：**

- **服务独立**：每个服务可以独立开发、部署、扩展
- **技术异构**：不同服务可以使用不同的技术栈
- **数据自治**：每个服务管理自己的数据
- **故障隔离**：单个服务故障不影响整体系统

### 二、服务注册与发现

#### 1. Nacos 服务注册

**Nacos 配置：**

```yaml
# application.yml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        cluster-name: DEFAULT
        register-enabled: true
        ephemeral: true
      config:
        server-addr: localhost:8848
        file-extension: yaml
        namespace: public
        group: DEFAULT_GROUP
```

**服务启动类：**

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

**服务提供者：**

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
}
```

#### 2. 服务发现与调用

**使用 RestTemplate：**

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUserInfo(Long userId) {
        // 通过服务名调用
        String url = "http://user-service/users/" + userId;
        ResponseEntity<User> response = restTemplate.getForEntity(url, User.class);
        return response.getBody();
    }
}
```

**使用 OpenFeign：**

```java
@FeignClient(name = "user-service", fallback = UserServiceFallback.class)
public interface UserServiceClient {
    
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable("id") Long id);
    
    @PostMapping("/users")
    User createUser(@RequestBody User user);
    
    @GetMapping("/users")
    List<User> getAllUsers();
}

@Component
public class UserServiceFallback implements UserServiceClient {
    
    @Override
    public User getUserById(Long id) {
        // 降级逻辑
        return new User();
    }
    
    @Override
    public User createUser(User user) {
        return null;
    }
    
    @Override
    public List<User> getAllUsers() {
        return new ArrayList<>();
    }
}
```

### 三、配置中心

#### 1. Nacos 配置中心

**配置管理：**

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        namespace: public
        group: DEFAULT_GROUP
        # 共享配置
        shared-configs:
          - data-id: common-config.yaml
            group: DEFAULT_GROUP
            refresh: true
        # 扩展配置
        extension-configs:
          - data-id: user-service-ext.yaml
            group: DEFAULT_GROUP
            refresh: true
```

**配置类：**

```java
@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppConfig {
    private String name;
    private String version;
    private Database database = new Database();
    
    @Data
    public static class Database {
        private String url;
        private String username;
        private String password;
    }
}

@Component
public class ConfigChangeListener {
    
    @NacosConfigListener(dataId = "user-service.yaml", groupId = "DEFAULT_GROUP")
    public void onConfigChange(String newConfig) {
        System.out.println("配置发生变化: " + newConfig);
        // 处理配置变更
    }
}
```

#### 2. 动态配置更新

```java
@RestController
@RequestMapping("/config")
public class ConfigController {
    
    @Autowired
    private NacosConfigManager nacosConfigManager;
    
    @Autowired
    private AppConfig appConfig;
    
    @GetMapping("/current")
    public AppConfig getCurrentConfig() {
        return appConfig;
    }
    
    @PostMapping("/update")
    public String updateConfig(@RequestBody String config) throws NacosException {
        // 动态更新配置
        nacosConfigManager.getConfigService().publishConfig(
            "user-service.yaml", 
            "DEFAULT_GROUP", 
            config
        );
        return "配置更新成功";
    }
}
```

### 四、API 网关

#### 1. Spring Cloud Gateway

**网关配置：**

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
            - name: CircuitBreaker
              args:
                name: orderCircuitBreaker
                fallbackUri: forward:/fallback/order
```

**网关启动类：**

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

#### 2. 自定义过滤器

```java
@Component
public class AuthFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String token = request.getHeaders().getFirst("Authorization");
        
        if (token == null || !isValidToken(token)) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
        
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
    
    private boolean isValidToken(String token) {
        // 验证token逻辑
        return token.startsWith("Bearer ");
    }
}

@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String method = request.getMethod().name();
        
        logger.info("Gateway Request: {} {}", method, path);
        
        return chain.filter(exchange)
                .doFinally(signalType -> {
                    ServerHttpResponse response = exchange.getResponse();
                    logger.info("Gateway Response: {} {} - {}", 
                              method, path, response.getStatusCode());
                });
    }
    
    @Override
    public int getOrder() {
        return -200;
    }
}
```

### 五、熔断器与降级

#### 1. Resilience4j 熔断器

**依赖配置：**

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

**熔断器配置：**

```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        sliding-window-size: 10
        minimum-number-of-calls: 5
        failure-rate-threshold: 50
        wait-duration-in-open-state: 5s
        permitted-number-of-calls-in-half-open-state: 3
  retry:
    instances:
      userService:
        max-attempts: 3
        wait-duration: 1s
        retry-exceptions:
          - java.io.IOException
  ratelimiter:
    instances:
      userService:
        limit-for-period: 10
        limit-refresh-period: 1s
        timeout-duration: 1s
```

**使用熔断器：**

```java
@Service
public class UserService {
    
    @Autowired
    private CircuitBreakerFactory circuitBreakerFactory;
    
    @Autowired
    private RetryFactory retryFactory;
    
    @Autowired
    private RateLimiterFactory rateLimiterFactory;
    
    public User getUserById(Long id) {
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("userService");
        Retry retry = retryFactory.create("userService");
        RateLimiter rateLimiter = rateLimiterFactory.create("userService");
        
        return circuitBreaker.run(
            () -> retry.executeSupplier(
                () -> rateLimiter.executeSupplier(
                    () -> callExternalService(id)
                )
            ),
            throwable -> getFallbackUser(id)
        );
    }
    
    private User callExternalService(Long id) {
        // 调用外部服务
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private User getFallbackUser(Long id) {
        // 降级逻辑
        User fallbackUser = new User();
        fallbackUser.setId(id);
        fallbackUser.setName("Fallback User");
        return fallbackUser;
    }
}
```

#### 2. 注解方式使用

```java
@Service
public class UserService {
    
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    @Retry(name = "userService")
    @RateLimiter(name = "userService")
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User getUserFallback(Long id, Exception ex) {
        User fallbackUser = new User();
        fallbackUser.setId(id);
        fallbackUser.setName("Fallback User");
        return fallbackUser;
    }
}
```

### 六、消息队列

#### 1. RabbitMQ 集成

**RabbitMQ 配置：**

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    listener:
      simple:
        concurrency: 3
        max-concurrency: 10
        prefetch: 1
        default-requeue-rejected: false
```

**消息生产者：**

```java
@Component
public class UserEventPublisher {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void publishUserCreated(User user) {
        UserCreatedEvent event = new UserCreatedEvent(user);
        rabbitTemplate.convertAndSend("user.exchange", "user.created", event);
    }
    
    public void publishUserUpdated(User user) {
        UserUpdatedEvent event = new UserUpdatedEvent(user);
        rabbitTemplate.convertAndSend("user.exchange", "user.updated", event);
    }
}

@Service
public class UserService {
    
    @Autowired
    private UserEventPublisher eventPublisher;
    
    @Transactional
    public User createUser(User user) {
        User savedUser = userRepository.save(user);
        eventPublisher.publishUserCreated(savedUser);
        return savedUser;
    }
}
```

**消息消费者：**

```java
@Component
public class UserEventConsumer {
    
    @RabbitListener(queues = "user.created.queue")
    public void handleUserCreated(UserCreatedEvent event) {
        User user = event.getUser();
        System.out.println("User created: " + user.getName());
        // 处理用户创建事件
    }
    
    @RabbitListener(queues = "user.updated.queue")
    public void handleUserUpdated(UserUpdatedEvent event) {
        User user = event.getUser();
        System.out.println("User updated: " + user.getName());
        // 处理用户更新事件
    }
}

@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Queue userCreatedQueue() {
        return new Queue("user.created.queue", true);
    }
    
    @Bean
    public Queue userUpdatedQueue() {
        return new Queue("user.updated.queue", true);
    }
    
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange("user.exchange");
    }
    
    @Bean
    public Binding userCreatedBinding(Queue userCreatedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userCreatedQueue)
                .to(userExchange)
                .with("user.created");
    }
    
    @Bean
    public Binding userUpdatedBinding(Queue userUpdatedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userUpdatedQueue)
                .to(userExchange)
                .with("user.updated");
    }
}
```

#### 2. 消息确认机制

```java
@Component
public class MessageConfirmCallback implements RabbitTemplate.ConfirmCallback {
    
    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        if (ack) {
            System.out.println("消息发送成功: " + correlationData.getId());
        } else {
            System.out.println("消息发送失败: " + correlationData.getId() + ", 原因: " + cause);
        }
    }
}

@Component
public class MessageReturnCallback implements RabbitTemplate.ReturnsCallback {
    
    @Override
    public void returnedMessage(ReturnedMessage returned) {
        System.out.println("消息被退回: " + returned.getMessage());
    }
}

@Configuration
public class RabbitMQConfig {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @PostConstruct
    public void init() {
        rabbitTemplate.setConfirmCallback(new MessageConfirmCallback());
        rabbitTemplate.setReturnsCallback(new MessageReturnCallback());
    }
}
```

### 七、分布式事务

#### 1. Seata 分布式事务

**Seata 配置：**

```yaml
seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: my_test_tx_group
  service:
    vgroup-mapping:
      my_test_tx_group: default
    grouplist:
      default: 127.0.0.1:8091
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
```

**全局事务使用：**

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserService userService;
    
    @GlobalTransactional
    public void createOrder(Order order) {
        // 1. 创建订单
        orderRepository.save(order);
        
        // 2. 扣减用户积分
        userService.deductPoints(order.getUserId(), order.getPoints());
        
        // 3. 扣减库存
        inventoryService.reduceStock(order.getProductId(), order.getQuantity());
    }
}

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public void deductPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getPoints() < points) {
            throw new RuntimeException("Insufficient points");
        }
        
        user.setPoints(user.getPoints() - points);
        userRepository.save(user);
    }
}
```

### 八、链路追踪

::: warning Boot 3 请改用 Micrometer Tracing
`spring-cloud-starter-sleuth` **不支持 Spring Boot 3**。下方 Sleuth 配置仅适用于 Boot 2 遗留项目。  
Boot 3：`micrometer-tracing-bridge-brave` + Zipkin/OTel reporter。详见 [Sleuth详解](./Sleuth详解.md) 文首说明。
:::

#### 1. Sleuth + Zipkin（历史 · Boot 2）

**依赖配置：**

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
<dependency>
<groupId>io.zipkin.reporter2</groupId>
<artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

**配置：**

```yaml
spring:
  sleuth:
    sampler:
      probability: 1.0
    web:
      client:
        enabled: true
    messaging:
      rabbit:
        enabled: true

management:
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans
```

**自定义追踪：**

```java
@Component
public class CustomTracer {
    
    @Autowired
    private Tracer tracer;
    
    public void traceMethod(String methodName) {
        Span span = tracer.nextSpan().name(methodName);
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            // 执行业务逻辑
            doSomething();
        } finally {
            span.finish();
        }
    }
    
    private void doSomething() {
        // 业务逻辑
    }
}
```

### 九、监控与健康检查

#### 1. Spring Boot Actuator

**配置：**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
```

**自定义健康检查：**

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1000)) {
                return Health.up()
                        .withDetail("database", "Available")
                        .withDetail("timestamp", System.currentTimeMillis())
                        .build();
            } else {
                return Health.down()
                        .withDetail("database", "Unavailable")
                        .build();
            }
        } catch (SQLException e) {
            return Health.down()
                    .withDetail("database", "Error")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
```

#### 2. 自定义指标

```java
@Component
public class CustomMetrics {
    
    private final Counter userCreatedCounter;
    private final Timer userServiceTimer;
    private final Gauge userCountGauge;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.userCreatedCounter = Counter.builder("user.created")
                .description("Number of users created")
                .register(meterRegistry);
        
        this.userServiceTimer = Timer.builder("user.service.duration")
                .description("User service method duration")
                .register(meterRegistry);
        
        this.userCountGauge = Gauge.builder("user.count")
                .description("Total number of users")
                .register(meterRegistry, this, CustomMetrics::getUserCount);
    }
    
    public void incrementUserCreated() {
        userCreatedCounter.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
    
    public void stopTimer(Timer.Sample sample) {
        sample.stop(userServiceTimer);
    }
    
    private double getUserCount() {
        // 返回用户总数
        return 100.0;
    }
}
```

### 十、微服务最佳实践

#### 1. 服务拆分原则

```java
// 按业务领域拆分
@Service
public class UserService {
    // 用户相关业务
}

@Service
public class OrderService {
    // 订单相关业务
}

@Service
public class PaymentService {
    // 支付相关业务
}
```

#### 2. 数据一致性

```java
@Service
public class SagaService {
    
    @Transactional
    public void createOrderSaga(Order order) {
        try {
            // 1. 创建订单
            orderRepository.save(order);
            
            // 2. 扣减库存
            inventoryService.reduceStock(order.getProductId(), order.getQuantity());
            
            // 3. 扣减积分
            userService.deductPoints(order.getUserId(), order.getPoints());
            
        } catch (Exception e) {
            // 补偿逻辑
            compensateOrder(order);
            throw e;
        }
    }
    
    private void compensateOrder(Order order) {
        // 补偿逻辑
        orderRepository.delete(order);
    }
}
```

#### 3. 服务治理

```java
@Configuration
public class ServiceGovernanceConfig {
    
    @Bean
    public LoadBalancerClient loadBalancerClient() {
        return new RoundRobinLoadBalancerClient();
    }
    
    @Bean
    public CircuitBreaker circuitBreaker() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(5))
                .ringBufferSizeInHalfOpenState(3)
                .ringBufferSizeInClosedState(10)
                .build();
        
        return CircuitBreaker.of("default", config);
    }
}
```

---
