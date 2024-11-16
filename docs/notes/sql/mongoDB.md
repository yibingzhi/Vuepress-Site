---
title: mongoDB
createTime: 2024/11/16 21:07:59
permalink: /article/0q3s53z7/
---
MongoDB 是一种流行的NoSQL数据库，使用文档模型来存储数据。它提供了强大的查询语言和丰富的功能。以下是MongoDB的基础语法教程，涵盖了常见的数据操作和管理任务。

---

# MongoDB 语法基础教程

## 一、基本概念

- **数据库**：MongoDB中的数据库是一个容器，用于存储集合。
- **集合**：集合类似于关系型数据库中的表，是文档的容器。
- **文档**：文档是MongoDB的基本数据单元，使用类似JSON的格式（BSON）存储。

## 二、连接和基本操作

### 1. 连接到MongoDB

- 使用MongoDB Shell连接到MongoDB服务器：

  ```bash
  mongo
  ```

- 指定数据库（如果不存在则创建）：

  ```javascript
  use myDatabase
  ```

### 2. 数据库操作

- **查看所有数据库**

  ```javascript
  show dbs
  ```

- **删除数据库**

  ```javascript
  db.dropDatabase()
  ```

## 三、集合操作

### 1. 创建和删除集合

- **创建集合**

  ```javascript
  db.createCollection("myCollection")
  ```

- **查看当前数据库中的所有集合**

  ```javascript
  show collections
  ```

- **删除集合**

  ```javascript
  db.myCollection.drop()
  ```

## 四、文档操作

### 1. 插入文档

- **插入单个文档**

  ```javascript
  db.myCollection.insertOne({ name: "Alice", age: 25, city: "New York" })
  ```

- **插入多个文档**

  ```javascript
  db.myCollection.insertMany([
    { name: "Bob", age: 30, city: "San Francisco" },
    { name: "Charlie", age: 35, city: "Los Angeles" }
  ])
  ```

### 2. 查询文档

- **查询所有文档**

  ```javascript
  db.myCollection.find()
  ```

- **查询特定条件的文档**

  ```javascript
  db.myCollection.find({ age: { $gt: 25 } })
  ```

- **格式化输出**

  ```javascript
  db.myCollection.find().pretty()
  ```

### 3. 更新文档

- **更新单个文档**

  ```javascript
  db.myCollection.updateOne(
    { name: "Alice" },
    { $set: { age: 26 } }
  )
  ```

- **更新多个文档**

  ```javascript
  db.myCollection.updateMany(
    { city: "New York" },
    { $set: { city: "NYC" } }
  )
  ```

- **替换文档**

  ```javascript
  db.myCollection.replaceOne(
    { name: "Alice" },
    { name: "Alice", age: 27, city: "Boston" }
  )
  ```

### 4. 删除文档

- **删除单个文档**

  ```javascript
  db.myCollection.deleteOne({ name: "Charlie" })
  ```

- **删除多个文档**

  ```javascript
  db.myCollection.deleteMany({ age: { $lt: 30 } })
  ```

## 五、索引操作

- **创建索引**

  ```javascript
  db.myCollection.createIndex({ name: 1 })
  ```

- **查看集合的索引**

  ```javascript
  db.myCollection.getIndexes()
  ```

- **删除索引**

  ```javascript
  db.myCollection.dropIndex("name_1")
  ```

## 六、聚合操作

- **使用聚合管道**

  ```javascript
  db.myCollection.aggregate([
    { $match: { age: { $gte: 25 } } },
    { $group: { _id: "$city", total: { $sum: 1 } } }
  ])
  ```

---

通过以上命令和语法，您可以在MongoDB中执行常见的数据操作。MongoDB的灵活性和可扩展性使其成为处理大规模数据和复杂查询的理想选择。根据您的具体需求，您可以进一步探索MongoDB的高级特性和优化技巧。