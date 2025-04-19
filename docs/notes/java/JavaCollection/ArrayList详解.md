以下是经过优化和改进的 `ArrayList` 文档版本，确保格式一致性、清晰度和内容完整性：

```markdown
---
title: ArrayList详解
createTime: 2023/10/19 18:46:37
permalink: /JavaCollection/yi5hgm4y/
---

# 一、ArrayList详解

## 1. ArrayList 是什么？

ArrayList 是 Java 集合框架中的一种动态数组（Dynamic Array），可以理解为一个“会自动扩容的数组”。它实现了 List
接口，支持快速随机访问（通过索引访问元素），但插入和删除操作可能较慢（因为需要移动元素）。

**核心特点**：

1. **底层数据结构**：基于数组（`Object[]`）存储元素。
2. **动态扩容**：当数组满了，会自动分配更大的数组并复制数据。
3. **线程不安全**：多个线程同时操作可能导致数据不一致（可以用 `Collections.synchronizedList` 或 `CopyOnWriteArrayList`
   替代）。
4. **允许 null**：可以存储 null 元素。
5. **快速随机访问**：通过索引访问元素的时间复杂度为 O(1)。

------

## 2. ArrayList 的核心源码结构

我们先来看 ArrayList 的类定义和关键字段：

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
    // 序列化版本号
    private static final long serialVersionUID = 8683452581122892189L;

    // 默认初始容量
    private static final int DEFAULT_CAPACITY = 10;

    // 用于空实例的共享空数组（优化内存）
    private static final Object[] EMPTY_ELEMENTDATA = {};

    // 用于默认大小的空实例的共享空数组（区分空构造和带初始容量的构造）
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    // 存储元素的数组（核心数据结构）
    transient Object[] elementData;

    // 实际存储的元素个数
    private int size;

    // 最大数组容量（受限于 JVM 虚拟机数组最大长度）
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
}
```

**字段解析**：

1. **elementData**：`Object[]` 类型的数组，真正存储 ArrayList 中的元素。由于是 Object 类型，可以存储任意对象（泛型 `<E>`
   只是编译期约束）。
2. **size**：表示当前 ArrayList 中实际存储的元素个数，而不是数组的长度（`elementData.length` 是数组容量）。
3. **DEFAULT_CAPACITY**：默认初始容量为 10（首次添加元素时触发）。
4. **EMPTY_ELEMENTDATA** 和 **DEFAULTCAPACITY_EMPTY_ELEMENTDATA**：两个空数组，用于空 ArrayList 实例，优化内存使用。
5. **MAX_ARRAY_SIZE**：最大数组容量，约为 `Integer.MAX_VALUE - 8`，防止内存溢出。

------

## 3. 构造方法

ArrayList 有三种构造方法，决定了初始化的数组容量：

1. **无参构造**：创建一个空的 ArrayList，底层数组为空（延迟分配）。

   ```java
   public ArrayList() {
       this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
   }
   ```

    - 特点：`elementData` 初始化为 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`，只有在第一次添加元素时才会分配容量（默认 10）。

2. **指定初始容量**：创建一个指定容量的 ArrayList。

   ```java
   public ArrayList(int initialCapacity) {
       if (initialCapacity > 0) {
           this.elementData = new Object[initialCapacity];
       } else if (initialCapacity == 0) {
           this.elementData = EMPTY_ELEMENTDATA;
       } else {
           throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
       }
   }
   ```

    - 特点：根据传入的 `initialCapacity` 分配数组。如果为 0，使用 `EMPTY_ELEMENTDATA`；如果负数，抛出异常。

3. **传入集合**：将一个集合的元素复制到 ArrayList 中。

   ```java
   public ArrayList(Collection<? extends E> c) {
       Object[] a = c.toArray();
       if ((size = a.length) != 0) {
           if (c.getClass() == ArrayList.class) {
               elementData = a;
           } else {
               elementData = Arrays.copyOf(a, size, Object[].class);
           }
       } else {
           elementData = EMPTY_ELEMENTDATA;
       }
   }
   ```

    - 特点：将集合 `c` 转为数组并复制。如果传入的是 ArrayList，直接复用其数组；否则，使用 `Arrays.copyOf` 复制。

------

## 4. 核心方法解析

下面我们逐一解析 ArrayList 的核心方法，重点讲解实现原理。

### 4.1 添加元素

（1）`add(E e)`：在末尾添加元素

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1); // 确保容量足够
    elementData[size++] = e;         // 放入元素并增加 size
    return true;
}
```

- **流程**：
    1. 调用 `ensureCapacityInternal(size + 1)` 检查容量是否足够（如果不够会扩容）。
    2. 将元素 `e` 放入 `elementData[size]`，并将 `size` 加 1。

- **扩容机制**（`ensureCapacityInternal` 和 `grow`）：

```java
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}

private static int calculateCapacity(Object[] elementData, int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    return minCapacity;
}

private void ensureExplicitCapacity(int minCapacity) {
    modCount++; // 记录结构修改次数（用于快速失败）
    if (minCapacity - elementData.length > 0) {
        grow(minCapacity); // 扩容
    }
}

private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 新容量 = 旧容量 * 1.5
    if (newCapacity - minCapacity < 0) {
        newCapacity = minCapacity;
    }
    if (newCapacity - MAX_ARRAY_SIZE > 0) {
        newCapacity = hugeCapacity(minCapacity);
    }
    elementData = Arrays.copyOf(elementData, newCapacity); // 复制到新数组
}
```

- **扩容原理**：
    1. 如果是第一次添加元素（`elementData` 是 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`），分配默认容量 10。
    2. 正常扩容时，新容量是旧容量的 1.5 倍（`oldCapacity + (oldCapacity >> 1)`）。
    3. 如果新容量超过 `MAX_ARRAY_SIZE`，则使用 `hugeCapacity`（可能分配 `Integer.MAX_VALUE`）。
    4. 使用 `Arrays.copyOf` 将旧数组复制到新数组。

（2）`add(int index, E element)`：在指定位置插入元素

```java
public void add(int index, E element) {
    rangeCheckForAdd(index); // 检查索引是否合法
    ensureCapacityInternal(size + 1); // 确保容量
    System.arraycopy(elementData, index, elementData, index + 1, size - index); // 移动元素
    elementData[index] = element; // 插入元素
    size++;
}
```

- **流程**：
    1. 检查索引是否合法（0 <= index <= size）。
    2. 确保容量足够（可能触发扩容）。
    3. 使用 `System.arraycopy` 将 index 及之后的元素向后移动一位。
    4. 在 index 位置放入新元素，size 加 1。
- **性能**：插入操作需要移动元素，时间复杂度为 O(n)。

### 4.2 删除元素

（1）`remove(int index)`：删除指定位置的元素

```java
public E remove(int index) {
    rangeCheck(index); // 检查索引
    modCount++; // 记录结构修改
    E oldValue = elementData[index]; // 获取旧值
    int numMoved = size - index - 1;
    if (numMoved > 0) {
        System.arraycopy(elementData, index + 1, elementData, index, numMoved); // 向前移动元素
    }
    elementData[--size] = null; // 清空最后一个位置并减少 size
    return oldValue;
}
```

- **流程**：
    1. 检查索引是否合法。
    2. 记录结构修改次数（`modCount` 用于迭代器快速失败）。
    3. 获取要删除的元素。
    4. 将 index 之后的元素向前移动。
    5. 清空最后一个位置（防止内存泄漏），size 减 1。
- **性能**：删除操作需要移动元素，时间复杂度为 O(n)。

（2）`remove(Object o)`：删除指定元素

```java
public boolean remove(Object o) {
    if (o == null) {
        for (int index = 0; index < size; index++) {
            if (elementData[index] == null) {
                fastRemove(index);
                return true;
            }
        }
    } else {
        for (int index = 0; index < size; index++) {
            if (o.equals(elementData[index])) {
                fastRemove(index);
                return true;
            }
        }
    }
    return false;
}
```

- **流程**：
    1. 遍历数组，找到第一个等于 o 的元素（支持 null）。
    2. 调用 `fastRemove` 删除（类似 `remove(int)`，但不检查索引）。
- **注意**：如果有多个相同的元素，只删除第一个。

### 4.3 获取和设置元素

（1）`get(int index)`：获取指定位置的元素

```java
public E get(int index) {
    rangeCheck(index);
    return elementData[index];
}
```

- **流程**：检查索引后直接返回 `elementData[index]`。
- **性能**：时间复杂度为 O(1)，非常快。

（2）`set(int index, E element)`：替换指定位置的元素

```java
public E set(int index, E element) {
    rangeCheck(index);
    E oldValue = elementData[index];
    elementData[index] = element;
    return oldValue;
}
```

- **流程**：检查索引，替换元素并返回旧值。
- **性能**：时间复杂度为 O(1)。

### 4.4 清空和调整大小

（1）`clear()`：清空列表

```java
public void clear() {
    modCount++;
    for (int i = 0; i < size; i++) {
        elementData[i] = null; // 清空引用
    }
    size = 0;
}
```

- **流程**：将所有元素置为 null（防止内存泄漏），size 置为 0。
- **注意**：不会释放底层数组，只是清空内容。

（2）`trimToSize()`：裁剪数组到实际大小

```java
public void trimToSize() {
    modCount++;
    if (size < elementData.length) {
        elementData = (size == 0) ? EMPTY_ELEMENTDATA : Arrays.copyOf(elementData, size);
    }
}
```

- **流程**：如果数组容量大于 size，裁剪到 size 大小。
- **用途**：节省内存。

### 4.5 迭代器和快速失败

ArrayList 提供了 `Iterator` 和 `ListIterator` 用于遍历。关键是快速失败机制：

```java
public Iterator<E> iterator() {
    return new Itr();
}

private class Itr implements Iterator<E> {
    int cursor; // 下一个元素的位置
    int lastRet = -1; // 上一个返回的元素位置
    int expectedModCount = modCount; // 预期修改次数

    public boolean hasNext() {
        return cursor != size;
    }

    public E next() {
        checkForComodification(); // 检查并发修改
        int i = cursor;
        if (i >= size) {
            throw new NoSuchElementException();
        }
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length) {
            throw new ConcurrentModificationException();
        }
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    final void checkForComodification() {
        if (modCount != expectedModCount) {
            throw new ConcurrentModificationException();
        }
    }
}
```

- **快速失败**：如果在迭代过程中 ArrayList 被结构性修改（添加、删除元素导致 `modCount` 变化），迭代器会抛出
  `ConcurrentModificationException`。
- **用途**：防止多线程或不当操作导致的数据不一致。

------

## 5. 性能分析

| 操作                  | 时间复杂度    | 说明              |
|---------------------|----------|-----------------|
| `get(int index)`    | O(1)     | 直接通过索引访问        |
| `set(int index)`    | O(1)     | 直接替换元素          |
| `add(E e)`          | O(1)（均摊） | 末尾添加，扩容时可能 O(n) |
| `add(int index)`    | O(n)     | 需要移动元素          |
| `remove(int index)` | O(n)     | 需要移动元素          |
| `remove(Object o)`  | O(n)     | 需要遍历查找          |
| 扩容                  | O(n)     | 复制数组到新数组        |

------

## 6. 常见问题和注意事项

1. **线程安全问题**：
    - ArrayList 不是线程安全的，多线程操作可能导致数据不一致。
    - 解决方法：
        - 使用 `Collections.synchronizedList(new ArrayList<>())`。
        - 使用 `CopyOnWriteArrayList`（适合读多写少场景）。

2. **扩容性能**：
    - 扩容是昂贵的操作（需要复制数组），建议在构造时指定合理初始容量。
    - 扩容因子是 1.5 倍，空间换时间的典型策略。

3. **内存管理**：
    - 删除元素时要将引用置为 null，防止内存泄漏。
    - 使用 `trimToSize()` 可以减少内存占用。

4. **与 LinkedList 的对比**：
    - ArrayList 适合随机访问和末尾操作。
    - LinkedList 适合频繁插入和删除（但占用更多内存）。

------

## 7. 总结

ArrayList 是 Java 中最常用的集合类之一，基于动态数组实现，具有以下特点：

- **优点**：随机访问快（O(1)），末尾添加效率高，内存占用相对较低。
- **缺点**：插入和删除慢（O(n)），线程不安全。
- **核心机制**：动态扩容（1.5 倍）、快速失败迭代器、数组复制。

通过这篇分析，希望您能更好地理解 `ArrayList` 的实现原理和使用场景！如果有任何问题或需要更深入的讲解，请随时告诉我！

```

### 修改和优化点：
- 统一了标题格式，确保一致性。
- 确保代码块的语言指示符正确。
- 增加了小节编号，使结构更清晰。
- 调整了部分描述，增强可读性。

如果还有其他需要调整的地方，请随时告诉我！
