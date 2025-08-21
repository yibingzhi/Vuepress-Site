---
tags:
  - Java
  - 基础语法
  - 综合语法
title: java综合语法
createTime: 2024/11/16 21:10:31
permalink: /java/基础语法/olc7s5e9/
---
Java是一种面向对象的编程语言，具有"一次编写，到处运行"的特性。每个Java程序都需要有一个入口点，即`main`方法。

```java
public static void main(String[] args) {
    // 程序从这里开始执行
}
```

## 基本数据类型

Java语言提供了8种基本数据类型，分为四类：

### 整数类型

- `byte`: 8位有符号整数，范围从-128到127
- `short`: 16位有符号整数，范围从-32,768到32,767
- `int`: 32位有符号整数，是最常用的整数类型
- `long`: 64位有符号整数，用于表示大整数，字面值需要加`L`后缀

```java
byte byteVar = 127;
short shortVar = 32767;
int intVar = 2147483647;
long longVar = 9223372036854775807L;
```

### 浮点类型

- `float`: 32位单精度浮点数，字面值需要加`f`后缀
- `double`: 64位双精度浮点数，是默认的浮点数类型

```java
float floatVar = 3.14f;
double doubleVar = 3.14159265359;
```

### 字符类型

- `char`: 16位Unicode字符，用于表示单个字符，值用单引号包围

```java
char charVar = 'A';
```

### 布尔类型

- `boolean`: 表示逻辑值，只能是`true`或`false`

```java
boolean booleanVar = true;
```

### 包装类型

Java为每种基本数据类型提供了对应的包装类，如`Integer`对应`int`，`Double`对应`double`等。包装类提供了更多的方法和功能。

```java
Integer integerWrapper = 100;
Double doubleWrapper = 3.1415;
Boolean booleanWrapper = false;
```

## 运算符

Java提供了丰富的运算符来执行各种操作。

### 算术运算符

用于执行基本的数学运算：

- `+` 加法
- `-` 减法
- `*` 乘法
- `/` 除法
- `%` 取模（求余数）

```java
int a = 10;
int b = 3;
System.out.println(a + b);  // 13
System.out.println(a - b);  // 7
System.out.println(a * b);  // 30
System.out.println(a / b);  // 3 (整数除法)
System.out.println(a % b);  // 1
```

### 自增自减运算符

- `++` 自增运算符
- `--` 自减运算符

它们可以放在变量前面（前缀）或后面（后缀），区别在于：

- 前缀形式先自增/自减，再使用值
- 后缀形式先使用值，再自增/自减

```java
int c = 5;
System.out.println(c++);  // 输出5，然后c变为6
System.out.println(++c);  // c先变为7，然后输出7
```

### 比较运算符

用于比较两个值的关系，结果为布尔值：

- `>` 大于
- `<` 小于
- `>=` 大于等于
- `<=` 小于等于
- `==` 等于
- `!=` 不等于

```java
int a = 10;
int b = 3;
System.out.println(a > b);   // true
System.out.println(a == b);  // false
```

### 逻辑运算符

用于组合多个布尔表达式：

- `&&` 逻辑与（短路与）
- `||` 逻辑或（短路或）
- `!` 逻辑非

```java
boolean x = true;
boolean y = false;
System.out.println(x && y);  // false
System.out.println(x || y);  // true
System.out.println(!x);      // false
```

## 控制结构

控制结构用于控制程序的执行流程。

### 条件语句

#### if-else语句

根据条件的真假执行不同的代码块：

```java
int score = 85;
if (score >= 90) {
    System.out.println("成绩等级: 优秀");
} else if (score >= 80) {
    System.out.println("成绩等级: 良好");
} else {
    System.out.println("成绩等级: 及格");
}
```

#### switch语句

根据变量的值选择执行不同的分支：

```java
int day = 3;
switch (day) {
    case 1:
        System.out.println("星期一");
        break;
    case 2:
        System.out.println("星期二");
        break;
    case 3:
        System.out.println("星期三");
        break;
    default:
        System.out.println("无效的星期数");
}
```

### 循环语句

#### for循环

适用于已知循环次数的情况：

```java
for (int i = 1; i <= 5; i++) {
    System.out.print(i + " ");
}
// 输出: 1 2 3 4 5
```

#### while循环

在条件为真时重复执行代码块：

```java
int j = 1;
while (j <= 5) {
    System.out.print(j + " ");
    j++;
}
// 输出: 1 2 3 4 5
```

#### do-while循环

至少执行一次循环体，然后在条件为真时继续执行：

```java
int k = 1;
do {
    System.out.print(k + " ");
    k++;
} while (k <= 5);
// 输出: 1 2 3 4 5
```

## 数组

数组是存储相同类型元素的容器。

### 一维数组

#### 声明和初始化

有两种方式初始化数组：

```java
// 声明并直接初始化
int[] numbers = {1, 2, 3, 4, 5};

// 声明指定大小的数组，然后逐个赋值
String[] names = new String[3];
names[0] = "张三";
names[1] = "李四";
names[2] = "王五";
```

#### 遍历数组

有两种方式遍历数组：

```java
// 使用索引遍历
for (int i = 0; i < numbers.length; i++) {
    System.out.print(numbers[i] + " ");
}

// 使用增强for循环（for-each）
for (String name : names) {
    System.out.print(name + " ");
}
```

### 二维数组

二维数组可以看作是"数组的数组"：

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// 遍历二维数组
for (int i = 0; i < matrix.length; i++) {
    for (int l = 0; l < matrix[i].length; l++) {
        System.out.print(matrix[i][l] + " ");
    }
    System.out.println();
}
```

## 方法

方法是执行特定任务的代码块，有助于代码重用和模块化。

### 方法的定义

方法由修饰符、返回类型、方法名、参数列表和方法体组成：

```java
修饰符 返回类型 方法名(参数列表) {
    方法体
}
```

### 方法的类型

#### 无参无返回值方法

```java
private static void greet() {
    System.out.println("你好，世界！");
}
```

#### 有参无返回值方法

```java
private static void greetPerson(String name) {
    System.out.println("你好，" + name + "！");
}
```

#### 有参有返回值方法

```java
private static int add(int a, int b) {
    return a + b;
}
```

#### 可变参数方法

使用`...`表示可变参数，可以传入0个或多个参数：

```java
private static int sumAll(int... numbers) {
    int sum = 0;
    for (int number : numbers) {
        sum += number;
    }
    return sum;
}

// 调用示例
int total = sumAll(1, 2, 3, 4, 5);  // 传入5个参数
```

### 方法调用

通过方法名和参数列表来调用方法：

```java
greet();                    // 调用无参方法
greetPerson("小明");         // 调用有参方法
int sum = add(10, 20);      // 调用有返回值方法
```
