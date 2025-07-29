---
title: java集合类
createTime: 2024/11/19 10:16:34
permalink: /article/or78nw7y/
---

### 一、集合框架概述

- **集合的概念**：集合是用来存储、操作一组对象的数据结构。在Java中，集合框架提供了一套统一的、高性能的、方便使用的接口和类，用于处理对象的存储和管理，相比于数组，集合具有更灵活的大小调整、类型安全等特性。
- **集合框架的体系结构**：
    - **根接口**：`Collection`接口是所有集合类的根接口（不包括映射相关的集合，映射以`Map`
      为根接口），它定义了一些通用的集合操作方法，如添加、删除、遍历元素等。
    - **主要子接口**：
        - `List`接口：有序的集合，元素可以重复，提供了按照索引访问元素的方法，例如可以通过`get(int index)`
          方法获取指定索引处的元素，常见实现类有`ArrayList`、`LinkedList`等。
        - `Set`接口：无序的集合，元素不可以重复，常用于去重场景或者表示数学上的集合概念，常见实现类有`HashSet`、`TreeSet`等。
    - **`Map`接口**：用于存储键值对（Key-Value）形式的数据，每个键是唯一的，通过键可以快速获取对应的值，常见实现类有`HashMap`、
      `TreeMap`等。

### 二、List接口及实现类

- **ArrayList**：
    - **数据结构**：基于数组实现，内部维护了一个动态大小的数组来存储元素。当数组容量不足时，会自动进行扩容操作（一般是按照原来容量的一定倍数扩容，如1.5倍）。
    - **特点**：
        - 随机访问效率高，因为可以通过索引直接定位到元素，时间复杂度为`O(1)`。例如：

```java
ArrayList<String> arrayList = new ArrayList<>();
arrayList.add("元素1");
arrayList.add("元素2");
System.out.println(arrayList.get(0)); // 可以快速获取指定索引的元素
```

        - 插入和删除元素效率相对较低，尤其是在中间位置插入或删除元素时，需要移动后面的元素，平均时间复杂度为`O(n)`。例如在索引为2的位置插入元素：

```java
arrayList.add(2, "新元素"); // 插入元素，后面元素需依次后移
```

    - **适用场景**：适合频繁进行随机访问、元素数量变化不大或者末尾添加元素较多的场景，比如存储学生成绩列表等。

- **LinkedList**：
    - **数据结构**：基于双向链表实现，每个节点包含了元素值以及指向前一个节点和后一个节点的引用。
    - **特点**：
        - 插入和删除元素效率高，尤其是在链表头部或尾部进行操作时，时间复杂度为`O(1)`。例如在头部添加元素：

```java
LinkedList<String> linkedList = new LinkedList<>();
linkedList.addFirst("头部元素"); // 在头部快速添加元素
```

        - 随机访问效率低，因为要从链表头开始遍历查找元素，时间复杂度为`O(n)`。例如获取索引为3的元素：

```java
linkedList.get(3); // 需要依次遍历节点查找
```

    - **适用场景**：适合频繁进行插入、删除操作，特别是在链表两端操作较多的场景，比如实现队列、栈等数据结构，或者在多线程环境下作为线程安全集合的底层实现（配合同步机制）。

- **Vector**：
    - **数据结构**：和`ArrayList`类似，也是基于数组实现，但它是线程安全的（方法都使用了`synchronized`
      关键字修饰），在多线程环境下能保证数据的一致性。
    - **特点**：
        - 由于其线程安全的特性，在多线程并发访问时不会出现数据不一致问题，但相应地，性能会比`ArrayList`
          稍差，因为每次方法调用都涉及锁的获取和释放。例如在多线程环境下添加元素：

```java
Vector<String> vector = new Vector<>();
// 多个线程可以安全地调用add方法
vector.add("线程安全元素"); 
```

        - 随着Java集合框架的发展，现在更推荐使用`CopyOnWriteArrayList`等在并发场景下性能更好的集合类来替代`Vector`。
    - **适用场景**：在早期的多线程应用中常用于存储共享数据，但现在已较少直接使用，除非对线程安全有严格要求且性能要求不高的特定场景。

### 三、Set接口及实现类

- **HashSet**：
    - **数据结构**：基于`HashMap`实现，实际上是将元素作为`HashMap`的键来存储，值使用一个固定的`PRESENT`对象（只是为了利用
      `HashMap`的键值对存储结构），其不允许重复元素是通过`HashMap`中键的唯一性来保证的。
    - **特点**：
        - 元素无序，添加、删除、查找元素的效率较高，平均时间复杂度接近`O(1)`，这依赖于`HashMap`中良好的哈希算法和桶结构。例如：

```java
HashSet<String> hashSet = new HashSet<>();
hashSet.add("元素1");
hashSet.add("元素2");
System.out.println(hashSet.contains("元素1")); // 快速判断元素是否存在
```

        - 对于自定义类作为元素时，需要重写`hashCode`和`equals`方法来确保元素的唯一性和正确的比较逻辑，否则可能出现不符合预期的去重效果。
    - **适用场景**：适用于需要快速判断元素是否存在、进行去重操作的场景，比如统计一篇文章中不重复的单词等。

- **TreeSet**：
    - **数据结构**：基于红黑树实现，会对元素进行排序（自然排序或者根据自定义的比较器排序），保证元素按照一定顺序存储在集合中。
    - **特点**：
        - 元素是有序的，可以方便地进行范围查询等操作，比如获取大于某个元素的所有元素等。例如：

```java
TreeSet<Integer> treeSet = new TreeSet<>();
treeSet.add(3);
treeSet.add(1);
treeSet.add(5);
System.out.println(treeSet.ceiling(2)); // 获取大于等于2的最小元素
```

        - 插入、删除、查找元素的时间复杂度为`O(log n)`，性能相对稳定，但比`HashSet`在插入等操作上稍慢一点，尤其是元素数量较大时，因为需要维护红黑树的结构平衡。
        - 同样对于自定义类作为元素时，需要实现`Comparable`接口或者在创建`TreeSet`时传入自定义的比较器来定义元素的排序规则。
    - **适用场景**：适合需要对元素进行排序、进行范围查找或者按照顺序遍历元素的场景，比如对学生成绩按照分数高低排序后展示等。

### 四、Map接口及实现类

- **HashMap**：
    - **数据结构**
      ：基于哈希表实现，采用数组+链表（当链表长度超过一定阈值会转化为红黑树来优化性能）的结构，通过对键进行哈希运算来确定元素在数组中的存储位置（桶位置），然后在对应的桶中进行链表或红黑树操作来处理键值对的存储和查找。
    - **特点**：
        - 提供了快速的插入、删除和查找操作，平均时间复杂度接近`O(1)`，只要哈希函数分布均匀，能很好地利用数组的随机访问特性以及链表/红黑树处理冲突的机制。例如：

```java
HashMap<String, Integer> hashMap = new HashMap<>();
hashMap.put("键1", 1);
hashMap.put("键2", 2);
System.out.println(hashMap.get("键1")); // 快速获取键对应的值
```

        - 键和值都可以为`null`，但键只能有一个`null`键，因为键需要保证唯一性。
        - 是非线程安全的，在多线程环境下并发操作可能导致数据不一致等问题，若要在多线程中使用，需要通过同步机制（如使用`Collections.synchronizedMap`包装或者使用`ConcurrentHashMap`）来保证线程安全。
    - **适用场景**：广泛应用于各种需要快速查找、存储键值对数据的场景，比如缓存系统中存储缓存数据（键为缓存的标识，值为缓存的内容）等。

- **TreeMap**：
    - **数据结构**：基于红黑树实现，会根据键的自然顺序或者自定义的比较器对键值对进行排序存储，保证遍历`TreeMap`时按照顺序输出键值对。
    - **特点**：
        - 可以按照键的顺序进行遍历、范围查询等操作，比如获取某个区间内的所有键值对。例如：

```java
TreeMap<String, Integer> treeMap = new TreeMap<>();
treeMap.put("b", 2);
treeMap.put("a", 1);
treeMap.put("c", 3);
System.out.println(treeMap.subMap("a", "c")); // 获取键在a到c之间（不包括c）的子映射
```

        - 插入、删除、查找操作的时间复杂度为`O(log n)`，性能相对稳定但比`HashMap`稍慢一点，尤其是在插入频繁且对顺序要求不高的场景下。
        - 要求键必须实现`Comparable`接口或者在创建`TreeMap`时传入自定义的比较器来定义键的排序规则，否则会抛出异常。
    - **适用场景**：适合需要对键值对按照键的顺序进行处理、进行范围查找的场景，比如对配置文件中的配置项按照名称排序后存储和读取等。

- **ConcurrentHashMap**：
    - **数据结构**：在早期版本采用分段锁机制，将整个哈希表分成多个段（Segment），每个段有独立的锁，不同段的操作可以并发进行，提高了并发性能；在Java
      8及以后，采用了更细粒度的节点锁（CAS等无锁算法配合），进一步优化了并发性能。
    - **特点**：
        - 是线程安全的，允许多个线程同时访问和操作集合，在多线程并发场景下能保证数据的一致性和高效性，避免了像使用普通
          `HashMap`时需要手动加锁带来的性能损耗。例如在多线程环境下更新键值对：

```java
ConcurrentHashMap<String, Integer> concurrentHashMap = new ConcurrentHashMap<>();
// 多个线程可以并发调用put等方法
concurrentHashMap.put("线程安全键", 1); 
```

        - 读写操作的性能在多线程环境下表现优秀，适合在高并发的缓存、共享数据存储等场景中使用。
    - **适用场景**：常用于多线程并发访问的键值对数据存储场景，如分布式系统中的本地缓存、多线程共享的配置数据存储等。

### 五、集合的遍历方式

- **使用迭代器（Iterator）**：
    - 所有实现了`Collection`接口的集合类都可以通过`iterator`方法获取迭代器对象，然后使用`hasNext`方法判断是否还有下一个元素，使用
      `next`方法获取下一个元素。示例：

```java
List<String> list = new ArrayList<>();
list.add("元素1");
list.add("元素2");
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String element = iterator.next();
    System.out.println(element);
}
```

- **增强for循环（foreach循环）**：
    - 语法简洁，适用于遍历实现了`Iterable`接口的集合类（`Collection`接口继承自`Iterable`接口），内部实际上也是通过迭代器实现的。示例：

```java
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
for (Integer num : set) {
    System.out.println(num);
}
```

- **使用`for`循环（针对`List`等有索引的集合）**：
    - 可以通过索引依次访问`List`集合中的元素，常用于需要按照索引操作元素或者知道具体索引范围的情况。示例：

```java
ArrayList<String> arrayList = new ArrayList<>();
arrayList.add("a");
arrayList.add("b");
for (int i = 0; i < arrayList.size(); i++) {
    System.out.println(arrayList.get(i));
}
```

- **遍历`Map`集合**：
    - **通过`keySet`方法获取键集合，再遍历键获取对应的值**：

```java
HashMap<String, Integer> map = new HashMap<>();
map.put("key1", 1);
map.put("key2", 2);
Set<String> keySet = map.keySet();
for (String key : keySet) {
    System.out.println(key + " : " + map.get(key));
}
```

    - **通过`entrySet`方法获取键值对集合（`Map.Entry`类型），然后遍历键值对**：

```java
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " : " + entry.getValue());
}
```

### 六、集合工具类 - Collections

- **常用方法**：
    - **`sort(List<T> list)`**：对`List`集合中的元素进行排序，可以用于实现了`Comparable`接口的元素类型，或者传入自定义的比较器进行排序。例如：

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(3);
numbers.add(1);
numbers.add(2);
Collections.sort(numbers); // 对整数列表排序
```

    - **`reverse(List<T> list)`**：反转`List`集合中元素的顺序。例如：

```java
Collections.reverse(numbers); // 反转刚才排序后的列表顺序
```

    - **`shuffle(List<T> list)`**：对`List`集合中的元素进行随机打乱。例如：

```java
Collections.shuffle(numbers); // 随机打乱列表元素顺序
```

    - **`synchronizedCollection(Collection<T> c)`**：将一个非线程安全的集合包装成线程安全的集合（通过在方法上加锁实现），返回一个同步的集合对象，不过性能上会有一定损耗，适用于需要临时在多线程环境下使用非线程安全集合的情况。例如：

```java
ArrayList<String> arrayList = new ArrayList<>();
Collection<String> synchronizedCollection = Collections.synchronizedCollection(arrayList);
```

以上就是Java集合相关的基本知识点笔记，熟练掌握这些内容可以在Java编程中灵活运用各种集合类来满足不同的数据存储和操作需求。 
