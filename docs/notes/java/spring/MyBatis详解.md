---
title: MyBatis详解
createTime: 2025/08/16 14:47:48
permalink: /框架技术/bbfuvwf8/
---

# MyBatis 详解 - 全面深入教程

## 目录
- [一、MyBatis 开发理念与设计哲学](#一mybatis-开发理念与设计哲学)
- [二、MyBatis 核心概念详解](#二mybatis-核心概念详解)
- [三、MyBatis 源码分析](#三mybatis-源码分析)
- [四、MyBatis 配置详解](#四mybatis-配置详解)
- [五、映射器配置详解](#五映射器配置详解)
- [六、动态SQL详解](#六动态sql详解)
- [七、插件机制详解](#七插件机制详解)
- [八、缓存机制详解](#八缓存机制详解)
- [九、SpringBoot集成详解](#九springboot集成详解)
- [十、MyBatis 注解大全](#十mybatis-注解大全)
- [十一、最佳实践与常见问题](#十一最佳实践与常见问题)

---

## 一、MyBatis 开发理念与设计哲学

### 1.1 MyBatis 的设计理念

**什么是MyBatis？**
MyBatis是一个优秀的持久层框架，它支持自定义SQL、存储过程和高级映射。MyBatis避免了几乎所有的JDBC代码和手动设置参数以及获取结果集。

**MyBatis 的核心设计理念：**

1. **SQL与Java代码分离**
   - **理念**：将SQL语句从Java代码中分离出来，放在XML文件中
   - **优势**：SQL更容易维护、优化和版本控制
   - **适用场景**：复杂查询、动态SQL、SQL优化

2. **约定优于配置**
   - **理念**：提供合理的默认配置，减少配置工作
   - **优势**：开箱即用，降低学习成本
   - **示例**：自动驼峰命名转换、自动类型映射

3. **灵活性优先**
   - **理念**：提供多种配置方式，满足不同需求
   - **优势**：支持注解、XML、混合配置
   - **适用场景**：简单查询用注解，复杂查询用XML

4. **性能与易用性平衡**
   - **理念**：在保持易用性的同时，提供性能优化选项
   - **优势**：支持缓存、批量操作、延迟加载
   - **示例**：一级缓存、二级缓存、分页插件

### 1.2 MyBatis 的设计模式

**MyBatis 中使用的设计模式：**

1. **模板方法模式**
   - **应用**：SqlSessionTemplate、Executor等
   - **作用**：定义算法骨架，子类实现具体步骤
   - **优势**：代码复用，扩展性好

2. **代理模式**
   - **应用**：Mapper接口的动态代理
   - **作用**：为Mapper接口创建实现类
   - **优势**：接口与实现分离，支持AOP

3. **建造者模式**
   - **应用**：SqlSessionFactoryBuilder
   - **作用**：构建复杂的SqlSessionFactory
   - **优势**：支持链式调用，配置灵活

4. **工厂模式**
   - **应用**：SqlSessionFactory
   - **作用**：创建SqlSession实例
   - **优势**：统一管理SqlSession生命周期

5. **策略模式**
   - **应用**：不同的Executor实现
   - **作用**：支持不同的执行策略
   - **优势**：运行时切换执行策略

### 1.3 MyBatis 的优势与适用场景

**MyBatis 的优势：**

1. **学习成本低**
   - 基于SQL，开发者容易理解
   - 配置简单，开箱即用
   - 文档完善，社区活跃

2. **灵活性高**
   - 支持复杂SQL和存储过程
   - 动态SQL功能强大
   - 插件机制支持扩展

3. **性能优秀**
   - 一级缓存和二级缓存
   - 支持批量操作
   - 延迟加载机制

4. **与Spring集成好**
   - 官方提供Spring集成包
   - 支持声明式事务
   - 配置简单

**适用场景：**

1. **中小型项目**：配置简单，开发效率高
2. **复杂查询需求**：动态SQL、多表关联
3. **性能要求高**：缓存机制、批量操作
4. **团队熟悉SQL**：基于SQL，学习成本低

**不适用场景：**

1. **简单CRUD项目**：可能过度设计
2. **团队不熟悉SQL**：需要SQL技能
3. **需要完全自动化**：需要编写SQL语句

## 二、MyBatis 核心概念详解

### 2.1 什么是MyBatis

**MyBatis是什么？**
MyBatis是一个优秀的持久层框架，它支持自定义SQL、存储过程和高级映射。MyBatis避免了几乎所有的JDBC代码和手动设置参数以及获取结果集。

**为什么需要MyBatis？**
1. **简化开发**：避免手写JDBC代码，提高开发效率
2. **SQL优化**：可以编写和优化SQL语句，发挥数据库性能
3. **类型安全**：提供类型安全的参数绑定和结果映射
4. **动态SQL**：支持根据条件动态生成SQL语句

**MyBatis vs 其他ORM框架：**
- **MyBatis**：SQL可控，性能优秀，学习成本低
- **Hibernate**：全自动，功能强大，学习成本高
- **JPA**：标准规范，厂商实现，功能丰富

### 2.2 MyBatis 核心组件

**MyBatis 的核心组件架构：**

1. **SqlSessionFactory（会话工厂）**
   - **作用**：创建SqlSession实例的工厂
   - **特点**：全局单例，线程安全
   - **职责**：管理配置信息、创建SqlSession

2. **SqlSession（会话）**
   - **作用**：执行SQL、获取Mapper、管理事务
   - **特点**：非线程安全，需要及时关闭
   - **职责**：执行SQL语句、管理一级缓存

3. **Mapper（映射器）**
   - **作用**：定义SQL操作接口
   - **特点**：接口形式，动态代理实现
   - **职责**：声明数据库操作方法

4. **Executor（执行器）**
   - **作用**：实际执行SQL语句
   - **特点**：支持缓存、批量操作
   - **职责**：SQL执行、结果处理

5. **StatementHandler（语句处理器）**
   - **作用**：处理SQL语句的预编译和执行
   - **特点**：支持参数设置、结果处理
   - **职责**：SQL预编译、参数绑定

6. **ResultSetHandler（结果集处理器）**
   - **作用**：处理查询结果集
   - **特点**：支持结果映射、类型转换
   - **职责**：结果集处理、对象映射

### 2.3 MyBatis 工作流程

**MyBatis 的完整工作流程：**

```
1. 应用启动 → 2. 加载配置 → 3. 创建SqlSessionFactory → 4. 创建SqlSession → 5. 获取Mapper → 6. 执行SQL → 7. 返回结果
```

**详细流程说明：**

1. **应用启动阶段**
   - 加载MyBatis配置文件
   - 解析映射器XML文件
   - 创建Configuration对象

2. **SqlSessionFactory创建阶段**
   - 解析配置文件
   - 创建数据源
   - 配置事务管理器
   - 注册映射器

3. **SqlSession创建阶段**
   - 从SqlSessionFactory创建SqlSession
   - 设置执行环境
   - 初始化一级缓存

4. **Mapper获取阶段**
   - 通过动态代理创建Mapper实现
   - 绑定SQL语句
   - 准备执行环境

5. **SQL执行阶段**
   - 解析SQL语句
   - 设置参数
   - 执行SQL
   - 处理结果集

6. **结果返回阶段**
   - 结果集映射
   - 类型转换
   - 返回结果对象

### 2.4 MyBatis 主要特性

**MyBatis 的核心特性：**

1. **简化SQL操作**
   - **功能**：自动映射结果集到Java对象
   - **优势**：减少重复代码，提高开发效率
   - **示例**：自动处理字段名与属性名的映射

2. **动态SQL**
   - **功能**：支持条件查询和动态拼接SQL
   - **优势**：避免字符串拼接，防止SQL注入
   - **示例**：if、choose、foreach等标签

3. **插件机制**
   - **功能**：支持自定义插件扩展功能
   - **优势**：功能可扩展，满足特殊需求
   - **示例**：分页插件、性能分析插件

4. **缓存支持**
   - **功能**：提供一级和二级缓存
   - **优势**：提高查询性能，减少数据库访问
   - **示例**：一级缓存（SqlSession级别）、二级缓存（Mapper级别）

5. **Spring集成**
   - **功能**：与Spring框架无缝集成
   - **优势**：配置简单，支持声明式事务
   - **示例**：@MapperScan、SqlSessionTemplate

## 三、MyBatis 源码分析

### 3.1 为什么要分析MyBatis源码？

**源码分析的价值：**
1. **理解原理**：了解MyBatis是如何工作的，知其然知其所以然
2. **解决问题**：当遇到问题时，能够从源码层面分析原因
3. **学习设计**：学习MyBatis优秀的设计思想和架构模式
4. **性能优化**：了解内部机制，做出更好的性能优化决策
5. **扩展开发**：理解插件机制，开发自定义功能

### 3.2 MyBatis 启动流程源码分析

**MyBatis 启动的核心流程：**

```java
// SqlSessionFactoryBuilder.build() 方法的核心流程
public SqlSessionFactory build(InputStream inputStream) {
    return build(inputStream, null, null);
}

public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties) {
    try {
        // 1. 创建XMLConfigBuilder解析配置文件
        XMLConfigBuilder parser = new XMLConfigBuilder(inputStream, environment, properties);
        
        // 2. 解析配置文件，构建Configuration对象
        Configuration config = parser.parse();
        
        // 3. 使用Configuration创建DefaultSqlSessionFactory
        return build(config);
    } catch (Exception e) {
        throw ExceptionFactory.wrapException("Error building SqlSession.", e);
    } finally {
        ErrorContext.instance().reset();
        try {
            inputStream.close();
        } catch (IOException e) {
            // 忽略关闭异常
        }
    }
}
```

**Configuration对象构建过程：**

```java
// XMLConfigBuilder.parse() 方法
public Configuration parse() {
    if (parsed) {
        throw new BuilderException("Each XMLConfigBuilder can only be used once.");
    }
    parsed = true;
    
    // 1. 解析configuration根节点
    parseConfiguration(parser.evalNode("/configuration"));
    return configuration;
}

private void parseConfiguration(XNode root) {
    try {
        // 2. 解析properties配置
        propertiesElement(root.evalNode("properties"));
        
        // 3. 解析settings配置
        Properties settings = settingsAsProperties(root.evalNode("settings"));
        loadCustomVfs(settings);
        loadCustomLogImpl(settings);
        
        // 4. 解析typeAliases配置
        typeAliasesElement(root.evalNode("typeAliases"));
        
        // 5. 解析plugins配置
        pluginElement(root.evalNode("plugins"));
        
        // 6. 解析objectFactory配置
        objectFactoryElement(root.evalNode("objectFactory"));
        
        // 7. 解析objectWrapperFactory配置
        objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
        
        // 8. 解析environments配置
        environmentsElement(root.evalNode("environments"));
        
        // 9. 解析databaseIdProvider配置
        databaseIdProviderElement(root.evalNode("databaseIdProvider"));
        
        // 10. 解析mappers配置
        mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
        throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
}
```

**为什么需要这么复杂的配置解析？**
1. **灵活性**：支持多种配置方式（XML、注解、代码）
2. **扩展性**：插件、类型处理器等都可以配置
3. **环境隔离**：支持开发、测试、生产等不同环境
4. **性能优化**：预解析配置，运行时直接使用

### 3.3 SqlSession 创建过程源码分析

**SqlSession 创建的核心流程：**

```java
// DefaultSqlSessionFactory.openSession() 方法
public SqlSession openSession() {
    return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);
}

private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
    Transaction tx = null;
    try {
        // 1. 获取环境配置
        final Environment environment = configuration.getEnvironment();
        
        // 2. 创建事务工厂
        final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
        
        // 3. 创建事务
        tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
        
        // 4. 创建执行器
        final Executor executor = configuration.newExecutor(tx, execType);
        
        // 5. 创建DefaultSqlSession
        return new DefaultSqlSession(configuration, executor, autoCommit);
    } catch (Exception e) {
        closeTransaction(tx);
        throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
    }
}
```

**Executor 创建过程：**

```java
// Configuration.newExecutor() 方法
public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
    executorType = executorType == null ? defaultExecutorType : executorType;
    executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
    
    Executor executor;
    
    // 1. 根据类型创建不同的执行器
    if (ExecutorType.BATCH == executorType) {
        executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
        executor = new ReuseExecutor(this, transaction);
    } else {
        executor = new SimpleExecutor(this, transaction);
    }
    
    // 2. 如果开启了缓存，包装为CachingExecutor
    if (cacheEnabled) {
        executor = new CachingExecutor(executor);
    }
    
    // 3. 应用所有插件
    executor = (Executor) interceptorChain.pluginAll(executor);
    
    return executor;
}
```

**为什么需要不同类型的Executor？**
1. **SimpleExecutor**：简单执行器，每次执行都创建新的Statement
2. **ReuseExecutor**：重用执行器，重用Statement，提高性能
3. **BatchExecutor**：批处理执行器，支持批量操作，提高批量性能

### 3.4 Mapper 动态代理源码分析

**Mapper 接口的动态代理实现：**

```java
// MapperRegistry.getMapper() 方法
public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
    // 1. 获取MapperProxyFactory
    final MapperProxyFactory<T> mapperProxyFactory = (MapperProxyFactory<T>) knownMappers.get(type);
    if (mapperProxyFactory == null) {
        throw new BindingException("Type " + type + " is not known to the MapperRegistry.");
    }
    
    try {
        // 2. 创建Mapper代理对象
        return mapperProxyFactory.newInstance(sqlSession);
    } catch (Exception e) {
        throw new BindingException("Error getting mapper instance. Cause: " + e, e);
    }
}

// MapperProxyFactory.newInstance() 方法
public T newInstance(SqlSession sqlSession) {
    // 3. 创建MapperProxy
    final MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
    
    // 4. 使用JDK动态代理创建代理对象
    return newInstance(mapperProxy);
}

protected T newInstance(MapperProxy<T> mapperProxy) {
    return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), 
                                    new Class[] { mapperInterface }, mapperProxy);
}
```

**MapperProxy 的核心实现：**

```java
// MapperProxy.invoke() 方法
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
        // 1. 处理Object类的方法
        if (Object.class.equals(method.getDeclaringClass())) {
            return method.invoke(this, args);
        }
        
        // 2. 处理默认方法（Java 8+）
        if (method.isDefault()) {
            return invokeDefaultMethod(proxy, method, args);
        }
    } catch (Throwable t) {
        throw ExceptionUtil.unwrapThrowable(t);
    }
    
    // 3. 获取缓存的MapperMethod
    final MapperMethod mapperMethod = cachedMapperMethod(method);
    
    // 4. 执行MapperMethod
    return mapperMethod.execute(sqlSession, args);
}
```

**为什么使用动态代理？**
1. **接口与实现分离**：Mapper接口不需要实现类
2. **统一处理**：所有Mapper方法都通过代理统一处理
3. **扩展性好**：可以在代理中添加通用逻辑
4. **性能优化**：支持方法缓存，避免重复解析

### 3.5 SQL 执行过程源码分析

**SQL 执行的核心流程：**

```java
// MapperMethod.execute() 方法
public Object execute(SqlSession sqlSession, Object[] args) {
    Object result;
    
    // 1. 根据SQL类型选择执行方法
    switch (command.getType()) {
        case INSERT: {
            // 2. 处理插入操作
            Object param = method.convertArgsToSqlCommandParam(args);
            result = rowCountResult(sqlSession.insert(command.getName(), param));
            break;
        }
        case UPDATE: {
            // 3. 处理更新操作
            Object param = method.convertArgsToSqlCommandParam(args);
            result = rowCountResult(sqlSession.update(command.getName(), param));
            break;
        }
        case DELETE: {
            // 4. 处理删除操作
            Object param = method.convertArgsToSqlCommandParam(args);
            result = rowCountResult(sqlSession.delete(command.getName(), param));
            break;
        }
        case SELECT:
            // 5. 处理查询操作
            if (method.returnsVoid() && method.hasResultHandler()) {
                executeWithResultHandler(sqlSession, args);
                result = null;
            } else if (method.returnsMany()) {
                result = executeForMany(sqlSession, args);
            } else if (method.returnsMap()) {
                result = executeForMap(sqlSession, args);
            } else if (method.returnsCursor()) {
                result = executeForCursor(sqlSession, args);
            } else {
                Object param = method.convertArgsToSqlCommandParam(args);
                result = sqlSession.selectOne(command.getName(), param);
            }
            break;
        case FLUSH:
            result = sqlSession.flushStatements();
            break;
        default:
            throw new BindingException("Unknown execution method for: " + command.getName());
    }
    
    return result;
}
```

**StatementHandler 的执行过程：**

```java
// PreparedStatementHandler.query() 方法
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
    PreparedStatement ps = (PreparedStatement) statement;
    
    // 1. 执行SQL语句
    ps.execute();
    
    // 2. 处理结果集
    return resultSetHandler.handleResultSets(ps);
}

// DefaultResultSetHandler.handleResultSets() 方法
public List<Object> handleResultSets(Statement stmt) throws SQLException {
    ErrorContext.instance().activity("handling results").object(mappedStatement.getId());
    
    final List<Object> multipleResults = new ArrayList<>();
    
    int resultSetCount = 0;
    ResultSetWrapper rsw = getFirstResultSet(stmt);
    
    List<ResultMap> resultMaps = mappedStatement.getResultMaps();
    int resultMapCount = resultMaps.size();
    
    validateResultMaps(rsw, resultMapCount);
    
    while (rsw != null && resultSetCount < resultMapCount) {
        ResultMap resultMap = resultMaps.get(resultSetCount);
        
        // 3. 处理单个结果集
        handleResultSet(rsw, resultMap, multipleResults, null);
        
        rsw = getNextResultSet(stmt);
        resultSetCount++;
    }
    
    // 4. 处理多结果集
    String[] resultSets = mappedStatement.getResultSets();
    if (resultSets != null) {
        while (rsw != null && resultSetCount < resultSets.length) {
            ResultMapping parentMapping = nextResultMaps.get(resultSets[resultSetCount]);
            if (parentMapping != null) {
                String nestedResultMapId = parentMapping.getNestedResultMapId();
                ResultMap resultMap = configuration.getResultMap(nestedResultMapId);
                handleResultSet(rsw, resultMap, null, parentMapping);
            }
            rsw = getNextResultSet(stmt);
            resultSetCount++;
        }
    }
    
    return collapseSingleResultList(multipleResults);
}
```

**为什么需要这么复杂的执行流程？**
1. **类型安全**：确保参数类型和返回值类型正确
2. **结果处理**：支持多种结果类型（List、Map、Cursor等）
3. **多结果集**：支持存储过程返回多个结果集
4. **扩展性**：通过ResultHandler支持自定义结果处理

---

## 四、MyBatis 配置详解

### 4.1 快速开始

#### 4.1.1 添加依赖

```xml

<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.13</version>
</dependency>

<dependency>
<groupId>mysql</groupId>
<artifactId>mysql-connector-java</artifactId>
<version>8.0.33</version>
</dependency>
```

#### 4.1.2 配置文件

```xml
<!-- mybatis-config.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/test"/>
                <property name="username" value="root"/>
                <property name="password" value="password"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

#### 4.1.3 实体类

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private Date createTime;
    
    // 构造函数、getter、setter方法
}
```

#### 4.1.4 映射器接口

```java
public interface UserMapper {
    User selectById(Long id);
    List<User> selectAll();
    int insert(User user);
    int update(User user);
    int deleteById(Long id);
}
```

#### 4.1.5 映射器XML

```xml
<!-- UserMapper.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById" resultType="com.example.entity.User">
        SELECT * FROM user WHERE id = #{id}
    </select>

    <select id="selectAll" resultType="com.example.entity.User">
        SELECT * FROM user
    </select>

    <insert id="insert" parameterType="com.example.entity.User">
        INSERT INTO user (username, email, create_time)
        VALUES (#{username}, #{email}, #{createTime})
    </insert>

    <update id="update" parameterType="com.example.entity.User">
        UPDATE user SET username = #{username}, email = #{email}
        WHERE id = #{id}
    </update>

    <delete id="deleteById" parameterType="long">
        DELETE FROM user WHERE id = #{id}
    </delete>
</mapper>
```

#### 4.1.6 使用示例

```java
public class MyBatisDemo {
    public static void main(String[] args) throws IOException {
        // 读取配置文件
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        
        // 创建SqlSessionFactory
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        
        // 创建SqlSession
        try (SqlSession session = sqlSessionFactory.openSession()) {
            // 获取映射器
            UserMapper userMapper = session.getMapper(UserMapper.class);
            
            // 执行查询
            User user = userMapper.selectById(1L);
            System.out.println("User: " + user);
            
            // 提交事务
            session.commit();
        }
    }
}
```

### 4.2 核心配置详解

#### 4.2.1 环境配置

```xml

<environments default="development">
    <!-- 开发环境 -->
    <environment id="development">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
            <property name="url" value="jdbc:mysql://localhost:3306/test"/>
            <property name="username" value="root"/>
            <property name="password" value="password"/>
            <property name="maxActive" value="20"/>
            <property name="maxIdle" value="10"/>
            <property name="minIdle" value="5"/>
        </dataSource>
    </environment>

    <!-- 测试环境 -->
    <environment id="test">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
            <property name="url" value="jdbc:mysql://test-server:3306/test"/>
            <property name="username" value="test_user"/>
            <property name="password" value="test_pass"/>
        </dataSource>
    </environment>
</environments>
```

#### 4.2.2 类型别名

```xml

<typeAliases>
    <!-- 单个类型别名 -->
    <typeAlias type="com.example.entity.User" alias="User"/>

    <!-- 包扫描 -->
    <package name="com.example.entity"/>
</typeAliases>
```

#### 4.2.3 插件配置

```xml

<plugins>
    <!-- 分页插件 -->
    <plugin interceptor="com.github.pagehelper.PageInterceptor">
        <property name="helperDialect" value="mysql"/>
        <property name="reasonable" value="true"/>
    </plugin>

    <!-- 性能分析插件 -->
    <plugin interceptor="com.example.plugin.PerformanceInterceptor"/>
</plugins>
```

## 五、映射器配置详解

### 5.1 结果映射

```xml

<resultMap id="UserResultMap" type="User">
    <id column="id" property="id"/>
    <result column="username" property="username"/>
    <result column="email" property="email"/>
    <result column="create_time" property="createTime"/>

    <!-- 关联映射 -->
    <association property="profile" javaType="UserProfile">
        <id column="profile_id" property="id"/>
        <result column="real_name" property="realName"/>
        <result column="phone" property="phone"/>
    </association>

    <!-- 集合映射 -->
    <collection property="orders" ofType="Order">
        <id column="order_id" property="id"/>
        <result column="order_no" property="orderNo"/>
        <result column="amount" property="amount"/>
    </collection>
</resultMap>
```

### 5.2 参数映射

```xml

<select id="selectByCondition" resultMap="UserResultMap">
    SELECT * FROM user
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null and email != ''">
            AND email LIKE CONCAT('%', #{email}, '%')
        </if>
        <if test="startTime != null">
            AND create_time >= #{startTime}
        </if>
        <if test="endTime != null">
            AND create_time<= #{endTime}
        </if>
    </where>
    ORDER BY create_time DESC
</select>
```

### 5.3 批量操作

```xml
<!-- 批量插入 -->
<insert id="batchInsert" parameterType="list">
    INSERT INTO user (username, email, create_time) VALUES
    <foreach collection="list" item="user" separator=",">
        (#{user.username}, #{user.email}, #{user.createTime})
    </foreach>
</insert>

        <!-- 批量更新 -->
<update id="batchUpdate" parameterType="list">
<foreach collection="list" item="user" separator=";">
    UPDATE user SET username = #{user.username}, email = #{user.email}
    WHERE id = #{user.id}
</foreach>
</update>

        <!-- 批量删除 -->
<delete id="batchDelete" parameterType="list">
DELETE FROM user WHERE id IN
<foreach collection="list" item="id" open="(" separator="," close=")">
    #{id}
</foreach>
</delete>
```

## 六、动态SQL详解

### 6.1 if条件

```xml

<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null and email != ''">
            AND email LIKE CONCAT('%', #{email}, '%')
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
</select>
```

### 6.2 choose-when-otherwise

```xml

<select id="selectByStatus" resultType="User">
    SELECT * FROM user
    <where>
        <choose>
            <when test="status == 'active'">
                AND status = 'active' AND last_login_time > DATE_SUB(NOW(), INTERVAL 30 DAY)
            </when>
            <when test="status == 'inactive'">
                AND status = 'inactive' OR last_login_time<= DATE_SUB(NOW(), INTERVAL 30 DAY)
            </when>
            <otherwise>
                AND status IS NOT NULL
            </otherwise>
        </choose>
    </where>
</select>
```

### 6.3 trim标签

```xml

<insert id="insertUser" parameterType="User">
    INSERT INTO user
    <trim prefix="(" suffix=")" suffixOverrides=",">
        <if test="username != null">username,</if>
        <if test="email != null">email,</if>
        <if test="createTime != null">create_time,</if>
    </trim>
    <trim prefix="VALUES (" suffix=")" suffixOverrides=",">
        <if test="username != null">#{username},</if>
        <if test="email != null">#{email},</if>
        <if test="createTime != null">#{createTime},</if>
    </trim>
</insert>
```

### 6.4 foreach循环

```xml

<select id="selectByIds" resultType="User">
    SELECT * FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<update id="updateStatusByIds">
UPDATE user SET status = #{status} WHERE id IN
<foreach collection="ids" item="id" open="(" separator="," close=")">
    #{id}
</foreach>
</update>
```

## 七、插件机制详解

### 7.1 自定义插件

```java
@Intercepts({
    @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
    @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class, CacheKey.class, BoundSql.class})
})
public class PerformanceInterceptor implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        try {
            return invocation.proceed();
        } finally {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            if (duration > 1000) { // 超过1秒的查询记录日志
                log.warn("Slow query detected: {} ms", duration);
            }
        }
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // 设置插件属性
    }
}
```

### 7.2 分页插件

```xml

<plugin interceptor="com.github.pagehelper.PageInterceptor">
    <property name="helperDialect" value="mysql"/>
    <property name="reasonable" value="true"/>
    <property name="supportMethodsArguments" value="true"/>
    <property name="params" value="count=countSql"/>
</plugin>
```

```java
// 使用分页插件
public List<User> selectUsersByPage(int pageNum, int pageSize) {
    PageHelper.startPage(pageNum, pageSize);
    return userMapper.selectAll();
}

// 获取分页信息
PageInfo<User> pageInfo = new PageInfo<>(users);
System.out.println("总记录数: " + pageInfo.getTotal());
System.out.println("总页数: " + pageInfo.getPages());
System.out.println("当前页: " + pageInfo.getPageNum());
```

## 八、缓存机制详解

### 8.1 一级缓存

```java
// 一级缓存默认开启，作用域为SqlSession
public void testFirstLevelCache() {
    try (SqlSession session = sqlSessionFactory.openSession()) {
        UserMapper userMapper = session.getMapper(UserMapper.class);
        
        // 第一次查询，会执行SQL
        User user1 = userMapper.selectById(1L);
        
        // 第二次查询，从缓存获取，不会执行SQL
        User user2 = userMapper.selectById(1L);
        
        // 执行更新操作，会清空缓存
        userMapper.updateById(user1);
        
        // 再次查询，会执行SQL
        User user3 = userMapper.selectById(1L);
    }
}
```

### 8.2 二级缓存

```xml
<!-- 在映射器XML中启用二级缓存 -->
<cache
        eviction="LRU"
        flushInterval="60000"
        size="512"
        readOnly="true"/>

        <!-- 或者在select语句中指定使用缓存 -->
<select id="selectById" resultType="User" useCache="true">
SELECT * FROM user WHERE id = #{id}
</select>
```

```java
// 配置二级缓存
@CacheNamespace(eviction = LruCache.class, flushInterval = 60000, size = 512, readWrite = false)
public interface UserMapper {
    // 映射器方法
}
```

## 九、SpringBoot集成详解

### 9.1 添加依赖

```xml

<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.3.1</version>
</dependency>
```

### 9.2 配置文件

```yaml
# application.yml
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: true
    lazy-loading-enabled: true
    aggressive-lazy-loading: false
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 9.3 启动类配置

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 9.4 服务层使用

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
    
    public List<User> getUsersByCondition(UserQuery query) {
        return userMapper.selectByCondition(query);
    }
    
    public void createUser(User user) {
        userMapper.insert(user);
    }
    
    public void updateUser(User user) {
        userMapper.update(user);
    }
    
    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

## 十、最佳实践与常见问题

### 10.1 命名规范

```java
// 实体类命名
public class User {}           // 用户实体
public class UserProfile {}    // 用户档案
public class UserOrder {}      // 用户订单

// 映射器接口命名
public interface UserMapper {}      // 用户映射器
public interface OrderMapper {}     // 订单映射器

// 映射器XML命名
UserMapper.xml      // 用户映射器XML
OrderMapper.xml     // 订单映射器XML
```

### 10.2 结果映射优化

```xml
<!-- 使用resultMap避免字段映射问题 -->
<resultMap id="UserResultMap" type="User">
    <id column="id" property="id"/>
    <result column="username" property="username"/>
    <result column="email" property="email"/>
    <result column="create_time" property="createTime"/>
    <result column="update_time" property="updateTime"/>
</resultMap>

        <!-- 使用resultMap -->
<select id="selectById" resultMap="UserResultMap">
SELECT id, username, email, create_time, update_time
FROM user WHERE id = #{id}
</select>
```

### 10.3 批量操作优化

```java
// 使用批量操作提高性能
public void batchInsertUsers(List<User> users) {
    if (users != null && !users.isEmpty()) {
        userMapper.batchInsert(users);
    }
}

public void batchUpdateUsers(List<User> users) {
    if (users != null && !users.isEmpty()) {
        userMapper.batchUpdate(users);
    }
}
```

### 10.4 动态SQL优化

```xml
<!-- 使用where标签避免WHERE关键字问题 -->
<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null and email != ''">
            AND email LIKE CONCAT('%', #{email}, '%')
        </if>
    </where>
</select>
```

### 10.5 常见问题与解决方案

#### 10.5.1 字段映射问题

```xml
<!-- 问题：数据库字段名与Java属性名不匹配 -->
<!-- 解决方案1：使用resultMap -->
<resultMap id="UserResultMap" type="User">
    <result column="user_name" property="username"/>
    <result column="user_email" property="email"/>
</resultMap>

        <!-- 解决方案2：开启驼峰命名转换 -->
<configuration>
<settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
</settings>
</configuration>
```

#### 10.5.2 参数类型问题

```xml
<!-- 问题：参数类型不匹配 -->
<!-- 解决方案：明确指定参数类型 -->
<select id="selectByStatus" resultType="User">
    SELECT * FROM user WHERE status = #{status,jdbcType=VARCHAR}
</select>

<select id="selectById" resultType="User">
SELECT * FROM user WHERE id = #{id,jdbcType=BIGINT}
</select>
```

#### 10.5.3 缓存问题

```java
// 问题：缓存数据不一致
// 解决方案：合理使用缓存，及时清理

// 在更新操作后清理相关缓存
public void updateUser(User user) {
    userMapper.update(user);
    // 清理相关缓存
    clearUserCache(user.getId());
}

private void clearUserCache(Long userId) {
    // 清理用户相关缓存
}
```

---

## 十一、MyBatis 注解大全

### 11.1 核心注解

#### 11.1.1 @Mapper
**作用**：标识这是一个Mapper接口
**使用场景**：在Mapper接口上使用，让Spring能够扫描到
**示例**：
```java
@Mapper
public interface UserMapper {
    // 映射器方法
}
```

#### 11.1.2 @MapperScan
**作用**：批量扫描Mapper接口
**使用场景**：在启动类上使用，指定要扫描的包
**示例**：
```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

#### 11.1.3 @Select
**作用**：定义查询SQL
**使用场景**：简单的查询操作
**示例**：
```java
@Select("SELECT * FROM user WHERE id = #{id}")
User selectById(Long id);

@Select("SELECT * FROM user WHERE username = #{username}")
User selectByUsername(String username);
```

#### 11.1.4 @Insert
**作用**：定义插入SQL
**使用场景**：简单的插入操作
**示例**：
```java
@Insert("INSERT INTO user (username, email, create_time) VALUES (#{username}, #{email}, #{createTime})")
int insert(User user);

@Insert("INSERT INTO user (username, email) VALUES (#{username}, #{email})")
@Options(useGeneratedKeys = true, keyProperty = "id")
int insertUser(User user);
```

#### 11.1.5 @Update
**作用**：定义更新SQL
**使用场景**：简单的更新操作
**示例**：
```java
@Update("UPDATE user SET username = #{username}, email = #{email} WHERE id = #{id}")
int update(User user);

@Update("UPDATE user SET status = #{status} WHERE id = #{id}")
int updateStatus(@Param("id") Long id, @Param("status") String status);
```

#### 11.1.6 @Delete
**作用**：定义删除SQL
**使用场景**：简单的删除操作
**示例**：
```java
@Delete("DELETE FROM user WHERE id = #{id}")
int deleteById(Long id);

@Delete("DELETE FROM user WHERE username = #{username}")
int deleteByUsername(String username);
```

### 11.2 参数注解

#### 11.2.1 @Param
**作用**：为参数指定名称
**使用场景**：当方法有多个参数时，需要明确指定参数名称
**示例**：
```java
@Select("SELECT * FROM user WHERE username = #{username} AND status = #{status}")
User selectByUsernameAndStatus(@Param("username") String username, @Param("status") String status);

@Update("UPDATE user SET status = #{status} WHERE id = #{id}")
int updateStatus(@Param("id") Long id, @Param("status") String status);
```

#### 11.2.2 @Options
**作用**：配置SQL执行选项
**使用场景**：配置主键生成、超时时间、缓存等选项
**示例**：
```java
@Insert("INSERT INTO user (username, email) VALUES (#{username}, #{email})")
@Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
int insert(User user);

@Select("SELECT * FROM user")
@Options(useCache = true, flushCache = false, timeout = 10000)
List<User> selectAll();
```

### 11.3 结果映射注解

#### 11.3.1 @Results
**作用**：定义结果映射
**使用场景**：复杂的字段映射，包括关联映射和集合映射
**示例**：
```java
@Select("SELECT u.*, p.real_name, p.phone FROM user u LEFT JOIN user_profile p ON u.id = p.user_id WHERE u.id = #{id}")
@Results({
    @Result(id = true, column = "id", property = "id"),
    @Result(column = "username", property = "username"),
    @Result(column = "email", property = "email"),
    @Result(column = "real_name", property = "profile.realName"),
    @Result(column = "phone", property = "profile.phone")
})
User selectUserWithProfile(Long id);
```

#### 11.3.2 @Result
**作用**：定义单个字段的映射
**使用场景**：在@Results中使用，定义具体的字段映射
**示例**：
```java
@Result(column = "user_name", property = "username"),
@Result(column = "create_time", property = "createTime"),
@Result(column = "update_time", property = "updateTime")
```

#### 11.3.3 @One
**作用**：定义一对一关联映射
**使用场景**：关联查询，一个对象关联另一个对象
**示例**：
```java
@Select("SELECT * FROM user WHERE id = #{id}")
@Results({
    @Result(id = true, column = "id", property = "id"),
    @Result(column = "id", property = "profile", 
            one = @One(select = "com.example.mapper.UserProfileMapper.selectByUserId"))
})
User selectUserWithProfile(Long id);
```

#### 11.3.4 @Many
**作用**：定义一对多关联映射
**使用场景**：关联查询，一个对象关联多个对象
**示例**：
```java
@Select("SELECT * FROM user WHERE id = #{id}")
@Results({
    @Result(id = true, column = "id", property = "id"),
    @Result(column = "id", property = "orders", 
            many = @Many(select = "com.example.mapper.OrderMapper.selectByUserId"))
})
User selectUserWithOrders(Long id);
```

### 11.4 缓存注解

#### 11.4.1 @CacheNamespace
**作用**：配置命名空间级别的缓存
**使用场景**：为整个Mapper接口配置缓存策略
**示例**：
```java
@CacheNamespace(eviction = LruCache.class, flushInterval = 60000, size = 512, readWrite = false)
public interface UserMapper {
    // 映射器方法
}
```

#### 11.4.2 @Options中的缓存选项
**作用**：配置单个方法的缓存选项
**使用场景**：为特定方法配置缓存行为
**示例**：
```java
@Select("SELECT * FROM user WHERE id = #{id}")
@Options(useCache = true, flushCache = false)
User selectById(Long id);

@Update("UPDATE user SET status = #{status} WHERE id = #{id}")
@Options(flushCache = true)
int updateStatus(@Param("id") Long id, @Param("status") String status);
```

### 11.5 动态SQL注解

#### 11.5.1 @SelectProvider
**作用**：使用Provider类生成动态SQL
**使用场景**：复杂的动态SQL，需要根据条件动态生成
**示例**：
```java
@SelectProvider(type = UserSqlProvider.class, method = "selectByCondition")
List<User> selectByCondition(UserQuery query);

// UserSqlProvider类
public class UserSqlProvider {
    public String selectByCondition(UserQuery query) {
        return new SQL() {{
            SELECT("*");
            FROM("user");
            if (query.getUsername() != null) {
                WHERE("username LIKE CONCAT('%', #{username}, '%')");
            }
            if (query.getStatus() != null) {
                WHERE("status = #{status}");
            }
            ORDER_BY("create_time DESC");
        }}.toString();
    }
}
```

#### 11.5.2 @InsertProvider
**作用**：使用Provider类生成动态插入SQL
**使用场景**：根据条件动态生成插入语句
**示例**：
```java
@InsertProvider(type = UserSqlProvider.class, method = "insertUser")
int insertUser(User user);

// UserSqlProvider类中的方法
public String insertUser(User user) {
    return new SQL() {{
        INSERT_INTO("user");
        if (user.getUsername() != null) {
            VALUES("username", "#{username}");
        }
        if (user.getEmail() != null) {
            VALUES("email", "#{email}");
        }
        if (user.getCreateTime() != null) {
            VALUES("create_time", "#{createTime}");
        }
    }}.toString();
}
```

#### 11.5.3 @UpdateProvider
**作用**：使用Provider类生成动态更新SQL
**使用场景**：根据条件动态生成更新语句
**示例**：
```java
@UpdateProvider(type = UserSqlProvider.class, method = "updateUser")
int updateUser(User user);

// UserSqlProvider类中的方法
public String updateUser(User user) {
    return new SQL() {{
        UPDATE("user");
        if (user.getUsername() != null) {
            SET("username = #{username}");
        }
        if (user.getEmail() != null) {
            SET("email = #{email}");
        }
        WHERE("id = #{id}");
    }}.toString();
}
```

#### 11.5.4 @DeleteProvider
**作用**：使用Provider类生成动态删除SQL
**使用场景**：根据条件动态生成删除语句
**示例**：
```java
@DeleteProvider(type = UserSqlProvider.class, method = "deleteByCondition")
int deleteByCondition(UserQuery query);

// UserSqlProvider类中的方法
public String deleteByCondition(UserQuery query) {
    return new SQL() {{
        DELETE_FROM("user");
        if (query.getStatus() != null) {
            WHERE("status = #{status}");
        }
        if (query.getCreateTime() != null) {
            WHERE("create_time < #{createTime}");
        }
    }}.toString();
}
```

### 11.6 注解使用最佳实践

#### 11.6.1 注解 vs XML的选择
**使用注解的场景：**
1. **简单操作**：基本的CRUD操作
2. **团队熟悉注解**：开发团队更习惯使用注解
3. **快速原型**：需要快速开发原型

**使用XML的场景：**
1. **复杂SQL**：复杂的动态SQL、多表关联
2. **SQL优化**：需要频繁调整和优化SQL
3. **团队分工**：SQL由DBA或专门人员维护

#### 11.6.2 混合使用策略
**推荐做法：**
1. **简单操作用注解**：基本的增删改查
2. **复杂操作用XML**：复杂的查询、动态SQL
3. **统一管理**：在同一个Mapper中混合使用

**示例**：
```java
@Mapper
public interface UserMapper {
    // 简单操作使用注解
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
    
    @Insert("INSERT INTO user (username, email) VALUES (#{username}, #{email})")
    int insert(User user);
    
    // 复杂操作使用XML
    List<User> selectByComplexCondition(UserQuery query);
    
    List<User> selectWithAssociations(Long userId);
}
```

#### 11.6.3 注解的局限性
**注解的限制：**
1. **SQL长度**：长SQL在注解中可读性差
2. **动态SQL**：复杂的动态SQL难以用注解实现
3. **维护性**：SQL和Java代码耦合，不利于维护
4. **版本控制**：SQL变更难以跟踪和回滚

**解决方案：**
1. **使用Provider类**：将复杂SQL逻辑提取到Provider类
2. **合理分层**：简单操作用注解，复杂操作用XML
3. **统一规范**：制定团队的使用规范

---

## 总结

MyBatis是一个功能强大、设计优秀的持久层框架，它通过SQL与Java代码分离、动态SQL、插件机制等特性，为Java开发者提供了灵活、高效的数据库访问解决方案。

**核心优势：**
1. **学习成本低**：基于SQL，开发者容易理解
2. **灵活性高**：支持复杂SQL和动态SQL
3. **性能优秀**：缓存机制、批量操作、延迟加载
4. **扩展性好**：插件机制支持功能扩展
5. **与Spring集成好**：官方提供Spring集成包

**适用场景：**
1. **中小型项目**：配置简单，开发效率高
2. **复杂查询需求**：动态SQL、多表关联
3. **性能要求高**：缓存机制、批量操作
4. **团队熟悉SQL**：基于SQL，学习成本低

**学习建议：**
1. **掌握基础概念**：理解IoC、DI、AOP等核心概念
2. **熟悉配置方式**：掌握XML和注解两种配置方式
3. **理解动态SQL**：掌握if、choose、foreach等标签
4. **学习插件机制**：了解如何开发自定义插件
5. **实践项目应用**：在实际项目中应用所学知识
