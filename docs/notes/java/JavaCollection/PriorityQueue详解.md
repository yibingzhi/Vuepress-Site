---
title: PriorityQueue详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/noptweqf/
---

#### 一、PriorityQueue 是什么？

PriorityQueue 是 Java 集合框架中的一种队列类，基于**最小堆**（Min-Heap）实现，实现了 Queue 接口。它是一个**优先级队列**，元素按照
**自然顺序**（Comparable）或**自定义比较器**（Comparator）排序，每次出队时返回优先级最高的元素（默认是最小元素）。

核心特点：

1. **底层数据结构**：基于**数组**实现的**最小堆**（也可以配置为最大堆）。
2. **优先级排序**：元素按优先级排序（默认最小值优先）。
3. **动态大小**：无需扩容，容量自动调整。
4. **线程不安全**：多线程操作可能导致数据不一致（可用 PriorityBlockingQueue 替代）。
5. **不允许 null**：不能存储 null 元素。
6. **时间复杂度**：
    - 插入（offer）和删除（poll）：O(log n)。
    - 查找（peek）：O(1)。
    - 包含（contains）：O(n)。

------

#### 二、PriorityQueue 的核心源码结构

我们先来看 PriorityQueue 的类定义和关键字段：

java

```java
public class PriorityQueue<E> extends AbstractQueue<E>
    implements java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = -7720805057305804111L;

    // 默认初始容量
    private static final int DEFAULT_INITIAL_CAPACITY = 11;

    // 存储元素的数组（堆）
    transient Object[] queue;

    // 元素数量
    private int size = 0;

    // 比较器（null 表示自然顺序）
    private final Comparator<? super E> comparator;

    // 结构修改次数（用于快速失败）
    private transient int modCount = 0;
}
```

字段解析：

1. **queue**：Object[] 类型的数组，存储堆的元素，维护最小堆性质。
2. **size**：当前队列中的元素个数。
3. **comparator**：用于比较元素的顺序，null 表示使用元素的自然顺序（Comparable）。
4. **modCount**：记录结构修改次数，用于迭代器快速失败。
5. **DEFAULT_INITIAL_CAPACITY**：默认初始容量为 11。

最小堆原理：

- **堆结构**：PriorityQueue 使用完全二叉树（存储在数组中），父节点的值 ≤ 子节点的值（最小堆）。
- **数组索引**：
    - 父节点索引：(i-1)/2。
    - 左子节点索引：2*i + 1。
    - 右子节点索引：2*i + 2。
- **堆性质**：通过上浮（siftUp）和下沉（siftDown）操作维护。

------

#### 三、构造方法

PriorityQueue 提供了多种构造方法，决定了初始容量和排序方式：

1. **无参构造**：

   java

   ```java
   public PriorityQueue() {
       this(DEFAULT_INITIAL_CAPACITY, null);
   }
   ```

- 默认容量 11，使用自然顺序。

2. **指定初始容量**：

   java

   ```java
   public PriorityQueue(int initialCapacity) {
       this(initialCapacity, null);
   }
   ```

3. **指定比较器**：

   java

   ```java
   public PriorityQueue(Comparator<? super E> comparator) {
       this(DEFAULT_INITIAL_CAPACITY, comparator);
   }
   ```

4. **指定容量和比较器**：

   java

   ```java
   public PriorityQueue(int initialCapacity, Comparator<? super E> comparator) {
       if (initialCapacity < 1)
           throw new IllegalArgumentException();
       this.queue = new Object[initialCapacity];
       this.comparator = comparator;
   }
   ```

5. **传入集合**：

   java

   ```java
   public PriorityQueue(Collection<? extends E> c) {
       if (c instanceof SortedSet<?>) {
           SortedSet<? extends E> ss = (SortedSet<? extends E>) c;
           this.comparator = (Comparator<? super E>) ss.comparator();
           initElementsFromCollection(ss);
       } else if (c instanceof PriorityQueue<?>) {
           PriorityQueue<? extends E> pq = (PriorityQueue<? extends E>) c;
           this.comparator = (Comparator<? super E>) pq.comparator();
           initFromPriorityQueue(pq);
       } else {
           this.comparator = null;
           initFromCollection(c);
       }
   }
   ```

------

#### 四、核心方法解析

下面我们逐一解析 PriorityQueue 的核心方法，重点讲解实现原理。

1. **添加元素**

（1）offer(E e)：插入元素

```java
public boolean offer(E e) {
    if (e == null)
        throw new NullPointerException();
    modCount++;
    int i = size;
    if (i >= queue.length)
        grow(i + 1); // 扩容
    size = i + 1;
    if (i == 0)
        queue[0] = e; // 空队列直接插入
    else
        siftUp(i, e); // 上浮调整堆
    return true;
}
```

- **流程**：

    1. 检查 null，抛出异常。
    2. 如果数组满，调用 grow 扩容。
    3. 将新元素放入数组末尾（size 位置）。
    4. 调用 siftUp 上浮，维护最小堆性质。

- **上浮（siftUp）**：

  ```java
  private void siftUp(int k, E x) {
      if (comparator != null)
          siftUpUsingComparator(k, x);
      else
          siftUpComparable(k, x);
  }
  private void siftUpComparable(int k, E x) {
      Comparable<? super E> key = (Comparable<? super E>) x;
      while (k > 0) {
          int parent = (k - 1) >>> 1; // 父节点索引
          Object e = queue[parent];
          if (key.compareTo((E) e) >= 0) // 如果新元素不小于父节点，停止
              break;
          queue[k] = e; // 父节点下移
          k = parent;
      }
      queue[k] = key; // 放入最终位置
  }
  ```

    - 新元素与父节点比较，如果小于父节点，交换位置，直到满足堆性质。

- **性能**：时间复杂度为 O(log n)。

（2）grow(int minCapacity)：扩容

```java
private void grow(int minCapacity) {
    int oldCapacity = queue.length;
    // 如果容量小于 64，翻倍；否则增加 50%
    int newCapacity = oldCapacity + ((oldCapacity < 64) ?
                                    oldCapacity : oldCapacity >> 1);
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    queue = Arrays.copyOf(queue, newCapacity);
}
```

- **流程**：
    1. 小容量时翻倍（2x），大容量时增 50%（1.5x）。
    2. 复制数组到新数组。
- **性能**：时间复杂度为 O(n)。

2. **删除元素**

（1）poll()：移除并返回队首元素

```java
public E poll() {
    if (size == 0)
        return null;
    int s = --size;
    modCount++;
    E result = (E) queue[0]; // 队首元素
    E x = (E) queue[s]; // 最后一个元素
    queue[s] = null; // 清空最后一个位置
    if (s != 0)
        siftDown(0, x); // 下沉调整堆
    return result;
}
```

- **流程**：

    1. 如果队列为空，返回 null。
    2. 保存队首元素（最小值），将最后一个元素移到队首。
    3. 清空最后一个位置，调用 siftDown 下沉，维护堆性质。

- **下沉（siftDown）**：

  ```java
  private void siftDown(int k, E x) {
      if (comparator != null)
          siftDownUsingComparator(k, x);
      else
          siftDownComparable(k, x);
  }
  private void siftDownComparable(int k, E x) {
      Comparable<? super E> key = (Comparable<? super E>)x;
      int half = size >>> 1; // 只需要检查非叶子节点
      while (k < half) {
          int child = (k << 1) + 1; // 左子节点
          Object c = queue[child];
          int right = child + 1;
          if (right < size &&
              ((Comparable<? super E>)c).compareTo((E)queue[right]) > 0)
              c = queue[child = right]; // 选择较小的子节点
          if (key.compareTo((E)c) <= 0) // 如果不大于子节点，停止
              break;
          queue[k] = c; // 子节点上移
          k = child;
      }
      queue[k] = key; // 放入最终位置
  }
  ```

    - 将元素与较小的子节点比较，交换位置，直到满足堆性质。

- **性能**：时间复杂度为 O(log n)。

（2）remove(Object o)：删除指定元素

```java
public boolean remove(Object o) {
    int i = indexOf(o);
    if (i == -1)
        return false;
    removeAt(i);
    return true;
}
private E removeAt(int i) {
    modCount++;
    int s = --size;
    if (s == i)
        queue[i] = null; // 删除最后一个元素
    else {
        E moved = (E) queue[s];
        queue[s] = null;
        siftDown(i, moved); // 下沉调整
        if (queue[i] == moved) {
            siftUp(i, moved); // 如果没移动，可能需要上浮
            if (queue[i] != moved)
                return moved;
        }
    }
    return null;
}
```

- **流程**：
    1. 查找元素索引（indexOf 遍历数组，O(n)）。
    2. 将最后一个元素移到删除位置，调用 siftDown 和 siftUp 调整堆。
- **性能**：时间复杂度为 O(n)（查找）+ O(log n)（调整）。

3. **查看元素**

（1）peek()：查看队首元素

```java
public E peek() {
    return (size == 0) ? null : (E) queue[0];
}
```

- **流程**：返回队首元素（最小值），不移除。
- **性能**：时间复杂度为 O(1)。

（2）contains(Object o)：检查元素是否存在

```java
public boolean contains(Object o) {
    return indexOf(o) != -1;
}
private int indexOf(Object o) {
    if (o != null) {
        for (int i = 0; i < size; i++)
            if (o.equals(queue[i]))
                return i;
    }
    return -1;
}
```

- **流程**：遍历数组查找元素。
- **性能**：时间复杂度为 O(n)。

4. **清空队列**

clear()：清空队列

```java
public void clear() {
    modCount++;
    for (int i = 0; i < size; i++)
        queue[i] = null;
    size = 0;
}
```

- **流程**：清空数组引用，设置 size 为 0。
- **性能**：时间复杂度为 O(n)。

5. **迭代器**

```java
public Iterator<E> iterator() {
    return new Itr();
}
private class Itr implements Iterator<E> {
    private int cursor = 0;
    private int lastRet = -1;
    private int expectedModCount = modCount;

    public boolean hasNext() {
        return cursor < size;
    }

    public E next() {
        checkForComodification();
        if (cursor >= size)
            throw new NoSuchElementException();
        lastRet = cursor;
        return (E) queue[cursor++];
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

- **特点**：
    - 迭代器按数组顺序遍历（不是堆序，顺序无意义）。
    - **快速失败**：如果在迭代过程中队列被结构性修改，抛出 ConcurrentModificationException。

------

#### 五、性能分析

| 操作                 | 时间复杂度    | 说明                    |
|--------------------|----------|-----------------------|
| offer(E e)         | O(log n) | 插入并上浮调整               |
| poll()             | O(log n) | 删除队首并下沉调整             |
| peek()             | O(1)     | 查看队首元素                |
| remove(Object o)   | O(n)     | 查找 O(n) + 调整 O(log n) |
| contains(Object o) | O(n)     | 遍历查找                  |
| clear()            | O(n)     | 清空数组                  |

------

六、常见问题和注意事项

1. **线程安全**：

    - PriorityQueue 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：使用 PriorityBlockingQueue（支持并发）。

2. **比较器要求**：

    - 元素必须实现 Comparable，或提供 Comparator。
    - 比较器必须一致（compareTo 和 equals 结果一致）。

3. **null 元素**：

    - 不允许 null（抛出 NullPointerException）。

4. **最大堆实现**：

    - 默认是**最小堆**，要实现**最大堆**，可以使用逆序比较器：

      java

     ```java
     PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
     ```

5. **迭代器顺序**：

    - 迭代器不保证按优先级顺序遍历（仅按数组顺序）。

6. **性能选择**：

    - 适合需要优先级排序的场景（如任务调度、Dijkstra 算法）。
    - 不适合频繁查找（contains 为 O(n)）或需要随机访问的场景。

------

#### 七、总结

PriorityQueue 是基于最小堆实现的优先级队列，具有以下特点：

- **优点**：插入和删除高效（O(log n)），适合动态优先级管理，自动排序。
- **缺点**：查找慢（O(n)），线程不安全，不支持 null，迭代器无序。
