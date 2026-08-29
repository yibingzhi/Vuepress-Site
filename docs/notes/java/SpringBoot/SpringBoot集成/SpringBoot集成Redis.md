---
title: SpringBoot集成Redis
createTime: 2024/11/16 21:20:17
permalink: /SpringBoot/SpringBoot集成/vqbv51q2/
---

::: tip 保鲜说明（2026-08）
面向 **Spring Boot 3.x**：默认客户端为 **Lettuce**（Netty 异步），序列化推荐 Jackson JSON；`spring-boot-starter-data-redis` 已内置连接池（Commons Pool2），无需再单独引入 Jedis。
:::

## 一、为什么选 Redis

Redis 是内存型键值数据库，常用于：

- **缓存**：减轻 MySQL / 接口压力，提升读性能
- **分布式锁**：`SET key value NX EX seconds`
- **限流 / 计数器**：`INCR`、`EXPIRE`
- **排行榜**：`ZSET`
- **消息通知**：Pub/Sub（轻量广播，不保证持久化）
- **分布式 Session**：多实例共享登录态

Spring Boot 通过 `spring-boot-starter-data-redis` 集成，底层默认使用 **Lettuce** 连接 Redis。

---

## 二、环境准备

### 2.1 安装 Redis

**Docker（推荐本地开发）：**

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
# 带密码
docker run -d --name redis -p 6379:6379 redis:7-alpine redis-server --requirepass your_password
```

**验证：**

```bash
redis-cli ping
# 应返回 PONG
```

### 2.2 创建 Spring Boot 3 项目

在 [Spring Initializr](https://start.spring.io/) 选择：

- Spring Boot 3.x
- Java 17+
- 依赖：`Spring Data Redis`、`Spring Web`（可选，便于写接口测试）

---

## 三、依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<!-- 使用连接池时需要（Boot 3 通常已传递引入） -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
<!-- 分布式 Session（可选） -->
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

---

## 四、配置文件

### 4.1 基础连接（application.yml）

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: your_password   # 无密码可省略
      database: 0
      timeout: 3s
      lettuce:
        pool:
          max-active: 16
          max-idle: 8
          min-idle: 2
          max-wait: 2s
```

### 4.2 集群 / 哨兵（了解即可）

```yaml
spring:
  data:
    redis:
      cluster:
        nodes:
          - 192.168.1.10:6379
          - 192.168.1.11:6379
          - 192.168.1.12:6379
        max-redirects: 3
```

---

## 五、Lettuce 与连接工厂

Spring Boot 2.x 起默认客户端从 Jedis 切换为 **Lettuce**：

| 特性 | Lettuce | Jedis |
|------|---------|-------|
| 线程模型 | 基于 Netty，连接可共享 | 连接非线程安全，需池化 |
| 异步支持 | 原生支持 | 较弱 |
| 集群 | 完善 | 支持 |

一般无需手动创建 `RedisConnectionFactory`，Boot 会根据 `spring.data.redis.*` 自动配置。仅在需要自定义 SSL、读写分离等场景才写 `@Configuration`。

---

## 六、RedisTemplate vs StringRedisTemplate

两者都是操作 Redis 的核心 API，区别在 **默认序列化方式**：

| 类 | Key 序列化 | Value 序列化 | 适用场景 |
|----|-----------|-------------|---------|
| `StringRedisTemplate` | String | String | 存纯字符串、数字字符串、简单 JSON 字符串 |
| `RedisTemplate<String, Object>` | 需自定义 | 需自定义 | 存 Java 对象、Map、复杂结构 |

### 6.1 StringRedisTemplate 示例

```java
@Service
@RequiredArgsConstructor
public class TokenService {

    private final StringRedisTemplate stringRedisTemplate;

    public void saveToken(String userId, String token) {
        stringRedisTemplate.opsForValue()
            .set("token:" + userId, token, Duration.ofHours(2));
    }

    public String getToken(String userId) {
        return stringRedisTemplate.opsForValue().get("token:" + userId);
    }
}
```

### 6.2 RedisTemplate + JSON 序列化（推荐存对象）

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer =
            new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
```

> **注意**：`GenericJackson2JsonRedisSerializer` 会在 JSON 中写入 `@class` 类型信息，反序列化方便，但占用空间略大。生产环境可考虑自定义 `ObjectMapper` 或只用 `StringRedisTemplate` 存 JSON 字符串。

### 6.3 使用 RedisTemplate 操作

```java
@RestController
@RequiredArgsConstructor
public class UserCacheController {

    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/cache/user")
    public void cacheUser(@RequestBody User user) {
        redisTemplate.opsForValue()
            .set("user:" + user.getId(), user, 30, TimeUnit.MINUTES);
    }

    @GetMapping("/cache/user/{id}")
    public User getUser(@PathVariable Long id) {
        return (User) redisTemplate.opsForValue().get("user:" + id);
    }

    @PostMapping("/cache/hash")
    public void hashDemo() {
        redisTemplate.opsForHash().put("user:100", "name", "张三");
        redisTemplate.opsForHash().put("user:100", "age", 25);
    }

    @GetMapping("/cache/list")
    public List<Object> listDemo() {
        redisTemplate.opsForList().rightPush("queue:task", "task-1");
        return redisTemplate.opsForList().range("queue:task", 0, -1);
    }
}
```

---

## 七、Spring Cache + @Cacheable

声明式缓存，适合「读多写少」的业务查询。

### 7.1 开启缓存

```java
@SpringBootApplication
@EnableCaching
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 7.2 配置 CacheManager

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

### 7.3 注解使用

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "product", key = "#id")
    public Product findById(Long id) {
        return productRepository.findById(id).orElseThrow();
    }

    @CachePut(value = "product", key = "#product.id")
    public Product update(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = "product", key = "#id")
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @CacheEvict(value = "product", allEntries = true)
    public void clearAll() {
        // 清空 product 缓存命名空间
    }
}
```

**常用注解：**

| 注解 | 作用 |
|------|------|
| `@Cacheable` | 先查缓存，未命中再执行方法并写入缓存 |
| `@CachePut` | 始终执行方法并更新缓存 |
| `@CacheEvict` | 删除缓存 |
| `@Caching` | 组合多个缓存操作 |

---

## 八、分布式 Session 简介

多实例部署时，用户请求可能落到不同 Pod，需要把 Session 存到 Redis。

### 8.1 依赖

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

### 8.2 配置

```yaml
spring:
  session:
    store-type: redis
    timeout: 30m
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

```java
@SpringBootApplication
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class Application { }
```

### 8.3 使用

```java
@GetMapping("/login")
public String login(HttpSession session) {
    session.setAttribute("userId", 1001L);
    return "ok";
}

@GetMapping("/profile")
public Long profile(HttpSession session) {
    return (Long) session.getAttribute("userId");
}
```

Session 数据会以 `spring:session:*` 为前缀写入 Redis，各实例自动共享。

---

## 九、发布订阅（Pub/Sub）

适合广播通知（如配置刷新、在线用户提示），**不保证消息持久化**，消费者离线会丢消息。可靠消息请用 RabbitMQ / Kafka。

### 9.1 配置

```java
@Configuration
public class RedisPubSubConfig {

    public static final String CHANNEL = "order:notify";

    @Bean
    public RedisMessageListenerContainer container(
            RedisConnectionFactory factory,
            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(listenerAdapter, new ChannelTopic(CHANNEL));
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(OrderSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}
```

### 9.2 订阅者

```java
@Component
@Slf4j
public class OrderSubscriber {

    public void onMessage(String message) {
        log.info("收到订单通知: {}", message);
    }
}
```

### 9.3 发布者

```java
@Service
@RequiredArgsConstructor
public class OrderPublisher {

    private final StringRedisTemplate stringRedisTemplate;

    public void publish(String orderId) {
        stringRedisTemplate.convertAndSend("order:notify", "新订单: " + orderId);
    }
}
```

---

## 十、分布式锁（简要）

生产环境推荐 **Redisson**；简单场景可用 `SET NX`：

```java
public boolean tryLock(String key, String value, long seconds) {
    Boolean ok = stringRedisTemplate.opsForValue()
        .setIfAbsent(key, value, Duration.ofSeconds(seconds));
    return Boolean.TRUE.equals(ok);
}

public void unlock(String key, String value) {
    // 需 Lua 脚本保证「只删自己的锁」，此处略
    stringRedisTemplate.delete(key);
}
```

---

## 十一、常见坑与最佳实践

### 11.1 序列化乱码 / 反序列化失败

- **现象**：Redis 里 key 是一串乱码，或 `get` 出来类型不对
- **原因**：未统一配置 Serializer，或使用默认 JDK 序列化
- **解决**：Key 统一 `StringRedisSerializer`，Value 用 JSON 或 String

### 11.2 缓存穿透

- **现象**：查询不存在的数据，每次都打到数据库
- **解决**：缓存空值（短 TTL）、布隆过滤器、接口层校验

### 11.3 缓存击穿

- **现象**：热点 key 过期瞬间，大量请求打到 DB
- **解决**：互斥锁重建缓存、逻辑过期（不设真实 TTL，异步刷新）

### 11.4 缓存雪崩

- **现象**：大量 key 同时过期
- **解决**：TTL 加随机偏移、多级缓存、限流降级

### 11.5 大 Key / 热 Key

- 大 Key（如超大 List/Hash）会阻塞 Redis，应拆分
- 热 Key 可用本地缓存 + Redis 二级缓存

### 11.6 @Cacheable 同类调用失效

- `@Cacheable` 基于 AOP 代理，**同类内部 `this.method()` 调用不生效**
- 解决：注入自身代理、拆 Service、或用 `AopContext`

### 11.7 Key 命名规范

建议：`业务:模块:标识`，如 `user:profile:1001`，便于排查和批量清理。

### 11.8 事务

Redis 事务（`MULTI`/`EXEC`）与数据库事务不同，**不支持回滚**。复杂一致性请用 Lua 脚本。

---

## 十二、完整测试流程

1. 启动 Redis：`docker start redis`
2. 启动 Spring Boot 应用
3. 写入测试：

```bash
curl -X POST http://localhost:8080/cache/user \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"张三"}'
```

4. Redis CLI 验证：

```bash
redis-cli
> KEYS user:*
> GET user:1
```

5. 测试 `@Cacheable`：连续两次请求同一 ID，第二次应无 DB 查询日志（若开启了 SQL 日志）。

---

## 十三、小结

| 主题 | 要点 |
|------|------|
| 客户端 | Boot 3 默认 Lettuce，支持连接池 |
| 模板选择 | 纯字符串用 `StringRedisTemplate`，对象用配置好的 `RedisTemplate` |
| 序列化 | Key 用 String，Value 用 Jackson JSON |
| 声明式缓存 | `@EnableCaching` + `RedisCacheManager` + `@Cacheable` |
| Session | `spring-session-data-redis` 多实例共享登录态 |
| Pub/Sub | 轻量广播，不保证可靠投递 |
| 避坑 | 穿透/击穿/雪崩、序列化、AOP 代理、Key 规范 |

掌握以上内容，即可在 Spring Boot 3 项目中完成 Redis 的常规集成与生产级使用。
