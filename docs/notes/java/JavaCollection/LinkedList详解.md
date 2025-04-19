---
title: LinkedList详解
createTime: 2025/04/19 16:41:26
permalink: /JavaCollection/fzntm8yh/
---

#### 一、LinkedList 是什么？

LinkedList 是 Java 集合框架中的一种**双向链表**（Doubly Linked List），实现了 List 和 Deque
接口。它支持快速的插入和删除操作，但随机访问（通过索引访问元素）较慢。LinkedList
可以作为列表（List）、队列（Queue）、双端队列（Deque）或栈（Stack）使用。

核心特点：

1. **底层数据结构**：基于双向链表，每个节点存储前驱和后继节点的引用。
2. **动态大小**：无需扩容，元素个数只受内存限制。
3. **线程不安全**：多个线程同时操作可能导致数据不一致（可用 Collections.synchronizedList 或 ConcurrentLinkedDeque 替代）。
4. **允许 null**：可以存储 null 元素。
5. **快速插入/删除**：时间复杂度为 O(1)（如果已知节点位置）。
6. **慢随机访问**：通过索引访问元素需要遍历链表，时间复杂度为 O(n)。

------

#### 二、LinkedList 的核心源码结构

我们先来看 LinkedList 的类定义和关键字段：

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = 876323262645176354L;

    // 链表大小（节点数）
    transient int size = 0;

    // 头节点（指向第一个节点）
    transient Node<E> first;

    // 尾节点（指向最后一个节点）
    transient Node<E> last;

    // 节点内部类
    private static class Node<E> {
        E item;         // 存储的元素
        Node<E> next;   // 后继节点
        Node<E> prev;   // 前驱节点

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
}
```

字段解析：

1. **size**：表示链表中实际存储的节点数（元素个数）。
2. **first**：头节点，指向链表的第一个节点（空链表时为 null）。
3. **last**：尾节点，指向链表的最后一个节点（空链表时为 null）。
4. **Node<E>**：链表节点的内部类，包含：
    - item：存储的元素。
    - next：指向下一个节点的引用。
    - prev：指向上一个节点的引用。

双向链表结构：

- 每个节点通过 prev 和 next 连接，形成一个双向链表。
- 头节点的 prev 为 null，尾节点的 next 为 null。
- 空链表时，first 和 last 都为 null，size 为 0。

------

#### 三、构造方法

LinkedList 提供了两种构造方法：

1. **无参构造**：创建一个空的 LinkedList。

   java

   ```java
   public LinkedList() {
   }
   ```

- 特点：初始化时 size = 0，first = null，last = null。

2. **传入集合**：将一个集合的元素复制到 LinkedList 中。

   java

   ```java
   public LinkedList(Collection<? extends E> c) {
       this();
       addAll(c);
   }
   ```

- 特点：调用 addAll 方法将集合 c 的元素逐一添加到链表中。

------

#### 四、核心方法解析

下面我们逐一解析 LinkedList 的核心方法，重点讲解实现原理。

\1. **添加元素**

（1）add(E e)：在末尾添加元素

```java
public boolean add(E e) {
    linkLast(e);
    return true;
}
void linkLast(E e) {
    final Node<E> l = last;           // 保存当前尾节点
    final Node<E> newNode = new Node<>(l, e, null); // 创建新节点
    last = newNode;                   // 更新尾节点
    if (l == null)                    // 如果链表为空
        first = newNode;              // 新节点同时是头节点
    else
        l.next = newNode;             // 原尾节点的 next 指向新节点
    size++;
    modCount++;                       // 记录结构修改次数
}
```

- **流程**：
    1. 创建新节点，prev 指向原尾节点，next 为 null。
    2. 更新 last 为新节点。
    3. 如果链表为空（l == null），设置 first 为新节点；否则将原尾节点的 next 指向新节点。
    4. 增加 size 和 modCount（用于快速失败）。
- **性能**：时间复杂度为 O(1)，直接在尾部添加。

（2）addFirst(E e)：在头部添加元素

```java
public void addFirst(E e) {
    linkFirst(e);
}
private void linkFirst(E e) {
    final Node<E> f = first;          // 保存当前头节点
    final Node<E> newNode = new Node<>(null, e, f); // 创建新节点
    first = newNode;                  // 更新头节点
    if (f == null)                    // 如果链表为空
        last = newNode;               // 新节点同时是尾节点
    else
        f.prev = newNode;             // 原头节点的 prev 指向新节点
    size++;
    modCount++;
}
```

- **流程**：类似 linkLast，但在头部插入，更新 first 和相关指针。
- **性能**：时间复杂度为 O(1)。

（3）add(int index, E element)：在指定位置插入元素

```java
public void add(int index, E element) {
    checkPositionIndex(index);        // 检查索引
    if (index == size)                // 如果插入到末尾
        linkLast(element);
    else
        linkBefore(element, node(index)); // 插入到指定节点前
}
Node<E> node(int index) {
    if (index < (size >> 1)) {        // 如果索引在前半部分，从头遍历
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {                          // 如果索引在后半部分，从尾遍历
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
void linkBefore(E e, Node<E> succ) {
    final Node<E> pred = succ.prev;   // 获取前驱节点
    final Node<E> newNode = new Node<>(pred, e, succ); // 创建新节点
    succ.prev = newNode;              // 更新后继节点的 prev
    if (pred == null)                 // 如果插入到头部
        first = newNode;
    else
        pred.next = newNode;          // 更新前驱节点的 next
    size++;
    modCount++;
}
```

- **流程**：
    1. 检查索引是否合法（0 <= index <= size）。
    2. 如果插入到末尾，直接调用 linkLast。
    3. 否则通过 node(index) 找到目标位置的节点（优化：从头或尾遍历，取决于索引靠近哪端）。
    4. 调用 linkBefore 在目标节点前插入新节点，调整前后指针。
- **性能**：查找节点时间复杂度为 O(n)，插入操作本身为 O(1)。

2. **删除元素**

（1）remove(int index)：删除指定位置的元素

```java
public E remove(int index) {
    checkElementIndex(index);
    return unlink(node(index));
}
E unlink(Node<E> x) {
    final E element = x.item;         // 保存删除的元素
    final Node<E> next = x.next;      // 保存后继节点
    final Node<E> prev = x.prev;      // 保存前驱节点
    if (prev == null) {               // 如果删除的是头节点
        first = next;
    } else {
        prev.next = next;             // 前驱指向后继
        x.prev = null;                // 断开引用
    }
    if (next == null) {               // 如果删除的是尾节点
        last = prev;
    } else {
        next.prev = prev;             // 后继指向前驱
        x.next = null;                // 断开引用
    }
    x.item = null;                    // 清空元素引用
    size--;
    modCount++;
    return element;
}
```

- **流程**：
    1. 检查索引并通过 node(index) 找到目标节点。
    2. 调用 unlink 删除节点，调整前后节点的指针。
    3. 清空删除节点的引用（防止内存泄漏），更新 size 和 modCount。
- **性能**：查找节点 O(n)，删除操作 O(1)。

（2）remove(Object o)：删除指定元素

```java
public boolean remove(Object o) {
    if (o == null) {
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}
```

- **流程**：
    1. 遍历链表，找到第一个等于 o 的节点（支持 null）。
    2. 调用 unlink 删除节点。
- **性能**：遍历查找 O(n)，删除 O(1)。

（3）removeFirst() 和 removeLast()：删除头部或尾部元素

```java
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}
private E unlinkFirst(Node<E> f) {
    final E element = f.item;
    final Node<E> next = f.next;
    f.item = null;
    f.next = null; // 断开引用
    first = next;
    if (next == null)
        last = null;
    else
        next.prev = null;
    size--;
    modCount++;
    return element;
}
```

- **流程**：直接操作头节点（或尾节点），更新指针。
- **性能**：时间复杂度为 O(1)。

3. **获取和设置元素**

（1）get(int index)：获取指定位置的元素

```java
public E get(int index) {
    checkElementIndex(index);
    return node(index).item;
}
```

- **流程**：通过 node(index) 找到目标节点，返回其 item。
- **性能**：时间复杂度为 O(n)，因为需要遍历。

（2）set(int index, E element)：替换指定位置的元素

```java
public E set(int index, E element) {
    checkElementIndex(index);
    Node<E> x = node(index);
    E oldVal = x.item;
    x.item = element;
    return oldVal;
}
```

- **流程**：找到目标节点，替换 item 并返回旧值。
- **性能**：时间复杂度为 O(n)。

4. **清空链表**

clear()：清空链表

```java
public void clear() {
    for (Node<E> x = first; x != null; ) {
        Node<E> next = x.next;
        x.item = null;
        x.next = null;
        x.prev = null;
        x = next;
    }
    first = last = null;
    size = 0;
    modCount++;
}
```

- **流程**：遍历链表，清空每个节点的引用，设置 first 和 last 为 null，size 为 0。
- **性能**：时间复杂度为 O(n)。

5. **队列和双端队列操作**

LinkedList 实现了 Deque 接口，支持队列和双端队列操作，例如：

- **队列操作**：
    - offer(E e)：末尾添加，等同于 add(e)。
    - poll()：删除并返回头节点。
    - peek()：返回头节点但不删除。
- **双端队列操作**：
    - offerFirst(E e) / offerLast(E e)：在头部或尾部添加。
    - pollFirst() / pollLast()：删除并返回头节点或尾节点。
    - peekFirst() / peekLast()：查看头节点或尾节点。

这些方法直接操作 first 或 last，时间复杂度为 O(1)。

6. **迭代器和快速失败**

LinkedList 提供了 Iterator 和 ListIterator，支持正向和反向遍历：

```java
public ListIterator<E> listIterator(int index) {
    checkPositionIndex(index);
    return new ListItr(index);
}
private class ListItr implements ListIterator<E> {
    private Node<E> lastReturned;
    private Node<E> next;
    private int nextIndex;
    private int expectedModCount = modCount;

    ListItr(int index) {
        next = (index == size) ? null : node(index);
        nextIndex = index;
    }

    public boolean hasNext() {
        return nextIndex < size;
    }

    public E next() {
        checkForComodification();
        if (!hasNext())
            throw new NoSuchElementException();
        lastReturned = next;
        next = next.next;
        nextIndex++;
        return lastReturned.item;
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

- **快速失败**：如果在迭代过程中链表被结构性修改（modCount 变化），抛出 ConcurrentModificationException。
- **双向遍历**：ListIterator 支持 hasPrevious() 和 previous()，适合双向链表。

------

#### 五、性能分析

| 操作                       | 时间复杂度 | 说明                |
|--------------------------|-------|-------------------|
| get(int index)           | O(n)  | 需要遍历到目标节点         |
| set(int index)           | O(n)  | 需要遍历到目标节点         |
| add(E e)                 | O(1)  | 末尾添加直接操作尾节点       |
| add(int index)           | O(n)  | 查找 O(n)，插入 O(1)   |
| remove(int index)        | O(n)  | 查找 O(n)，删除 O(1)   |
| remove(Object o)         | O(n)  | 遍历查找 O(n)，删除 O(1) |
| addFirst / addLast       | O(1)  | 直接操作头/尾节点         |
| removeFirst / removeLast | O(1)  | 直接操作头/尾节点         |

------

#### 六、常见问题和注意事项

1. **线程安全问题**：
    - LinkedList 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：
        - 使用 Collections.synchronizedList(new LinkedList<>())。
        - 使用 ConcurrentLinkedDeque（适合队列场景）。
2. **性能选择**：
    - **适合场景**：频繁插入/删除（尤其在头部或尾部），或需要队列/双端队列功能。
    - **不适合场景**：随机访问（get(index) 慢），建议用 ArrayList。
3. **内存占用**：
    - 每个节点存储 prev、next 和 item，比 ArrayList 占用更多内存。
    - 删除节点时清空引用，防止内存泄漏。
4. **与 ArrayList 的对比**：
    - ArrayList：基于数组，随机访问快（O(1)），插入/删除慢（O(n)）。
    - LinkedList：基于双向链表，插入/删除快（O(1)），随机访问慢（O(n)）。
5. **Deque 接口的灵活性**：
    - LinkedList 实现了 Deque，适合实现栈（push/pop）、队列（offer/poll）等数据结构。

------

#### 七、总结

LinkedList 是 Java 中基于双向链表的集合类，具有以下特点：

- **优点**：插入和删除快（O(1)），支持队列和双端队列操作，灵活性高。
- **缺点**：随机访问慢（O(n)），内存占用较高，线程不安全。
- **核心机制**：双向链表结构，头尾指针优化，快速失败迭代器。

通过源码解析，我们可以看到 LinkedList 的设计非常适合动态插入和删除场景，尤其是在需要频繁操作头尾节点的场景下（如队列或栈）。希望这篇通俗易懂的分析能帮你更好地理解
LinkedList 的实现原理！如果有具体方法或细节需要进一步讲解，请告诉我！
