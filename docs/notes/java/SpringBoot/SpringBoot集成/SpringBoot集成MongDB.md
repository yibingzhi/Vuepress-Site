---
title: SpringBoot集成MongDB
createTime: 2024/11/16 21:24:12
permalink: /SpringBoot/SpringBoot集成/i27l4c1t/
---

### 一、准备工作

1. **确保 MongoDB 服务器已经安装并运行**。您可以通过在本地安装 MongoDB，或者使用云服务提供的 MongoDB 实例（例如 MongoDB
   Atlas）。

2. **创建一个 Spring Boot 项目**。您可以使用 Spring Initializr 创建一个新的 Spring Boot 项目，并选择以下依赖：

    - Spring Web
    - Spring Data MongoDB

### 二、配置 MongoDB

#### 1. 添加依赖

在 `pom.xml` 文件中添加 Spring Data MongoDB 的依赖（如果使用 Maven）：

```xml

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

如果使用 Gradle，请在 `build.gradle` 中添加：

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
```

#### 2. 配置 MongoDB 连接

在 `application.properties` 或 `application.yml` 中配置 MongoDB 的连接信息：

**application.properties**

```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=mydatabase
```

**application.yml**

```yaml
spring:
  data:
    mongodb:
      host: localhost
      port: 27017
      database: mydatabase
```

### 三、创建 MongoDB 实体

定义一个 Java 类来表示 MongoDB 中的文档。使用 `@Document` 注解来标识该类是一个 MongoDB 文档。

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String email;

    // getters and setters
}
```

### 四、创建仓库接口

Spring Data MongoDB 提供了类似 JPA 的仓库接口，用于简化数据库操作。

```java
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByName(String name);
}
```

### 五、使用仓库进行数据库操作

在服务类中注入仓库接口，并使用它来执行数据库操作。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
```

### 六、测试 MongoDB 集成

创建一个简单的控制器来测试 MongoDB 集成。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }
}
```

通过访问 `/api/users` 相关的端点，您可以测试对 MongoDB 的基本 CRUD 操作。

### 七、使用 MongoTemplate

除了使用仓库接口，Spring Data MongoDB 还提供了 `MongoTemplate`，用于执行更复杂的查询和操作。

#### 配置 `MongoTemplate`

通常情况下，Spring Boot 会自动配置 `MongoTemplate`，您可以直接注入使用：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class CustomMongoService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<User> findUsersByCustomQuery(String email) {
        Query query = new Query();
        query.addCriteria(Criteria.where("email").is(email));
        return mongoTemplate.find(query, User.class);
    }
}
```
