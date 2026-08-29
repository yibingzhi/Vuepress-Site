---
tags:
  - Java
  - 日志
  - SLF4J
  - Logback
  - Spring Boot
title: 日志体系SLF4J与Logback详解
createTime: 2026/08/29 16:00:00
permalink: /article/slf4j-logback/
---

::: tip 2026 默认组合
Spring Boot 3.x 默认 **SLF4J API + Logback** 实现。勿混用 Log4j2 与 Logback 绑定，避免 `Multiple bindings` 冲突。
:::

## 一、日志架构分层

```
应用代码
   │  调用 SLF4J API（org.slf4j.Logger）
   ▼
SLF4J 门面（接口）
   │  绑定
   ▼
Logback 实现（ch.qos.logback.classic.Logger）
   │  Appender 输出
   ▼
Console / File / Async / JSON → ELK / Loki
```

| 组件 | 作用 |
|------|------|
| SLF4J | 日志门面，解耦 API 与实现 |
| Logback | SLF4J 原生实现，性能优于 Log4j 1 |
| Log4j2 | 另一实现，需排除 logback 后引入 |

---

## 二、SLF4J API 使用

### 2.1 获取 Logger

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrderService {

    // 传统写法
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    // Lombok @Slf4j 生成同名 log 字段
}
```

```java
// Lombok
@Slf4j
@Service
public class PaymentService {
    public void pay(String orderId) {
        log.info("Processing payment for order {}", orderId);
    }
}
```

### 2.2 日志级别

从低到高：`TRACE` < `DEBUG` < `INFO` < `WARN` < `ERROR`

```java
log.trace("详细调试 traceId={}", traceId);
log.debug("请求参数: {}", request);
log.info("订单创建成功 orderId={}", orderId);
log.warn("库存不足 sku={} need={} actual={}", sku, need, actual);
log.error("支付失败 orderId={}", orderId, exception);
```

**生产默认 `INFO`**；`DEBUG` 按需临时开启（见 Spring Boot logging.level）。

### 2.3 占位符与性能

```java
// ✅ 推荐：仅当级别启用时才格式化
log.debug("user={}", user);

// ❌ 字符串拼接：即使 DEBUG 关闭也会拼接
log.debug("user=" + user);

// 多参数
log.info("order {} status {} amount {}", id, status, amount);

// 最后一个参数为 Throwable 时自动打印堆栈
log.error("处理失败 orderId={}", orderId, e);
```

### 2.4 判断级别（极少需要）

```java
if (log.isDebugEnabled()) {
    log.debug("heavy: {}", expensiveToString());
}
```

现代 SLF4J 占位符已足够；仅 `expensiveToString()` 成本极高时使用。

### 2.5 Marker（可选）

```java
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

private static final Marker AUDIT = MarkerFactory.getMarker("AUDIT");

log.info(AUDIT, "用户 {} 删除订单 {}", userId, orderId);
```

Logback 可按 Marker 过滤或路由到独立 appender。

---

## 三、Logback 配置（logback-spring.xml）

Spring Boot 推荐 `logback-spring.xml`（支持 `<springProfile>`）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds">

    <property name="LOG_PATH" value="${LOG_PATH:-./logs}"/>
    <property name="APP_NAME" value="${spring.application.name:-app}"/>

    <!-- 控制台 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 滚动文件 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 按包调级别 -->
    <logger name="com.example.app" level="DEBUG"/>
    <logger name="org.springframework.web" level="INFO"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/>

    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="FILE"/>
        </root>
    </springProfile>

</configuration>
```

### 3.1 配置文件优先级

1. `logback-spring.xml`（Spring 扩展）
2. `logback.xml`
3. `application.yml` 中 `logging.*`
4. Spring Boot 默认 `defaults.xml`

---

## 四、MDC（Mapped Diagnostic Context）

MDC 是线程绑定的键值 Map，用于透传 **traceId、userId** 等。

### 4.1 手动设置

```java
import org.slf4j.MDC;

public void handleRequest(String traceId, String userId) {
    MDC.put("traceId", traceId);
    MDC.put("userId", userId);
    try {
        log.info("处理请求");
        businessLogic();
    } finally {
        MDC.clear(); // 线程池场景必须清理
    }
}
```

### 4.2 Logback 输出 MDC

```xml
<pattern>%d{HH:mm:ss.SSS} [%thread] [%X{traceId}] [%X{userId}] %-5level %logger - %msg%n</pattern>
```

`%X{traceId}` 输出 MDC 中的 traceId；缺失时为空。

### 4.3 Filter / Interceptor 统一注入

```java
@Component
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String TRACE_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String traceId = request.getHeader(TRACE_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }
        MDC.put("traceId", traceId);
        response.setHeader(TRACE_HEADER, traceId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### 4.4 异步与线程池传递 MDC

子线程默认 **不继承** MDC，需手动拷贝：

```java
public static Runnable wrap(Runnable task) {
    Map<String, String> context = MDC.getCopyOfContextMap();
    return () -> {
        if (context != null) {
            MDC.setContextMap(context);
        }
        try {
            task.run();
        } finally {
            MDC.clear();
        }
    };
}

executor.execute(wrap(() -> log.info("async with trace")));
```

Micrometer Tracing 自动管理 trace/span，与 MDC 集成（`management.tracing.enabled=true`）。

### 4.5 虚拟线程

虚拟线程切换 carrier 时 MDC 需正确传播；使用 Spring Boot 3.2+ tracing 或 TTL（TransmittableThreadLocal）库。

---

## 五、异步 Appender

同步写盘阻塞业务线程；高 QPS 使用 `AsyncAppender`。

```xml
<appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 队列满时不丢弃，阻塞调用线程（保可靠） -->
    <discardingThreshold>0</discardingThreshold>
    <queueSize>8192</queueSize>
    <neverBlock>false</neverBlock>
    <includeCallerData>false</includeCallerData>
    <appender-ref ref="FILE"/>
</appender>

<root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ASYNC_FILE"/>
</root>
```

| 参数 | 说明 |
|------|------|
| `queueSize` | 环形队列大小 |
| `discardingThreshold` | 队列剩余容量低于此值时丢弃 TRACE/DEBUG/INFO |
| `neverBlock` | true 时队列满直接丢弃（低延迟优先） |
| `includeCallerData` | 记录行号，性能损耗大，默认 false |

**注意：** JVM 崩溃时异步队列中日志可能丢失；关键审计日志可同步写独立 appender。

---

## 六、JSON 结构化日志（生产推荐）

```xml
<appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/${APP_NAME}-json.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${LOG_PATH}/${APP_NAME}-json.%d{yyyy-MM-dd}.log.gz</fileNamePattern>
        <maxHistory>14</maxHistory>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdcKeyName>traceId</includeMdcKeyName>
        <includeMdcKeyName>userId</includeMdcKeyName>
        <customFields>{"service":"${APP_NAME}"}</customFields>
    </encoder>
</appender>
```

依赖：

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>8.0</version>
</dependency>
```

输出示例：

```json
{
  "@timestamp": "2026-08-29T10:00:00.123+08:00",
  "level": "INFO",
  "message": "订单创建成功",
  "traceId": "abc123",
  "service": "order-service"
}
```

便于 Loki / ELK 检索与仪表盘。

---

## 七、Spring Boot Logging 配置

### 7.1 application.yml

```yaml
logging:
  level:
    root: INFO
    com.example: DEBUG
    org.springframework.web: WARN
    org.hibernate.SQL: DEBUG
  file:
    name: ./logs/app.log
  logback:
    rollingpolicy:
      max-file-size: 50MB
      max-history: 30
      total-size-cap: 5GB
  pattern:
    console: "%clr(%d{HH:mm:ss.SSS}){faint} %clr(%5p) %clr([%X{traceId}]){yellow} %clr(---){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n"
```

### 7.2 环境差异化

```yaml
---
spring:
  config:
    activate:
      on-profile: dev
logging:
  level:
    com.example: DEBUG

---
spring:
  config:
    activate:
      on-profile: prod
logging:
  level:
    com.example: INFO
```

### 7.3 动态调整级别

Actuator endpoint（需暴露）：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: loggers
```

```bash
# 运行时把 com.example 调到 DEBUG
curl -X POST http://localhost:8080/actuator/loggers/com.example \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

---

## 八、多环境 Appender 分离

```xml
<!-- 错误单独文件 -->
<appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/${APP_NAME}-error.log</file>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
        <level>ERROR</level>
    </filter>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${LOG_PATH}/${APP_NAME}-error.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>90</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>%d %-5level [%X{traceId}] %logger - %msg%n%ex</pattern>
    </encoder>
</appender>
```

审计日志路由：

```xml
<appender name="AUDIT_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/audit.log</file>
    <!-- ... -->
</appender>

<logger name="AUDIT" level="INFO" additivity="false">
    <appender-ref ref="AUDIT_FILE"/>
</logger>
```

```java
Logger auditLog = LoggerFactory.getLogger("AUDIT");
auditLog.info("user={} action=DELETE_ORDER target={}", userId, orderId);
```

---

## 九、日志规范

### 9.1 该打什么

- 关键业务节点：创建、支付、状态变更
- 外部调用：入参摘要、耗时、结果码（勿打敏感信息）
- 异常：完整堆栈 + 业务上下文 ID

### 9.2 不该打什么

- 密码、token、信用卡号、身份证号
- 超大 body（可截断或 hash）

```java
log.info("登录 user={}", maskEmail(email));

private String maskEmail(String email) {
    int at = email.indexOf('@');
    if (at <= 1) return "***";
    return email.charAt(0) + "***" + email.substring(at);
}
```

### 9.3 级别指南

| 级别 | 场景 |
|------|------|
| ERROR | 需人工介入、影响业务 |
| WARN | 可恢复异常、降级、重试 |
| INFO | 正常业务里程碑 |
| DEBUG | 开发排查，生产临时开 |
| TRACE | 极细粒度，几乎不用 |

---

## 十、与 Log4j2 迁移对比

若必须 Log4j2：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

大多数 Spring Boot 项目 **无需迁移**，Logback 足够。

---

## 十一、测试中的日志

```xml
<!-- src/test/resources/logback-test.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss} %-5level %logger - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="WARN">
        <appender-ref ref="STDOUT"/>
    </root>
    <logger name="com.example" level="DEBUG"/>
</configuration>
```

断言日志输出可用 `ListAppender`：

```java
@Test
void shouldLogWarning() {
    Logger logger = (Logger) LoggerFactory.getLogger(OrderService.class);
    ListAppender<ILoggingEvent> appender = new ListAppender<>();
    appender.start();
    logger.addAppender(appender);

    orderService.lowStock("SKU1");

    assertThat(appender.list)
        .extracting(ILoggingEvent::getFormattedMessage)
        .anyMatch(msg -> msg.contains("库存不足"));
}
```

---

## 十二、故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 无日志输出 | 级别过高 | 调低 logger level |
| 重复两份 | 多个 console appender | 检查 root 与 logger additivity |
| 中文乱码 | 编码非 UTF-8 | encoder charset UTF-8 |
| MDC 为空 | 未 put 或异步未传递 | Filter + wrap Runnable |
| 磁盘占满 | 无 rolling 策略 | SizeAndTimeBasedRollingPolicy + totalSizeCap |

```bash
# 查看实际加载的配置
java -Dlogback.debug=true -jar app.jar
```

---

## 十三、检查清单

- [ ] 使用 SLF4J API，禁止 `System.out`
- [ ] 占位符 `{}`，异常作最后参数
- [ ] `logback-spring.xml` + profile 分环境
- [ ] MDC traceId，Filter 注入，finally clear
- [ ] 生产 JSON 编码 + 滚动策略
- [ ] 异步 appender 评估丢弃策略
- [ ] 敏感字段脱敏
- [ ] Actuator loggers 便于临时 DEBUG

---

## 参考

- [SLF4J 手册](https://www.slf4j.org/manual.html)
- [Logback 文档](https://logback.qos.ch/documentation.html)
- [Spring Boot Logging](https://docs.spring.io/spring-boot/reference/features/logging.html)
