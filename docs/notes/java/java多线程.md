---
title: java多线程
createTime: 2024/11/19 10:20:48
permalink: /article/gfzdg4re/
---
以下是一份较为全面的Java多线程笔记：

### 一、线程基础概念

- **进程与线程**：
    - **进程**：是操作系统进行资源分配和调度的基本单位，一个进程通常包含了程序执行所需要的资源（如内存空间、文件句柄等），不同进程之间相互独立，有独立的内存空间，例如同时打开浏览器和文本编辑器，它们就是两个不同的进程。
    - **线程**
      ：是进程中的一个执行单元，一个进程可以包含多个线程，线程共享所在进程的资源（如内存、文件描述符等），它们可以并发执行不同的任务，提高程序执行效率，比如在一个文本编辑器进程中，可能有一个线程负责接收用户输入，另一个线程负责实时保存文档内容等。
- **多线程的优势**：
    - **提高资源利用率**：当一个线程因为等待I/O操作（如读取文件、网络请求等）而阻塞时，其他线程可以继续利用CPU资源执行任务，避免CPU闲置浪费。
    - **提升程序响应速度**：在图形用户界面应用中，一个线程可以负责界面的渲染和响应用户操作，另一个线程可以在后台进行复杂的数据处理，使得用户操作界面时不会出现卡顿，提升响应体验。
    - **便于进行并行处理**：对于可以并行执行的任务，比如多个文件的加密操作，可以为每个文件开启一个线程同时进行加密，加快整体处理速度。

### 二、创建线程的方式

- **继承Thread类**：
    - **步骤**：
        1. 创建一个类继承自`Thread`类。
        2. 重写`run`方法，在`run`方法中定义该线程要执行的任务逻辑。
        3. 创建该子类的实例，然后调用`start`方法启动线程。
    - **示例代码**：

```java
class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("线程执行中：" + i);
        }
    }
}

public class ThreadDemo {
    public static void main(String[] args) {
        MyThread myThread = new MyThread();
        myThread.start();
    }
}
```

- **实现Runnable接口**：
    - **步骤**：
        1. 创建一个类实现`Runnable`接口。
        2. 实现`run`方法，在其中编写任务逻辑。
        3. 创建该实现类的实例，再将实例作为参数传递给`Thread`类的构造函数创建`Thread`对象，最后调用`start`方法启动线程。
    - **示例代码**：

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println("通过Runnable实现的线程执行中：" + i);
        }
    }
}

public class RunnableDemo {
    public static void main(String[] args) {
        MyRunnable myRunnable = new MyRunnable();
        Thread thread = new Thread(myRunnable);
        thread.start();
    }
}
```

- **使用Callable和Future接口（有返回值的线程创建方式）**：
    - **步骤**：
        1. 创建一个类实现`Callable`接口，指定返回值类型，并重写`call`方法，在`call`方法中编写任务逻辑并返回结果。
        2. 创建`Callable`实现类的实例，然后通过`ExecutorService`（线程池相关，后续介绍）来提交任务，可以得到一个`Future`对象。
        3. 通过`Future`对象的`get`方法可以获取线程执行结束后的返回结果（会阻塞当前线程直到获取到结果）。
    - **示例代码**：

```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += i;
        }
        return sum;
    }
}

public class CallableDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService executorService = Executors.newFixedThreadPool(1);
        MyCallable myCallable = new MyCallable();
        Future<Integer> future = executorService.submit(myCallable);
        Integer result = future.get();
        System.out.println("线程执行结果：" + result);
        executorService.shutdown();
    }
}
```

### 三、线程的生命周期

- **新建（New）**：当创建了一个`Thread`类的实例或者通过实现`Runnable`等方式准备创建线程时，线程处于新建状态，此时线程还未开始执行。
- **就绪（Runnable）**：调用`start`方法后，线程进入就绪状态，此时线程等待获取CPU资源，一旦获得CPU时间片，就可以开始执行。
- **运行（Running）**：线程获得CPU资源，开始执行`run`方法中的任务逻辑，处于运行状态。
- **阻塞（Blocked）**：当线程因为某些原因（如等待获取锁、等待I/O操作完成等）暂时无法继续执行时，进入阻塞状态，此时会让出CPU资源，直到阻塞条件解除。
- **死亡（Terminated）**：线程执行完`run`方法中的任务逻辑，或者因为异常等原因提前结束，线程就进入死亡状态，此时线程的生命周期结束，不能再重新启动。

### 四、线程的控制方法

- **start()**：启动线程，使线程进入就绪状态，等待CPU调度执行。注意不能多次调用`start`方法，否则会抛出
  `IllegalThreadStateException`异常。
- **run()**：线程执行的任务逻辑所在的方法，直接调用`run`方法并不会启动新线程，而是在当前线程中顺序执行`run`
  方法里的内容，这和调用普通方法类似，要通过`start`方法来真正启动线程去执行`run`方法。
- **sleep(long millis)**：使当前线程暂停执行一段时间（以毫秒为单位），该线程进入阻塞状态，不占用CPU资源，时间到后线程会重新进入就绪状态等待CPU调度。例如：

```java
try {
    Thread.sleep(1000); // 线程暂停1秒
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

- **join()**：用于等待调用该方法的线程执行结束。比如在主线程中调用某个子线程的`join`方法，主线程会阻塞，直到这个子线程执行完毕后，主线程才会继续往下执行。示例：

```java
Thread thread = new Thread(() -> {
    for (int i = 0; i < 5; i++) {
        System.out.println("子线程执行中：" + i);
    }
});
thread.start();
try {
    thread.join();
} catch (InterruptedException e) {
    e.printStackTrace();
}
System.out.println("主线程继续执行");
```

- **yield()**：暂停当前正在执行的线程，使它让出CPU资源，让线程重新进入就绪状态，与其他就绪线程一起竞争CPU时间片，但并不能保证当前线程一定会让出CPU，只是一种提示操作系统的方式。例如：

```java
Thread thread = new Thread(() -> {
    for (int i = 0; i < 10; i++) {
        System.out.println("线程执行中：" + i);
        if (i % 2 == 0) {
            Thread.yield();
        }
    }
});
thread.start();
```

### 五、线程同步

- **为什么需要线程同步**
  ：当多个线程并发访问共享资源（如共享变量、文件等）时，如果没有合适的控制机制，可能会导致数据不一致、逻辑错误等问题，例如多个线程同时对一个计数器变量进行自增操作，可能会出现最终结果不符合预期的情况。
- **同步方法（synchronized关键字修饰方法）**：
    - 在方法声明上添加`synchronized`
      关键字，当一个线程访问该方法时，会获取对象的锁（对于非静态方法获取的是当前实例对象的锁，对于静态方法获取的是类对象的锁），其他线程如果也要访问该方法，必须等待锁被释放。示例：

```java
class Counter {
    private int count = 0;
    public synchronized void increment() {
        count++;
    }
    public int getCount() {
        return count;
    }
}
```

- **同步代码块（synchronized关键字修饰代码块）**：
    - 使用`synchronized`关键字包裹一段代码块，并指定要获取的锁对象，这样可以更精细地控制同步范围，相比于同步方法能减少锁的粒度，提高并发性能。示例：

```java
class Counter {
    private int count = 0;
    private Object lock = new Object();
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

- **ReentrantLock类（可重入锁）**：
    - `java.util.concurrent.locks`包下的可重入锁，功能类似`synchronized`关键字，但提供了更灵活的锁操作，比如可以尝试获取锁、可中断地获取锁等。示例：

```java
import java.util.concurrent.locks.ReentrantLock;

class Counter {
    private int count = 0;
    private ReentrantLock lock = new ReentrantLock();
    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
    public int getCount() {
        return count;
    }
}
```

### 六、线程通信

- **Object类的`wait()`、`notify()`和`notifyAll()`方法**：
    - **wait()**：使当前线程进入等待状态，释放它持有的对象锁，直到其他线程调用该对象的`notify()`或`notifyAll()`
      方法唤醒它，一般要在同步代码块或同步方法中使用，并且要先获取对象锁。例如：

```java
class SharedResource {
    private boolean flag = false;
    public synchronized void waitForSignal() throws InterruptedException {
        while (!flag) {
            wait();
        }
        flag = false;
    }
    public synchronized void sendSignal() {
        flag = true;
        notify();
    }
}
```

    - **notify()**：唤醒在此对象监视器上等待的单个线程，如果有多个线程等待，会随机唤醒其中一个线程，同样要在同步代码块或同步方法中使用。
    - **notifyAll()**：唤醒在此对象监视器上等待的所有线程，常用于多个线程需要被同时唤醒重新竞争资源的场景，也要在同步环境中使用。

- **Condition接口（在`ReentrantLock`配合下使用）**：
    - 提供了更灵活的线程等待和唤醒机制，通过`ReentrantLock`的`newCondition`方法可以创建`Condition`对象，然后可以使用
      `await`方法让线程等待，使用`signal`或`signalAll`方法唤醒线程，常用于生产者消费者模式等复杂的线程通信场景。示例：

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

class Buffer {
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    private final int[] buffer = new int[10];
    private int count = 0;
    private int putIndex = 0;
    private int takeIndex = 0;

    public void put(int value) throws InterruptedException {
        lock.lock();
        try {
            while (count == buffer.length) {
                notFull.await();
            }
            buffer[putIndex] = value;
            putIndex = (putIndex + 1) % buffer.length;
            count++;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public int take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) {
                notEmpty.await();
            }
            int value = buffer[takeIndex];
            takeIndex = (takeIndex + 1) % buffer.length;
            count--;
            notFull.signal();
            return value;
        } finally {
            lock.unlock();
        }
    }
}
```

### 七、线程池

- **为什么使用线程池**：
    -
    线程的创建和销毁是有成本的（涉及系统资源分配和回收等操作），频繁创建和销毁线程会消耗大量资源并且效率低下。线程池可以提前创建好一定数量的线程，当有任务需要执行时，直接从线程池中获取线程来执行任务，任务执行完后线程不会销毁，而是回到线程池中等待下一次任务分配，提高了资源利用率和任务执行效率。
- **常用的线程池类型（通过`Executors`工具类创建）**：
    - **`FixedThreadPool`**：创建一个固定线程数量的线程池，线程数量在创建时指定，不会动态改变，适用于负载比较稳定的场景。例如：

```java
ExecutorService executorService = Executors.newFixedThreadPool(5);
for (int i = 0; i < 10; i++) {
    executorService.execute(() -> {
        System.out.println("线程池中的线程执行任务");
    });
}
executorService.shutdown();
```

    - **`CachedThreadPool`**：线程池中的线程数量会根据任务数量动态调整，如果有新任务提交，当前线程池没有空闲线程时，会创建新线程来执行任务，空闲一段时间（默认60秒）的线程会被回收，适用于任务数量变化较大、执行时间较短的场景。
    - **`ScheduledThreadPool`**：可以用于执行定时任务或者周期性任务，比如定时执行某个数据库备份操作或者周期性地检查系统状态等。示例：

```java
ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(3);
// 延迟5秒后执行任务
scheduledExecutorService.schedule(() -> {
    System.out.println("延迟5秒执行的任务");
}, 5, TimeUnit.SECONDS);
// 每隔2秒执行一次任务
scheduledExecutorService.scheduleAtFixedRate(() -> {
    System.out.println("每隔2秒执行的任务");
}, 0, 2, TimeUnit.SECONDS);
scheduledExecutorService.shutdown();
```

    - **`SingleThreadExecutor`**：线程池中只有一个线程，所有任务按照提交顺序依次执行，常用于保证任务执行的顺序性，例如在需要顺序处理日志记录等场景。

- **线程池的核心参数（通过`ThreadPoolExecutor`构造函数自定义线程池时）**：
    - **`corePoolSize`**：线程池的核心线程数量，即使线程处于空闲状态，也不会被销毁。
    - **`maximumPoolSize`**：线程池允许存在的最大线程数量，当任务队列满了且线程数量小于这个值时，会创建新线程来处理任务。
    - **`keepAliveTime`**：非核心线程空闲的存活时间，超过这个时间，空闲的非核心线程会被销毁。
    - **`unit`**：`keepAliveTime`的时间单位，如`TimeUnit.SECONDS`（秒）、`TimeUnit.MINUTES`（分钟）等。
    - **`workQueue`**：用于存放等待执行的任务的阻塞队列，常见的有`LinkedBlockingQueue`（无界队列）、`ArrayBlockingQueue`
      （有界队列）等。
    - **`threadFactory`**：用于创建线程的工厂，可以自定义线程的名称、优先级等属性。
    - **`handler`**：当线程池和任务队列都满了，无法再接收新任务时，对新提交任务的拒绝策略，比如
      `ThreadPoolExecutor.AbortPolicy`（直接抛出异常拒绝任务）、`ThreadPoolExecutor.CallerRunsPolicy`（由提交任务的线程自己执行任务）等。

### 八、线程安全的集合类

- **`ConcurrentHashMap`**：
    - 是`java.util.concurrent`包下的线程安全的哈希表实现，相比于传统的`HashMap`
      在多线程环境下，它采用了更细粒度的锁机制（分段锁等）来保证并发访问的安全性，提高了并发性能，常用于多线程共享数据且频繁进行读写操作的场景，例如在一个多线程的缓存系统中存储键值对数据。
- **`CopyOnWriteArrayList`**：
    - 是线程安全的`ArrayList`
      实现，它的特点是在进行写操作（如添加、删除元素）时，会复制一份原数组进行修改，修改完后再替换原来的数组，这样在读操作时不需要加锁，适合读多写少的并发场景，比如在一个多线程的配置文件读取场景中，多个线程可能频繁读取配置项，偶尔才会有修改配置的操作。
- **`BlockingQueue`接口及其实现类（如`LinkedBlockingQueue`、`ArrayBlockingQueue`等）**：
    - `BlockingQueue`
      是一种支持阻塞操作的队列，常用于生产者消费者模式等多线程协作场景。例如在生产者消费者模式中，生产者线程向队列中放入元素，如果队列已满，生产者线程会阻塞等待队列有空间；消费者线程从队列中取出元素，如果队列为空，消费者线程会阻塞等待队列中有元素可供消费。

以上就是Java多线程的基本知识点总结，掌握这些内容后可以在实际开发中更好地利用多线程