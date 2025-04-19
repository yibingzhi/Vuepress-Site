---
title: Iterator详解
createTime: 2025/04/19 18:46:37
permalink: /JavaCollection/hke8wshz/
---

#### 一、迭代器（Iterator）是什么？

Iterator 是 Java 集合框架中用于**遍历集合元素**的标准接口，定义在 java.util.Iterator
包中。它提供了一种统一的遍历方式，允许用户逐个访问集合中的元素，而无需了解集合的底层实现（如数组、链表、红黑树等）。

核心特点：

1. **统一接口**：所有实现了 Iterable 接口的集合（如 List、Set、Map 的键集/值集等）都可以通过 Iterator 遍历。
2. **单向遍历**：Iterator 支持从头到尾遍历集合（ListIterator 支持双向遍历）。
3. **快速失败机制**：大多数迭代器实现支持**快速失败**（fail-fast），在遍历过程中如果集合被结构性修改（插入、删除等），会抛出
   ConcurrentModificationException。
4. **线程不安全**：迭代器通常不是线程安全的，多线程环境下需要外部同步。
5. **功能**：
    - 检查是否有下一个元素（hasNext）。
    - 获取下一个元素（next）。
    - 可选地移除当前元素（remove）。

相关接口：

- **Iterator**：基础迭代器接口，定义了 hasNext、next 和 remove。
- **Iterable**：集合类实现此接口以支持 forEach 和增强型 for 循环，返回 Iterator。
- **ListIterator**：Iterator 的子接口，专为 List 提供双向遍历和修改功能。

------

#### 二、Iterator 接口源码

Iterator 接口非常简单，定义如下：

```java
public interface Iterator<E> {
    boolean hasNext(); // 检查是否还有下一个元素
    E next();          // 返回下一个元素
    default void remove() { // 可选操作，移除当前元素
        throw new UnsupportedOperationException("remove");
    }
    default void forEachRemaining(Consumer<? super E> action) { // 对剩余元素执行操作
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
}
```

方法解析：

1. **hasNext()**：返回 true 表示还有元素可遍历。
2. **next()**：返回下一个元素，并移动游标。如果没有元素，抛出 NoSuchElementException。
3. **remove()**：移除 next() 返回的最后一个元素，默认抛出 UnsupportedOperationException，需由具体实现支持。
4. **forEachRemaining**：Java 8 引入，对剩余元素执行指定操作，简化批量处理。

------

三、迭代器在集合中的实现

不同集合类（如 HashSet、HashMap、TreeSet、TreeMap、PriorityQueue、WeakHashMap）的迭代器实现方式不同，取决于底层数据结构。以下逐一分析常见集合的迭代器实现。

\1. HashSet 和 HashMap 的迭代器

- **底层实现**：HashSet 的迭代器基于 HashMap 的键集迭代器，HashMap 提供键集（keySet）、值集（values）和键值对集（entrySet）的迭代器。

- **源码分析**（以 HashMap 的 KeyIterator 为例）：

  ```java
  final class KeyIterator extends HashIterator implements Iterator<K> {
      public final K next() { return nextNode().key; }
  }
  abstract class HashIterator {
      Node<K,V> next;        // 下一个节点
      Node<K,V> current;     // 当前节点
      int expectedModCount;  // 预期修改次数
      int index;             // 当前哈希表索引
  
      HashIterator() {
          expectedModCount = modCount;
          Node<K,V>[] t = table;
          current = next = null;
          index = 0;
          if (t != null && size > 0) {
              do {} while (index < t.length && (next = t[index++]) == null);
          }
      }
  
      public final boolean hasNext() {
          return next != null;
      }
  
      final Node<K,V> nextNode() {
          Node<K,V> e = next;
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          if (e == null)
              throw new NoSuchElementException();
          if ((next = (current = e).next) == null && table != null) {
              do {} while (index < table.length && (next = table[index++]) == null);
          }
          return e;
      }
  
      public final void remove() {
          if (current == null)
              throw new IllegalStateException();
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          Node<K,V> node = current;
          current = null;
          K key = node.key;
          removeNode(hash(key), key, null, false, false);
          expectedModCount = modCount;
      }
  }
  ```

- **流程**：

    1. 初始化时记录 modCount，定位第一个非空哈希桶。
    2. hasNext：检查是否有下一个节点。
    3. next：返回当前节点并移动到下一个（链表或下一个桶）。
    4. remove：移除当前节点，更新 modCount。

- **快速失败**：如果 modCount 变化（集合被修改），抛出 ConcurrentModificationException。

- **性能**：遍历时间复杂度为 O(n)，remove 为 O(1)（平均）。

2. TreeSet 和 TreeMap 的迭代器

- **底层实现**：TreeSet 的迭代器基于 TreeMap 的键集迭代器，TreeMap 使用红黑树的中序遍历。

- **源码分析**（以 TreeMap 的 KeyIterator 为例）：

  java

  ```java
  private class KeyIterator extends PrivateEntryIterator<K> {
      KeyIterator(Entry<K,V> first) {
          super(first);
      }
      public K next() {
          return nextEntry().key;
      }
  }
  abstract class PrivateEntryIterator<T> implements Iterator<T> {
      Entry<K,V> next;           // 下一个节点
      Entry<K,V> lastReturned;   // 上一个返回的节点
      int expectedModCount;      // 预期修改次数
  
      PrivateEntryIterator(Entry<K,V> first) {
          expectedModCount = modCount;
          lastReturned = null;
          next = first;
      }
  
      public final boolean hasNext() {
          return next != null;
      }
  
      final Entry<K,V> nextEntry() {
          Entry<K,V> e = next;
          if (e == null)
              throw new NoSuchElementException();
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          next = successor(e); // 红黑树中序后继
          lastReturned = e;
          return e;
      }
  
      public void remove() {
          if (lastReturned == null)
              throw new IllegalStateException();
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          if (lastReturned.left != null && lastReturned.right != null)
              next = lastReturned;
          deleteEntry(lastReturned);
          expectedModCount = modCount;
          lastReturned = null;
      }
  }
  ```

- **流程**：

    1. 初始化时从红黑树的最小节点（最左节点）开始。
    2. hasNext：检查是否有下一个节点。
    3. next：返回当前节点，移动到中序后继。
    4. remove：删除上一个返回的节点，调整红黑树。

- **快速失败**：检测 modCount 变化。

- **性能**：遍历时间复杂度为 O(n)，remove 为 O(log n)。

\3. PriorityQueue 的迭代器

- **底层实现**：PriorityQueue 的迭代器基于数组顺序遍历（不是堆序）。

- **源码分析**：

  java

  ```java
  private class Itr implements Iterator<E> {
      private int cursor = 0;        // 当前索引
      private int lastRet = -1;      // 上一个返回的索引
      private int expectedModCount = modCount;
  
      public boolean hasNext() {
          return cursor < size;
      }
  
      public E next() {
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          if (cursor >= size)
              throw new NoSuchElementException();
          lastRet = cursor;
          return (E) queue[cursor++];
      }
  
      public void remove() {
          if (lastRet < 0)
              throw new IllegalStateException();
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          removeAt(lastRet);
          cursor = lastRet;
          lastRet = -1;
          expectedModCount = modCount;
      }
  }
  ```

- **流程**：

    1. 按数组索引从 0 到 size-1 遍历。
    2. hasNext：检查是否未到数组末尾。
    3. next：返回当前元素，递增索引。
    4. remove：移除上一个元素，调整堆。

- **快速失败**：检测 modCount 变化。

- **性能**：遍历时间复杂度为 O(n)，remove 为 O(log n)（堆调整）。

\4. WeakHashMap 的迭代器

- **底层实现**：类似 HashMap，但需要处理弱引用键的回收。

- **源码分析**：

  ```java
  private class KeyIterator extends HashIterator<K> {
      public K next() {
          return nextEntry().getKey();
      }
  }
  private abstract class HashIterator<T> implements Iterator<T> {
      private int index;
      private Entry<K,V> entry;
      private Entry<K,V> lastReturned;
      private int expectedModCount = modCount;
      private Object currentKey;
  
      HashIterator() {
          expungeStaleEntries(); // 清理回收的键
          Entry<K,V>[] t = table;
          for (index = 0; index < t.length; index++) {
              if ((entry = t[index]) != null)
                  break;
          }
      }
  
      public boolean hasNext() {
          Entry<K,V>[] t = table;
          while (entry == null && index < t.length) {
              entry = t[index++];
          }
          return entry != null;
      }
  
      Entry<K,V> nextEntry() {
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          expungeStaleEntries();
          Entry<K,V> e = entry;
          if (e == null)
              throw new NoSuchElementException();
          entry = e.next;
          if (entry == null && ++index < table.length) {
              while (index < table.length && (entry = table[index]) == null)
                  index++;
          }
          lastReturned = e;
          currentKey = e.get();
          return e;
      }
  
      public void remove() {
          if (lastReturned == null)
              throw new IllegalStateException();
          if (modCount != expectedModCount)
              throw new ConcurrentModificationException();
          Object k = currentKey;
          currentKey = null;
          WeakHashMap.this.remove(k);
          expectedModCount = modCount;
          lastReturned = null;
      }
  }
  ```

- **流程**：

    1. 初始化时清理回收的键，定位第一个非空哈希桶。
    2. hasNext：检查是否有下一个有效节点。
    3. next：返回当前节点，移动到下一个，清理回收的键。
    4. remove：移除上一个节点。

- **快速失败**：检测 modCount 变化。

- **性能**：遍历时间复杂度为 O(n)，remove 为 O(1)（平均）。

------

#### 四、代码示例

以下是一些使用迭代器的示例，展示不同集合的遍历方式。

4.1 HashSet 迭代器

```java
import java.util.*;

public class HashSetIteratorExample {
    public static void main(String[] args) {
        HashSet<String> set = new HashSet<>();
        set.add("Apple");
        set.add("Banana");
        set.add("Orange");

        Iterator<String> iterator = set.iterator();
        while (iterator.hasNext()) {
            String element = iterator.next();
            System.out.println(element);
            if (element.equals("Banana")) {
                iterator.remove(); // 移除 Banana
            }
        }
        System.out.println("After removal: " + set); // 输出: [Apple, Orange]
    }
}
```

4.2 TreeMap 迭代器

```java
import java.util.*;

public class TreeMapIteratorExample {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(3, "Three");
        map.put(1, "One");
        map.put(2, "Two");

        Iterator<Map.Entry<Integer, String>> iterator = map.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<Integer, String> entry = iterator.next();
            System.out.println(entry.getKey() + ": " + entry.getValue());
            if (entry.getKey() == 2) {
                iterator.remove(); // 移除键 2
            }
        }
        System.out.println("After removal: " + map); // 输出: {1=One, 3=Three}
    }
}
```

4.3 PriorityQueue 迭代器

```java
import java.util.*;

public class PriorityQueueIteratorExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        queue.add(5);
        queue.add(2);
        queue.add(8);

        Iterator<Integer> iterator = queue.iterator();
        while (iterator.hasNext()) {
            Integer element = iterator.next();
            System.out.println(element); // 顺序不保证
            if (element == 5) {
                iterator.remove(); // 移除 5
            }
        }
        System.out.println("After removal: " + queue); // 输出: [2, 8]
    }
}
```

------

#### 五、性能分析

| 集合类           | 遍历复杂度 | 移除复杂度    | 顺序性      |
|---------------|-------|----------|----------|
| HashSet       | O(n)  | O(1)（平均） | 无序       |
| HashMap       | O(n)  | O(1)（平均） | 无序       |
| TreeSet       | O(n)  | O(log n) | 有序（中序遍历） |
| TreeMap       | O(n)  | O(log n) | 有序（中序遍历） |
| PriorityQueue | O(n)  | O(log n) | 无序（数组顺序） |
| WeakHashMap   | O(n)  | O(1)（平均） | 无序       |

------

#### 六、常见问题和注意事项

1. **快速失败机制**：

    - 迭代器通过 modCount 检测集合的结构性修改（插入、删除）。
    - 如果在遍历过程中修改集合（如直接调用 set.add），抛出 ConcurrentModificationException。
    - **解决方法**：使用迭代器的 remove 方法，或使用线程安全的集合（如 ConcurrentHashMap）。

2. **线程安全**：

    - 迭代器通常不是线程安全的，多线程环境下可能导致数据不一致或异常。

    - **解决方法**：

        - 使用 Collections.synchronizedXXX 包装集合。

        - 使用并发集合（如 ConcurrentHashMap、CopyOnWriteArrayList）。

        - 手动加锁：

          java

       ```java
       synchronized(set) {
           Iterator<String> iterator = set.iterator();
           while (iterator.hasNext()) {
               System.out.println(iterator.next());
           }
       }
       ```

3. **迭代顺序**：

    - HashSet/HashMap/WeakHashMap：无序。
    - TreeSet/TreeMap：按键排序（中序遍历）。
    - PriorityQueue：数组顺序（非堆序）。

4. **remove 方法限制**：

    - 必须先调用 next 获取元素，才能调用 remove。
    - 每次 next 只能调用一次 remove，否则抛出 IllegalStateException。

5. **增强型 for 循环**：

    - 增强型 for 循环（for (E e : collection)）底层基于 Iterator。
    - 不能在增强型 for 循环中直接修改集合，否则抛出 ConcurrentModificationException。
    - **解决方法**：使用显式迭代器或并发集合。

6. **替代方案**：

    - **Stream API**：Java 8 引入，适合复杂操作：

      java

     ```java
     set.stream().filter(e -> !e.equals("Banana")).forEach(System.out::println);
     ```

- **Concurrent collections**：如 ConcurrentHashMap 的 keySet 支持并发遍历。

------

#### 七、总结

Iterator 是 Java 集合框架的核心组件，提供了一种统一的遍历方式，具有以下特点：

- **优点**：抽象底层实现，快速失败机制，灵活的遍历和删除操作。
- **缺点**：线程不安全，快速失败可能导致异常，部分迭代器（如 PriorityQueue）顺序无意义。

通过源码分析，我们可以看到不同集合的迭代器实现根据数据结构（数组、链表、红黑树、堆）而异，但都遵循快速失败机制和 O(n)
遍历复杂度。希望这篇通俗易懂的分析能帮你更好地理解 Iterator 的实现原理和使用方法！

如果你有以下需求，请告诉我，我会进一步补充：

- 某个集合迭代器的详细源码分析。
- 特定场景的迭代器使用示例（例如并发遍历、复杂过滤）。
- 与其他遍历方式（如 Stream、forEach）的对比。
- 其他补充内容。

期待你的进一步反馈！
