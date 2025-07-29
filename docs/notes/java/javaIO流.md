---
title: javaIO流
createTime: 2024/11/19 10:20:35
permalink: /article/wwb11vzz/
---

### 一、IO流概述

- **概念**：
  -
  在Java中，IO流用于实现程序与外部设备（如文件、网络、控制台等）之间的数据传输。可以把流想象成数据的管道，数据就像水流一样在管道中流动，通过流我们能够方便地读取外部的数据到程序中（输入流），或者将程序中的数据输出到外部（输出流）。
- **分类方式**：
    - **按流向分**：
        - **输入流（InputStream/Reader）**：用于从数据源（如文件、网络连接等）读取数据到程序中，就像是从外部把“水”引进来。例如，从文件中读取内容到内存进行处理，就是使用输入流。
        - **输出流（OutputStream/Writer）**：用于将程序中的数据输出到目标位置（如文件、网络等），如同把“水”排出去。比如把内存中的数据保存到文件，就是通过输出流来实现。
    - **按处理的数据类型分**：
        - **字节流（InputStream/OutputStream）**
          ：以字节（8位二进制数据）为单位来处理数据，适用于处理各种类型的二进制数据，比如图片、音频、视频文件以及网络协议数据包等，因为这些数据本质上都是字节序列。
        - **字符流（Reader/Writer）**
          ：以字符（通常根据特定编码，如UTF-8、GBK等，将字节转换为字符）为单位来处理数据，主要用于处理文本数据，方便对文本内容进行读写操作，并且可以按照字符编码进行正确的文本解析和转换。

### 二、字节流

- **InputStream（字节输入流抽象类）**：
    - **常用方法**：
        - **`int read()`**：从输入流中读取一个字节的数据，并返回该字节对应的整数（范围是0 - 255），如果读到流的末尾，则返回
          -1。例如：

```java
InputStream inputStream = new FileInputStream("test.txt");
int data;
while ((data = inputStream.read())!= -1) {
    System.out.print((char) data); // 将读取的字节转换为字符输出（简单示例，可能存在编码问题）
}
inputStream.close();
```

        - **`int read(byte[] b)`**：从输入流中读取最多`b.length`个字节的数据到字节数组`b`中，并返回实际读取的字节数，如果读到流的末尾，返回 -1。示例：

```java
byte[] buffer = new byte[1024];
int len;
while ((len = inputStream.read(buffer))!= -1) {
    // 可以对读取到字节数组中的数据进行进一步处理，比如写入到另一个流或者解析等
}
```

    - **重要子类**：
        - **`FileInputStream`**：用于从文件中读取字节数据，构造函数接收文件路径或文件对象作为参数。例如：

```java
FileInputStream fileInputStream = new FileInputStream("example.jpg"); // 读取图片文件
```

        - **`ByteArrayInputStream`**：可以将字节数组当作数据源来创建输入流，常用于在内存中对字节数据进行读取操作，比如对已经在内存中的网络数据包进行解析等情况。示例：

```java
byte[] byteArray = { 1, 2, 3 };
ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(byteArray);
```

- **OutputStream（字节输出流抽象类）**：
    - **常用方法**：
        - **`void write(int b)`**：将指定的字节（参数`b`的低8位）写入到输出流中。例如：

```java
OutputStream outputStream = new FileOutputStream("output.txt");
outputStream.write(65); // 写入字符'A'对应的ASCII码值65
outputStream.close();
```

        - **`void write(byte[] b)`**：将字节数组`b`中的所有字节写入到输出流中。示例：

```java
byte[] data = "Hello".getBytes(); // 将字符串转换为字节数组
OutputStream outputStream = new FileOutputStream("hello.txt");
outputStream.write(data);
outputStream.close();
```

        - **`void write(byte[] b, int off, int len)`**：将字节数组`b`中从偏移量`off`开始的`len`个字节写入到输出流中，更灵活地控制写入的数据范围。例如：

```java
byte[] data = "Hello World".getBytes();
OutputStream outputStream = new FileOutputStream("partial.txt");
outputStream.write(data, 0, 5); // 只写入"Hello"
outputStream.close();
```

    - **重要子类**：
        - **`FileOutputStream`**：用于将字节数据写入到文件中，构造函数可以指定文件路径、文件对象以及是否追加写入等模式（第二个参数为`true`表示追加模式）。例如：

```java
FileOutputStream fileOutputStream = new FileOutputStream("log.txt", true); // 追加模式写入日志文件
```

        - **`ByteArrayOutputStream`**：可以将写入的数据暂存到字节数组中，常用于在内存中构建字节数据，后续可以方便地获取这个字节数组进行其他操作，比如将多个部分的数据先写到这个流中，最后统一处理字节数组。示例：

```java
ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
byteArrayOutputStream.write("Part1".getBytes());
byteArrayOutputStream.write("Part2".getBytes());
byte[] result = byteArrayOutputStream.toByteArray(); // 获取最终的字节数组
```

### 三、字符流

- **Reader（字符输入流抽象类）**：
    - **常用方法**：
        - **`int read()`**：从输入流中读取一个字符的数据，并返回该字符对应的整数（按照字符编码转换后的整数值），如果读到流的末尾，则返回
          -1。例如：

```java
Reader reader = new FileReader("text.txt");
int data;
while ((data = reader.read())!= -1) {
    System.out.print((char) data);
}
reader.close();
```

        - **`int read(char[] cbuf)`**：从输入流中读取最多`cbuf.length`个字符的数据到字符数组`cbuf`中，并返回实际读取的字符数，如果读到流的末尾，返回 -1。示例：

```java
char[] buffer = new char[1024];
int len;
while ((len = reader.read(buffer))!= -1) {
    // 对读取到字符数组中的数据进行处理，如拼接字符串等
}
```

    - **重要子类**：
        - **`FileReader`**：用于从文本文件中读取字符数据，构造函数接收文件路径或文件对象作为参数，不过它使用的是默认的字符编码（通常是系统默认编码，可能存在编码不一致问题，更推荐使用`InputStreamReader`来指定编码）。例如：

```java
FileReader fileReader = new FileReader("article.txt");
```

        - **`InputStreamReader`**：可以将字节输入流转换为字符输入流，并且可以指定字符编码，常用于处理文本文件时明确指定编码格式，避免乱码。示例：

```java
InputStream inputStream = new FileInputStream("utf8_text.txt");
Reader reader = new InputStreamReader(inputStream, "UTF-8");
```

- **Writer（字符输出流抽象类）**：
    - **常用方法**：
        - **`void write(int c)`**：将指定的字符（参数`c`对应的字符）写入到输出流中。例如：

```java
Writer writer = new FileWriter("output.txt");
writer.write('A');
writer.close();
```

        - **`void write(char[] cbuf)`**：将字符数组`cbuf`中的所有字符写入到输出流中。示例：

```java
char[] data = "你好".toCharArray();
Writer writer = new FileWriter("chinese.txt");
writer.write(data);
writer.close();
```

        - **`void write(String str)`**：将字符串`str`中的所有字符写入到输出流中，方便直接写入文本内容。例如：

```java
Writer writer = new FileWriter("message.txt");
writer.write("这是一条消息");
writer.close();
```

        - **`void write(char[] cbuf, int off, int len)`**：将字符数组`cbuf`中从偏移量`off`开始的`len`个字符写入到输出流中，控制写入的字符范围。例如：

```java
char[] data = "Hello World".toCharArray();
Writer writer = new FileWriter("partial.txt");
writer.write(data, 0, 5); // 写入"Hello"
writer.close();
```

    - **重要子类**：
        - **`FileWriter`**：用于将字符数据写入到文本文件中，构造函数可以指定文件路径、文件对象以及是否追加写入等模式，和`FileOutputStream`类似，但处理的是字符数据，同样可能存在默认编码问题，更推荐配合`OutputStreamWriter`来指定编码使用。例如：

```java
FileWriter fileWriter = new FileWriter("diary.txt");
```

        - **`OutputStreamWriter`**：可以将字节输出流转换为字符输出流，并指定字符编码，常用于在将字符数据写入文件等操作时确保正确的编码格式，避免乱码。例如：

```java
OutputStream outputStream = new FileOutputStream("utf8_output.txt");
Writer writer = new OutputStreamWriter(outputStream, "UTF-8");
```

### 四、缓冲流（Buffered流）

- **概念**
  ：缓冲流是在基本的字节流或字符流基础上增加了缓冲功能的流。它内部有一个缓冲区（字节数组或字符数组），在读写数据时，先将数据读入缓冲区或者从缓冲区写入目标位置，减少了直接与底层数据源（如硬盘等）的交互次数，从而提高读写效率，特别是对于大量数据的读写场景效果明显。
- **BufferedInputStream和BufferedOutputStream（字节缓冲流）**：
    - **使用示例**：

```java
FileInputStream fileInputStream = new FileInputStream("large_file.bin");
BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);

FileOutputStream fileOutputStream = new FileOutputStream("copied_file.bin");
BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(fileOutputStream);

int data;
while ((data = bufferedInputStream.read())!= -1) {
    bufferedOutputStream.write(data);
}

bufferedInputStream.close();
bufferedOutputStream.close();
```

- **BufferedReader和BufferedWriter（字符缓冲流）**：
    - **特点及使用示例**：
        - `BufferedReader`除了有缓冲功能外，还提供了`readLine`方法，可以方便地按行读取文本内容，常用于读取文本文件，一行一行地处理数据，比如解析日志文件等。示例：

```java
FileReader fileReader = new FileReader("log.txt");
BufferedReader bufferedReader = new BufferedReader(fileReader);

String line;
while ((line = bufferedReader.readLine())!= -1) {
    System.out.println(line);
}

bufferedReader.close();
```

        - `BufferedWriter`在写入数据时，会先将数据放入缓冲区，并且提供了`newLine`方法，可以按照系统相关的换行符格式来写入换行，方便生成规范的文本文件。例如：

```java
FileWriter fileWriter = new FileWriter("output.txt");
BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);

bufferedWriter.write("第一行");
bufferedWriter.newLine();
bufferedWriter.write("第二行");

bufferedWriter.close();
```

### 五、对象流（Object流）

- **ObjectInputStream和ObjectOutputStream**：
    - **功能及用途**
      ：对象流用于实现对象的序列化和反序列化操作。序列化是指将对象转换为字节序列的过程，这样可以方便地将对象存储到文件中、通过网络传输等；反序列化则是将字节序列重新恢复为对象的过程。例如在分布式系统中，需要将对象在不同节点之间传递，或者保存对象的状态到磁盘以便后续恢复时，就会用到对象流。
    - **使用示例**：
        - **序列化对象**：

```java
class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 省略Getter和Setter方法
}

Person person = new Person("张三", 25);
FileOutputStream fileOutputStream = new FileOutputStream("person.obj");
ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
objectOutputStream.writeObject(person);
objectOutputStream.close();
```

        - **反序列化对象**：

```java
FileInputStream fileInputStream = new FileInputStream("person.obj");
ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);
Person deserializedPerson = (Person) objectInputStream.readObject();
System.out.println(deserializedPerson.getName() + " " + deserializedPerson.getAge());
objectInputStream.close();
```

    - **注意事项**：
        - 要进行序列化的类必须实现`java.io.Serializable`接口，这是一个标记接口，没有方法需要实现，但表示该类的对象可以被序列化。
        - 如果类中的成员变量不想被序列化（比如一些敏感信息或者临时状态变量），可以使用`transient`关键字修饰该变量，在序列化时这些变量的值不会被保存，反序列化后这些变量会被赋予默认值（如基本类型为0，引用类型为`null`等）。

### 六、其他常用流

- **DataInputStream和DataOutputStream**：
    - **特点及用途**：用于按照基本数据类型（如`int`、`double`、`boolean`
      等）来读写数据，可以方便地将各种基本数据类型的数据写入到流中或者从流中读取出来，常用于处理一些有特定格式要求的数据文件或者网络协议中对数据的封装和解析。例如在保存游戏进度数据时，可能需要将玩家的得分（
      `int`类型）、生命值（`double`类型）等不同类型的数据依次写入到文件中，后续再读取出来恢复游戏状态。
    - **使用示例**：

```java
FileOutputStream fileOutputStream = new FileOutputStream("game_data.dat");
DataOutputStream dataOutputStream = new DataOutputStream(fileOutputStream);

dataOutputStream.writeInt(100); // 写入玩家得分
dataOutputStream.writeDouble(80.5); // 写入玩家生命值
dataOutputStream.writeBoolean(true); // 写入游戏是否通关状态

dataOutputStream.close();

FileInputStream fileInputStream = new FileInputStream("game_data.dat");
DataInputStream dataInputStream = new DataInputStream(fileInputStream);

int score = dataInputStream.readInt();
double health = dataInputStream.readDouble();
boolean isCleared = dataInputStream.readBoolean();

System.out.println("得分：" + score + "，生命值：" + health + "，是否通关：" + isCleared);

dataInputStream.close();
```

- **PrintStream和PrintWriter**：
    - **特点及用途**：主要用于方便地输出格式化的文本数据，它们提供了很多重载的`print`和`println`
      方法，可以直接输出各种类型的数据（如字符串、整数、浮点数等），并且会自动按照合适的格式进行转换，常用于向控制台输出信息或者将格式化的文本写入到文件中。例如在调试程序时，将一些变量的值输出到控制台查看，或者生成格式化的报表文件等场景。
    - **使用示例**：

```java
PrintStream printStream = System.out; // 向控制台输出
printStream.println("这是一条消息");

FileWriter fileWriter = new FileWriter("report.txt");
PrintWriter printWriter = new PrintWriter(fileWriter);
printWriter.println("姓名：张三");
printWriter.println("年龄：25");
printWriter.close();
```

### 七、IO流的关闭

- **为什么要关闭流**：
  -
  流对象在使用过程中会占用系统资源（如文件描述符、网络连接等），如果不及时关闭，可能会导致资源泄露，长期运行的程序可能会出现性能问题甚至耗尽系统资源无法正常运行。而且对于一些输出流，如果不关闭，可能导致数据没有完全写入到目标位置（因为部分流有缓冲区，关闭流时会自动刷新缓冲区将数据写入）。
- **关闭流的正确方式**：
    - 一般采用`try-catch-finally`语句块来确保流能正确关闭，将流的关闭操作放在`finally`块中，无论是否发生异常，都能保证流被关闭。示例：

```java
InputStream inputStream = null;
try {
    inputStream = new FileInputStream("test.txt");
    // 进行读操作
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (inputStream!= null) {
        try {
            inputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

    - 从Java 7开始，引入了`try-with-resources`语句，它可以自动关闭实现了`AutoCloseable`接口的资源（流类都实现了这个接口），代码更加简洁且能保证资源正确关闭，示例：

```java
try (InputStream inputStream = new FileInputStream("test.txt")) {
    // 进行读操作
} catch (IOException e) {
    e.printStackTrace();
}
```

以上就是Java中IO流相关的核心知识点笔记，熟练掌握这些内容可以在Java编程中灵活处理各种输入输出操作，实现与外部设备的数据交互。 
