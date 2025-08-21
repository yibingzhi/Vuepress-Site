---
tags:
  - Java
  - 高级特性
  - 缓存
  - Caffeine
title: java缓存Caffeine详解
createTime: 2025/08/07 16:14:49
permalink: /java/基础语法/6bibg7ok/
---

## Java Caffeine 缓存详解

### 一、什么是 Caffeine？

**Caffeine** 是一个高性能的 Java 本地缓存库，由 Google 开发，基于 Guava Cache 的设计理念，但性能更加优秀。它是目前 Java
生态中最快的本地缓存实现之一。

#### 核心特点：

1. **高性能**：基于内存的高性能缓存，读写速度极快
2. **自动过期**：支持基于时间、访问频率的自动过期策略
3. **内存管理**：支持基于大小、权重的内存限制
4. **统计信息**：提供详细的缓存统计和监控
5. **线程安全**：完全线程安全，支持高并发访问
6. **异步支持**：支持异步加载和刷新
7. **驱逐策略**：支持多种缓存驱逐算法

#### 适用场景：

- **本地缓存**：应用内数据缓存
- **热点数据**：频繁访问的数据缓存
- **计算结果缓存**：避免重复计算
- **数据库查询缓存**：减少数据库压力
- **API响应缓存**：提高接口响应速度

---

### 二、Maven 依赖

```xml

<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.1.8</version>
</dependency>
```

---

### 三、基础使用

#### 1. 简单缓存创建

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class CaffeineBasicExample {
    
    public static void main(String[] args) {
        // 创建简单缓存
        Cache<String, String> cache = Caffeine.newBuilder()
                .maximumSize(100)  // 最大缓存条目数
                .expireAfterWrite(10, TimeUnit.MINUTES)  // 写入后10分钟过期
                .build();
        
        // 存储数据
        cache.put("key1", "value1");
        cache.put("key2", "value2");
        
        // 获取数据
        String value1 = cache.getIfPresent("key1");
        System.out.println("Value1: " + value1); // 输出: Value1: value1
        
        // 获取不存在的key
        String value3 = cache.getIfPresent("key3");
        System.out.println("Value3: " + value3); // 输出: Value3: null
        
        // 获取缓存大小
        System.out.println("Cache size: " + cache.estimatedSize());
    }
}
```

#### 2. 自动加载缓存

```java
import com.github.benmanes.caffeine.cache.LoadingCache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class CaffeineLoadingExample {
    
    public static void main(String[] args) {
        // 创建自动加载缓存
        LoadingCache<String, String> cache = Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .build(key -> {
                    // 当缓存中没有数据时，自动调用此方法加载数据
                    System.out.println("Loading data for key: " + key);
                    return "loaded_value_for_" + key;
                });
        
        // 获取数据，如果不存在会自动加载
        String value1 = cache.get("key1");
        System.out.println("Value1: " + value1); // 输出: Loading data for key: key1, Value1: loaded_value_for_key1
        
        // 再次获取相同key，不会重新加载
        String value1Again = cache.get("key1");
        System.out.println("Value1 again: " + value1Again); // 输出: Value1 again: loaded_value_for_key1
        
        // 批量获取
        Map<String, String> values = cache.getAll(Arrays.asList("key2", "key3"));
        System.out.println("Batch values: " + values);
    }
}
```

---

### 四、缓存配置详解

#### 1. 容量限制

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class CaffeineCapacityExample {
    
    public static void main(String[] args) {
        // 基于条目数量的限制
        Cache<String, String> countCache = Caffeine.newBuilder()
                .maximumSize(1000)  // 最多缓存1000个条目
                .build();
        
        // 基于权重的限制
        Cache<String, String> weightCache = Caffeine.newBuilder()
                .maximumWeight(1000)  // 最大权重1000
                .weigher((key, value) -> {
                    // 根据key和value计算权重
                    return key.length() + value.length();
                })
                .build();
        
        // 无限制缓存（不推荐，可能导致内存溢出）
        Cache<String, String> unlimitedCache = Caffeine.newBuilder()
                .build();
    }
}
```

#### 2. 过期策略

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

public class CaffeineExpirationExample {
    
    public static void main(String[] args) {
        // 写入后过期
        Cache<String, String> writeExpireCache = Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)  // 写入后10分钟过期
                .build();
        
        // 访问后过期
        Cache<String, String> accessExpireCache = Caffeine.newBuilder()
                .expireAfterAccess(5, TimeUnit.MINUTES)  // 访问后5分钟过期
                .build();
        
        // 自定义过期策略
        Cache<String, String> customExpireCache = Caffeine.newBuilder()
                .expireAfter(new Expiry<String, String>() {
                    @Override
                    public long expireAfterCreate(String key, String value, long currentTime) {
                        // 创建后立即过期
                        return 0;
                    }
                    
                    @Override
                    public long expireAfterUpdate(String key, String value, long currentTime, long currentDuration) {
                        // 更新后1小时过期
                        return TimeUnit.HOURS.toNanos(1);
                    }
                    
                    @Override
                    public long expireAfterRead(String key, String value, long currentTime, long currentDuration) {
                        // 读取后30分钟过期
                        return TimeUnit.MINUTES.toNanos(30);
                    }
                })
                .build();
    }
}
```

#### 3. 驱逐策略

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;

public class CaffeineEvictionExample {
    
    public static void main(String[] args) {
        // 基于大小的驱逐
        Cache<String, String> sizeEvictionCache = Caffeine.newBuilder()
                .maximumSize(100)
                .removalListener((key, value, cause) -> {
                    System.out.println("Removed: " + key + " = " + value + ", cause: " + cause);
                })
                .build();
        
        // 基于权重的驱逐
        Cache<String, String> weightEvictionCache = Caffeine.newBuilder()
                .maximumWeight(1000)
                .weigher((key, value) -> key.length() + value.length())
                .removalListener((key, value, cause) -> {
                    if (cause == RemovalCause.SIZE) {
                        System.out.println("Evicted due to size: " + key);
                    }
                })
                .build();
        
        // 基于时间的驱逐
        Cache<String, String> timeEvictionCache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .removalListener((key, value, cause) -> {
                    if (cause == RemovalCause.EXPIRED) {
                        System.out.println("Expired: " + key);
                    }
                })
                .build();
    }
}
```

---

### 五、高级特性

#### 1. 异步缓存

```java
import com.github.benmanes.caffeine.cache.AsyncCache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class CaffeineAsyncExample {
    
    public static void main(String[] args) throws Exception {
        // 创建异步缓存
        AsyncCache<String, String> asyncCache = Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .buildAsync();
        
        // 异步获取数据
        CompletableFuture<String> future1 = asyncCache.get("key1", key -> {
            // 模拟异步加载数据
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "async_value_for_" + key;
        });
        
        // 等待结果
        String result = future1.get();
        System.out.println("Async result: " + result);
        
        // 直接获取已存在的值
        CompletableFuture<String> future2 = asyncCache.getIfPresent("key1");
        if (future2 != null) {
            String cachedValue = future2.get();
            System.out.println("Cached value: " + cachedValue);
        }
    }
}
```

#### 2. 统计信息

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.stats.CacheStats;

public class CaffeineStatsExample {
    
    public static void main(String[] args) {
        // 启用统计信息
        Cache<String, String> cache = Caffeine.newBuilder()
                .maximumSize(100)
                .recordStats()  // 启用统计
                .build();
        
        // 执行一些操作
        cache.put("key1", "value1");
        cache.getIfPresent("key1");
        cache.getIfPresent("key2"); // 未命中
        
        // 获取统计信息
        CacheStats stats = cache.stats();
        System.out.println("Hit count: " + stats.hitCount());
        System.out.println("Miss count: " + stats.missCount());
        System.out.println("Hit rate: " + stats.hitRate());
        System.out.println("Load success count: " + stats.loadSuccessCount());
        System.out.println("Load failure count: " + stats.loadFailureCount());
        System.out.println("Total load time: " + stats.totalLoadTime());
        System.out.println("Eviction count: " + stats.evictionCount());
    }
}
```

#### 3. 刷新策略

```java
import com.github.benmanes.caffeine.cache.LoadingCache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

public class CaffeineRefreshExample {
    
    public static void main(String[] args) {
        // 创建支持刷新的缓存
        LoadingCache<String, String> refreshCache = Caffeine.newBuilder()
                .maximumSize(100)
                .refreshAfterWrite(5, TimeUnit.MINUTES)  // 写入后5分钟开始刷新
                .build(key -> {
                    System.out.println("Refreshing data for key: " + key);
                    return "refreshed_value_for_" + key + "_" + System.currentTimeMillis();
                });
        
        // 获取数据
        String value1 = refreshCache.get("key1");
        System.out.println("Initial value: " + value1);
        
        // 等待一段时间后再次获取，会触发刷新
        try {
            Thread.sleep(6000); // 等待6秒
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        String refreshedValue = refreshCache.get("key1");
        System.out.println("Refreshed value: " + refreshedValue);
        
        // 手动刷新
        refreshCache.refresh("key1");
    }
}
```

---

### 六、实际应用场景

#### 1. 数据库查询缓存

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

public class DatabaseCacheExample {
    
    private final Cache<String, User> userCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .build();
    
    public User getUserById(String userId) {
        return userCache.get(userId, key -> {
            // 从数据库加载用户信息
            return loadUserFromDatabase(key);
        });
    }
    
    private User loadUserFromDatabase(String userId) {
        // 模拟数据库查询
        System.out.println("Loading user from database: " + userId);
        return new User(userId, "User " + userId);
    }
    
    static class User {
        private String id;
        private String name;
        
        public User(String id, String name) {
            this.id = id;
            this.name = name;
        }
        
        // getters and setters
    }
}
```

#### 2. API响应缓存

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;

public class ApiCacheExample {
    
    private final Cache<String, ApiResponse> apiCache = Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .expireAfterAccess(5, TimeUnit.MINUTES)
            .build();
    
    public ApiResponse callExternalApi(String endpoint, String params) {
        String cacheKey = endpoint + "?" + params;
        
        return apiCache.get(cacheKey, key -> {
            // 调用外部API
            return callExternalApiService(endpoint, params);
        });
    }
    
    private ApiResponse callExternalApiService(String endpoint, String params) {
        // 模拟外部API调用
        System.out.println("Calling external API: " + endpoint + " with params: " + params);
        return new ApiResponse("data", 200);
    }
    
    static class ApiResponse {
        private String data;
        private int status;
        
        public ApiResponse(String data, int status) {
            this.data = data;
            this.status = status;
        }
        
        // getters and setters
    }
}
```

#### 3. 计算结果缓存

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.math.BigInteger;
import java.util.concurrent.TimeUnit;

public class ComputationCacheExample {
    
    private final Cache<Integer, BigInteger> factorialCache = Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build();
    
    public BigInteger calculateFactorial(int n) {
        return factorialCache.get(n, key -> {
            System.out.println("Calculating factorial for: " + key);
            return computeFactorial(key);
        });
    }
    
    private BigInteger computeFactorial(int n) {
        if (n <= 1) {
            return BigInteger.ONE;
        }
        
        BigInteger result = BigInteger.ONE;
        for (int i = 2; i <= n; i++) {
            result = result.multiply(BigInteger.valueOf(i));
        }
        return result;
    }
    
    public static void main(String[] args) {
        ComputationCacheExample example = new ComputationCacheExample();
        
        // 第一次计算，会执行计算
        BigInteger result1 = example.calculateFactorial(10);
        System.out.println("Factorial of 10: " + result1);
        
        // 第二次计算，从缓存获取
        BigInteger result2 = example.calculateFactorial(10);
        System.out.println("Factorial of 10 (cached): " + result2);
    }
}
```

---

### 七、性能优化建议

#### 1. 缓存大小设置

```java
// 根据内存情况设置合适的缓存大小
Cache<String, String> optimizedCache = Caffeine.newBuilder()
        .maximumSize(10000)  // 根据实际需求设置
        .maximumWeight(1000000)  // 设置权重限制
        .weigher((key, value) -> {
            // 根据实际内存占用计算权重
            return key.length() + value.length();
        })
        .build();
```

#### 2. 过期时间设置

```java
// 根据数据更新频率设置过期时间
Cache<String, String> timeOptimizedCache = Caffeine.newBuilder()
        .expireAfterWrite(30, TimeUnit.MINUTES)  // 数据更新不频繁
        .expireAfterAccess(10, TimeUnit.MINUTES)  // 访问后延长过期时间
        .build();
```

#### 3. 监控和调优

```java
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.stats.CacheStats;

public class CacheMonitoringExample {
    
    private final Cache<String, String> monitoredCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .recordStats()  // 启用统计
            .build();
    
    public void printCacheStats() {
        CacheStats stats = monitoredCache.stats();
        System.out.println("=== Cache Statistics ===");
        System.out.println("Hit Rate: " + String.format("%.2f%%", stats.hitRate() * 100));
        System.out.println("Hit Count: " + stats.hitCount());
        System.out.println("Miss Count: " + stats.missCount());
        System.out.println("Eviction Count: " + stats.evictionCount());
        System.out.println("Average Load Time: " + stats.averageLoadPenalty() + "ms");
        System.out.println("Total Load Time: " + stats.totalLoadTime() + "ms");
    }
}
```

---

### 八、常见问题和解决方案

#### 1. 内存溢出问题

```java
// 问题：缓存无限增长导致内存溢出
// 解决方案：设置合理的容量限制和过期策略

Cache<String, String> safeCache = Caffeine.newBuilder()
        .maximumSize(1000)  // 限制最大条目数
        .maximumWeight(1000000)  // 限制最大权重
        .expireAfterWrite(1, TimeUnit.HOURS)  // 设置过期时间
        .expireAfterAccess(30, TimeUnit.MINUTES)  // 访问后过期
        .removalListener((key, value, cause) -> {
            // 监控缓存移除情况
            System.out.println("Removed: " + key + ", cause: " + cause);
        })
        .build();
```

#### 2. 缓存穿透问题

```java
// 问题：大量请求查询不存在的数据
// 解决方案：使用布隆过滤器或缓存空值

public class CachePenetrationSolution {
    
    private final Cache<String, String> cache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build();
    
    public String getData(String key) {
        String value = cache.getIfPresent(key);
        if (value == null) {
            // 从数据库查询
            value = queryFromDatabase(key);
            if (value != null) {
                cache.put(key, value);
            } else {
                // 缓存空值，避免缓存穿透
                cache.put(key, "NULL_VALUE");
            }
        }
        return "NULL_VALUE".equals(value) ? null : value;
    }
    
    private String queryFromDatabase(String key) {
        // 模拟数据库查询
        return null; // 假设数据不存在
    }
}
```

#### 3. 缓存雪崩问题

```java
// 问题：大量缓存同时过期导致数据库压力
// 解决方案：设置随机过期时间

public class CacheAvalancheSolution {
    
    private final Cache<String, String> cache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(new Expiry<String, String>() {
                @Override
                public long expireAfterCreate(String key, String value, long currentTime) {
                    // 基础过期时间 + 随机时间，避免同时过期
                    long baseExpireTime = TimeUnit.MINUTES.toNanos(30);
                    long randomExpireTime = (long) (Math.random() * TimeUnit.MINUTES.toNanos(10));
                    return baseExpireTime + randomExpireTime;
                }
                
                @Override
                public long expireAfterUpdate(String key, String value, long currentTime, long currentDuration) {
                    return currentDuration;
                }
                
                @Override
                public long expireAfterRead(String key, String value, long currentTime, long currentDuration) {
                    return currentDuration;
                }
            })
            .build();
}
```

---

### 九、最佳实践总结

1. **合理设置缓存大小**：根据内存情况和业务需求设置合适的缓存容量
2. **设置过期策略**：根据数据更新频率设置合适的过期时间
3. **启用统计监控**：使用 `recordStats()` 监控缓存性能
4. **处理异常情况**：在加载函数中正确处理异常
5. **避免缓存穿透**：对空值进行适当处理
6. **防止缓存雪崩**：使用随机过期时间
7. **定期清理**：定期清理过期和无效的缓存数据
8. **监控内存使用**：监控缓存的内存使用情况
