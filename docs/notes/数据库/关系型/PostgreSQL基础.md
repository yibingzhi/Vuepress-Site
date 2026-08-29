---
tags:
  - 数据库
  - PostgreSQL
  - 关系型数据库
  - SQL
title: PostgreSQL基础
createTime: 2026/08/29 15:00:00
permalink: /article/postgresql-basics/
---

## 一、PostgreSQL vs MySQL

| 维度 | PostgreSQL | MySQL |
|------|------------|-------|
| 协议 | 完全开源（PostgreSQL License） | 开源 + 商业版 |
| SQL 标准 | 高度兼容 | 部分兼容 |
| 复杂查询 | 强大（窗口函数、CTE） | 8.0 后逐步增强 |
| JSON | `jsonb` 原生索引 | JSON 类型，索引较弱 |
| 地理数据 | PostGIS 生态成熟 | 基础支持 |
| 并发 | MVCC，读写不阻塞 | InnoDB MVCC |
| 复制 | 流复制、逻辑复制 | 主从复制成熟 |
| 适用场景 | 复杂业务、GIS、数据分析 | 互联网通用、读多写少 |

**选型建议**：需要复杂 SQL、JSON 查询、地理信息、严格数据一致性时优先 PostgreSQL；简单 Web 应用、团队 MySQL 经验丰富时继续 MySQL 也合理。

---

## 二、Docker 一键安装

```bash
# 启动 PostgreSQL 16（持久化数据卷）
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# 进入 psql
docker exec -it postgres-dev psql -U dev -d appdb
```

停止与清理：

```bash
docker stop postgres-dev
docker rm postgres-dev
docker volume rm pgdata   # 删除数据（慎用）
```

---

## 三、psql 基础

### 1. 连接

```bash
psql -h localhost -p 5432 -U dev -d appdb
```

### 2. 常用元命令

```sql
\l              -- 列出数据库
\c appdb        -- 切换数据库
\dt             -- 列出表
\d users        -- 查看表结构
\du             -- 列出用户
\q              -- 退出
```

### 3. 基础 DDL / DML

```sql
-- 创建表
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE,
    metadata   JSONB DEFAULT '{}',
    tags       TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入
INSERT INTO users (name, email, metadata, tags)
VALUES ('张三', 'zhangsan@example.com', '{"role": "admin"}', ARRAY['java', 'go']);

-- 查询
SELECT id, name, metadata->>'role' AS role FROM users WHERE tags @> ARRAY['java'];

-- 更新
UPDATE users SET metadata = metadata || '{"vip": true}'::jsonb WHERE id = 1;

-- 删除
DELETE FROM users WHERE id = 1;
```

---

## 四、特色数据类型

### 1. UUID

适合分布式主键，避免自增 ID 暴露业务量：

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE orders (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    BIGINT NOT NULL,
    amount     NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. JSONB

二进制 JSON，支持索引，查询性能优于 `json`：

```sql
-- 插入
INSERT INTO products (name, attrs)
VALUES ('手机', '{"brand": "Apple", "specs": {"ram": 8, "storage": 256}}');

-- 查询
SELECT * FROM products WHERE attrs @> '{"brand": "Apple"}';
SELECT attrs->'specs'->>'ram' AS ram FROM products;

-- GIN 索引加速 JSONB 查询
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);
```

### 3. Array（数组）

```sql
CREATE TABLE articles (
    id    BIGSERIAL PRIMARY KEY,
    title VARCHAR(200),
    tags  TEXT[]
);

INSERT INTO articles (title, tags) VALUES ('PostgreSQL 入门', ARRAY['数据库', 'SQL']);

SELECT * FROM articles WHERE 'SQL' = ANY(tags);
SELECT * FROM articles WHERE tags @> ARRAY['数据库'];
```

### 4. 其他常用类型

| 类型 | 说明 |
|------|------|
| `TIMESTAMPTZ` | 带时区时间戳（推荐） |
| `NUMERIC(p,s)` | 精确小数（金额） |
| `INET` | IP 地址 |
| `BOOLEAN` | 布尔 |
| `BYTEA` | 二进制数据 |

---

## 五、索引

### 1. 常见索引类型

```sql
-- B-tree（默认，等值与范围查询）
CREATE INDEX idx_users_email ON users (email);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- 复合索引（注意列顺序）
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- GIN（JSONB、数组、全文）
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- 部分索引（条件索引，减小体积）
CREATE INDEX idx_active_users ON users (email) WHERE status = 'active';
```

### 2. 查看执行计划

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'zhangsan@example.com';
```

关注 `Seq Scan`（全表扫描）是否应改为 `Index Scan`。

### 3. 索引原则

- 高频查询条件、JOIN 列、ORDER BY 列建索引
- 避免过多索引影响写入性能
- 定期 `REINDEX` 或 `VACUUM ANALYZE` 维护

---

## 六、事务

PostgreSQL 默认 **READ COMMITTED** 隔离级别，支持完整 ACID。

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 检查业务条件
-- IF ... THEN COMMIT; ELSE ROLLBACK;

COMMIT;
-- 或 ROLLBACK;
```

### 隔离级别

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|------------|------|
| Read Committed | ❌ | ✅ | ✅ |
| Repeatable Read | ❌ | ❌ | ❌（PG 实现） |
| Serializable | ❌ | ❌ | ❌ |

### Spring @Transactional

```java
@Transactional(rollbackFor = Exception.class)
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    accountRepo.debit(fromId, amount);
    accountRepo.credit(toId, amount);
}
```

---

## 七、Spring Boot 集成

### 1. 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Gradle：

```kotlin
implementation("org.springframework.boot:spring-boot-starter-data-jpa")
runtimeOnly("org.postgresql:postgresql")
```

### 2. 数据源配置

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/appdb
    username: dev
    password: dev123
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: validate   # 生产用 validate 或 none
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    open-in-view: false
```

### 3. 实体映射 JSONB

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> tags;
}
```

### 4. 原生查询

```java
@Query(value = "SELECT * FROM users WHERE metadata @> cast(:json AS jsonb)", nativeQuery = true)
List<User> findByMetadata(@Param("json") String json);
```

### 5. Flyway 迁移

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

```sql
-- resources/db/migration/V1__init_users.sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 八、实用 SQL 技巧

### 1. 窗口函数

```sql
SELECT
    user_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn,
    SUM(amount) OVER (PARTITION BY user_id) AS total
FROM orders;
```

### 2. UPSERT

```sql
INSERT INTO users (email, name)
VALUES ('test@example.com', '测试')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```

### 3. 分页

```sql
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40;
```

---

## 小结

- PostgreSQL 适合复杂查询、JSONB、严格事务场景
- Docker 一行命令即可本地开发：`docker run ... postgres:16-alpine`
- 善用 `jsonb`、`uuid`、`array` 等类型与 GIN 索引
- Spring Boot 使用 `org.postgresql:postgresql` + HikariCP + JPA/Flyway
- 生产环境关闭 `ddl-auto: create`，用迁移工具管理 Schema
