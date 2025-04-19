---
title: HashSet & HashMap详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/un1qbrhg/
---

# 一、HashSet 详解

1.1 什么是 HashSet？

HashSet 是 Java 集合框架中的一种集合类，基于**哈希表**实现，实现了 Set 接口。它存储**无序**且**不重复**的元素，适合快速查找和去重场景。

核心特点：

1. **底层数据结构**：基于 HashMap，元素存储在 HashMap 的键中，值是固定对象（PRESENT）。
2. **无序性**：元素没有特定顺序（不保证插入顺序）。
3. **唯一性**：不允许存储重复元素（基于 hashCode 和 equals 判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 Collections.synchronizedSet 或 ConcurrentHashMap 的键集）。
5. **允许 null**：可以存储一个 null 元素。
6. **快速查找**：添加、删除、查找操作的平均时间复杂度为 O(1)。

------

1.2 HashSet 的核心源码结构

HashSet 的实现非常简单，底层完全依赖 HashMap。来看类定义和关键字段：

java

```java
public class HashSet<E>
    extends AbstractSet<E>
    implements Set<E>, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = -5024744406713321676L;

    // 底层存储使用 HashMap
    private transient HashMap<E,Object> map;

    // 作为 HashMap 值的占位对象
    private static final Object PRESENT = new Object();
}
```

字段解析：

1. **map**：HashSet 的核心存储结构，是一个 HashMap，其中键是 HashSet 的元素，值是固定对象 PRESENT。
2. **PRESENT**：一个静态常量，用于填充 HashMap 的值，表示键的存在。

------

1.3 构造方法

HashSet 提供了四种构造方法：

1. **无参构造**：创建默认的 HashSet。

   java

   ```java
   public HashSet() {
       map = new HashMap<>();
   }
   ```

- 默认初始容量为 16，加载因子为 0.75。

2. **指定初始容量**：

   java

   ```java
   public HashSet(int initialCapacity) {
       map = new HashMap<>(initialCapacity);
   }
   ```

3. **指定初始容量和加载因子**：

   java

   ```java
   public HashSet(int initialCapacity, float loadFactor) {
       map = new HashMap<>(initialCapacity, loadFactor);
   }
   ```

4. **传入集合**：

   java

   ```java
   public HashSet(Collection<? extends E> c) {
       map = new HashMap<>(Math.max((int) (c.size()/.75f) + 1, 16));
       addAll(c);
   }
   ```

- 根据集合大小估算容量，避免频繁扩容。

------

1.4 核心方法解析

由于 HashSet 基于 HashMap，其方法直接调用 HashMap 的对应方法。

（1）add(E e)：添加元素

java

```java
public boolean add(E e) {
    return map.put(e, PRESENT) == null;
}
```

- **流程**：
    1. 调用 HashMap 的 put 方法，将元素 e 作为键，PRESENT 作为值。
    2. 如果键不存在，插入成功，返回 true；如果键已存在，返回 false（不重复添加）。
- **性能**：平均时间复杂度为 O(1)。

（2）remove(Object o)：删除元素

java

```java
public boolean remove(Object o) {
    return map.remove(o) == PRESENT;
}
```

- **流程**：调用 HashMap 的 remove 方法，删除键 o，返回是否成功。
- **性能**：平均时间复杂度为 O(1)。

（3）contains(Object o)：检查元素是否存在

java

```java
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

- **流程**：调用 HashMap 的 containsKey 方法，检查键是否存在。
- **性能**：平均时间复杂度为 O(1)。

（4）clear()：清空集合

java

```java
public void clear() {
    map.clear();
}
```

- **流程**：调用 HashMap 的 clear 方法，清空所有键值对。
- **性能**：时间复杂度为 O(1)。

（5）iterator()：获取迭代器

java

```java
public Iterator<E> iterator() {
    return map.keySet().iterator();
}
```

- **流程**：返回 HashMap 键集的迭代器。
- **快速失败**：如果在迭代过程中集合被结构性修改（modCount 变化），抛出 ConcurrentModificationException。

------

1.5 性能分析

| 操作                 | 时间复杂度    | 说明                  |
|--------------------|----------|---------------------|
| add(E e)           | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| remove(Object o)   | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| contains(Object o) | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| clear()            | O(1)     | 直接清空哈希表             |

------

1.6 注意事项

1. **线程安全**：
    - HashSet 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 Collections.synchronizedSet(new HashSet<>()) 或 ConcurrentHashMap.newKeySet()。
2. **哈希冲突**：
    - 如果 hashCode 分布不均，可能导致大量冲突，性能退化为 O(n)。
    - 重写 hashCode 和 equals 时要确保一致性。
3. **内存占用**：
    - 每个元素存储在 HashMap 的键中，额外存储 PRESENT，比 ArrayList 占用更多内存。

------

二、HashMap 详解

2.1 什么是 HashMap？

HashMap 是 Java 集合框架中的一种键值对存储结构，基于**哈希表**实现，实现了 Map 接口。它存储键值对，键是唯一的，值可以重复，适合快速查找和键值映射场景。

核心特点：

1. **底层数据结构**：基于数组 + 链表/红黑树（Java 8 优化）。
2. **无序性**：键值对没有特定顺序。
3. **唯一性**：键不允许重复（基于 hashCode 和 equals 判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 ConcurrentHashMap）。
5. **允许 null**：允许一个 null 键和多个 null 值。
6. **快速查找**：键的查找、插入、删除操作平均时间复杂度为 O(1)。

------

2.2 HashMap 的核心源码结构

来看 HashMap 的类定义和关键字段：

java

```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
    // 序列化版本号
    private static final long serialVersionUID = 362498820763181265L;

    // 默认初始容量（2^4）
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // 16

    // 最大容量（2^30）
    static final int MAXIMUM_CAPACITY = 1 << 30;

    // 默认加载因子
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    // 链表转为红黑树的阈值
    static final int TREEIFY_THRESHOLD = 8;

    // 红黑树转为链表的阈值
    static final int UNTREEIFY_THRESHOLD = 6;

    // 转为红黑树时数组的最小容量
    static final int MIN_TREEIFY_CAPACITY = 64;

    // 存储键值对的数组（哈希表）
    transient Node<K,V>[] table;

    // 键值对数量
    transient int size;

    // 结构修改次数（用于快速失败）
    transient int modCount;

    // 扩容阈值（capacity * loadFactor）
    int threshold;

    // 加载因子
    final float loadFactor;

    // 节点类（链表节点）
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;    // 键的哈希值
        final K key;       // 键
        V value;           // 值
        Node<K,V> next;    // 下一个节点

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    // 红黑树节点（继承 Node）
    static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
        TreeNode<K,V> parent;  // 父节点
        TreeNode<K,V> left;    // 左子节点
        TreeNode<K,V> right;   // 右子节点
        TreeNode<K,V> prev;    // 前驱节点（用于 unlink）
        boolean red;           // 红黑树颜色
        // ...
    }
}
```

字段解析：

1. **table**：存储键值对的数组，元素是 Node（链表节点）或 TreeNode（红黑树节点）。
2. **size**：实际存储的键值对数量。
3. **threshold**：扩容阈值，等于 capacity * loadFactor。
4. **loadFactor**：加载因子，控制哈希表密度（默认 0.75）。
5. **Node**：链表节点，包含哈希值、键、值和下一个节点的引用。
6. **TreeNode**：红黑树节点，用于处理哈希冲突严重的链表。

------

2.3 构造方法

HashMap 提供了四种构造方法：

1. **无参构造**：

   java

   ```java
   public HashMap() {
       this.loadFactor = DEFAULT_LOAD_FACTOR; // 0.75
   }
   ```

- 延迟初始化 table，在第一次 put 时分配。

2. **指定初始容量**：

   java

   ```java
   public HashMap(int initialCapacity) {
       this(initialCapacity, DEFAULT_LOAD_FACTOR);
   }
   ```

3. **指定初始容量和加载因子**：

   java

   ```java
   public HashMap(int initialCapacity, float loadFactor) {
       if (initialCapacity < 0)
           throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
       if (initialCapacity > MAXIMUM_CAPACITY)
           initialCapacity = MAXIMUM_CAPACITY;
       if (loadFactor <= 0 || Float.isNaN(loadFactor))
           throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
       this.loadFactor = loadFactor;
       this.threshold = tableSizeFor(initialCapacity);
   }
   ```

4. **传入 Map**：

   java

   ```java
   public HashMap(Map<? extends K, ? extends V> m) {
       this.loadFactor = DEFAULT_LOAD_FACTOR;
       putMapEntries(m, false);
   }
   ```

------

2.4 核心方法解析

（1）put(K key, V value)：添加或更新键值对

java

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length; // 初始化或扩容
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null); // 直接插入
    else {
        Node<K,V> e; K k;
        if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
            e = p; // 键已存在
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value); // 红黑树插入
        else {
            for (int binCount = 0; ; ++binCount) { // 链表插入
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1)
                        treeifyBin(tab, hash); // 转为红黑树
                    break;
                }
                if (e.hash == hash && ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // 键已存在，更新值
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize(); // 扩容
    afterNodeInsertion(evict);
    return null;
}
```

- **流程**：
    1. 计算键的哈希值（hash(key)，处理 null 键和高位混淆）。
    2. 如果 table 未初始化，调用 resize 初始化。
    3. 根据哈希值计算索引（(n-1) & hash），定位数组槽位。
    4. 如果槽位为空，直接插入新节点。
    5. 如果槽位有节点：
        - 如果键已存在，更新值。
        - 如果是红黑树，调用红黑树插入。
        - 如果是链表，遍历链表插入，链表过长（≥8）可能转为红黑树。
    6. 更新 size，如果超过 threshold，触发扩容。
- **性能**：平均时间复杂度为 O(1)，冲突严重时可能为 O(log n)（红黑树）。

（2）get(Object key)：获取值

java

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}
final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        if (first.hash == hash && // 检查第一个节点
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        if ((e = first.next) != null) {
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key); // 红黑树查找
            do { // 链表查找
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
                e = e.next;
            } while (e != null);
        }
    }
    return null;
}
```

- **流程**：
    1. 计算哈希值，定位数组槽位。
    2. 检查槽位第一个节点是否匹配。
    3. 如果是红黑树，调用红黑树查找；如果是链表，遍历查找。
- **性能**：平均时间复杂度为 O(1)，红黑树为 O(log n)。

（3）remove(Object key)：删除键值对

java

```java
public V remove(Object key) {
    Node<K,V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null ? null : e.value;
}
```

- **流程**：类似 get，找到节点后从链表或红黑树中移除。
- **性能**：平均时间复杂度为 O(1)。

（4）resize()：扩容

java

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // 容量和阈值翻倍
    }
    // 初始化逻辑
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e; // 直接迁移
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap); // 红黑树迁移
                else { // 链表迁移
                    // 分成高位和低位链表
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    do {
                        // ...
                    } while ((e = e.next) != null);
                }
            }
        }
    }
    return newTab;
}
```

- **流程**：
    1. 新数组容量翻倍（oldCap << 1）。
    2. 迁移旧数组中的节点，链表节点分为高位和低位链表，红黑树可能转为链表。
- **性能**：时间复杂度为 O(n)。

------

2.5 性能分析

| 操作                  | 时间复杂度    | 说明                  |
|---------------------|----------|---------------------|
| put(K key, V value) | O(1)（平均） | 哈希表操作，红黑树为 O(log n) |
| get(Object key)     | O(1)（平均） | 哈希表操作，红黑树为 O(log n) |
| remove(Object key)  | O(1)（平均） | 哈希表操作，红黑树为 O(log n) |
| resize()            | O(n)     | 迁移所有节点              |

------

2.6 注意事项

1. **线程安全**：
    - HashMap 不是线程安全的，多线程操作可能导致死循环或数据丢失。
    - 解决方法：使用 ConcurrentHashMap。
2. **哈希冲突**：
    - 良好的 hashCode 分布减少冲突，Java 8 使用红黑树优化长链表。
    - 重写 hashCode 和 equals 时要一致。
3. **扩容开销**：
    - 扩容需要重新分配数组并迁移节点，建议初始化时指定合理容量。

------

三、HashSet 和 HashMap 的关系与对比

3.1 关系

- **HashSet 基于 HashMap**：
    - HashSet 内部维护一个 HashMap，元素作为键，值固定为 PRESENT。
    - HashSet 的操作（如 add、remove）直接调用 HashMap 的键操作。
- **代码复用**：HashSet 是对 HashMap 的封装，简化了去重集合的实现。

3.2 对比

| 特性      | HashSet             | HashMap             |
|---------|---------------------|---------------------|
| 用途      | 存储不重复的元素            | 存储键值对               |
| 底层实现    | 基于 HashMap（键存储元素）   | 数组 + 链表/红黑树         |
| 数据结构    | 集合（Set）             | 映射（Map）             |
| 允许 null | 一个 null 元素          | 一个 null 键，多个 null 值 |
| 操作      | add、remove、contains | put、get、remove      |
| 性能      | O(1)（平均）            | O(1)（平均）            |
| 线程安全    | 不安全                 | 不安全                 |
| 内存占用    | 较高（额外存储 PRESENT）    | 较高（存储键和值）           |

3.3 使用场景

- **HashSet**：
    - 需要去重（如存储唯一 ID）。
    - 快速检查元素是否存在。
    - 不需要键值对关系。
- **HashMap**：
    - 需要键值映射（如 ID 对应用户信息）。
    - 快速查找值。
    - 需要存储和操作键值对。

------

四、总结

- **HashSet**：
    - 基于 HashMap 实现的去重集合，操作简单，适合快速查找和去重。
    - 优点：查找、添加、删除快（O(1)），实现简洁。
    - 缺点：无序，线程不安全，内存占用稍高。
- **HashMap**：
    - 基于哈希表的键值存储，Java 8 引入红黑树优化冲突。
    - 优点：键值操作高效，灵活性高。
    - 缺点：线程不安全，扩容开销大。

通过源码解析，我们可以看到 HashSet 是 HashMap 的轻量封装，两者共享哈希表的优点（快速查找）和缺点（线程不安全）。希望这篇通俗易懂的分析能帮你更好地理解
HashSet 和 HashMap 的实现原理！如果有具体方法或细节需要进一步讲解，请告诉我！
