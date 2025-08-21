---
tags:
  - 数据库
  - NoSQL
  - Elasticsearch
  - ES
  - 搜索引擎
title: Elasticsearch
createTime: 2024/11/16 21:48:49
permalink: /article/k5kpqte4/
---

Elasticsearch 是一个分布式搜索和分析引擎，广泛用于处理大规模数据。为了全面了解 Elasticsearch
的语法和功能，下面将详细介绍其索引管理、文档操作、查询、聚合等功能。

### 一、索引管理

#### 1. 创建索引

创建一个新的索引，设置分片和副本数量，以及字段映射。

```bash
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "date": {
        "type": "date"
      },
      "views": {
        "type": "integer"
      }
    }
  }
}
```

#### 2. 查看索引

获取索引的配置信息和映射。

```bash
GET /my_index
```

#### 3. 删除索引

删除一个索引。

```bash
DELETE /my_index
```

#### 4. 更新索引设置

动态更新索引的设置，例如更改副本数量。

```bash
PUT /my_index/_settings
{
  "number_of_replicas": 1
}
```

### 二、文档操作

#### 1. 添加或更新文档

向索引中添加文档或更新已有文档。

```bash
PUT /my_index/_doc/1
{
  "title": "Elasticsearch Basics",
  "date": "2023-10-01",
  "views": 100
}
```

#### 2. 获取文档

通过文档 ID 获取文档。

```bash
GET /my_index/_doc/1
```

#### 3. 删除文档

通过文档 ID 删除文档。

```bash
DELETE /my_index/_doc/1
```

#### 4. 批量操作

批量添加、更新或删除文档。

```bash
POST /_bulk
{
  "index": {
    "_index": "my_index",
    "_id": "2"
  }
}
{
  "title": "Advanced Elasticsearch",
  "date": "2023-10-02",
  "views": 150
}
{
  "delete": {
    "_index": "my_index",
    "_id": "1"
  }
}
```

### 三、查询语法

#### 1. 匹配查询（Match Query）

用于全文搜索，支持分词。

```bash
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

```bash
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

```bash
GET /my_index/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "title": "Elasticsearch"
          }
        }
      ],
      "filter": [
        {
          "range": {
            "views": {
              "gte": 100
            }
          }
        }
      ]
    }
  }
}
```

#### 4. 范围查询（Range Query）

用于查找数值或日期范围内的文档。

```bash
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

```bash
GET /my_index/_search
{
  "query": {
    "multi_match": {
      "query": "Elasticsearch",
      "fields": [
        "title",
        "content"
      ]
    }
  }
}
```

### 四、聚合（Aggregations）

#### 1. 术语聚合（Terms Aggregation）

用于按字段值分组。

```bash
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

```bash
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

```bash
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

```bash
GET /my_index/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "views": "desc"
    }
  ]
}
```

#### 2. 分页

控制返回结果的数量和起始位置。

```bash
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

```bash
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

```bash
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

### 七、映射（Mapping）

映射定义了索引中文档的结构，包括字段类型、分析器等。

#### 1. 查看映射

```bash
GET /my_index/_mapping
```

#### 2. 动态映射

Elasticsearch会自动为新字段创建映射：

```bash
PUT /my_index/_doc/1
{
  "name": "John",
  "age": 30,
  "email": "john@example.com"
}
```

#### 3. 显式映射

创建索引时定义字段映射：

```bash
PUT /my_index
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard"
      },
      "age": {
        "type": "integer"
      },
      "email": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```

### 八、分析器（Analyzer）

分析器用于处理文本，包括字符过滤、分词和词元过滤。

#### 1. 内置分析器

- **standard**：默认分析器，按词切分并转为小写
- **simple**：按非字母切分并转为小写
- **whitespace**：按空格切分
- **stop**：类似simple，但会移除停用词
- **keyword**：不分析，整个字符串作为一个词
- **pattern**：使用正则表达式切分
- **language**：针对特定语言的分析器

#### 2. 自定义分析器

```bash
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  }
}
```

### 九、集群管理

#### 1. 集群健康状态

```bash
GET /_cluster/health
```

#### 2. 节点信息

```bash
GET /_nodes
```

#### 3. 分片分配

```bash
GET /_cat/shards
```

### 十、性能优化

#### 1. 索引优化

- 合理设置分片数量
- 使用合适的字段类型
- 避免深度嵌套的对象
- 使用别名管理索引

#### 2. 查询优化

- 使用filter上下文进行精确匹配
- 避免大结果集的深度分页
- 使用bool查询优化复杂条件
- 合理使用聚合

#### 3. 硬件和配置优化

- 调整堆内存大小（不超过32GB）
- 使用SSD存储
- 合理配置线程池
- 启用压缩传输

### 十一、数据备份与恢复

#### 1. 快照（Snapshot）

创建快照仓库：

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/my_backup"
  }
}
```

创建快照：

```bash
PUT /_snapshot/my_backup/snapshot_1?wait_for_completion=true
```

恢复快照：

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
```

### 十二、安全配置

#### 1. 启用安全功能

在elasticsearch.yml中配置：

```yaml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

#### 2. 用户管理

```bash
# 设置内置用户密码
bin/elasticsearch-setup-passwords auto

# 创建用户
POST /_security/user/myuser
{
  "password" : "mypassword",
  "roles" : [ "superuser" ],
  "full_name" : "My User"
}
```

### 十三、监控和诊断

#### 1. 内置监控

使用Elasticsearch的监控功能：

```bash
GET /_cluster/stats
GET /_nodes/stats
GET /_stats
```

#### 2. 慢查询日志

在elasticsearch.yml中配置：

```yaml
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms
```

### 十四、最佳实践

#### 1. 索引设计

- 根据数据增长和查询模式设计分片
- 使用索引模板确保映射一致性
- 定期创建新索引（如按时间分片）

#### 2. 查询设计

- 避免返回大量数据
- 使用filter上下文进行精确匹配
- 合理使用聚合避免性能问题

#### 3. 运维管理

- 定期监控集群健康状态
- 设置告警机制
- 制定备份和恢复策略
- 定期更新和维护

### 十五、常见问题和解决方案

#### 1. 内存不足

- 调整堆内存大小
- 优化查询和聚合
- 增加节点扩展集群

#### 2. 分片问题

- 避免过多的小分片
- 合理设置分片数量
- 定期优化分片分配

#### 3. 性能问题

- 分析慢查询日志
- 优化映射和查询
- 调整配置参数

### 十六、总结

Elasticsearch 提供了丰富的功能来管理和查询数据。通过掌握这些语法和操作，您可以有效地使用 Elasticsearch
进行全文搜索、数据分析和实时数据处理。结合具体的业务需求和数据结构，灵活应用这些功能以达到最佳效果。
