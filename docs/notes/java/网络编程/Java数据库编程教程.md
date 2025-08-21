---
title: Java数据库编程教程
createTime: 2025/08/18 09:55:33
permalink: /java/r0mur3i9/
---

## 数据库编程基础概念

JDBC（Java Database Connectivity）是Java中用于执行SQL语句的API，可以为多种关系数据库提供统一访问。它由一组用Java语言编写的类和接口组成，是Java程序访问数据库的标准接口。

JDBC的主要优势包括：
1. **统一接口**：为不同的数据库提供统一的访问接口
2. **可移植性**：Java程序可以跨数据库平台运行
3. **灵活性**：支持多种数据库操作方式
4. **标准规范**：遵循行业标准，易于学习和使用

## 数据库连接方式

在我们的示例中，我们使用的是SQLite数据库，它是一种嵌入式数据库，数据存储在本地文件中。但在实际项目中，您可能会连接到各种不同类型的数据库服务器。

### 1. SQLite数据库（本地文件数据库）
SQLite是一种轻量级的嵌入式数据库，不需要单独的服务器进程，数据存储在本地文件中。

连接URL格式：
```
jdbc:sqlite:数据库文件路径
```

示例：
```java
String url = "jdbc:sqlite:users.db";  // 连接到当前目录下的users.db文件
String url = "jdbc:sqlite:/path/to/database.db";  // 连接到指定路径的数据库文件
```

特点：
- 无需安装数据库服务器
- 适合小型应用和原型开发
- 数据存储在单个文件中
- 不支持并发访问

### 2. MySQL数据库
MySQL是最流行的开源关系型数据库之一。

连接URL格式：
```
jdbc:mysql://主机地址:端口/数据库名
```

示例：
```java
String url = "jdbc:mysql://localhost:3306/mydb";
String username = "root";
String password = "password";
```

需要添加MySQL JDBC驱动依赖：
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

### 3. PostgreSQL数据库
PostgreSQL是另一种强大的开源关系型数据库。

连接URL格式：
```
jdbc:postgresql://主机地址:端口/数据库名
```

示例：
```java
String url = "jdbc:postgresql://localhost:5432/mydb";
String username = "postgres";
String password = "password";
```

需要添加PostgreSQL JDBC驱动依赖：
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.6.0</version>
</dependency>
```

### 4. Oracle数据库
Oracle是甲骨文公司开发的企业级关系型数据库。

连接URL格式：
```
jdbc:oracle:thin:@主机地址:端口:服务名
```

示例：
```java
String url = "jdbc:oracle:thin:@localhost:1521:xe";
String username = "system";
String password = "password";
```

需要添加Oracle JDBC驱动依赖：
```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <version>21.9.0.0</version>
</dependency>
```

### 5. SQL Server数据库
SQL Server是微软开发的关系型数据库管理系统。

连接URL格式：
```
jdbc:sqlserver://主机地址:端口;databaseName=数据库名
```

示例：
```java
String url = "jdbc:sqlserver://localhost:1433;databaseName=mydb";
String username = "sa";
String password = "password";
```

需要添加SQL Server JDBC驱动依赖：
```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.4.0.jre11</version>
</dependency>
```

## JDBC架构

JDBC API支持两层和三层处理模型进行数据库访问，但通常情况下，JDBC采用两层架构：
- **JDBC API**：提供应用程序与JDBC管理器的连接
- **JDBC驱动程序**：处理与数据源的通信

JDBC驱动程序类型：
1. **JDBC-ODBC桥接驱动程序**：使用ODBC驱动程序连接数据库
2. **本地API驱动程序**：部分使用Java程序部分使用本地代码
3. **网络协议驱动程序**：完全使用Java编写，通过中间服务器连接数据库
4. **本地驱动程序**：完全使用Java编写，直接连接数据库

## JDBC核心接口和类

### DriverManager类
管理一组JDBC驱动程序的基本服务：
- `getConnection(String url)`：尝试建立到给定数据库URL的连接
- `registerDriver(Driver driver)`：注册给定的驱动程序

### Connection接口
与特定数据库的连接（会话）：
- `createStatement()`：创建Statement对象
- `prepareStatement(String sql)`：创建PreparedStatement对象
- `close()`：立即释放此Connection对象的数据库和JDBC资源

### Statement接口
用于执行静态SQL语句并返回结果：
- `executeQuery(String sql)`：执行给定的SQL语句，返回单个ResultSet对象
- `executeUpdate(String sql)`：执行给定的SQL语句，可能为INSERT、UPDATE或DELETE语句
- `close()`：释放此Statement对象的数据库和JDBC资源

### PreparedStatement接口
表示预编译的SQL语句：
- 继承自Statement接口
- 支持参数化查询，提高安全性和性能
- `setString(int parameterIndex, String x)`：将指定参数设置为给定String值
- `setInt(int parameterIndex, int x)`：将指定参数设置为给定int值

### ResultSet接口
表示数据库结果集的数据表：
- `next()`：将光标从当前位置向前移动一行
- `getString(int columnIndex)`：以Java编程语言中String的形式获取此ResultSet对象的当前行中指定列的值
- `getInt(int columnIndex)`：以Java编程语言中int的形式获取此ResultSet对象的当前行中指定列的值

## 数据库连接步骤

### 1. 加载JDBC驱动程序
```java
Class.forName("org.sqlite.JDBC");  // SQLite驱动
Class.forName("com.mysql.cj.jdbc.Driver");  // MySQL驱动
```

### 2. 建立数据库连接
```java
// SQLite连接
Connection conn = DriverManager.getConnection("jdbc:sqlite:users.db");

// MySQL连接
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb", "username", "password");
```

### 3. 创建Statement对象
```java
Statement stmt = conn.createStatement();
// 或者创建PreparedStatement对象
PreparedStatement pstmt = conn.prepareStatement(sql);
```

### 4. 执行SQL语句
```java
// 查询操作
ResultSet rs = stmt.executeQuery("SELECT * FROM users");

// 更新操作
int rowsAffected = stmt.executeUpdate("INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25)");
```

### 5. 处理结果
```java
while (rs.next()) {
    String name = rs.getString("name");
    String email = rs.getString("email");
    int age = rs.getInt("age");
    System.out.println(name + ", " + email + ", " + age);
}
```

### 6. 关闭连接
```java
rs.close();
stmt.close();
conn.close();
```

## PreparedStatement vs Statement

PreparedStatement相比Statement具有以下优势：

1. **防止SQL注入**：通过参数化查询防止SQL注入攻击
2. **性能更好**：预编译SQL语句，可重复使用
3. **代码可读性**：参数化查询使代码更清晰

```java
// 使用Statement（不推荐）
String sql = "SELECT * FROM users WHERE name = '" + name + "'";
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql);

// 使用PreparedStatement（推荐）
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, name);
ResultSet rs = pstmt.executeQuery();
```

## 事务处理

JDBC通过Connection对象支持事务处理：

```java
try {
    // 关闭自动提交
    conn.setAutoCommit(false);
    
    // 执行多个SQL操作
    PreparedStatement pstmt1 = conn.prepareStatement("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");
    pstmt1.setString(1, "张三");
    pstmt1.setString(2, "zhangsan@example.com");
    pstmt1.setInt(3, 25);
    pstmt1.executeUpdate();
    
    PreparedStatement pstmt2 = conn.prepareStatement("UPDATE users SET age = ? WHERE name = ?");
    pstmt2.setInt(1, 26);
    pstmt2.setString(2, "张三");
    pstmt2.executeUpdate();
    
    // 提交事务
    conn.commit();
} catch (SQLException e) {
    // 回滚事务
    conn.rollback();
    throw e;
} finally {
    // 恢复自动提交
    conn.setAutoCommit(true);
}
```

## 数据库连接池

在实际应用中，频繁创建和关闭数据库连接会影响性能，可以使用连接池来管理连接：

```java
// 使用连接池（示例使用HikariCP）
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:sqlite:users.db");
config.setUsername("user");
config.setPassword("password");

HikariDataSource dataSource = new HikariDataSource(config);

// 获取连接
Connection conn = dataSource.getConnection();
```

## 异常处理

JDBC操作可能抛出SQLException，需要进行适当的异常处理：

```java
try {
    // 数据库操作
    Connection conn = DriverManager.getConnection(url, username, password);
    // ... 其他操作
} catch (SQLException e) {
    System.err.println("数据库操作错误: " + e.getMessage());
    System.err.println("SQL状态: " + e.getSQLState());
    System.err.println("错误代码: " + e.getErrorCode());
} catch (ClassNotFoundException e) {
    System.err.println("找不到JDBC驱动程序: " + e.getMessage());
}
```

## 最佳实践

### 1. 使用try-with-resources语句
自动管理资源，确保正确关闭：

```java
try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement pstmt = conn.prepareStatement(sql);
     ResultSet rs = pstmt.executeQuery()) {
    // 处理结果
} catch (SQLException e) {
    // 处理异常
}
```

### 2. 使用PreparedStatement防止SQL注入
```java
String sql = "SELECT * FROM users WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, userInput); // 安全地设置参数
```

### 3. 合理处理异常
不要忽略SQLException，应该记录日志或进行适当处理：

```java
try {
    // 数据库操作
} catch (SQLException e) {
    logger.error("数据库操作失败", e);
    throw new DataAccessException("操作失败", e);
}
```

### 4. 使用连接池
在生产环境中使用连接池提高性能：

```java
// 配置连接池
HikariConfig config = new HikariConfig();
config.setJdbcUrl(jdbcUrl);
config.setMaximumPoolSize(20);
HikariDataSource dataSource = new HikariDataSource(config);

// 使用连接
try (Connection conn = dataSource.getConnection()) {
    // 数据库操作
}
```

## DAO模式

数据访问对象（DAO）模式是将底层数据访问逻辑与业务逻辑分离的一种设计模式：

```java
public interface UserDAO {
    boolean insertUser(User user) throws SQLException;
    boolean updateUser(User user) throws SQLException;
    boolean deleteUser(int id) throws SQLException;
    User getUserById(int id) throws SQLException;
    List<User> getAllUsers() throws SQLException;
}
```

DAO模式的优势：
1. **分离关注点**：将数据访问逻辑与业务逻辑分离
2. **易于测试**：可以轻松地对DAO进行单元测试
3. **易于维护**：数据访问逻辑集中在一个地方
4. **易于扩展**：可以轻松更换数据存储实现
