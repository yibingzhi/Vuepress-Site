---
title: java多线程
createTime: 2024/11/19 10:20:48
permalink: /article/v4zytkzb/
---
## Java 多线程笔记

### 一、什么是 Java 多线程？

**多线程** 是 Java 并发编程的核心特性，允许程序在同一进程中同时执行多个任务（线程），提高 CPU 利用率和程序响应性。每个线程是进程中的独立执行路径，共享进程的内存空间（如堆），但拥有自己的栈空间。

核心特点：

1. **并发性**：多个线程同时运行（或看似同时运行）。
2. **共享资源**：线程共享堆内存，可能导致数据竞争。
3. **独立性**：每个线程有独立的程序计数器、栈。
4. **异步性**：线程执行顺序不可预测。

适用场景：

- **高并发任务**：如 Web 服务器处理多个请求。
- **并行计算**：如大数据处理、图像渲染。
- **异步任务**：如 GUI 事件处理、后台任务。
- **I/O 操作**：如文件读写、网络通信。

核心包：

- java.lang.Thread：线程类。
- java.lang.Runnable：线程任务接口。
- java.util.concurrent：并发工具包（如线程池、锁、并发集合）。

------

### 二、多线程的核心概念

1. 线程状态

Java 线程有以下六种状态（Thread.State）：

- **NEW**：线程创建但未启动。
- **RUNNABLE**：线程正在运行或准备运行（包括 RUNNING 和 READY）。
- **BLOCKED**：线程等待锁（同步块/方法）。
- **WAITING**：线程等待其他线程通知（如 Object.wait、Thread.join）。
- **TIMED_WAITING**：线程等待指定时间（如 Thread.sleep、Object.wait(timeout)）。
- **TERMINATED**：线程执行完成或异常终止。

2. 线程优先级

- 范围：Thread.MIN_PRIORITY (1) 到 Thread.MAX_PRIORITY (10)，默认 Thread.NORM_PRIORITY (5)。
- 作用：影响线程调度，但不保证严格执行顺序。

3. 线程安全问题

- **竞态条件**：多个线程同时访问共享资源，可能导致数据不一致。
- **死锁**：多个线程互相等待对方释放锁。
- **内存可见性**：一个线程修改变量，其他线程可能看不到最新值。

------

### 三、创建和管理线程

1. 创建线程的四种方式

方法 1：继承 Thread 类

```java
public class ThreadExample {
    public static void main(String[] args) {
        // 创建线程
        MyThread thread = new MyThread();
        thread.start(); // 启动线程，调用 run 方法
        // 注意：不能调用 run()，否则只是普通方法调用，不会启动新线程

        // 主线程继续执行
        System.out.println("Main thread: " + Thread.currentThread().getName());
    }
}

// 自定义线程类，继承 Thread
class MyThread extends Thread {
    @Override
    public void run() {
        // 线程执行的任务
        System.out.println("MyThread running: " + Thread.currentThread().getName());
        for (int i = 0; i < 3; i++) {
            System.out.println("MyThread count: " + i);
            try {
                Thread.sleep(100); // 模拟耗时操作，休眠 100ms
            } catch (InterruptedException e) {
                System.err.println("MyThread interrupted: " + e.getMessage());
            }
        }
    }
}
```

**注释说明**：

- 继承 Thread 并重写 run 方法。
- 调用 start() 启动线程，JVM 创建新线程并调用 run。
- sleep 让线程休眠，抛出 InterruptedException。
- 缺点：Java 单继承限制，不够灵活。

方法 2：实现 Runnable 接口

```java
public class RunnableExample {
    public static void main(String[] args) {
        // 创建 Runnable 任务
        Runnable task = new MyRunnable();
        // 创建线程并绑定任务
        Thread thread = new Thread(task, "RunnableThread");
        thread.start(); // 启动线程

        // 主线程继续执行
        System.out.println("Main thread: " + Thread.currentThread().getName());
    }
}

// 实现 Runnable 接口
class MyRunnable implements Runnable {
    @Override
    public void run() {
        // 线程执行的任务
        System.out.println("MyRunnable running: " + Thread.currentThread().getName());
        for (int i = 0; i < 3; i++) {
            System.out.println("MyRunnable count: " + i);
            try {
                Thread.sleep(100); // 模拟耗时操作
            } catch (InterruptedException e) {
                System.err.println("MyRunnable interrupted: " + e.getMessage());
            }
        }
    }
}
```

**注释说明**：

- 实现 Runnable 接口，定义任务逻辑。
- 将 Runnable 传入 Thread 构造器，启动线程。
- 优点：灵活，可复用任务，支持多实现。
- 推荐方式，符合单一职责原则。

方法 3：实现 Callable 接口（带返回值）

```java
import java.util.concurrent.*;

public class CallableExample {
    public static void main(String[] args) {
        // 创建 Callable 任务
        Callable<Integer> task = new MyCallable();
        // 创建线程池
        ExecutorService executor = Executors.newSingleThreadExecutor();
        // 提交任务，返回 Future
        Future<Integer> future = executor.submit(task);

        try {
            // 获取任务结果，阻塞直到完成
            Integer result = future.get();
            System.out.println("Callable result: " + result); // 输出: 6
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Callable error: " + e.getMessage());
        } finally {
            // 关闭线程池
            executor.shutdown();
        }

        // 主线程继续执行
        System.out.println("Main thread: " + Thread.currentThread().getName());
    }
}

// 实现 Callable 接口，返回 Integer
class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        // 线程执行的任务，计算 1+2+3
        System.out.println("MyCallable running: " + Thread.currentThread().getName());
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
            sum += i;
            Thread.sleep(100); // 模拟耗时操作
        }
        return sum; // 返回结果
    }
}
```

**注释说明**：

- Callable 支持返回值和抛出异常，适合需要结果的任务。
- 使用 ExecutorService 执行，Future 获取结果。
- future.get() 阻塞直到任务完成，可能抛出 InterruptedException 或 ExecutionException。
- 需手动关闭线程池。

方法 4：使用线程池

```java
import java.util.concurrent.*;

public class ThreadPoolExample {
    public static void main(String[] args) {
        // 创建固定大小的线程池（3 个线程）
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交多个任务
        for (int i = 0; i < 5; i++) {
            int taskId = i;
            executor.submit(() -> {
                // 任务逻辑
                System.out.println("Task " + taskId + " running in: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(100); // 模拟耗时操作
                } catch (InterruptedException e) {
                    System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                }
            });
        }

        // 关闭线程池（等待任务完成）
        executor.shutdown();
        try {
            // 等待所有任务完成，最多 5 秒
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow(); // 强制终止
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 主线程继续执行
        System.out.println("Main thread: " + Thread.currentThread().getName());
    }
}
```

**注释说明**：

- 线程池复用线程，减少创建/销毁开销。
- Executors 提供多种线程池（如固定大小、缓存、单线程）。
- shutdown 优雅关闭，shutdownNow 强制终止。
- 推荐生产环境中使用线程池。

------

2. 线程常用方法

| 方法                      | 功能描述                                         |
| ------------------------- | ------------------------------------------------ |
| start()                   | 启动线程，调用 run 方法。                        |
| run()                     | 线程任务逻辑（直接调用不启动新线程）。           |
| sleep(long millis)        | 让线程休眠指定毫秒，抛出 InterruptedException。  |
| join()                    | 等待线程执行完成。                               |
| interrupt()               | 中断线程，设置中断标志。                         |
| isAlive()                 | 检查线程是否存活。                               |
| setPriority(int priority) | 设置线程优先级（1-10）。                         |
| setDaemon(boolean on)     | 设置为守护线程（后台线程，随主线程结束而结束）。 |
| Thread.currentThread()    | 获取当前线程对象。                               |

示例代码：

```java
public class ThreadMethodsExample {
    public static void main(String[] args) {
        // 创建线程
        Thread thread = new Thread(() -> {
            System.out.println("Thread running: " + Thread.currentThread().getName());
            try {
                Thread.sleep(200); // 休眠 200ms
            } catch (InterruptedException e) {
                System.out.println("Thread interrupted: " + e.getMessage());
            }
        }, "MyThread");

        // 设置优先级
        thread.setPriority(Thread.MAX_PRIORITY); // 设置最高优先级
        System.out.println("Thread priority: " + thread.getPriority()); // 输出: 10

        // 设置为守护线程（必须在 start 前设置）
        thread.setDaemon(true);
        System.out.println("Is daemon? " + thread.isDaemon()); // 输出: true

        // 启动线程
        thread.start();
        System.out.println("Is alive? " + thread.isAlive()); // 输出: true

        try {
            // 主线程等待子线程完成
            thread.join();
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 检查线程是否存活
        System.out.println("Is alive after join? " + thread.isAlive()); // 输出: false

        // 注意事项：
        // - sleep 不释放锁，join 可能被中断
        // - 守护线程适合后台任务（如日志记录）
        // - 优先级不保证执行顺序，依赖调度器
    }
}
```

------

### 四、线程同步机制

多线程访问共享资源可能导致数据不一致，Java 提供以下同步机制：

1. synchronized 关键字

用于同步方法或代码块，确保同一时刻只有一个线程访问。

示例代码（同步方法）：

```java
public class SynchronizedMethodExample {
    public static void main(String[] args) {
        // 创建共享资源
        Counter counter = new Counter();

        // 创建两个线程，共享 counter
        Thread t1 = new Thread(new CounterTask(counter), "Thread-1");
        Thread t2 = new Thread(new CounterTask(counter), "Thread-2");

        // 启动线程
        t1.start();
        t2.start();

        // 等待线程完成
        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 输出最终计数
        System.out.println("Final count: " + counter.getCount()); // 输出: 2000（正确同步）
    }
}

// 共享资源
class Counter {
    private int count = 0;

    // 同步方法
    public synchronized void increment() {
        count++; // 原子操作
    }

    public int getCount() {
        return count;
    }
}

// 线程任务
class CounterTask implements Runnable {
    private Counter counter;

    public CounterTask(Counter counter) {
        this.counter = counter;
    }

    @Override
    public void run() {
        // 每个线程调用 1000 次 increment
        for (int i = 0; i < 1000; i++) {
            counter.increment();
            try {
                Thread.sleep(1); // 模拟耗时，增加竞争
            } catch (InterruptedException e) {
                System.err.println("Thread interrupted: " + e.getMessage());
            }
        }
    }
}
```

示例代码（同步块）：



```java
public class SynchronizedBlockExample {
    public static void main(String[] args) {
        // 创建共享资源
        Counter counter = new Counter();

        // 创建两个线程
        Thread t1 = new Thread(new CounterTask(counter), "Thread-1");
        Thread t2 = new Thread(new CounterTask(counter), "Thread-2");

        // 启动线程
        t1.start();
        t2.start();

        // 等待线程完成
        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 输出最终计数
        System.out.println("Final count: " + counter.getCount()); // 输出: 2000
    }
}

// 共享资源
class Counter {
    private int count = 0;

    // 非同步方法，使用同步块
    public void increment() {
        synchronized (this) { // 锁定当前对象
            count++;
        }
    }

    public int getCount() {
        return count;
    }
}

// 线程任务
class CounterTask implements Runnable {
    private Counter counter;

    public CounterTask(Counter counter) {
        this.counter = counter;
    }

    @Override
    public void run() {
        for (int i = 0; i < 1000; i++) {
            counter.increment();
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                System.err.println("Thread interrupted: " + e.getMessage());
            }
        }
    }
}
```

**注释说明**：

- synchronized 确保线程安全，防止数据竞争。
- 同步方法锁定整个对象，同步块可锁定特定对象（更灵活）。
- 同步块减少锁范围，提高性能。
- 注意：过度同步可能导致性能下降或死锁。

2. Lock 接口（java.util.concurrent.locks)

ReentrantLock 是 synchronized 的替代方案，提供更多功能（如公平锁、超时锁）。

示例代码：

```java
import java.util.concurrent.locks.*;

public class ReentrantLockExample {
    public static void main(String[] args) {
        // 创建共享资源
        Counter counter = new Counter();

        // 创建两个线程
        Thread t1 = new Thread(new CounterTask(counter), "Thread-1");
        Thread t2 = new Thread(new CounterTask(counter), "Thread-2");

        // 启动线程
        t1.start();
        t2.start();

        // 等待线程完成
        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 输出最终计数
        System.out.println("Final count: " + counter.getCount()); // 输出: 2000
    }
}

// 共享资源
class Counter {
    private int count = 0;
    private final Lock lock = new ReentrantLock(); // 创建锁

    public void increment() {
        lock.lock(); // 获取锁
        try {
            count++; // 原子操作
        } finally {
            lock.unlock(); // 释放锁
        }
    }

    public int getCount() {
        return count;
    }
}

// 线程任务
class CounterTask implements Runnable {
    private Counter counter;

    public CounterTask(Counter counter) {
        this.counter = counter;
    }

    @Override
    public void run() {
        for (int i = 0; i < 1000; i++) {
            counter.increment();
            try {
                Thread.sleep(1);
            } catch (InterruptedException e) {
                System.err.println("Thread interrupted: " + e.getMessage());
            }
        }
    }
}
```

**注释说明**：

- ReentrantLock 支持可重入锁（同一线程可多次获取）。
- try-finally 确保锁释放，避免死锁。
- 提供高级功能（如 tryLock、lockInterruptibly）。
- 比 synchronized 更灵活，但需手动管理锁。

3. volatile 关键字

确保变量的**内存可见性**，防止指令重排序。

示例代码：

```java
public class VolatileExample {
    private static volatile boolean running = true; // volatile 保证可见性

    public static void main(String[] args) {
        // 创建工作线程
        Thread worker = new Thread(() -> {
            System.out.println("Worker starting: " + Thread.currentThread().getName());
            while (running) {
                // 模拟工作
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    System.err.println("Worker interrupted: " + e.getMessage());
                }
            }
            System.out.println("Worker stopped");
        }, "Worker");

        // 启动工作线程
        worker.start();

        // 主线程等待 500ms 后停止
        try {
            Thread.sleep(500);
            running = false; // 修改 volatile 变量，主线程通知工作线程
            System.out.println("Main thread set running to false");
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 注意事项：
        // - volatile 保证可见性，但不保证原子性
        // - 适合标志位或简单状态变量
        // - 不适用复合操作（如 count++）
    }
}
```

**注释说明**：

- volatile 确保线程间变量修改立即可见。
- 不提供互斥性，适合读多写少的场景。
- 避免使用 volatile 进行复杂原子操作。

------

### 五、并发工具（java.util.concurrent）

Java 提供了丰富的并发工具，简化多线程编程。

1. ExecutorService（线程池）

管理线程生命周期，复用线程。

示例代码：

```java
import java.util.concurrent.*;

public class ExecutorServiceExample {
    public static void main(String[] args) {
        // 创建固定大小线程池（3 个线程）
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交多个任务
        for (int i = 0; i < 5; i++) {
            int taskId = i;
            executor.execute(() -> {
                System.out.println("Task " + taskId + " running in: " + Thread.currentThread().getName());
                try {
                    Thread.sleep(100); // 模拟耗时操作
                } catch (InterruptedException e) {
                    System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                }
            });
        }

        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow(); // 超时强制终止
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 注意事项：
        // - 线程池提高性能，适合高并发任务
        // - 推荐自定义 ThreadPoolExecutor，控制参数
        // - 及时关闭线程池，释放资源
    }
}
```

**注释说明**：

- Executors 提供便捷线程池创建。
- newFixedThreadPool 固定线程数，newCachedThreadPool 动态调整。
- shutdown 等待任务完成，shutdownNow 立即终止。

2. CountDownLatch

允许线程等待一组操作完成。

示例代码：

```java
import java.util.concurrent.*;

public class CountDownLatchExample {
    public static void main(String[] args) {
        // 创建 CountDownLatch，等待 3 个任务完成
        CountDownLatch latch = new CountDownLatch(3);
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交 3 个任务
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            executor.submit(() -> {
                System.out.println("Task " + taskId + " starting");
                try {
                    Thread.sleep(100); // 模拟任务
                } catch (InterruptedException e) {
                    System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                }
                System.out.println("Task " + taskId + " completed");
                latch.countDown(); // 任务完成，计数减 1
            });
        }

        // 主线程等待所有任务完成
        try {
            System.out.println("Main thread waiting...");
            latch.await(); // 阻塞直到计数为 0
            System.out.println("All tasks completed");
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 关闭线程池
        executor.shutdown();

        // 注意事项：
        // - CountDownLatch 适合一次性同步
        // - 计数不可重置，需重新创建
        // - await 可设置超时
    }
}
```

**注释说明**：

- CountDownLatch 用于主线程等待子任务完成。
- countDown 减少计数，await 阻塞直到计数为 0。
- 适合初始化、批量任务场景。

3. CyclicBarrier

允许多个线程互相等待，直到所有线程到达屏障点。

示例代码：

```java
import java.util.concurrent.*;

public class CyclicBarrierExample {
    public static void main(String[] args) {
        // 创建 CyclicBarrier，3 个线程到达屏障后执行汇总任务
        CyclicBarrier barrier = new CyclicBarrier(3, () -> {
            System.out.println("All threads reached barrier, summarizing...");
        });
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交 3 个任务
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            executor.submit(() -> {
                System.out.println("Task " + taskId + " working");
                try {
                    Thread.sleep(100); // 模拟任务
                    System.out.println("Task " + taskId + " reaching barrier");
                    barrier.await(); // 等待其他线程
                    System.out.println("Task " + taskId + " passed barrier");
                } catch (InterruptedException | BrokenBarrierException e) {
                    System.err.println("Task " + taskId + " error: " + e.getMessage());
                }
            });
        }

        // 关闭线程池
        executor.shutdown();

        // 注意事项：
        // - CyclicBarrier 可重用，适合循环任务
        // - 任一线程中断会导致 BrokenBarrierException
        // - 可设置超时
    }
}
```

**注释说明**：

- CyclicBarrier 适合线程协作场景（如并行计算）。
- 屏障点触发后执行回调任务。
- 可重用，优于 CountDownLatch。

4. Semaphore

控制并发访问资源的线程数量。

示例代码：

```java
import java.util.concurrent.*;

public class SemaphoreExample {
    public static void main(String[] args) {
        // 创建 Semaphore，限制 2 个线程同时访问
        Semaphore semaphore = new Semaphore(2);
        ExecutorService executor = Executors.newFixedThreadPool(5);

        // 提交 5 个任务
        for (int i = 0; i < 5; i++) {
            int taskId = i;
            executor.submit(() -> {
                try {
                    System.out.println("Task " + taskId + " requesting permit");
                    semaphore.acquire(); // 获取许可
                    System.out.println("Task " + taskId + " acquired permit, working");
                    Thread.sleep(100); // 模拟工作
                } catch (InterruptedException e) {
                    System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                } finally {
                    semaphore.release(); // 释放许可
                    System.out.println("Task " + taskId + " released permit");
                }
            });
        }

        // 关闭线程池
        executor.shutdown();

        // 注意事项：
        // - Semaphore 控制资源访问，适合限流
        // - acquire 和 release 必须配对
        // - 支持公平模式（new Semaphore(2, true)）
    }
}
```

**注释说明**：

- Semaphore 限制并发访问，适合数据库连接池、限流。
- acquire 获取许可，release 释放许可。
- 支持非阻塞 tryAcquire。

------

### 六、并发集合

java.util.concurrent 提供线程安全的集合类，替代同步包装类（如 Collections.synchronizedList）。

常用并发集合：

- ConcurrentHashMap：线程安全的哈希表，支持高并发读写。
- CopyOnWriteArrayList：写时复制，适合读多写少。
- BlockingQueue：阻塞队列，适合生产者-消费者模型（如 ArrayBlockingQueue、LinkedBlockingQueue）。

示例代码（ConcurrentHashMap）：

```java
import java.util.concurrent.*;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        // 创建 ConcurrentHashMap，线程安全的键值映射
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // 提交多个写任务
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            executor.submit(() -> {
                for (int j = 0; j < 100; j++) {
                    String key = "Key-" + taskId + "-" + j;
                    map.put(key, j); // 线程安全写入
                    try {
                        Thread.sleep(1); // 模拟耗时
                    } catch (InterruptedException e) {
                        System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                    }
                }
            });
        }

        // 提交读任务
        executor.submit(() -> {
            while (!Thread.interrupted()) {
                map.forEach((key, value) -> {
                    System.out.println("Read: " + key + "=" + value);
                });
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    System.err.println("Read task interrupted: " + e.getMessage());
                    break;
                }
            }
        });

        // 关闭线程池
        executor.shutdown();
        try {
            executor.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            executor.shutdownNow();
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 输出最终大小
        System.out.println("Map size: " + map.size()); // 输出: 300

        // 注意事项：
        // - ConcurrentHashMap 支持高并发读写，不需要外部同步
        // - 迭代期间允许修改，不会抛出 ConcurrentModificationException
        // - key 和 value 不允许 null
    }
}
```

**注释说明**：

- ConcurrentHashMap 提供高并发性能，适合共享数据存储。
- 分段锁（Java 8+ 使用 CAS）提高并发性。
- 迭代器弱一致性，允许并发修改。

------

### 七、线程安全问题与优化

1. 常见问题

- **竞态条件**：多线程同时修改共享资源。

- **死锁**：线程互相等待锁。

  java

  

  ```java
  // 死锁示例
  Object lock1 = new Object(), lock2 = new Object();
  Thread t1 = new Thread(() -> {
      synchronized (lock1) {
          try { Thread.sleep(100); } catch (Exception e) {}
          synchronized (lock2) { System.out.println("T1 acquired both locks"); }
      }
  });
  Thread t2 = new Thread(() -> {
      synchronized (lock2) {
          try { Thread.sleep(100); } catch (Exception e) {}
          synchronized (lock1) { System.out.println("T2 acquired both locks"); }
      }
  });
  t1.start(); t2.start();
  ```

- **内存可见性**：线程缓存导致数据不一致，使用 volatile 或锁解决。

- **线程中断**：正确处理 InterruptedException，清理资源。

2. 优化建议

1. **减少锁范围**：使用同步块而非同步方法。
2. **使用并发工具**：优先选择 ConcurrentHashMap、Lock 等。
3. **线程池优化**：
   - 自定义 ThreadPoolExecutor，调整核心线程数、最大线程数、队列大小。
   - 避免 Executors.newCachedThreadPool（可能创建过多线程）。
4. **避免死锁**：
   - 固定锁获取顺序。
   - 使用 tryLock 避免无限等待。
5. **批量操作**：减少锁竞争，如批量更新 ConcurrentHashMap。

------

### 八、实际应用场景示例

以下是一个综合示例，模拟一个多线程任务处理系统，使用线程池、ConcurrentHashMap 和 CountDownLatch。

```java
import java.util.concurrent.*;

public class TaskProcessingSystem {
    public static void main(String[] args) {
        // 创建线程池（4 个线程）
        ExecutorService executor = Executors.newFixedThreadPool(4);
        // 创建 ConcurrentHashMap 存储任务结果
        ConcurrentHashMap<String, Integer> results = new ConcurrentHashMap<>();
        // 创建 CountDownLatch，等待 5 个任务完成
        CountDownLatch latch = new CountDownLatch(5);

        // 提交 5 个任务
        for (int i = 0; i < 5; i++) {
            int taskId = i;
            executor.submit(() -> {
                try {
                    System.out.println("Task " + taskId + " processing");
                    Thread.sleep(100); // 模拟任务处理
                    // 存储结果
                    results.put("Task-" + taskId, taskId * 100);
                    System.out.println("Task " + taskId + " completed");
                } catch (InterruptedException e) {
                    System.err.println("Task " + taskId + " interrupted: " + e.getMessage());
                } finally {
                    latch.countDown(); // 任务完成，计数减 1
                }
            });
        }

        // 主线程等待所有任务完成
        try {
            System.out.println("Main thread waiting for tasks...");
            latch.await(); // 阻塞直到计数为 0
            System.out.println("All tasks completed");
            // 输出结果
            results.forEach((key, value) -> System.out.println(key + ": " + value));
        } catch (InterruptedException e) {
            System.err.println("Main thread interrupted: " + e.getMessage());
        }

        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }

        // 注意事项：
        // - 使用 ConcurrentHashMap 存储结果，确保线程安全
        // - CountDownLatch 同步主线程和子任务
        // - 线程池管理线程，优化资源使用
    }
}
```

**注释说明**：

- 模拟任务处理系统，线程池执行任务。
- ConcurrentHashMap 存储结果，CountDownLatch 同步。
- 优雅关闭线程池，确保资源释放。

------

### 九、总结

Java 多线程是并发编程的核心，提供以下功能：

1. **线程创建**：
   - 继承 Thread、实现 Runnable、Callable、线程池。
   - 线程池是生产环境首选。
2. **线程管理**：
   - start、sleep、join、interrupt 等方法。
   - 守护线程、优先级辅助调度。
3. **同步机制**：
   - synchronized：简单但可能阻塞。
   - ReentrantLock：灵活，支持高级功能。
   - volatile：保证可见性，非原子操作。
4. **并发工具**：
   - ExecutorService：线程池管理。
   - CountDownLatch、CyclicBarrier：线程同步。
   - Semaphore：资源访问控制。
   - 并发集合：ConcurrentHashMap、CopyOnWriteArrayList。
5. **线程安全问题**：
   - 竞态条件、死锁、内存可见性。
   - 使用锁、并发工具、优化锁粒度解决。
6. **优化建议**：
   - 减少锁范围、缓存线程、避免死锁。
   - 优先使用并发工具和集合。
7. **应用场景**：
   - Web 服务器、并行计算、异步任务。
   - 框架（如 Spring Reactor）。

希望这份带详细注释的笔记和示例能帮助你全面掌握 Java 多线程！如果需要更深入的示例（如 Fork/Join 框架、CompletableFuture、死锁检测）或其他补充，请告诉我！