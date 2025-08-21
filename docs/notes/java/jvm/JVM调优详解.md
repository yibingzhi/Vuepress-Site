---
title: JVM调优详解
createTime: 2025/08/16 17:29:04
permalink: /java//基础语法/qbw2wawe/
---

## JVM内存结构

### 1. 运行时数据区

#### 堆内存（Heap）

- **新生代（Young Generation）**
    - Eden区：新对象分配区域
    - Survivor区：存活对象临时区域（S0、S1）
- **老年代（Old Generation）**
    - 长期存活的对象
    - 大对象直接进入老年代

#### 方法区（Method Area）

- 存储类信息、常量、静态变量
- JDK8后称为元空间（Metaspace）
- 使用本地内存，可动态扩展

#### 虚拟机栈（VM Stack）

- 存储局部变量、操作数栈、方法出口
- 每个线程独立，可能出现StackOverflowError

#### 本地方法栈（Native Method Stack）

- 为本地方法服务
- 可能出现StackOverflowError

#### 程序计数器（Program Counter Register）

- 当前线程执行的字节码行号
- 线程私有，唯一不会OOM的区域

### 2. 内存分配策略

```java
public class MemoryAllocationDemo {
    public static void main(String[] args) {
        // 对象优先在Eden分配
        byte[] allocation1 = new byte[2 * 1024 * 1024];
        
        // 大对象直接进入老年代
        byte[] allocation2 = new byte[4 * 1024 * 1024];
        
        // 长期存活的对象进入老年代
        for (int i = 0; i < 15; i++) {
            allocation1 = new byte[2 * 1024 * 1024];
        }
    }
}
```

## 垃圾回收算法

### 1. 标记-清除算法（Mark-Sweep）

#### 算法原理

- 标记阶段：标记所有需要回收的对象
- 清除阶段：清除被标记的对象

#### 优缺点

- **优点**：实现简单
- **缺点**：内存碎片化、效率不高

### 2. 复制算法（Copying）

#### 算法原理

- 将内存分为两块相等的区域
- 每次只使用其中一块
- 垃圾回收时，将存活对象复制到另一块

#### 优缺点

- **优点**：效率高、无内存碎片
- **缺点**：内存利用率低（50%）

### 3. 标记-整理算法（Mark-Compact）

#### 算法原理

- 标记阶段：标记所有需要回收的对象
- 整理阶段：将存活对象向一端移动

#### 优缺点

- **优点**：无内存碎片
- **缺点**：效率相对较低

### 4. 分代收集算法（Generational Collection）

#### 算法原理

- 根据对象存活周期将内存分为几块
- 新生代使用复制算法
- 老年代使用标记-整理算法

## 垃圾收集器

### 1. Serial收集器

#### 特点

- 单线程收集器
- 工作时需要暂停所有用户线程（Stop-The-World）
- 适合客户端应用

#### 使用场景

```bash
# 启用Serial收集器
-XX:+UseSerialGC
```

### 2. ParNew收集器

#### 特点

- Serial收集器的多线程版本
- 新生代使用复制算法
- 老年代使用Serial Old收集器

#### 使用场景

```bash
# 启用ParNew收集器
-XX:+UseParNewGC
```

### 3. Parallel Scavenge收集器

#### 特点

- 新生代收集器
- 使用复制算法
- 关注吞吐量而非停顿时间

#### 使用场景

```bash
# 启用Parallel Scavenge收集器
-XX:+UseParallelGC
```

### 4. CMS收集器（Concurrent Mark Sweep）

#### 特点

- 并发收集器，减少停顿时间
- 使用标记-清除算法
- 适合对响应时间要求高的应用

#### 工作流程

1. **初始标记**：标记GC Roots直接关联的对象（停顿时间短）
2. **并发标记**：并发标记所有可达对象
3. **重新标记**：修正并发标记期间变动的对象（停顿时间短）
4. **并发清除**：并发清除垃圾对象

#### 使用场景

```bash
# 启用CMS收集器
-XX:+UseConcMarkSweepGC
```

### 5. G1收集器（Garbage First）

#### 特点

- 面向服务端应用的垃圾收集器
- 可预测的停顿时间
- 使用标记-整理算法

#### 内存布局

- 将堆内存分为多个大小相等的Region
- 每个Region可以是Eden、Survivor、Old、Humongous

#### 使用场景

```bash
# 启用G1收集器
-XX:+UseG1GC
```

### 6. ZGC收集器

#### 特点

- 低延迟垃圾收集器
- 停顿时间不超过10ms
- 支持TB级别的堆内存

#### 使用场景

```bash
# 启用ZGC收集器（JDK11+）
-XX:+UseZGC
```

## JVM参数调优

### 1. 堆内存参数

#### 堆大小设置

```bash
# 初始堆大小
-Xms2g

# 最大堆大小
-Xmx4g

# 新生代大小
-Xmn1g

# 新生代中Eden与Survivor的比例
-XX:SurvivorRatio=8

# 老年代与新生代的比例
-XX:NewRatio=2
```

#### 内存分配参数

```bash
# 对象晋升到老年代的年龄阈值
-XX:MaxTenuringThreshold=15

# 大对象阈值
-XX:PretenureSizeThreshold=3145728
```

### 2. GC参数

#### 收集器选择

```bash
# 新生代使用ParNew收集器
-XX:+UseParNewGC

# 老年代使用CMS收集器
-XX:+UseConcMarkSweepGC

# 启用G1收集器
-XX:+UseG1GC
```

#### GC日志参数

```bash
# 启用GC日志
-XX:+PrintGC

# 启用详细GC日志
-XX:+PrintGCDetails

# GC日志输出到文件
-Xloggc:gc.log

# GC日志时间戳
-XX:+PrintGCTimeStamps

# GC日志日期
-XX:+PrintGCDateStamps
```

### 3. 性能调优参数

#### 编译优化

```bash
# 启用JIT编译
-XX:+TieredCompilation

# 编译阈值
-XX:CompileThreshold=10000

# 方法内联
-XX:+Inline
```

#### 内存优化

```bash
# 启用指针压缩
-XX:+UseCompressedOops

# 启用类指针压缩
-XX:+UseCompressedClassPointers

# 启用字符串去重
-XX:+UseStringDeduplication
```

## 性能监控工具

### 1. JVM内置工具

#### jps（JVM Process Status）

```bash
# 列出所有Java进程
jps

# 显示进程的详细信息
jps -v

# 显示进程的完整类名
jps -l
```

#### jstat（JVM Statistics Monitoring Tool）

```bash
# 监控GC统计信息
jstat -gc <pid> 1000

# 监控类加载统计
jstat -class <pid> 1000

# 监控JIT编译统计
jstat -compiler <pid> 1000
```

#### jmap（Memory Map）

```bash
# 生成堆内存转储文件
jmap -dump:format=b,file=heap.hprof <pid>

# 显示堆内存使用情况
jmap -heap <pid>

# 显示对象统计
jmap -histo <pid>
```

#### jstack（Stack Trace）

```bash
# 生成线程转储文件
jstack <pid> > thread.txt

# 显示线程状态
jstack -F <pid>
```

### 2. 第三方监控工具

#### JProfiler

- 商业性能分析工具
- 提供图形化界面
- 支持多种JVM

#### VisualVM

- JDK自带的免费工具
- 提供插件扩展
- 适合开发环境使用

#### MAT（Memory Analyzer Tool）

- Eclipse内存分析工具
- 分析堆内存转储文件
- 查找内存泄漏

### 3. 监控指标

#### GC指标

- **GC频率**：单位时间内GC次数
- **GC耗时**：每次GC的停顿时间
- **GC吞吐量**：GC时间占总时间的比例

#### 内存指标

- **堆内存使用率**：当前使用量/最大容量
- **新生代使用率**：Eden区使用情况
- **老年代使用率**：老年代使用情况

#### 线程指标

- **线程数量**：当前活跃线程数
- **线程状态**：各种状态的线程数量
- **线程堆栈**：线程执行情况

## 调优实战案例

### 1. 内存泄漏排查

#### 问题描述

应用运行一段时间后出现OutOfMemoryError，堆内存持续增长。

#### 排查步骤

```java
// 1. 添加GC日志参数
-XX:+PrintGCDetails -Xloggc:gc.log

// 2. 使用jmap生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

// 3. 使用MAT分析堆转储文件
// 查找占用内存最多的对象
// 分析对象引用关系
```

#### 常见原因

- 集合类未及时清理
- 数据库连接未关闭
- 线程池未正确关闭
- 静态集合持续增长

### 2. GC性能优化

#### 问题描述

应用响应时间不稳定，偶尔出现长时间停顿。

#### 优化策略

```bash
# 1. 调整新生代大小
-Xmn2g

# 2. 调整Survivor比例
-XX:SurvivorRatio=6

# 3. 启用G1收集器
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# 4. 调整Region大小
-XX:G1HeapRegionSize=16m
```

### 3. 线程优化

#### 问题描述

应用线程数量过多，导致系统资源紧张。

#### 优化策略

```java
// 1. 使用线程池
ExecutorService executor = Executors.newFixedThreadPool(10);

// 2. 设置合理的线程池参数
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // 核心线程数
    10,                     // 最大线程数
    60L,                    // 空闲线程存活时间
    TimeUnit.SECONDS,       // 时间单位
    new LinkedBlockingQueue<>(100),  // 工作队列
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

// 3. 监控线程状态
ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
ThreadInfo[] threadInfos = threadBean.dumpAllThreads(false, false);
```

## 最佳实践

### 1. 内存设置原则

#### 堆内存设置

```bash
# 生产环境建议
-Xms4g -Xmx4g  # 堆内存固定大小，避免动态调整

# 新生代大小
-Xmn2g          # 新生代占堆内存的1/2

# 老年代大小
# 老年代 = 堆内存 - 新生代 = 4g - 2g = 2g
```

#### 元空间设置

```bash
# 设置元空间初始大小
-XX:MetaspaceSize=256m

# 设置元空间最大大小
-XX:MaxMetaspaceSize=512m
```

### 2. GC选择原则

#### 响应时间优先

```bash
# 使用CMS或G1收集器
-XX:+UseConcMarkSweepGC
# 或
-XX:+UseG1GC
```

#### 吞吐量优先

```bash
# 使用Parallel收集器
-XX:+UseParallelGC
```

#### 低延迟优先

```bash
# 使用ZGC收集器（JDK11+）
-XX:+UseZGC
```

### 3. 监控告警

#### 关键指标

- 堆内存使用率 > 80%
- GC频率 > 每分钟5次
- GC停顿时间 > 200ms
- 线程数量 > 1000

#### 告警方式

- 邮件通知
- 短信通知
- 钉钉/企业微信通知
- 监控平台告警

### 4. 性能测试

#### 压力测试

```bash
# 使用JMeter进行压力测试
# 模拟高并发场景
# 监控JVM性能指标
```

#### 内存测试

```bash
# 使用MAT分析内存使用
# 查找内存泄漏
# 优化内存分配
```
