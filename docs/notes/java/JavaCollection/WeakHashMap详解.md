---
title: WeakHashMap详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/sp8zklld/
---

#### 一、WeakHashMap 是什么？

WeakHashMap 是 Java 集合框架中的一种键值对存储结构，继承自 AbstractMap，实现了 Map 接口。它是一个基于**哈希表**的映射，**键
**使用 WeakReference（弱引用）存储，允许垃圾回收器在键没有强引用时自动回收对应的键值对，适合缓存等场景。

核心特点：

1. **底层数据结构**：基于数组 + 链表/红黑树（类似 HashMap），但键是 WeakReference。
2. **弱引用键**：当键没有强引用时，垃圾回收器可能回收键值对。
3. **无序性**：键值对没有特定顺序。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 Collections.synchronizedMap 或 ConcurrentHashMap）。
5. **允许 null**：支持 null 键和 null 值。
6. **快速查找**：键的查找、插入、删除操作平均时间复杂度为 O(1)。

使用场景：

- **缓存**：键值对在键失去强引用时自动清理，适合临时存储。
- **元数据管理**：如跟踪对象元数据，当对象被回收时自动移除元数据。

------

#### 二、WeakHashMap 的核心源码结构

来看 WeakHashMap 的类定义和关键字段：

```java
public class WeakHashMap<K,V> extends AbstractMap<K,V> implements Map<K,V> {
    // 默认初始容量（2^4）
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    // 最大容量（2^30）
    private static final int MAXIMUM_CAPACITY = 1 << 30;

    // 默认加载因子
    private static final float DEFAULT_LOAD_FACTOR = 0.75f;

    // 哈希表（存储 Entry）
    Entry<K,V>[] table;

    // 键值对数量
    private int size;

    // 扩容阈值（capacity * loadFactor）
    private int threshold;

    // 加载因子
    private final float loadFactor;

    // 引用队列，用于跟踪被垃圾回收的键
    private final ReferenceQueue<Object> queue = new ReferenceQueue<>();

    // 结构修改次数（用于快速失败）
    int modCount;

    // 内部类：哈希表节点，使用 WeakReference 存储键
    private static class Entry<K,V> extends WeakReference<Object> implements Map.Entry<K,V> {
        V value;          // 值
        int hash;         // 键的哈希值
        Entry<K,V> next;  // 链表的下一个节点

        Entry(Object key, V value, ReferenceQueue<Object> queue, int hash, Entry<K,V> next) {
            super(key, queue); // 键作为弱引用
            this.value = value;
            this.hash = hash;
            this.next = next;
        }
    }
}
```

字段解析：

1. **table**：存储键值对的数组，元素是 Entry（链表节点）。
2. **size**：实际键值对数量。
3. **threshold**：扩容阈值，等于 capacity * loadFactor。
4. **loadFactor**：加载因子，控制哈希表密度（默认 0.75）。
5. **queue**：ReferenceQueue，用于跟踪被垃圾回收的弱引用键。
6. **Entry**：键值对节点，键通过 WeakReference 存储，包含值、哈希值和链表指针。
7. **modCount**：记录结构修改次数，用于快速失败。

弱引用原理：

- **WeakReference**：Entry 的键通过 WeakReference 包装，当键没有强引用（仅被 WeakHashMap 引用）时，垃圾回收器可能回收键，ReferenceQueue
  会收到通知。
- **自动清理**：WeakHashMap 在操作（如 get、put）时检查 queue，移除已被回收的键值对。

------

三、构造方法

WeakHashMap 提供了四种构造方法：

1. **无参构造**：

   ```java
   public WeakHashMap() {
       this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR);
   }
   ```

    - 默认容量 16，加载因子 0.75。

2. **指定初始容量**：

   ```java
   public WeakHashMap(int initialCapacity) {
       this(initialCapacity, DEFAULT_LOAD_FACTOR);
   }
   ```

3. **指定初始容量和加载因子**：

   ```java
   public WeakHashMap(int initialCapacity, float loadFactor) {
       if (initialCapacity < 0)
           throw new IllegalArgumentException("Illegal Initial Capacity: "+ initialCapacity);
       if (initialCapacity > MAXIMUM_CAPACITY)
           initialCapacity = MAXIMUM_CAPACITY;
       if (loadFactor <= 0 || Float.isNaN(loadFactor))
           throw new IllegalArgumentException("Illegal Load Factor: "+ loadFactor);
       this.loadFactor = loadFactor;
       threshold = (int)(initialCapacity * loadFactor);
       table = new Entry[initialCapacity];
   }
   ```

4. **传入 Map**：

   java

   ```java
   public WeakHashMap(Map<? extends K, ? extends V> m) {
       this(Math.max((int) (m.size() / DEFAULT_LOAD_FACTOR) + 1, DEFAULT_INITIAL_CAPACITY),
            DEFAULT_LOAD_FACTOR);
       putAll(m);
   }
   ```

------

#### 四、核心方法解析

1. **垃圾回收清理（expungeStaleEntries）**

WeakHashMap 的核心机制是自动清理被垃圾回收的键值对，几乎所有操作都会调用 expungeStaleEntries：

```java
private void expungeStaleEntries() {
    for (Object x; (x = queue.poll()) != null; ) {
        synchronized (queue) {
            @SuppressWarnings("unchecked")
            Entry<K,V> e = (Entry<K,V>) x;
            int i = indexFor(e.hash, table.length);
            Entry<K,V> prev = table[i];
            Entry<K,V> p = prev;
            while (p != null) {
                Entry<K,V> next = p.next;
                if (p == e) {
                    if (prev == e)
                        table[i] = next;
                    else
                        prev.next = next;
                    e.value = null; // 清空值引用
                    size--;
                    break;
                }
                prev = p;
                p = next;
            }
        }
    }
}
```

- **流程**：
    1. 从 ReferenceQueue 中获取已被回收的 Entry。
    2. 找到该 Entry 所在的哈希表槽位，移除链表中的节点。
    3. 清空值引用，减少 size。
- **触发时机**：get、put、remove 等操作前都会调用。

2. **put(K key, V value)**：添加或更新键值对

```java
public V put(K key, V value) {
    Object k = maskNull(key); // 处理 null 键
    int h = hash(k);
    expungeStaleEntries(); // 清理回收的键值对
    Entry<K,V>[] tab = getTable();
    int i = indexFor(h, tab.length);
    for (Entry<K,V> e = tab[i]; e != null; e = e.next) {
        if (h == e.hash && eq(k, e.get())) {
            V oldValue = e.value;
            if (value != oldValue)
                e.value = value;
            return oldValue;
        }
    }
    modCount++;
    Entry<K,V> e = new Entry<>(k, value, queue, h, tab[i]);
    tab[i] = e;
    if (++size >= threshold)
        resize(2 * tab.length); // 扩容
    return null;
}
```

- **流程**：
    1. 处理 null 键（用 NULL_KEY 替代）。
    2. 计算哈希值，清理回收的键值对。
    3. 查找链表，如果键存在，更新值并返回旧值。
    4. 否则创建新 Entry，插入链表，检查是否需要扩容。
- **性能**：平均时间复杂度为 O(1)，冲突严重时为 O(n)。

3. **get(Object key)**：获取值

```java
public V get(Object key) {
    Object k = maskNull(key);
    int h = hash(k);
    expungeStaleEntries();
    Entry<K,V>[] tab = getTable();
    int i = indexFor(h, tab.length);
    Entry<K,V> e = tab[i];
    while (e != null) {
        if (e.hash == h && eq(k, e.get()))
            return e.value;
        e = e.next;
    }
    return null;
}
```

- **流程**：
    1. 处理 null 键，计算哈希值，清理回收的键值对。
    2. 遍历链表，查找键并返回对应值。
- **性能**：平均时间复杂度为 O(1)。

4. **remove(Object key)**：删除键值对

```java
public V remove(Object key) {
    Object k = maskNull(key);
    int h = hash(k);
    expungeStaleEntries();
    Entry<K,V>[] tab = getTable();
    int i = indexFor(h, tab.length);
    Entry<K,V> prev = tab[i];
    Entry<K,V> e = prev;
    while (e != null) {
        Entry<K,V> next = e.next;
        if (h == e.hash && eq(k, e.get())) {
            modCount++;
            size--;
            if (prev == e)
                tab[i] = next;
            else
                prev.next = next;
            return e.value;
        }
        prev = e;
        e = next;
    }
    return null;
}
```

- **流程**：
    1. 处理 null 键，计算哈希值，清理回收的键值对。
    2. 遍历链表，移除匹配的节点，返回值。
- **性能**：平均时间复杂度为 O(1)。

5. **resize(int newCapacity)**：扩容

```java
private void resize(int newCapacity) {
    Entry<K,V>[] oldTab = table;
    int oldLen = oldTab.length;
    Entry<K,V>[] newTab = new Entry[newCapacity];
    modCount++;
    transfer(oldTab, newTab);
    table = newTab;
    threshold = (int)(newCapacity * loadFactor);
}
private void transfer(Entry<K,V>[] src, Entry<K,V>[] dst) {
    for (int j = 0; j < src.length; ++j) {
        Entry<K,V> e = src[j];
        src[j] = null;
        while (e != null) {
            Entry<K,V> next = e.next;
            Object key = e.get();
            if (key == null) { // 键已被回收
                e.next = null;
                e.value = null;
                size--;
            } else {
                int i = indexFor(e.hash, dst.length);
                e.next = dst[i];
                dst[i] = e;
            }
            e = next;
        }
    }
}
```

- **流程**：
    1. 创建新数组（容量翻倍）。
    2. 迁移旧数组的节点，检查键是否被回收。
    3. 更新 table 和 threshold。
- **性能**：时间复杂度为 O(n)。

6. **clear()**：清空映射

```java
public void clear() {
    while (queue.poll() != null)
        ; // 清空引用队列
    modCount++;
    Arrays.fill(table, null);
    size = 0;
}
```

- **流程**：清空引用队列和哈希表，重置 size。
- **性能**：时间复杂度为 O(n)。

------

#### 五、性能分析

| 操作                  | 时间复杂度    | 说明             |
|---------------------|----------|----------------|
| put(K key, V value) | O(1)（平均） | 哈希表操作，冲突时 O(n) |
| get(Object key)     | O(1)（平均） | 哈希表操作，冲突时 O(n) |
| remove(Object key)  | O(1)（平均） | 哈希表操作，冲突时 O(n) |
| resize()            | O(n)     | 迁移所有节点         |
| clear()             | O(n)     | 清空哈希表          |

------

#### 六、代码示例

以下是一个展示 WeakHashMap 弱引用特性的示例：

```java
import java.util.*;

public class WeakHashMapExample {
    public static void main(String[] args) {
        WeakHashMap<String, String> map = new WeakHashMap<>();
        
        // 创建键（故意不保留强引用）
        String key1 = new String("key1");
        String key2 = new String("key2");
        map.put(key1, "value1");
        map.put(key2, "value2");
        
        System.out.println("Before GC: " + map); // 输出: {key1=value1, key2=value2}
        
        // 移除强引用
        key1 = null;
        key2 = null;
        
        // 触发垃圾回收
        System.gc();
        
        // 等待垃圾回收完成（实际应用中不保证立即回收）
        try { Thread.sleep(100); } catch (Exception e) {}
        
        System.out.println("After GC: " + map); // 输出: {} 或部分键值对（取决于 GC）
    }
}
```

------

七、常见问题和注意事项

1. **线程安全**：

    - WeakHashMap 不是线程安全的，多线程操作可能导致数据不一致。

    - 解决方法：

      java

     ```java
     Map<String, String> synchronizedMap = Collections.synchronizedMap(new WeakHashMap<>());
     ```

2. **弱引用的行为**：

    - 键必须没有强引用，否则不会被垃圾回收。
    - 垃圾回收时机不可预测，键值对可能在任意时刻被移除。

3. **与 HashMap 的对比**：

   | 特性      | WeakHashMap            | HashMap      |
               | --------- | ---------------------- | ------------ |
   | 键引用    | 弱引用（可被 GC 回收） | 强引用       |
   | 用途      | 缓存、临时存储         | 通用键值存储 |
   | 性能      | O(1)（平均）           | O(1)（平均） |
   | 线程安全  | 不安全                 | 不安全       |
   | 允许 null | 是                     | 是           |
   | 内存管理  | 自动清理               | 手动清理     |

4. **不适合的场景**：

    - 需要持久存储的键值对（因键可能被回收）。
    - 对键值对存在时间有严格要求的场景。

5. **哈希冲突**：

    - 良好的 hashCode 分布减少冲突。
    - WeakHashMap 未使用红黑树（不像 HashMap），冲突严重时性能退化为 O(n)。

6. **替代方案**：

    - **Guava Cache**：更强大的缓存功能，支持过期和最大大小。
    - **ConcurrentHashMap**：线程安全的键值存储。

------

八、总结

WeakHashMap 是一个基于哈希表的键值映射，键使用弱引用，适合缓存等需要自动清理的场景。它的核心特点包括：

- **优点**：键值对自动清理，节省内存，操作高效（O(1)）。
- **缺点**：线程不安全，垃圾回收不可控，冲突处理较弱。

