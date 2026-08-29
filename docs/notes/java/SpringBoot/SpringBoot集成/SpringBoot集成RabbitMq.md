---
title: SpringBoot集成RabbitMq
createTime: 2024/11/16 21:27:31
permalink: /SpringBoot/SpringBoot集成/qvvnupng/
---

::: tip 保鲜说明（2026-08）
面向 **Spring Boot 3.x**：使用 `spring-boot-starter-amqp`，监听器确认模式推荐 **手动 ACK**；JSON 消息体用 `Jackson2JsonMessageConverter`。
:::

## 一、RabbitMQ 核心概念

RabbitMQ 是 AMQP 协议的消息中间件，核心组件：

```
Producer → Exchange → (Binding + Routing Key) → Queue → Consumer
```

| 组件 | 说明 |
|------|------|
| **Producer** | 消息发送方 |
| **Exchange** | 交换机，按规则路由消息到队列 |
| **Queue** | 消息队列，存储待消费消息 |
| **Binding** | 交换机与队列的绑定关系（含 routing key） |
| **Consumer** | 消息消费方 |

### 1.1 交换机类型

| 类型 | 路由规则 | 典型场景 |
|------|---------|---------|
| **Direct** | routing key 完全匹配 | 点对点、按业务类型分发 |
| **Fanout** | 忽略 routing key，广播到所有绑定队列 | 广播通知 |
| **Topic** | routing key 模式匹配（`*` 一词，`#` 多词） | 日志分级、多订阅 |
| **Headers** | 按消息头匹配 | 较少用 |

---

## 二、环境准备

### 2.1 Docker 启动（推荐）

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

- **5672**：AMQP 协议端口
- **15672**：管理控制台 `http://localhost:15672`（默认 `guest` / `guest`，**生产务必改密码**）

### 2.2 创建 Spring Boot 3 项目

依赖选择：`Spring AMQP`、`Spring Web`。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

---

## 三、连接配置

```yaml
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    # 发布者确认（可选）
    publisher-confirm-type: correlated
    publisher-returns: true
    # 消费者配置
    listener:
      simple:
        acknowledge-mode: manual    # 手动 ACK
        prefetch: 10              # 每次预取条数
        retry:
          enabled: true
          initial-interval: 1000ms
          max-attempts: 3
          multiplier: 2.0
```

---

## 四、Exchange / Queue / Binding 配置

```java
@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_QUEUE = "order.queue";
    public static final String ORDER_ROUTING_KEY = "order.created";

    // 死信相关
    public static final String DLX_EXCHANGE = "order.dlx";
    public static final String DLQ_QUEUE = "order.dlq";
    public static final String DLQ_ROUTING_KEY = "order.dead";

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(ORDER_EXCHANGE, true, false);
        // durable=true 持久化；autoDelete=false
    }

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable(ORDER_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
            .build();
    }

    @Bean
    public Binding orderBinding(Queue orderQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderQueue)
            .to(orderExchange)
            .with(ORDER_ROUTING_KEY);
    }

    // 死信交换机与队列
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue,
                                     DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue)
            .to(deadLetterExchange)
            .with(DLQ_ROUTING_KEY);
    }
}
```

**参数说明：**

- `durable`：队列/交换机是否持久化（重启不丢）
- `x-dead-letter-exchange`：消息被拒绝或过期时转发的死信交换机
- `x-message-ttl`：消息 TTL（毫秒），可设在队列或单条消息上

### 4.1 Topic 交换机示例

```java
@Bean
public TopicExchange logExchange() {
    return new TopicExchange("log.exchange");
}

@Bean
public Queue errorLogQueue() {
    return new Queue("log.error");
}

@Bean
public Binding errorBinding(Queue errorLogQueue, TopicExchange logExchange) {
    return BindingBuilder.bind(errorLogQueue).to(logExchange).with("log.error.#");
}
```

发送 `log.error.payment` 会路由到 `log.error` 队列。

---

## 五、JSON 消息转换器

默认使用 `SimpleMessageConverter`（Java 序列化），**生产推荐 JSON**。

```java
@Configuration
public class RabbitMessageConverterConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        // 消息无法路由时回调
        template.setMandatory(true);
        template.setReturnsCallback(returned -> {
            System.err.println("消息被退回: " + returned.getMessage());
        });
        return template;
    }
}
```

### 5.1 消息 DTO

```java
public record OrderMessage(
    String orderId,
    Long userId,
    BigDecimal amount,
    LocalDateTime createdAt
) {}
```

---

## 六、消息生产者

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendOrderCreated(OrderMessage message) {
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.ORDER_EXCHANGE,
            RabbitMQConfig.ORDER_ROUTING_KEY,
            message,
            msg -> {
                // 单条消息持久化
                msg.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return msg;
            }
        );
        log.info("订单消息已发送: {}", message.orderId());
    }

    // 带 Confirm 回调（需 publisher-confirm-type: correlated）
    public void sendWithConfirm(OrderMessage message) {
        CorrelationData correlationData = new CorrelationData(message.orderId());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.ORDER_EXCHANGE,
            RabbitMQConfig.ORDER_ROUTING_KEY,
            message,
            correlationData
        );
    }
}
```

### 6.1 测试接口

```java
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderProducer orderProducer;

    @PostMapping("/orders/publish")
    public String publish(@RequestBody OrderMessage message) {
        orderProducer.sendOrderCreated(message);
        return "sent";
    }
}
```

---

## 七、消息消费者（@RabbitListener）

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderConsumer {

    private final OrderService orderService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void onOrderCreated(OrderMessage message, Channel channel,
                               @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) {
        try {
            log.info("收到订单: {}", message);
            orderService.processOrder(message);
            // 手动 ACK：成功
            channel.basicAck(deliveryTag, false);
        } catch (BusinessException e) {
            log.warn("业务异常，拒绝并不重新入队 → 进死信队列: {}", e.getMessage());
            try {
                // requeue=false：不重回队列，触发死信
                channel.basicNack(deliveryTag, false, false);
            } catch (IOException ex) {
                log.error("NACK 失败", ex);
            }
        } catch (Exception e) {
            log.error("未知异常，重新入队重试", e);
            try {
                // requeue=true：重回队列（注意避免无限循环）
                channel.basicNack(deliveryTag, false, true);
            } catch (IOException ex) {
                log.error("NACK 失败", ex);
            }
        }
    }
}
```

---

## 八、ACK / NACK 详解

| 方法 | 含义 | 使用场景 |
|------|------|---------|
| `basicAck(tag, multiple)` | 确认消费成功 | 业务处理完成 |
| `basicNack(tag, multiple, requeue)` | 拒绝消息 | `requeue=true` 重试；`false` 丢弃或进死信 |
| `basicReject(tag, requeue)` | 拒绝单条 | 同 NACK（不支持批量） |

**确认模式（`acknowledge-mode`）：**

| 模式 | 说明 |
|------|------|
| `none` | 自动 ACK（消息一投递就确认，可能丢消息） |
| `auto` | Spring 根据方法是否正常返回决定 ACK/NACK |
| `manual` | 代码里手动 `channel.basicAck`（**生产推荐**） |

---

## 九、重试机制

### 9.1 Spring 内置重试（listener.simple.retry）

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          initial-interval: 1000ms
          max-attempts: 3
          multiplier: 2.0
          max-interval: 10000ms
```

配合 `acknowledge-mode: auto` 时，重试耗尽后默认拒绝消息。

### 9.2 业务层重试（Spring Retry）

```java
@Retryable(
    retryFor = TransientException.class,
    maxAttempts = 3,
    backoff = @Backoff(delay = 2000, multiplier = 2)
)
public void processWithRetry(OrderMessage msg) {
    // 可能失败的远程调用
}
```

### 9.3 重试 vs 死信

- **短暂故障**：`requeue=true` 或 Spring Retry
- **永久失败**（如数据格式错误）：`requeue=false` → 死信队列，人工介入

---

## 十、死信队列（DLQ）

消息进入死信的常见原因：

1. 消费者 `basicNack` / `basicReject` 且 `requeue=false`
2. 消息 TTL 过期
3. 队列达到最大长度（`x-max-length`）

### 10.1 死信消费者

```java
@Component
@Slf4j
public class DeadLetterConsumer {

    @RabbitListener(queues = RabbitMQConfig.DLQ_QUEUE)
    public void handleDeadLetter(OrderMessage message) {
        log.error("死信消息，需人工处理: {}", message);
        // 落库、告警、钉钉通知等
    }
}
```

### 10.2 延迟队列（了解）

RabbitMQ 延迟插件 `rabbitmq_delayed_message_exchange`，或 TTL + 死信实现延迟投递（如订单超时取消）。

---

## 十一、Fanout 广播示例

```java
@Configuration
public class NotifyConfig {

    public static final String NOTIFY_EXCHANGE = "notify.fanout";
    public static final String SMS_QUEUE = "notify.sms";
    public static final String EMAIL_QUEUE = "notify.email";

    @Bean
    public FanoutExchange notifyExchange() {
        return new FanoutExchange(NOTIFY_EXCHANGE);
    }

    @Bean
    public Queue smsQueue() { return new Queue(SMS_QUEUE); }

    @Bean
    public Queue emailQueue() { return new Queue(EMAIL_QUEUE); }

    @Bean
    public Binding smsBinding(Queue smsQueue, FanoutExchange notifyExchange) {
        return BindingBuilder.bind(smsQueue).to(notifyExchange);
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, FanoutExchange notifyExchange) {
        return BindingBuilder.bind(emailQueue).to(notifyExchange);
    }
}
```

一条消息发送到 Fanout Exchange，SMS 和 Email 队列各收到一份。

---

## 十二、幂等性

消息可能重复投递，消费端需保证幂等：

```java
public void processOrder(OrderMessage msg) {
    if (orderService.exists(msg.orderId())) {
        log.info("订单已处理，跳过: {}", msg.orderId());
        return;
    }
    orderService.createFromMessage(msg);
}
```

常用手段：业务唯一键、Redis 去重、数据库唯一约束。

---

## 十三、常见坑

### 13.1 队列未声明就监听

启动报错 `NOT_FOUND`。确保 `@Bean` 声明队列，或管理台预先创建。

### 13.2 消息丢失

| 环节 | 防护 |
|------|------|
| 生产者 | `publisher-confirm`、持久化消息 |
| Broker | 队列 durable、镜像队列（集群） |
| 消费者 | 手动 ACK，处理完再确认 |

### 13.3 无限重试

`requeue=true` + 永久性错误 → 消息永远循环。应设重试上限后进 DLQ。

### 13.4 大消息

默认单条消息不宜过大（建议 < 1MB），大文件用对象存储 + 消息传 URL。

### 13.5 反序列化失败

DTO 字段变更导致 JSON 解析失败，应进死信并告警，不要无限重试。

### 13.6 预取数 prefetch

`prefetch=1` 公平分发但吞吐低；`prefetch=10~50` 提高吞吐，需平衡内存。

---

## 十四、完整测试流程

```bash
# 1. 启动 RabbitMQ
docker start rabbitmq

# 2. 启动 Spring Boot

# 3. 发送 JSON 消息
curl -X POST http://localhost:8080/orders/publish \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-001",
    "userId": 1001,
    "amount": 99.90,
    "createdAt": "2026-08-29T10:00:00"
  }'

# 4. 管理台查看
# Queues → order.queue 应有 Ready=0（已消费）
# 若模拟业务异常，检查 order.dlq
```

---

## 十五、与 Redis Pub/Sub 对比

| 特性 | RabbitMQ | Redis Pub/Sub |
|------|----------|---------------|
| 持久化 | 支持 | 不支持 |
| ACK | 支持 | 无 |
| 路由 | Exchange 多种类型 | 仅频道广播 |
| 适用 | 可靠异步任务 | 轻量实时通知 |

---

## 十六、小结

| 主题 | 要点 |
|------|------|
| 拓扑 | Exchange + Queue + Binding + Routing Key |
| 发送 | `RabbitTemplate.convertAndSend` |
| 接收 | `@RabbitListener` |
| 序列化 | `Jackson2JsonMessageConverter` |
| 可靠性 | 手动 ACK、持久化、Confirm |
| 失败处理 | 重试 + 死信队列 |
| 幂等 | 消费端去重 |

掌握以上内容，即可在 Spring Boot 3 中搭建生产可用的 RabbitMQ 消息系统。
