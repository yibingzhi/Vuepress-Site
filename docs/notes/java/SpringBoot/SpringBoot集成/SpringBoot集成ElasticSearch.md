---
title: SpringBoot集成ElasticSearch
createTime: 2024/11/13 21:57:26
permalink: /SpringBoot/SpringBoot集成/c4640cbv/
---

::: tip 保鲜说明（2026-08）
面向 **Spring Boot 3.x + Elasticsearch 8.x**：要求 **JDK 17+**；客户端由 Spring Data Elasticsearch 封装，连接配置使用 `spring.elasticsearch.uris`；示例密码均为占位符，请勿提交真实凭证。
:::

## 一、Elasticsearch 简介

Elasticsearch（ES）是基于 Lucene 的分布式搜索与分析引擎，常用于：

- 全文检索（商品、文章、日志）
- 聚合统计（销量、UV）
- 日志分析（ELK 栈）

Spring 通过 **Spring Data Elasticsearch** 提供 `ElasticsearchRepository` 和 `ElasticsearchOperations`，简化 CRUD 与查询。

---

## 二、环境要求

| 组件 | 版本建议 |
|------|---------|
| JDK | **17+**（ES 8 官方要求） |
| Spring Boot | 3.2+ |
| Elasticsearch | 8.x |

### 2.1 Docker 启动 ES 8

```bash
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=true" \
  -e "ELASTIC_PASSWORD=your_elastic_password" \
  docker.elastic.co/elasticsearch/elasticsearch:8.15.0
```

验证：

```bash
curl -u elastic:your_elastic_password http://localhost:9200
```

---

## 三、创建项目与依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

---

## 四、连接配置

### 4.1 application.yml

```yaml
spring:
  elasticsearch:
    uris: http://localhost:9200
    username: elastic
    password: your_elastic_password   # 占位符，请替换为实际密码
    connection-timeout: 5s
    socket-timeout: 30s
```

### 4.2 多节点集群

```yaml
spring:
  elasticsearch:
    uris:
      - http://es-node1:9200
      - http://es-node2:9200
      - http://es-node3:9200
    username: elastic
    password: your_elastic_password
```

### 4.3 HTTPS + 自签证书（开发环境）

```yaml
spring:
  elasticsearch:
    uris: https://localhost:9200
    username: elastic
    password: your_elastic_password
    # 开发可关闭证书校验（生产勿用）
    restclient:
      ssl:
        bundle: es-ssl
```

---

## 五、索引 Mapping 设计

Mapping 定义字段类型与分析器，**最好在写入前确定**，避免动态映射导致类型冲突。

### 5.1 索引 Mapping 草图（JSON）

```json
PUT /product
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "ik_smart_analyzer": {
          "type": "custom",
          "tokenizer": "ik_smart"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id":       { "type": "keyword" },
      "name":     { "type": "text", "analyzer": "ik_max_word", "search_analyzer": "ik_smart" },
      "category": { "type": "keyword" },
      "price":    { "type": "double" },
      "stock":    { "type": "integer" },
      "description": { "type": "text", "analyzer": "ik_max_word" },
      "createdAt": { "type": "date", "format": "yyyy-MM-dd HH:mm:ss||epoch_millis" },
      "tags":     { "type": "keyword" }
    }
  }
}
```

> 中文分词需安装 **IK 分词器** 插件。无 IK 时可用默认 `standard` 分析器。

### 5.2 字段类型选择

| 类型 | 用途 | 示例 |
|------|------|------|
| `keyword` | 精确匹配、聚合、排序 | id、状态、标签 |
| `text` | 全文检索 | 标题、描述 |
| `date` | 日期范围查询 | 创建时间 |
| `double` / `long` | 数值范围 | 价格、库存 |
| `nested` | 嵌套对象数组 | 订单明细 |
| `geo_point` | 地理位置 | 门店坐标 |

---

## 六、实体类（Document）

```java
package com.example.es.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(indexName = "product")
@Setting(shards = 1, replicas = 1)
public class Product {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String name;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Double)
    private Double price;

    @Field(type = FieldType.Integer)
    private Integer stock;

    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String description;

    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second)
    private LocalDateTime createdAt;

    @Field(type = FieldType.Keyword)
    private List<String> tags;
}
```

**注解说明：**

| 注解 | 作用 |
|------|------|
| `@Document` | 指定索引名 |
| `@Id` | 文档主键 |
| `@Field` | 字段类型、分析器 |
| `@Setting` | 分片、副本等索引设置 |

---

## 七、Repository 接口

```java
package com.example.es.repository;

import com.example.es.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductRepository extends ElasticsearchRepository<Product, String> {

    // 方法名查询：name 精确匹配（keyword 子字段场景）或默认映射
    List<Product> findByCategory(String category);

    Page<Product> findByPriceBetween(Double min, Double max, Pageable pageable);

    List<Product> findByTagsIn(List<String> tags);

    // 自定义 JSON 查询
    @Query("""
        {
          "bool": {
            "must": [
              { "match": { "name": { "query": "?0", "analyzer": "ik_smart" } } }
            ],
            "filter": [
              { "range": { "price": { "gte": ?1, "lte": ?2 } } }
            ]
          }
        }
        """)
    List<Product> searchByNameAndPriceRange(String keyword, Double minPrice, Double maxPrice);
}
```

---

## 八、ElasticsearchOperations 复杂查询

Repository 适合简单场景；复杂搜索用 `ElasticsearchOperations` 或 `NativeQuery`。

```java
@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final ElasticsearchOperations elasticsearchOperations;

    public SearchHits<Product> advancedSearch(ProductSearchRequest req) {
        NativeQuery query = NativeQuery.builder()
            .withQuery(q -> q.bool(b -> {
                if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                    b.must(m -> m.multiMatch(mm -> mm
                        .query(req.getKeyword())
                        .fields("name^3", "description")
                        .fuzziness("AUTO")
                    ));
                }
                if (req.getCategory() != null) {
                    b.filter(f -> f.term(t -> t.field("category").value(req.getCategory())));
                }
                if (req.getMinPrice() != null || req.getMaxPrice() != null) {
                    b.filter(f -> f.range(r -> {
                        r.field("price");
                        if (req.getMinPrice() != null) r.gte(JsonData.of(req.getMinPrice()));
                        if (req.getMaxPrice() != null) r.lte(JsonData.of(req.getMaxPrice()));
                        return r;
                    }));
                }
                return b;
            }))
            .withPageable(PageRequest.of(req.getPage(), req.getSize()))
            .withSort(s -> s.field(f -> f.field("createdAt").order(SortOrder.Desc)))
            .withHighlightQuery(new HighlightQuery(
                new Highlight(List.of(
                    new HighlightField("name"),
                    new HighlightField("description")
                )), Product.class))
            .build();

        return elasticsearchOperations.search(query, Product.class);
    }
}
```

---

## 九、常用查询示例

### 9.1 Match 全文检索

```json
GET /product/_search
{
  "query": {
    "match": {
      "name": {
        "query": "无线耳机",
        "analyzer": "ik_smart"
      }
    }
  }
}
```

### 9.2 Term 精确匹配

```json
{
  "query": {
    "term": { "category": "electronics" }
  }
}
```

### 9.3 Bool 组合查询

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "手机" } }
      ],
      "filter": [
        { "range": { "price": { "gte": 1000, "lte": 5000 } } },
        { "term": { "category": "electronics" } }
      ],
      "must_not": [
        { "term": { "stock": 0 } }
      ]
    }
  }
}
```

### 9.4 聚合统计

```json
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category", "size": 10 },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } }
      }
    }
  }
}
```

### 9.5 分页

```json
{
  "from": 0,
  "size": 10,
  "query": { "match_all": {} },
  "sort": [{ "createdAt": "desc" }]
}
```

> 深分页（`from` 很大）性能差，推荐 `search_after` 游标分页。

---

## 十、Service 与 Controller

### 10.1 Service

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSearchService searchService;

    public Product save(Product product) {
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
        return productRepository.save(product);
    }

    public Optional<Product> findById(String id) {
        return productRepository.findById(id);
    }

    public void deleteById(String id) {
        productRepository.deleteById(id);
    }

    public Page<Product> findByPriceRange(Double min, Double max, Pageable pageable) {
        return productRepository.findByPriceBetween(min, max, pageable);
    }

    public SearchHits<Product> search(ProductSearchRequest req) {
        return searchService.advancedSearch(req);
    }

    public List<Product> searchByNameAndPriceRange(String keyword, Double min, Double max) {
        return productRepository.searchByNameAndPriceRange(keyword, min, max);
    }
}
```

### 10.2 Controller

```java
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.save(product);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable String id) {
        return productService.findById(id).orElseThrow();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        productService.deleteById(id);
    }

    @GetMapping("/search")
    public List<Product> searchByName(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") Double minPrice,
            @RequestParam(defaultValue = "999999") Double maxPrice) {
        return productService.searchByNameAndPriceRange(keyword, minPrice, maxPrice);
    }

    @PostMapping("/advanced-search")
    public Map<String, Object> advancedSearch(@RequestBody ProductSearchRequest req) {
        SearchHits<Product> hits = productService.search(req);
        List<Map<String, Object>> items = hits.getSearchHits().stream()
            .map(hit -> {
                Map<String, Object> map = new HashMap<>();
                map.put("product", hit.getContent());
                map.put("score", hit.getScore());
                map.put("highlights", hit.getHighlightFields());
                return map;
            })
            .toList();
        return Map.of("total", hits.getTotalHits(), "items", items);
    }
}
```

---

## 十二、常见问题

### 12.1 连接失败

- 检查 `uris`、用户名密码（占位符是否已替换）
- ES 8 默认开启安全认证，不能用空密码
- Docker 内存不足会导致 ES 启动失败，至少分配 2GB

### 12.2 text vs keyword

对 `text` 字段做排序/聚合需 `.keyword` 子字段，或单独建 `keyword` 字段。

### 12.3 敏感信息

**切勿**在配置文件中提交真实密码到 Git；使用环境变量 `${ELASTIC_PASSWORD:changeme}`。

---

## 十三、小结

| 主题 | 要点 |
|------|------|
| 版本 | JDK 17+、ES 8.x、Boot 3 |
| 配置 | `spring.elasticsearch.uris` + 认证占位符 |
| Mapping | 提前设计字段类型与分析器 |
| CRUD | `ElasticsearchRepository` |
| 复杂查询 | `ElasticsearchOperations` + NativeQuery |
| 生产 | 密码用环境变量、MQ 同步、reindex 变更 |

掌握以上内容，即可在 Spring Boot 3 中完成 Elasticsearch 的集成与全文检索开发。
