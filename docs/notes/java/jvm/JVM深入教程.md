---
title: JVM深入教程
createTime: 2025/08/18 09:55:33
permalink: /java/p0cq76ee/
---

# JVM深入教程

本文档配合‘com.ibz.jvm`包中的Java文件，详细介绍Java虚拟机（JVM）的核心概念、内存管理、垃圾回收机制和性能调优等方面的知识。

## JVM基础概念

Java虚拟机（JVM）是Java平台的核心组件，它是一个虚拟的计算机，负责执行Java字节码。JVM使得Java程序能够实现"一次编写，到处运行"
的特性。

### JVM的主要功能

1. **类加载**：加载、链接和初始化Java类
2. **内存管理**：管理程序运行时的内存分配和回收
3. **垃圾回收**：自动回收不再使用的对象内存
4. **执行引擎**：执行字节码指令
5. **安全控制**：提供安全沙箱环境
6. **性能优化**：通过即时编译（JIT）等技术优化程序性能

### JVM架构

JVM主要由以下几个组件构成：

1. **类加载器子系统（Class Loader Subsystem）**：负责加载Java类文件
2. **运行时数据区（Runtime Data Areas）**：包含方法区、堆、栈、程序计数器等内存区域
3. **执行引擎（Execution Engine）**：执行字节码指令
4. **本地方法接口（JNI）**：与本地方法库交互
5. **本地方法库（Native Method Libraries）**：提供本地方法实现

## JVM内存结构

JVM在运行时会将内存划分为不同的区域，每个区域有其特定的用途。

### 程序计数器（Program Counter Register）

程序计数器是一块较小的内存空间，可以看作是当前线程所执行的字节码的行号指示器。

特点：

- 每个线程都有独立的程序计数器
- 是唯一不会出现OutOfMemoryError的内存区域
- 如果线程执行的是Java方法，计数器记录的是正在执行的虚拟机字节码指令地址
- 如果线程执行的是Native方法，计数器值为空（Undefined）

### Java虚拟机栈（Java Virtual Machine Stacks）

Java虚拟机栈描述的是Java方法执行的内存模型，每个方法在执行时都会创建一个栈帧（Stack Frame）用于存储局部变量表、操作数栈、动态链接、方法出口等信息。

特点：

- 每个线程都有独立的虚拟机栈
- 栈帧随着方法的调用和返回而创建和销毁
- 局部变量表存放了编译期可知的各种基本数据类型、对象引用和returnAddress类型
- 可能出现StackOverflowError（栈深度超出限制）和OutOfMemoryError（栈扩展时无法申请到足够内存）

### 本地方法栈（Native Method Stacks）

本地方法栈与虚拟机栈作用相似，只不过虚拟机栈为虚拟机执行Java方法服务，而本地方法栈为虚拟机使用到的Native方法服务。

特点：

- 与虚拟机栈类似，也会出现StackOverflowError和OutOfMemoryError
- 有些虚拟机实现将本地方法栈和虚拟机栈合二为一

### Java堆（Java Heap）

Java堆是虚拟机所管理的内存中最大的一块，被所有线程共享，在虚拟机启动时创建。此内存区域的唯一目的就是存放对象实例。

特点：

- 是垃圾收集器管理的主要区域
- 可以处于物理上不连续的内存空间中，但在逻辑上应该连续
- 可以通过-Xmx和-Xms参数控制最大值和初始值
- 如果堆中没有内存完成实例分配，并且堆也无法再扩展时，将会抛出OutOfMemoryError

### 方法区（Method Area）

方法区与Java堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。

特点：

- 不需要连续的物理内存
- 可以选择不实现垃圾收集
- 当方法区无法满足内存分配需求时，将抛出OutOfMemoryError
- 在HotSpot虚拟机中，方法区也被称为"永久代"（Permanent Generation），在JDK 8及以后版本中被"元空间"（Metaspace）替代

### 运行时常量池（Runtime Constant Pool）

运行时常量池是方法区的一部分，用于存放编译期生成的各种字面量和符号引用。

特点：

- 具备动态性，运行期间也可能将新的常量放入池中
- 当无法再申请到内存时会抛出OutOfMemoryError

## 垃圾回收机制

垃圾回收（Garbage Collection，GC）是JVM自动管理内存的重要机制，它负责回收不再使用的对象内存。

### 垃圾回收的基本概念

垃圾回收主要解决以下问题：

1. **哪些内存需要回收**：识别不再使用的对象
2. **什么时候回收**：确定合适的回收时机
3. **如何回收**：采用合适的回收算法和策略

### 对象存活判断算法

1. **引用计数算法**：
    - 给对象添加一个引用计数器，每当有一个地方引用它时，计数器加1；引用失效时减1
    - 计数器为0的对象就是不可能再被使用的
    - 主要缺陷：很难解决对象之间相互循环引用的问题

2. **可达性分析算法**：
    - 通过一系列称为"GC Roots"的对象作为起始点，从这些节点开始向下搜索
    - 搜索所走过的路径称为引用链，当一个对象到GC Roots没有任何引用链相连时，则证明此对象是不可用的
    - 在Java语言中，可作为GC Roots的对象包括：
        - 虚拟机栈中引用的对象
        - 方法区中类静态属性引用的对象
        - 方法区中常量引用的对象
        - 本地方法栈中JNI引用的对象

### 引用类型

Java提供了四种引用类型，用于更灵活地控制对象的生命周期：

1. **强引用（Strong Reference）**：
    - 默认的引用类型，如`Object obj = new Object()`
    - 只要强引用还存在，垃圾收集器永远不会回收被引用的对象

2. **软引用（Soft Reference）**：
    - 用来描述一些还有用但并非必需的对象
    - 在系统将要发生内存溢出异常之前，会把这些对象列进回收范围之中进行第二次回收

3. **弱引用（Weak Reference）**：
    - 用来描述非必需对象
    - 被弱引用关联的对象只能生存到下一次垃圾收集发生之前

4. **虚引用（Phantom Reference）**：
    - 最弱的一种引用关系
    - 一个对象是否有虚引用的存在，完全不会对其生存时间构成影响
    - 也无法通过虚引用来取得一个对象实例
    - 唯一目的就是能在这个对象被收集器回收时收到一个系统通知

### 垃圾回收算法

1. **标记-清除算法（Mark-Sweep）**：
    - 算法分为"标记"和"清除"两个阶段
    - 首先标记出所有需要回收的对象，然后统一回收所有被标记的对象
    - 主要不足：效率问题和空间问题（产生大量不连续的内存碎片）

2. **复制算法（Copying）**：
    - 将可用内存按容量划分为大小相等的两块，每次只使用其中一块
    - 当这一块内存用完了，就将还存活着的对象复制到另外一块上面，然后再把已使用过的内存空间一次清理掉
    - 适用于对象存活率较低的场景，如新生代

3. **标记-整理算法（Mark-Compact）**：
    - 标记过程仍然与"标记-清除"算法一样，但后续步骤不是直接对可回收对象进行清理，而是让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存
    - 适用于对象存活率较高的场景，如老年代

4. **分代收集算法（Generational Collection）**：
    - 根据对象存活周期的不同将内存划分为几块
    - 一般是把Java堆分为新生代和老年代
    - 在新生代中，每次垃圾收集时都发现有大批对象死去，只有少量存活，就选用复制算法
    - 在老年代中，因为对象存活率高、没有额外空间对它进行分配担保，就必须使用"标记-清理"或"标记-整理"算法来进行回收

### 垃圾收集器

1. **Serial收集器**：
    - 单线程收集器，在进行垃圾收集时，必须暂停其他所有的工作线程
    - 适用于Client模式下的简单应用

2. **ParNew收集器**：
    - Serial收集器的多线程版本
    - 除了使用多线程进行垃圾收集之外，其余行为包括Serial收集器可用的所有控制参数、收集算法、Stop The
      World、对象分配规则、回收策略等都与Serial收集器完全一样

3. **Parallel Scavenge收集器**：
    - 关注点是达到一个可控制的吞吐量
    - 吞吐量=运行用户代码时间/(运行用户代码时间+垃圾收集时间)

4. **Serial Old收集器**：
    - Serial收集器的老年代版本
    - 使用"标记-整理"算法

5. **Parallel Old收集器**：
    - Parallel Scavenge收集器的老年代版本
    - 使用多线程和"标记-整理"算法

6. **CMS收集器（Concurrent Mark Sweep）**：
    - 以获取最短回收停顿时间为目标的收集器
    - 基于"标记-清除"算法实现
    - 运作过程分为四个步骤：初始标记、并发标记、重新标记、并发清除

7. **G1收集器（Garbage First）**：
    - 面向服务端应用的垃圾收集器
    - 将整个Java堆划分为多个大小相等的独立区域（Region）
    - 能够建立可预测的停顿时间模型

## JVM性能调优

JVM性能调优是提高Java应用程序性能的重要手段。

### 内存调优参数

1. **堆内存设置**：
    - `-Xms`：设置堆的初始大小
    - `-Xmx`：设置堆的最大大小
    - `-Xmn`：设置新生代大小
    - `-XX:NewRatio`：设置老年代与新生代的比例
    - `-XX:SurvivorRatio`：设置新生代中Eden区与Survivor区的比例

2. **方法区设置**：
    - `-XX:PermSize`：设置永久代初始大小（JDK 7及以前）
    - `-XX:MaxPermSize`：设置永久代最大大小（JDK 7及以前）
    - `-XX:MetaspaceSize`：设置元空间初始大小（JDK 8及以后）
    - `-XX:MaxMetaspaceSize`：设置元空间最大大小（JDK 8及以后）

3. **垃圾收集器设置**：
    - `-XX:+UseSerialGC`：使用Serial+Serial Old收集器组合
    - `-XX:+UseParNewGC`：使用ParNew+Serial Old收集器组合
    - `-XX:+UseConcMarkSweepGC`：使用ParNew+CMS+Serial Old收集器组合
    - `-XX:+UseParallelGC`：使用Parallel Scavenge+Serial Old收集器组合
    - `-XX:+UseParallelOldGC`：使用Parallel Scavenge+Parallel Old收集器组合
    - `-XX:+UseG1GC`：使用G1收集器

### 性能优化实践

1. **合理的对象生命周期管理**：
    - 尽量避免创建不必要的对象
    - 重用对象而不是频繁创建和销毁
    - 注意对象的作用域，及时释放引用

2. **选择合适的数据结构**：
    - 根据使用场景选择合适的集合类
    - 避免在ArrayList头部频繁插入或删除元素
    - 合理设置集合的初始容量

3. **字符串处理优化**：
    - 避免使用"+"操作符进行大量字符串拼接
    - 使用StringBuilder或StringBuffer进行字符串拼接
    - 重用StringBuilder对象

4. **异常处理优化**：
    - 避免使用异常控制程序流程
    - 合理使用异常，避免频繁抛出和捕获异常

5. **I/O操作优化**：
    - 使用缓冲流提高I/O性能
    - 合理设置缓冲区大小
    - 及时关闭资源

### JVM监控和分析工具

1. **jps**：查看Java进程
2. **jstat**：监视虚拟机各种运行状态信息
3. **jinfo**：查看和修改虚拟机各项参数
4. **jmap**：生成堆转储快照
5. **jhat**：分析堆转储快照
6. **jstack**：生成虚拟机当前时刻的线程快照
7. **VisualVM**：可视化监控工具
8. **JConsole**：可视化监控工具

## 包结构说明

为了更好地组织代码，我们将JVM相关的类放在`com.ibz.jvm`包中：

```
src/main/java/com/ibz/jvm/
├── MemoryModelDemo.java          // JVM内存模型演示
├── GarbageCollectionDemo.java    // 垃圾回收机制演示
├── PerformanceTuningDemo.java    // JVM性能调优演示
├── JVMParametersDemo.java        // JVM参数配置演示
└── JVMComprehensiveDemo.java     // JVM综合演示
```

## 运行示例

要运行JVM相关示例，使用以下命令：

```bash
# 运行JVM内存模型演示
mvn exec:java -Dexec.mainClass="com.ibz.jvm.MemoryModelDemo"

# 运行垃圾回收机制演示
mvn exec:java -Dexec.mainClass="com.ibz.jvm.GarbageCollectionDemo"

# 运行JVM性能调优演示
mvn exec:java -Dexec.mainClass="com.ibz.jvm.PerformanceTuningDemo"

# 运行JVM参数配置演示
mvn exec:java -Dexec.mainClass="com.ibz.jvm.JVMParametersDemo"

# 运行JVM综合演示
mvn exec:java -Dexec.mainClass="com.ibz.jvm.JVMComprehensiveDemo"
```

## JVM调优示例

### 常用JVM启动参数

```bash
# 设置堆内存大小
java -Xms512m -Xmx2g MyApp

# 设置新生代大小
java -Xmn256m MyApp

# 使用G1垃圾收集器
java -XX:+UseG1GC MyApp

# 设置GC日志
java -XX:+PrintGC -XX:+PrintGCDetails -Xloggc:gc.log MyApp

# 设置元空间大小
java -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m MyApp
```

### 性能分析示例

```java
// 获取内存使用情况
Runtime runtime = Runtime.getRuntime();
long maxMemory = runtime.maxMemory();
long totalMemory = runtime.totalMemory();
long freeMemory = runtime.freeMemory();
long usedMemory = totalMemory - freeMemory;

System.out.println("最大内存: " + maxMemory / (1024 * 1024) + " MB");
System.out.println("已分配内存: " + totalMemory / (1024 * 1024) + " MB");
System.out.println("已使用内存: " + usedMemory / (1024 * 1024) + " MB");
System.out.println("空闲内存: " + freeMemory / (1024 * 1024) + " MB");
```

## 最佳实践

### 1. 合理设置JVM参数

```bash
# 生产环境推荐设置
java -server \
     -Xms2g -Xmx2g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+PrintGC \
     -XX:+PrintGCDetails \
     -XX:+PrintGCTimeStamps \
     -Xloggc:gc.log \
     MyApp
```

### 2. 内存泄漏检测

```java
// 使用弱引用避免内存泄漏
Map<String, WeakReference<Object>> cache = new HashMap<>();

// 及时清理不再需要的对象引用
objectReference = null;
```

### 3. 性能监控

```java
// 监控内存使用情况
MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
System.out.println("堆内存使用率: " + 
    (heapUsage.getUsed() * 100.0 / heapUsage.getMax()) + "%");
```

## 总结

JVM是Java平台的核心组件，深入理解JVM的工作原理对于Java开发者来说至关重要。通过学习本教程，您应该能够：

1. **理解JVM内存结构**：掌握程序计数器、虚拟机栈、堆、方法区等内存区域的作用和特点
2. **掌握垃圾回收机制**：了解垃圾回收的基本原理、算法和收集器类型
3. **进行JVM性能调优**：学会通过合理的JVM参数设置和代码优化提升应用性能
4. **使用监控工具**：掌握JVM监控和分析工具的使用方法
5. **避免常见问题**：了解内存泄漏、内存溢出等问题的预防和解决方法

JVM优化是一个持续的过程，需要根据应用的特点和运行环境进行调整。在实际开发中，应该：

- 合理设置JVM内存参数
- 选择合适的垃圾收集器
- 监控应用的内存使用情况
- 及时发现和解决内存泄漏问题
- 通过性能测试验证优化效果

通过不断学习和实践，您将能够更好地掌握JVM相关知识，编写出高性能的Java应用程序。
