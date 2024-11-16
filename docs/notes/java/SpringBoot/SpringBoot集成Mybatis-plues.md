---
title: SpringBoot集成Mybatis-plues
createTime: 2024/11/16 21:33:20
permalink: /SpringBoot/n34uuc8k/
---
MyBatis-Plus 是 MyBatis 的增强工具，旨在简化开发、提高效率。它提供了许多开箱即用的功能，如 CRUD 接口、分页插件、代码生成器等。在 Spring Boot 项目中集成 MyBatis-Plus 可以帮助您更高效地进行数据库操作。以下是一个关于在 Spring Boot 项目中集成 MyBatis-Plus 的详细教程。

### 一、准备工作

1. **创建一个 Spring Boot 项目**。您可以使用 Spring Initializr 创建一个新的 Spring Boot 项目，并选择以下依赖：

   - Spring Web
   - MySQL Driver（如果使用 MySQL 数据库）

2. **准备数据库**。确保您有一个可用的数据库，并创建必要的表。

### 二、添加 MyBatis-Plus 依赖

在 `pom.xml` 文件中添加 MyBatis-Plus 的依赖：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version> <!-- 确保使用最新版本 -->
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

如果使用 Gradle，请在 `build.gradle` 中添加：

```groovy
implementation 'com.baomidou:mybatis-plus-boot-starter:3.5.3.1' // 确保使用最新版本
runtimeOnly 'mysql:mysql-connector-java'
```

### 三、配置数据库连接

在 `application.properties` 或 `application.yml` 中配置数据库的连接信息：

**application.properties**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydatabase
spring.datasource.username=myuser
spring.datasource.password=mypassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# MyBatis-Plus 配置
mybatis-plus.configuration.map-underscore-to-camel-case=true
```

**application.yml**

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydatabase
    username: myuser
    password: mypassword
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
```

### 四、创建实体类

定义一个 Java 类来表示数据库中的表。

```java
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("user")
public class User {

    @TableId
    private Long id;
    private String name;
    private String email;

    // getters and setters
}
```

### 五、创建 Mapper 接口

定义一个 Mapper 接口，继承自 MyBatis-Plus 提供的 `BaseMapper` 接口。

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 可以定义自定义的 SQL 方法
}
```

### 六、使用 Mapper 进行数据库操作

在服务类中注入 Mapper 接口，并使用它来执行数据库操作。

```java
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }

    public void createUser(User user) {
        userMapper.insert(user);
    }

    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

### 七、创建控制器

创建一个控制器来提供用户信息的端点。

```java
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public void createUser(@RequestBody User user) {
        userService.createUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
```

### 八、测试 MyBatis-Plus 集成

启动 Spring Boot 应用程序，并通过以下端点测试 MyBatis-Plus 集成：

- 获取用户信息：`GET /api/users/{id}`
- 获取所有用户：`GET /api/users`
- 创建用户：`POST /api/users`
- 删除用户：`DELETE /api/users/{id}`

通过这个教程，您可以在 Spring Boot 项目中集成 MyBatis-Plus，并利用其增强功能来简化数据库操作。根据您的具体需求，您可以进一步探索 MyBatis-Plus 的高级特性，如分页插件、逻辑删除和自动填充等。