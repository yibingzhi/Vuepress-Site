---
tags:
  - 数据库
  - Mysql
title: Mysql基础语法
createTime: 2024/11/16 20:56:58
permalink: /article/cpdwgwc6/
---

::: tip 保鲜说明（2026-08）
本文以 **MySQL 8.0+** 为基准；新建库表请统一使用 **utf8mb4** 字符集；Spring Boot 3 搭配驱动 `com.mysql:mysql-connector-j`。
:::

## 一、MySQL 简介

MySQL 是最流行的开源关系型数据库（RDBMS），特点：

- 基于 SQL 标准，支持事务（InnoDB 引擎）
- 成熟的主从复制、读写分离生态
- 与 Spring Boot JPA / MyBatis 无缝集成

本文覆盖 DDL、DML、索引、JOIN、事务隔离、EXPLAIN 与字符集等实战基础。

---

## 二、连接与字符集

### 2.1 登录

```bash
mysql -u root -p -h 127.0.0.1 -P 3306
```

### 2.2 创建数据库（务必 utf8mb4）

```sql
CREATE DATABASE shop
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```sql
USE shop;
```

### 2.3 为什么用 utf8mb4 而非 utf8

| 字符集 | 说明 |
|--------|------|
| `utf8`（MySQL） | 最多 3 字节，**不支持 emoji** 和部分生僻汉字 |
| `utf8mb4` | 完整 4 字节 UTF-8，**推荐默认选择** |

```sql
-- 查看当前字符集
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

### 2.4 JDBC 连接串（Spring Boot）

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/shop?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

---

## 三、数据定义语言（DDL）

DDL 用于定义和管理数据库对象（库、表、索引等）。

### 3.1 创建表

```sql
CREATE TABLE users (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
    username    VARCHAR(50)  NOT NULL COMMENT '用户名',
    email       VARCHAR(100) NOT NULL COMMENT '邮箱',
    status      TINYINT      NOT NULL DEFAULT 1 COMMENT '1=正常 0=禁用',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email),
    KEY idx_status_created (status, created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';
```

### 3.2 常用数据类型

| 类型 | 用途 |
|------|------|
| `INT` / `BIGINT` | 整数，主键推荐 `BIGINT UNSIGNED` |
| `DECIMAL(10,2)` | 金额（避免用 FLOAT 丢精度） |
| `VARCHAR(n)` | 变长字符串 |
| `TEXT` | 长文本 |
| `DATETIME` / `TIMESTAMP` | 日期时间 |
| `JSON` | JSON 文档（MySQL 5.7+） |
| `ENUM` | 枚举（少用，改值麻烦） |

### 3.3 约束

| 约束 | 说明 |
|------|------|
| `PRIMARY KEY` | 主键，唯一且非空 |
| `UNIQUE` | 唯一约束 |
| `NOT NULL` | 非空 |
| `DEFAULT` | 默认值 |
| `FOREIGN KEY` | 外键（小表可用，高并发写慎用） |
| `AUTO_INCREMENT` | 自增主键 |

### 3.4 修改表结构

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL COMMENT '手机号' AFTER email;

-- 修改列类型
ALTER TABLE users MODIFY COLUMN username VARCHAR(80) NOT NULL;

-- 重命名列（MySQL 8）
ALTER TABLE users RENAME COLUMN phone TO mobile;

-- 删除列
ALTER TABLE users DROP COLUMN mobile;

-- 添加索引
ALTER TABLE users ADD INDEX idx_username (username);

-- 删除索引
ALTER TABLE users DROP INDEX idx_username;
```

### 3.5 删除

```sql
DROP TABLE IF EXISTS users;
DROP DATABASE IF EXISTS shop;
```

---

## 四、数据操作语言（DML）

### 4.1 INSERT 插入

```sql
-- 单行
INSERT INTO users (username, email, status)
VALUES ('alice', 'alice@example.com', 1);

-- 多行
INSERT INTO users (username, email, status) VALUES
('bob',   'bob@example.com',   1),
('carol', 'carol@example.com', 1);

-- 插入或更新（存在则更新）
INSERT INTO users (id, username, email, status)
VALUES (1, 'alice', 'alice_new@example.com', 1)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  updated_at = CURRENT_TIMESTAMP;
```

### 4.2 UPDATE 更新

```sql
UPDATE users
SET status = 0, updated_at = NOW()
WHERE id = 3;

-- 危险：无 WHERE 会更新全表！
-- UPDATE users SET status = 0;  -- 禁止在生产执行
```

**安全习惯**：UPDATE / DELETE 先 `SELECT` 确认影响行数，生产环境带 `LIMIT` 或事务。

### 4.3 DELETE 删除

```sql
DELETE FROM users WHERE id = 3;

-- 清空表（快，不可回滚 DDL 语义）
TRUNCATE TABLE users;
```

### 4.4 事务包裹 DML

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
-- 或 ROLLBACK;
```

---

## 五、数据查询语言（DQL）

### 5.1 基本 SELECT

```sql
SELECT id, username, email, created_at
FROM users
WHERE status = 1
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### 5.2 条件与逻辑

```sql
SELECT * FROM users
WHERE status = 1
  AND email LIKE '%@example.com'
  AND created_at >= '2026-01-01'
  AND id IN (1, 2, 3)
  AND username IS NOT NULL;
```

| 运算符 | 含义 |
|--------|------|
| `=`, `<>`, `!=` | 等于、不等于 |
| `>`, `<`, `>=`, `<=` | 比较 |
| `BETWEEN a AND b` | 范围 |
| `IN (...)` | 集合 |
| `LIKE '%x%'` | 模糊匹配（无法用索引，大表慎用） |
| `IS NULL` / `IS NOT NULL` | 空值判断 |

### 5.3 聚合函数

```sql
SELECT
  COUNT(*)           AS total,
  COUNT(DISTINCT email) AS unique_emails,
  MAX(created_at)      AS latest,
  MIN(created_at)      AS earliest
FROM users
WHERE status = 1;
```

常用：`COUNT`、`SUM`、`AVG`、`MAX`、`MIN`。

### 5.4 GROUP BY 分组

```sql
SELECT status, COUNT(*) AS cnt
FROM users
GROUP BY status
HAVING cnt > 10
ORDER BY cnt DESC;
```

- `WHERE`：分组前过滤
- `HAVING`：分组后过滤

---

## 六、多表 JOIN

准备示例表：

```sql
CREATE TABLE orders (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    order_no   VARCHAR(32) NOT NULL,
    amount     DECIMAL(10,2) NOT NULL,
    status     VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id   BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6.1 INNER JOIN（内连接）

只返回两表都匹配的行。

```sql
SELECT u.username, o.order_no, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'PAID'
ORDER BY o.created_at DESC;
```

### 6.2 LEFT JOIN（左连接）

返回左表全部行，右表无匹配则 NULL。

```sql
SELECT u.username, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 1;
```

查「从未下单的用户」：

```sql
SELECT u.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
```

### 6.3 多表连接

```sql
SELECT u.username, o.order_no, oi.product_id
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id;
```

JOIN 列务必加索引；避免 `SELECT *`，大表先过滤再 JOIN。

---

## 七、索引（Index）

索引类似书的目录，加速查询，但会占用空间并降低写入速度。

### 7.1 索引类型

| 类型 | 说明 |
|------|------|
| 主键索引 | 聚簇索引，InnoDB 数据按主键组织 |
| 唯一索引 | 列值唯一 |
| 普通索引 | 加速查询 |
| 联合索引 | 多列组合，遵循最左前缀 |

### 7.2 创建索引

```sql
-- 普通索引
CREATE INDEX idx_status ON users(status);

-- 联合索引
CREATE INDEX idx_status_created ON users(status, created_at);

-- 唯一索引
CREATE UNIQUE INDEX uk_username ON users(username);
```

### 7.3 最左前缀原则

索引 `(status, created_at)` 可加速：

```sql
WHERE status = 1
WHERE status = 1 AND created_at > '2026-01-01'
```

**不能**单独加速（无最左列）：

```sql
WHERE created_at > '2026-01-01'   -- 用不上该联合索引
```

### 7.4 何时建索引

| 适合 | 不适合 |
|------|--------|
| WHERE / JOIN / ORDER BY 高频列 | 低选择性列（如性别） |
| 区分度高的列 | 小表（全表扫描更快） |
| 联合查询条件 | 频繁更新的列（维护成本高） |

### 7.5 查看索引使用

```sql
SHOW INDEX FROM users;
```

---

## 八、EXPLAIN 执行计划（简要）

`EXPLAIN` 分析 SQL 如何执行，是调优的第一步。

```sql
EXPLAIN
SELECT u.username, o.order_no
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.status = 1 AND o.created_at >= '2026-01-01';
```

### 8.1 关键列

| 列 | 含义 |
|----|------|
| `type` | 访问类型，性能从好到差：`system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL` |
| `possible_keys` | 可能用到的索引 |
| `key` | 实际使用的索引 |
| `rows` | 预估扫描行数（越小越好） |
| `Extra` | 额外信息 |

### 8.2 Extra 常见值

| 值 | 说明 |
|----|------|
| `Using index` | 覆盖索引，好 |
| `Using where` | 存储引擎返回后再过滤 |
| `Using filesort` | 额外排序，考虑加索引 |
| `Using temporary` | 使用临时表，需优化 |
| `Using index condition` | 索引下推（ICP） |

### 8.3 优化示例

慢查询：

```sql
EXPLAIN SELECT * FROM users WHERE email LIKE '%@gmail.com';
-- type=ALL，全表扫描
```

改进：避免前置 `%` 的 LIKE；或用搜索引擎 / 冗余字段。

```sql
EXPLAIN SELECT * FROM users WHERE status = 1 ORDER BY created_at DESC LIMIT 10;
-- 若有 idx_status_created，type=range，较好
```

MySQL 8 可用 `EXPLAIN ANALYZE` 查看实际执行时间：

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE status = 1 LIMIT 100;
```

---

## 九、事务与隔离级别

### 9.1 ACID

| 特性 | 含义 |
|------|------|
| Atomicity 原子性 | 全成功或全回滚 |
| Consistency 一致性 | 数据满足约束 |
| Isolation 隔离性 | 并发事务互不干扰 |
| Durability 持久性 | 提交后持久保存 |

InnoDB 支持事务；MyISAM 不支持。

### 9.2 隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ（MySQL 默认） | 不会 | 不会 | 理论上可能，InnoDB MVCC 很大程度避免 |
| SERIALIZABLE | 不会 | 不会 | 不会 |

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置当前会话
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### 9.3 并发问题说明

- **脏读**：读到别的事务未提交的数据
- **不可重复读**：同一事务内两次读同一行，结果不同（别的事务 UPDATE 了）
- **幻读**：同一事务内两次范围读，行数不同（别的事务 INSERT 了）

### 9.4 实务建议

- 默认 `REPEATABLE READ` 适合大多数业务
- 短事务、尽快 `COMMIT`，减少锁持有
- 高并发写注意死锁，应用层可捕获重试

---

## 十一、与 Spring Boot 集成速记

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/shop?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai
    username: app_user
    password: your_password
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
```

生产环境 schema 变更用 **Flyway** / **Liquibase**，不要依赖 `ddl-auto: update`。

---

## 十二、常见坑

| 问题 | 原因 | 解决 |
|------|------|------|
| 中文乱码 | 用了 utf8 而非 utf8mb4 | 库表和连接串统一 utf8mb4 |
| 时区差 8 小时 | JDBC 未设 `serverTimezone` | 加 `serverTimezone=Asia/Shanghai` |
| 慢查询 | 无索引、全表扫描 | EXPLAIN 分析并建索引 |
| 金额精度丢失 | 用 FLOAT/DOUBLE | 用 DECIMAL |
| 大 OFFSET 分页慢 | `LIMIT 100000, 10` | 改用 `WHERE id > last_id` 游标分页 |
| 隐式类型转换 | 字符串列与数字比较 | 保持类型一致，否则索引失效 |

---

## 十三、小结

| 主题 | 要点 |
|------|------|
| DDL | CREATE / ALTER / DROP，InnoDB + utf8mb4 |
| DML | INSERT / UPDATE / DELETE，善用事务 |
| DQL | SELECT、聚合、GROUP BY |
| JOIN | INNER / LEFT，JOIN 列加索引 |
| 索引 | 最左前缀，覆盖高频查询 |
| EXPLAIN | 看 type、key、rows、Extra |
| 事务 | ACID、四种隔离级别，默认 REPEATABLE READ |
| 字符集 | **utf8mb4** 支持 emoji 与完整 Unicode |

掌握以上内容，足以应对日常 MySQL 开发与 Spring Boot 项目的数据库基础需求。
