---
title: java反射
createTime: 2024/11/19 10:21:02
permalink: /article/8xar7dca/
---
Java 反射笔记

### 一、什么是 Java 反射？

**反射（Reflection）** 是 Java 的动态特性之一，允许程序在**运行时**检查和修改类、接口、字段、方法、构造器的结构和行为，而无需在编译时知道具体类名。反射是 Java 的核心特性之一，广泛用于框架开发（如 Spring、Hibernate）、工具库和动态代理。

核心特点：

1. **动态性**：运行时获取类信息，动态调用方法或修改字段。
2. **灵活性**：无需硬编码类名，适合通用代码（如框架）。
3. **复杂性**：代码复杂，性能开销较高。
4. **权限突破**：可以访问私有字段和方法（需小心安全性）。

适用场景：

- 框架开发（Spring 的依赖注入、Hibernate 的 ORM）。
- 动态代理（AOP）。
- 工具类（如序列化、调试工具）。
- 测试框架（如 JUnit）。

核心包：

- java.lang.reflect：提供反射相关的类（如 Field、Method、Constructor）。
- java.lang.Class：反射入口，代表类的元信息。

------

### 二、反射的核心类和接口

以下是反射中常用的核心类和接口：

| 类/接口                            | 功能描述                                                     |
| ---------------------------------- | ------------------------------------------------------------ |
| java.lang.Class                    | 代表类的元信息，获取字段、方法、构造器等。                   |
| java.lang.reflect.Field            | 代表类的字段（成员变量），支持获取/设置字段值，包括私有字段。 |
| java.lang.reflect.Method           | 代表类的方法，支持动态调用，包括私有方法。                   |
| java.lang.reflect.Constructor      | 代表类的构造器，支持动态创建对象。                           |
| java.lang.reflect.Modifier         | 提供修饰符解析（如 public、static）。                        |
| java.lang.reflect.AccessibleObject | 基类，提供设置访问权限（如绕过私有限制）。                   |
| java.lang.reflect.Array            | 操作数组（如动态创建、访问数组元素）。                       |

------

### 三、反射的核心操作

以下是反射的常见操作，每个操作都提供详细注释和代码示例。

1. 获取 Class 对象

Class 对象是反射的入口，有以下三种方式获取：

方法：

1. Class.forName(String className)：通过类全限定名动态加载。
2. ClassName.class：通过类名直接获取（编译时确定）。
3. instance.getClass()：通过对象实例获取。

示例代码：

```java
public class GetClassExample {
    public static void main(String[] args) {
        try {
            // 方式 1：通过 Class.forName 动态加载类
            Class<?> clazz1 = Class.forName("java.util.ArrayList");
            System.out.println("Class from forName: " + clazz1.getName()); // 输出: java.util.ArrayList

            // 方式 2：通过类名直接获取
            Class<?> clazz2 = ArrayList.class;
            System.out.println("Class from .class: " + clazz2.getName()); // 输出: java.util.ArrayList

            // 方式 3：通过实例获取
            ArrayList<String> list = new ArrayList<>();
            Class<?> clazz3 = list.getClass();
            System.out.println("Class from instance: " + clazz3.getName()); // 输出: java.util.ArrayList

        } catch (ClassNotFoundException e) {
            // 捕获类未找到异常
            System.err.println("Class not found: " + e.getMessage());
        }

        // 注意事项：
        // - Class.forName 需要全限定名，类不存在抛出 ClassNotFoundException
        // - .class 方式适合编译时已知类名
        // - getClass 适合已有实例的情况
    }
}
```

------

2. ### 获取类的构造器

通过 Class 对象获取构造器，支持创建对象。

常用方法：

- getConstructors()：获取所有公共构造器。
- getDeclaredConstructors()：获取所有构造器（包括私有）。
- getConstructor(Class<?>... parameterTypes)：获取特定公共构造器。
- newInstance()：调用无参构造器创建对象（Java 9+ 推荐用 Constructor.newInstance）。

示例代码：

```java
import java.lang.reflect.*;

public class ConstructorExample {
    public static void main(String[] args) {
        try {
            // 获取 String 类的 Class 对象
            Class<?> clazz = String.class;

            // 获取所有公共构造器
            Constructor<?>[] constructors = clazz.getConstructors();
            System.out.println("Public Constructors:");
            for (Constructor<?> c : constructors) {
                System.out.println(c); // 输出: public java.lang.String(...), ...
            }

            // 获取特定构造器（接受 char[] 参数）
            Constructor<?> charConstructor = clazz.getConstructor(char[].class);
            System.out.println("Specific Constructor: " + charConstructor); // 输出: public java.lang.String(char[])

            // 使用构造器创建对象
            char[] chars = {'H', 'e', 'l', 'l', 'o'};
            String str = (String) charConstructor.newInstance(chars);
            System.out.println("Created String: " + str); // 输出: Hello

            // 获取私有构造器（示例类）
            Class<?> exampleClass = Example.class;
            Constructor<?> privateConstructor = exampleClass.getDeclaredConstructor(String.class);
            privateConstructor.setAccessible(true); // 绕过访问限制
            Example example = (Example) privateConstructor.newInstance("Private");
            System.out.println("Private Constructor Object: " + example.getValue()); // 输出: Private

        } catch (NoSuchMethodException e) {
            // 捕获方法不存在异常
            System.err.println("Constructor not found: " + e.getMessage());
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException e) {
            // 捕获实例化或调用异常
            System.err.println("Error creating instance: " + e.getMessage());
        }
    }
}

// 示例类
class Example {
    private String value;

    private Example(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
```

注释说明：

- getConstructors 只返回公共构造器，getDeclaredConstructors 返回所有构造器。
- setAccessible(true) 可绕过私有限制，但可能受 SecurityManager 限制。
- newInstance 可能抛出 InstantiationException（抽象类/接口）、IllegalAccessException（无访问权限）等。

------

3. 获取和操作字段

通过 Class 对象获取字段（成员变量），支持读取和修改值，包括私有字段。

常用方法：

- getFields()：获取所有公共字段（包括继承的）。
- getDeclaredFields()：获取所有字段（不包括继承的）。
- getField(String name)：获取特定公共字段。
- getDeclaredField(String name)：获取特定字段。
- field.get(Object obj)：获取字段值。
- field.set(Object obj, Object value)：设置字段值。

示例代码：

```java
import java.lang.reflect.*;

public class FieldExample {
    public static void main(String[] args) {
        try {
            // 获取 Example 类的 Class 对象
            Class<?> clazz = Example.class;

            // 创建 Example 实例
            Example example = new Example("Initial");

            // 获取所有公共字段
            Field[] fields = clazz.getFields();
            System.out.println("Public Fields:");
            for (Field f : fields) {
                System.out.println(f); // 输出: public int Example.publicField
            }

            // 获取特定字段（私有）
            Field privateField = clazz.getDeclaredField("privateField");
            privateField.setAccessible(true); // 绕过访问限制
            privateField.set(example, "Modified"); // 修改私有字段
            String fieldValue = (String) privateField.get(example); // 获取私有字段值
            System.out.println("Private Field Value: " + fieldValue); // 输出: Modified

            // 获取公共字段
            Field publicField = clazz.getField("publicField");
            publicField.setInt(example, 42); // 修改公共字段
            int publicValue = publicField.getInt(example); // 获取公共字段值
            System.out.println("Public Field Value: " + publicValue); // 输出: 42

        } catch (NoSuchFieldException e) {
            // 捕获字段不存在异常
            System.err.println("Field not found: " + e.getMessage());
        } catch (IllegalAccessException e) {
            // 捕获访问权限异常
            System.err.println("Illegal access: " + e.getMessage());
        }
    }
}

// 示例类
class Example {
    private String privateField;
    public int publicField;

    public Example(String privateField) {
        this.privateField = privateField;
        this.publicField = 0;
    }
}
```

注释说明：

- getFields 包括继承的公共字段，getDeclaredFields 只包含当前类字段。
- setAccessible(true) 允许访问私有字段，需注意安全性。
- get 和 set 方法支持基本类型（如 getInt、setInt）和对象类型。

------

4. 获取和调用方法

通过 Class 对象获取方法，支持动态调用，包括私有方法。

常用方法：

- getMethods()：获取所有公共方法（包括继承的）。
- getDeclaredMethods()：获取所有方法（不包括继承的）。
- getMethod(String name, Class<?>... parameterTypes)：获取特定公共方法。
- invoke(Object obj, Object... args)：调用方法。

示例代码：

```java
import java.lang.reflect.*;

public class MethodExample {
    public static void main(String[] args) {
        try {
            // 获取 Example 类的 Class 对象
            Class<?> clazz = Example.class;

            // 创建 Example 实例
            Example example = new Example("Test");

            // 获取所有公共方法
            Method[] methods = clazz.getMethods();
            System.out.println("Public Methods:");
            for (Method m : methods) {
                System.out.println(m); // 输出: public java.lang.String Example.getValue(), ...
            }

            // 获取特定公共方法
            Method getValueMethod = clazz.getMethod("getValue");
            String result = (String) getValueMethod.invoke(example); // 调用方法
            System.out.println("getValue result: " + result); // 输出: Test

            // 获取私有方法
            Method privateMethod = clazz.getDeclaredMethod("privateMethod", String.class);
            privateMethod.setAccessiblegom); // 绕过访问限制
            String privateResult = (String) privateMethod.invoke(example, "Input");
            System.out.println("privateMethod result: " + privateResult); // 输出: Processed: Input

        } catch (NoSuchMethodException e) {
            // 捕获方法不存在异常
            System.err.println("Method not found: " + e.getMessage());
        } catch (IllegalAccessException | InvocationTargetException e) {
            // 捕获访问或调用异常
            System.err.println("Error invoking method: " + e.getMessage());
        }
    }
}

// 示例类
class Example {
    private String value;

    public Example(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    private String privateMethod(String input) {
        return "Processed: " + input;
    }
}
```

注释说明：

- getMethods 包括继承的公共方法（如 Object 的 toString），getDeclaredMethods 只包含当前类方法。
- invoke 调用方法，需提供实例（静态方法传 null）和参数。
- setAccessible(true) 允许调用私有方法。

------

5. 操作数组

通过 java.lang.reflect.Array 操作数组，支持动态创建和访问。

常用方法：

- Array.newInstance(Class<?> componentType, int length)：创建数组。
- Array.get(Object array, int index)：获取数组元素。
- Array.set(Object array, int index, Object value)：设置数组元素。

示例代码：

```java
import java.lang.reflect.*;

public class ArrayExample {
    public static void main(String[] args) {
        try {
            // 创建 int 数组，长度为 5
            Object intArray = Array.newInstance(int.class, 5);
            System.out.println("Array length: " + Array.getLength(intArray)); // 输出: 5

            // 设置数组元素
            Array.set(intArray, 0, 10);
            Array.set(intArray, 1, 20);
            System.out.println("Array[0]: " + Array.get(intArray, 0)); // 输出: 10

            // 创建 String 数组
            Object stringArray = Array.newInstance(String.class, 3);
            Array.set(stringArray, 0, "Apple");
            Array.set(stringArray, 1, "Banana");
            System.out.println("String Array[1]: " + Array.get(stringArray, 1)); // 输出: Banana

            // 遍历数组
            System.out.println("String Array:");
            for (int i = 0; i < Array.getLength(stringArray); i++) {
                System.out.println("Index " + i + ": " + Array.get(stringArray, i));
            }

        } catch (IllegalArgumentException | NegativeArraySizeException e) {
            // 捕获数组操作异常
            System.err.println("Array operation error: " + e.getMessage());
        }
    }
}
```

注释说明：

- Array.newInstance 支持基本类型和对象类型。
- Array.getLength 获取数组长度。
- 访问越界抛出 ArrayIndexOutOfBoundsException。

------

6. 获取类信息

通过 Class 对象获取类信息（如修饰符、父类、接口、注解等）。

常用方法：

- getModifiers()：获取修饰符。
- getSuperclass()：获取父类。
- getInterfaces()：获取实现的接口。
- getAnnotations()：获取注解。

示例代码：

```java
import java.lang.reflect.*;
import java.lang.annotation.*;

public class ClassInfoExample {
    public static void main(String[] args) {
        try {
            // 获取 Example 类的 Class 对象
            Class<?> clazz = Example.class;

            // 获取修饰符
            int modifiers = clazz.getModifiers();
            System.out.println("Modifiers: " + Modifier.toString(modifiers)); // 输出: public

            // 获取父类
            Class<?> superClass = clazz.getSuperclass();
            System.out.println("Superclass: " + superClass.getName()); // 输出: java.lang.Object

            // 获取实现的接口
            Class<?>[] interfaces = clazz.getInterfaces();
            System.out.println("Interfaces:");
            for (Class<?> i : interfaces) {
                System.out.println(i.getName());
            }

            // 获取注解
            Annotation[] annotations = clazz.getAnnotations();
            System.out.println("Annotations:");
            for (Annotation a : annotations) {
                System.out.println(a); // 输出: @MyAnnotation(value=TestClass)
            }

        } catch (Exception e) {
            // 捕获异常
            System.err.println("Error getting class info: " + e.getMessage());
        }
    }
}

// 自定义注解
@Retention(RetentionPolicy.RUNTIME)
@interface MyAnnotation {
    String value();
}

// 示例类
@MyAnnotation("TestClass")
public class Example {
    private String value;
}
```

注释说明：

- Modifier 类解析修饰符（如 public、static）。
- getAnnotations 获取运行时保留的注解（需 @Retention(RetentionPolicy.RUNTIME)）。
- 接口和父类信息对框架开发（如 Spring）至关重要。

------

### 四、反射的性能优化

反射的性能开销较高（动态解析和访问检查），以下是优化建议：

1. **缓存反射对象**：

   - 缓存 Class、Field、Method、Constructor 对象，避免重复获取。

   java

   

   ```java
   private static final Map<String, Method> methodCache = new HashMap<>();
   public static Method getCachedMethod(Class<?> clazz, String methodName, Class<?>... parameterTypes) throws NoSuchMethodException {
       String key = clazz.getName() + "#" + methodName;
       return methodCache.computeIfAbsent(key, k -> clazz.getMethod(methodName, parameterTypes));
   }
   ```

2. **批量操作**：

   - 批量获取字段/方法，减少反射调用。

   java

   

   ```java
   Field[] fields = clazz.getDeclaredFields(); // 一次性获取所有字段
   ```

3. **避免频繁 setAccessible**：

   - 一次性设置多个字段/方法的访问权限。

   java

   

   ```java
   Arrays.stream(clazz.getDeclaredFields()).forEach(f -> f.setAccessible(true));
   ```

4. **使用替代方案**：

   - 对于高性能场景，考虑字节码操作（如 ASM、ByteBuddy）或编译时代码生成。

------

### 五、反射的注意事项

1. **性能开销**：

   - 反射操作比直接调用慢，尽量缓存反射对象。
   - 避免在性能敏感场景（如循环）大量使用。

2. **安全性**：

   - setAccessible(true) 可能违反封装性，受 SecurityManager 限制。
   - 避免在不受信任的代码中使用反射。

3. **异常处理**：

   - 反射操作可能抛出多种异常（如 ClassNotFoundException、NoSuchMethodException），需妥善处理。

   java

   

   ```java
   try {
       Method method = clazz.getMethod("someMethod");
   } catch (NoSuchMethodException e) {
       System.err.println("Method not found: " + e.getMessage());
   }
   ```

4. **模块化限制（Java 9+）**：

   - Java 模块系统（JPMS）限制反射访问非导出包。

   - 使用 --add-opens 或 open module 解决：

     bash

     

     ```bash
     java --add-opens java.base/java.lang=ALL-UNNAMED MyApp
     ```

5. **兼容性**：

   - 反射可能依赖特定类结构，类变化可能导致代码失效。
   - 测试反射代码的健壮性。

------

### 六、实际应用场景示例

以下是一个综合示例，模拟一个简单的 ORM 框架，使用反射动态创建对象、设置字段值。

```java
import java.lang.reflect.*;
import java.util.*;

public class SimpleORMExample {
    public static void main(String[] args) {
        // 模拟数据库记录
        Map<String, Object> data = new HashMap<>();
        data.put("id", 1);
        data.put("name", "Alice");
        data.put("age", 25);

        try {
            // 使用反射创建 User 对象并填充数据
            User user = mapToObject(User.class, data);
            System.out.println("Created User: id=" + user.id + ", name=" + user.name + ", age=" + user.age);
            // 输出: Created User: id=1, name=Alice, age=25

        } catch (Exception e) {
            System.err.println("Error creating object: " + e.getMessage());
        }
    }

    // 将 Map 数据映射到对象
    public static <T> T mapToObject(Class<T> clazz, Map<String, Object> data)
            throws ReflectiveOperationException {
        // 创建对象（调用无参构造器）
        Constructor<T> constructor = clazz.getDeclaredConstructor();
        constructor.setAccessible(true); // 绕过访问限制
        T instance = constructor.newInstance();

        // 获取所有字段
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true); // 绕过访问限制
            String fieldName = field.getName();
            if (data.containsKey(fieldName)) {
                // 设置字段值
                field.set(instance, data.get(fieldName));
            }
        }

        return instance;
    }
}

// 示例实体类
class User {
    public int id; // 公共字段
    private String name; // 私有字段
    private int age; // 私有字段

    // 无参构造器
    public User() {}
}
```

注释说明：

- 模拟 ORM 框架，动态将 Map 数据映射到对象。
- 使用反射创建对象、设置字段值，类似 Hibernate 的功能。
- 需处理字段类型匹配和异常情况（实际应用中更复杂）。

------

### 七、总结

Java 反射是一个强大的运行时工具，允许动态检查和操作类、字段、方法、构造器等。核心内容包括：

1. **核心类**：
   - Class：反射入口。
   - Field、Method、Constructor：操作字段、方法、构造器。
   - Array、Modifier：辅助操作。
2. **常见操作**：
   - 获取 Class 对象（forName、.class、实例）。
   - 操作构造器（创建对象）。
   - 操作字段（读写值）。
   - 调用方法（动态执行）。
   - 操作数组（创建、访问）。
   - 获取类信息（修饰符、注解等）。
3. **性能优化**：
   - 缓存反射对象。
   - 批量操作。
   - 考虑替代方案（如字节码操作）。
4. **注意事项**：
   - 性能开销高。
   - 安全性问题（setAccessible）。
   - 模块化限制（Java 9+）。
   - 异常处理和兼容性。
5. **应用场景**：
   - 框架开发（Spring、Hibernate）。
   - 动态代理、测试工具、序列化。

希望这份带详细注释的笔记和示例能帮助你全面掌握 Java 反射！如果需要更深入的示例（如动态代理实现、性能测试）或其他补充，请告诉我！