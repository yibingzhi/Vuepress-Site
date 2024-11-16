---
title: mysql
createTime: 2024/11/16 20:56:58
permalink: /article/7mzwy1eg/
---
MySQL 是一种流行的关系型数据库管理系统，支持丰富的 SQL 语法用于数据操作和管理。以下是 MySQL 常用语法的基础教程，涵盖了数据定义、数据操作、查询和管理等方面。

---

# MySQL 语法基础教程

## 一、数据定义语言（DDL）

### 1. 创建数据库和表

- **创建数据库**

  ```sql
  CREATE DATABASE 数据库名;
  ```

- **创建表**

  ```sql
  CREATE TABLE 表名 (
      列名1 数据类型 [约束],
      列名2 数据类型 [约束],
      ...
  );
  ```

  **示例：**

  ```sql
  CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

### 2. 修改和删除数据库和表

- **修改表**

  添加列：

  ```sql
  ALTER TABLE 表名 ADD 列名 数据类型;
  ```

  修改列数据类型：

  ```sql
  ALTER TABLE 表名 MODIFY 列名 新数据类型;
  ```

  删除列：

  ```sql
  ALTER TABLE 表名 DROP COLUMN 列名;
  ```

- **删除表**

  ```sql
  DROP TABLE 表名;
  ```

- **删除数据库**

  ```sql
  DROP DATABASE 数据库名;
  ```

## 二、数据操作语言（DML）

### 1. 插入数据

- **插入单条记录**

  ```sql
  INSERT INTO 表名 (列名1, 列名2, ...) VALUES (值1, 值2, ...);
  ```

  **示例：**

  ```sql
  INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
  ```

- **插入多条记录**

  ```sql
  INSERT INTO 表名 (列名1, 列名2, ...) VALUES
  (值1, 值2, ...),
  (值1, 值2, ...);
  ```

### 2. 更新数据

- **更新记录**

  ```sql
  UPDATE 表名 SET 列名1 = 值1, 列名2 = 值2 WHERE 条件;
  ```

  **示例：**

  ```sql
  UPDATE users SET email = 'new_email@example.com' WHERE id = 1;
  ```

### 3. 删除数据

- **删除记录**

  ```sql
  DELETE FROM 表名 WHERE 条件;
  ```

  **示例：**

  ```sql
  DELETE FROM users WHERE id = 1;
  ```

## 三、数据查询语言（DQL）

### 1. 基本查询

- **查询所有列**

  ```sql
  SELECT * FROM 表名;
  ```

- **查询指定列**

  ```sql
  SELECT 列名1, 列名2 FROM 表名;
  ```

### 2. 条件查询

- **使用 WHERE 子句**

  ```sql
  SELECT * FROM 表名 WHERE 条件;
  ```

  **示例：**

  ```sql
  SELECT * FROM users WHERE name = 'Alice';
  ```

### 3. 排序和限制

- **排序**

  ```sql
  SELECT * FROM 表名 ORDER BY 列名 ASC|DESC;
  ```

- **限制返回结果**

  ```sql
  SELECT * FROM 表名 LIMIT 数量;
  ```

  **示例：**

  ```sql
  SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
  ```

### 4. 聚合函数

- **常用聚合函数**

  ```sql
  SELECT COUNT(*), SUM(列名), AVG(列名), MAX(列名), MIN(列名) FROM 表名;
  ```

  **示例：**

  ```sql
  SELECT COUNT(*) FROM users;
  ```

### 5. 分组查询

- **使用 GROUP BY 子句**

  ```sql
  SELECT 列名, 聚合函数 FROM 表名 GROUP BY 列名;
  ```

  **示例：**

  ```sql
  SELECT name, COUNT(*) FROM users GROUP BY name;
  ```

## 四、数据控制语言（DCL）

### 1. 用户和权限管理

- **创建用户**

  ```sql
  CREATE USER '用户名'@'主机' IDENTIFIED BY '密码';
  ```

- **授予权限**

  ```sql
  GRANT 权限 ON 数据库.表 TO '用户名'@'主机';
  ```

- **撤销权限**

  ```sql
  REVOKE 权限 ON 数据库.表 FROM '用户名'@'主机';
  ```

- **删除用户**

  ```sql
  DROP USER '用户名'@'主机';
  ```

---

通过以上基本语法，您可以在 MySQL 中执行常见的数据库操作。根据项目的具体需求，您可以深入学习 MySQL 的高级特性和优化技巧。