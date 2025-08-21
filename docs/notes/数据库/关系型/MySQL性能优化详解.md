---
tags:
  - 数据库
  - Mysql
title: MySQL性能优化
createTime: 2025/08/07 17:09:26
permalink: /article/xrq9z3jm/
---

## 性能优化概述

### 1. 性能优化的目标

- **响应时间**：查询执行时间
- **吞吐量**：单位时间内处理的请求数
- **并发性**：同时处理的连接数
- **资源利用率**：CPU、内存、磁盘使用率

### 2. 性能瓶颈分析

- **CPU瓶颈**：复杂查询、排序、聚合
- **内存瓶颈**：缓冲池不足、连接数过多
- **磁盘瓶颈**：随机I/O、慢查询
- **网络瓶颈**：连接延迟、数据传输

### 3. 优化原则

- **测量优先**：先测量，再优化
- **渐进优化**：逐步改进，避免过度优化
- **平衡考虑**：性能、稳定性、可维护性

## 索引优化

### 1. 索引基础

#### 索引类型

```sql
-- 主键索引（聚集索引）
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);

-- 唯一索引
CREATE UNIQUE INDEX idx_username ON users(username);

-- 普通索引
CREATE INDEX idx_email ON users(email);

-- 复合索引
CREATE INDEX idx_username_email ON users(username, email);

-- 前缀索引
CREATE INDEX idx_email_prefix ON users(email(20));
```

#### 索引选择原则

- **高选择性**：索引列的不同值数量多
- **查询频率**：经常用于WHERE、JOIN、ORDER BY
- **更新频率**：避免在频繁更新的列上建索引
- **列大小**：优先选择较小的数据类型

### 2. 复合索引优化

#### 最左前缀原则

```sql
-- 复合索引：idx_name_age_city
CREATE INDEX idx_name_age_city ON users(name, age, city);

-- 有效查询（使用索引）
SELECT * FROM users WHERE name = 'John';
SELECT * FROM users WHERE name = 'John' AND age = 25;
SELECT * FROM users WHERE name = 'John' AND age = 25 AND city = 'NY';

-- 无效查询（未使用索引）
SELECT * FROM users WHERE age = 25;
SELECT * FROM users WHERE city = 'NY';
SELECT * FROM users WHERE age = 25 AND city = 'NY';
```

#### 索引列顺序优化

```sql
-- 推荐：将选择性高的列放在前面
CREATE INDEX idx_city_age_name ON users(city, age, name);

-- 避免：将选择性低的列放在前面
CREATE INDEX idx_age_city_name ON users(age, city, name);
```

### 3. 索引维护

#### 索引统计信息

```sql
-- 更新表统计信息
ANALYZE TABLE users;

-- 查看索引使用情况
SHOW INDEX FROM users;

-- 查看索引基数
SELECT 
    table_name,
    index_name,
    cardinality
FROM information_schema.statistics 
WHERE table_schema = 'your_database';
```

#### 索引碎片整理

```sql
-- 重建索引
ALTER TABLE users DROP INDEX idx_name;
CREATE INDEX idx_name ON users(name);

-- 或者使用OPTIMIZE TABLE
OPTIMIZE TABLE users;
```

## 查询优化

### 1. EXPLAIN分析

#### 基本用法

```sql
-- 分析查询执行计划
EXPLAIN SELECT * FROM users WHERE age > 25;

-- 详细分析
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE age > 25;
```

#### 关键字段解读

- **type**：访问类型（system > const > eq_ref > ref > range > index > ALL）
- **key**：使用的索引
- **rows**：预估扫描行数
- **Extra**：额外信息（Using index、Using where、Using filesort等）

### 2. 查询重写优化

#### 避免SELECT *

```sql
-- 不推荐
SELECT * FROM users WHERE age > 25;

-- 推荐：只选择需要的列
SELECT id, name, age FROM users WHERE age > 25;
```

#### 使用LIMIT限制结果集

```sql
-- 添加LIMIT避免返回过多数据
SELECT id, name, age FROM users WHERE age > 25 LIMIT 100;
```

#### 避免使用OR

```sql
-- 不推荐：OR可能导致索引失效
SELECT * FROM users WHERE age = 25 OR age = 30;

-- 推荐：使用IN或UNION
SELECT * FROM users WHERE age IN (25, 30);

-- 或者使用UNION
SELECT * FROM users WHERE age = 25
UNION ALL
SELECT * FROM users WHERE age = 30;
```

### 3. JOIN优化

#### JOIN类型选择

```sql
-- 内连接：只返回匹配的记录
SELECT u.name, o.order_id 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id;

-- 左连接：返回左表所有记录
SELECT u.name, o.order_id 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id;

-- 右连接：返回右表所有记录
SELECT u.name, o.order_id 
FROM users u 
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### JOIN顺序优化

```sql
-- 小表驱动大表
SELECT u.name, o.order_id 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id
WHERE u.age > 25;

-- 使用STRAIGHT_JOIN强制JOIN顺序
SELECT STRAIGHT_JOIN u.name, o.order_id 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id;
```

### 4. 子查询优化

#### 使用EXISTS替代IN

```sql
-- 不推荐：IN子查询
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- 推荐：EXISTS
SELECT * FROM users u 
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.amount > 1000
);
```

#### 使用JOIN替代子查询

```sql
-- 使用JOIN替代子查询
SELECT DISTINCT u.* 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id 
WHERE o.amount > 1000;
```

## 表结构优化

### 1. 数据类型优化

#### 选择合适的数据类型

```sql
-- 整数类型
TINYINT     -- 1字节，-128到127
SMALLINT    -- 2字节，-32768到32767
INT         -- 4字节，-2147483648到2147483647
BIGINT      -- 8字节，-9223372036854775808到9223372036854775807

-- 字符串类型
VARCHAR(255)    -- 变长字符串，最大255字符
CHAR(10)        -- 定长字符串，固定10字符
TEXT            -- 长文本，最大65535字符
LONGTEXT        -- 超长文本，最大4GB

-- 时间类型
DATE            -- 日期，YYYY-MM-DD
TIME            -- 时间，HH:MM:SS
DATETIME        -- 日期时间，YYYY-MM-DD HH:MM:SS
TIMESTAMP       -- 时间戳，自动更新
```

#### 避免NULL值

```sql
-- 不推荐：允许NULL
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50) NULL,
    email VARCHAR(100) NULL
);

-- 推荐：使用默认值
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT ''
);
```

### 2. 表设计优化

#### 规范化设计

```sql
-- 第一范式：原子性
-- 不推荐：复合字段
CREATE TABLE users (
    id INT PRIMARY KEY,
    full_name VARCHAR(100)  -- 包含姓和名
);

-- 推荐：分离字段
CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

-- 第二范式：消除部分依赖
-- 不推荐：订单表包含用户信息
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(50),  -- 冗余字段
    order_date DATETIME
);

-- 推荐：分离表
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 反规范化设计

```sql
-- 适当冗余提高查询性能
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(50),  -- 冗余用户姓名
    order_date DATETIME,
    total_amount DECIMAL(10,2)
);

-- 创建冗余字段的索引
CREATE INDEX idx_user_name ON orders(user_name);
```

### 3. 分区表

#### 分区类型

```sql
-- 范围分区
CREATE TABLE orders (
    id INT PRIMARY KEY,
    order_date DATE,
    amount DECIMAL(10,2)
) PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 哈希分区
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50)
) PARTITION BY HASH(id) PARTITIONS 4;

-- 列表分区
CREATE TABLE sales (
    id INT PRIMARY KEY,
    region VARCHAR(20),
    amount DECIMAL(10,2)
) PARTITION BY LIST COLUMNS(region) (
    PARTITION p_north VALUES IN ('Beijing', 'Tianjin'),
    PARTITION p_south VALUES IN ('Guangzhou', 'Shenzhen'),
    PARTITION p_other VALUES IN (DEFAULT)
);
```

## 配置优化

### 1. 内存配置

#### InnoDB缓冲池

```ini
# my.cnf配置文件
[mysqld]
# 缓冲池大小（建议为物理内存的70-80%）
innodb_buffer_pool_size = 4G

# 缓冲池实例数（建议为缓冲池大小的1GB对应一个实例）
innodb_buffer_pool_instances = 4

# 缓冲池预热
innodb_buffer_pool_load_at_startup = 1
innodb_buffer_pool_dump_at_shutdown = 1
```

#### 查询缓存

```ini
# 查询缓存大小
query_cache_size = 128M
query_cache_type = 1

# 查询缓存限制
query_cache_limit = 2M
```

### 2. 连接配置

#### 连接数设置

```ini
# 最大连接数
max_connections = 1000

# 最大用户连接数
max_user_connections = 500

# 连接超时
connect_timeout = 10
wait_timeout = 28800
interactive_timeout = 28800
```

#### 线程池配置

```ini
# 启用线程池
thread_handling = pool-of-threads

# 线程池大小
thread_pool_size = 16

# 线程池最大连接数
thread_pool_max_connections = 1000
```

### 3. 日志配置

#### 慢查询日志

```ini
# 启用慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log

# 慢查询阈值（秒）
long_query_time = 2

# 记录未使用索引的查询
log_queries_not_using_indexes = 1
```

#### 二进制日志

```ini
# 启用二进制日志
log_bin = 1
log_bin_index = /var/log/mysql/mysql-bin.index

# 日志格式
binlog_format = ROW

# 日志过期时间（天）
expire_logs_days = 7
```

## 分库分表

### 1. 水平分表

#### 按时间分表

```sql
-- 按月分表
CREATE TABLE orders_202301 LIKE orders;
CREATE TABLE orders_202302 LIKE orders;
CREATE TABLE orders_202303 LIKE orders;

-- 插入数据时选择对应表
INSERT INTO orders_202301 SELECT * FROM orders WHERE order_date >= '2023-01-01' AND order_date < '2023-02-01';
```

#### 按ID范围分表

```sql
-- 按ID范围分表
CREATE TABLE users_0 LIKE users;  -- ID: 0-999999
CREATE TABLE users_1 LIKE users;  -- ID: 1000000-1999999
CREATE TABLE users_2 LIKE users;  -- ID: 2000000-2999999

-- 分表规则：table_index = id / 1000000
```

### 2. 垂直分表

#### 按字段分表

```sql
-- 用户基本信息表
CREATE TABLE users_basic (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP
);

-- 用户详细信息表
CREATE TABLE users_detail (
    user_id INT PRIMARY KEY,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users_basic(id)
);
```

### 3. 分库策略

#### 按业务分库

```sql
-- 用户库
CREATE DATABASE user_db;
USE user_db;
CREATE TABLE users (...);

-- 订单库
CREATE DATABASE order_db;
USE order_db;
CREATE TABLE orders (...);

-- 商品库
CREATE DATABASE product_db;
USE product_db;
CREATE TABLE products (...);
```

#### 读写分离

```sql
-- 主库配置（写操作）
[mysqld]
server-id = 1
log_bin = 1
binlog_format = ROW

-- 从库配置（读操作）
[mysqld]
server-id = 2
relay_log = 1
read_only = 1
```

## 性能监控

### 1. 系统监控

#### 性能指标

```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看慢查询数量
SHOW STATUS LIKE 'Slow_queries';

-- 查看查询缓存命中率
SHOW STATUS LIKE 'Qcache_hits';
SHOW STATUS LIKE 'Qcache_inserts';

-- 查看InnoDB状态
SHOW ENGINE INNODB STATUS;
```

#### 进程列表

```sql
-- 查看当前进程
SHOW PROCESSLIST;

-- 查看详细信息
SELECT * FROM information_schema.processlist;
```

### 2. 慢查询分析

#### 慢查询日志分析

```bash
# 使用mysqldumpslow分析慢查询日志
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 使用pt-query-digest分析（Percona Toolkit）
pt-query-digest /var/log/mysql/slow.log
```

#### 实时监控慢查询

```sql
-- 启用performance_schema
UPDATE performance_schema.setup_instruments 
SET ENABLED = 'YES', TIMED = 'YES' 
WHERE NAME LIKE '%statement/%';

-- 查看慢查询统计
SELECT 
    event_name,
    count_star,
    sum_timer_wait/1000000000 as total_seconds,
    avg_timer_wait/1000000000 as avg_seconds
FROM performance_schema.events_statements_summary_by_event_name
WHERE event_name LIKE '%SELECT%'
ORDER BY sum_timer_wait DESC;
```

### 3. 监控工具

#### MySQL Workbench

- 图形化监控界面
- 性能仪表板
- 查询分析器

#### Percona Monitoring and Management (PMM)

- 开源监控解决方案
- 实时性能指标
- 告警和报告

#### Prometheus + Grafana

- 时间序列数据库
- 丰富的可视化图表
- 灵活的告警规则

## 优化实战案例

### 1. 慢查询优化案例

#### 问题描述

```sql
-- 原始慢查询
SELECT u.*, o.order_id, o.amount 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at > '2023-01-01' 
ORDER BY u.created_at DESC;
```

#### 优化分析

```sql
-- 分析执行计划
EXPLAIN SELECT u.*, o.order_id, o.amount 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at > '2023-01-01' 
ORDER BY u.created_at DESC;
```

#### 优化方案

```sql
-- 1. 添加索引
CREATE INDEX idx_created_at ON users(created_at);
CREATE INDEX idx_user_id ON orders(user_id);

-- 2. 优化查询（只选择需要的字段）
SELECT u.id, u.username, u.email, o.order_id, o.amount 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at > '2023-01-01' 
ORDER BY u.created_at DESC;

-- 3. 使用LIMIT限制结果集
SELECT u.id, u.username, u.email, o.order_id, o.amount 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at > '2023-01-01' 
ORDER BY u.created_at DESC 
LIMIT 100;
```

### 2. 大表优化案例

#### 问题描述

- 单表数据量超过1000万条
- 查询响应时间超过5秒
- 索引维护成本高

#### 优化方案

```sql
-- 1. 分区表
CREATE TABLE orders_partitioned (
    id INT PRIMARY KEY,
    user_id INT,
    order_date DATE,
    amount DECIMAL(10,2)
) PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024)
);

-- 2. 归档历史数据
CREATE TABLE orders_archive_2020 LIKE orders;
INSERT INTO orders_archive_2020 SELECT * FROM orders WHERE YEAR(order_date) = 2020;
DELETE FROM orders WHERE YEAR(order_date) = 2020;

-- 3. 读写分离
-- 主库处理写操作
-- 从库处理读操作
```

### 3. 高并发优化案例

#### 问题描述

- 并发用户数超过1000
- 数据库连接数不足
- 响应时间不稳定

#### 优化方案

```sql
-- 1. 连接池配置
[mysqld]
max_connections = 2000
max_user_connections = 1000

-- 2. 线程池配置
thread_handling = pool-of-threads
thread_pool_size = 32

-- 3. 应用层连接池
-- 使用HikariCP或Druid连接池
-- 设置合理的连接池参数
```

## 总结

MySQL性能优化是一个系统工程，需要：

1. **深入理解MySQL原理**：存储引擎、索引机制、查询优化器
2. **掌握优化工具**：EXPLAIN、慢查询日志、性能监控
3. **建立优化体系**：索引策略、查询规范、配置调优
4. **持续监控改进**：性能基线、告警机制、定期优化

### 优化建议

- **测量优先**：先测量性能瓶颈，再针对性优化
- **索引为王**：合理设计索引是性能优化的基础
- **查询优化**：优化SQL语句比硬件升级更有效
- **配置调优**：根据硬件配置调整MySQL参数
- **分库分表**：数据量大时考虑分库分表策略

记住：性能优化没有银弹，需要根据具体业务场景和性能要求来制定合适的优化策略。
