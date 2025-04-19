---
title: TreeSet&TreeMap详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/1zb6g63c/
---

## 一、TreeSet 详解

#### 1.1 什么是 TreeSet？

TreeSet 是 Java 集合框架中的一种集合类，基于**红黑树**实现，实现了 NavigableSet 接口（继承自 SortedSet）。它存储**有序**且*
*不重复**的元素，适合需要自动排序和去重的场景。

核心特点：

1. **底层数据结构**：基于 TreeMap，元素存储在 TreeMap 的键中，值是固定对象（PRESENT）。
2. **有序性**：元素按**自然顺序**（Comparable）或**自定义比较器**（Comparator）排序。
3. **唯一性**：不允许存储重复元素（基于比较结果判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 Collections.synchronizedSortedSet）。
5. **不允许 null**：默认情况下不允许存储 null 元素（取决于比较器）。
6. **快速查找**：添加、删除、查找操作的时间复杂度为 O(log n)。

------

#### 1.2 TreeSet 的核心源码结构

TreeSet 的实现依赖 TreeMap，非常简洁。来看类定义和关键字段：

```java
public class TreeSet<E> extends AbstractSet<E>
    implements NavigableSet<E>, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = -2479143000061671589L;

    // 底层存储使用 TreeMap
    private transient NavigableMap<E, Object> m;

    // 作为 TreeMap 值的占位对象
    private static final Object PRESENT = new Object();
}
```

字段解析：

1. **m**：TreeSet 的核心存储结构，是一个 NavigableMap（实际为 TreeMap），键是 TreeSet 的元素，值是固定对象 PRESENT。
2. **PRESENT**：一个静态常量，用于填充 TreeMap 的值，表示键的存在。

------

#### 1.3 构造方法

TreeSet 提供了四种构造方法：

1. **无参构造**：

   ```java

public TreeSet() {
m = new TreeMap<>();
}

   ```

- 创建一个使用自然顺序的 TreeMap。

2. **指定比较器**：

   ```java
   public TreeSet(Comparator<? super E> comparator) {
       m = new TreeMap<>(comparator);
   }
   ```

3. **传入集合**：

   ```java
   public TreeSet(Collection<? extends E> c) {
       m = new TreeMap<>();
       addAll(c);
   }
   ```

4. **传入 SortedSet**：

   ```java
   public TreeSet(SortedSet<E> s) {
       m = new TreeMap<>(s.comparator());
       addAll(s);
   }
   ```

------

#### 1.4 核心方法解析

TreeSet 的方法直接调用 TreeMap 的键操作，逻辑简单。

（1）add(E e)：添加元素

```java
public boolean add(E e) {
    return m.put(e, PRESENT) == null;
}
```

- **流程**：
    1. 调用 TreeMap 的 put 方法，将元素 e 作为键，PRESENT 作为值。
    2. 如果键不存在，插入成功，返回 true；如果键已存在，返回 false。
- **性能**：时间复杂度为 O(log n)，红黑树插入操作。

（2）remove(Object o)：删除元素

```java
public boolean remove(Object o) {
    return m.remove(o) == PRESENT;
}
```

- **流程**：调用 TreeMap 的 remove 方法，删除键 o，返回是否成功。
- **性能**：时间复杂度为 O(log n)。

（3）contains(Object o)：检查元素是否存在

```java
public boolean contains(Object o) {
    return m.containsKey(o);
}
```

- **流程**：调用 TreeMap 的 containsKey 方法，检查键是否存在。
- **性能**：时间复杂度为 O(log n)。

（4）clear()：清空集合

```java
public void clear() {
    m.clear();
}
```

- **流程**：调用 TreeMap 的 clear 方法，清空所有键值对。
- **性能**：时间复杂度为 O(1)。

（5）first() 和 last()：获取最小/最大元素

```java
public E first() {
    return m.firstKey();
}
public E last() {
    return m.lastKey();
}
```

- **流程**：调用 TreeMap 的 firstKey 或 lastKey，返回红黑树的最小或最大键。
- **性能**：时间复杂度为 O(log n)。

（6）subSet、headSet、tailSet：获取子集

```java
public NavigableSet<E> subSet(E fromElement, boolean fromInclusive,
                              E toElement, boolean toInclusive) {
    return new TreeSet<>(m.subMap(fromElement, fromInclusive, toElement, toInclusive));
}
```

- **流程**：调用 TreeMap 的 subMap 获取子映射，包装为 TreeSet。
- **性能**：时间复杂度为 O(log n)。

（7）iterator()：获取迭代器

```java
public Iterator<E> iterator() {
    return m.keySet().iterator();
}
```

- **特点**：返回 TreeMap 键集的迭代器，按升序遍历。
- **快速失败**：如果在迭代过程中集合被结构性修改，抛出 ConcurrentModificationException。

------

#### 1.5 性能分析

| 操作                 | 时间复杂度    | 说明           |
|--------------------|----------|--------------|
| add(E e)           | O(log n) | 红黑树插入        |
| remove(Object o)   | O(log n) | 红黑树删除        |
| contains(Object o) | O(log n) | 红黑树查找        |
| first() / last()   | O(log n) | 访问红黑树最小/最大节点 |
| clear()            | O(1)     | 清空红黑树        |
| 遍历                 | O(n)     | 按序遍历所有元素     |

------

#### 1.6 注意事项

1. **线程安全**：
    - TreeSet 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 Collections.synchronizedSortedSet(new TreeSet<>())。
2. **比较器要求**：
    - 元素必须实现 Comparable，或提供 Comparator。
    - 比较器必须一致（compareTo 和 equals 结果一致）。
3. **null 元素**：
    - 默认不允许 null（Comparable 抛出 NullPointerException）。
    - 自定义比较器可能支持 null。
4. **性能**：
    - 适合需要排序的场景，但比 HashSet 慢（O(log n) vs O(1)）。

------

## 二、TreeMap 详解

#### 2.1 什么是 TreeMap？

TreeMap 是 Java 集合框架中的一种键值对存储结构，基于**红黑树**实现，实现了 NavigableMap 接口（继承自 SortedMap）。它存储键值对，键按
**自然顺序**或**自定义比较器**排序，适合需要有序键值映射的场景。

核心特点：

1. **底层数据结构**：红黑树（平衡二叉搜索树）。
2. **有序性**：键按升序或自定义顺序排列。
3. **唯一性**：键不允许重复（基于比较结果判断）。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 ConcurrentSkipListMap）。
5. **允许 null 值**：允许 null 值，但键是否允许 null 取决于比较器。
6. **快速查找**：键的查找、插入、删除操作时间复杂度为 O(log n)。

------

#### 2.2 TreeMap 的核心源码结构

来看 TreeMap 的类定义和关键字段：

```java
public class TreeMap<K,V>
    extends AbstractMap<K,V>
    implements NavigableMap<K,V>, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = 919286545866124006L;

    // 比较器（null 表示自然顺序）
    private final Comparator<? super K> comparator;

    // 红黑树的根节点
    private transient Entry<K,V> root;

    // 键值对数量
    private transient int size = 0;

    // 结构修改次数
    private transient int modCount = 0;

    // 红黑树节点类
    static final class Entry<K,V> implements Map.Entry<K,V> {
        K key;               // 键
        V value;             // 值
        Entry<K,V> left;     // 左子节点
        Entry<K,V> right;    // 右子节点
        Entry<K,V> parent;   // 父节点
        boolean color;       // 红黑树颜色（true 为红，false 为黑）

        Entry(K key, V value, Entry<K,V> parent) {
            this.key = key;
            this.value = value;
            this.parent = parent;
        }
    }
}
```

字段解析：

1. **comparator**：用于比较键的顺序，null 表示使用键的自然顺序（Comparable）。
2. **root**：红黑树的根节点，空树时为 null。
3. **size**：键值对数量。
4. **modCount**：结构修改次数，用于快速失败。
5. **Entry**：红黑树节点，包含键、值、左右子节点、父节点和颜色。

------

#### 2.3 构造方法

TreeMap 提供了四种构造方法：

1. **无参构造**：

   ```java

public TreeMap() {
comparator = null;
}

   ```

- 使用自然顺序。

2. **指定比较器**：

   ```java
   public TreeMap(Comparator<? super K> comparator) {
       this.comparator = comparator;
   }
   ```

3. **传入 Map**：

   ```java
   public TreeMap(Map<? extends K, ? extends V> m) {
       comparator = null;
       putAll(m);
   }
   ```

4. **传入 SortedMap**：

   ```java
   public TreeMap(SortedMap<K, ? extends V> m) {
       comparator = m.comparator();
       try {
           buildFromSorted(m.size(), m.entrySet().iterator(), null, null);
       } catch (java.io.IOException | ClassNotFoundException cannotHappen) {
       }
   }
   ```

------

#### 2.4 核心方法解析

（1）put(K key, V value)：添加或更新键值对

```java
public V put(K key, V value) {
    Entry<K,V> t = root;
    if (t == null) {
        compare(key, key); // 检查 key 是否合法
        root = new Entry<>(key, value, null);
        size = 1;
        modCount++;
        return null;
    }
    int cmp;
    Entry<K,V> parent;
    Comparator<? super K> cpr = comparator;
    // 查找插入位置
    do {
        parent = t;
        cmp = cpr != null ? cpr.compare(key, t.key) : ((Comparable<? super K>)key).compareTo(t.key);
        if (cmp < 0)
            t = t.left;
        else if (cmp > 0)
            t = t.right;
        else {
            V oldValue = t.value;
            t.value = value; // 键存在，更新值
            return oldValue;
        }
    } while (t != null);
    // 插入新节点
    Entry<K,V> e = new Entry<>(key, value, parent);
    if (cmp < 0)
        parent.left = e;
    else
        parent.right = e;
    fixAfterInsertion(e); // 红黑树平衡
    size++;
    modCount++;
    return null;
}
```

- **流程**：
    1. 如果树为空，创建根节点。
    2. 使用比较器或自然顺序查找插入位置。
    3. 如果键存在，更新值并返回旧值。
    4. 否则插入新节点，调用 fixAfterInsertion 平衡红黑树。
- **性能**：时间复杂度为 O(log n)。

（2）get(Object key)：获取值

```java
public V get(Object key) {
    Entry<K,V> p = getEntry(key);
    return (p == null ? null : p.value);
}
final Entry<K,V> getEntry(Object key) {
    if (comparator != null)
        return getEntryUsingComparator(key);
    if (key == null)
        throw new NullPointerException();
    Comparable<? super K> k = (Comparable<? super K>)key;
    Entry<K,V> p = root;
    while (p != null) {
        int cmp = k.compareTo(p.key);
        if (cmp < 0)
            p = p.left;
        else if (cmp > 0)
            p = p.right;
        else
            return p;
    }
    return null;
}
```

- **流程**：
    1. 使用比较器或自然顺序在红黑树中查找键。
    2. 返回对应节点的值，或 null。
- **性能**：时间复杂度为 O(log n)。

（3）remove(Object key)：删除键值对

```java
public V remove(Object key) {
    Entry<K,V> p = getEntry(key);
    if (p == null)
        return null;
    V oldValue = p.value;
    deleteEntry(p); // 删除节点并平衡
    return oldValue;
}
private void deleteEntry(Entry<K,V> p) {
    modCount++;
    size--;
    // 红黑树删除逻辑（包括替换和平衡）
    // ...
    fixAfterDeletion(p);
}
```

- **流程**：
    1. 查找目标节点。
    2. 删除节点，调用 fixAfterDeletion 平衡红黑树。
- **性能**：时间复杂度为 O(log n)。

（4）firstKey() 和 lastKey()：获取最小/最大键

```java
public K firstKey() {
    return key(getFirstEntry());
}
public K lastKey() {
    return key(getLastEntry());
}
final Entry<K,V> getFirstEntry() {
    Entry<K,V> p = root;
    if (p != null)
        while (p.left != null)
            p = p.left;
    return p;
}
```

- **流程**：查找红黑树的最左（最小）或最右（最大）节点。
- **性能**：时间复杂度为 O(log n)。

（5）subMap、headMap、tailMap：获取子映射

```java
public NavigableMap<K,V> subMap(K fromKey, boolean fromInclusive,
                                K toKey, boolean toInclusive) {
    return new AscendingSubMap<>(this, false, fromKey, fromInclusive,
                                 false, toKey, toInclusive);
}
```

- **流程**：返回子映射视图，支持范围查询。
- **性能**：时间复杂度为 O(log n)。

（6）entrySet().iterator()：按序遍历

```java
public Set<Map.Entry<K,V>> entrySet() {
    return new EntrySet();
}
```

- **特点**：返回的迭代器按键的升序遍历。
- **性能**：遍历时间复杂度为 O(n)。

------

#### 2.5 性能分析

| 操作                     | 时间复杂度    | 说明        |
|------------------------|----------|-----------|
| put(K key, V value)    | O(log n) | 红黑树插入     |
| get(Object key)        | O(log n) | 红黑树查找     |
| remove(Object key)     | O(log n) | 红黑树删除     |
| firstKey() / lastKey() | O(log n) | 访问最小/最大节点 |
| clear()                | O(1)     | 清空红黑树     |
| 遍历                     | O(n)     | 按序遍历所有元素  |

------

#### 2.6 注意事项

1. **线程安全**：
    - TreeMap 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 ConcurrentSkipListMap。
2. **比较器要求**：
    - 键必须实现 Comparable，或提供 Comparator。
    - 比较器必须一致。
3. **null 键**：
    - 默认不允许 null 键（Comparable 抛出 NullPointerException）。
    - 自定义比较器可能支持 null。
4. **性能**：
    - 适合需要排序的场景，但比 HashMap 慢（O(log n) vs O(1)）。

------

## 三、TreeSet 和 TreeMap 的关系与对比

#### 3.1 关系

- **TreeSet 基于 TreeMap**：
    - TreeSet 内部维护一个 TreeMap，元素作为键，值固定为 PRESENT。
    - TreeSet 的操作（如 add、remove）直接调用 TreeMap 的键操作。
- **代码复用**：TreeSet 是对 TreeMap 的封装，简化了有序去重集合的实现。

#### 3.2 对比

| 特性      | TreeSet             | TreeMap        |
|---------|---------------------|----------------|
| 用途      | 存储不重复的元素，按序排列       | 存储键值对，键按序排列    |
| 底层实现    | 基于 TreeMap（键存储元素）   | 红黑树            |
| 数据结构    | 集合（Set）             | 映射（Map）        |
| 允许 null | 不允许（取决于比较器）         | 值允许，键取决于比较器    |
| 顺序      | 自然顺序或比较器            | 自然顺序或比较器       |
| 操作      | add、remove、contains | put、get、remove |
| 性能      | O(log n)            | O(log n)       |
| 线程安全    | 不安全                 | 不安全            |
| 内存占用    | 较高（额外存储 PRESENT）    | 较高（存储键和值）      |

3.3 使用场景

- **TreeSet**：
    - 需要去重且自动排序（如按字母序存储单词）。
    - 范围查询（如获取某个范围的元素）。
- **TreeMap**：
    - 需要有序键值映射（如按时间戳存储日志）。
    - 范围查询（如获取某个时间段的数据）。

------

四、总结

- **TreeSet**：
    - 基于 TreeMap 实现的有序去重集合，适合需要排序的场景。
    - 优点：自动排序，范围查询方便，操作稳定（O(log n)）。
    - 缺点：性能低于 HashSet，线程不安全，不支持 null。
- **TreeMap**：
    - 基于红黑树的有序键值映射，适合需要键排序的场景。
    - 优点：键有序，范围查询高效。
    - 缺点：性能低于 HashMap，线程不安全。

通过源码解析，我们可以看到 TreeSet 是 TreeMap 的轻量封装，两者共享红黑树的优点（有序性和 O(log n) 操作）。希望这篇通俗易懂的分析能帮你更好地理解
TreeSet 和 TreeMap 的实现原理！如果有具体方法或细节需要进一步讲解，请告诉我！
