---
title: SpringCloud Gateway详解
createTime: 2025/08/16 14:24:17
permalink: /微服务/xmoqaqya/
---

::: tip 保鲜说明（2026-08）
Gateway 仍是官方推荐网关。新项目用 **Spring Boot 3 + 对应 Spring Cloud**；服务发现优先 **Nacos**。文中 “Boot 2.0 / Eureka” 为历史表述。
:::

## 什么是SpringCloud Gateway

SpringCloud Gateway是Spring Cloud官方推出的第二代网关框架，基于 **Spring WebFlux（响应式）** 与当前 Spring Boot / Spring Cloud 发行版构建（早期文档常写 Boot 2.0）。它旨在为微服务架构提供一种简单而有效的统一API路由管理方式。

### 主要特性

- **基于 Spring WebFlux**：响应式编程，支持异步非阻塞（Boot 3 同样适用）
- **动态路由**：支持动态配置路由规则
- **过滤器链**：支持请求和响应的修改
- **集成 Spring Cloud 生态**：与 Nacos、Consul、Eureka 等注册中心集成
- **限流熔断**：可结合 Sentinel / Resilience4j 等
- **安全认证**：支持 OAuth2、JWT 等认证方式

## 核心概念

### 1. 路由（Route）

路由是网关的基本构建块，由ID、目标URI、断言集合和过滤器集合组成。

### 2. 断言（Predicate）

Java 8的Predicate，用于匹配HTTP请求的任何内容。

### 3. 过滤器（Filter）

GatewayFilter的实例，可以在请求被路由前或后修改请求和响应。

### 4. 网关（Gateway）

网关是路由、断言和过滤器的组合。

## 快速开始

### 1. 添加依赖

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.cloud</groupId>
<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

### 2. 配置文件

```yaml
server:
  port: 8080

spring:
  application:
    name: gateway-service
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
            - Path=/user/**
          filters:
            - StripPrefix=1
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/order/**
          filters:
            - StripPrefix=1

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### 3. 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

## 路由配置

### 1. 基于配置文件的路由

```yaml
spring:
  cloud:
    gateway:
      routes:
        # 简单路由
        - id: simple-route
          uri: http://localhost:8081
          predicates:
            - Path=/simple/**

        # 带过滤器的路由
        - id: filter-route
          uri: lb://service-name
          predicates:
            - Path=/filter/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20

        # 带权重的路由
        - id: weight-high
          uri: lb://service-name
          predicates:
            - Path=/weight/**
            - Weight=group1, 8
        - id: weight-low
          uri: lb://service-name
          predicates:
            - Path=/weight/**
            - Weight=group1, 2
```

### 2. 基于Java代码的路由

```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("custom-route", r -> r
                        .path("/custom/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .addRequestHeader("X-Custom-Header", "CustomValue")
                                .addResponseHeader("X-Response-Header", "ResponseValue"))
                        .uri("lb://custom-service"))
                .route("time-route", r -> r
                        .path("/time/**")
                        .and()
                        .between(LocalTime.of(9, 0), LocalTime.of(17, 0))
                        .uri("lb://time-service"))
                .build();
    }
}
```

### 3. 动态路由

```java
@Component
public class DynamicRouteService {
    
    @Autowired
    private RouteDefinitionWriter routeDefinitionWriter;
    
    @Autowired
    private ApplicationEventPublisher publisher;
    
    public void addRoute(RouteDefinition routeDefinition) {
        routeDefinitionWriter.save(Mono.just(routeDefinition)).subscribe();
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
    
    public void deleteRoute(String routeId) {
        routeDefinitionWriter.delete(Mono.just(routeId)).subscribe();
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
```

## 断言详解

### 1. 时间断言

```yaml
predicates:
  # 在指定时间之后
  - After=2023-01-01T00:00:00+08:00[Asia/Shanghai]
  # 在指定时间之前
  - Before=2023-12-31T23:59:59+08:00[Asia/Shanghai]
  # 在指定时间范围内
  - Between=2023-01-01T00:00:00+08:00[Asia/Shanghai], 2023-12-31T23:59:59+08:00[Asia/Shanghai]
```

### 2. 请求方法断言

```yaml
predicates:
  # 匹配GET请求
  - Method=GET
  # 匹配POST请求
  - Method=POST
  # 匹配多种请求方法
  - Method=GET,POST
```

### 3. 请求头断言

```yaml
predicates:
  # 请求头必须包含指定值
  - Header=X-Request-Id, \d+
  # 请求头必须存在
  - Header=X-Request-Id
```

### 4. 查询参数断言

```yaml
predicates:
  # 查询参数必须存在
  - Query=name
  # 查询参数必须等于指定值
  - Query=name, zhangsan
  # 查询参数必须匹配正则表达式
  - Query=name, \w+
```

### 5. 路径断言

```yaml
predicates:
  # 路径必须以指定模式开头
  - Path=/api/**
  # 路径必须匹配正则表达式
  - Path=/api/{segment}
```

### 6. 自定义断言

```java
@Component
public class CustomPredicateFactory extends AbstractRoutePredicateFactory<CustomPredicateFactory.Config> {
    
    public CustomPredicateFactory() {
        super(Config.class);
    }
    
    @Override
    public Predicate<ServerWebExchange> apply(Config config) {
        return exchange -> {
            String token = exchange.getRequest().getHeaders().getFirst("Authorization");
            return token != null && token.startsWith("Bearer ");
        };
    }
    
    @Data
    public static class Config {
        private String name;
    }
}
```

## 过滤器详解

### 1. 全局过滤器

```java
@Component
public class GlobalFilter implements org.springframework.cloud.gateway.filter.GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        
        // 记录请求日志
        log.info("请求路径: {}", path);
        
        // 添加请求头
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-Gateway-Time", String.valueOf(System.currentTimeMillis()))
                .build();
        
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }
    
    @Override
    public int getOrder() {
        return -100; // 数字越小优先级越高
    }
}
```

### 2. 局部过滤器

```java
@Component
public class CustomFilter extends AbstractGatewayFilterFactory<CustomFilter.Config> {
    
    public CustomFilter() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // 修改请求
            if (config.isModifyRequest()) {
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-Custom-Header", config.getHeaderValue())
                        .build();
                exchange = exchange.mutate().request(modifiedRequest).build();
            }
            
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                
                // 修改响应
                if (config.isModifyResponse()) {
                    response.getHeaders().add("X-Custom-Response-Header", config.getResponseHeaderValue());
                }
            }));
        };
    }
    
    @Data
    public static class Config {
        private boolean modifyRequest = false;
        private String headerValue = "default";
        private boolean modifyResponse = false;
        private String responseHeaderValue = "default";
    }
}
```

### 3. 内置过滤器

```yaml
filters:
  # 添加请求头
  - AddRequestHeader=X-Request-Id, ${random.uuid}

  # 添加响应头
  - AddResponseHeader=X-Response-Id, ${random.uuid}

  # 移除请求头
  - RemoveRequestHeader=X-Secret-Header

  # 设置请求头
  - SetRequestHeader=X-User-Id, ${user.id}

  # 重写路径
  - RewritePath=/api/(?<segment>.*), /${segment}

  # 重定向
  - RedirectTo=302, https://example.com

  # 设置状态码
  - SetStatus=401

  # 设置响应体
  - SetResponseBody={"code":
      401, "message": "Unauthorized" }
```

## 限流熔断

### 1. 基于Redis的限流

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: rate-limit-route
          uri: lb://service-name
          predicates:
            - Path=/api/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"
```

```java
@Configuration
public class RateLimiterConfig {
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
                exchange.getRequest().getHeaders().getFirst("X-User-Id") != null ?
                        exchange.getRequest().getHeaders().getFirst("X-User-Id") :
                        exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
        );
    }
}
```

### 2. 基于Sentinel的限流

```xml

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel-gateway</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
      datasource:
        ds:
          nacos:
            server-addr: localhost:8848
            dataId: gateway-sentinel
            groupId: DEFAULT_GROUP
            rule-type: gw-flow
```

### 3. 熔断配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: circuit-breaker-route
          uri: lb://service-name
          predicates:
            - Path=/api/**
          filters:
            - name: CircuitBreaker
              args:
                name: myCircuitBreaker
                fallbackUri: forward:/fallback
```

```java
@RestController
public class FallbackController {
    
    @GetMapping("/fallback")
    public Mono<String> fallback() {
        return Mono.just("服务暂时不可用，请稍后重试");
    }
}
```

## 安全配置

### 1. JWT认证

```java
@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String token = request.getHeaders().getFirst("Authorization");
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    Claims claims = jwtUtil.validateToken(token);
                    String userId = claims.getSubject();
                    
                    // 将用户信息添加到请求头
                    ServerHttpRequest modifiedRequest = request.mutate()
                            .header("X-User-Id", userId)
                            .build();
                    
                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                } catch (Exception e) {
                    return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
                }
            }
            
            return onError(exchange, "No token", HttpStatus.UNAUTHORIZED);
        };
    }
    
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
    
    @Data
    public static class Config {
        private String name;
    }
}
```

### 2. CORS配置

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsWebFilter(source);
    }
}
```

## 监控和日志

### 1. 集成Actuator

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    gateway:
      enabled: true
```

### 2. 自定义监控指标

```java
@Component
public class GatewayMetrics {
    
    private final Counter requestCounter;
    private final Timer requestTimer;
    
    public GatewayMetrics(MeterRegistry meterRegistry) {
        this.requestCounter = Counter.builder("gateway.requests.total")
                .description("Total number of gateway requests")
                .register(meterRegistry);
        
        this.requestTimer = Timer.builder("gateway.request.duration")
                .description("Gateway request duration")
                .register(meterRegistry);
    }
    
    public void incrementRequestCount() {
        requestCounter.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
}
```

### 3. 日志配置

```yaml
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    org.springframework.http.server.reactive: DEBUG
    org.springframework.web.reactive: DEBUG
    reactor.netty: DEBUG
    io.netty: DEBUG
```

## 最佳实践

### 1. 路由配置最佳实践

```yaml
spring:
  cloud:
    gateway:
      # 启用服务发现
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true

      # 全局过滤器配置
      default-filters:
        - AddRequestHeader=X-Gateway-Time, ${timestamp}
        - AddResponseHeader=X-Gateway-Version, 1.0.0

      # 全局超时配置
      httpclient:
        connect-timeout: 1000
        response-timeout: 5s

      # 全局CORS配置
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
```

### 2. 性能优化

```java
@Configuration
public class GatewayPerformanceConfig {
    
    @Bean
    public NettyWriteBufferWaterMark nettyWriteBufferWaterMark() {
        return new NettyWriteBufferWaterMark(32 * 1024, 64 * 1024);
    }
    
    @Bean
    public ConnectionProvider connectionProvider() {
        return ConnectionProvider.builder("gateway-connection-pool")
                .maxConnections(500)
                .maxIdleTime(Duration.ofSeconds(20))
                .maxLifeTime(Duration.ofSeconds(60))
                .pendingAcquireTimeout(Duration.ofSeconds(60))
                .evictInBackground(Duration.ofSeconds(120))
                .build();
    }
}
```

### 3. 错误处理

```java
@ControllerAdvice
public class GatewayExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ErrorResponse>> handleException(Exception ex) {
        ErrorResponse error = new ErrorResponse();
        error.setCode("GATEWAY_ERROR");
        error.setMessage(ex.getMessage());
        error.setTimestamp(System.currentTimeMillis());
        
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error));
    }
    
    @Data
    public static class ErrorResponse {
        private String code;
        private String message;
        private long timestamp;
    }
}
```

## 常见问题

### 1. 路由不生效

- 检查路由配置是否正确
- 确认服务是否已注册到注册中心
- 检查断言条件是否匹配

### 2. 过滤器不执行

- 检查过滤器配置是否正确
- 确认过滤器的执行顺序
- 检查过滤器是否被正确注册

### 3. 限流不生效

- 检查Redis连接是否正常
- 确认限流配置是否正确
- 检查key-resolver是否配置

### 4. 性能问题

- 调整连接池大小
- 优化过滤器链
- 使用异步处理
