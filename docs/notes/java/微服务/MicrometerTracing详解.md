---
title: Micrometer Tracing 详解
tags:
  - Java
  - Spring Boot 3
  - 微服务
  - 链路追踪
  - Micrometer
  - Zipkin
createTime: 2026/08/29 15:00:00
permalink: /微服务/micrometer-tracing/
---

::: tip 保鲜说明（2026-08）
Spring Boot **3.x** 已移除 Spring Cloud Sleuth，官方链路追踪方案为 **Micrometer Tracing** + Brave 或 OpenTelemetry。本文基于 Boot **3.4.x**、Micrometer Tracing **1.4.x** 编写；若你仍在 Boot 2，请继续用 Sleuth 或先完成框架升级。
:::

## 1. 为什么 Sleuth 消失了？

| 变化 | 说明 |
|------|------|
| Spring Boot 3 | 基线 Jakarta EE 9+，Sleuth 3.x 未跟进 |
| Micrometer 统一 | 指标（Metrics）与追踪（Tracing）归入 Micrometer 生态 |
| OpenTelemetry 主流 | 云原生可观测性事实标准，Brave 仍广泛用于 Zipkin |

Spring Cloud **2022.0（Kilburn）** 起官方文档推荐 Micrometer Tracing。旧项目迁移时，TraceId/SpanId 的日志格式可能变化，需同步调整日志采集规则。

---

## 2. 核心概念回顾

- **Trace**：一次完整请求链路，共享 `traceId`。
- **Span**：链路中的单个操作（HTTP 调用、DB 查询、MQ 消费）。
- **Propagation**：跨进程传递上下文（W3C `traceparent` 或 B3 头）。
- **Baggage**：随链路传播的键值对（用户 ID、租户 ID），需控制体积。

---

## 3. 方案选型：Brave vs OpenTelemetry

| 维度 | Brave + Zipkin | OpenTelemetry（OTel） |
|------|----------------|----------------------|
| 导出目标 | Zipkin 为主 | OTLP → Jaeger/Tempo/Zipkin 等 |
| Spring 集成 | `micrometer-tracing-bridge-brave` | `micrometer-tracing-bridge-otel` |
| 生态 | 成熟、资料多 | 多云/多语言统一 |
| 推荐场景 | 已有 Zipkin、团队熟悉 | 新平台、K8s + Grafana Stack |

下文以 **Brave + Zipkin** 为例（最常见），OTel 仅替换 bridge 与 exporter 依赖即可。

---

## 4. Maven 依赖

```xml
<properties>
    <spring-boot.version>3.4.5</spring-boot.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Brave 桥接 -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-brave</artifactId>
    </dependency>

    <!-- 上报 Zipkin -->
    <dependency>
        <groupId>io.zipkin.reporter2</groupId>
        <artifactId>zipkin-reporter-brave</artifactId>
    </dependency>

    <!-- 可选：Feign 自动传播 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
</dependencies>
```

**OpenTelemetry 替代**：

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

---

## 5. application.yml 配置

```yaml
spring:
  application:
    name: order-service

management:
  tracing:
    enabled: true
    sampling:
      probability: 1.0   # 生产建议 0.1 ~ 0.3，按流量调整
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

logging:
  pattern:
  # 日志中打印 traceId/spanId（Boot 3.4+ 常用格式）
    level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
```

**采样说明**：

- `probability: 1.0` = 100% 采样，开发环境适用。
- 高 QPS 生产环境全量采样会导致 Zipkin 存储与网络压力，务必调低。
- 可配合自定义 `Sampler` Bean 对错误请求 100% 采样。

---

## 6. 本地 Zipkin 快速启动

```bash
docker run -d --name zipkin -p 9411:9411 openzipkin/zipkin
```

访问 `http://localhost:9411` 查看 UI。微服务配置 `endpoint` 指向该地址即可。

---

## 7. 自动追踪与手动埋点

### 7.1 自动覆盖范围

启用依赖后，以下组件通常**自动**产生 Span：

- Spring MVC / WebFlux HTTP 入站
- `RestTemplate` / `RestClient` / WebClient 出站
- Spring Cloud OpenFeign
- JDBC（需 `datasource-micrometer` 或相关 starter）
- Kafka / RabbitMQ（对应 starter 启用时）

### 7.2 手动创建 Span

```java
@Service
@RequiredArgsConstructor
public class PricingService {

    private final Tracer tracer;

    public BigDecimal calculate(Long skuId) {
        Span span = tracer.nextSpan().name("pricing.calculate").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("sku.id", String.valueOf(skuId));
            // 业务逻辑
            return doCalculate(skuId);
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

或使用注解（需 `@EnableAspectJAutoProxy`）：

```java
@NewSpan("inventory.reserve")
public void reserve(@SpanTag("order.id") Long orderId, int qty) {
    // ...
}
```

---

## 8. Baggage 跨服务传播

Baggage 适合传递**小体积**业务上下文（如 `tenant-id`），不要塞 JWT 或大块 JSON。

```yaml
management:
  tracing:
    baggage:
      remote-fields: tenant-id,user-id
      correlation:
        fields: tenant-id
```

```java
// 写入
try (BaggageInScope scope = Baggage.create("tenant-id", "t-10086").makeCurrent()) {
    feignClient.getConfig();
}

// 日志 pattern 中引用
# logging.pattern.level: "... tenant=%X{tenant-id:-} ..."
```

**注意**：每个 Baggage 字段都会附加到**所有下游** HTTP 头，字段过多会放大请求头、触及网关限制。

---

## 9. Feign / HTTP 传播

OpenFeign 在引入 `spring-cloud-starter-openfeign` 与 tracing bridge 后，默认通过 `FeignTracingAutoConfiguration` 注入传播拦截器。

自定义 `RestClient` 时需确保使用带 tracing 的 `ClientHttpRequestFactory` 或手动添加拦截器：

```java
@Bean
RestClient.Builder restClientBuilder(RestClient.Builder builder) {
    return builder; // Boot 自动配置通常已处理
}
```

**跨语言调用**：对外暴露 API 时，同时支持 W3C Trace Context（`traceparent`）与 B3 头，可避免 Node/Go 服务断链。配置示例：

```yaml
management:
  tracing:
    propagation:
      type: w3c,b3   # 同时传播两种格式
```

---

## 10. Sleuth vs Micrometer Tracing 对照表

| 项目 | Spring Cloud Sleuth（Boot 2） | Micrometer Tracing（Boot 3） |
|------|------------------------------|------------------------------|
| Starter | `spring-cloud-starter-sleuth` | `micrometer-tracing-bridge-brave` 等 |
| 日志 MDC 键 | `traceId`, `spanId` | 相同（兼容意图） |
| 采样配置 | `spring.sleuth.sampler.probability` | `management.tracing.sampling.probability` |
| Zipkin 地址 | `spring.zipkin.base-url` | `management.zipkin.tracing.endpoint` |
| Baggage | `spring.sleuth.baggage.*` | `management.tracing.baggage.*` |
| 注解 | `@NewSpan`（Sleuth） | `@NewSpan`（Micrometer，包名不同） |
| 维护状态 | 停更（Boot 3 不可用） | 活跃 |

**包名迁移**：

```java
// 旧
import org.springframework.cloud.sleuth.annotation.NewSpan;

// 新
import io.micrometer.tracing.annotation.NewSpan;
```

---

## 11. 与 Metrics 联动（可观测性三板斧）

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    tags:
      application: ${spring.application.name}
```

Tracing 解决"慢在哪一段"；Prometheus 指标解决"QPS/错误率"；日志（带 traceId）串联三者。Grafana Tempo 支持 traceId → Loki 日志跳转，生产环境值得投入。

---

## 12. 常见问题

### 12.1 链路断了

- 检查网关是否剥离了 `traceparent` / `b3` 头。
- 异步线程：使用 `@Async` 时需 `ContextSnapshot` 或 Micrometer 的上下文传播包装 `Executor`。
- 虚拟线程：一般与 tracing 兼容，但自定义 `Executor` 需验证。

### 12.2 Span 太多 / Zipkin 卡顿

- 降低采样率。
- 排除健康检查路径：`management.tracing.enabled` + 自定义 `ObservationPredicate`。

### 12.3 与 SkyWalking / Pinpoint 共存

- 如需 APM 探针，避免重复全量埋点；通常二选一或让 APM 读 OTel 数据。

---

## 13. 最小可运行验证

```bash
# 1. 启动 Zipkin
docker run -d -p 9411:9411 openzipkin/zipkin

# 2. 启动两个 Spring Boot 服务，B 通过 Feign 调 A
# 3. 请求 B 的接口
curl http://localhost:8082/api/orders/1

# 4. 在 Zipkin UI 按服务名搜索，应看到 B → A 的完整链路
```

---

## 参考

- [Micrometer Tracing 官方文档](https://docs.micrometer.io/tracing/reference/)
- [Spring Boot Actuator Tracing](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.micrometer-tracing)
- [Spring Cloud 2024.x 可观测性指南](https://spring.io/projects/spring-cloud)
