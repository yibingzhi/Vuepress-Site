---
title: SpringBoot集成Mybatis
createTime: 2024/11/16 21:30:40
permalink: /SpringBoot/4ik18wj3/
---
在 Spring Boot 中集成 MyBatis 是一个常见的任务，特别是在需要与关系型数据库交互的应用中。MyBatis 是一个优秀的持久层框架，提供了良好的 SQL 映射支持。以下是一个关于在 Spring Boot 项目中集成 MyBatis 的详细教程。

### 一、准备工作

1. **创建一个 Spring Boot 项目**。您可以使用 Spring Initializr 创建一个新的 Spring Boot 项目，并选择以下依赖：

   - Spring Web
   - MyBatis Framework
   - MySQL Driver（如果使用 MySQL 数据库）

2. **准备数据库**。确保您有一个可用的数据库，并创建必要的表。

### 二、添加 MyBatis 依赖

在 `pom.xml` 文件中添加 MyBatis 的依赖（如果使用 Maven）：

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.1</version> <!-- 确保使用最新版本 -->
</dependency>
```

如果使用 Gradle，请在 `build.gradle` 中添加：

```groovy
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.1' // 确保使用最新版本
```

### 三、配置数据库连接

在 `application.properties` 或 `application.yml` 中配置数据库的连接信息：

**application.properties**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydatabase
spring.datasource.username=myuser
spring.datasource.password=mypassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

**application.yml**

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydatabase
    username: myuser
    password: mypassword
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 四、创建实体类

定义一个 Java 类来表示数据库中的表。

```java
public class User {
    private Long id;
    private String name;
    private String email;

    // getters and setters
}
```

### 五、创建 MyBatis 映射文件

创建一个 MyBatis 映射文件，用于定义 SQL 语句。通常，这些文件位于 `resources` 目录下。

**UserMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.UserMapper">

    <select id="findById" resultType="com.example.demo.model.User">
        SELECT * FROM users WHERE id = #{id}
    </select>

    <insert id="insertUser" parameterType="com.example.demo.model.User">
        INSERT INTO users (name, email) VALUES (#{name}, #{email})
    </insert>

</mapper>
```

### 六、创建 Mapper 接口

定义一个 Mapper 接口，用于与 MyBatis 映射文件交互。

```java
import com.example.demo.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findById(@Param("id") Long id);
    void insertUser(User user);
}
```

### 七、使用 Mapper 进行数据库操作

在服务类中注入 Mapper 接口，并使用它来执行数据库操作。

```java
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public User getUserById(Long id) {
        return userMapper.findById(id);
    }

    public void createUser(User user) {
        userMapper.insertUser(user);
    }
}
```

### 八、创建控制器

创建一个控制器来提供用户信息的端点。

```java
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public void createUser(@RequestBody User user) {
        userService.createUser(user);
    }
}
```

### 九、测试 MyBatis 集成

启动 Spring Boot 应用程序，并通过以下端点测试 MyBatis 集成：

- 获取用户信息：`GET /api/users/{id}`
- 创建用户：`POST /api/users`

通过这个教程，您可以在 Spring Boot 项目中集成 MyBatis，并利用其强大的 SQL 映射功能来处理数据库交互。根据您的具体需求，您可以进一步探索 MyBatis 的高级特性，如动态 SQL、缓存和插件等。