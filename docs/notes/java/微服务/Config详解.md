---
title: SpringCloud Config详解
createTime: 2025/08/16 14:57:46
permalink: /微服务/hnxe8low/
---

## 什么是SpringCloud Config

SpringCloud Config是一个分布式配置管理工具，为微服务架构中的微服务提供集中化的外部配置支持。它分为服务端和客户端两部分，服务端也称为分布式配置中心，是一个独立的微服务应用。

### 主要特性

- **集中配置管理**：统一管理所有微服务的配置
- **环境隔离**：支持开发、测试、生产等不同环境
- **配置热更新**：支持配置的动态刷新
- **加密解密**：支持敏感配置的加密存储
- **版本管理**：支持配置的版本控制和回滚
- **高可用**：支持集群部署和故障转移

## 核心概念

### 1. 配置中心（Config Server）

- 集中存储配置信息的服务
- 支持多种配置源（Git、SVN、本地文件等）
- 提供REST API供客户端获取配置

### 2. 配置客户端（Config Client）

- 从配置中心获取配置的微服务
- 支持配置的热更新
- 支持配置的本地缓存

### 3. 配置源（Config Repository）

- 存储配置信息的仓库
- 支持Git、SVN、本地文件等
- 支持分支、标签等版本管理

## 快速开始

### 1. 创建配置中心服务

#### 添加依赖

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

#### 配置文件

```yaml
# application.yml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo
          default-label: main
          search-paths: config
          username: your-username
          password: your-token
        native:
          search-locations: classpath:/config
```

#### 启动类

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

### 2. 创建配置仓库

```bash
# 创建Git仓库
mkdir config-repo
cd config-repo

# 创建配置文件
mkdir config
cd config

# 创建应用配置文件
echo "spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test
    username: root
    password: password
  redis:
    host: localhost
    port: 6379" > user-service-dev.yml

echo "spring:
  datasource:
    url: jdbc:mysql://test-server:3306/test
    username: test_user
    password: test_pass
  redis:
    host: test-redis
    port: 6379" > user-service-test.yml

echo "spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/prod
    username: prod_user
    password: prod_pass
  redis:
    host: prod-redis
    port: 6379" > user-service-prod.yml

# 提交到Git
git init
git add .
git commit -m "Initial config files"
git remote add origin https://github.com/your-username/config-repo.git
git push -u origin main
```

### 3. 创建配置客户端

#### 添加依赖

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

#### 配置文件

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  cloud:
    config:
      uri: http://localhost:8888
      label: main
      profile: dev
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
```

#### 启动类

```java
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

#### 使用配置

```java
@RestController
@RequestMapping("/user")
@RefreshScope
public class UserController {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.redis.host}")
    private String redisHost;
    
    @GetMapping("/config")
    public Map<String, String> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("database", dbUrl);
        config.put("redis", redisHost);
        return config;
    }
}
```

## 配置管理

### 1. 配置文件命名规则

```
{application}-{profile}.yml
{application}-{profile}.properties
{application}-{profile}.json
```

### 2. 配置优先级

```
1. 命令行参数
2. JNDI属性
3. Java系统属性
4. 操作系统环境变量
5. 配置文件
6. 默认值
```

### 3. 配置刷新

```java
// 手动刷新配置
@PostMapping("/refresh")
public String refresh() {
    // 调用配置中心的刷新端点
    return "配置已刷新";
}

// 自动刷新配置
@RefreshScope
@Component
public class DatabaseConfig {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUsername;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    // 配置变化时会自动重新创建Bean
}
```

### 4. 配置加密

```yaml
# 配置加密密钥
encrypt:
  key: my-secret-key

# 加密配置
spring:
  datasource:
    password: '{cipher}AQA...'  # 加密后的密码
```

## 加密解密

### 1. 配置加密密钥

```yaml
# application.yml
encrypt:
  key: my-secret-key-12345
  key-store:
    location: classpath:/keystore.jks
    password: keystore-password
    alias: mykey
    secret: my-secret
```

### 2. 加密端点

```bash
# 加密
curl -X POST "http://localhost:8888/encrypt" -d "my-password"

# 解密
curl -X POST "http://localhost:8888/decrypt" -d "AQA..."
```

### 3. 使用加密配置

```yaml
# 在配置文件中使用加密值
spring:
  datasource:
    password: '{cipher}AQA...'
  redis:
    password: '{cipher}AQA...'
```

## 高可用配置

### 1. 配置中心集群

```yaml
# 配置中心1
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo
          default-label: main
        health:
          repositories:
            user-service:
              label: main
              name: user-service
              profiles: dev

# 配置中心2
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo
          default-label: main
        health:
          repositories:
            user-service:
              label: main
              name: user-service
              profiles: dev
```

### 2. 客户端高可用配置

```yaml
# bootstrap.yml
spring:
  cloud:
    config:
      uri: http://config-server1:8888,http://config-server2:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
```

### 3. 负载均衡配置

```yaml
# 使用Eureka进行服务发现
spring:
  cloud:
    config:
      discovery:
        enabled: true
        service-id: config-server
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

## SpringBoot集成

### 1. 配置中心服务端

```java
@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}

@RestController
@RequestMapping("/config")
public class ConfigController {
    
    @Autowired
    private EnvironmentRepository repository;
    
    @GetMapping("/{application}/{profile}/{label}")
    public ResponseEntity<String> getConfig(
            @PathVariable String application,
            @PathVariable String profile,
            @PathVariable String label) {
        
        Environment env = repository.findOne(application, profile, label);
        return ResponseEntity.ok(env.toString());
    }
}
```

### 2. 配置客户端

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/user")
@RefreshScope
public class UserController {
    
    @Autowired
    private Environment env;
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("database", dbUrl);
        config.put("profile", env.getActiveProfiles()[0]);
        return config;
    }
    
    @PostMapping("/refresh")
    public String refresh() {
        // 手动刷新配置
        return "配置已刷新";
    }
}
```

### 3. 配置监听

```java
@Component
public class ConfigChangeListener {
    
    @EventListener
    public void onRefreshEvent(RefreshScopeRefreshedEvent event) {
        System.out.println("配置已刷新: " + event.getSource());
    }
    
    @EventListener
    public void onEnvironmentChangeEvent(EnvironmentChangeEvent event) {
        System.out.println("环境配置变化: " + event.getKeys());
    }
}
```

## 最佳实践

### 1. 配置文件组织

```
config-repo/
├── config/
│   ├── user-service/
│   │   ├── user-service-dev.yml
│   │   ├── user-service-test.yml
│   │   └── user-service-prod.yml
│   ├── order-service/
│   │   ├── order-service-dev.yml
│   │   ├── order-service-test.yml
│   │   └── order-service-prod.yml
│   └── common/
│       ├── common-dev.yml
│       ├── common-test.yml
│       └── common-prod.yml
```

### 2. 配置分层

```yaml
# 公共配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

# 环境特定配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dev
    username: dev_user
    password: dev_pass

# 应用特定配置
user:
  service:
    timeout: 5000
    retry-count: 3
```

### 3. 配置验证

```java
@ConfigurationProperties(prefix = "user.service")
@Data
@Validated
public class UserServiceProperties {
    
    @Min(1000)
    @Max(10000)
    private int timeout = 5000;
    
    @Min(1)
    @Max(10)
    private int retryCount = 3;
    
    @NotBlank
    private String apiUrl;
}
```

### 4. 配置监控

```java
@Component
public class ConfigMonitor {
    
    @EventListener
    public void onRefreshEvent(RefreshScopeRefreshedEvent event) {
        // 记录配置刷新事件
        log.info("配置已刷新: {}", event.getSource());
    }
    
    @EventListener
    public void onEnvironmentChangeEvent(EnvironmentChangeEvent event) {
        // 记录环境变化事件
        log.info("环境配置变化: {}", event.getKeys());
    }
    
    @Scheduled(fixedRate = 60000) // 每分钟检查一次
    public void checkConfigHealth() {
        // 检查配置中心健康状态
        try {
            // 调用配置中心健康检查端点
            log.info("配置中心健康状态检查通过");
        } catch (Exception e) {
            log.error("配置中心健康状态检查失败", e);
        }
    }
}
```

## 常见问题

### 1. 配置无法获取

```yaml
# 问题：配置客户端无法获取配置
# 解决方案：检查配置中心地址和配置文件名

spring:
  cloud:
    config:
      uri: http://localhost:8888  # 确保配置中心地址正确
      name: user-service          # 确保应用名称正确
      profile: dev                # 确保环境配置正确
      label: main                 # 确保分支名称正确
```

### 2. 配置刷新不生效

```java
// 问题：配置刷新后不生效
// 解决方案：添加@RefreshScope注解

@RefreshScope
@Component
public class DatabaseConfig {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    // 配置变化时会自动重新创建Bean
}

// 或者手动刷新
@PostMapping("/refresh")
public String refresh() {
    // 调用配置中心的刷新端点
    return "配置已刷新";
}
```

### 3. 加密配置问题

```yaml
# 问题：加密配置无法解密
# 解决方案：检查加密密钥和加密值格式

encrypt:
  key: my-secret-key-12345  # 确保加密密钥正确

spring:
  datasource:
    password: '{cipher}AQA...'  # 确保加密值格式正确
```

### 4. 高可用问题

```yaml
# 问题：配置中心单点故障
# 解决方案：配置多个配置中心

spring:
  cloud:
    config:
      uri: http://config-server1:8888,http://config-server2:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
```
