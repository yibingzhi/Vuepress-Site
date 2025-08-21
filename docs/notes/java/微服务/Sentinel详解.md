---
title: Sentinel详解
createTime: 2025/08/16 15:37:37
permalink: /微服务/h1er3uex/
---

## 什么是Sentinel

Sentinel是阿里巴巴开源的面向分布式服务架构的流量控制组件，以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。

### 主要特性

- **流量控制**：支持QPS、并发线程数等维度的流量控制
- **熔断降级**：支持慢调用比例、异常比例、异常数等熔断策略
- **系统保护**：支持系统负载、CPU使用率等系统级保护
- **实时监控**：提供实时的监控数据和控制台
- **规则配置**：支持动态规则配置和持久化
- **多种框架支持**：支持Spring Cloud、Dubbo等框架

## 核心概念

### 1. 资源（Resource）

- 需要保护的资源，可以是方法、接口、服务等
- 每个资源都有唯一的名称
- 资源是Sentinel进行流量控制的基本单位

### 2. 规则（Rule）

- 流量控制规则：控制资源的访问频率
- 熔断降级规则：在资源出现问题时进行降级
- 系统保护规则：保护系统整体稳定性

### 3. 指标（Metric）

- QPS：每秒请求数
- 响应时间：请求的响应时间
- 异常数：请求的异常数量
- 并发线程数：同时访问资源的线程数

## 快速开始

### 1. 添加依赖

```xml

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 2. 配置文件

```yaml
# application.yml
spring:
  application:
    name: user-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      datasource:
        ds:
          nacos:
            server-addr: localhost:8848
            dataId: sentinel-rules
            groupId: DEFAULT_GROUP
            rule-type: flow
      eager: true
      log:
        dir: logs/sentinel

# 暴露监控端点
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    sentinel:
      enabled: true
```

### 3. 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

### 4. 基本使用

```java
@RestController
@RequestMapping("/user")
public class UserController {
    
    @SentinelResource(value = "getUser", 
                     blockHandler = "blockHandlerForGetUser",
                     fallback = "fallbackForGetUser")
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        // 模拟业务逻辑
        if (id <= 0) {
            throw new IllegalArgumentException("Invalid user id");
        }
        return userService.getById(id);
    }
    
    // 限流/熔断处理
    public User blockHandlerForGetUser(Long id, BlockException ex) {
        log.warn("Blocked by Sentinel: {}", ex.getClass().getSimpleName());
        return new User(id, "Blocked User", "blocked@example.com");
    }
    
    // 异常处理
    public User fallbackForGetUser(Long id, Throwable e) {
        log.error("Fallback for getUser: {}", e.getMessage());
        return new User(id, "Fallback User", "fallback@example.com");
    }
}
```

## 流量控制

### 1. QPS限流

```java
@Service
public class UserService {
    
    @SentinelResource(value = "getUserById", 
                     blockHandler = "blockHandler")
    public User getUserById(Long id) {
        // 业务逻辑
        return userRepository.findById(id);
    }
    
    public User blockHandler(Long id, BlockException ex) {
        log.warn("QPS限流触发: {}", ex.getClass().getSimpleName());
        return new User(id, "Limited User", "limited@example.com");
    }
}
```

### 2. 并发线程数限流

```java
@Service
public class OrderService {
    
    @SentinelResource(value = "createOrder", 
                     blockHandler = "blockHandler",
                     fallback = "fallback")
    public Order createOrder(OrderRequest request) {
        // 模拟耗时操作
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return orderRepository.save(new Order(request));
    }
    
    public Order blockHandler(OrderRequest request, BlockException ex) {
        log.warn("并发线程数限流触发: {}", ex.getClass().getSimpleName());
        throw new RuntimeException("系统繁忙，请稍后重试");
    }
    
    public Order fallback(OrderRequest request, Throwable e) {
        log.error("创建订单异常: {}", e.getMessage());
        throw new RuntimeException("创建订单失败");
    }
}
```

### 3. 基于调用关系的限流

```java
@RestController
@RequestMapping("/api")
public class ApiController {
    
    @SentinelResource(value = "apiResource", 
                     blockHandler = "blockHandler")
    @GetMapping("/data")
    public String getData() {
        return "API Data";
    }
    
    public String blockHandler(BlockException ex) {
        return "API限流中，请稍后重试";
    }
    
    @SentinelResource(value = "apiResource", 
                     blockHandler = "blockHandler",
                     entryType = EntryType.OUT)
    @GetMapping("/external")
    public String callExternal() {
        // 调用外部服务
        return externalService.getData();
    }
}
```

## 熔断降级

### 1. 慢调用比例熔断

```java
@Service
public class DatabaseService {
    
    @SentinelResource(value = "queryDatabase", 
                     blockHandler = "blockHandler",
                     fallback = "fallback")
    public List<User> queryDatabase(String sql) {
        // 模拟数据库查询
        try {
            Thread.sleep(2000); // 模拟慢查询
            return userRepository.query(sql);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("查询被中断");
        }
    }
    
    public List<User> blockHandler(String sql, BlockException ex) {
        log.warn("慢调用熔断触发: {}", ex.getClass().getSimpleName());
        return Collections.emptyList();
    }
    
    public List<User> fallback(String sql, Throwable e) {
        log.error("数据库查询异常: {}", e.getMessage());
        return Collections.emptyList();
    }
}
```

### 2. 异常比例熔断

```java
@Service
public class ExternalApiService {
    
    @SentinelResource(value = "callExternalApi", 
                     blockHandler = "blockHandler",
                     fallback = "fallback")
    public String callExternalApi(String url) {
        // 模拟调用外部API
        if (Math.random() < 0.3) { // 30%概率抛出异常
            throw new RuntimeException("External API error");
        }
        return "External API Response";
    }
    
    public String blockHandler(String url, BlockException ex) {
        log.warn("异常比例熔断触发: {}", ex.getClass().getSimpleName());
        return "Service temporarily unavailable";
    }
    
    public String fallback(String url, Throwable e) {
        log.error("外部API调用异常: {}", e.getMessage());
        return "Fallback response";
    }
}
```

### 3. 异常数熔断

```java
@Service
public class PaymentService {
    
    @SentinelResource(value = "processPayment", 
                     blockHandler = "blockHandler",
                     fallback = "fallback")
    public PaymentResult processPayment(PaymentRequest request) {
        // 模拟支付处理
        if (Math.random() < 0.2) { // 20%概率抛出异常
            throw new RuntimeException("Payment processing error");
        }
        return new PaymentResult("SUCCESS", "Payment processed successfully");
    }
    
    public PaymentResult blockHandler(PaymentRequest request, BlockException ex) {
        log.warn("异常数熔断触发: {}", ex.getClass().getSimpleName());
        return new PaymentResult("BLOCKED", "Service temporarily unavailable");
    }
    
    public PaymentResult fallback(PaymentRequest request, Throwable e) {
        log.error("支付处理异常: {}", e.getMessage());
        return new PaymentResult("FAILED", "Payment processing failed");
    }
}
```

## 系统保护

### 1. 系统负载保护

```java
@RestController
@RequestMapping("/system")
public class SystemController {
    
    @SentinelResource(value = "systemResource", 
                     blockHandler = "blockHandler")
    @GetMapping("/status")
    public SystemStatus getSystemStatus() {
        // 获取系统状态
        return systemMonitor.getStatus();
    }
    
    public SystemStatus blockHandler(BlockException ex) {
        log.warn("系统负载保护触发: {}", ex.getClass().getSimpleName());
        return new SystemStatus("OVERLOAD", "System is overloaded");
    }
}
```

### 2. CPU使用率保护

```java
@Service
public class HeavyComputationService {
    
    @SentinelResource(value = "heavyComputation", 
                     blockHandler = "blockHandler")
    public ComputationResult compute(ComputationRequest request) {
        // 模拟重计算
        return performHeavyComputation(request);
    }
    
    public ComputationResult blockHandler(ComputationRequest request, BlockException ex) {
        log.warn("CPU使用率保护触发: {}", ex.getClass().getSimpleName());
        return new ComputationResult("BLOCKED", "System resources insufficient");
    }
}
```

## 规则配置

### 1. 流量控制规则

```java
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    public void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        // QPS限流规则
        FlowRule qpsRule = new FlowRule();
        qpsRule.setResource("getUser");
        qpsRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        qpsRule.setCount(10); // 每秒最多10个请求
        rules.add(qpsRule);
        
        // 并发线程数限流规则
        FlowRule threadRule = new FlowRule();
        threadRule.setResource("createOrder");
        threadRule.setGrade(RuleConstant.FLOW_GRADE_THREAD);
        threadRule.setCount(5); // 最多5个并发线程
        rules.add(threadRule);
        
        FlowRuleManager.loadRules(rules);
    }
}
```

### 2. 熔断降级规则

```java
@PostConstruct
public void initDegradeRules() {
    List<DegradeRule> rules = new ArrayList<>();
    
    // 慢调用比例熔断规则
    DegradeRule slowCallRule = new DegradeRule();
    slowCallRule.setResource("queryDatabase");
    slowCallRule.setGrade(RuleConstant.DEGRADE_GRADE_RT);
    slowCallRule.setCount(1000); // 响应时间阈值1000ms
    slowCallRule.setTimeWindow(10); // 熔断时间窗口10秒
    slowCallRule.setMinRequestAmount(5); // 最小请求数5
    slowCallRule.setSlowRatioThreshold(0.5); // 慢调用比例阈值50%
    rules.add(slowCallRule);
    
    // 异常比例熔断规则
    DegradeRule exceptionRule = new DegradeRule();
    exceptionRule.setResource("callExternalApi");
    exceptionRule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
    exceptionRule.setCount(0.3); // 异常比例阈值30%
    exceptionRule.setTimeWindow(10); // 熔断时间窗口10秒
    exceptionRule.setMinRequestAmount(10); // 最小请求数10
    rules.add(exceptionRule);
    
    DegradeRuleManager.loadRules(rules);
}
```

### 3. 系统保护规则

```java
@PostConstruct
public void initSystemRules() {
    List<SystemRule> rules = new ArrayList<>();
    
    // 系统负载保护规则
    SystemRule loadRule = new SystemRule();
    loadRule.setHighestSystemLoad(0.8); // 系统负载阈值0.8
    loadRule.setAvgRt(1000); // 平均响应时间阈值1000ms
    loadRule.setMaxThread(100); // 最大并发线程数100
    loadRule.setQps(1000); // 系统QPS阈值1000
    rules.add(loadRule);
    
    SystemRuleManager.loadRules(rules);
}
```

## SpringBoot集成

### 1. 完整配置示例

```yaml
# application.yml
spring:
  application:
    name: user-service
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            dataId: sentinel-flow-rules
            groupId: DEFAULT_GROUP
            rule-type: flow
        ds2:
          nacos:
            server-addr: localhost:8848
            dataId: sentinel-degrade-rules
            groupId: DEFAULT_GROUP
            rule-type: degrade
        ds3:
          nacos:
            server-addr: localhost:8848
            dataId: sentinel-system-rules
            groupId: DEFAULT_GROUP
            rule-type: system
      eager: true
      log:
        dir: logs/sentinel

management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    sentinel:
      enabled: true
```

### 2. 服务层使用

```java
@Service
@Slf4j
public class UserService {
    
    @SentinelResource(value = "getUserById", 
                     blockHandler = "blockHandler",
                     fallback = "fallback",
                     exceptionsToTrace = {IllegalArgumentException.class})
    public User getUserById(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("Invalid user id: " + id);
        }
        
        // 模拟业务逻辑
        try {
            Thread.sleep(100); // 模拟数据库查询
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Query interrupted");
        }
    }
    
    // 限流/熔断处理
    public User blockHandler(Long id, BlockException ex) {
        log.warn("Blocked by Sentinel: resource={}, exception={}", 
                "getUserById", ex.getClass().getSimpleName());
        
        // 返回默认值或抛出异常
        return new User(id, "Blocked User", "blocked@example.com");
    }
    
    // 异常处理
    public User fallback(Long id, Throwable e) {
        log.error("Fallback for getUserById: id={}, error={}", id, e.getMessage());
        
        // 返回默认值或抛出异常
        return new User(id, "Fallback User", "fallback@example.com");
    }
    
    @SentinelResource(value = "createUser", 
                     blockHandler = "blockHandlerForCreate",
                     fallback = "fallbackForCreate")
    public User createUser(UserCreateRequest request) {
        // 创建用户逻辑
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setCreateTime(new Date());
        
        return userRepository.save(user);
    }
    
    public User blockHandlerForCreate(UserCreateRequest request, BlockException ex) {
        log.warn("Create user blocked: {}", ex.getClass().getSimpleName());
        throw new RuntimeException("Service temporarily unavailable");
    }
    
    public User fallbackForCreate(UserCreateRequest request, Throwable e) {
        log.error("Create user failed: {}", e.getMessage());
        throw new RuntimeException("Failed to create user");
    }
}
```

### 3. 控制器层使用

```java
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @SentinelResource(value = "getUser", 
                     blockHandler = "blockHandler",
                     fallback = "fallback")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to get user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    public ResponseEntity<User> blockHandler(Long id, BlockException ex) {
        log.warn("Get user blocked: id={}, exception={}", id, ex.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new User(id, "Blocked User", "blocked@example.com"));
    }
    
    public ResponseEntity<User> fallback(Long id, Throwable e) {
        log.error("Get user fallback: id={}, error={}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new User(id, "Fallback User", "fallback@example.com"));
    }
    
    @SentinelResource(value = "createUser", 
                     blockHandler = "blockHandlerForCreate",
                     fallback = "fallbackForCreate")
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserCreateRequest request) {
        try {
            User user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    public ResponseEntity<User> blockHandlerForCreate(UserCreateRequest request, BlockException ex) {
        log.warn("Create user blocked: {}", ex.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
    }
    
    public ResponseEntity<User> fallbackForCreate(UserCreateRequest request, Throwable e) {
        log.error("Create user fallback: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

## 最佳实践

### 1. 资源命名规范

```java
// 使用有意义的资源名称
@SentinelResource(value = "user:get:by:id", 
                 blockHandler = "blockHandler")
public User getUserById(Long id) {
    // 业务逻辑
}

// 使用分层命名
@SentinelResource(value = "api:user:create", 
                 blockHandler = "blockHandler")
public User createUser(UserCreateRequest request) {
    // 业务逻辑
}
```

### 2. 异常处理策略

```java
// 区分不同类型的异常
@SentinelResource(value = "getUser", 
                 blockHandler = "blockHandler",
                 fallback = "fallback",
                 exceptionsToTrace = {IllegalArgumentException.class})
public User getUser(Long id) {
    if (id <= 0) {
        throw new IllegalArgumentException("Invalid user id");
    }
    // 业务逻辑
}

// 提供有意义的降级响应
public User blockHandler(Long id, BlockException ex) {
    // 记录限流/熔断事件
    log.warn("Resource blocked: {}", ex.getClass().getSimpleName());
    
    // 返回默认值或抛出业务异常
    return new User(id, "Default User", "default@example.com");
}
```

### 3. 监控和告警

```java
@Component
public class SentinelMetrics {
    
    private final Counter blockedCounter;
    private final Timer responseTimer;
    
    public SentinelMetrics(MeterRegistry meterRegistry) {
        this.blockedCounter = Counter.builder("sentinel.blocked.total")
                .description("Total number of blocked requests")
                .register(meterRegistry);
        
        this.responseTimer = Timer.builder("sentinel.response.duration")
                .description("Response duration")
                .register(meterRegistry);
    }
    
    public void incrementBlockedCount() {
        blockedCounter.increment();
    }
    
    public Timer.Sample startResponseTimer() {
        return Timer.start();
    }
}

// 在blockHandler中记录指标
public User blockHandler(Long id, BlockException ex) {
    sentinelMetrics.incrementBlockedCount();
    // 其他处理逻辑
}
```

### 4. 规则动态配置

```java
@Component
public class DynamicRuleManager {
    
    @EventListener
    public void onRuleChange(RuleChangeEvent event) {
        log.info("Rules changed: {}", event.getSource());
        
        // 重新加载规则
        reloadRules();
    }
    
    private void reloadRules() {
        // 从配置中心重新加载规则
        // 或者从数据库重新加载规则
    }
}
```

## 常见问题

### 1. 规则不生效

```java
// 问题：配置的规则不生效
// 解决方案：检查资源名称和规则配置

// 确保资源名称一致
@SentinelResource(value = "getUser") // 资源名称
public User getUser(Long id) {
    // 业务逻辑
}

// 规则配置中的资源名称必须一致
FlowRule rule = new FlowRule();
rule.setResource("getUser"); // 与注解中的value一致
```

### 2. 降级处理不执行

```java
// 问题：fallback方法不执行
// 解决方案：检查异常类型和方法签名

@SentinelResource(value = "getUser", 
                 fallback = "fallback")
public User getUser(Long id) {
    // 抛出异常
    throw new RuntimeException("User not found");
}

// fallback方法签名必须正确
public User fallback(Long id, Throwable e) {
    // 异常处理逻辑
    return new User(id, "Fallback User", "fallback@example.com");
}
```

### 3. 性能问题

```yaml
# 问题：Sentinel影响性能
# 解决方案：优化配置

spring:
  cloud:
    sentinel:
      eager: false  # 延迟初始化
      transport:
        heartbeat-interval-ms: 5000  # 心跳间隔
      log:
        dir: logs/sentinel  # 日志目录
```
