---
tags:
  - Java
  - 基础语法
  - IO流
title: javaIO流
createTime: 2024/11/19 10:20:35
permalink: /java/基础语法/skjb3m98/
---

## I/O基础概念

Java I/O（输入/输出）是Java中用于处理数据输入和输出的API。它允许程序从各种源读取数据并向各种目标写入数据，包括文件、网络连接、内存缓冲区等。

Java I/O主要分为两种类型：

1. **字节流（Byte Streams）**：处理原始二进制数据，以字节为单位进行读写
2. **字符流（Character Streams）**：处理字符数据，自动处理字符编码转换

Java IIO还分为两个主要版本：

1. **传统I/O**：基于流（Stream）的I/O操作
2. **NIO.2**：New I/O，提供了更现代的I/O操作方式

## File类

File 类是Java中表示文件和目录路径名的抽象表示形式，它不直接处理文件内容，而是处理文件系统中的文件和目录。

```java
// 创建File对象
File file = new File("test.txt");

// 文件操作
if (file.createNewFile()) {
    System.out.println("创建文件: " + file.getName());
}

// 获取文件信息
System.out.println("文件路径: " + file.getAbsolutePath());
System.out.println("文件大小: " + file.length() + " 字节");

// 删除文件
if (file.delete()) {
    System.out.println("删除文件: " + file.getName());
}
```

## 字节流

字节流用于处理原始二进制数据，以字节为单位进行读写。主要的字节流类包括：

- FileInputStream
  ：从文件中读取字节
- FileOutputStream
  ：向文件中写入字节

```java
// 使用FileOutputStream写入数据
try (FileOutputStream fos = new FileOutputStream("byte_data.txt")) {
    String data = "Hello, 字节流!";
    byte[] bytes = data.getBytes();
    fos.write(bytes);
}

// 使用FileInputStream读取数据
try (FileInputStream fis = new FileInputStream("byte_data.txt")) {
    int content;
    while ((content = fis.read()) != -1) {
        System.out.print((char) content);
    }
}
```

## 字符流

字符流用于处理字符数据，自动处理字符编码转换。主要的字符流类包括：

- FileReader
  ：从文件中读取字符
- FileWriter
  ：向文件中写入字符

```java
// 使用FileWriter写入数据
try (FileWriter writer = new FileWriter("char_data.txt")) {
    String data = "Hello, 字符流!\n欢迎学习Java I/O!";
    writer.write(data);
}

// 使用FileReader读取数据
try (FileReader reader = new FileReader("char_data.txt")) {
    int content;
    while ((content = reader.read()) != -1) {
        System.out.print((char) content);
    }
}
```

## 缓冲流

缓冲流通过在内存中创建缓冲区来提高I/O操作的效率，减少实际的读写操作次数。

```java
// 使用BufferedWriter写入数据
try (BufferedWriter writer = new BufferedWriter(new FileWriter("buffered_data.txt"))) {
    writer.write("第一行数据");
    writer.newLine();
    writer.write("第二行数据");
}

// 使用BufferedReader读取数据
try (BufferedReader reader = new BufferedReader(new FileReader("buffered_data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

## 2文件操作

NIO.2（New I/O 2）是Java 7引入的新一代文件I/O API，提供了更现代、更便捷的文件操作方式。

```java
// Path接口表示文件路径
Path path = Paths.get("nio_data.txt");

// 创建文件
if (!Files.exists(path)) {
    Files.createFile(path);
}

// 写入数据
String data = "Hello, NIO.2!";
Files.write(path, data.getBytes());

// 读取所有行
List<String> lines = Files.readAllLines(path);

// 删除文件
Files.delete(path);
```

## try-with-resources语句

在I/O操作中，资源管理非常重要。Java 7引入的try-with-resources语句可以自动关闭资源：

```java
try (FileInputStream fis = new FileInputStream("test.txt")) {
    // 使用资源
    int data = fis.read();
} // 资源会自动关闭，即使发生异常也会关闭
catch (IOException e) {
    // 处理异常
}
```

## 序列化

序列化是将对象转换为字节流的过程，反序列化是将字节流转换回对象的过程。

```java
// 序列化对象
try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("object.ser"))) {
    Person person = new Person("张三", 25);
    oos.writeObject(person);
}

// 反序列化对象
try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("object.ser"))) {
    Person person = (Person) ois.readObject();
}
```

要使类可序列化，需要实现Serializable
接口：

```java
public class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;
    
    // 构造方法、getter和setter省略
}
```

## I/O最佳实践

1. **使用try-with-resources**：确保资源正确关闭
2. **选择合适的流类型**：处理文本数据使用字符流，处理二进制数据使用字节流
3. **使用缓冲流**：提高I/O操作效率
4. **注意字符编码**：在处理文本时明确指定字符编码
5. **处理异常**：妥善处理I/O异常
6. **使用NIO.2**：对于新项目，优先考虑使用NIO.2 API

