---
title: SpringBoot集成ElasticSearch
createTime: 2024/11/13 21:57:26
permalink: /SpringBoot/frwef5qf/
---

### 前提条件

1. **Java Development Kit (JDK)**: 确保安装了 JDK 8 或更高版本。
2. **Maven**: 确保安装了 Maven，用于构建项目。
3. **Elasticsearch**: 安装并运行 Elasticsearch。可以在本地安装，也可以使用云服务。

### 创建 Spring Boot 项目

你可以使用 Spring Initializr 创建一个新的 Spring Boot 项目：

1. 打开 [Spring Initializr](https://start.spring.io/)。
2. 填写项目元数据（如 Group、Artifact）。
3. 选择依赖项：
   - Spring Web
   - Spring Data Elasticsearch

点击“Generate”按钮下载项目压缩包，并解压到你的工作目录。

### 配置 Maven 依赖

在 `pom.xml` 文件中，确保添加了 Elasticsearch 客户端的依赖：

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-elasticsearch</artifactId>
		</dependency>
```

### 配置 Elasticsearch 连接

在 `src/main/resources/application.properties` 中，配置 Elasticsearch 的连接信息：

```properties
spring.elasticsearch.uris=http://localhost:9200
spring.elasticsearch.username=elastic
spring.elasticsearch.password=2_6Wm1sandmErqEkjXfB
```

### 定义实体类

创建一个实体类来表示你的数据模型，并用注解进行标注：

```java
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Data
@Document(indexName = "product")  
//这个注解是将这个java类映射到Elasticsearch的 product 这个索引上
public class Product {

    @Id
    private String id;
    private String name;
    private Double price;
    private String description;
}
```

### 创建 Repository 接口

创建一个接口继承 `ElasticsearchRepository`，用于与 Elasticsearch 进行交互：

```java
import org.example.es.entity.Product;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductRepository extends ElasticsearchRepository<Product, String> {
    // 可以定义自定义查询方法
    List<Product> findByName(String name);
    // 自定义查询方法 用了ik分词器
    @Query("{\"match\": {\"name\": {\"query\": \"?0\", \"analyzer\": \"ik_max_word\"}}}")
    List<Product> findByNameUsingCustomAnalyzer(String name);
}

```

### 实现服务类

在服务类中注入 `ProductRepository`，并实现基本的 CRUD 操作：

```java
import org.example.es.ProductRepository;
import org.example.es.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public void saveProduct(Product product) {
        productRepository.save(product);
    }

    public Product findProductById(String id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> findProductByName(String name) {
        return productRepository.findByName(name);
    }

    public List<Product> findProductByName2(String name) {
        return productRepository.findByNameUsingCustomAnalyzer(name);
    }

}
```

### 创建控制器

创建一个控制器类来处理 HTTP 请求：

```java
import org.example.es.entity.Product;
import org.example.es.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public void addProduct(@RequestBody Product product) {
        productService.saveProduct(product);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable String id) {
        return productService.findProductById(id);
    }

    @GetMapping("/search")
    public List<Product> searchProductByName(@RequestParam String name) {
        return productService.findProductByName(name);
    }
    @GetMapping("/search2")
    public List<Product> searchProductByName2(@RequestParam String name) {
        return productService.findProductByName2(name);
    }
}
```

### 运行和测试

1. 启动 Spring Boot 应用程序。
2. 使用 Postman 或其他 HTTP 客户端测试 API：
   - **POST** `http://localhost:8080/products` 添加产品。
   
   - **GET** `http://localhost:8080/products/{id}` 获取特定产品。
   
   - **GET** `http://localhost:8080/products/search?name=productName` 根据名称搜索产品。
   
   - **GET** `http://localhost:8080/products/search2?name=productName` 根据名称搜索产品。



   