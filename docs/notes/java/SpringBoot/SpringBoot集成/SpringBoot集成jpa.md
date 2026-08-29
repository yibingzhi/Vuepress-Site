---
title: SpringBoot集成jpa
createTime: 2024/11/16 21:31:15
permalink: /SpringBoot/SpringBoot集成/doixt2s0/
---

::: tip 保鲜说明（2026-08）
面向 **Spring Boot 3**：包名用 `jakarta.persistence.*`（非 `javax`），MySQL 驱动用 `com.mysql:mysql-connector-j`，驱动类 `com.mysql.cj.jdbc.Driver`。
:::

## 一、JPA 是什么

**JPA（Java Persistence API）** 是 Java ORM 规范，实现者最常见的是 **Hibernate**。Spring Data JPA 在 JPA 之上封装了 Repository 层，让你用接口 + 方法名即可 CRUD，无需写大量 SQL。

典型技术栈：

```
Spring Boot 3 + Spring Data JPA + Hibernate + MySQL 8 + jakarta.persistence
```

---

## 二、创建项目与依赖

### 2.1 Initializr 依赖

- Spring Web
- Spring Data JPA
- MySQL Driver（或 H2 用于本地测试）

### 2.2 pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- 本地快速测试可用 H2 -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## 三、数据库配置

### 3.1 MySQL（推荐生产）

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update        # 开发用 update；生产建议 validate 或 none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
```

**`ddl-auto` 取值：**

| 值 | 说明 |
|----|------|
| `create` | 每次启动删表重建（危险） |
| `create-drop` | 启动创建，关闭删除 |
| `update` | 根据实体变更表结构（开发方便） |
| `validate` | 只校验，不改表（生产推荐） |
| `none` | 不做任何 DDL |

### 3.2 H2 内存库（单元测试）

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=MySQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

## 四、实体（Entity）

实体类映射数据库表，注解来自 **`jakarta.persistence.*`**。

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_user", indexes = {
    @Index(name = "idx_email", columnList = "email")
})
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

```java
public enum UserStatus {
    ACTIVE, DISABLED
}
```

### 4.1 常用实体注解

| 注解 | 作用 |
|------|------|
| `@Entity` | 声明 JPA 实体 |
| `@Table` | 指定表名、索引、唯一约束 |
| `@Id` | 主键 |
| `@GeneratedValue` | 主键生成策略 |
| `@Column` | 列属性：非空、长度、唯一 |
| `@Enumerated` | 枚举映射（推荐 STRING） |
| `@Temporal` | 旧版日期类型（Java 8+ 优先 `LocalDateTime`） |
| `@OneToMany` / `@ManyToOne` | 关联关系 |

### 4.2 关联示例（一对多）

```java
@Entity
@Getter @Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
```

> **懒加载陷阱**：`FetchType.LAZY` 在事务外访问关联对象会报 `LazyInitializationException`，需在 Service 层事务内访问，或用 `@Transactional(readOnly = true)` + DTO 投影。

---

## 五、Repository 接口

```java
package com.example.demo.repository;

import com.example.demo.entity.User;
import com.example.demo.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    // 方法名派生查询
    Optional<User> findByEmail(String email);

    List<User> findByNameContainingAndStatus(String name, UserStatus status);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);
}
```

**派生查询关键字：**

| 关键字 | 示例 | 生成 SQL 语义 |
|--------|------|--------------|
| `findBy` | `findByName` | `WHERE name = ?` |
| `Containing` | `findByNameContaining` | `LIKE %?%` |
| `Between` | `findByCreatedAtBetween` | `BETWEEN ? AND ?` |
| `OrderBy` | `findByStatusOrderByCreatedAtDesc` | `ORDER BY created_at DESC` |
| `Top` / `First` | `findTop10ByOrderByIdDesc` | `LIMIT 10` |

---

## 六、JPQL 与原生 SQL

### 6.1 JPQL（面向实体）

```java
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.status = :status AND u.name LIKE %:keyword%")
    List<User> searchByStatus(@Param("status") UserStatus status,
                              @Param("keyword") String keyword);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") UserStatus status);
}
```

> `@Modifying` 用于 UPDATE/DELETE，必须配合 `@Transactional`。

### 6.2 原生 SQL

```java
@Query(value = "SELECT * FROM t_user WHERE email = ?1", nativeQuery = true)
Optional<User> findByEmailNative(String email);
```

原生 SQL 适合复杂统计、多表 JOIN；简单 CRUD 优先方法名或 JPQL。

---

## 七、Specification 动态查询

适合「条件可选」的列表筛选（如后台管理搜索）。

```java
public class UserSpecs {

    public static Specification<User> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(root.get("name"), "%" + keyword + "%");
        };
    }

    public static Specification<User> hasStatus(UserStatus status) {
        return (root, query, cb) ->
            status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
```

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<User> search(String keyword, UserStatus status, Pageable pageable) {
        Specification<User> spec = Specification
            .where(UserSpecs.hasKeyword(keyword))
            .and(UserSpecs.hasStatus(status));
        return userRepository.findAll(spec, pageable);
    }
}
```

---

## 八、分页与排序

### 8.1 Repository 分页

```java
Page<User> findByStatus(UserStatus status, Pageable pageable);
```

### 8.2 Controller 接收分页参数

```java
@GetMapping("/users")
public Page<User> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

    Pageable pageable = PageRequest.of(page, size, Sort.by(parseSort(sort)));
    return userService.findAll(pageable);
}
```

### 8.3 返回 JSON 结构

```json
{
  "content": [ { "id": 1, "name": "张三" } ],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10
}
```

### 8.4 避免分页 + fetch join 的 count 问题

`@Query` 中 `JOIN FETCH` 与 `Pageable` 同用时，Hibernate 可能生成错误 count。可拆成两次查询，或用 `@EntityGraph`。

---

## 九、事务（@Transactional）

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order createOrder(Long userId, CreateOrderRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("用户不存在"));

        Order order = new Order();
        order.setUser(user);
        order.setOrderNo(generateOrderNo());
        // ... 组装明细
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("订单不存在"));
    }
}
```

**要点：**

| 项 | 说明 |
|----|------|
| 默认传播 | `REQUIRED`：有事务加入，无则新建 |
| 只读事务 | `readOnly = true` 可优化查询 |
| 回滚 | 默认只回滚 `RuntimeException`；受检异常需 `rollbackFor` |
| 位置 | 写在 **Service 层**，不要写在 Controller |
| 自调用 | 同类内部调用不走代理，事务不生效（同 Redis `@Cacheable` 问题） |

```java
@Transactional(rollbackFor = Exception.class)
public void transfer(Long from, Long to, BigDecimal amount) throws BusinessException {
    // 业务逻辑
}
```

---

## 十、软删除（Soft Delete）

物理 `DELETE` 会丢数据；软删除用标志位标记「已删除」，查询时自动过滤。

### 10.1 实体增加 deleted 字段

```java
@Entity
@Table(name = "t_article")
@SQLDelete(sql = "UPDATE t_article SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
@Getter @Setter
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean deleted = false;
}
```

- `@SQLDelete`：调用 `repository.delete()` 时执行 UPDATE 而非 DELETE
- `@Where`：所有查询自动加 `deleted = false`

### 10.2 或使用 Spring Data 的 `@SoftDelete`（Hibernate 6.4+）

```java
@SoftDelete(columnName = "deleted")
@Entity
public class Article { ... }
```

### 10.3 注意

- 唯一索引需考虑 deleted 字段，如 `UNIQUE(email, deleted)` 或部分索引
- 关联表级联删除要改为软删除逻辑

---

## 十一、完整 CRUD 示例

### 11.1 Service

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User create(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("邮箱已存在");
        }
        return userRepository.save(user);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("用户不存在: " + id));
    }

    public Page<User> page(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User update(Long id, User input) {
        User user = getById(id);
        user.setName(input.getName());
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
```

### 11.2 Controller

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public User create(@RequestBody @Valid User user) {
        return userService.create(user);
    }

    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userService.getById(id);
    }

    @GetMapping
    public Page<User> page(@PageableDefault(size = 20) Pageable pageable) {
        return userService.page(pageable);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

---

## 十二、常见问题

### 12.1 javax vs jakarta

Boot 3 必须用 `jakarta.persistence.*`，混用会编译失败。

### 12.2 N+1 查询

循环里访问 `@OneToMany` 会触发 N+1。解决：`JOIN FETCH`、`@EntityGraph`、或 DTO 投影。

### 12.3 时间类型

推荐 `LocalDateTime` + `serverTimezone=Asia/Shanghai`，避免时区偏移。

### 12.4 生产 ddl-auto

**不要用 `update`**，用 Flyway / Liquibase 管理迁移，`ddl-auto: validate`。

---

## 十三、小结

| 主题 | 要点 |
|------|------|
| 规范 | Boot 3 → `jakarta.persistence` |
| 驱动 | `mysql-connector-j` + `com.mysql.cj.jdbc.Driver` |
| Entity | 映射表结构、关联、索引 |
| Repository | 派生查询 + JPQL + Specification |
| 分页 | `Pageable` / `Page<T>` |
| 事务 | Service 层 `@Transactional` |
| 软删除 | `@SQLDelete` + `@Where` 或 `@SoftDelete` |

掌握以上内容，即可在 Spring Boot 3 中完成 JPA 的日常开发与进阶查询。
