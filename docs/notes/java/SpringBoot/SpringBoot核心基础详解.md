---
title: SpringBoot核心基础详解
createTime: 2025/08/16 19:51:56
permalink: /SpringBoot/pj3a7zam/
---


## Spring Boot 简介

Spring Boot 是由 Pivotal 团队提供的全新框架，其设计目的是用来简化新 Spring
应用的初始搭建以及开发过程。该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。

### Spring Boot 的优势

1. **自动配置**：Spring Boot 会根据添加的 jar 依赖自动配置应用程序
2. **起步依赖**：简化 Maven 配置，提供一站式依赖引入
3. **内嵌服务器**：内嵌 Tomcat、Jetty 或 Undertow，无需部署 WAR 文件
4. **生产就绪**：提供生产就绪功能，如指标、健康检查和外部化配置
5. **无代码生成**：不需要任何代码生成和 XML 配置

### Spring Boot 核心注解

- `@SpringBootApplication`：核心注解，组合了以下三个注解：
    - `@Configuration`：标识该类为配置类
    - `@EnableAutoConfiguration`：启用自动配置
    - `@ComponentScan`：启用组件扫描

## Spring Boot 核心特性

### 1. 自动配置（Auto Configuration）

Spring Boot 自动配置会尝试根据添加的 jar 依赖自动配置应用程序。例如，如果 `spring-boot-starter-web` 在 classpath 中，Spring
Boot 会自动配置 Tomcat 和 Spring MVC。

### 2. 起步依赖（Starter Dependencies）

Spring Boot 提供了一系列起步依赖，这些依赖将开发过程中常用的库组合在一起，简化了 Maven 或 Gradle 配置。

### 3. 内嵌服务器

Spring Boot 内嵌了 Tomcat、Jetty 和 Undertow 服务器，无需部署 WAR 文件。

### 4. 生产就绪特性

Spring Boot 提供了健康检查、审计、指标收集等生产就绪特性。

## Spring Boot 项目结构

典型的 Spring Boot 项目结构如下：

```
src
├── main
│   ├── java
│   │   └── com
│   │       └── example
│   │           └── demo
│   │               ├── DemoApplication.java
│   │               ├── controller
│   │               ├── service
│   │               ├── repository
│   │               └── model
│   └── resources
│       ├── application.properties
│       ├── static
│       └── templates
└── test
    └── java
        └── com
            └── example
                └── demo
                    └── DemoApplicationTests.java
```

### 主要组成部分

1. **入口类**：使用 `@SpringBootApplication` 注解的主类
2. **配置文件**：application.properties 或 application.yml
3. **业务代码**：controller、service、repository 等分层结构
4. **静态资源**：static 目录下的静态文件
5. **模板文件**：templates 目录下的模板文件

## Spring Boot 自动配置原理

### @EnableAutoConfiguration 注解

`@EnableAutoConfiguration` 是自动配置的核心注解，它会根据类路径中的 jar 包依赖自动配置 Spring 应用。

### 自动配置过程

1. Spring Boot 应用启动时会从 `META-INF/spring.factories` 文件中加载 `EnableAutoConfiguration` 对应的配置类
2. 通过 `@Conditional` 注解判断是否需要加载配置类
3. 如果条件满足，则将配置类加载到 Spring 容器中

### 常见的自动配置类

- `DispatcherServletAutoConfiguration`：自动配置 Spring MVC
- `DataSourceAutoConfiguration`：自动配置数据源
- `HibernateJpaAutoConfiguration`：自动配置 Hibernate JPA
- `RedisAutoConfiguration`：自动配置 Redis

### 条件注解

Spring Boot 提供了许多条件注解用于控制配置类的加载：

- `@ConditionalOnClass`：当类路径下有指定类时条件满足
- `@ConditionalOnMissingClass`：当类路径下没有指定类时条件满足
- `@ConditionalOnBean`：当容器中有指定 Bean 时条件满足
- `@ConditionalOnMissingBean`：当容器中没有指定 Bean 时条件满足
- `@ConditionalOnProperty`：当配置文件中有指定属性时条件满足

## Spring Boot 启动流程

### SpringApplication.run() 方法

Spring Boot 应用的启动入口是 `SpringApplication.run()` 方法：

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 启动流程详解

1. **创建 SpringApplication 对象**
    - 推断应用类型（Web、非 Web 等）
    - 加载所有 `ApplicationContextInitializer`
    - 加载所有 `ApplicationListener`
    - 推断主配置类

2. **执行 run 方法**
    - 记录应用启动时间
    - 创建并配置 Environment
    - 打印 Banner
    - 创建 ApplicationContext
    - 准备 ApplicationContext
    - 刷新 ApplicationContext
    - 执行 CommandLineRunner

### SpringApplicationRunListener

Spring Boot 通过 `SpringApplicationRunListener` 接口监听应用启动过程中的各个阶段：

- starting：应用刚启动
- environmentPrepared：Environment 准备完成
- contextPrepared：ApplicationContext 准备完成
- contextLoaded：ApplicationContext 加载完成
- started：应用启动完成
- running：应用正在运行
- failed：应用启动失败

## Spring Boot 配置文件

Spring Boot 支持两种格式的配置文件：`.properties` 和 `.yml`。

### application.properties

```properties
# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# 日志配置
logging.level.com.example=DEBUG
logging.file.name=app.log
```

### application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver

logging:
  level:
    com.example: DEBUG
  file:
    name: app.log
```

### 配置文件加载顺序

1. `./config/application.properties`
2. `./application.properties`
3. `classpath:/config/application.properties`
4. `classpath:/application.properties`

### 多环境配置

通过 `spring.profiles.active` 属性激活不同的配置文件：

```properties
# application.properties
spring.profiles.active=dev

# application-dev.properties
server.port=8080

# application-prod.properties
server.port=80
```

### 配置属性绑定

使用 `@ConfigurationProperties` 注解将配置属性绑定到 Bean：

```java
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private int port;
    // getters and setters
}
```

## Spring Boot Starter

Starter 是一组依赖描述符，可以包含许多相关的依赖，并且可以传递依赖。

### 官方 Starter

- `spring-boot-starter-web`：构建 Web 应用，包括 RESTful
- `spring-boot-starter-data-jpa`：使用 Hibernate JPA 构建数据库应用
- `spring-boot-starter-security`：使用 Spring Security
- `spring-boot-starter-test`：测试 Spring Boot 应用
- `spring-boot-starter-actuator`：生产就绪功能

### 自定义 Starter

创建自定义 Starter 的步骤：

1. 创建配置类
2. 创建自动配置类
3. 在 `META-INF/spring.factories` 中注册自动配置类

```properties
# META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.autoconfigure.MyAutoConfiguration
```

## Spring Boot Actuator

Spring Boot Actuator 提供了生产就绪的功能，帮助监控和管理应用。

### 常用端点

- `/actuator/health`：健康检查
- `/actuator/info`：应用信息
- `/actuator/metrics`：指标信息
- `/actuator/env`：环境信息
- `/actuator/loggers`：日志配置
- `/actuator/beans`：Bean 信息

### 配置 Actuator

```properties
# 启用所有端点
management.endpoints.web.exposure.include=*

# 自定义 info 信息
info.app.name=My Application
info.app.version=1.0.0
```

## Spring Boot 测试

Spring Boot 提供了强大的测试支持。

### @SpringBootTest

`@SpringBootTest` 是 Spring Boot 测试的核心注解：

```java
@SpringBootTest
class DemoApplicationTests {
    @Test
    void contextLoads() {
    }
}
```

### 测试切片

- `@WebMvcTest`：测试 Spring MVC 控制器
- `@DataJpaTest`：测试 JPA 组件
- `@JsonTest`：测试 JSON 序列化
- `@RestClientTest`：测试 REST 客户端

### MockMvc 测试

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void shouldReturnUser() throws Exception {
        // 测试代码
    }
}
```

## Spring Boot 打包部署

### Maven 打包

```xml

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### 运行打包后的应用

```bash
# 打包
mvn clean package

# 运行
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Docker 部署

```dockerfile
FROM openjdk:11-jre-slim
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 最佳实践

### 1. 项目结构设计

遵循分层架构设计：

```
com.example.myapp
├── config
├── controller
├── service
│   ├── impl
├── repository
├── model
├── dto
└── exception
```

### 2. 配置管理

- 使用配置文件分离不同环境的配置
- 敏感信息使用环境变量或外部配置
- 使用 `@ConfigurationProperties` 绑定配置属性

### 3. 异常处理

- 使用 `@ControllerAdvice` 进行全局异常处理
- 定义统一的错误响应格式
- 合理分类和处理不同类型的异常

### 4. 日志配置

```properties
# 日志级别配置
logging.level.com.example=INFO
logging.level.org.springframework= WARN

# 日志文件配置
logging.file.name=logs/app.log
logging.logback.rollingpolicy.max-file-size=10MB
```

### 5. 性能优化

- 合理使用缓存
- 数据库连接池配置
- 异步处理耗时操作
- 启用 GZIP 压缩

### 6. 安全性

- 使用 Spring Security
- 防止 SQL 注入
- 验证输入参数
- 使用 HTTPS
