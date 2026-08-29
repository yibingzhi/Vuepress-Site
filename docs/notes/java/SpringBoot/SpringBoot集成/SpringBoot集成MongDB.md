---
title: SpringBoot集成MongDB
createTime: 2024/11/16 21:24:12
permalink: /SpringBoot/SpringBoot集成/i27l4c1t/
---

::: tip 保鲜说明（2026-08）
面向 **Spring Boot 3.x**：使用 `spring-boot-starter-data-mongodb`；文档注解为 `org.springframework.data.mongodb.core.mapping.Document`（与 ES 的 `@Document` 包名不同，注意 import）。
:::

> 注：本文档文件名保留 **MongDB** 拼写（历史路径），内容为 **MongoDB** 集成教程。

## 一、MongoDB 简介

MongoDB 是文档型 NoSQL 数据库，数据以 **BSON** 文档形式存储在集合（Collection）中，适合：

- 结构灵活、字段频繁变更的业务
- 嵌套文档（如订单明细、用户偏好）
- 高吞吐写入（日志、行为埋点）
- 与关系型库互补（核心交易走 MySQL，画像/内容走 Mongo）

Spring Data MongoDB 提供 `MongoRepository` 和 `MongoTemplate` 两套 API。

---

## 二、环境准备

### 2.1 Docker 启动

```bash
docker run -d --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  mongo:7
```

验证：

```bash
mongosh "mongodb://admin:your_password@localhost:27017"
```

### 2.2 创建 Spring Boot 3 项目

依赖：`Spring Data MongoDB`、`Spring Web`。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

---

## 三、连接配置

### 3.1 单机 URI（推荐）

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://admin:your_password@localhost:27017/demo?authSource=admin
```

### 3.2 分项配置

```yaml
spring:
  data:
    mongodb:
      host: localhost
      port: 27017
      database: demo
      username: admin
      password: your_password
      authentication-database: admin
```

### 3.3 副本集

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://user:pass@host1:27017,host2:27017,host3:27017/demo?replicaSet=rs0
```

### 3.4 MongoDB Atlas（云）

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/demo
```

---

## 四、文档实体（@Document）

```java
package com.example.mongo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "users")
@CompoundIndex(name = "idx_dept_status", def = "{'department': 1, 'status': 1}")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;

    @Field("dept")   // 映射到 BSON 字段 dept
    private String department;

    private UserStatus status = UserStatus.ACTIVE;

    private List<String> tags;

    private Address address;

    private LocalDateTime createdAt;

    @Data
    public static class Address {
        private String city;
        private String street;
    }
}

public enum UserStatus {
    ACTIVE, DISABLED
}
```

### 4.1 常用注解

| 注解 | 作用 |
|------|------|
| `@Document` | 指定集合名，默认类名首字母小写 |
| `@Id` | 主键，类型通常为 `String`（ObjectId） |
| `@Field` | BSON 字段名映射 |
| `@Indexed` | 单字段索引 |
| `@CompoundIndex` | 复合索引（类级别） |
| `@TextIndexed` | 文本索引（全文搜索） |

### 4.2 _id 策略

- 不赋值：MongoDB 自动生成 `ObjectId`
- 自定义：业务 ID（如 UUID、雪花 ID）

```java
@Id
private String id = UUID.randomUUID().toString();
```

---

## 五、MongoRepository

```java
package com.example.mongo.repository;

import com.example.mongo.entity.User;
import com.example.mongo.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String name);

    List<User> findByDepartmentAndStatus(String department, UserStatus status);

    Page<User> findByStatus(UserStatus status, Pageable pageable);

    long countByDepartment(String department);

    void deleteByEmail(String email);

    // JSON 查询
    @Query("{ 'tags': { $in: ?0 }, 'status': 'ACTIVE' }")
    List<User> findActiveByTags(List<String> tags);

    @Query(value = "{ 'address.city': ?0 }", fields = "{ 'name': 1, 'email': 1 }")
    List<User> findNamesByCity(String city);
}
```

**派生查询关键字**与 JPA 类似：`And`、`Or`、`Between`、`In`、`Like`、`OrderBy` 等。

---

## 六、Service 层 CRUD

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User create(User user) {
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User getById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("用户不存在: " + id));
    }

    public Page<User> page(UserStatus status, Pageable pageable) {
        return userRepository.findByStatus(status, pageable);
    }

    public User update(String id, User input) {
        User user = getById(id);
        user.setName(input.getName());
        user.setDepartment(input.getDepartment());
        user.setTags(input.getTags());
        return userRepository.save(user);
    }

    public void delete(String id) {
        userRepository.deleteById(id);
    }
}
```

---

## 七、MongoTemplate + Criteria 动态查询

`MongoRepository` 适合简单 CRUD；复杂条件组合用 **Criteria**。

```java
@Service
@RequiredArgsConstructor
public class UserQueryService {

    private final MongoTemplate mongoTemplate;

    public List<User> search(UserSearchRequest req) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
            criteriaList.add(new Criteria().orOperator(
                Criteria.where("name").regex(req.getKeyword(), "i"),
                Criteria.where("email").regex(req.getKeyword(), "i")
            ));
        }
        if (req.getDepartment() != null) {
            criteriaList.add(Criteria.where("dept").is(req.getDepartment()));
        }
        if (req.getStatus() != null) {
            criteriaList.add(Criteria.where("status").is(req.getStatus()));
        }
        if (req.getTags() != null && !req.getTags().isEmpty()) {
            criteriaList.add(Criteria.where("tags").in(req.getTags()));
        }
        if (req.getCity() != null) {
            criteriaList.add(Criteria.where("address.city").is(req.getCity()));
        }
        if (req.getCreatedAfter() != null) {
            criteriaList.add(Criteria.where("createdAt").gte(req.getCreatedAfter()));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(
                criteriaList.toArray(new Criteria[0])
            ));
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.with(PageRequest.of(req.getPage(), req.getSize()));

        return mongoTemplate.find(query, User.class);
    }

    public long countByDepartment(String department) {
        Query query = Query.query(Criteria.where("dept").is(department));
        return mongoTemplate.count(query, User.class);
    }

    // 只更新部分字段
    public void updateStatus(String id, UserStatus status) {
        Query query = Query.query(Criteria.where("_id").is(id));
        Update update = new Update().set("status", status);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    // 批量插入
    public void batchInsert(List<User> users) {
        mongoTemplate.insertAll(users);
    }
}
```

### 7.1 常用 Criteria 操作符

| 操作 | 示例 |
|------|------|
| 等于 | `Criteria.where("status").is("ACTIVE")` |
| 范围 | `.gte(min).lte(max)` |
| 包含 | `.in(list)` |
| 正则 | `.regex(pattern, "i")` |
| 存在 | `.exists(true)` |
| 数组 | `.elemMatch(Criteria.where("x").is(1))` |
| 或 | `new Criteria().orOperator(c1, c2)` |
| 且 | `new Criteria().andOperator(c1, c2)` |

---

## 八、索引管理

索引对查询性能至关重要，应在设计阶段规划。

### 8.1 注解声明（见第四节）

`@Indexed`、`@CompoundIndex` 在应用启动时可自动创建（取决于配置）。

### 8.2 代码创建索引

```java
@Configuration
@RequiredArgsConstructor
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps(User.class);

        indexOps.ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
        indexOps.ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        indexOps.ensureIndex(
            new CompoundIndexDefinition(
                new org.bson.Document("dept", 1).append("status", 1)
            )
        );
        // 文本索引
        indexOps.ensureIndex(new Index().on("name", Sort.Direction.ASC)
            .named("idx_name_text")
            .partial(PartialIndexFilter.of(Criteria.where("status").is("ACTIVE"))));
    }
}
```

### 8.3 mongosh 查看索引

```javascript
use demo
db.users.getIndexes()
db.users.find({ email: "test@example.com" }).explain("executionStats")
```

### 8.4 索引设计原则

| 原则 | 说明 |
|------|------|
| 高频查询字段建索引 | `email`、`userId`、`createdAt` |
| 复合索引遵循 ESR | Equality → Sort → Range |
| 避免过多索引 | 写入会变慢 |
| 唯一索引 | 防重复，如 `email` |
| TTL 索引 | 自动过期文档（如会话、验证码） |

```java
// TTL 索引示例：文档 24 小时后自动删除
indexOps.ensureIndex(new Index().on("expireAt", Sort.Direction.ASC).expire(0));
```

---

## 九、Controller 示例

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserQueryService userQueryService;

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.create(user);
    }

    @GetMapping("/{id}")
    public User get(@PathVariable String id) {
        return userService.getById(id);
    }

    @GetMapping
    public Page<User> page(
            @RequestParam(defaultValue = "ACTIVE") UserStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return userService.page(status, pageable);
    }

    @PostMapping("/search")
    public List<User> search(@RequestBody UserSearchRequest req) {
        return userQueryService.search(req);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody User user) {
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        userService.delete(id);
    }
}
```

---

## 十一、常见问题

### 11.1 @Document 导错包

- MongoDB：`org.springframework.data.mongodb.core.mapping.Document`
- Elasticsearch：`org.springframework.data.elasticsearch.annotations.Document`

### 11.2 查询无结果

- 字段名与 BSON 不一致（检查 `@Field`）
- 枚举存成对象而非字符串（默认按枚举名存）

### 11.3 索引未生效

用 `explain()` 查看是否 `COLLSCAN`，若是则补索引。

---

## 十二、小结

| 主题 | 要点 |
|------|------|
| 依赖 | `spring-boot-starter-data-mongodb` |
| 实体 | `@Document` + `@Id` + 索引注解 |
| 简单 CRUD | `MongoRepository` 派生查询 |
| 复杂查询 | `MongoTemplate` + `Criteria` |
| 索引 | `@Indexed`、`ensureIndex`、explain 验证 |
| 聚合 | `Aggregation` 管道 |
| 事务 | 副本集 + `MongoTransactionManager` |

掌握以上内容，即可在 Spring Boot 3 中完成 MongoDB 的常规集成与查询优化。
