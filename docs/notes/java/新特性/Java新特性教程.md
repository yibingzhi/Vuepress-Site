# Java新特性教程

本文档配合`com.ibz.javafeatures`包中的Java文件，详细介绍从Java 8到Java 21的重要新特性。

## Java 8新特性

Java 8是Java历史上最重要的版本之一，引入了许多革命性的特性。

### Lambda表达式

Lambda表达式是Java 8中最受期待的特性之一，它允许我们将函数作为参数传递给方法，或者将代码作为数据处理。

传统方式：
```java
Comparator<String> comparator = new Comparator<String>() {
    @Override
    public int compare(String s1, String s2) {
        return s1.compareTo(s2);
    }
};
```

Lambda表达式方式：
```java
Comparator<String> comparator = (s1, s2) -> s1.compareTo(s2);
```

Lambda表达式的语法：
- `(parameters) -> expression`
- `(parameters) -> { statements; }`

### Stream API

Stream API提供了一种高效且易于使用的处理数据的方式，支持函数式编程操作。

```java
List<String> names = Arrays.asList("张三", "李四", "王五", "赵六");

// 过滤
List<String> filtered = names.stream()
    .filter(name -> name.startsWith("张"))
    .collect(Collectors.toList());

// 映射
List<Integer> nameLengths = names.stream()
    .map(String::length)
    .collect(Collectors.toList());

// 排序
List<String> sorted = names.stream()
    .sorted()
    .collect(Collectors.toList());
```

### 新的日期时间API

Java 8引入了全新的日期时间API，解决了旧API的线程安全性和易用性问题。

```java
// LocalDate - 日期
LocalDate today = LocalDate.now();
LocalDate specificDate = LocalDate.of(2025, 1, 1);

// LocalTime - 时间
LocalTime now = LocalTime.now();

// LocalDateTime - 日期时间
LocalDateTime dateTime = LocalDateTime.now();

// 格式化
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formatted = dateTime.format(formatter);
```

### Optional类

Optional类是一个容器对象，它可能包含或不包含非null值，用于避免空指针异常。

```java
Optional<String> optional = Optional.of("Hello");
String value = optional.orElse("默认值");

// 安全处理可能为空的值
optional.ifPresent(s -> System.out.println("值存在: " + s));
```

### 函数式接口

Java 8引入了几个重要的函数式接口：

1. **Predicate<T>** - 接受一个参数并返回boolean
2. **Function<T, R>** - 接受一个参数并返回结果
3. **Consumer<T>** - 接受一个参数但不返回结果
4. **Supplier<T>** - 不接受参数但返回结果

```java
Predicate<Integer> isEven = n -> n % 2 == 0;
Function<String, Integer> stringToLength = s -> s.length();
Consumer<String> printer = s -> System.out.println(s);
Supplier<Double> randomSupplier = () -> Math.random();
```

### 方法引用

方法引用提供了另一种简洁的方式来引用已有方法或构造器。

```java
// 静态方法引用
names.forEach(System.out::println);

// 实例方法引用
names.sort(String::compareToIgnoreCase);

// 构造方法引用
Supplier<List<String>> listSupplier = ArrayList::new;
```

## Java 9-11新特性

### 集合工厂方法 (Java 9)

Java 9引入了方便的集合工厂方法，用于创建不可变集合。

```java
// 创建不可变List
List<String> list = List.of("张三", "李四", "王五");

// 创建不可变Set
Set<String> set = Set.of("苹果", "香蕉", "橙子");

// 创建不可变Map
Map<String, Integer> map = Map.of(
    "张三", 25,
    "李四", 30,
    "王五", 28
);
```

### Stream API增强 (Java 9)

Java 9为Stream API添加了几个新方法：

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// takeWhile - 从头开始获取满足条件的元素
List<Integer> taken = numbers.stream()
    .takeWhile(n -> n < 5)
    .collect(Collectors.toList());

// dropWhile - 跳过满足条件的元素
List<Integer> dropped = numbers.stream()
    .dropWhile(n -> n < 5)
    .collect(Collectors.toList());
```

### String增强 (Java 11)

Java 11为String类添加了几个实用方法：

```java
String blankString = "   ";
// 检查是否为空白
boolean isBlank = blankString.isBlank();

// 去除首尾空白字符
String stripped = "  Hello World  ".strip();

// 按行分割
String multiLine = "第一行\n第二行\n第三行";
multiLine.lines().forEach(System.out::println);
```

## Java 12-17新特性

### Switch表达式 (Java 12-14)

Switch表达式简化了switch语句的使用：

```java
// 传统switch
String dayType;
switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY:
        dayType = "工作日";
        break;
    case SATURDAY, SUNDAY:
        dayType = "周末";
        break;
}

// Switch表达式 (Java 14)
/*
String dayType = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "工作日";
    case SATURDAY, SUNDAY -> "周末";
};
*/
```

### 文本块 (Java 13-15)

文本块简化了多行字符串的处理：

```java
// 传统方式
String json = "{\n" +
              "  \"name\": \"张三\",\n" +
              "  \"age\": 25\n" +
              "}";

// 文本块 (Java 15)
/*
String json = """
              {
                "name": "张三",
                "age": 25
              }
              """;
*/
```

### Record类 (Java 14-16)

Record类提供了一种简洁的方式来创建不可变的数据载体类：

```java
// Record类自动提供构造函数、getter方法、equals、hashCode和toString
record Person(String name, int age) {
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数");
        }
    }
}

// 使用
Person person = new Person("张三", 25);
String name = person.name(); // 自动生成的getter方法
int age = person.age();
```

### Sealed类 (Java 15-17)

Sealed类允许控制哪些类可以继承或实现它们：

```java
// Sealed类只能被指定的类继承
/*
sealed abstract class Shape permits Circle, Rectangle {
    public abstract double area();
}

final class Circle extends Shape {
    private final double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}
*/
```

## Java 18-21新特性

### 简单Web服务器 (Java 18)

Java 18引入了一个简单的Web服务器工具：

```bash
# 启动简单的Web服务器
jwebserver -p 8080 -b localhost
```

### 虚拟线程 (Java 21)

虚拟线程是Java 21的旗舰特性，极大地简化了并发编程：

```java
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<String> future = executor.submit(() -> {
        // 执行任务
        return "任务完成";
    });
    
    String result = future.get();
}
```

### 结构化并发 (Java 21)

结构化并发确保一组相关任务作为一个单元执行：

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // 启动多个子任务
    StructuredTaskScope.Subtask<String> task1 = scope.fork(() -> {
        // 任务1
        return "任务1完成";
    });
    
    StructuredTaskScope.Subtask<String> task2 = scope.fork(() -> {
        // 任务2
        return "任务2完成";
    });
    
    // 等待所有任务完成
    scope.join();
    scope.throwIfFailed();
}
```

### Record模式 (Java 21)

Record模式允许在instanceof和switch中直接解构Record：

```java
// Record模式
/*
if (person instanceof Person(String name, int age)) {
    System.out.println("姓名: " + name + ", 年龄: " + age);
}

// 在switch中使用Record模式
String result = switch (person) {
    case Person(String name, int age) when age >= 18 -> name + "是成年人";
    case Person(String name, int age) -> name + "是未成年人";
    default -> "未知";
};
*/
```

### Switch模式匹配 (Java 21)

Switch模式匹配增强了switch表达式，支持类型模式匹配：

```java
/*
String result = switch (obj) {
    case String s -> "字符串: " + s.toUpperCase();
    case Integer i -> "整数: " + (i * 2);
    case null -> "空值";
    default -> "未知类型";
};
*/
```

## 包结构说明

为了更好地组织代码，我们将Java新特性相关的类放在`com.ibz.javafeatures`包中：

```
src/main/java/com/ibz/javafeatures/
├── Java8Features.java          // Java 8新特性演示
├── Java9To17Features.java      // Java 9-17新特性演示
└── Java18To21Features.java     // Java 18-21新特性演示
```

## 运行示例

要运行Java新特性示例，使用以下命令：

```bash
# 运行Java 8特性示例
mvn exec:java -Dexec.mainClass="com.ibz.javafeatures.Java8Features"

# 运行Java 9-17特性示例
mvn exec:java -Dexec.mainClass="com.ibz.javafeatures.Java9To17Features"

# 运行Java 18-21特性示例
mvn exec:java -Dexec.mainClass="com.ibz.javafeatures.Java18To21Features"
```

## 总结

从Java 8到Java 21，Java语言持续演进，引入了许多重要的新特性：

1. **Java 8**：Lambda表达式、Stream API、新的日期时间API、Optional类
2. **Java 9-11**：集合工厂方法、String增强、HTTP Client
3. **Java 12-17**：Switch表达式、文本块、Record类、Sealed类
4. **Java 18-21**：简单Web服务器、虚拟线程、结构化并发、模式匹配

这些新特性极大地提升了Java语言的表达能力和开发效率，使得Java能够更好地适应现代软件开发的需求。掌握这些新特性对于Java开发者来说至关重要。

在实际开发中，应根据项目需求和JDK版本选择合适的新特性，以提升代码质量和开发效率。