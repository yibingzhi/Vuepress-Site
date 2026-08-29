---
tags:
  - Java
  - JUC
  - 线程池
  - CompletableFuture
  - 并发
title: 线程池与CompletableFuture详解
createTime: 2026/08/29 16:00:00
permalink: /article/thread-pool-completable-future/
---

::: tip Java 21+ 选型
CPU 密集型任务仍用 **有界 ThreadPoolExecutor**；IO 密集型可评估 **虚拟线程**（`Executors.newVirtualThreadPerTaskExecutor()`）。勿盲目用 `ForkJoinPool.commonPool()` 跑阻塞 IO。
:::

## 一、为什么需要线程池

| 问题 | 线程池解决 |
|------|------------|
| 频繁创建/销毁线程开销大 | 复用工作线程 |
| 无限制创建导致 OOM | 有界队列 + 拒绝策略 |
| 任务调度混乱 | 统一管理与监控 |

---

## 二、ThreadPoolExecutor 核心参数

```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 非核心线程空闲存活时间
    TimeUnit unit,
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,
    RejectedExecutionHandler handler    // 拒绝策略
)
```

### 2.1 执行流程

```
提交任务
   │
   ▼
当前线程数 < corePoolSize? ──是──► 创建核心线程执行
   │否
   ▼
队列未满? ──是──► 入队等待
   │否
   ▼
当前线程数 < maximumPoolSize? ──是──► 创建非核心线程执行
   │否
   ▼
执行拒绝策略 RejectedExecutionHandler
```

### 2.2 参数选型参考

| 场景 | core | max | 队列 |
|------|------|-----|------|
| CPU 密集 | N+1 | N+1 | 有界，较小 |
| IO 密集 | 2N | 4N | 有界 LinkedBlockingQueue |
| 突发流量 | 按基准 QPS | 2×core | ArrayBlockingQueue + 监控 |

`N = Runtime.getRuntime().availableProcessors()`

### 2.3 完整创建示例

```java
@Configuration
public class ThreadPoolConfig {

    @Bean(name = "bizExecutor", destroyMethod = "shutdown")
    public ThreadPoolExecutor bizExecutor() {
        int cores = Runtime.getRuntime().availableProcessors();

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            cores,
            cores * 2,
            60L,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(500),
            new ThreadFactoryBuilder()
                .setNameFormat("biz-pool-%d")
                .setDaemon(false)
                .build(),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );

        executor.allowCoreThreadTimeOut(false);
        return executor;
    }
}
```

使用 Guava `ThreadFactoryBuilder` 或手写 `ThreadFactory` 设置有意义线程名，便于排查。

---

## 三、BlockingQueue 选择

| 队列 | 特点 | 适用 |
|------|------|------|
| `ArrayBlockingQueue` | 有界、数组、一把锁 | 默认首选，防止 OOM |
| `LinkedBlockingQueue` | 可有界或无界 | 明确 capacity 时用有界构造 |
| `SynchronousQueue` | 不存储，直接交接 | `newCachedThreadPool` 底层 |
| `PriorityBlockingQueue` | 优先级 | 任务有优先级差异 |
| `DelayQueue` | 延迟执行 | 定时任务 |

```java
// ❌ 危险：无界队列 + 大 max，任务堆积导致内存暴涨
new LinkedBlockingQueue<>()

// ✅ 明确容量
new LinkedBlockingQueue<>(1000)
```

---

## 四、RejectedExecutionHandler 拒绝策略

| 策略 | 行为 |
|------|------|
| `AbortPolicy`（默认） | 抛 `RejectedExecutionException` |
| `CallerRunsPolicy` | 调用者线程执行，起到背压 |
| `DiscardPolicy` | 静默丢弃 |
| `DiscardOldestPolicy` | 丢弃队列最旧任务，再提交 |

### 4.1 自定义拒绝策略

```java
public class MetricsRejectHandler implements RejectedExecutionHandler {

    private final Counter rejectCounter;
    private final RejectedExecutionHandler delegate;

    public MetricsRejectHandler(MeterRegistry registry) {
        this.rejectCounter = registry.counter("threadpool.rejected.total");
        this.delegate = new ThreadPoolExecutor.CallerRunsPolicy();
    }

    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        rejectCounter.increment();
        log.warn("Task rejected, poolSize={}, active={}, queue={}",
            executor.getPoolSize(),
            executor.getActiveCount(),
            executor.getQueue().size());
        delegate.rejectedExecution(r, executor);
    }
}
```

### 4.2 何时用 CallerRunsPolicy

适合 **不能丢任务** 且可接受主线程略慢的场景；注意避免在 HTTP 请求线程上执行过重任务导致超时。

---

## 五、Executors 工厂方法（慎用）

```java
// ❌ 不推荐：无界队列，max = Integer.MAX_VALUE
Executors.newFixedThreadPool(10);

// ❌ 不推荐：无界线程数
Executors.newCachedThreadPool();

// ✅ Java 21 虚拟线程
ExecutorService virtual = Executors.newVirtualThreadPerTaskExecutor();

// ✅ 单线程有序
Executors.newSingleThreadExecutor();
```

生产环境 **显式构造 ThreadPoolExecutor**，参数透明可控。

---

## 六、线程池监控

```java
@Component
@RequiredArgsConstructor
public class ThreadPoolMetrics {

    @PostConstruct
    public void bind(@Qualifier("bizExecutor") ThreadPoolExecutor executor,
                     MeterRegistry registry) {
        Gauge.builder("threadpool.active", executor, ThreadPoolExecutor::getActiveCount)
            .tag("pool", "biz")
            .register(registry);
        Gauge.builder("threadpool.queue.size", executor, e -> e.getQueue().size())
            .tag("pool", "biz")
            .register(registry);
        Gauge.builder("threadpool.pool.size", executor, ThreadPoolExecutor::getPoolSize)
            .tag("pool", "biz")
            .register(registry);
    }
}
```

JDK 21+ 可用 `ThreadPoolExecutor` 配合 JFR 事件分析线程池饱和。

---

## 七、优雅关闭

```java
public void shutdownGracefully(ExecutorService executor) {
    executor.shutdown();
    try {
        if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
            executor.shutdownNow();
            if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                log.error("Pool did not terminate");
            }
        }
    } catch (InterruptedException e) {
        executor.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

Spring `@PreDestroy` 或 `DisposableBean` 中调用，避免应用停止时任务被强杀。

---

## 八、CompletableFuture 基础

`CompletableFuture` 实现 `Future` + `CompletionStage`，支持链式异步组合。

### 8.1 创建异步任务

```java
// 默认 ForkJoinPool.commonPool()
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> fetchUser());

// 指定线程池（推荐）
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(
    () -> fetchOrder(),
    bizExecutor
);

// 无返回值
CompletableFuture<Void> cf3 = CompletableFuture.runAsync(() -> sendEmail(), bizExecutor);
```

### 8.2 获取结果

```java
// 阻塞
String user = cf1.get();
String user = cf1.get(3, TimeUnit.SECONDS);

// 非阻塞回调
cf1.thenAccept(user -> log.info("user={}", user));

// 异常处理
cf1.exceptionally(ex -> {
    log.error("failed", ex);
    return "default";
});
```

---

## 九、链式组合

### 9.1 thenApply / thenAccept / thenRun

```java
CompletableFuture<Integer> lengthFuture = CompletableFuture
    .supplyAsync(() -> httpGet("https://api.example.com/data"), bizExecutor)
    .thenApply(json -> parse(json))
    .thenApply(dto -> dto.items().size());
```

| 方法 | 入参 | 返回值 |
|------|------|--------|
| `thenApply` | T → U | `CompletableFuture<U>` |
| `thenAccept` | Consumer\<T\> | `CompletableFuture<Void>` |
| `thenRun` | Runnable | `CompletableFuture<Void>` |

### 9.2 thenCompose（扁平化）

```java
// thenApply 会嵌套 CompletableFuture<CompletableFuture<User>>
CompletableFuture<User> userFuture = CompletableFuture
    .supplyAsync(() -> userId, bizExecutor)
    .thenCompose(id -> CompletableFuture.supplyAsync(() -> loadUser(id), bizExecutor));
```

### 9.3 thenCombine（并行合并）

```java
CompletableFuture<String> userCf = CompletableFuture.supplyAsync(() -> loadUserName(), bizExecutor);
CompletableFuture<Integer> scoreCf = CompletableFuture.supplyAsync(() -> loadScore(), bizExecutor);

CompletableFuture<String> combined = userCf.thenCombine(scoreCf,
    (name, score) -> name + ":" + score);
```

### 9.4 allOf / anyOf

```java
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);
all.join(); // 等待全部完成

CompletableFuture<Object> any = CompletableFuture.anyOf(cf1, cf2);
Object first = any.join(); // 任一完成
```

收集 allOf 结果：

```java
List<CompletableFuture<String>> futures = ids.stream()
    .map(id -> CompletableFuture.supplyAsync(() -> fetch(id), bizExecutor))
    .toList();

CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new))
    .thenApply(v -> futures.stream()
        .map(CompletableFuture::join)
        .toList())
    .join();
```

---

## 十、异常与线程上下文

### 10.1 handle / whenComplete

```java
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> riskyCall(), bizExecutor)
    .whenComplete((result, ex) -> {
        if (ex != null) {
            log.warn("failed: {}", ex.getMessage());
        }
    })
    .handle((result, ex) -> ex != null ? "fallback" : result);
```

`whenComplete` 不改变结果；`handle` 可转换结果或吞掉异常。

### 10.2 exceptionally vs handle

```java
// exceptionally 仅处理异常分支
cf.exceptionally(ex -> defaultValue());

// handle 统一处理成功与失败
cf.handle((val, ex) -> ex == null ? val : defaultValue());
```

### 10.3 异步阶段的执行线程

```java
cf.thenApply(x -> x)           // 默认在**完成前一阶段**的线程执行（同线程优化）
cf.thenApplyAsync(x -> x)      // 提交到 commonPool 或指定 executor
cf.thenApplyAsync(x -> x, pool) // 指定线程池
```

需要隔离阻塞 IO 时，**显式传入业务线程池**。

---

## 十一、实战：聚合多服务数据

```java
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserClient userClient;
    private final OrderClient orderClient;
    private final ThreadPoolExecutor bizExecutor;

    public DashboardVO loadDashboard(Long userId) {
        CompletableFuture<UserDTO> userCf = CompletableFuture
            .supplyAsync(() -> userClient.getUser(userId), bizExecutor);

        CompletableFuture<List<OrderDTO>> ordersCf = CompletableFuture
            .supplyAsync(() -> orderClient.listRecent(userId), bizExecutor);

        CompletableFuture<DashboardVO> resultCf = userCf
            .thenCombine(ordersCf, (user, orders) -> new DashboardVO(user, orders))
            .orTimeout(3, TimeUnit.SECONDS);

        try {
            return resultCf.join();
        } catch (CompletionException e) {
            throw new ServiceException("Dashboard load failed", e.getCause());
        }
    }
}
```

Java 9+ `orTimeout` / `completeOnTimeout` 避免无限等待。

---

## 十二、ForkJoinPool.commonPool

- `CompletableFuture.supplyAsync()` 无 executor 时默认使用
- 并行流 `parallelStream()` 也使用 common pool
- 大小 = `max(cpus - 1, 1)`

```java
// 查看 common pool 并行度
System.out.println(ForkJoinPool.commonPool().getParallelism());
```

**不要**在 common pool 中执行长时间阻塞任务，会拖垮并行流与其他默认异步任务。

---

## 十三、虚拟线程 vs 传统线程池

### 13.1 虚拟线程特点（Java 21+）

- 轻量（可创建百万级）
- 阻塞时自动 unmount，不占用 OS 线程
- 适合 **高并发 IO**（HTTP、DB、RPC）

```java
@Configuration
public class VirtualThreadConfig {

    @Bean(destroyMethod = "close")
    public ExecutorService virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
```

```java
// Spring Boot 3.2+
spring.threads.virtual.enabled=true
```

### 13.2 对比表

| 维度 | ThreadPoolExecutor | 虚拟线程 |
|------|-------------------|----------|
| 适用 | CPU 密集、需严格限流 | IO 密集、高并发 |
| 资源 | 线程数有界 | 任务数可极大 |
| 背压 | 队列 + 拒绝策略 | 需信号量等自行限流 |
| 调试 | 成熟 | 注意 pin 载体线程（synchronized/native） |

### 13.3 虚拟线程注意事项

```java
// ❌ synchronized 块内阻塞 IO 可能 pin 载体线程（JDK 21，后续版本改进中）
synchronized (lock) {
    blockingIo();
}

// ✅ 使用 ReentrantLock 或纯虚拟线程友好代码
lock.lock();
try {
    blockingIo();
} finally {
    lock.unlock();
}
```

对下游限流仍需要 **Semaphore** 或 resilience4j：

```java
private final Semaphore dbLimiter = new Semaphore(50);

CompletableFuture.supplyAsync(() -> {
    dbLimiter.acquire();
    try {
        return queryDb();
    } finally {
        dbLimiter.release();
    }
}, virtualExecutor);
```

### 13.4 选型建议

```
CPU 密集计算     → 固定大小 ThreadPoolExecutor（≈ CPU 核数）
IO 密集 HTTP 聚合 → 虚拟线程 + orTimeout
需严格队列与拒绝  → ThreadPoolExecutor
定时/延迟任务    → ScheduledThreadPoolExecutor 或 Spring @Scheduled
```

---

## 十四、ThreadLocal 与线程池

线程池复用线程，**必须**在任务结束时清理 ThreadLocal：

```java
private static final ThreadLocal<UserContext> CTX = new ThreadLocal<>();

bizExecutor.execute(() -> {
    try {
        CTX.set(loadContext());
        doWork();
    } finally {
        CTX.remove(); // 防止泄漏与串数据
    }
});
```

虚拟线程下 ThreadLocal 仍有效，但量极大时注意内存；优先显式传参。

---

## 十五、常见反模式

| 反模式 | 问题 |
|--------|------|
| `get()` 无超时 | 永久阻塞 |
| 嵌套 `join()` 在同池 | 死锁（池耗尽） |
| 无界队列线程池 | OOM |
| 在 `@Transactional` 内异步 | 事务上下文丢失 |
| 忽略 `exceptionally` | 异常静默 |

```java
// 死锁示例：池大小 2，任务内 join 等待同池子任务
executor.submit(() -> {
    CompletableFuture.supplyAsync(() -> work(), executor).join();
});
```

解决：子任务用独立池，或避免在同池 `join`。

---

## 十六、与 Spring @Async

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

```java
@Async("bizExecutor")
public CompletableFuture<Void> processAsync(Order order) {
    // ...
    return CompletableFuture.completedFuture(null);
}
```

---

## 十七、检查清单

- [ ] 显式 `ThreadPoolExecutor`，有界队列
- [ ] 线程命名、监控 queue/active
- [ ] `CompletableFuture` 指定业务线程池
- [ ] 超时：`get(timeout)` / `orTimeout`
- [ ] 优雅关闭 `shutdown` + `awaitTermination`
- [ ] IO 密集评估虚拟线程；CPU 密集保持固定池
- [ ] ThreadLocal `remove()` in finally

---

## 参考

- [java.util.concurrent 文档](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html)
- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
- [Java并发工具类详解教程](/java/huubztqe/)
