---
title: SpringCloud Sleuth详解
createTime: 2025/08/16 16:26:22
permalink: /微服务/bw20j0gp/
---

::: danger 保鲜说明（2026-08）· 历史文档
**Spring Cloud Sleuth 不支持 Spring Boot 3**。Boot 3 请改用 **Micrometer Tracing**（+ Zipkin / OpenTelemetry）。  
本文保留 Boot 2 时代 Sleuth 写法，仅供迁移对照，**不要照抄到 Boot 3 工程**。

Boot 3 最小依赖示意：

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

详见 [Micrometer Tracing](https://docs.micrometer.io/tracing/reference/)。
:::

## 什么是SpringCloud Sleuth

SpringCloud Sleuth是Spring Cloud的分布式链路追踪解决方案，它可以帮助开发者追踪微服务架构中的请求调用链路，提供完整的调用链监控和性能分析。

### 主要特性

- **分布式追踪**：追踪请求在微服务间的传播路径
- **性能监控**：监控每个调用的耗时和性能指标
- **日志聚合**：聚合分布式系统的日志信息
- **可视化展示**：通过Zipkin等工具可视化展示调用链
- **采样控制**：支持请求采样，控制追踪数据量
- **多框架支持**：支持Spring Cloud、Dubbo等框架

## 核心概念

### 1. Trace（追踪）

- 一个完整的请求调用链路
- 包含多个Span，形成树形结构
- 每个Trace有唯一的TraceId

### 2. Span（跨度）

- 调用链路中的一个节点
- 包含调用的开始时间、结束时间、标签等信息
- 可以有父子关系，形成调用树

### 3. Tag（标签）

- 为Span添加的键值对信息
- 用于记录业务相关的元数据
- 便于查询和过滤

### 4. Baggage（行李）

- 在调用链中传递的上下文信息
- 可以跨服务传递业务数据
- 影响所有子Span

## 快速开始

### 1. 添加依赖

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.cloud</groupId>
<artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### 2. 配置文件

```yaml
# application.yml
spring:
  application:
    name: user-service
  sleuth:
    sampler:
      probability: 1.0  # 采样率，1.0表示100%采样
    web:
      client:
        enabled: true
    messaging:
      enabled: true
    r2dbc:
      enabled: true
    redis:
      enabled: true
    jdbc:
      enabled: true
    jms:
      enabled: true
    kafka:
      enabled: true
    rabbit:
      enabled: true
    feign:
      enabled: true
    zuul:
      enabled: true
    gateway:
      enabled: true

logging:
  level:
    org.springframework.cloud.sleuth: DEBUG
    org.springframework.web: DEBUG
```

### 3. 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
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
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderServiceClient orderServiceClient;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        log.info("获取用户信息: userId={}", id);
        
        // 获取用户基本信息
        User user = userService.getUserById(id);
        
        // 调用订单服务获取用户订单
        List<Order> orders = orderServiceClient.getUserOrders(id);
        user.setOrders(orders);
        
        log.info("用户信息获取完成: userId={}, orderCount={}", id, orders.size());
        
        return ResponseEntity.ok(user);
    }
}
```

## 链路追踪

### 1. 手动创建Span

```java
@Service
@Slf4j
public class UserService {
    
    @Autowired
    private Tracer tracer;
    
    public User getUserById(Long id) {
        // 创建自定义Span
        Span span = tracer.nextSpan().name("getUserById");
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("user.id", id.toString());
            span.tag("operation", "getUserById");
            
            log.info("开始查询用户: userId={}", id);
            
            // 模拟数据库查询
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            span.tag("user.found", "true");
            span.tag("user.name", user.getUsername());
            
            log.info("用户查询完成: userId={}, username={}", id, user.getUsername());
            
            return user;
            
        } catch (Exception e) {
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            log.error("查询用户失败: userId={}", id, e);
            throw e;
        } finally {
            span.finish();
        }
    }
    
    public List<User> searchUsers(String keyword) {
        Span span = tracer.nextSpan().name("searchUsers");
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("search.keyword", keyword);
            span.tag("operation", "searchUsers");
            
            log.info("开始搜索用户: keyword={}", keyword);
            
            List<User> users = userRepository.findByUsernameContaining(keyword);
            
            span.tag("search.result.count", String.valueOf(users.size()));
            
            log.info("用户搜索完成: keyword={}, resultCount={}", keyword, users.size());
            
            return users;
            
        } catch (Exception e) {
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            log.error("搜索用户失败: keyword={}", keyword, e);
            throw e;
        } finally {
            span.finish();
        }
    }
}
```

### 2. 异步追踪

```java
@Service
@Slf4j
public class AsyncUserService {
    
    @Autowired
    private Tracer tracer;
    
    @Async
    public CompletableFuture<User> getUserAsync(Long id) {
        Span span = tracer.nextSpan().name("getUserAsync");
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("user.id", id.toString());
            span.tag("operation", "getUserAsync");
            span.tag("async", "true");
            
            log.info("异步查询用户: userId={}", id);
            
            // 模拟异步查询
            Thread.sleep(1000);
            
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            span.tag("user.found", "true");
            
            log.info("异步用户查询完成: userId={}", id);
            
            return CompletableFuture.completedFuture(user);
            
        } catch (Exception e) {
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            log.error("异步查询用户失败: userId={}", id, e);
            throw new RuntimeException(e);
        } finally {
            span.finish();
        }
    }
}

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}
```

### 3. 消息追踪

```java
@Component
@Slf4j
public class UserMessageListener {
    
    @Autowired
    private Tracer tracer;
    
    @RabbitListener(queues = "user.created")
    public void handleUserCreated(UserCreatedEvent event) {
        Span span = tracer.nextSpan().name("handleUserCreated");
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("event.type", "UserCreated");
            span.tag("user.id", event.getUserId());
            span.tag("operation", "handleUserCreated");
            
            log.info("处理用户创建事件: userId={}", event.getUserId());
            
            // 处理用户创建事件
            processUserCreatedEvent(event);
            
            span.tag("event.processed", "true");
            
            log.info("用户创建事件处理完成: userId={}", event.getUserId());
            
        } catch (Exception e) {
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            log.error("处理用户创建事件失败: userId={}", event.getUserId(), e);
            throw e;
        } finally {
            span.finish();
        }
    }
    
    private void processUserCreatedEvent(UserCreatedEvent event) {
        // 事件处理逻辑
        log.info("处理用户创建事件: {}", event);
    }
}
```

## Zipkin集成

### 1. 添加Zipkin依赖

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

### 2. 配置Zipkin

```yaml
# application.yml
spring:
  zipkin:
    base-url: http://localhost:9411
    sender:
      type: web
    service:
      name: user-service
    compression:
      enabled: true
    message-timeout: 5000
    check-timeout: 1000
    flush-interval: 1
    initial-sleep: 100
    max-backlog: 1000
    max-in-flight: 1000
    max-retries: 3
    timeout: 10000
```

### 3. 启动Zipkin服务

```bash
# 使用Docker启动Zipkin
docker run -d -p 9411:9411 openzipkin/zipkin

# 或者使用Java启动
curl -sSL https://zipkin.io/quickstart.sh | bash -s
java -jar zipkin.jar
```

### 4. 访问Zipkin界面

- URL: http://localhost:9411
- 可以查看调用链、依赖关系、性能指标等

## 日志聚合

### 1. 配置日志格式

```yaml
# application.yml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId:-},%X{spanId:-}] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId:-},%X{spanId:-}] %-5level %logger{36} - %msg%n"
  level:
    org.springframework.cloud.sleuth: DEBUG
    org.springframework.web: DEBUG
    com.example.userservice: DEBUG
```

### 2. 日志MDC集成

```java
@Component
@Slf4j
public class LoggingService {
    
    @Autowired
    private Tracer tracer;
    
    public void logWithTrace(String message) {
        Span currentSpan = tracer.currentSpan();
        if (currentSpan != null) {
            MDC.put("traceId", currentSpan.context().traceId());
            MDC.put("spanId", currentSpan.context().spanId());
        }
        
        log.info("带追踪信息的日志: {}", message);
        
        // 清理MDC
        MDC.clear();
    }
    
    public void logUserOperation(String operation, Long userId) {
        Span span = tracer.currentSpan();
        if (span != null) {
            span.tag("operation", operation);
            span.tag("user.id", userId.toString());
        }
        
        log.info("用户操作: operation={}, userId={}", operation, userId);
    }
}
```

### 3. 日志聚合配置

```yaml
# 使用ELK Stack聚合日志
spring:
  sleuth:
    log:
      slf4j:
        enabled: true
        whitelisted-mdc-keys: traceId,spanId,userId,operation
```

## 最佳实践

### 1. 采样策略配置

```yaml
# 生产环境采样策略
spring:
  sleuth:
    sampler:
      probability: 0.1  # 10%采样率，减少存储压力
    web:
      client:
        enabled: true
    messaging:
      enabled: true
    feign:
      enabled: true
    gateway:
      enabled: true
```

### 2. 自定义追踪器

```java
@Component
public class CustomTracer {
    
    @Autowired
    private Tracer tracer;
    
    public <T> T trace(String operationName, Supplier<T> operation) {
        Span span = tracer.nextSpan().name(operationName);
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("operation", operationName);
            span.tag("start.time", String.valueOf(System.currentTimeMillis()));
            
            T result = operation.get();
            
            span.tag("success", "true");
            span.tag("end.time", String.valueOf(System.currentTimeMillis()));
            
            return result;
            
        } catch (Exception e) {
            span.tag("success", "false");
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            throw e;
        } finally {
            span.finish();
        }
    }
    
    public void trace(String operationName, Runnable operation) {
        trace(operationName, () -> {
            operation.run();
            return null;
        });
    }
}

// 使用自定义追踪器
@Service
public class UserService {
    
    @Autowired
    private CustomTracer customTracer;
    
    public User getUserById(Long id) {
        return customTracer.trace("getUserById", () -> {
            // 业务逻辑
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        });
    }
}
```

### 3. 性能监控

```java
@Component
public class PerformanceMonitor {
    
    @Autowired
    private Tracer tracer;
    
    public <T> T monitorPerformance(String operationName, Supplier<T> operation) {
        long startTime = System.currentTimeMillis();
        Span span = tracer.nextSpan().name(operationName);
        
        try (SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("operation", operationName);
            span.tag("start.time", String.valueOf(startTime));
            
            T result = operation.get();
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            span.tag("duration.ms", String.valueOf(duration));
            span.tag("success", "true");
            
            // 记录性能指标
            if (duration > 1000) {
                log.warn("操作耗时较长: operation={}, duration={}ms", operationName, duration);
            }
            
            return result;
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            span.tag("duration.ms", String.valueOf(duration));
            span.tag("success", "false");
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            
            throw e;
        } finally {
            span.finish();
        }
    }
}
```

### 4. 错误追踪

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @Autowired
    private Tracer tracer;
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {
        Span span = tracer.currentSpan();
        if (span != null) {
            span.tag("error", "true");
            span.tag("error.type", ex.getClass().getSimpleName());
            span.tag("error.message", ex.getMessage());
            span.tag("request.url", request.getRequestURL().toString());
            span.tag("request.method", request.getMethod());
        }
        
        log.error("全局异常处理: {}", ex.getMessage(), ex);
        
        ErrorResponse error = new ErrorResponse();
        error.setCode("INTERNAL_ERROR");
        error.setMessage(ex.getMessage());
        error.setTimestamp(System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

## 常见问题

### 1. 追踪信息丢失

```yaml
# 问题：异步调用中追踪信息丢失
# 解决方案：确保异步配置正确

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

@Override
public Executor getAsyncExecutor() {
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.setCorePoolSize(5);
executor.setMaxPoolSize(10);
executor.setQueueCapacity(25);
executor.setThreadNamePrefix("Async-");
executor.initialize();
return executor;
}
}
```

### 2. 采样率过高

```yaml
# 问题：生产环境采样率过高影响性能
# 解决方案：调整采样率

spring:
  sleuth:
    sampler:
      probability: 0.1  # 生产环境使用10%采样率
```

### 3. Zipkin连接失败

```yaml
# 问题：无法连接到Zipkin
# 解决方案：检查网络和配置

spring:
  zipkin:
    base-url: http://zipkin-server:9411  # 确保地址正确
    sender:
      type: web
    timeout: 10000  # 增加超时时间
```
