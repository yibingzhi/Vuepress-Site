---
title: SpringBoot集成Mybatis
createTime: 2024/11/16 21:30:40
permalink: /SpringBoot/4ik18wj3/
---
### 一、创建Spring Boot项目基础环境
- **使用Spring Initializr创建项目**：
通过常用的开发工具（如IntelliJ IDEA、Eclipse等）内置的Spring Initializr功能来创建Spring Boot项目。在创建过程中，按需选择项目所需的依赖，比如“Web”依赖（如果涉及提供接口服务等），这里重点聚焦后续Mybatis集成相关内容，确保项目能正常创建并启动。

### 二、添加Mybatis依赖
- **Maven项目添加依赖方式**：
在项目的`pom.xml`文件中添加如下Mybatis以及对应数据库驱动的依赖（以MySQL数据库为例，可根据实际情况调整）：
```xml
<!-- Mybatis依赖 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.2</version>
</dependency>
<!-- MySQL数据库驱动依赖 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.34</version>
</dependency>
```
- **Gradle项目添加依赖方式**：
在`build.gradle`文件中添加类似配置：
```groovy
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.2'
implementation 'mysql:mysql-connector-java:8.0.34'
```

### 三、配置数据库连接信息
- **在`application.properties`文件中配置（以MySQL数据库为例）**：
```properties
# 数据库连接地址，修改为你实际的数据库名称等信息
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
# 数据库用户名
spring.datasource.username=your_username
# 数据库密码
spring.datasource.password=your_password
# 数据库驱动类（针对MySQL 8+）
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```
- **若使用`application.yml`文件配置（同样以MySQL为例）**：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
    username: your_username
    password: your_password
      driver-class-name: com.mysql.cj.jdbc.Driver
```

### 四、配置Mybatis相关属性（重点配置 `mapper-locations` 和 `type-aliases-package`）
- **在`application.properties`文件中配置Mybatis属性（示例）**：
```properties
# 配置Mybatis的SQL映射文件位置，告诉Mybatis去哪里找Mapper接口对应的XML文件
# classpath:mapper/*.xml表示在类路径下的mapper文件夹中查找所有以.xml为后缀的文件
mapper-locations=classpath:mapper/*.xml
# 配置Mybatis的类型别名包，这样在写SQL映射文件等时，可以直接使用实体类的简单类名，无需写全限定类名
type-aliases-package=org.example.mybatis.entity
```
- **若使用`application.yml`文件配置Mybatis属性（示例）**：
```yaml
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: org.example.mybatis.entity
```

### 五、创建实体类
根据数据库表结构创建对应的Java实体类，用于在程序中和数据库表记录进行映射。例如，数据库中有一张`book`表，包含`id`（主键）、`title`（书名）、`author`（作者）等字段，对应的Java实体类`Book`如下：
```java
package org.example.mybatis.entity;

public class Book {
    private Long id;
    private String title;
    private String author;

    // 生成对应的Getter、Setter方法以及构造函数等（可使用IDE自动生成功能）
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getAuthor() {
        return author;
    }
    public void setAuthor(String author) {
        this.author = author;
    }
}
```

### 六、创建Mapper接口
创建Mapper接口用于定义对数据库的操作方法，它会和Mybatis的SQL映射文件关联起来。例如创建`BookMapper`接口：
```java
package org.example.mybatis.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.example.mybatis.entity.Book;
import java.util.List;

@Mapper
public interface BookMapper {
    // 根据ID查询书籍信息
    Book findById(Long id);
    // 查询所有书籍信息
    List<Book> findAll();
    // 插入书籍记录，返回值可根据实际情况调整，比如返回插入后的自增ID等
    int insert(Book book);
    // 更新书籍信息
    int update(Book book);
    // 删除书籍记录
    int deleteById(Long id);
}
```
这里使用了`@Mapper`注解来表明这是一个Mybatis的Mapper接口，也可以选择在启动类上添加`@MapperScan("org.example.mybatis.mapper")`（根据实际Mapper接口所在包名调整）注解来扫描指定包下的所有Mapper接口，替代在每个Mapper接口上添加`@Mapper`注解的方式。

### 七、创建SQL映射文件
在项目的`resources`目录下创建`mapper`文件夹（遵循一般约定，名称可自定义），在该文件夹下创建和Mapper接口对应的SQL映射文件，文件名要和Mapper接口名一致（如`BookMapper.xml`），示例内容如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.example.mybatis.mapper.BookMapper">
    <!-- 根据ID查询书籍信息的SQL映射 -->
    <select id="findById" resultMap="BookResultMap">
        select * from book where id = #{id}
    </select>
    <!-- 查询所有书籍信息的SQL映射 -->
    <select id="findAll" resultMap="BookResultMap">
        select * from book
    </select>
    <!-- 插入书籍记录的SQL映射，使用useGeneratedKeys和keyProperty属性方便获取插入后的自增ID -->
    <insert id="insert" keyProperty="id" useGeneratedKeys="true">
        insert into book(title, author) values(#{title}, #{author})
    </insert>
    <!-- 更新书籍信息的SQL映射 -->
    <update id="update">
        update book set title = #{title}, author = #{author} where id = #{id}
    </update>
    <!-- 删除书籍记录的SQL映射 -->
    <delete id="deleteById">
        delete from book where id = #{id}
    </delete>

    <!-- 结果映射配置，用于将查询结果正确映射到实体类对象 -->
    <resultMap id="BookResultMap" type="Book">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="author" column="author"/>
    </resultMap>
</mapper>
```
由于配置了`type-aliases-package`，在上述SQL映射文件中的`resultMap`等地方可以直接使用`Book`（实体类的简单类名）来代表`org.example.mybatis.entity.Book`这个全限定类名了。

### 八、在Service层调用Mapper方法（可选，若项目有分层架构的话）
- **创建Service层接口**：
例如创建`BookService`接口，定义相关业务方法：
```java
package org.example.mybatis.service;

import org.example.mybatis.entity.Book;
import java.util.List;

public interface BookService {
    Book findById(Long id);
    List<Book> findAll();
    void insert(Book book);
    void update(Book book);
    void deleteById(Long id);
}
```
- **创建Service层实现类并注入Mapper接口**：
```java
package org.example.mybatis.service;

import org.example.mybatis.entity.Book;
import org.example.mybatis.mapper.BookMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookMapper bookMapper;

    @Override
    public Book findById(Long id) {
        return bookMapper.findById(id);
    }

    @Override
    public List<Book> findAll() {
        return bookMapper.findAll();
    }

    @Override
    public void insert(Book book) {
        bookMapper.insert(book);
    }

    @Override
    public void update(Book book) {
        bookMapper.update(book);
    }

    @Override
    public void deleteById(Long id) {
        bookMapper.deleteById(id);
    }
}
```

### 九、测试集成是否成功
- **编写单元测试类（以JUnit 5为例）**：
可以编写单元测试类来测试Mapper方法或者Service层方法是否能正常操作数据库，例如：
```java
package org.example.mybatis.test;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.example.mybatis.entity.Book;
import org.example.mybatis.service.BookService;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BookServiceTest {
    @Autowired
    private BookService bookService;

    @Test
    public void testFindById() {
        Long bookId = 1L; // 假设数据库中有ID为1的书籍记录
        Book book = bookService.findById(bookId);
        assertNotNull(book);
        assertEquals(bookId, book.getId());
    }
}
```

通过以上这些步骤，就可以在Spring Boot项目中成功集成Mybatis来进行数据库相关操作了。在实际应用中，还可以根据具体业务需求进一步优化和扩展相关功能，比如配置多数据源、使用Mybatis的高级特性（如缓存、动态SQL等）等。
