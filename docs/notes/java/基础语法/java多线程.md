---
tags:
  - Java
  - 基础语法
  - 多线程
title: java多线程
createTime: 2024/11/19 10:20:48
permalink: /java/基础语法/wayse4tc/
---
## 一、多线程基础概念

### 1.1 什么是线程？

**线程（Thread）** 是操作系统进行 CPU 调度的最小单位。一个进程可以包含多个线程，这些线程共享该进程的内存空间（如堆、方法区），但每个线程拥有独立的程序计数器、虚拟机栈和本地变量表。

- **进程（Process）**：程序的运行实例，拥有独立的内存空间。
- **线程（Thread）**：进程内的执行单元，轻量级，共享资源。

### 1.2 为什么使用多线程？

1. **提高性能**：利用多核 CPU 并行处理任务，提升吞吐量。
2. **改善响应性**：避免 UI 线程阻塞，提升用户体验（如 GUI 应用）。
3. **资源高效利用**：多个任务并发执行，减少等待时间。
4. **模拟真实场景**：如服务器同时处理多个客户端请求。

### 1.3 Java 中的线程模型

Java 的线程模型基于操作系统原生线程实现（1:1 模型），由 JVM 封装。每个 `Thread` 对象对应一个操作系统线程。

---

## 二、创建线程的两种方式

### 2.1 继承 `Thread` 类

```java
public class MyThread extends Thread {
    private String name;

    public MyThread(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(name + " 执行第 " + i + " 次");
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println(name + " 被中断");
                Thread.currentThread().interrupt(); // 恢复中断状态
            }
        }
    }
}

// 使用
new MyThread("线程A").start();
```

> ⚠️ 注意：调用 `start()` 才会启动新线程；直接调用 `run()` 只是普通方法调用。

### 2.2 实现 `Runnable` 接口（推荐）

```java
public class MyRunnable implements Runnable {
    private String name;

    public MyRunnable(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(name + " 执行第 " + i + " 次");
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println(name + " 被中断");
                Thread.currentThread().interrupt();
            }
        }
    }
}

// 使用
Thread thread = new Thread(new MyRunnable("线程B"));
thread.start();
```

### 2.3 两种方式对比

| 特性 | 继承 `Thread` | 实现 `Runnable` |
|------|---------------|------------------|
| 是否破坏封装 | 是（继承） | 否（组合） |
| 是否支持多继承 | 否（Java 单继承） | 是 |
| 代码复用性 | 差 | 好 |
| 推荐程度 | ❌ 不推荐 | ✅ 推荐 |

> ✅ **最佳实践**：优先使用 `Runnable` 或 `Callable`，便于与线程池结合。

---

## 三、线程的生命周期（6种状态）

Java 中线程的状态由 `Thread.State` 枚举定义：

| 状态 | 说明 |
|------|------|
| `NEW` | 线程对象已创建，尚未调用 `start()` |
| `RUNNABLE` | 正在 JVM 中执行，可能正在运行或等待 CPU 调度 |
| `BLOCKED` | 等待获取监视器锁（synchronized） |
| `WAITING` | 等待其他线程显式唤醒（如 `wait()`） |
| `TIMED_WAITING` | 限时等待（如 `sleep(1000)`、`wait(1000)`） |
| `TERMINATED` | 线程执行结束或异常退出 |

```java
Thread thread = new Thread(() -> {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) { /* 忽略 */ }
});
System.out.println(thread.getState()); // NEW
thread.start();
System.out.println(thread.getState()); // RUNNABLE
```

---

## 四、线程同步与并发控制

### 4.1 为什么需要线程同步？

当多个线程共享可变资源（如变量、集合）时，可能导致 **竞态条件（Race Condition）**，引发数据不一致。

```java
// 非线程安全示例
class Counter {
    private int count = 0;
    public void increment() { count++; } // 非原子操作
}
```

`count++` 包含：读取 → 修改 → 写入，多线程下可能交错执行。

### 4.2 `synchronized` 关键字

#### 4.2.1 同步方法

```java
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```

- 修饰实例方法：锁的是当前对象 `this`
- 修饰静态方法：锁的是类对象 `Counter.class`

#### 4.2.2 同步代码块

```java
public void someMethod() {
    synchronized(this) {
        // 临界区代码
        count++;
    }
}
```

> ✅ 推荐使用同步代码块，粒度更细，性能更好。

### 4.3 `volatile` 关键字

适用于**轻量级同步场景**，保证变量的**可见性**和**禁止指令重排序**，但不保证原子性。

```java
public class FlagExample {
    private volatile boolean running = true;

    public void stop() {
        running = false;
    }

    public void run() {
        while (running) {
            // 执行任务
        }
    }
}
```

> ⚠️ `volatile` 不能替代 `synchronized`，仅适用于状态标志、双重检查锁定（DCL）等场景。

---

## 五、线程间通信：`wait()`、`notify()`、`notifyAll()`

这些方法定义在 `Object` 类中，用于线程协作。

### 5.1 使用规则

- 必须在 `synchronized` 块或方法中调用。
- 调用 `wait()` 会释放锁并进入等待队列。
- `notify()` 唤醒一个等待线程，`notifyAll()` 唤醒所有。

### 5.2 生产者-消费者模式实现

```java
public class MessageQueue {
    private String message;
    private boolean empty = true;

    public synchronized String take() {
        while (empty) {
            try {
                wait(); // 等待生产者放入消息
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }
        }
        empty = true;
        notifyAll(); // 通知生产者可以生产
        return message;
    }

    public synchronized void put(String msg) {
        while (!empty) {
            try {
                wait(); // 等待消费者取走消息
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        message = msg;
        empty = false;
        notifyAll(); // 通知消费者可以消费
    }
}
```

### 5.3 测试类

```java
public class ProducerConsumerDemo {
    public static void main(String[] args) {
        MessageQueue queue = new MessageQueue();

        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                queue.put("消息-" + i);
                System.out.println("生产: 消息-" + i);
            }
        });

        Thread consumer = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                String msg = queue.take();
                System.out.println("消费: " + msg);
            }
        });

        producer.start();
        consumer.start();
    }
}
```

---

## 六、线程池（ThreadPool）

### 6.1 为什么使用线程池？

- 减少线程创建/销毁开销
- 控制并发数，防止资源耗尽
- 提高响应速度
- 统一管理线程生命周期

### 6.2 `ThreadPoolExecutor` 核心参数

| 参数 | 说明 |
|------|------|
| `corePoolSize` | 核心线程数，常驻线程 |
| `maximumPoolSize` | 最大线程数 |
| `keepAliveTime` | 非核心线程空闲存活时间 |
| `unit` | 时间单位 |
| `workQueue` | 任务队列（如 `LinkedBlockingQueue`） |
| `threadFactory` | 自定义线程创建方式 |
| `handler` | 拒绝策略 |

### 6.3 拒绝策略（RejectedExecutionHandler）

| 策略 | 行为 |
|------|------|
| `AbortPolicy`（默认） | 抛出 `RejectedExecutionException` |
| `CallerRunsPolicy` | 由提交任务的线程直接执行 |
| `DiscardPolicy` | 静默丢弃任务 |
| `DiscardOldestPolicy` | 丢弃队列中最老的任务，重试提交 |

### 6.4 自定义线程池示例

```java
public class CustomThreadPool {
    private final ThreadPoolExecutor executor;

    public CustomThreadPool() {
        this.executor = new ThreadPoolExecutor(
            2,              // corePoolSize
            4,              // maximumPoolSize
            60L,            // keepAliveTime
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(10), // 队列容量
            new CustomThreadFactory(),      // 自定义线程工厂
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
    }

    public void execute(Runnable task) {
        executor.execute(task);
    }

    public void shutdown() {
        executor.shutdown();
    }
}

class CustomThreadFactory implements ThreadFactory {
    private int counter = 0;

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r, "CustomThread-" + counter++);
        t.setDaemon(false);
        t.setPriority(Thread.NORM_PRIORITY);
        return t;
    }
}
```

### 6.5 Java 内置线程池（`Executors`）

| 方法 | 用途 |
|------|------|
| `newFixedThreadPool(n)` | 固定大小线程池 |
| `newCachedThreadPool()` | 缓存线程池（适合短任务） |
| `newSingleThreadExecutor()` | 单线程池，保证顺序执行 |
| `newScheduledThreadPool(n)` | 支持定时/周期任务 |

> ⚠️ 注意：`Executors` 创建的线程池可能隐藏风险（如 `FixedThreadPool` 使用无界队列），建议在生产环境使用 `ThreadPoolExecutor` 显式配置。

---

## 七、线程安全的集合类

Java 提供了 `java.util.concurrent` 包下的线程安全集合：

| 类 | 说明 |
|-----|------|
| `ConcurrentHashMap<K,V>` | 高性能线程安全 Map，分段锁或 CAS |
| `CopyOnWriteArrayList<E>` | 写时复制 List，适合读多写少 |
| `BlockingQueue<E>` | 阻塞队列，如 `ArrayBlockingQueue`, `LinkedBlockingQueue` |
| `ConcurrentLinkedQueue<E>` | 非阻塞线程安全队列 |

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("a", 1);
map.get("a");

BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
queue.put("item"); // 阻塞直到有空间
```

---

## 八、高级并发工具类

### 8.1 `CountDownLatch`：倒计时门闩

等待多个线程完成后再继续。

```java
CountDownLatch latch = new CountDownLatch(3);

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        System.out.println("任务完成");
        latch.countDown();
    }).start();
}

latch.await(); // 等待所有任务完成
System.out.println("所有任务已完成");
```

### 8.2 `CyclicBarrier`：循环栅栏

多个线程相互等待，达到某个点后一起继续。

```java
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程已到达，开始下一阶段");
});

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        System.out.println("线程准备");
        try {
            barrier.await();
        } catch (Exception e) { }
        System.out.println("继续执行");
    }).start();
}
```

### 8.3 `Semaphore`：信号量

控制同时访问资源的线程数量（限流）。

```java
Semaphore semaphore = new Semaphore(2); // 允许2个线程同时访问

new Thread(() -> {
    try {
        semaphore.acquire();
        System.out.println("获得许可，执行任务");
        Thread.sleep(2000);
    } catch (InterruptedException e) { } finally {
        semaphore.release();
    }
}).start();
```

---

## 九、最佳实践与注意事项

1. **优先使用 `Runnable` 或 `Callable`**
2. **避免过度同步**，使用 `volatile`、`Atomic` 类等轻量级方案
3. **正确处理中断**：捕获 `InterruptedException` 后应恢复中断状态
4. **避免死锁**：按固定顺序获取锁，使用超时机制
5. **使用线程池代替手动创建线程**
6. **避免共享可变状态**，优先使用不可变对象
7. **合理配置线程池参数**，避免资源耗尽
8. **使用 `try-finally` 或 `try-with-resources` 保证资源释放**

---


---

## 十一、常见面试题（附答案）

1. **`start()` 和 `run()` 的区别？**  
   `start()` 启动新线程；`run()` 只是普通方法调用。

2. **`synchronized` 和 `ReentrantLock` 的区别？**  
   `ReentrantLock` 更灵活，支持公平锁、可中断、超时等。

3. **如何避免死锁？**  
   按顺序加锁、使用超时、避免嵌套锁。

4. **`volatile` 能保证原子性吗？**  
   不能，只能保证可见性和有序性。

5. **线程池工作流程？**  
   核心线程 → 队列 → 最大线程 → 拒绝策略。

---

## 十二、参考资料

- 《Java并发编程实战》（Java Concurrency in Practice）
- Oracle 官方文档：[Java Thread](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
- Java API 文档：`java.util.concurrent` 包

---

✅ **总结**：多线程是 Java 高级编程的核心技能。掌握线程创建、同步、通信、线程池等机制，是构建高性能、高并发系统的基石。

> 文档持续更新中，欢迎反馈建议！
