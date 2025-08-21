---
title: Java内存模型详解
createTime: 2025/08/16 14:31:17
permalink: java/基础语法/ug0x4tyu/
---

# Java内存模型详解

## 什么是Java内存模型

Java内存模型（Java Memory Model，JMM）是Java虚拟机规范中定义的一种规范，用来屏蔽各种硬件和操作系统的内存访问差异，让Java程序在各种平台上都能达到一致的内存访问效果。

### JMM的作用

- **屏蔽硬件差异**：不同CPU架构有不同的内存模型
- **保证线程安全**：定义线程间如何正确共享内存
- **提供一致性保证**：确保多线程程序的正确性

### JMM的核心问题

1. **可见性**：一个线程对共享变量的修改，其他线程能否立即看到
2. **原子性**：一个操作是否不可中断，要么全部执行，要么全部不执行
3. **有序性**：程序执行的顺序是否按照代码的顺序执行

## JVM内存结构

### 1. 运行时数据区

```
┌─────────────────────────────────────────────────────────────┐
│                    JVM运行时数据区                           │
├─────────────────────────────────────────────────────────────┤
│  线程共享区域                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   方法区(Method) │  │   堆(Heap)      │  │  直接内存   │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  线程私有区域                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  程序计数器(PC)  │  │  虚拟机栈(Stack) │  │  本地方法栈 │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. 内存区域详解

#### 堆（Heap）

- 存储对象实例和数组
- 被所有线程共享
- 垃圾回收的主要区域
- 分为新生代和老年代

#### 方法区（Method Area）

- 存储类信息、常量、静态变量等
- 被所有线程共享
- 在JDK8中称为元空间（Metaspace）

#### 虚拟机栈（VM Stack）

- 每个线程都有独立的栈
- 存储局部变量、操作数栈、方法出口等
- 栈深度过大时抛出StackOverflowError

#### 程序计数器（Program Counter Register）

- 当前线程执行的字节码行号指示器
- 线程私有，不会发生内存溢出

## JMM核心概念

### 1. 主内存与工作内存

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   主内存     │    │   主内存     │    │   主内存     │
│  (Main      │    │  (Main      │    │  (Main      │
│   Memory)   │    │   Memory)   │    │   Memory)   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  线程A      │    │  线程B      │    │  线程C      │
│ 工作内存    │    │ 工作内存    │    │ 工作内存    │
│(Working     │    │(Working     │    │(Working     │
│ Memory)     │    │ Memory)     │    │ Memory)     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. 内存交互操作

- **read**：从主内存读取数据到工作内存
- **load**：将主内存读取的数据写入工作内存的变量副本
- **use**：从工作内存读取变量的值传递给执行引擎
- **assign**：将执行引擎接收到的值赋给工作内存的变量
- **store**：将工作内存中变量的值传送到主内存
- **write**：将store操作从工作内存中得到的变量的值写入主内存的变量

## 内存可见性

### 1. 可见性问题示例

```java
public class VisibilityDemo {
    private static boolean flag = false;
    
    public static void main(String[] args) throws InterruptedException {
        // 线程A：修改flag
        Thread threadA = new Thread(() -> {
            try {
                Thread.sleep(1000);
                flag = true;
                System.out.println("线程A设置flag为true");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        
        // 线程B：读取flag
        Thread threadB = new Thread(() -> {
            while (!flag) {
                // 空循环，等待flag变为true
            }
            System.out.println("线程B看到flag为true");
        });
        
        threadA.start();
        threadB.start();
        
        threadA.join();
        threadB.join();
    }
}
```

### 2. 可见性问题的原因

- **缓存一致性**：每个CPU都有自己的缓存
- **指令重排序**：编译器和CPU可能重排序指令
- **内存屏障**：缺少必要的内存屏障

## 原子性

### 1. 原子性问题示例

```java
public class AtomicityDemo {
    private static int count = 0;
    
    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[10];
        
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    count++; // 非原子操作
                }
            });
            threads[i].start();
        }
        
        for (Thread thread : threads) {
            thread.join();
        }
        
        System.out.println("最终结果: " + count); // 预期10000，实际可能小于10000
    }
}
```

### 2. 原子性问题的原因

- **复合操作**：count++包含读取、修改、写入三个步骤
- **线程切换**：在线程切换时可能丢失更新

## 有序性

### 1. 指令重排序示例

```java
public class ReorderingDemo {
    private static int a = 0;
    private static boolean flag = false;
    
    public static void main(String[] args) throws InterruptedException {
        Thread threadA = new Thread(() -> {
            a = 1;           // 语句1
            flag = true;     // 语句2
        });
        
        Thread threadB = new Thread(() -> {
            if (flag) {      // 语句3
                System.out.println("a = " + a); // 语句4
            }
        });
        
        threadA.start();
        threadB.start();
        
        threadA.join();
        threadB.join();
    }
}
```

### 2. 重排序的类型

- **编译器重排序**：编译器优化导致的重排序
- **CPU重排序**：CPU执行时的重排序
- **内存重排序**：内存系统导致的重排序

## volatile关键字

### 1. volatile的作用

```java
public class VolatileDemo {
    // 保证可见性
    private static volatile boolean flag = false;
    
    public static void main(String[] args) throws InterruptedException {
        Thread threadA = new Thread(() -> {
            try {
                Thread.sleep(1000);
                flag = true;
                System.out.println("线程A设置flag为true");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        
        Thread threadB = new Thread(() -> {
            while (!flag) {
                // 使用volatile后，这里能及时看到flag的变化
            }
            System.out.println("线程B看到flag为true");
        });
        
        threadA.start();
        threadB.start();
        
        threadA.join();
        threadB.join();
    }
}
```

### 2. volatile的特性

- **可见性**：保证变量的修改对所有线程立即可见
- **有序性**：禁止指令重排序
- **不保证原子性**：对于复合操作仍然不是原子的

### 3. volatile的内存语义

```java
public class VolatileMemorySemantics {
    private volatile int value = 0;
    
    public void write() {
        value = 1; // 写操作
    }
    
    public int read() {
        return value; // 读操作
    }
}
```

## synchronized关键字

### 1. synchronized的基本用法

```java
public class SynchronizedDemo {
    private int count = 0;
    
    // 实例方法同步
    public synchronized void increment() {
        count++;
    }
    
    // 静态方法同步
    public static synchronized void staticIncrement() {
        // 静态方法同步
    }
    
    // 代码块同步
    public void incrementBlock() {
        synchronized (this) {
            count++;
        }
    }
    
    // 类锁
    public void classLock() {
        synchronized (SynchronizedDemo.class) {
            // 类级别的同步
        }
    }
}
```

### 2. synchronized的底层原理

```java
public class SynchronizedPrinciple {
    private Object lock = new Object();
    
    public void method() {
        synchronized (lock) {
            // 临界区代码
            System.out.println("临界区");
        }
    }
}
```

编译后的字节码：

```java
public void method();
    Code:
       0: aload_0
       1: getfield      #2                  // Field lock:Ljava/lang/Object;
       4: dup
       5: astore_1
       6: monitorenter  // 进入监视器
       7: getstatic     #3                  // Field java/lang/System.out:Ljava/io/PrintStream;
      10: ldc           #4                  // String 临界区
      12: invokevirtual #5                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      15: aload_1
      16: monitorexit   // 退出监视器
      17: goto          25
      20: astore_2
      21: aload_1
      22: monitorexit   // 异常处理时的退出
      23: aload_2
      24: athrow
      25: return
```

### 3. synchronized的特性

- **原子性**：保证临界区代码的原子执行
- **可见性**：保证变量的修改对其他线程可见
- **有序性**：保证临界区内的指令不会重排序

## final关键字

### 1. final的内存语义

```java
public class FinalDemo {
    private final int value;
    private final Object obj;
    
    public FinalDemo(int value, Object obj) {
        this.value = value;  // 构造函数中初始化
        this.obj = obj;      // 构造函数中初始化
    }
    
    public void method() {
        // value和obj在构造函数完成后对其他线程可见
        System.out.println("value: " + value);
        System.out.println("obj: " + obj);
    }
}
```

### 2. final的重排序规则

- 在构造函数内对一个final域的写入，与随后把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序
- 初次读一个包含final域的对象的引用，与随后初次读这个final域，这两个操作之间不能重排序

## happens-before规则

### 1. 程序顺序规则

```java
public class ProgramOrderRule {
    private int a = 0;
    private int b = 0;
    
    public void method() {
        a = 1;     // 操作1
        b = 2;     // 操作2
        // 操作1 happens-before 操作2
    }
}
```

### 2. 监视器锁规则

```java
public class MonitorLockRule {
    private Object lock = new Object();
    private int value = 0;
    
    public void write() {
        synchronized (lock) {
            value = 1;  // 操作1
        }               // 释放锁
    }
    
    public void read() {
        synchronized (lock) {
            // 获取锁
            System.out.println(value); // 操作2
        }
    }
    // 操作1 happens-before 操作2
}
```

### 3. volatile变量规则

```java
public class VolatileRule {
    private volatile int value = 0;
    
    public void write() {
        value = 1;  // 操作1：写volatile变量
    }
    
    public void read() {
        System.out.println(value); // 操作2：读volatile变量
    }
    // 操作1 happens-before 操作2
}
```

### 4. 线程启动规则

```java
public class ThreadStartRule {
    private int value = 0;
    
    public void startThread() {
        value = 1;  // 操作1
        Thread thread = new Thread(() -> {
            System.out.println(value); // 操作2
        });
        thread.start(); // 启动线程
        // 操作1 happens-before 操作2
    }
}
```

### 5. 线程终止规则

```java
public class ThreadJoinRule {
    private int value = 0;
    
    public void joinThread() throws InterruptedException {
        Thread thread = new Thread(() -> {
            value = 1;  // 操作1
        });
        thread.start();
        thread.join();  // 等待线程结束
        System.out.println(value); // 操作2
        // 操作1 happens-before 操作2
    }
}
```

## 内存屏障

### 1. 内存屏障的类型

```java
public class MemoryBarrierDemo {
    private volatile int value = 0;
    
    public void write() {
        // StoreStore屏障：确保value = 1在flag = true之前执行
        value = 1;
        // StoreLoad屏障：确保所有写操作完成后再执行后续操作
        flag = true;
    }
    
    public void read() {
        // LoadLoad屏障：确保读取flag之前的所有读操作完成
        if (flag) {
            // LoadStore屏障：确保读取操作完成后再执行写操作
            System.out.println(value);
        }
    }
}
```

### 2. 内存屏障的作用

- **LoadLoad屏障**：确保Load1数据的装载先于Load2及后续装载指令的装载
- **StoreStore屏障**：确保Store1数据对其他处理器可见先于Store2及后续存储指令的存储
- **LoadStore屏障**：确保Load1数据装载先于Store2及后续的存储指令刷新到内存
- **StoreLoad屏障**：确保Store1数据对其他处理器变得可见先于Load2及后续装载指令的装载

## 实际应用

### 1. 双重检查锁定（Double-Checked Locking）

```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {           // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) {   // 第二次检查
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### 2. 线程安全的计数器

```java
public class ThreadSafeCounter {
    private volatile int count = 0;
    private final Object lock = new Object();
    
    public void increment() {
        synchronized (lock) {
            count++;
        }
    }
    
    public int getCount() {
        return count;
    }
}
```

### 3. 生产者-消费者模式

```java
public class ProducerConsumer {
    private final Queue<String> queue = new LinkedList<>();
    private final int maxSize = 10;
    private final Object lock = new Object();
    
    public void produce(String item) throws InterruptedException {
        synchronized (lock) {
            while (queue.size() >= maxSize) {
                lock.wait(); // 等待消费者消费
            }
            queue.offer(item);
            lock.notifyAll(); // 通知消费者
        }
    }
    
    public String consume() throws InterruptedException {
        synchronized (lock) {
            while (queue.isEmpty()) {
                lock.wait(); // 等待生产者生产
            }
            String item = queue.poll();
            lock.notifyAll(); // 通知生产者
            return item;
        }
    }
}
```

## 性能优化

### 1. 减少锁的粒度

```java
public class OptimizedCounter {
    private final int[] counters = new int[16];
    private final Object[] locks = new Object[16];
    
    public OptimizedCounter() {
        for (int i = 0; i < locks.length; i++) {
            locks[i] = new Object();
        }
    }
    
    public void increment(int index) {
        synchronized (locks[index % locks.length]) {
            counters[index]++;
        }
    }
    
    public int getCount(int index) {
        synchronized (locks[index % locks.length]) {
            return counters[index];
        }
    }
}
```

### 2. 使用无锁数据结构

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

public class LockFreeCounter {
    private final AtomicInteger counter = new AtomicInteger(0);
    private final AtomicReference<String> value = new AtomicReference<>("");
    
    public void increment() {
        counter.incrementAndGet();
    }
    
    public void setValue(String newValue) {
        value.set(newValue);
    }
    
    public int getCount() {
        return counter.get();
    }
    
    public String getValue() {
        return value.get();
    }
}
```

### 3. 使用ThreadLocal

```java
public class ThreadLocalDemo {
    private static final ThreadLocal<Integer> threadLocal = new ThreadLocal<>();
    
    public void setValue(int value) {
        threadLocal.set(value);
    }
    
    public int getValue() {
        return threadLocal.get();
    }
    
    public void remove() {
        threadLocal.remove(); // 防止内存泄漏
    }
}
```

## 常见问题

### 1. 内存泄漏

```java
public class MemoryLeakDemo {
    private static final Map<String, Object> cache = new ConcurrentHashMap<>();
    
    public void addToCache(String key, Object value) {
        cache.put(key, value);
    }
    
    public void removeFromCache(String key) {
        cache.remove(key); // 及时清理
    }
    
    // 使用WeakHashMap避免内存泄漏
    private static final Map<String, Object> weakCache = new WeakHashMap<>();
}
```

### 2. 死锁

```java
public class DeadlockDemo {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    public void method1() {
        synchronized (lock1) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            synchronized (lock2) {
                System.out.println("method1");
            }
        }
    }
    
    public void method2() {
        synchronized (lock2) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            synchronized (lock1) {
                System.out.println("method2");
            }
        }
    }
}
```

### 3. 活锁

```java
public class LivelockDemo {
    private boolean flag = false;
    
    public void method1() {
        while (flag) {
            Thread.yield(); // 让出CPU
        }
        flag = true;
        // 执行操作
        flag = false;
    }
    
    public void method2() {
        while (!flag) {
            Thread.yield(); // 让出CPU
        }
        flag = false;
        // 执行操作
        flag = true;
    }
}
```
