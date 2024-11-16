---
title: es
createTime: 2024/11/16 21:48:49
permalink: /article/ftxo15sp/
---
Elasticsearch 是一个分布式搜索和分析引擎，广泛用于处理大规模数据。为了全面了解 Elasticsearch 的语法和功能，下面将详细介绍其索引管理、文档操作、查询、聚合等功能。

### 一、索引管理

#### 1. 创建索引

创建一个新的索引，设置分片和副本数量，以及字段映射。

```json
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  },
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "date": { "type": "date" },
      "views": { "type": "integer" }
    }
  }
}
```

#### 2. 查看索引

获取索引的配置信息和映射。

```json
GET /my_index
```

#### 3. 删除索引

删除一个索引。

```json
DELETE /my_index
```

#### 4. 更新索引设置

动态更新索引的设置，例如更改副本数量。

```json
PUT /my_index/_settings
{
  "number_of_replicas": 1
}
```

### 二、文档操作

#### 1. 添加或更新文档

向索引中添加文档或更新已有文档。

```json
PUT /my_index/_doc/1
{
  "title": "Elasticsearch Basics",
  "date": "2023-10-01",
  "views": 100
}
```

#### 2. 获取文档

通过文档 ID 获取文档。

```json
GET /my_index/_doc/1
```

#### 3. 删除文档

通过文档 ID 删除文档。

```json
DELETE /my_index/_doc/1
```

#### 4. 批量操作

批量添加、更新或删除文档。

```json
POST /_bulk
{ "index": { "_index": "my_index", "_id": "2" } }
{ "title": "Advanced Elasticsearch", "date": "2023-10-02", "views": 150 }
{ "delete": { "_index": "my_index", "_id": "1" } }
```

### 三、查询语法

#### 1. 匹配查询（Match Query）

用于全文搜索，支持分词。

```json
GET /my_index/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch"
    }
  }
}
```

#### 2. 术语查询（Term Query）

用于精确匹配，不进行分词。

```json
GET /my_index/_search
{
  "query": {
    "term": {
      "views": 100
    }
  }
}
```

#### 3. 布尔查询（Bool Query）

组合多个查询条件。

```json
GET /my_index/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "Elasticsearch" } }
      ],
      "filter": [
        { "range": { "views": { "gte": 100 } } }
      ]
    }
  }
}
```

#### 4. 范围查询（Range Query）

用于查找数值或日期范围内的文档。

```json
GET /my_index/_search
{
  "query": {
    "range": {
      "date": {
        "gte": "2023-01-01",
        "lte": "2023-12-31"
      }
    }
  }
}
```

#### 5. 多字段查询（Multi-Match Query）

在多个字段中搜索文本。

```json
GET /my_index/_search
{
  "query": {
    "multi_match": {
      "query": "Elasticsearch",
      "fields": ["title", "content"]
    }
  }
}
```

### 四、聚合（Aggregations）

#### 1. 术语聚合（Terms Aggregation）

用于按字段值分组。

```json
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "views_count": {
      "terms": {
        "field": "views"
      }
    }
  }
}
```

#### 2. 平均值聚合（Avg Aggregation）

计算字段的平均值。

```json
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "average_views": {
      "avg": {
        "field": "views"
      }
    }
  }
}
```

#### 3. 日期直方图聚合（Date Histogram Aggregation）

按日期间隔分组。

```json
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "views_over_time": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      }
    }
  }
}
```

### 五、排序和分页

#### 1. 排序

对搜索结果进行排序。

```json
GET /my_index/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    { "views": "desc" }
  ]
}
```

#### 2. 分页

控制返回结果的数量和起始位置。

```json
GET /my_index/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 10
}
```

### 六、全文搜索和高亮

#### 1. 模糊查询（Fuzzy Query）

查找与给定文本相似的文档。

```json
GET /my_index/_search
{
  "query": {
    "fuzzy": {
      "title": "Elasticsearch"
    }
  }
}
```

#### 2. 高亮显示（Highlighting）

在搜索结果中高亮显示匹配的文本。

```json
GET /my_index/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch"
    }
  },
  "highlight": {
    "fields": {
      "title": {}
    }
  }
}
```

### 七、总结

Elasticsearch 提供了丰富的功能来管理和查询数据。通过掌握这些语法和操作，您可以有效地使用 Elasticsearch 进行全文搜索、数据分析和实时数据处理。结合具体的业务需求和数据结构，灵活应用这些功能以达到最佳效果。