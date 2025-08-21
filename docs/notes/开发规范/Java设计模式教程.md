# Java设计模式教程

本文档配合`com.ibz.design`包中的Java文件，详细介绍Java中常见的设计模式及其应用。

## 设计模式基础概念

设计模式是在软件设计中常见问题的可重用解决方案。它们不是可以直接转换为代码的完成设计，而是描述了在特定情况下解决设计问题的方法。

设计模式的主要优势包括：
1. **提高代码质量**：提供经过验证的解决方案
2. **促进代码重用**：提供通用的解决方案模板
3. **提高开发效率**：减少设计和实现时间
4. **改善沟通**：提供通用的术语和概念

设计模式通常分为三类：
1. **创建型模式**：处理对象的创建过程
2. **结构型模式**：处理类或对象的组合
3. **行为型模式**：处理对象间职责的分配和通信

## 单例模式（Singleton Pattern）

单例模式确保一个类只有一个实例，并提供全局访问点。这是最常用的设计模式之一。

### 实现要点

1. 私有构造方法防止外部实例化
2. 静态变量保存唯一实例
3. 静态方法提供全局访问点
4. 线程安全的实现方式

```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {
        // 防止通过反射创建实例
        if (instance != null) {
            throw new RuntimeException("使用getSingleton()方法获取实例");
        }
    }
    
    public static Singleton getSingleton() {
        // 双重检查锁定确保线程安全
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### 使用场景

1. 配置管理器
2. 日志记录器
3. 数据库连接池
4. 线程池

## 工厂模式（Factory Pattern）

工厂模式定义一个创建对象的接口，但让子类决定实例化哪个类。工厂方法让类的实例化推迟到子类。

### 实现要点

1. 定义产品接口
2. 实现具体产品类
3. 创建工厂类负责创建产品对象

```java
// 产品接口
public interface Shape {
    void draw();
}

// 具体产品
public class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制圆形");
    }
}

// 工厂类
public class ShapeFactory {
    public Shape getShape(String shapeType) {
        if (shapeType == null) {
            return null;
        }
        
        if (shapeType.equalsIgnoreCase("CIRCLE")) {
            return new Circle();
        } else if (shapeType.equalsIgnoreCase("RECTANGLE")) {
            return new Rectangle();
        }
        
        return null;
    }
}
```

### 使用场景

1. 创建复杂对象
2. 需要根据不同条件创建不同对象
3. 系统应该独立于产品的创建、组合和表示

## 观察者模式（Observer Pattern）

观察者模式定义了对象间的一对多依赖关系，当一个对象改变状态时，所有依赖它的对象都会收到通知并自动更新。

### 实现要点

1. 定义主题接口和观察者接口
2. 实现具体主题和观察者类
3. 建立订阅和通知机制

```java
// 主题接口
public interface Subject {
    void registerObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers();
}

// 观察者接口
public interface Observer {
    void update(String message);
}

// 具体主题
public class NewsAgency implements Subject {
    private List<Observer> observers;
    private String news;
    
    public void setNews(String news) {
        this.news = news;
        notifyObservers();
    }
    
    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(news);
        }
    }
    
    // 其他方法...
}

// 具体观察者
public class NewsChannel implements Observer {
    @Override
    public void update(String news) {
        System.out.println(name + " 收到新闻: " + news);
    }
}
```

### 使用场景

1. 事件处理系统
2. MVC架构中的模型和视图
3. 发布-订阅系统
4. 实时数据更新

## 其他常见设计模式

### 1. 装饰器模式（Decorator Pattern）
动态地给对象添加额外的职责，比生成子类更灵活。

### 2. 策略模式（Strategy Pattern）
定义一系列算法，把它们一个个封装起来，并且使它们可相互替换。

### 3. 模板方法模式（Template Method Pattern）
定义一个操作中的算法骨架，而将一些步骤延迟到子类中。

### 4. 适配器模式（Adapter Pattern）
将一个类的接口转换成客户希望的另一个接口。

## 设计模式最佳实践

1. **不要过度使用**：设计模式是解决方案，不是万能药
2. **理解模式适用场景**：在合适的场景使用合适的模式
3. **保持简单**：避免不必要的复杂性
4. **团队沟通**：确保团队成员理解使用的模式
5. **持续学习**：不断学习新的设计模式和最佳实践

## 包结构说明

为了更好地组织代码，我们将设计模式相关的类按照模式类型分别放在不同的包中：

```
src/main/java/com/ibz/design/
├── DesignPatternDemo.java              // 主类，包含演示方法
├── singleton/
│   └── Singleton.java                  // 单例模式示例
├── factory/
│   ├── Shape.java                      // 形状接口（工厂模式）
│   ├── Circle.java                     // 圆形类（工厂模式）
│   ├── Rectangle.java                  // 矩形类（工厂模式）
│   └── ShapeFactory.java               // 形状工厂类（工厂模式）
└── observer/
    ├── Subject.java                    // 主题接口（观察者模式）
    ├── Observer.java                   // 观察者接口（观察者模式）
    ├── NewsAgency.java                 // 新闻机构类（观察者模式）
    └── NewsChannel.java                // 新闻频道类（观察者模式）
```

要运行该程序，可以使用以下命令：
```bash
mvn compile
mvn exec:java -Dexec.mainClass="com.ibz.design.DesignPatternDemo"
```

## 总结

设计模式是软件开发中的重要工具，掌握常见的设计模式有助于：

1. **提高代码质量**：使用经过验证的解决方案
2. **增强代码可维护性**：提供清晰的结构和职责分离
3. **促进团队协作**：提供通用的术语和概念
4. **提高开发效率**：减少重复设计和实现工作

在实际开发中，应该根据具体需求选择合适的设计模式，避免为了使用模式而使用模式。重要的是理解模式背后的原理和适用场景，灵活运用以解决实际问题。