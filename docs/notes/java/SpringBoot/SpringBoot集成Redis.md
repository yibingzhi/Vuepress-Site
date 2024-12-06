---
title: SpringBoot集成Redis
createTime: 2024/11/16 21:20:17
permalink: /SpringBoot/iyhb8605/
---
以下是一份Spring Boot集成Redis的笔记，涵盖了从基础配置到常用操作等方面的内容，希望对你有所帮助：

### 一、前提准备
- **安装Redis**：
    - 根据你的操作系统，下载并安装Redis。例如在Linux系统下，可以通过源码编译安装或者使用包管理工具（如apt-get、yum等）进行安装；在Windows系统下，可以下载微软官方维护的Redis安装包进行安装。安装完成后启动Redis服务，确保其正常运行，默认监听端口是6379。

### 二、创建Spring Boot项目
- 可以使用Spring Initializr（如通过`https://start.spring.io/`网站）创建一个基础的Spring Boot项目，选择相应的依赖，至少要包含`Spring Data Redis`依赖，用于操作Redis，同时按需选择如`Spring Web`（方便后续做接口测试等）等其他依赖，然后将项目导入到开发工具中。

### 三、添加依赖
- **Maven项目（`pom.xml`）**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
- **Gradle项目（`build.gradle`）**：
```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

### 四、配置文件添加Redis配置
- **`application.properties`配置示例**：
```properties
spring.data.redis.host=127.0.0.1  # Redis服务的IP地址，如果是本地就是127.0.0.1，若是远程服务器则填写对应IP
spring.data.redis.port=6379  # Redis监听的端口，默认6379
spring.data.redis.password=  # 如果Redis设置了密码，在此填写密码，没有则留空
spring.data.redis.database=0  # 选择要使用的数据库编号，Redis默认有16个数据库，编号从0到15
```
- **`application.yml`配置示例（推荐使用，格式更清晰）**：
```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      database: 0
      port: 6379
      password: redis
```

### 五、配置Redis连接相关（可选项，用于自定义配置）
- 创建一个配置类（比如`RedisConfig.java`）来配置Redis连接，以下是一个简单示例（配置连接池等情况）：
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    // 配置RedisTemplate，用于操作Redis
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        // 设置key的序列化方式为String类型
        template.setKeySerializer(new StringRedisSerializer());
        // 设置value的序列化方式为JSON序列化，方便存储对象等复杂数据类型
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```
在上述配置中：

自定义`RedisTemplate`，它是Spring Data Redis提供的操作Redis的核心类，对Redis的常用操作（如存取值、操作哈希等）基本都通过它来完成。设置了合适的序列化方式，`StringRedisSerializer`用于序列化键（key），`GenericJackson2JsonRedisSerializer`用于序列化值（value），这样可以方便地存储和读取对象等复杂数据类型到Redis中。

### 六、常用操作示例
- **注入RedisTemplate进行操作（在某个服务类或控制器类中）**：
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
public class RedisExampleController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 示例：往Redis中存值
    @GetMapping("/set")
    public String setValue() {
        redisTemplate.opsForValue().set("myKey", "myValue");
        return "Value set successfully";
    }

    // 示例：从Redis中取值
    @GetMapping("/get")
    public Object getValue() {
        return redisTemplate.opsForValue().get("myKey");
    }

    // 示例：设置带有过期时间的值（比如设置过期时间为60秒）
    @GetMapping("/setWithExpire")
    public String setValueWithExpire() {
        redisTemplate.opsForValue().set("expireKey", "expireValue", 60, TimeUnit.SECONDS);
        return "Value with expire set successfully";
    }

    // 示例：操作哈希类型数据（往哈希中存值）
    @GetMapping("/hset")
    public String hsetValue() {
        redisTemplate.opsForHash().put("myHash", "field1", "value1");
        return "Hash value set successfully";
    }

    // 示例：从哈希中取值
    @GetMapping("/hget")
    public Object hgetValue() {
        return redisTemplate.opsForHash().get("myHash", "field1");
    }
}
```
在上述代码中：
- 通过`@Autowired`注入`RedisTemplate`，然后使用它的不同操作方法来演示对Redis的常见操作：
    - `opsForValue()`方法用于操作字符串类型的值，像`set`方法用于设置键值对，`get`方法用于获取对应键的值，还可以设置带有过期时间的值等操作。
    - `opsForHash()`方法用于操作哈希类型的数据，`put`方法可以往哈希中添加字段和对应的值，`get`方法用于获取哈希中指定字段的值等。

### 七、测试
- 启动Spring Boot项目后，可以通过浏览器或者工具（如Postman等）访问对应的接口地址（如`/set`、`/get`等）来测试Redis的集成是否成功，查看返回结果以及在Redis客户端中查看相应的数据是否正确存储和获取等情况。

以上就是Spring Boot集成Redis的基本笔记内容，你可以根据实际项目需求进一步拓展，例如利用Redis实现缓存、分布式锁等功能，这些都会基于上述的基础集成配置和操作来进行拓展应用。 