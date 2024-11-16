---
title: redis
createTime: 2024/11/16 21:07:00
permalink: /article/exoq9e57/
---
Redis 是一个开源的内存数据结构存储系统，常用于缓存、消息代理和实时数据处理。它支持丰富的数据结构，如字符串、哈希、列表、集合和有序集合。以下是 Redis 常用命令和语法的基础教程。

---

# Redis 语法基础教程

## 一、连接和基本操作

### 1. 连接到 Redis

- 使用 Redis CLI 连接到 Redis 服务器：

  ```bash
  redis-cli
  ```

- 检查 Redis 是否正常运行：

  ```plaintext
  127.0.0.1:6379> PING
  PONG
  ```

### 2. 基本命令

- **设置键值对**

  ```plaintext
  SET key value
  ```

  **示例：**

  ```plaintext
  SET mykey "Hello, Redis!"
  ```

- **获取键的值**

  ```plaintext
  GET key
  ```

  **示例：**

  ```plaintext
  GET mykey
  ```

- **删除键**

  ```plaintext
  DEL key
  ```

  **示例：**

  ```plaintext
  DEL mykey
  ```

- **检查键是否存在**

  ```plaintext
  EXISTS key
  ```

  **示例：**

  ```plaintext
  EXISTS mykey
  ```

## 二、数据类型操作

### 1. 字符串（Strings）

- **递增整数值**

  ```plaintext
  INCR key
  ```

  **示例：**

  ```plaintext
  INCR counter
  ```

- **递减整数值**

  ```plaintext
  DECR key
  ```

  **示例：**

  ```plaintext
  DECR counter
  ```

- **追加字符串**

  ```plaintext
  APPEND key value
  ```

  **示例：**

  ```plaintext
  APPEND mykey " World!"
  ```

### 2. 哈希（Hashes）

- **设置哈希字段的值**

  ```plaintext
  HSET key field value
  ```

  **示例：**

  ```plaintext
  HSET user:1000 name "Alice"
  ```

- **获取哈希字段的值**

  ```plaintext
  HGET key field
  ```

  **示例：**

  ```plaintext
  HGET user:1000 name
  ```

- **获取所有哈希字段和值**

  ```plaintext
  HGETALL key
  ```

  **示例：**

  ```plaintext
  HGETALL user:1000
  ```

### 3. 列表（Lists）

- **从左侧推入元素**

  ```plaintext
  LPUSH key value
  ```

  **示例：**

  ```plaintext
  LPUSH mylist "world"
  LPUSH mylist "hello"
  ```

- **从右侧弹出元素**

  ```plaintext
  RPOP key
  ```

  **示例：**

  ```plaintext
  RPOP mylist
  ```

- **获取列表长度**

  ```plaintext
  LLEN key
  ```

  **示例：**

  ```plaintext
  LLEN mylist
  ```

### 4. 集合（Sets）

- **添加元素到集合**

  ```plaintext
  SADD key member
  ```

  **示例：**

  ```plaintext
  SADD myset "apple"
  SADD myset "banana"
  ```

- **检查元素是否存在于集合**

  ```plaintext
  SISMEMBER key member
  ```

  **示例：**

  ```plaintext
  SISMEMBER myset "apple"
  ```

- **获取集合中的所有元素**

  ```plaintext
  SMEMBERS key
  ```

  **示例：**

  ```plaintext
  SMEMBERS myset
  ```

### 5. 有序集合（Sorted Sets）

- **添加元素到有序集合**

  ```plaintext
  ZADD key score member
  ```

  **示例：**

  ```plaintext
  ZADD myzset 1 "one"
  ZADD myzset 2 "two"
  ```

- **获取有序集合中的元素数量**

  ```plaintext
  ZCARD key
  ```

  **示例：**

  ```plaintext
  ZCARD myzset
  ```

- **按分数范围获取元素**

  ```plaintext
  ZRANGE key start stop [WITHSCORES]
  ```

  **示例：**

  ```plaintext
  ZRANGE myzset 0 -1 WITHSCORES
  ```

## 三、其他常用命令

### 1. 设置键过期时间

- **设置过期时间（秒）**

  ```plaintext
  EXPIRE key seconds
  ```

  **示例：**

  ```plaintext
  EXPIRE mykey 60
  ```

### 2. 查看键的剩余生存时间

- **获取剩余生存时间**

  ```plaintext
  TTL key
  ```

  **示例：**

  ```plaintext
  TTL mykey
  ```

### 3. 清空数据库

- **删除当前数据库中的所有键**

  ```plaintext
  FLUSHDB
  ```

- **删除所有数据库中的所有键**

  ```plaintext
  FLUSHALL
  ```

---

通过以上命令，您可以在 Redis 中执行常见的数据操作。Redis 的灵活性和高性能使其成为缓存、会话管理、实时分析等应用场景的理想选择。根据您的具体需求，您可以进一步探索 Redis 的高级特性和优化技巧。