---
title: Kafka详解
createTime: 2025/08/16 17:52:12
permalink: /微服务/8268o3uh/
---

## Kafka简介

### 1. 什么是Kafka

Apache Kafka是一个分布式流处理平台，具有以下特点：

- **高吞吐量**：每秒可处理数百万条消息
- **分布式**：支持水平扩展，可处理TB级数据
- **持久化**：消息持久化到磁盘，支持数据备份
- **实时性**：支持实时流处理
- **可靠性**：支持消息复制和故障恢复

### 2. 应用场景

- **消息队列**：应用间异步通信
- **日志收集**：集中式日志收集系统
- **流处理**：实时数据处理和分析
- **事件溯源**：记录系统状态变化
- **数据管道**：数据在不同系统间传输

### 3. 与其他消息队列对比

| 特性   | Kafka   | RabbitMQ | RocketMQ |
|------|---------|----------|----------|
| 吞吐量  | 极高      | 高        | 高        |
| 延迟   | 低       | 极低       | 低        |
| 可靠性  | 高       | 高        | 高        |
| 扩展性  | 极好      | 好        | 好        |
| 适用场景 | 大数据、流处理 | 传统消息队列   | 金融、电商    |

## 核心概念

### 1. 基本术语

#### Topic（主题）

- 消息的逻辑分类
- 类似于数据库中的表
- 支持多个分区

#### Partition（分区）

- Topic的物理存储单元
- 每个分区是一个有序的消息序列
- 分区内的消息有序，分区间无序

#### Producer（生产者）

- 向Topic发送消息的客户端
- 可选择分区策略
- 支持异步和同步发送

#### Consumer（消费者）

- 从Topic读取消息的客户端
- 支持消费者组
- 可设置消费偏移量

#### Consumer Group（消费者组）

- 一组消费者的集合
- 组内消费者共同消费Topic
- 每个分区只能被组内一个消费者消费

#### Broker（代理）

- Kafka集群中的服务器节点
- 负责消息存储和转发
- 支持主从复制

### 2. 消息模型

#### 消息结构

```json
{
  "topic": "user-events",
  "partition": 0,
  "offset": 12345,
  "timestamp": 1640995200000,
  "key": "user-123",
  "value": "{\"event\":\"login\",\"userId\":123}",
  "headers": {
    "source": "web-app",
    "version": "1.0"
  }
}
```

#### 消息顺序

- **分区内有序**：同一分区内的消息按时间顺序排列
- **分区间无序**：不同分区的消息没有全局顺序
- **全局有序**：可通过单分区实现，但影响吞吐量

## 架构设计

### 1. 整体架构

#### 组件关系

```
Producer → Broker → Consumer
    ↓         ↓        ↓
  Topic   Partition  Group
```

#### 集群架构

```
Producer → Broker1 (Leader)
              ↓
         Broker2 (Follower)
              ↓
         Broker3 (Follower)
              ↓
         Consumer
```

### 2. 存储架构

#### 分区存储

```
Topic: user-events
├── Partition 0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
├── Partition 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
└── Partition 2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### 文件存储

```
/var/lib/kafka/data/user-events-0/
├── 00000000000000000000.index
├── 00000000000000000000.log
├── 00000000000000000001.index
├── 00000000000000000001.log
└── ...
```

### 3. 复制机制

#### 副本策略

- **Leader副本**：处理读写请求
- **Follower副本**：同步Leader数据
- **ISR（In-Sync Replicas）**：与Leader保持同步的副本

#### 故障处理

- Leader故障时，从ISR中选择新的Leader
- 副本数量不足时，从其他Broker复制数据
- 支持自动故障恢复

## 安装部署

### 1. 单机部署

#### 下载安装

```bash
# 下载Kafka
wget https://downloads.apache.org/kafka/3.4.0/kafka_2.13-3.4.0.tgz

# 解压
tar -xzf kafka_2.13-3.4.0.tgz
cd kafka_2.13-3.4.0

# 启动Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties &

# 启动Kafka
bin/kafka-server-start.sh config/server.properties &
```

#### 基本配置

```properties
# config/server.properties
broker.id=0
listeners=PLAINTEXT://localhost:9092
log.dirs=/tmp/kafka-logs
num.partitions=1
default.replication.factor=1
```

### 2. 集群部署

#### 多Broker配置

```properties
# Broker 1
broker.id=1
listeners=PLAINTEXT://broker1:9092
log.dirs=/data/kafka-logs-1
zookeeper.connect=zookeeper1:2181,zookeeper2:2181,zookeeper3:2181

# Broker 2
broker.id=2
listeners=PLAINTEXT://broker2:9092
log.dirs=/data/kafka-logs-2
zookeeper.connect=zookeeper1:2181,zookeeper2:2181,zookeeper3:2181

# Broker 3
broker.id=3
listeners=PLAINTEXT://broker3:9092
log.dirs=/data/kafka-logs-3
zookeeper.connect=zookeeper1:2181,zookeeper2:2181,zookeeper3:2181
```

#### Docker部署

```yaml
# docker-compose.yml
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

## 生产者开发

### 1. Java客户端

#### Maven依赖

```xml

<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>3.4.0</version>
</dependency>
```

#### 基本生产者

```java
import org.apache.kafka.clients.producer.*;

import java.util.Properties;

public class SimpleProducer {
    public static void main(String[] args) {
        // 配置属性
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
                  "org.apache.kafka.common.serialization.StringSerializer");
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
                  "org.apache.kafka.common.serialization.StringSerializer");
        
        // 创建生产者
        KafkaProducer<String, String> producer = new KafkaProducer<>(props);
        
        // 发送消息
        for (int i = 0; i < 100; i++) {
            ProducerRecord<String, String> record = 
                new ProducerRecord<>("test-topic", "key-" + i, "value-" + i);
            
            producer.send(record, new Callback() {
                @Override
                public void onCompletion(RecordMetadata metadata, Exception exception) {
                    if (exception == null) {
                        System.out.printf("消息发送成功: topic=%s, partition=%d, offset=%d%n",
                            metadata.topic(), metadata.partition(), metadata.offset());
                    } else {
                        System.err.println("消息发送失败: " + exception.getMessage());
                    }
                }
            });
        }
        
        // 关闭生产者
        producer.close();
    }
}
```

### 2. 高级特性

#### 分区策略

```java
// 自定义分区器
public class CustomPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        // 根据key的hash值选择分区
        if (keyBytes == null) {
            return 0;
        }
        
        int numPartitions = cluster.partitionCountForTopic(topic);
        return Math.abs(Objects.hash(key)) % numPartitions;
    }
    
    @Override
    public void close() {}
    
    @Override
    public void configure(Map<String, ?> configs) {}
}

// 使用自定义分区器
props.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, CustomPartitioner.class.getName());
```

#### 批量发送

```java
// 批量发送配置
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);        // 16KB
props.put(ProducerConfig.LINGER_MS_CONFIG, 100);          // 100ms
props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432); // 32MB

// 异步发送
producer.send(record, new Callback() {
    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {
        // 处理回调
    }
});

// 同步发送
try {
    RecordMetadata metadata = producer.send(record).get();
    System.out.println("消息发送成功: " + metadata.offset());
} catch (Exception e) {
    e.printStackTrace();
}
```

### 3. Spring Boot集成

#### 配置类

```java
@Configuration
public class KafkaProducerConfig {
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

#### 使用示例

```java
@Service
public class MessageService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void sendMessage(String topic, String key, String value) {
        kafkaTemplate.send(topic, key, value)
            .addCallback(
                result -> System.out.println("消息发送成功"),
                ex -> System.err.println("消息发送失败: " + ex.getMessage())
            );
    }
    
    public void sendMessageWithPartition(String topic, String key, String value, int partition) {
        kafkaTemplate.send(topic, partition, key, value);
    }
}
```

## 消费者开发

### 1. Java客户端

#### 基本消费者

```java
import org.apache.kafka.clients.consumer.*;

import java.time.Duration;
import java.util.Arrays;
import java.util.Properties;

public class SimpleConsumer {
    public static void main(String[] args) {
        // 配置属性
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, 
                  "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, 
                  "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // 创建消费者
        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        
        // 订阅主题
        consumer.subscribe(Arrays.asList("test-topic"));
        
        try {
            while (true) {
                // 拉取消息
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                
                for (ConsumerRecord<String, String> record : records) {
                    System.out.printf("收到消息: topic=%s, partition=%d, offset=%d, key=%s, value=%s%n",
                        record.topic(), record.partition(), record.offset(), record.key(), record.value());
                }
            }
        } finally {
            consumer.close();
        }
    }
}
```

### 2. 消费者组

#### 消费者组配置

```java
// 多个消费者实例
public class Consumer1 {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");
        // ... 其他配置
        
        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Arrays.asList("test-topic"));
        
        // 消费逻辑
    }
}

public class Consumer2 {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");
        // ... 其他配置
        
        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
        consumer.subscribe(Arrays.asList("test-topic"));
        
        // 消费逻辑
    }
}
```

#### 分区分配策略

```java
// 设置分区分配策略
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, 
          "org.apache.kafka.clients.consumer.RoundRobinAssignor");

// 可选策略：
// RoundRobinAssignor: 轮询分配
// RangeAssignor: 范围分配
// StickyAssignor: 粘性分配
```

### 3. Spring Boot集成

#### 配置类

```java
@Configuration
public class KafkaConsumerConfig {
    
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        
        return new DefaultKafkaConsumerFactory<>(configProps);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3); // 并发消费者数量
        return factory;
    }
}
```

#### 消息监听器

```java
@Component
public class MessageListener {
    
    @KafkaListener(topics = "test-topic", groupId = "my-group")
    public void listen(String message) {
        System.out.println("收到消息: " + message);
    }
    
    @KafkaListener(topics = "user-events", groupId = "user-group")
    public void listenUserEvents(ConsumerRecord<String, String> record) {
        System.out.printf("用户事件: topic=%s, partition=%d, offset=%d, key=%s, value=%s%n",
            record.topic(), record.partition(), record.offset(), record.key(), record.value());
    }
    
    @KafkaListener(topics = "order-events", groupId = "order-group", 
                   containerFactory = "kafkaListenerContainerFactory")
    public void listenOrderEvents(@Payload String message,
                                 @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                 @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition) {
        System.out.printf("订单事件: topic=%s, partition=%d, message=%s%n", 
            topic, partition, message);
    }
}
```

## 分区策略

### 1. 分区数量选择

#### 影响因素

- **吞吐量需求**：分区数越多，吞吐量越高
- **消费者数量**：分区数应大于等于消费者数量
- **存储容量**：每个分区占用一定磁盘空间
- **网络连接**：分区数影响网络连接数

#### 计算公式

```
分区数 = max(吞吐量需求 / 单分区吞吐量, 消费者数量)
单分区吞吐量 ≈ 10MB/s
```

### 2. 分区分配策略

#### 生产者分区策略

```java
// 1. 轮询策略（默认）
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "key", "value");

// 2. 指定分区
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", 0, "key", "value");

// 3. 根据key分区
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "user-123", "value");

// 4. 自定义分区器
props.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, CustomPartitioner.class.getName());
```

#### 消费者分区分配

```java
// 1. RangeAssignor（默认）
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, 
          "org.apache.kafka.clients.consumer.RangeAssignor");

// 2. RoundRobinAssignor
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, 
          "org.apache.kafka.clients.consumer.RoundRobinAssignor");

// 3. StickyAssignor
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, 
          "org.apache.kafka.clients.consumer.StickyAssignor");
```

### 3. 分区扩展

#### 增加分区

```bash
# 增加主题分区数
kafka-topics.sh --bootstrap-server localhost:9092 \
    --alter --topic test-topic --partitions 6
```

#### 注意事项

- 只能增加分区数，不能减少
- 增加分区会影响消息顺序
- 需要重新平衡消费者组

## 集群配置

### 1. 高可用配置

#### 副本配置

```properties
# 设置副本因子
default.replication.factor=3

# 设置最小同步副本数
min.insync.replicas=2

# 设置ISR最小副本数
replica.lag.time.max.ms=10000
```

#### 故障恢复

```properties
# 自动故障恢复
auto.leader.rebalance.enable=true

# 副本同步超时
replica.socket.timeout.ms=30000

# 副本拉取超时
replica.fetch.wait.max.ms=500
```

### 2. 安全配置

#### SASL认证

```properties
# 启用SASL
security.inter.broker.protocol=SASL_PLAINTEXT
sasl.mechanism.inter.broker.protocol=PLAIN
sasl.enabled.mechanisms=PLAIN

# 客户端认证
sasl.mechanism=PLAIN
security.protocol=SASL_PLAINTEXT
```

#### SSL加密

```properties
# 启用SSL
security.inter.broker.protocol=SSL
ssl.keystore.location=/path/to/keystore.jks
ssl.keystore.password=password
ssl.key.password=password
ssl.truststore.location=/path/to/truststore.jks
ssl.truststore.password=password
```

### 3. 监控配置

#### JMX监控

```properties
# 启用JMX
jmx.port=9999
jmx.hostname=localhost

# 监控指标
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec
kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec
kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec
```

## 性能调优

### 1. 生产者调优

#### 批量发送

```properties
# 批量大小
batch.size=16384

# 等待时间
linger.ms=100

# 缓冲区大小
buffer.memory=33554432

# 压缩类型
compression.type=gzip
```

#### 异步发送

```properties
# 异步发送配置
acks=1
retries=3
retry.backoff.ms=100
```

### 2. 消费者调优

#### 批量消费

```properties
# 批量大小
max.poll.records=500

# 拉取超时
max.poll.interval.ms=300000

# 拉取大小
fetch.min.bytes=1
fetch.max.wait.ms=500
```

#### 并发消费

```java
// 设置并发消费者数量
factory.setConcurrency(3);

// 设置分区分配策略
factory.getContainerProperties().setConsumerRebalanceListener(new ConsumerAwareRebalanceListener() {
    @Override
    public void onPartitionsRevokedBeforeCommit(Consumer<?, ?> consumer, Collection<TopicPartition> partitions) {
        // 分区撤销前处理
    }
    
    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        // 分区分配后处理
    }
});
```

### 3. Broker调优

#### 内存配置

```properties
# 堆内存
KAFKA_HEAP_OPTS="-Xmx4G -Xms4G"

# 直接内存
KAFKA_OPTS="-XX:MaxDirectMemorySize=2G"
```

#### 磁盘配置

```properties
# 日志段大小
log.segment.bytes=1073741824

# 日志保留时间
log.retention.hours=168

# 日志清理策略
log.cleanup.policy=delete
```

## 监控运维

### 1. 监控指标

#### 关键指标

- **吞吐量**：每秒消息数、字节数
- **延迟**：消息处理延迟、网络延迟
- **错误率**：发送失败率、消费失败率
- **资源使用**：CPU、内存、磁盘、网络

#### 告警规则

```yaml
# Prometheus告警规则
groups:
  - name: kafka
    rules:
      - alert: KafkaHighErrorRate
        expr: rate(kafka_server_brokertopicmetrics_messagesin_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Kafka错误率过高"
          description: "Kafka错误率超过10%"
```

### 2. 运维工具

#### 命令行工具

```bash
# 主题管理
kafka-topics.sh --bootstrap-server localhost:9092 --list
kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic test-topic

# 消费者组管理
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-group

# 消息查看
kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-topic --from-beginning
```

#### 图形化工具

- **Kafka Manager**：集群管理界面
- **Kafka Tool**：桌面客户端工具
- **Conduktor**：现代化管理界面

### 3. 故障处理

#### 常见问题

```bash
# 1. 消费者组卡住
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group my-group --reset-offsets --to-latest --execute

# 2. 分区不平衡
kafka-leader-election.sh --bootstrap-server localhost:9092 \
    --election-type PREFERRED --all-topic-partitions

# 3. 副本同步问题
kafka-topics.sh --bootstrap-server localhost:9092 \
    --describe --topic test-topic
```

#### 日志分析

```bash
# 查看错误日志
tail -f /var/log/kafka/server.log | grep ERROR

# 查看GC日志
tail -f /var/log/kafka/gc.log

# 查看网络日志
tail -f /var/log/kafka/network.log
```
