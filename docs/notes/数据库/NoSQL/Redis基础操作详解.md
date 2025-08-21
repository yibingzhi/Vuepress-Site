---
tags:
  - 数据库
  - Redis
title: Redis基础操作详解
createTime: 2024/12/16 19:00:00
permalink: /article/5ip9mcii/
---

# Redis基础操作详解

Redis是一个开源的、基于键值对的内存数据结构存储系统，常被用作数据库、缓存和消息中间件。本文将介绍Redis的基础操作命令。

## Redis简介

Redis（Remote Dictionary Server）是一个使用ANSI
C编写的开源、支持网络、基于内存、可选持久性的键值对存储数据库。它支持多种数据结构，如字符串（strings）、哈希（hashes）、列表（lists）、集合（sets）、有序集合（sorted
sets）等。

### Redis的特点

- **高性能**：基于内存操作，读写速度非常快
- **丰富的数据类型**：支持多种数据结构
- **持久化**：支持RDB和AOF两种持久化方式
- **主从复制**：支持主从复制，提高数据安全性
- **事务支持**：支持简单的事务操作
- **发布/订阅**：支持消息的发布与订阅

## 基本数据类型

Redis支持以下几种基本数据类型：

| 数据类型        | 描述                      | 使用场景         |
|-------------|-------------------------|--------------|
| string（字符串） | 最基本的数据类型，可以存储字符串、整数或浮点数 | 缓存、计数器、分布式锁  |
| hash（哈希）    | 键值对集合，类似于编程语言中的map      | 存储对象         |
| list（列表）    | 有序的字符串列表                | 消息队列、最新列表    |
| set（集合）     | 无序且不重复的字符串集合            | 标签、好友关系      |
| zset（有序集合）  | 类似于set，但每个元素都关联一个分数     | 排行榜、带权重的消息队列 |

## 键(key)操作

键操作是Redis中最基本的操作，所有数据类型都基于键进行操作。

### EXISTS - 检查键是否存在

```bash
# 检查单个键是否存在
EXISTS key

# 检查多个键是否存在
EXISTS key1 key2 key3
```

### DEL - 删除键

```bash
# 删除单个键
DEL key

# 删除多个键
DEL key1 key2 key3
```

### TYPE - 获取键的数据类型

```bash
# 返回键的数据类型
TYPE key
```

### KEYS - 查找所有匹配给定模式的键

```bash
# 查找所有键
KEYS *

# 查找以"user"开头的键
KEYS user*

# 查找以"name"结尾的键
KEYS *name
```

### EXPIRE - 设置键的过期时间

```bash
# 设置键在10秒后过期
EXPIRE key 10

# 设置键在指定时间戳过期
EXPIREAT key timestamp
```

### TTL - 获取键的剩余生存时间

```bash
# 获取键的剩余生存时间（秒）
TTL key

# 获取键的剩余生存时间（毫秒）
PTTL key
```

### RENAME - 重命名键

```bash
# 重命名键
RENAME oldkey newkey

# 当新键不存在时重命名
RENAMENX oldkey newkey
```

## 字符串(string)操作

字符串是Redis最基本的数据类型，可以存储字符串、整数或浮点数。

### SET - 设置键值

```bash
# 设置键值
SET key value

# 设置键值并设置过期时间（秒）
SETEX key seconds value

# 设置键值并设置过期时间（毫秒）
PSETEX key milliseconds value

# 只有键不存在时才设置
SETNX key value
```

### GET - 获取键值

```bash
# 获取键的值
GET key
```

### INCR/DECR - 自增/自减

```bash
# 将键的值增加1
INCR key

# 将键的值增加指定数值
INCRBY key increment

# 将键的值增加指定浮点数
INCRBYFLOAT key increment

# 将键的值减少1
DECR key

# 将键的值减少指定数值
DECRBY key decrement
```

### MSET/MGET - 批量操作

```bash
# 批量设置键值
MSET key1 value1 key2 value2

# 批量获取键值
MGET key1 key2
```

### APPEND - 追加字符串

```bash
# 在键值后追加字符串
APPEND key value
```

### STRLEN - 获取字符串长度

```bash
# 获取键值的长度
STRLEN key
```

## 哈希(hash)操作

哈希是一个键值对集合，适合存储对象。

### HSET - 设置哈希字段值

```bash
# 设置哈希字段的值
HSET key field value

# 设置多个哈希字段的值
HMSET key field1 value1 field2 value2
```

### HGET - 获取哈希字段值

```bash
# 获取哈希字段的值
HGET key field

# 获取哈希中多个字段的值
HMGET key field1 field2

# 获取哈希中所有字段和值
HGETALL key
```

### HDEL - 删除哈希字段

```bash
# 删除一个或多个哈希字段
HDEL key field1 field2
```

### HEXISTS - 检查哈希字段是否存在

```bash
# 检查哈希字段是否存在
HEXISTS key field
```

### HLEN - 获取哈希字段数量

```bash
# 获取哈希中字段的数量
HLEN key
```

### HKEYS/HVALS - 获取哈希的所有字段名或值

```bash
# 获取哈希中所有字段名
HKEYS key

# 获取哈希中所有值
HVALS key
```

## 列表(list)操作

列表是简单的字符串列表，按照插入顺序排序。

### LPUSH/RPUSH - 向列表插入元素

```bash
# 将一个或多个值插入到列表头部
LPUSH key value1 value2

# 将一个或多个值插入到列表尾部
RPUSH key value1 value2
```

### LPOP/RPOP - 从列表弹出元素

```bash
# 移除并返回列表的第一个元素
LPOP key

# 移除并返回列表的最后一个元素
RPOP key
```

### LRANGE - 获取列表指定范围的元素

```bash
# 获取列表中指定范围的元素
LRANGE key start stop

# 获取列表中的所有元素
LRANGE key 0 -1
```

### LLEN - 获取列表长度

```bash
# 获取列表的长度
LLEN key
```

### LINDEX - 通过索引获取列表元素

```bash
# 通过索引获取列表中的元素
LINDEX key index
```

### LREM - 移除列表元素

```bash
# 移除列表中与value相等的元素
LREM key count value
```

### LSET - 设置列表指定位置的值

```bash
# 设置列表指定索引位置的值
LSET key index value
```

## 集合(set)操作

集合是字符串类型的无序集合，不允许重复成员。

### SADD - 向集合添加元素

```bash
# 向集合添加一个或多个元素
SADD key member1 member2
```

### SMEMBERS - 获取集合所有成员

```bash
# 获取集合中的所有成员
SMEMBERS key
```

### SREM - 移除集合元素

```bash
# 移除集合中的一个或多个元素
SREM key member1 member2
```

### SISMEMBER - 检查元素是否在集合中

```bash
# 检查元素是否是集合的成员
SISMEMBER key member
```

### SCARD - 获取集合元素数量

```bash
# 获取集合的元素数量
SCARD key
```

### SPOP - 随机移除并返回集合元素

```bash
# 随机移除并返回集合中的一个元素
SPOP key
```

### SRANDMEMBER - 随机返回集合元素

```bash
# 随机返回集合中的一个或多个元素
SRANDMEMBER key [count]
```

### SMOVE - 将元素从一个集合移动到另一个集合

```bash
# 将元素从source集合移动到destination集合
SMOVE source destination member
```

### 集合运算

```bash
# 返回多个集合的交集
SINTER key1 key2

# 返回多个集合的并集
SUNION key1 key2

# 返回多个集合的差集
SDIFF key1 key2
```

## 有序集合(sorted set)操作

有序集合是集合的一个升级版，每个元素都关联一个分数，通过分数进行排序。

### ZADD - 向有序集合添加元素

```bash
# 向有序集合添加一个或多个元素及其分数
ZADD key score1 member1 score2 member2
```

### ZRANGE - 获取有序集合指定范围的元素

```bash
# 获取有序集合指定范围的元素（按分数从小到大）
ZRANGE key start stop [WITHSCORES]

# 获取有序集合指定范围的元素（按分数从大到小）
ZREVRANGE key start stop [WITHSCORES]
```

### ZREM - 移除有序集合元素

```bash
# 移除有序集合中的一个或多个元素
ZREM key member1 member2
```

### ZSCORE - 获取元素的分数

```bash
# 获取有序集合中元素的分数
ZSCORE key member
```

### ZCARD - 获取有序集合元素数量

```bash
# 获取有序集合的元素数量
ZCARD key
```

### ZRANK - 获取元素的排名

```bash
# 获取元素在有序集合中的排名（按分数从小到大）
ZRANK key member

# 获取元素在有序集合中的排名（按分数从大到小）
ZREVRANK key member
```

### ZRANGEBYSCORE - 通过分数范围获取元素

```bash
# 获取指定分数范围内的元素
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
```

### ZINCRBY - 增加元素的分数

```bash
# 增加有序集合中元素的分数
ZINCRBY key increment member
```

## 通用命令

### PING - 测试连接

```bash
# 测试与服务器的连接
PING
```

### ECHO - 打印字符串

```bash
# 打印给定的字符串
ECHO message
```

### SELECT - 切换数据库

```bash
# 切换到指定的数据库（0-15）
SELECT dbindex
```

### FLUSHDB - 清空当前数据库

```bash
# 删除当前数据库中的所有键
FLUSHDB
```

### FLUSHALL - 清空所有数据库

```bash
# 删除所有数据库中的所有键
FLUSHALL
```

### DBSIZE - 获取键的数量

```bash
# 返回当前数据库的键的数量
DBSIZE
```

### INFO - 获取服务器信息

```bash
# 获取服务器的各种信息和统计数值
INFO [section]
```

## 实际应用示例

### 1. 缓存应用

```bash
# 设置用户信息缓存，过期时间为3600秒
SETEX user:1001 3600 "{\"name\":\"张三\",\"age\":25}"

# 获取用户信息
GET user:1001
```

### 2. 计数器应用

```bash
# 页面访问计数
INCR page:views:home

# 获取访问次数
GET page:views:home
```

### 3. 分布式锁

```bash
# 获取锁，过期时间为30秒
SETNX lock:resource 1
EXPIRE lock:resource 30

# 释放锁
DEL lock:resource
```

### 4. 消息队列

```bash
# 生产者：向队列中添加消息
LPUSH queue:messages "Hello World"

# 消费者：从队列中取出消息
RPOP queue:messages
```

## 总结
