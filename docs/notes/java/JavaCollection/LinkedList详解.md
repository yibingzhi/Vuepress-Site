---
title: LinkedList详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/29j5ix5s/
---

以下是优化后的 LinkedList 详解笔记，修正了可能导致网页显示报错的格式问题，并提升了结构清晰度和可读性：

# LinkedList 详解

## 一、LinkedList 是什么？

LinkedList 是 Java 集合框架中基于 **双向链表（Doubly Linked List）** 实现的数据结构，它同时实现了 `List` 和 `Deque`
接口，因此可以作为列表（List）、队列（Queue）、双端队列（Deque）或栈（Stack）使用。

### 核心特点

- **底层数据结构**：双向链表，每个节点包含前驱（prev）和后继（next）节点的引用。
- **动态大小**：无需预先指定容量，元素数量仅受内存限制。
- **线程不安全**：多线程并发操作可能导致数据不一致，可通过 `Collections.synchronizedList` 或 `ConcurrentLinkedDeque`
  实现线程安全。
- **支持 null 元素**：允许存储 null 值。
- **插入/删除效率高**：已知节点位置时，插入和删除操作的时间复杂度为 O(1)。
- **随机访问效率低**：通过索引访问元素需遍历链表，时间复杂度为 O(n)。

## 二、LinkedList 的核心源码结构

### 类定义与关键字段

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {
    
    // 序列化版本号
    private static final long serialVersionUID = 876323262645176354L;

    // 链表中元素的实际数量
    transient int size = 0;

    // 指向链表的头节点（第一个元素）
    transient Node<E> first;

    // 指向链表的尾节点（最后一个元素）
    transient Node<E> last;

    // 链表节点的内部类
    private static class Node<E> {
        E item;         // 当前节点存储的元素
        Node<E> next;   // 指向后继节点的引用
        Node<E> prev;   // 指向前驱节点的引用

        // 节点构造方法
        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
}
```

### 字段解析

- **size**：记录链表中元素的实际数量。
- **first**：头节点引用，空链表时为 null。
- **last**：尾节点引用，空链表时为 null。
- **Node 内部类**：链表的基本组成单元，通过 `prev` 和 `next` 实现节点间的双向关联。

### 双向链表结构示意图

- 头节点的 `prev` 为 null，尾节点的 `next` 为 null。
- 非空链表中，每个节点通过 `prev` 指向前一个节点，通过 `next` 指向后一个节点，形成闭环链。
- 空链表时，`first`、`last` 均为 null，`size` 为 0。

## 三、构造方法

LinkedList 提供两种构造方法：

1. **无参构造方法**  
   创建一个空的 LinkedList：
   ```java
   public LinkedList() {
   }
   ```
    - 初始化时 `size = 0`，`first = null`，`last = null`。

2. **带集合参数的构造方法**  
   将指定集合中的元素复制到新的 LinkedList 中：
   ```java
   public LinkedList(Collection<? extends E> c) {
       this();
       addAll(c); // 调用 addAll 方法批量添加元素
   }
   ```

## 四、核心方法解析

### 1. 添加元素

#### （1）在链表末尾添加元素：`add(E e)`

```java
public boolean add(E e) {
    linkLast(e); // 调用 linkLast 方法在尾部插入
    return true;
}

// 在链表尾部插入新节点
void linkLast(E e) {
    final Node<E> l = last; // 保存当前尾节点
    // 创建新节点，前驱为当前尾节点，后继为 null
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode; // 更新尾节点为新节点
    if (l == null) {
        // 若链表为空，新节点同时作为头节点
        first = newNode;
    } else {
        // 若链表非空，原尾节点的后继指向新节点
        l.next = newNode;
    }
    size++; // 元素数量加 1
    modCount++; // 记录结构修改次数（用于快速失败机制）
}
```

- **时间复杂度**：O(1)，直接操作尾节点，无需遍历。

#### （2）在链表头部添加元素：`addFirst(E e)`

```java
public void addFirst(E e) {
    linkFirst(e); // 调用 linkFirst 方法在头部插入
}

// 在链表头部插入新节点
private void linkFirst(E e) {
    final Node<E> f = first; // 保存当前头节点
    // 创建新节点，前驱为 null，后继为当前头节点
    final Node<E> newNode = new Node<>(null, e, f);
    first = newNode; // 更新头节点为新节点
    if (f == null) {
        // 若链表为空，新节点同时作为尾节点
        last = newNode;
    } else {
        // 若链表非空，原头节点的前驱指向新节点
        f.prev = newNode;
    }
    size++;
    modCount++;
}
```

- **时间复杂度**：O(1)，直接操作头节点，无需遍历。

#### （3）在指定索引位置插入元素：`add(int index, E element)`

```java
public void add(int index, E element) {
    checkPositionIndex(index); // 检查索引合法性（0 <= index <= size）
    
    if (index == size) {
        // 若索引等于链表长度，直接在尾部插入
        linkLast(element);
    } else {
        // 否则在指定节点前插入
        linkBefore(element, node(index));
    }
}

// 查找指定索引对应的节点（优化：根据索引位置选择从头或尾遍历）
Node<E> node(int index) {
    if (index < (size >> 1)) { // 索引在前半部分，从头遍历
        Node<E> x = first;
        for (int i = 0; i < index; i++) {
            x = x.next;
        }
        return x;
    } else { // 索引在后半部分，从尾遍历
        Node<E> x = last;
        for (int i = size - 1; i > index; i--) {
            x = x.prev;
        }
        return x;
    }
}

// 在指定节点（succ）前插入新节点
void linkBefore(E e, Node<E> succ) {
    final Node<E> pred = succ.prev; // 获取 succ 的前驱节点
    // 创建新节点，前驱为 pred，后继为 succ
    final Node<E> newNode = new Node<>(pred, e, succ);
    succ.prev = newNode; // succ 的前驱指向新节点
    if (pred == null) {
        // 若 pred 为 null，说明 succ 是头节点，新节点成为新头节点
        first = newNode;
    } else {
        // 否则 pred 的后继指向新节点
        pred.next = newNode;
    }
    size++;
    modCount++;
}
```

- **时间复杂度**：O(n)，主要耗时在查找目标节点（`node(index)` 方法遍历），插入操作本身为 O(1)。

### 2. 删除元素

#### （1）删除指定索引位置的元素：`remove(int index)`

```java
public E remove(int index) {
    checkElementIndex(index); // 检查索引合法性（0 <= index < size）
    return unlink(node(index)); // 查找节点并删除
}

// 移除指定节点并返回其元素
E unlink(Node<E> x) {
    final E element = x.item; // 保存待删除节点的元素
    final Node<E> next = x.next; // 待删除节点的后继
    final Node<E> prev = x.prev; // 待删除节点的前驱

    if (prev == null) {
        // 若前驱为 null，说明是头节点，更新头节点为 next
        first = next;
    } else {
        // 否则前驱的后继指向 next
        prev.next = next;
        x.prev = null; // 断开待删除节点的前驱引用（避免内存泄漏）
    }

    if (next == null) {
        // 若后继为 null，说明是尾节点，更新尾节点为 prev
        last = prev;
    } else {
        // 否则后继的前驱指向 prev
        next.prev = prev;
        x.next = null; // 断开待删除节点的后继引用（避免内存泄漏）
    }

    x.item = null; // 清空节点元素（避免内存泄漏）
    size--;
    modCount++;
    return element;
}
```

- **时间复杂度**：O(n)，耗时在查找目标节点，删除操作本身为 O(1)。

#### （2）删除指定元素：`remove(Object o)`

```java
public boolean remove(Object o) {
    if (o == null) { // 处理元素为 null 的情况
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else { // 处理元素非 null 的情况
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false; // 未找到元素，返回 false
}
```

- **时间复杂度**：O(n)，需遍历链表查找元素，删除操作本身为 O(1)。

#### （3）删除头节点/尾节点：`removeFirst()` / `removeLast()`

```java
// 删除头节点
public E removeFirst() {
    final Node<E> f = first;
    if (f == null) {
        throw new NoSuchElementException(); // 链表为空时抛出异常
    }
    return unlinkFirst(f);
}

private E unlinkFirst(Node<E> f) {
    final E element = f.item;
    final Node<E> next = f.next;
    // 清空头节点的引用（避免内存泄漏）
    f.item = null;
    f.next = null;
    first = next; // 更新头节点为 next
    if (next == null) {
        // 若 next 为 null，说明链表已空，尾节点也设为 null
        last = null;
    } else {
        next.prev = null; // 新头节点的前驱设为 null
    }
    size--;
    modCount++;
    return element;
}

// 删除尾节点（逻辑类似 removeFirst()，操作尾节点）
public E removeLast() {
    final Node<E> l = last;
    if (l == null) {
        throw new NoSuchElementException();
    }
    return unlinkLast(l);
}
```

- **时间复杂度**：O(1)，直接操作头/尾节点，无需遍历。

### 3. 获取与修改元素

#### （1）获取指定索引的元素：`get(int index)`

```java
public E get(int index) {
    checkElementIndex(index); // 检查索引合法性
    return node(index).item; // 查找节点并返回其元素
}
```

- **时间复杂度**：O(n)，需遍历链表查找节点。

#### （2）修改指定索引的元素：`set(int index, E element)`

```java
public E set(int index, E element) {
    checkElementIndex(index);
    Node<E> x = node(index); // 查找目标节点
    E oldVal = x.item; // 保存旧值
    x.item = element; // 替换为新值
    return oldVal; // 返回旧值
}
```

- **时间复杂度**：O(n)，耗时在查找节点。

### 4. 清空链表：`clear()`

```java
public void clear() {
    // 遍历链表，清空所有节点的引用（避免内存泄漏）
    for (Node<E> x = first; x != null; ) {
        Node<E> next = x.next;
        x.item = null;
        x.next = null;
        x.prev = null;
        x = next;
    }
    // 重置头节点、尾节点和大小
    first = last = null;
    size = 0;
    modCount++;
}
```

- **时间复杂度**：O(n)，需遍历所有节点。

### 5. 队列与双端队列操作

由于实现了 `Deque` 接口，LinkedList 支持队列（FIFO）和双端队列的操作，例如：

| 操作类型 | 方法                | 说明                          |
|------|-------------------|-----------------------------|
| 队列操作 | `offer(E e)`      | 在尾部添加元素（同 `add(e)`）         |
| 队列操作 | `poll()`          | 删除并返回头节点（同 `removeFirst()`） |
| 队列操作 | `peek()`          | 返回头节点但不删除（同 `getFirst()`）   |
| 双端操作 | `offerFirst(E e)` | 在头部添加元素（同 `addFirst(e)`）    |
| 双端操作 | `offerLast(E e)`  | 在尾部添加元素（同 `addLast(e)`）     |
| 双端操作 | `pollFirst()`     | 删除并返回头节点（同 `removeFirst()`） |
| 双端操作 | `pollLast()`      | 删除并返回尾节点（同 `removeLast()`）  |

这些方法的时间复杂度均为 O(1)，直接操作头/尾节点。

### 6. 迭代器与快速失败机制

LinkedList 通过 `ListIterator` 支持双向迭代，且实现了 **快速失败（fail-fast）** 机制：

```java
public ListIterator<E> listIterator(int index) {
    checkPositionIndex(index);
    return new ListItr(index);
}

private class ListItr implements ListIterator<E> {
    private Node<E> lastReturned; // 上一次返回的节点
    private Node<E> next; // 下一个要访问的节点
    private int nextIndex; // 下一个节点的索引
    private int expectedModCount = modCount; // 记录迭代开始时的结构修改次数

    ListItr(int index) {
        next = (index == size) ? null : node(index);
        nextIndex = index;
    }

    public boolean hasNext() {
        return nextIndex < size;
    }

    public E next() {
        checkForComodification(); // 检查迭代期间是否发生结构修改
        if (!hasNext()) {
            throw new NoSuchElementException();
        }
        lastReturned = next;
        next = next.next; // 移动到下一个节点
        nextIndex++;
        return lastReturned.item;
    }

    // 检查结构修改次数是否一致
    final void checkForComodification() {
        if (modCount != expectedModCount) {
            throw new ConcurrentModificationException();
        }
    }
}
```

- **快速失败机制**：若迭代过程中链表发生结构性修改（如添加、删除元素），`modCount` 会变化，此时迭代器会抛出
  `ConcurrentModificationException`，避免使用不一致的数据。

## 五、性能分析

| 操作                               | 时间复杂度 | 说明                  |
|----------------------------------|-------|---------------------|
| `get(int index)`                 | O(n)  | 需遍历链表查找节点           |
| `set(int index)`                 | O(n)  | 需遍历链表查找节点           |
| `add(E e)`（尾部）                   | O(1)  | 直接操作尾节点             |
| `add(int index)`                 | O(n)  | 查找节点 O(n) + 插入 O(1) |
| `remove(int index)`              | O(n)  | 查找节点 O(n) + 删除 O(1) |
| `remove(Object o)`               | O(n)  | 遍历查找 O(n) + 删除 O(1) |
| `addFirst()` / `addLast()`       | O(1)  | 直接操作头/尾节点           |
| `removeFirst()` / `removeLast()` | O(1)  | 直接操作头/尾节点           |

## 六、注意事项

1. **线程安全**  
   LinkedList 是非线程安全的，多线程环境下需手动同步（如 `Collections.synchronizedList`）或使用并发容器（如
   `ConcurrentLinkedDeque`）。

2. **适用场景**
    - 适合频繁插入/删除元素（尤其是头/尾节点）的场景（如队列、栈）。
    - 不适合频繁通过索引访问元素的场景（建议用 `ArrayList`）。

3. **内存占用**  
   每个节点需存储 `prev`、`next` 和 `item` 三个引用，内存占用比 `ArrayList` 更高。

4. **与 ArrayList 的对比**

   | 特性 | LinkedList | ArrayList |
            |------|------------|-----------|
   | 底层结构 | 双向链表 | 动态数组 |
   | 随机访问 | 慢（O(n)） | 快（O(1)） |
   | 插入/删除（中间） | 快（O(1)，已知节点） | 慢（O(n)，需移动元素） |
   | 内存占用 | 高（节点存储额外引用） | 较低（连续空间） |
   | 线程安全 | 不安全 | 不安全 |

## 七、总结

LinkedList 是基于双向链表的灵活数据结构，其设计专注于高效的插入和删除操作，尤其适合作为队列、双端队列或栈使用。但由于随机访问效率低，需根据具体场景选择（频繁访问用
`ArrayList`，频繁修改用 `LinkedList`）。
