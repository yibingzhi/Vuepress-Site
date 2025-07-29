---
title: LinkedHahSet&LinkedMap详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/g2kb4vlr/
---

# 一、LinkedHashSet 详解

#### 1.1 什么是 LinkedHashSet？

LinkedHashSet 是 Java 集合框架中的一种集合类，继承自 HashSet，基于**哈希表 + 双向链表**实现，实现了 Set 接口。它存储*
*无序但保持插入顺序**且**不重复**的元素，适合需要去重并保留插入顺序的场景。

核心特点：

1. **底层数据结构**：基于 LinkedHashMap，元素存储在 LinkedHashMap 的键中，值是固定对象（PRESENT）。
2. **保持插入顺序**：通过双向链表维护元素的插入顺序（与 HashSet 的无序性不同）。
3. **唯一性**：不允许存储重复元素（基于 hashCode 和 equals 判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 Collections.synchronizedSet）。
5. **允许 null**：可以存储一个 null 元素。
6. **快速查找**：添加、删除、查找操作的平均时间复杂度为 O(1)。

------

#### 1.2 LinkedHashSet 的核心源码结构

LinkedHashSet 的实现非常简单，底层完全依赖 LinkedHashMap。来看类定义：

```java
public class LinkedHashSet<E>
    extends HashSet<E>
    implements Set<E>, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = -2851667679971038690L;

    // 无参构造
    public LinkedHashSet() {
        super(16, .75f, true); // 调用 HashSet 的构造，指定使用 LinkedHashMap
    }

    // 其他构造方法略
}
```

关键点：

1. **LinkedHashSet 继承 HashSet**：它通过调用 HashSet 的特殊构造方法，初始化一个 LinkedHashMap 作为底层存储。
2. **无额外字段**：LinkedHashSet 没有定义新的字段，复用了 HashSet 的 map 字段（类型为 LinkedHashMap）。
3. **PRESENT**：沿用 HashSet 的 PRESENT 常量，作为 LinkedHashMap 的值。

底层依赖：

LinkedHashSet 的核心逻辑在 HashSet 的以下构造方法中：

```java
// HashSet 的构造方法
HashSet(int initialCapacity, float loadFactor, boolean dummy) {
    map = new LinkedHashMap<>(initialCapacity, loadFactor);
}
```

------

#### 1.3 构造方法

LinkedHashSet 提供了五种构造方法：

1. **无参构造**：

   java

   ```java
   public LinkedHashSet() {
       super(16, .75f, true);
   }
   ```

- 初始化一个 LinkedHashMap，默认容量 16，加载因子 0.75。

2. **指定初始容量**：

   ```java
   public LinkedHashSet(int initialCapacity) {
       super(initialCapacity, .75f, true);
   }
   ```

3. **指定初始容量和加载因子**：

   ```java
   public LinkedHashSet(int initialCapacity, float loadFactor) {
       super(initialCapacity, loadFactor, true);
   }
   ```

4. **传入集合**：

   ```java
   public LinkedHashSet(Collection<? extends E> c) {
       super(Math.max(2*c.size(), 11), .75f, true);
       addAll(c);
   }
   ```

5. **Spliterator 构造**（Java 17 新增，内部使用）：

    - 用于支持 Spliterator 的初始化，较少直接使用。

------

#### 1.4 核心方法解析

LinkedHashSet 没有重写 HashSet 的核心方法（如 add、remove、contains），直接复用 HashSet 的实现，唯一区别是底层使用
LinkedHashMap，因此保持了插入顺序。

（1）add(E e)：添加元素

```java
// 继承自 HashSet
public boolean add(E e) {
    return map.put(e, PRESENT) == null;
}
```

- **流程**：调用 LinkedHashMap 的 put 方法，将元素 e 作为键，PRESENT 作为值，保持插入顺序。
- **性能**：平均时间复杂度为 O(1)。

（2）remove(Object o)：删除元素

```java
// 继承自 HashSet
public boolean remove(Object o) {
    return map.remove(o) == PRESENT;
}
```

- **流程**：调用 LinkedHashMap 的 remove 方法，删除键 o。
- **性能**：平均时间复杂度为 O(1)。

（3）contains(Object o)：检查元素是否存在

```java
// 继承自 HashSet
public boolean contains(Object o) {
    return map.containsKey(o);
}
```

- **流程**：调用 LinkedHashMap 的 containsKey 方法。
- **性能**：平均时间复杂度为 O(1)。

（4）iterator()：获取迭代器

```java
// 继承自 HashSet
public Iterator<E> iterator() {
    return map.keySet().iterator();
}
```

- **特点**：返回 LinkedHashMap 键集的迭代器，按插入顺序遍历。
- **快速失败**：如果在迭代过程中集合被结构性修改（modCount 变化），抛出 ConcurrentModificationException。

------

#### 1.5 性能分析

| 操作                 | 时间复杂度    | 说明                  |
|--------------------|----------|---------------------|
| add(E e)           | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| remove(Object o)   | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| contains(Object o) | O(1)（平均） | 哈希表操作，冲突时可能退化为 O(n) |
| iterator()         | O(n)     | 按插入顺序遍历所有元素         |

------

#### 1.6 注意事项

1. **线程安全**：
    - LinkedHashSet 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 Collections.synchronizedSet(new LinkedHashSet<>())。
2. **哈希冲突**：
    - 如果 hashCode 分布不均，可能导致性能下降。
    - 重写 hashCode 和 equals 时要确保一致性。
3. **内存占用**：
    - 相比 HashSet，LinkedHashSet 额外维护双向链表，内存占用更高。
4. **与 HashSet 的对比**：
    - HashSet：无序，内存占用较低。
    - LinkedHashSet：保持插入顺序，适合需要顺序的场景。

------

# 二、LinkedHashMap 详解

#### 2.1 什么是 LinkedHashMap？

LinkedHashMap 是 Java 集合框架中的一种键值对存储结构，继承自 HashMap，基于**哈希表 + 双向链表**实现，实现了 Map
接口。它存储键值对，键是唯一的，值可以重复，支持按**插入顺序**或**访问顺序**遍历。

核心特点：

1. **底层数据结构**：基于 HashMap，额外维护一个双向链表记录键值对的顺序。
2. **保持顺序**：
    - 默认按**插入顺序**（insertion-order）。
    - 可配置为**访问顺序**（access-order，最近访问的元素移到链表末尾）。
3. **唯一性**：键不允许重复（基于 hashCode 和 equals 判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 ConcurrentHashMap）。
5. **允许 null**：允许一个 null 键和多个 null 值。
6. **快速查找**：键的查找、插入、删除操作平均时间复杂度为 O(1)。

------

#### 2.2 LinkedHashMap 的核心源码结构

来看 LinkedHashMap 的类定义和关键字段：

```java
public class LinkedHashMap<K,V>
    extends HashMap<K,V>
    implements Map<K,V> {
    // 序列化版本号
    private static final long serialVersionUID = 3801124242820219131L;

    // 双向链表的头节点
    transient LinkedHashMap.Entry<K,V> head;

    // 双向链表的尾节点
    transient LinkedHashMap.Entry<K,V> tail;

    // 是否按访问顺序排序（true 为访问顺序，false 为插入顺序）
    final boolean accessOrder;

    // 内部类：扩展 HashMap 的 Node，增加链表指针
    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after; // 前驱和后继节点
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
            // before 和 after 在插入时设置
        }
    }
}
```

字段解析：

1. **head**：双向链表的头节点，指向最早插入（或最近未访问）的键值对。
2. **tail**：双向链表的尾节点，指向最新插入（或最近访问）的键值对。
3. **accessOrder**：控制链表的顺序：
    - false：按插入顺序（默认）。
    - true：按访问顺序（get 或 put 会更新顺序）。
4. **Entry**：继承 HashMap.Node，增加了 before 和 after 指针，用于维护双向链表。

与 HashMap 的关系：

- LinkedHashMap 复用了 HashMap 的哈希表结构（table、size 等）。
- 额外增加了双向链表，维护键值对的顺序。

------

#### 2.3 构造方法

LinkedHashMap 提供了五种构造方法：

1. **无参构造**：

   ```java
   public LinkedHashMap() {
       super();
       accessOrder = false; // 默认插入顺序
   }
   ```

    - 默认容量 16，加载因子 0.75。

2. **指定初始容量**：

   java

   ```java
   public LinkedHashMap(int initialCapacity) {
       super(initialCapacity);
       accessOrder = false;
   }
   ```

3. **指定初始容量和加载因子**：

   java

   ```java
   public LinkedHashMap(int initialCapacity, float loadFactor) {
       super(initialCapacity, loadFactor);
       accessOrder = false;
   }
   ```

4. **指定初始容量、加载因子和顺序**：

   java

   ```java
   public LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder) {
       super(initialCapacity, loadFactor);
       this.accessOrder = accessOrder;
   }
   ```

5. **传入 Map**：

   java

   ```java
   public LinkedHashMap(Map<? extends K, ? extends V> m) {
       super();
       accessOrder = false;
       putMapEntries(m, false);
   }
   ```

------

#### 2.4 核心方法解析

LinkedHashMap 复用了 HashMap 的大部分逻辑，但重写了部分方法以维护双向链表。

（1）put(K key, V value)：添加或更新键值对

```java
// 继承自 HashMap 的 put
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

- **关键重写方法**： LinkedHashMap 重写了 HashMap 的以下方法来维护链表：

  java

  ```java
  // 创建新节点
  Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
      LinkedHashMap.Entry<K,V> p =
          new LinkedHashMap.Entry<K,V>(hash, key, value, e);
      linkNodeLast(p); // 将新节点添加到链表末尾
      return p;
  }
  
  // 将节点添加到链表末尾
  private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
      LinkedHashMap.Entry<K,V> last = tail;
      tail = p;
      if (last == null)
          head = p;
      else {
          p.before = last;
          last.after = p;
      }
  }
  
  // 访问后更新顺序（访问顺序模式）
  void afterNodeAccess(Node<K,V> e) {
      LinkedHashMap.Entry<K,V> last;
      if (accessOrder && (last = tail) != e) {
          LinkedHashMap.Entry<K,V> p = (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
          p.after = null;
          if (b == null)
              head = a;
          else
              b.after = a;
          if (a != null)
              a.before = b;
          else
              last = b;
          if (last == null)
              head = p;
          else {
              p.before = last;
              last.after = p;
          }
          tail = p;
          ++modCount;
      }
  }
  ```

- **流程**：

    1. 调用 HashMap 的 putVal，插入键值对到哈希表。
    2. 使用 newNode 创建 LinkedHashMap.Entry 节点，并通过 linkNodeLast 添加到链表末尾。
    3. 如果是访问顺序模式（accessOrder = true），put 或 get 会调用 afterNodeAccess，将访问的节点移到链表末尾。

- **性能**：平均时间复杂度为 O(1)，维护链表增加少量开销。

（2）get(Object key)：获取值

```java
public V get(Object key) {
    Node<K,V> e;
    if ((e = getNode(hash(key), key)) == null)
        return null;
    if (accessOrder)
        afterNodeAccess(e); // 访问顺序模式下移动节点
    return e.value;
}
```

- **流程**：
    1. 调用 HashMap 的 getNode 查找节点。
    2. 如果是访问顺序模式，调用 afterNodeAccess 将节点移到链表末尾。
- **性能**：平均时间复杂度为 O(1)。

（3）remove(Object key)：删除键值对

```java
// 继承自 HashMap，但重写了 afterNodeRemoval
void afterNodeRemoval(Node<K,V> e) {
    LinkedHashMap.Entry<K,V> p = (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
    p.before = p.after = null;
    if (b == null)
        head = a;
    else
        b.after = a;
    if (a == null)
        tail = b;
    else
        a.before = b;
}
```

- **流程**：
    1. 调用 HashMap 的 removeNode 删除哈希表中的节点。
    2. 调用 afterNodeRemoval 更新双向链表，断开删除节点的 before 和 after 指针。
- **性能**：平均时间复杂度为 O(1)。

（4）resize()：扩容

- **流程**：复用 HashMap 的 resize，但节点迁移时保持链表顺序（LinkedHashMap.Entry 的 before 和 after 指针不变）。
- **性能**：时间复杂度为 O(n)。

（5）entrySet().iterator()：按顺序遍历

```java
public Set<Map.Entry<K,V>> entrySet() {
    return new LinkedEntrySet();
}
```

- **特点**：返回的迭代器按插入顺序或访问顺序遍历键值对。
- **性能**：遍历时间复杂度为 O(n)。

------

#### 2.5 性能分析

| 操作                  | 时间复杂度    | 说明                          |
|---------------------|----------|-----------------------------|
| put(K key, V value) | O(1)（平均） | 哈希表操作 + 链表维护，冲突时 O(log n)   |
| get(Object key)     | O(1)（平均） | 哈希表操作 + 访问顺序维护，冲突时 O(log n) |
| remove(Object key)  | O(1)（平均） | 哈希表操作 + 链表维护，冲突时 O(log n)   |
| resize()            | O(n)     | 迁移所有节点                      |
| 遍历                  | O(n)     | 按链表顺序遍历                     |

------

#### 2.6 注意事项

1. **线程安全**：

    - LinkedHashMap 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 ConcurrentHashMap 或同步包装。

2. **哈希冲突**：

    - 良好的 hashCode 分布减少冲突，Java 8 使用红黑树优化长链表。
    - 重写 hashCode 和 equals 时要一致。

3. **访问顺序模式**：

    - 设置 accessOrder = true 可实现 LRU（最近最少使用）缓存。

    - 示例：

      java

     ```java
     LinkedHashMap<Integer, String> lru = new LinkedHashMap<>(16, 0.75f, true) {
         protected boolean removeEldestEntry(Map.Entry<Integer, String> eldest) {
             return size() > 3; // 限制缓存大小为 3
         }
     };
     ```

4. **内存占用**：

    - 相比 HashMap，LinkedHashMap 额外维护双向链表，内存占用更高。

------

## 三、LinkedHashSet 和 LinkedHashMap 的关系与对比

3.1 关系

- **LinkedHashSet 基于 LinkedHashMap**：
    - LinkedHashSet 内部维护一个 LinkedHashMap，元素作为键，值固定为 PRESENT。
    - LinkedHashSet 的操作直接调用 LinkedHashMap 的键操作。
- **代码复用**：LinkedHashSet 是对 LinkedHashMap 的封装，简化了去重集合的实现。

#### 3.2 对比

| 特性      | LinkedHashSet           | LinkedHashMap       |
|---------|-------------------------|---------------------|
| 用途      | 存储不重复的元素，保持插入顺序         | 存储键值对，保持插入或访问顺序     |
| 底层实现    | 基于 LinkedHashMap（键存储元素） | 哈希表 + 双向链表          |
| 数据结构    | 集合（Set）                 | 映射（Map）             |
| 允许 null | 一个 null 元素              | 一个 null 键，多个 null 值 |
| 顺序      | 插入顺序                    | 插入顺序或访问顺序           |
| 操作      | add、remove、contains     | put、get、remove      |
| 性能      | O(1)（平均）                | O(1)（平均）            |
| 线程安全    | 不安全                     | 不安全                 |
| 内存占用    | 较高（额外存储链表和 PRESENT）     | 较高（存储键、值和链表）        |

#### 3.3 使用场景

- **LinkedHashSet**：
    - 需要去重且保持插入顺序（如记录用户操作历史）。
    - 快速检查元素是否存在。
- **LinkedHashMap**：
    - 需要键值映射且保持顺序（如按插入顺序存储配置）。
    - 实现 LRU 缓存（访问顺序模式）。

------

#### 四、总结

- **LinkedHashSet**：
    - 基于 LinkedHashMap 实现的去重集合，保持插入顺序。
    - 优点：查找、添加、删除快（O(1)），支持有序遍历。
    - 缺点：无序，线程不安全，内存占用较高。
- **LinkedHashMap**：
    - 基于 HashMap 扩展，增加双向链表支持插入或访问顺序。
    - 优点：键值操作高效，支持 LRU 缓存。
    - 缺点：线程不安全，内存占用较高。
