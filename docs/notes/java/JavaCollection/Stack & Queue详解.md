---
title: Stack & Queue详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/ove4j1a6/
---

## 一、Stack 详解

#### 1.1 什么是 Stack？

Stack 是 Java 集合框架中的一种类，继承自 Vector，实现**后进先出**（LIFO,
Last-In-First-Out）的栈数据结构。它提供了标准的栈操作，如压栈（push）、弹栈（pop）和查看栈顶（peek）。

核心特点：

1. **底层数据结构**：基于 Vector（动态数组）。
2. **线程安全**：继承了 Vector 的同步方法，线程安全，但性能较低。
3. **允许重复和 null**：可以存储重复元素和 null。
4. **不推荐使用**：Java 官方推荐使用 Deque 接口的实现（如 ArrayDeque）替代 Stack，因为 Stack 是遗留类，性能和设计不佳。
5. **时间复杂度**：压栈、弹栈、查看栈顶为 O(1)，查找为 O(n)。

------

#### 1.2 Stack 的核心源码结构

来看 Stack 的类定义和关键字段：

```java
public class Stack<E> extends Vector<E> {
    // 序列化版本号
    private static final long serialVersionUID = 1224463164541339155L;

    // 无额外字段，继承 Vector 的 elementData（数组）和 elementCount（大小）
}
```

字段解析：

- **Stack 继承 Vector**：
    - Vector 使用 Object[] elementData 存储元素，int elementCount 表示元素数量。
    - Stack 没有定义新字段，完全依赖 Vector 的动态数组。
- **同步性**：Vector 的方法（如 add、remove）是 synchronized，保证线程安全。

------

#### 1.3 构造方法

Stack 只有一个无参构造方法：

```java
public Stack() {
}
```

- **流程**：调用 Vector 的无参构造，初始化容量为 10（Vector 默认）。

------

#### 1.4 核心方法解析

Stack 的核心方法围绕栈操作，依赖 Vector 的数组操作。

（1）push(E item)：压栈

```java
public E push(E item) {
    addElement(item);
    return item;
}
public synchronized void addElement(E obj) { // Vector 的方法
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = obj;
}
```

- **流程**：
    1. 调用 Vector 的 addElement，将元素添加到数组末尾。
    2. 如果数组满，触发扩容（默认翻倍）。
    3. 返回插入的元素。
- **性能**：时间复杂度为 O(1)（均摊，扩容时为 O(n)）。

（2）pop()：弹栈

```java
public synchronized E pop() {
    E obj;
    int len = size();
    obj = peek();
    removeElementAt(len - 1);
    return obj;
}
public synchronized void removeElementAt(int index) { // Vector 的方法
    modCount++;
    if (index >= elementCount) {
        throw new ArrayIndexOutOfBoundsException(index + " >= " + elementCount);
    } else if (index < 0) {
        throw new ArrayIndexOutOfBoundsException(index);
    }
    int j = elementCount - index - 1;
    if (j > 0) {
        System.arraycopy(elementData, index + 1, elementData, index, j);
    }
    elementCount--;
    elementData[elementCount] = null; // 清空引用
}
```

- **流程**：
    1. 调用 peek 获取栈顶元素。
    2. 调用 Vector 的 removeElementAt，移除数组末尾元素。
    3. 返回移除的元素。
- **性能**：时间复杂度为 O(1)。

（3）peek()：查看栈顶

```java
public synchronized E peek() {
    int len = size();
    if (len == 0)
        throw new EmptyStackException();
    return elementAt(len - 1);
}
public synchronized E elementAt(int index) { // Vector 的方法
    if (index >= elementCount) {
        throw new ArrayIndexOutOfBoundsException(index + " >= " + elementCount);
    }
    return (E) elementData[index];
}
```

- **流程**：返回数组末尾元素（栈顶），不移除。
- **性能**：时间复杂度为 O(1)。

（4）empty()：检查是否为空

```java
public boolean empty() {
    return size() == 0;
}
```

- **流程**：检查 elementCount 是否为 0。
- **性能**：时间复杂度为 O(1)。

（5）search(Object o)：查找元素

```java
public synchronized int search(Object o) {
    int i = lastIndexOf(o);
    if (i >= 0) {
        return size() - i;
    }
    return -1;
}
public synchronized int lastIndexOf(Object o) { // Vector 的方法
    for (int i = elementCount - 1; i >= 0; i--)
        if (o == null ? elementData[i] == null : o.equals(elementData[i]))
            return i;
    return -1;
}
```

- **流程**：
    1. 从栈顶开始查找元素，返回从栈顶到该元素的距离（1-based）。
    2. 如果不存在，返回 -1。
- **性能**：时间复杂度为 O(n)。

------

#### 1.5 性能分析

| 操作               | 时间复杂度    | 说明            |
|------------------|----------|---------------|
| push(E item)     | O(1)（均摊） | 末尾添加，扩容时 O(n) |
| pop()            | O(1)     | 移除末尾元素        |
| peek()           | O(1)     | 查看末尾元素        |
| search(Object o) | O(n)     | 遍历查找          |
| empty()          | O(1)     | 检查大小          |

------

#### 1.6 注意事项

1. **不推荐使用**：

    - Stack 是遗留类，性能较低（因 Vector 的同步开销）。

    - 推荐使用 Deque 接口的实现，如 ArrayDeque：

      java

     ```java
     Deque<Integer> stack = new ArrayDeque<>();
     stack.push(1); // 压栈
     stack.pop();  // 弹栈
     stack.peek(); // 查看栈顶
     ```

2. **线程安全**：

    - Stack 是线程安全的，但同步开销大。
    - 如果需要线程安全的栈，使用 Collections.synchronizedDeque(new ArrayDeque<>())。

3. **内存管理**：

    - 删除元素时清空引用，防止内存泄漏。

4. **与 Deque 的对比**：

    - Stack：同步，性能低，设计老旧。
    - ArrayDeque：非同步，性能高，推荐使用。

------

## 二、Queue 详解

#### 2.1 什么是 Queue？

Queue 是 Java 集合框架中的一个接口，定义了**先进先出**（FIFO, First-In-First-Out）队列的行为，位于
java.util.Queue。它支持基本的队列操作，如入队（offer）、出队（poll）和查看队首（peek）。

核心特点：

1. **接口定义**：Queue 是一个接口，常见实现包括 LinkedList 和 ArrayDeque。
2. **FIFO 行为**：元素按插入顺序处理（除非是优先级队列，如 PriorityQueue）。
3. **线程不安全**：大多数实现（如 LinkedList、ArrayDeque）非线程安全。
4. **允许 null**：取决于实现（LinkedList 允许，ArrayDeque 不允许）。
5. **时间复杂度**：取决于实现，通常入队和出队为 O(1)。

常见实现：

- **LinkedList**：基于双向链表，支持 Queue 和 Deque 接口。
- **ArrayDeque**：基于循环数组，推荐的非线程安全队列/栈实现。
- **PriorityQueue**：基于最小堆，按优先级排序（已在上文解析）。
- **PriorityBlockingQueue**：线程安全的优先级队列。

由于 Queue 是接口，以下分析以 ArrayDeque 为主要实现（推荐的非线程安全队列），并简要对比 LinkedList。

------

#### 2.2 ArrayDeque 的核心源码结构

来看 ArrayDeque 的类定义和关键字段：

```java
public class ArrayDeque<E> extends AbstractCollection<E>
    implements Deque<E>, Cloneable, Serializable {
    // 序列化版本号
    private static final long serialVersionUID = 2340985798034038923L;

    // 存储元素的数组
    transient Object[] elements;

    // 队首索引
    transient int head;

    // 队尾索引（指向下一个插入位置）
    transient int tail;

    // 最小初始容量（2的幂）
    private static final int MIN_INITIAL_CAPACITY = 8;
}
```

字段解析：

1. **elements**：Object[] 类型的循环数组，存储队列元素。
2. **head**：队首索引，指向第一个元素。
3. **tail**：队尾索引，指向下一个插入位置。
4. **循环数组**：通过模运算（head 和 tail 循环递增）实现高效的队列操作。

------

#### 2.3 构造方法

ArrayDeque 提供了三种构造方法：

1. **无参构造**：

   ```java
   public ArrayDeque() {
       elements = new Object[16];
   }
   ```

    - 默认容量 16。

2. **指定初始容量**：

   ```java
   public ArrayDeque(int numElements) {
       elements = new Object[calculateSize(numElements)];
   }
   private static int calculateSize(int numElements) {
       int initialCapacity = MIN_INITIAL_CAPACITY;
       if (numElements >= initialCapacity) {
           initialCapacity = numElements;
           initialCapacity |= (initialCapacity >>> 1);
           initialCapacity |= (initialCapacity >>> 2);
           initialCapacity |= (initialCapacity >>> 4);
           initialCapacity |= (initialCapacity >>> 8);
           initialCapacity |= (initialCapacity >>> 16);
           initialCapacity++;
           if (initialCapacity < 0) // 处理溢出
               initialCapacity >>>= 1;
       }
       return initialCapacity;
   }
   ```

    - 将容量调整为大于等于 numElements 的 2 的幂。

3. **传入集合**：

   ```java
   public ArrayDeque(Collection<? extends E> c) {
       this(c.size());
       addAll(c);
   }
   ```

------

#### 2.4 核心方法解析（以 ArrayDeque 为例）

ArrayDeque 实现了 Queue 和 Deque 接口，支持队列和双端队列操作。

（1）offer(E e)：入队

```java
public boolean offer(E e) {
    return offerLast(e);
}
public boolean offerLast(E e) {
    addLast(e);
    return true;
}
public void addLast(E e) {
    if (e == null)
        throw new NullPointerException();
    elements[tail] = e;
    if ((tail = (tail + 1) & (elements.length - 1)) == head)
        doubleCapacity(); // 扩容
}
```

- **流程**：

    1. 检查 null，抛出异常。
    2. 将元素放入 tail 位置，tail 递增（模数组长度）。
    3. 如果 tail 追上 head，调用 doubleCapacity 扩容。

- **扩容**：

  ```java
  private void doubleCapacity() {
      int p = head;
      int n = elements.length;
      int r = n - p; // 头到数组末尾的元素数
      int newCapacity = n << 1; // 翻倍
      if (newCapacity < 0)
          throw new IllegalStateException("Sorry, deque too big");
      Object[] a = new Object[newCapacity];
      System.arraycopy(elements, p, a, 0, r);
      System.arraycopy(elements, 0, a, r, p);
      elements = a;
      head = 0;
      tail = n;
  }
  ```

    - 新数组容量翻倍，重新排列元素。

- **性能**：时间复杂度为 O(1)（均摊，扩容时为 O(n)）。

（2）poll()：出队

```java
public E poll() {
    return pollFirst();
}
public E pollFirst() {
    int h = head;
    E result = (E) elements[h];
    if (result == null)
        return null;
    elements[h] = null; // 清空引用
    head = (h + 1) & (elements.length - 1);
    return result;
}
```

- **流程**：
    1. 获取 head 位置的元素。
    2. 清空 head 位置，head 递增（模数组长度）。
    3. 返回移除的元素，或 null（队列为空）。
- **性能**：时间复杂度为 O(1)。

（3）peek()：查看队首

```java
public E peek() {
    return peekFirst();
}
public E peekFirst() {
    return (E) elements[head];
}
```

- **流程**：返回 head 位置的元素，不移除，或 null（队列为空）。
- **性能**：时间复杂度为 O(1)。

（4）contains(Object o)：检查元素

```java
public boolean contains(Object o) {
    if (o == null)
        return false;
    int mask = elements.length - 1;
    int i = head;
    Object x;
    while ((x = elements[i]) != null) {
        if (o.equals(x))
            return true;
        i = (i + 1) & mask;
    }
    return false;
}
```

- **流程**：从 head 到 tail 遍历，检查元素是否存在。
- **性能**：时间复杂度为 O(n)。

（5）clear()：清空队列

```java
public void clear() {
    int h = head;
    int t = tail;
    if (h != t) {
        head = tail = 0;
        int i = h;
        int mask = elements.length - 1;
        do {
            elements[i] = null;
            i = (i + 1) & mask;
        } while (i != t);
    }
}
```

- **流程**：清空数组引用，重置 head 和 tail。
- **性能**：时间复杂度为 O(n)。

------

#### 2.5 性能分析（ArrayDeque）

| 操作                 | 时间复杂度    | 说明            |
|--------------------|----------|---------------|
| offer(E e)         | O(1)（均摊） | 末尾插入，扩容时 O(n) |
| poll()             | O(1)     | 移除队首          |
| peek()             | O(1)     | 查看队首          |
| contains(Object o) | O(n)     | 遍历查找          |
| clear()            | O(n)     | 清空数组          |

------

#### 2.6 注意事项

1. **线程安全**：
    - ArrayDeque 和 LinkedList 不是线程安全的。
    - 解决方法：使用 PriorityBlockingQueue 或 LinkedBlockingQueue。
2. **null 元素**：
    - ArrayDeque 不允许 null（抛出 NullPointerException）。
    - LinkedList 允许 null。
3. **与 LinkedList 的对比**：
    - **ArrayDeque**：
        - 基于循环数组，性能高，内存占用低。
        - 不允许 null，推荐用于队列和栈。
    - **LinkedList**：
        - 基于双向链表，内存占用高，插入/删除稍慢。
        - 允许 null，适合需要双端操作的场景。
4. **性能选择**：
    - ArrayDeque 是非线程安全队列/栈的首选。
    - 如果需要优先级队列，使用 PriorityQueue。
    - 如果需要线程安全，使用 BlockingQueue 实现。

------

三、Stack 和 Queue 的关系与对比

3.1 关系

- **Stack 和 Queue 是不同数据结构**：
    - Stack：LIFO，基于 Vector，线程安全但不推荐。
    - Queue：FIFO（或优先级），接口，推荐使用 ArrayDeque。
- **替代方案**：
    - Stack 的现代替代是 Deque（如 ArrayDeque）。
    - Queue 的高效实现是 ArrayDeque 或 LinkedList。

3.2 对比

| 特性      | Stack           | Queue (ArrayDeque) |
|---------|-----------------|--------------------|
| 用途      | 后进先出（LIFO）      | 先进先出（FIFO）         |
| 底层实现    | 基于 Vector（动态数组） | 基于循环数组             |
| 数据结构    | 类               | 接口（实现如 ArrayDeque） |
| 允许 null | 允许              | 不允许（ArrayDeque）    |
| 线程安全    | 安全（同步）          | 不安全                |
| 性能      | O(1)（栈操作），同步开销大 | O(1)（队列操作），高效      |
| 推荐程度    | 不推荐（用 Deque 替代） | 推荐                 |

3.3 使用场景

- **Stack**：
    - 历史遗留代码维护。
    - 需要线程安全的栈（但建议用 Collections.synchronizedDeque）。
    - 现代替代：ArrayDeque 或 LinkedList 作为 Deque。
- **Queue**：
    - 任务队列（如消息处理）。
    - 广度优先搜索（BFS）。
    - 推荐使用 ArrayDeque（高效）或 LinkedList（灵活）。

------

#### 四、总结

- **Stack**：
    - 基于 Vector 的 LIFO 栈，线程安全但性能低，不推荐使用。
    - 优点：简单，线程安全。
    - 缺点：同步开销大，设计老旧，建议用 Arrayoeff 替代。
- **Queue**（以 ArrayDeque 为例）：
    - 基于循环数组的 FIFO 队列，高效且灵活，支持双端操作。
    - 优点：性能高，内存占用低，适合队列和栈。
    - 缺点：线程不安全，不允许 null。

