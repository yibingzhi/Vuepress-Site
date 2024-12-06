---
title: java反射
createTime: 2024/11/19 10:21:02
permalink: /article/bzx9y31m/
---
以下是一份关于Java反射机制的详细笔记：

### 一、反射机制概述

- **概念**：
    -
    Java反射机制是指在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取信息以及动态调用对象方法、访问对象属性的功能称为Java的反射机制。它使得Java语言具有了更强的动态性，可以在程序运行时进行类的加载、分析和操作，而不是像传统的方式那样在编译时就确定好一切。
- **作用及应用场景**：
    - **框架开发**
      ：许多Java框架（如Spring框架）大量运用反射机制来实现依赖注入、AOP（面向切面编程）等功能。例如在Spring中，通过反射可以根据配置文件或注解信息动态地创建对象、调用对象的方法，将各个组件连接起来，而不需要在代码中显式地进行对象实例化和方法调用。
    - **动态代理**：可以动态地创建代理对象，在不修改原有类代码的基础上，对目标对象的方法调用进行拦截、增强等操作，常用于实现远程调用、权限控制等功能，而反射是实现动态代理的关键技术之一。
    - **插件化开发**：在开发插件化的系统时，通过反射可以动态加载外部的类文件（插件），并调用其中的方法、访问属性，实现系统功能的动态扩展，让应用可以根据需要灵活添加新的功能模块。

### 二、获取Class对象的方式

- **通过类的`class`属性获取（最常用）**：
    - 对于任何一个已经定义好的类，都可以使用类名`.class`的方式获取对应的`Class`对象。例如：

```java
Class<String> stringClass = String.class;
Class<Integer> integerClass = Integer.class;
```

    - 这种方式简单直接，在编译时就可以确定要获取的`Class`对象，并且编译器会进行类型检查，保证类型安全。

- **通过对象的`getClass`方法获取**：
    - 对于已经创建好的对象，可以调用对象的`getClass`方法来获取其对应的`Class`对象。例如：

```java
String str = "Hello";
Class<? extends String> strClass = str.getClass();
```

    - 该方式常用于在只知道对象实例，而不清楚具体类名的情况下获取`Class`对象，不过要先有对象实例存在才能使用这个方法。

- **通过`Class.forName`方法获取（常用于动态加载类）**：
    - 可以根据类的全限定名（包含包名的完整类名）来动态加载类并获取对应的`Class`对象，常用于在运行时根据配置信息等加载特定的类。例如：

```java
try {
    Class<?> clazz = Class.forName("java.util.Date");
} catch (ClassNotFoundException e) {
    e.printStackTrace();
}
```

    - 这种方式比较灵活，但需要注意可能会抛出`ClassNotFoundException`异常，如果指定的类名不存在或者类路径配置错误等情况就会出现异常，所以一般要放在`try-catch`块中使用。

### 三、通过Class对象获取类的信息

- **获取类的构造函数（Constructor）**：
    - **获取所有公共构造函数**：可以使用`getConstructors`方法，它返回一个包含类的所有公共构造函数的数组，每个元素是一个
      `Constructor`对象，代表一个构造函数。例如：

```java
Class<Date> dateClass = Date.class;
Constructor<?>[] constructors = dateClass.getConstructors();
for (Constructor<?> constructor : constructors) {
    System.out.println(constructor);
}
```

    - **获取指定参数类型的公共构造函数**：通过`getConstructor`方法，并传入表示参数类型的`Class`对象数组，可以获取特定参数类型的公共构造函数。例如，获取`Date`类中带有一个`long`类型参数的构造函数：

```java
Constructor<Date> constructor = dateClass.getConstructor(long.class);
```

    - **获取所有构造函数（包括私有等非公共构造函数）**：使用`getDeclaredConstructors`方法获取所有构造函数的数组，`getDeclaredConstructor`方法可以获取指定参数类型的任意（包括私有）构造函数。例如：

```java
Constructor<?>[] allConstructors = dateClass.getDeclaredConstructors();
for (Constructor<?> constructor : allConstructors) {
    constructor.setAccessible(true); // 设置可访问私有构造函数
    // 可以进一步操作构造函数，如创建对象等
}
```

    - **创建对象**：获取到构造函数后，可以通过`newInstance`方法（对于无参构造函数也可以直接使用`Class`对象的`newInstance`方法，但已被标记为过时，更推荐使用构造函数的`newInstance`方法）来创建类的实例对象。例如：

```java
try {
    Date date = constructor.newInstance(1609459200000L); // 使用有参构造函数创建Date对象
} catch (InstantiationException | IllegalAccessException | IllegalArgumentException |
          InvocationTargetException e) {
    e.printStackTrace();
}
```

- **获取类的方法（Method）**：
    - **获取所有公共方法**：使用`getMethods`方法可以获取类的所有公共方法（包括从父类继承来的公共方法），返回一个`Method`
      数组。例如：

```java
Class<String> stringClass = String.class;
Method[] methods = stringClass.getMethods();
for (Method method : methods) {
    System.out.println(method);
}
```

    - **获取指定名称和参数类型的公共方法**：通过`getMethod`方法，传入方法名以及表示参数类型的`Class`对象数组，来获取特定的公共方法。例如，获取`String`类中的`charAt`方法（参数为`int`类型）：

```java
Method charAtMethod = stringClass.getMethod("charAt", int.class);
```

    - **获取所有方法（包括私有等非公共方法）**：使用`getDeclaredMethods`方法获取类的所有方法，`getDeclaredMethod`方法则可以获取指定名称和参数类型的任意（包括私有）方法。例如：

```java
Method[] allMethods = stringClass.getDeclaredMethods();
for (Method method : allMethods) {
    method.setAccessible(true); // 设置可访问私有方法
    // 可以进一步操作方法，如调用等
}
```

    - **调用方法**：获取到方法后，可以通过`invoke`方法在指定对象上调用该方法（对于静态方法，第一个参数可以传入`null`），并传入相应的参数值。例如，调用`String`类的`charAt`方法：

```java
String str = "Hello";
try {
    char result = (char) charAtMethod.invoke(str, 1); // 在字符串对象str上调用charAt方法，传入参数1
    System.out.println(result);
} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
    e.printStackTrace();
}
```

- **获取类的字段（Field）**：
    - **获取所有公共字段**：使用`getFields`方法获取类的所有公共字段（包括从父类继承的公共字段），返回一个`Field`数组。例如：

```java
Class<Person> personClass = Person.class;
Field[] fields = personClass.getFields();
for (Field field : fields) {
    System.out.println(field);
}
```

    - **获取指定名称的公共字段**：通过`getField`方法，传入字段名来获取特定的公共字段。例如：

```java
class Person {
    public String name;
}
Field nameField = personClass.getField("name");
```

    - **获取所有字段（包括私有等非公共字段）**：使用`getDeclaredFields`方法获取类的所有字段，`getDeclaredField`方法可以获取指定名称的任意（包括私有）字段。例如：

```java
Field[] allFields = personClass.getDeclaredFields();
for (Field field : allFields) {
    field.setAccessible(true); // 设置可访问私有字段
    // 可以进一步操作字段，如获取或设置字段值等
}
```

    - **获取和设置字段值**：获取到字段后，可以通过`get`方法获取对象中该字段的值（对于静态字段，传入`null`作为对象参数），通过`set`方法设置对象中该字段的值。例如：

```java
Person person = new Person();
try {
    nameField.set(person, "张三"); // 设置person对象的name字段值为"张三"
    String name = (String) nameField.get(person); // 获取person对象的name字段值
    System.out.println(name);
} catch (IllegalAccessException e) {
    e.printStackTrace();
}
```

### 四、反射中的访问控制与`setAccessible`方法

- **问题引入**：默认情况下，Java的访问控制机制限制了对类的私有成员（构造函数、方法、字段）的访问，在反射中如果直接尝试访问私有成员会抛出
  `IllegalAccessException`异常。
- **`setAccessible`方法的作用**：通过对获取到的`Constructor`、`Method`、`Field`等对象调用`setAccessible(true)`
  方法，可以绕过正常的访问控制机制，使得在反射中能够访问和操作私有成员，不过这种方式要谨慎使用，因为它破坏了类原本的封装性，一般在确实有必要（如在一些框架内部进行特定的初始化或操作等情况）时才会使用。例如：

```java
class SecretClass {
    private int secretValue;
    private SecretClass() {
    }
    private void secretMethod() {
        System.out.println("这是一个秘密方法");
    }
}

try {
    Class<SecretClass> secretClass = SecretClass.class;
    Constructor<SecretClass> constructor = secretClass.getDeclaredConstructor();
    constructor.setAccessible(true);
    SecretClass instance = constructor.newInstance();

    Field secretField = secretClass.getDeclaredField("secretValue");
    secretField.setAccessible(true);
    secretField.set(instance, 123);

    Method secretMethod = secretClass.getDeclaredMethod("secretMethod");
    secretMethod.setAccessible(true);
    secretMethod.invoke(instance);

} catch (Exception e) {
    e.printStackTrace();
}
```

### 五、反射的性能考虑

- **性能问题**
  ：相比于直接调用对象的方法、访问对象的属性等常规操作，反射的性能通常会差一些。因为反射涉及到在运行时动态查找类的信息、解析方法和字段等，需要更多的系统开销，例如方法的查找、参数的类型检查等操作都要在运行时进行，不像常规代码编译时就已经确定好了直接的调用逻辑。
- **优化建议**：
    - 在性能敏感的代码中，如果可以提前确定要操作的类、方法、字段等，尽量避免使用反射，采用常规的代码编写方式。
    - 如果必须使用反射，对于频繁调用的操作，可以缓存获取到的`Class`对象、`Constructor`、`Method`、`Field`
      等，减少重复查找和解析的开销，提高整体性能。例如，可以将获取到的`Method`对象保存在一个变量中，后续多次调用时直接使用这个变量，而不是每次都通过
      `getMethod`等方法重新获取。

反射机制是Java语言中一个强大且重要的特性，合理运用它可以实现很多灵活、动态的功能，但同时也要注意其带来的性能影响以及对类封装性的潜在破坏，谨慎使用相关的操作。

希望这份笔记对你学习Java反射机制有所帮助，若你还有其他疑问，可以随时问我。 