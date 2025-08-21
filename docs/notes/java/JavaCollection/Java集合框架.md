---
tags:
  - Java
  - 集合框架
  - Collection
title: Java集合框架
createTime: 2025/04/19 18:46:37
permalink: /java/r43t7mc5/
---

本文档配合`com.ibz.collection`包中的Java文件，详细介绍Java集合框架的概念、主要接口及其实现类的使用方法。

## 概述

Java集合框架是Java编程语言中用来表示和操作集合的统一架构。所有的集合框架都包含以下内容：

1. **接口**：定义了集合的抽象数据类型
2. **实现类**：提供了接口的具体实现
3. **算法**：实现了集合操作的静态方法

集合框架的主要优势：

- 减少编程工作量
- 提高程序速度和质量
- 允许无关API之间的互操作
- 提供了丰富的数据结构实现

## 集合框架体系结构

Java集合框架主要由以下几个接口构成：

- **Collection**：集合层次结构的根接口
    - **List**：有序集合，允许重复元素
    - **Set**：不允许重复元素的集合
    - **Queue**：队列接口
- **Map**：存储键值对的集合

## List接口及实现类

List是有序集合，允许重复元素，可以通过索引访问元素。

### ArrayList

基于动态数组实现，适合随机访问，查询效率高，插入删除效率低。

```java
List<String> arrayList = new ArrayList<>();
arrayList.add("苹果");
arrayList.add("香蕉");
System.out.println("列表内容: " + arrayList);
System.out.println("第一个元素: " + arrayList.get(0));
```

### LinkedList

基于双向链表实现，适合频繁插入删除操作，查询效率低，插入删除效率高。

```java
List<String> linkedList = new LinkedList<>();
linkedList.add("A");
linkedList.add("B");
((LinkedList<String>) linkedList).addFirst("开始"); // 特有方法
System.out.println("链表内容: " + linkedList);
```

### Vector

线程安全的动态数组，与ArrayList类似但性能较低，现在很少使用。

## Set接口及实现类

Set是不允许重复元素的集合，最多包含一个null元素。

### HashSet

基于哈希表实现，无序，允许null元素，查询、插入、删除效率高。

```java
Set<String> hashSet = new HashSet<>();
hashSet.add("Java");
hashSet.add("Python");
hashSet.add("Java"); // 重复元素不会被添加
System.out.println("HashSet内容: " + hashSet);
```

### TreeSet

基于红黑树实现，元素自然排序或自定义排序，不允许null元素。

```java
Set<String> treeSet = new TreeSet<>();
treeSet.add("Banana");
treeSet.add("Apple");
System.out.println("TreeSet内容: " + treeSet); // 自动排序
```

### LinkedHashSet

基于哈希表和链表实现，保持插入顺序，允许null元素。

## Map接口及实现类

Map存储键值对，键不允许重复，每个键最多映射到一个值。

### HashMap

基于哈希表实现，无序，允许null键和null值，查询、插入、删除效率高。

```java
Map<String, Integer> hashMap = new HashMap<>();
hashMap.put("苹果", 5);
hashMap.put("苹果", 10); // 重复的键会覆盖原有值
System.out.println("苹果的数量: " + hashMap.get("苹果"));
```

### TreeMap

基于红黑树实现，按键排序，不允许null键，允许null值。

```java
Map<String, Integer> treeMap = new TreeMap<>();
treeMap.put("C", 3);
treeMap.put("A", 1);
System.out.println("TreeMap内容: " + treeMap); // 按键自动排序
```

### LinkedHashMap

基于哈希表和链表实现，保持插入顺序，允许null键和null值。

### Hashtable

线程安全的哈希表，不允许null键和null值，现在很少使用。

## Collections工具类

Collections是操作集合的工具类，提供了大量静态方法。

### 排序操作

```java
List<Integer> numbers = new ArrayList<>();
// ... 添加元素
Collections.sort(numbers); // 升序排序
Collections.reverse(numbers); // 反转列表
```

### 查找操作

```java
Integer max = Collections.max(numbers); // 查找最大值
Integer min = Collections.min(numbers); // 查找最小值
```

### 其他操作

```java
Collections.shuffle(numbers); // 打乱列表
Collections.fill(list, "默认值"); // 填充列表
Collections.copy(dest, src); // 复制列表
```

## 集合遍历方式

Java提供了多种遍历集合的方式：

### 1. 增强for循环（for-each）

```java
List<String> fruits = Arrays.asList("苹果", "香蕉", "橙子");
for (String fruit : fruits) {
    System.out.print(fruit + " ");
}
```

### 2. Iterator迭代器

```java
Iterator<String> iterator = fruits.iterator();
while (iterator.hasNext()) {
    System.out.print(iterator.next() + " ");
}
```

### 3. forEach方法（Java 8+）

```java
fruits.forEach(fruit -> System.out.print(fruit + " "));
```

### 4. 方法引用（Java 8+）

```java
fruits.forEach(System.out::print);
```

### 5. 传统的for循环

```java
for (int i = 0; i < fruits.size(); i++) {
    System.out.print(fruits.get(i) + " ");
}
```

## 集合选择指南

### 何时使用List

- 需要按索引访问元素
- 允许重复元素
- 需要维护元素的插入顺序

**选择建议**：

- 频繁随机访问：使用ArrayList
- 频繁插入删除：使用LinkedList

### 何时使用Set

- 不允许重复元素
- 只关心元素是否存在

**选择建议**：

- 无序且允许null：使用HashSet
- 有序：使用TreeSet
- 保持插入顺序：使用LinkedHashSet

### 何时使用Map

- 需要存储键值对
- 通过键快速查找值

**选择建议**：

- 无序：使用HashMap
- 按键排序：使用TreeMap
- 保持插入顺序：使用LinkedHashMap

## 总结

Java集合框架提供了丰富的数据结构和算法实现，掌握它们对Java开发至关重要：

1. **List**：有序集合，允许重复元素，适合需要按索引访问的场景
2. **Set**：不允许重复元素的集合，适合去重和成员检查
3. **Map**：键值对集合，适合通过键快速查找值
4. **Collections工具类**：提供了丰富的集合操作方法
5. **遍历方式**：根据需求选择合适的遍历方式
