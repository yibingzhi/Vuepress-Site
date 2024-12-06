---
title: SpringBoot集成Mybatis-plus
createTime: 2024/11/16 21:33:20
permalink: /SpringBoot/n34uuc8k/
---

### 一、MyBatis-Plus概述
- **简介**：
MyBatis-Plus（简称 MP）是一款基于 MyBatis 的增强型持久层框架。它在保留 MyBatis 强大灵活的 SQL 定制能力基础上，提供了诸多便捷的功能，极大地简化了开发流程，减少了大量重复的代码编写工作，提高了开发效率，让开发者能更聚焦于业务逻辑的实现，被广泛应用于各类 Java 项目中与数据库交互的场景。

### 二、项目集成 MyBatis-Plus
#### 1. 创建 Spring Boot 项目
- **使用 Spring Initializr（以常见开发工具为例）**：
在 IDE（如 IntelliJ IDEA、Eclipse 等）中利用 Spring Initializr 功能创建一个 Spring Boot 项目。创建时，依据项目具体功能需求勾选相应依赖，比如若项目涉及接口开发，可选择“Web”依赖，为后续集成 MyBatis-Plus 做准备。

#### 2. 添加依赖
- **Maven 项目添加依赖方式（示例版本，可按需更新）**：
在项目的 `pom.xml` 文件中添加如下依赖：
```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3</version>
</dependency>

<!-- SpringBoot3用下面这个 -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.9</version>
</dependency>

<!-- 添加对应数据库驱动依赖，以下以 MySQL 为例 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.34</version>
</dependency>
```
- **Gradle 项目添加依赖方式**：
在 `build.gradle` 文件中添加配置：
```groovy
implementation 'com.baomidou:mybatis-plus-boot-starter:3.5.3'
implementation 'mysql:mysql-connector-java:8.0.34'
```

#### 3. 配置数据库连接信息
- **在 `application.properties` 文件中配置（以 MySQL 数据库为例）**：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```
- **若使用 `application.yml` 文件配置（示例）**：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

#### 4. 配置 MyBatis-Plus 相关属性（可选，但常用配置举例）
- **配置 Mapper 接口扫描路径（方式一：在启动类添加注解）**：
如果不想给每个 Mapper 接口都添加 `@Mapper` 注解，可以在 Spring Boot 启动类上添加 `@MapperScan("com.example.demo.mapper")` 注解（此处假设 Mapper 接口所在包名为 `com.example.demo.mapper`），示例启动类代码如下：
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerPlugin;

@SpringBootApplication
@MapperScan("com.example.demo.mapper")
public class MyBatisPlusDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyBatisPlusDemoApplication.class, args);
    }
}
```

### 三、创建实体类与数据库表映射
根据数据库表结构创建对应的 Java 实体类，并且可利用 MyBatis-Plus 提供的注解来进一步配置实体类与表之间的映射关系，比如主键生成策略等。以数据库中有一张 `user` 表为例，表包含 `id`（主键）、`username`（用户名）、`password`（密码）等字段，对应的 `User` 实体类如下：
```java
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

@Data
public class Student {
    // 使用 @TableId 注解指定主键，并将主键生成策略设为自增（可根据实际数据库及业务需求选择合适策略）
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer age;
}
```

### 四、创建 Mapper 接口（继承 BaseMapper）
创建 Mapper 接口时，只需让其继承 MyBatis-Plus 提供的 `BaseMapper` 接口，就能够自动拥有常见的增删改查等基础数据库操作方法，无需像传统 MyBatis 那样手动编写大量 SQL 语句来实现这些基本功能。例如创建 `UserMapper` 接口：
```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.User;

public interface UserMapper extends BaseMapper<User> {
    // 这里可以根据具体业务需求额外添加自定义的数据库操作方法，通用的 CRUD 方法已由 BaseMapper 提供
}
```

### 五、常用功能及详细示例

#### 1. 通用 CRUD 操作
- **插入数据**：
在 Service 层（假设已注入 `UserMapper`），可以通过以下方式插入一条用户记录：
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public void insertUser(User user) {
        userMapper.insert(user);
    }
}
```
- **查询数据**：
    - **根据 ID 查询**：
通过主键 `id` 查询特定用户信息，示例代码如下：
```java
public User getUserById(Long id) {
    return userMapper.selectById(id);
}
```
    - **查询所有记录**：
获取所有用户信息列表，示例代码如下：
```java
public List<User> getUsers() {
    return userMapper.selectList(null);
}
```
    - **根据条件查询（借助条件构造器，后续详细介绍）**：
例如，查询用户名包含特定关键字的用户记录，示例代码如下：
```java
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.List;

public List<User> getUsersByUsername(String keyword) {
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.like("username", keyword);
    return userMapper.selectList(queryWrapper);
}
```
- **更新数据**：
例如，更新某个用户的密码，示例代码如下：
```java
public void updateUserPassword(Long id, String newPassword) {
    User user = new User();
    user.setId(id);
    user.setPassword(newPassword);
    userMapper.updateById(user);
}
```
- **删除数据**：
    - **根据 ID 删除**：
按照主键 `id` 删除特定用户记录，示例代码如下：
```java
public void deleteUserById(Long id) {
    userMapper.deleteById(id);
}
```
    - **根据条件删除（同样使用条件构造器）**：
例如，删除用户名以某个特定字符开头的用户记录，示例代码如下：
```java
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

public void deleteUsersByUsernamePrefix(String prefix) {
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.likeLeft("username", prefix);
    userMapper.delete(queryWrapper);
}
```

#### 2. 条件构造器（QueryWrapper、UpdateWrapper 等）
- **QueryWrapper 使用示例（用于构建查询条件）**：
    - **相等条件查询**：
查询用户名等于 `“admin”` 的用户，示例代码如下：
```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
queryWrapper.eq("username", "admin");
List<User> admins = userMapper.selectList(queryWrapper);
```
    - **范围条件查询（如 BETWEEN 操作）**：
查询年龄在 20 到 30 岁之间的用户，示例代码如下：
```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
queryWrapper.between("age", 20, 30);
List<User> usersInAgeRange = userMapper.selectList(queryWrapper);
```
    - **排序操作**：
按照用户的注册时间降序排列查询用户列表，示例代码如下：
```java
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
queryWrapper.orderByDesc("register_time");
List<User> sortedUsers = userMapper.selectList(queryWrapper);
```
- **UpdateWrapper 使用示例（用于构建更新条件）**：
例如，将用户名包含 `“test”` 的用户的密码都更新为 `“new_password”`，示例代码如下：
```java
UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
updateWrapper.like("username", "test");
User user = new User();
user.setPassword("new_password");
userMapper.update(user, updateWrapper);
```

#### 3. 分页查询
- **配置分页插件（前面配置类中已展示如何配置，此处回顾其作用及使用前提）**：
在 `MyBatisPlusConfig` 配置类中通过 `MybatisPlusInterceptor` 添加 `PaginationInnerPlugin` 分页插件（示例针对 MySQL 数据库配置了相应分页逻辑，不同数据库需做适当调整），这是使用分页功能的基础配置。
- **使用分页查询功能示例**：
```java
import com.baomidou.mybatisplus.core.metadata.Page;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.demo.entity.User;
import com.example.demo.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public Page<User> getUsersByPage(int currentPage, int pageSize) {
        Page<User> page = new Page<>(currentPage, pageSize);
        // 可以添加具体查询条件，此处先查询所有用户的分页情况，若有条件可利用 QueryWrapper 等添加
        userMapper.selectPage(page, Wrappers.emptyWrapper());
        return page;
    }
}
```
调用 `getUsersByPage` 方法时，传入当前页码和每页显示记录数，就能获取包含总记录数、当前页数据列表等详细信息的分页数据结果，方便进行分页展示等操作。

#### 4. 代码自动生成
MyBatis-Plus 提供了强大的代码生成器，能够依据数据库表结构快速生成实体类、Mapper 接口、Service 层接口及实现类等代码，有效减少手动编写代码的工作量，提高项目开发初期的效率。以下是一个代码生成器的配置示例（可根据实际项目情况进行调整）：
```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.config.DataSourceConfig;
import com.baomidou.mybatisplus.generator.config.GlobalConfig;
import com.baomidou.mybatisplus.generator.config.PackageConfig;
import com.baomidou.mybatisplus.generator.config.StrategyConfig;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;

public class CodeGenerator {
    public static void main(String[] args) {
        // 代码生成器
        AutoGenerator mpg = new AutoGenerator();

        // 全局配置
        GlobalConfig gc = new GlobalConfig();
        String projectPath = System.getProperty("user.dir");
        gc.setOutputDir(projectPath + "/src/main/java");
        gc.setAuthor("Your Name");
        gc.setOpen(false);
        gc.setDateType(DateType.ONLY_DATE);
        gc.setIdType(IdType.AUTO);
        mpg.setGlobalConfig(gc);

        // 数据源配置
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setDbType(DbType.MYSQL);
        dsc.setUrl("jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&characterEncoding=utf8");
        dsc.setUsername("your_username");
        dsc.setPassword("your_password");
        dsc.setDriverName("com.mysql.curator.jdbc.Driver");
        mpg.setDataSourceConfig(dsc);

        // 包配置
        PackageConfig pc = new PackageConfig();
        pc.setModuleName("demo");
        pc.setParent("com.example");
        mpg.setPackageConfig(pc);

        // 策略配置
        StrategyConfig strategy = new StrategyConfig();
        strategy.setNamingStrategy(NamingStrategy.underline_to_camel);
        strategy.setColumnNamingStrategy(NamingStrategy.underline_to_camel);
        strategy.setEntityLombokModel(true);
        strategy.setRestControllerStyle(true);
        mpg.setStrategyConfig(strategy);

        // 执行生成
        mpg.execute();
    }
}
```

### 六、高级功能及拓展（可选，根据项目需求深入学习使用）
- **逻辑删除**：
通过配置可以轻松实现逻辑删除功能，即不是真正从数据库中删除数据，而是通过修改某个字段（如 `deleted` 字段，值为 0 表示未删除，1 表示已删除）的值来标记数据的删除状态。在实体类中添加逻辑删除标识字段及相关注解，例如：
```java
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.myatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;

@Data
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    // 配置逻辑删除字段及默认值，这里假设 deleted 字段为 tinyint 类型，默认值 0 表示未删除
    @TableLogic(value = "0", delval = "1")
    private Integer deleted;
}
```
然后在配置文件或配置类中开启逻辑删除功能，之后执行删除操作时，就会自动更新该字段的值，查询时也会自动过滤已标记为删除的数据。
- **多租户功能**：
对于多租户系统，MyBatis-Plus 提供了相应支持，可通过配置租户相关的拦截器等机制，在 SQL 执行过程中自动添加租户标识条件，确保不同租户的数据隔离，实现多租户数据的安全访问与管理。不过多租户功能配置相对复杂些，需要根据具体的多租户模型（如基于字段、基于 Schema 等）进行详细的配置和代码编写。

### 七、总结
MyBatis-Plus 为 Java 项目的数据库持久层开发带来了极大的便利，其丰富的功能涵盖了从基础的通用 CRUD 操作到复杂的条件查询、分页查询，再到高级的逻辑删除、多租户等特性。在实际项目开发中，可以根据业务需求灵活运用这些功能，既能提高开发效率，又能保证数据库操作的规范性和可维护性，值得深入学习并熟练掌握，以便更好地应对各类项目中的数据库交互需求。

希望这份详细的笔记对你深入学习和使用 MyBatis-Plus 有所帮助，你可以结合实际项目进行实践操作，加深对各个功能的理解和运用能力。 