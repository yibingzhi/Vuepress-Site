---
tags:
  - 数据库
  - MySQL
  - 事务
  - 锁
  - InnoDB
title: MySQL事务与锁详解
createTime: 2026/08/29 16:00:00
permalink: /article/mysql-transaction-lock/
---

::: tip InnoDB 前提
本文默认 **InnoDB** 引擎。MyISAM 不支持行级事务，生产环境勿用。
:::

## 一、ACID 特性

| 特性 | 含义 | InnoDB 实现要点 |
|------|------|-----------------|
| Atomicity 原子性 | 全部成功或全部回滚 | undo log |
| Consistency 一致性 | 数据满足约束与业务规则 | 原子性 + 隔离性 + 应用逻辑 |
| Isolation 隔离性 | 并发事务互不不当干扰 | MVCC + 锁 |
| Durability 持久性 | 提交后数据不丢 | redo log + 刷盘策略 |

```sql
-- 显式事务
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 或 ROLLBACK;
```

```java
@Transactional(rollbackFor = Exception.class)
public void transfer(Long from, Long to, BigDecimal amount) {
    accountMapper.debit(from, amount);
    accountMapper.credit(to, amount);
}
```

---

## 二、事务控制语句

```sql
-- 查看自动提交
SELECT @@autocommit;  -- 默认 1

SET autocommit = 0;   -- 关闭后需手动 COMMIT

-- 保存点
START TRANSACTION;
UPDATE orders SET status = 'PAID' WHERE id = 1;
SAVEPOINT sp1;
UPDATE inventory SET qty = qty - 1 WHERE sku = 'A';
-- 回滚到保存点，仅撤销 inventory 更新
ROLLBACK TO sp1;
COMMIT;
```

Spring `@Transactional` 对应一个连接一个事务；嵌套事务用 `Propagation` 控制。

---

## 三、隔离级别

SQL 标准四级隔离级别，解决并发问题：

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|------------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 否 | 可能 | 可能 |
| REPEATABLE READ（MySQL 默认） | 否 | 否 | 可能* |
| SERIALIZABLE | 否 | 否 | 否 |

\* InnoDB 在 RR 下通过 **Next-Key Lock** 在很大程度上避免幻读。

```sql
-- 查看与设置（会话级）
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

```yaml
# Spring Boot 数据源（谨慎修改全局默认）
spring:
  datasource:
    hikari:
      transaction-isolation: TRANSACTION_REPEATABLE_READ
```

### 3.1 并发问题示例

**脏读：** 读到未提交数据

```
T1: UPDATE balance=900 (未提交)
T2: SELECT balance → 900  -- 脏读
T1: ROLLBACK
```

**不可重复读：** 同一事务内两次读结果不同（他人已提交 UPDATE）

**幻读：** 同一范围查询，第二次多出/少了行（他人 INSERT/DELETE 已提交）

---

## 四、MVCC 简述

**Multi-Version Concurrency Control** — 多版本并发控制，读不加锁（快照读），写加锁。

### 4.1 隐藏列

InnoDB 每行额外存储：

- `DB_TRX_ID`：最后修改事务 ID
- `DB_ROLL_PTR`：回滚指针，指向 undo log 旧版本
- `DB_ROW_ID`：聚簇索引行 ID（若无主键）

### 4.2 Read View

事务开始时（RC）或第一次读时（RR）生成 Read View，判断行版本可见性：

- `creator_trx_id`：当前事务 ID
- `m_ids`：活跃事务 ID 列表
- 若行 `DB_TRX_ID` 在 m_ids 中 → 不可见，沿 undo 链找旧版本

### 4.3 RC vs RR

| | READ COMMITTED | REPEATABLE READ |
|--|----------------|-----------------|
| Read View | 每次 SELECT 新建 | 事务内第一次 SELECT 后复用 |
| 效果 | 可看到他人新提交 | 同事务内快照一致 |

```sql
-- 当前读（加锁读，不用 MVCC 快照）
SELECT * FROM orders WHERE id = 1 FOR UPDATE;
SELECT * FROM orders WHERE id = 1 LOCK IN SHARE MODE; -- 共享锁
```

---

## 五、锁类型

### 5.1 按粒度

| 锁 | 说明 |
|----|------|
| 表锁 | `LOCK TABLES`，粒度大，少用 |
| 行锁 | InnoDB 默认，锁定索引记录 |
| 意向锁 | 表级 IS/IX，加速表锁与行锁协调 |

### 5.2 按模式

| 锁 | 缩写 | 兼容 |
|----|------|------|
| 共享锁 S | `LOCK IN SHARE MODE` | S 与 S 兼容 |
| 排他锁 X | `FOR UPDATE` | X 与任何锁不兼容 |

```sql
-- 会话 1
START TRANSACTION;
SELECT * FROM products WHERE id = 10 FOR UPDATE;

-- 会话 2（阻塞直到会话 1 提交）
SELECT * FROM products WHERE id = 10 FOR UPDATE;
```

### 5.3 记录锁、间隙锁、Next-Key Lock

- **Record Lock**：锁定索引记录
- **Gap Lock**：锁定索引记录之间的间隙，防止幻读
- **Next-Key Lock** = Record + Gap，左开右闭区间

```sql
-- 表 id 主键有 1, 5, 10
-- WHERE id = 5 FOR UPDATE → 锁定 id=5 及相邻间隙
```

RR 级别下范围查询使用 Next-Key Lock；**唯一索引精确命中**可能退化为 Record Lock。

### 5.4 插入意向锁

INSERT 在等待间隙锁释放时加插入意向锁，提高插入并发。

---

## 六、死锁

### 6.1 典型场景

```
T1: UPDATE accounts SET ... WHERE id=1;  -- 持有 id=1 行锁
T2: UPDATE accounts SET ... WHERE id=2;  -- 持有 id=2 行锁
T1: UPDATE accounts SET ... WHERE id=2;  -- 等待 T2
T2: UPDATE accounts SET ... WHERE id=1;  -- 等待 T1 → 死锁
```

### 6.2 InnoDB 处理

自动检测死锁，回滚 **代价较小** 的事务（undo 量小），另一事务继续。

```sql
-- 查看最近一次死锁日志
SHOW ENGINE INNODB STATUS\G
```

```
LATEST DETECTED DEADLOCK
...
*** (1) TRANSACTION: TRANSACTION 4211, ACTIVE 2 sec...
*** (2) TRANSACTION: ...
WE ROLL BACK TRANSACTION (2)
```

### 6.3 避免死锁

1. **固定加锁顺序**：多表更新按表名/id 排序
2. **缩小事务**：减少持锁时间
3. **降低隔离级别**：RC 间隙锁更少（需业务接受）
4. **合理索引**：避免全表扫描导致大量行锁
5. **重试**：捕获 `DeadlockLoserDataAccessException` 重试

```java
@Retryable(retryFor = DeadlockLoserDataAccessException.class, maxAttempts = 3)
@Transactional
public void updateInventory(String sku, int delta) {
    inventoryMapper.updateQty(sku, delta);
}
```

---

## 七、索引与锁的关系

```sql
-- ❌ 无索引：可能锁全表（实际上是对所有记录加锁）
UPDATE orders SET status = 'CANCEL' WHERE remark = 'test';

-- ✅ 走主键/索引：仅锁匹配行
UPDATE orders SET status = 'CANCEL' WHERE id = 10086;
```

`EXPLAIN` 确认 `type` 非 `ALL`，`key` 有使用索引。

---

## 八、乐观锁 vs 悲观锁

### 8.1 悲观锁（数据库锁）

```sql
SELECT stock FROM products WHERE id = 1 FOR UPDATE;
UPDATE products SET stock = stock - 1 WHERE id = 1;
```

适合 **冲突频繁** 的库存、秒杀核心扣减。

### 8.2 乐观锁（版本号）

```sql
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = #{version} AND stock >= 1;
```

```java
// MyBatis-Plus
@Version
private Integer version;
```

适合读多写少、冲突概率低；更新行数为 0 时需重试或提示。

---

## 九、长事务危害

- 持锁时间长 → 阻塞、死锁概率上升
- undo log 膨胀 → 空间与性能
- MVCC 旧版本无法 purge → 表空间增大

```sql
-- 查找长事务
SELECT * FROM information_schema.innodb_trx
ORDER BY trx_started;

-- 查看未提交事务
SELECT * FROM performance_schema.events_statements_current
WHERE sql_text LIKE '%FOR UPDATE%';
```

**规范：** 事务内不做 RPC、HTTP、消息发送；仅做数据库操作。

---

## 十、Spring 事务传播（简要）

| 传播行为 | 说明 |
|----------|------|
| REQUIRED（默认） | 有则加入，无则新建 |
| REQUIRES_NEW | 挂起当前，新建独立事务 |
| NESTED | 嵌套保存点 |
| NOT_SUPPORTED | 挂起事务，非事务执行 |
| MANDATORY | 必须在事务内，否则异常 |

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void writeAuditLog(AuditEntry entry) {
    // 即使外层回滚，审计日志仍提交
    auditMapper.insert(entry);
}
```

---

## 十一、分布式事务说明

单库事务由 InnoDB 保证；跨服务/跨库需：

- **Seata AT/TCC**（见微服务文档）
- **本地消息表 / Outbox**
- **Saga 补偿**

MySQL 单实例内优先用好本地事务，避免过早引入分布式事务复杂度。

---

## 十二、监控与诊断

```sql
-- 当前锁等待
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- 简化：show processlist
SHOW FULL PROCESSLIST;

-- 开启锁监控
UPDATE performance_schema.setup_instruments
SET ENABLED = 'YES', TIMED = 'YES'
WHERE NAME LIKE 'wait/lock%';
```

MySQL 8.0+ `performance_schema.data_locks` 可查看具体锁模式与索引。

---

## 十三、最佳实践清单

### 13.1 设计层

- [ ] 所有业务表 InnoDB + 主键
- [ ] 高频更新字段建合适索引
- [ ] 金额用 `DECIMAL`，避免浮点
- [ ] 库存等关键路径明确乐观/悲观策略

### 13.2 开发层

- [ ] `@Transactional` 加在 public 方法，注意自调用失效
- [ ] `rollbackFor = Exception.class`（默认仅 RuntimeException）
- [ ] 事务内禁止外部 IO
- [ ] 批量操作控制单批大小，避免大事务

### 13.3 运维层

- [ ] 监控慢查询与 `innodb_lock_wait_timeout`（默认 50s）
- [ ] 定期分析死锁日志
- [ ] 备份与 binlog 策略保障持久性

```sql
-- 查看锁等待超时
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';
```

---

## 十四、实战案例：订单支付

```sql
START TRANSACTION;

-- 1. 锁定订单行
SELECT status FROM orders WHERE order_no = 'O20260829001' FOR UPDATE;
-- 校验 status = 'PENDING'

-- 2. 扣减库存（走 sku 索引）
UPDATE inventory SET qty = qty - 2
WHERE sku = 'SKU-001' AND qty >= 2;

-- 3. 更新订单
UPDATE orders SET status = 'PAID', paid_at = NOW()
WHERE order_no = 'O20260829001' AND status = 'PENDING';

COMMIT;
```

任一步 `affected rows = 0` 则 `ROLLBACK` 并返回业务错误。

---

## 十五、常见面试追问

**Q: RR 能否完全避免幻读？**  
A: 快照读（普通 SELECT）仍可能因首次 Read View 之后他人插入而在语义上感觉不一致；`FOR UPDATE` 当前读通过 Next-Key Lock 防止范围内插入。

**Q: 为什么推荐 RC 在部分互联网场景？**  
A: 间隙锁少、死锁概率低、语义更接近 Oracle；需接受不可重复读的业务处理。

**Q: `SELECT ... FOR UPDATE` 没走索引？**  
A: 可能锁全表所有记录，极其危险。

---

## 十六、binlog 与 redo/undo 协作（持久性）

InnoDB 事务提交时：

1. **redo log**（物理日志，InnoDB 层）先写 prepare 状态
2. **binlog**（逻辑日志，Server 层）写入
3. redo log commit，两阶段提交保证主从复制一致

```
事务修改数据
    │
    ├─► undo log（回滚用，MVCC 旧版本链）
    ├─► redo log buffer（崩溃恢复）
    └─► 提交时写 binlog（复制、CDC、Canal）
```

`innodb_flush_log_at_trx_commit` 与 `sync_binlog` 共同决定持久性强度：

| 配置 | 性能 | 安全 |
|------|------|------|
| `=1` + `sync_binlog=1` | 较低 | 最高，每次提交刷盘 |
| `=2` | 中 | OS 缓存，单机崩溃可能丢最近事务 |
| `=0` | 高 | 仅适合可丢数据的测试环境 |

生产金融场景保持 `=1`；只读从库延迟监控 `Seconds_Behind_Master`。

---

## 十七、全局锁与备份

```sql
-- 全库只读锁（FTWRL），备份前使用
FLUSH TABLES WITH READ LOCK;
-- mysqldump / xtrabackup
UNLOCK TABLES;
```

InnoDB 热备优先 **Percona XtraBackup** 或云厂商快照，避免长时间 FTWRL 阻塞写入。

`LOCK INSTANCE FOR BACKUP`（MySQL 8.0+）粒度更细，仅阻塞 DDL。

---

## 十八、隐式锁与显式锁转换

普通 `UPDATE` / `DELETE` 在 RR 下自动对命中行加 **X 锁**（当前读路径）。若业务仅需判断存在性：

```sql
-- 快照读，不加锁
SELECT * FROM orders WHERE id = 1;

-- 当前读，加 X 锁
SELECT * FROM orders WHERE id = 1 FOR UPDATE;

-- 共享当前读，允许多个事务同时读，阻塞写
SELECT * FROM orders WHERE id = 1 FOR SHARE;
```

`SKIP LOCKED` / `NOWAIT`（MySQL 8.0+）用于队列抢单，避免无限等待：

```sql
SELECT * FROM task_queue
WHERE status = 'PENDING'
ORDER BY id
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

---

## 参考

- [MySQL InnoDB 事务模型](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html)
- [MySQL性能优化详解](/article/mysql-performance/)
- [分布式锁与缓存一致性](/article/distributed-lock-cache/)
