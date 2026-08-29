---
tags:
  - 运维
  - 监控
  - Prometheus
  - Grafana
  - Micrometer
title: Prometheus与Grafana详解
createTime: 2026/08/29 16:00:00
permalink: /article/prometheus-grafana/
---

::: tip 2026 技术栈
Spring Boot 3.x 默认集成 **Micrometer**；链路追踪见 [Micrometer Tracing](/article/micrometer-tracing/)。指标暴露推荐 `/actuator/prometheus`，由 Prometheus 拉取（Pull），Grafana 可视化，Alertmanager 告警。
:::

## 一、监控体系概览

```
┌─────────────┐    scrape     ┌──────────────┐    query    ┌─────────┐
│ Spring Boot │ ────────────► │ Prometheus   │ ──────────► │ Grafana │
│ /metrics    │   HTTP pull   │ TSDB 时序库   │   PromQL    │ 仪表盘   │
└─────────────┘               └──────┬───────┘             └─────────┘
                                     │ alert
                                     ▼
                              ┌──────────────┐
                              │ Alertmanager │ → Slack / 邮件 / PagerDuty
                              └──────────────┘
```

| 组件 | 职责 |
|------|------|
| Prometheus | 采集、存储、查询指标（PromQL） |
| Grafana | 可视化、告警面板（也可对接 Alertmanager） |
| Alertmanager | 告警去重、分组、路由、静默 |
| Micrometer | Java 应用指标门面，适配 Prometheus 格式 |

---

## 二、核心概念

### 2.1 指标类型（Metric Types）

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| Counter | 只增不减的计数器 | 请求总数、错误次数 |
| Gauge | 可增可减的瞬时值 | 内存使用、队列长度 |
| Histogram | 分桶统计 + `_sum` / `_count` | 请求延迟分布 |
| Summary | 分位数（客户端计算） | 较少用，Histogram + `histogram_quantile` 更常见 |

### 2.2 标签（Labels）

Prometheus 通过 **metric name + labels** 唯一标识时间序列。

```
http_server_requests_seconds_count{method="GET",uri="/api/users",status="200"} 1024
```

标签基数（cardinality）过高会导致内存爆炸，避免将 `userId`、无界 `uri` 作为 label。

### 2.3 Pull vs Push

- **Pull（Prometheus 默认）**：Prometheus 定时请求目标 `/metrics`
- **Pushgateway**：短生命周期批处理任务临时推送（慎用，易成单点）

---

## 三、Spring Boot + Micrometer

### 3.1 依赖

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: when_authorized
    prometheus:
      enabled: true
  metrics:
    tags:
      application: ${spring.application.name}
    distribution:
      percentiles-histogram:
        http.server.requests: true
```

访问 `http://localhost:8080/actuator/prometheus` 可看到 Prometheus 文本格式指标。

### 3.2 内置 HTTP 指标

Micrometer 自动记录：

```
http_server_requests_seconds_count
http_server_requests_seconds_sum
http_server_requests_seconds_bucket
```

配合 `percentiles-histogram` 可在 Grafana 计算 P95/P99。

### 3.3 自定义 Counter / Timer

```java
@Service
public class OrderService {

    private final Counter orderCreatedCounter;
    private final Timer paymentTimer;

    public OrderService(MeterRegistry registry) {
        this.orderCreatedCounter = Counter.builder("orders.created.total")
            .description("订单创建总数")
            .tag("channel", "web")
            .register(registry);

        this.paymentTimer = Timer.builder("orders.payment.duration")
            .description("支付耗时")
            .publishPercentileHistogram()
            .register(registry);
    }

    public void createOrder(Order order) {
        // 业务逻辑
        orderCreatedCounter.increment();
    }

    public void pay(Order order) {
        paymentTimer.record(() -> doPayment(order));
    }

    private void doPayment(Order order) { /* ... */ }
}
```

### 3.4 @Timed 注解

```java
@Timed(value = "inventory.reserve", description = "库存预占耗时")
public void reserveStock(String sku, int qty) {
    // ...
}
```

需启用 `@EnableAspectJAutoProxy` 并引入 `micrometer-core` 的 TimedAspect Bean。

### 3.4 Gauge 示例

```java
@Bean
public MeterBinder queueSizeGauge(BlockingQueue<Task> queue) {
    return registry -> Gauge.builder("task.queue.size", queue, BlockingQueue::size)
        .description("待处理任务队列长度")
        .register(registry);
}
```

### 3.5 JVM 与系统指标

引入 `spring-boot-starter-actuator` 后自动暴露：

- `jvm_memory_used_bytes`
- `jvm_gc_pause_seconds`
- `process_cpu_usage`
- `system_cpu_usage`
- `hikaricp_connections_active`（连接池）

---

## 四、Prometheus 安装与配置

### 4.1 Docker Compose 快速启动

```yaml
# monitoring/docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:v2.55.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=15d'

  grafana:
    image: grafana/grafana:11.3.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana

  alertmanager:
    image: prom/alertmanager:v0.27.0
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro

volumes:
  prometheus-data:
  grafana-data:
```

### 4.2 prometheus.yml

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']

  - job_name: spring-boot-apps
    metrics_path: /actuator/prometheus
    scrape_interval: 10s
    static_configs:
      - targets:
          - 'host.docker.internal:8080'
        labels:
          env: dev
          service: order-service

  # Kubernetes 服务发现（生产常见）
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

### 4.3 多实例与服务发现

静态 `targets` 适合开发；生产使用：

- Kubernetes Pod annotations
- Consul / Eureka（需 exporter 或自定义 SD）
- Prometheus `file_sd_configs` 动态文件

```yaml
- job_name: file-sd
  file_sd_configs:
    - files:
        - /etc/prometheus/targets/*.json
      refresh_interval: 30s
```

---

## 五、PromQL 常用查询

### 5.1 请求速率（QPS）

```promql
# 5 分钟内 GET /api/orders 的每秒请求数
rate(http_server_requests_seconds_count{uri="/api/orders",method="GET"}[5m])
```

### 5.2 错误率

```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
/
sum(rate(http_server_requests_seconds_count[5m]))
```

### 5.3 P99 延迟

```promql
histogram_quantile(0.99,
  sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri)
)
```

### 5.4 JVM 堆内存使用率

```promql
jvm_memory_used_bytes{area="heap"}
/
jvm_memory_max_bytes{area="heap"}
```

### 5.5 告警规则示例

```yaml
# monitoring/rules/app-alerts.yml
groups:
  - name: spring-boot-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
          /
          sum(rate(http_server_requests_seconds_count[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "5xx 错误率超过 5%"
          description: "当前错误率 {{ $value | humanizePercentage }}"

      - alert: HighP99Latency
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_server_requests_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P99 延迟超过 2s"

      - alert: JvmHeapHigh
        expr: |
          jvm_memory_used_bytes{area="heap"}
          / jvm_memory_max_bytes{area="heap"} > 0.9
        for: 5m
        labels:
          severity: warning
```

---

## 六、Grafana 仪表盘

### 6.1 添加数据源

1. Configuration → Data Sources → Add Prometheus
2. URL: `http://prometheus:9090`（Docker 网络内）
3. Save & Test

### 6.2 导入官方面板

Dashboard → Import → 输入 ID：

| ID | 说明 |
|----|------|
| 4701 | JVM Micrometer |
| 12900 | Spring Boot 2.1+ Statistics |
| 11378 | Spring Boot Observability |

### 6.3 自定义 Panel 示例

**Stat 面板 — 当前 QPS：**

```promql
sum(rate(http_server_requests_seconds_count[1m]))
```

**Time series — 按 status 分组的 QPS：**

```promql
sum(rate(http_server_requests_seconds_count[5m])) by (status)
```

**Heatmap — 延迟分布：**

使用 `http_server_requests_seconds_bucket` + Heatmap 可视化类型。

### 6.4 变量（Template Variables）

```
Name: service
Type: Query
Query: label_values(http_server_requests_seconds_count, application)
```

面板查询改为：

```promql
sum(rate(http_server_requests_seconds_count{application="$service"}[5m]))
```

### 6.5 Grafana 告警（可选）

Grafana 11 仍支持 Unified Alerting，但生产更推荐 **Prometheus rule + Alertmanager**，避免双轨告警逻辑。

---

## 七、Alertmanager 简要

### 7.1 alertmanager.yml

```yaml
# monitoring/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: default
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: pagerduty
    - match:
        severity: warning
      receiver: slack

receivers:
  - name: default
    email_configs:
      - to: ops@example.com
        from: alertmanager@example.com
        smarthost: smtp.example.com:587
        auth_username: alertmanager@example.com
        auth_password: ${SMTP_PASSWORD}

  - name: slack
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: pagerduty
    pagerduty_configs:
      - routing_key: ${PAGERDUTY_KEY}

inhibit_rules:
  - source_match:
      severity: critical
    target_match:
      severity: warning
    equal: ['alertname', 'service']
```

### 7.2 告警生命周期

1. Prometheus 评估 `rule_files` 表达式
2. 满足 `for` 持续时间后进入 **firing**
3. 推送 Alertmanager
4. 分组、抑制、路由到 receiver
5. 恢复后发送 resolved 通知

### 7.3 静默与维护窗口

```bash
# CLI 创建 2 小时静默
amtool silence add alertname=HighErrorRate --duration=2h --comment="发布窗口"
```

Grafana UI：Alerting → Silences。

---

## 八、生产最佳实践

### 8.1 指标设计

- Metric 名：`业务域_动作_单位`，如 `orders_payment_duration_seconds`
- Label 控制基数：用 `uri` 模板化 `/api/users/{id}` 而非完整路径
- 统一 `application`、`env`、`instance` 标签

### 8.2 安全

```yaml
# 仅内网暴露 actuator
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
  server:
    port: 9091  # 独立管理端口
```

配合 NetworkPolicy / 安全组限制 9091 仅 Prometheus 可访问。

### 8.3 高可用

- Prometheus 联邦或 Thanos / Mimir 长期存储
- Alertmanager 集群（至少 3 节点）
- Grafana 配置 PostgreSQL 后端存仪表盘

### 8.4 RED / USE 方法论

| 方法 | 适用 | 指标 |
|------|------|------|
| RED | 请求驱动服务 | Rate, Errors, Duration |
| USE | 资源 | Utilization, Saturation, Errors |

Spring Boot HTTP 指标天然契合 RED。

---

## 九、与日志、链路追踪关联

```
指标（Metrics）→ 发现异常趋势（错误率升高）
日志（Logs）    → 定位具体错误堆栈
追踪（Traces）  → 分析慢请求调用链
```

在 Grafana 配置 **Exemplars** 可从 Histogram 跳转 Tempo/Jaeger trace（需 Micrometer Tracing + OTLP）。

```yaml
management:
  tracing:
    sampling:
      probability: 0.1
  otlp:
    tracing:
      endpoint: http://tempo:4318/v1/traces
```

---

## 十、Kubernetes 注解暴露指标

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/path: "/actuator/prometheus"
        prometheus.io/port: "8080"
    spec:
      containers:
        - name: app
          image: myorg/order-service:1.0.0
          ports:
            - containerPort: 8080
```

或使用 Prometheus Operator 的 `PodMonitor` / `ServiceMonitor` CRD（更推荐）。

---

## 十一、故障排查

| 现象 | 排查 |
|------|------|
| Target DOWN | 网络、端口、防火墙、`management.server.port` |
| 无自定义指标 | MeterRegistry 是否注入、Bean 是否创建 |
| 指标爆炸 | 检查高基数 label |
| Grafana 无数据 | 数据源 URL、时间范围、PromQL 语法 |
| 告警风暴 | Alertmanager `group_wait`、inhibit_rules |

```bash
# 验证 endpoint
curl -s localhost:8080/actuator/prometheus | head

# Prometheus targets 页面
open http://localhost:9090/targets
```

---

## 十二、本地开发一键启动

```bash
cd monitoring
docker compose up -d
# Spring Boot 本地启动后，prometheus.yml 指向 host.docker.internal:8080
```

Grafana: http://localhost:3000 (admin/admin)  
Prometheus: http://localhost:9090  
Alertmanager: http://localhost:9093  

---

## 十三、检查清单

- [ ] `micrometer-registry-prometheus` + `/actuator/prometheus`
- [ ] 全局 tag：`application`、`env`
- [ ] Histogram 开启 `percentiles-histogram` 供 P99
- [ ] Prometheus `scrape_interval` 与 SLO 匹配
- [ ] 告警规则设 `for` 防抖
- [ ] Alertmanager 路由分级（critical → 电话，warning → Slack）
- [ ] 管理端口与业务端口隔离

---

## 参考

- [Prometheus 文档](https://prometheus.io/docs/)
- [Micrometer 文档](https://micrometer.io/docs)
- [Grafana 文档](https://grafana.com/docs/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/reference/actuator/index.html)
