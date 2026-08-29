---
tags:
  - Java
  - 设计模式
  - 开发规范
  - 架构设计
title: Java设计模式教程
createTime: 2025/08/18 09:55:33
permalink: /article/1m1oqwxi/
---

::: tip 保鲜说明（2026-08）
本文以 **Java 17/21** 语法编写（`record`、`sealed`、`var`、文本块）。设计模式不是银弹：优先理解**问题域**与**变化点**，再选用模式。Spring 框架本身大量运用代理、策略、模板方法、工厂等思想，文末单独说明。
:::

## 1. 设计模式基础

### 1.1 什么是设计模式

设计模式（Design Pattern）是面向对象设计中**反复出现的问题**的**可复用解决方案**。它描述的是**类与对象的组合与交互**，而非具体业务逻辑。

GoF（Gang of Four）将 23 种模式分为三类：

| 类型 | 关注点 | 本文覆盖 |
|------|--------|----------|
| **创建型** | 对象如何创建 | Singleton、Factory Method、Abstract Factory、Builder |
| **结构型** | 类/对象如何组合 | Adapter、Decorator、Proxy、Facade |
| **行为型** | 对象如何协作 | Observer、Strategy、Template Method、Chain of Responsibility |

### 1.2 使用原则

1. **针对变化设计**：把易变部分隔离，稳定部分依赖抽象。
2. **组合优于继承**：多用接口与委托，少写深层继承树。
3. **不要过度设计**：模式是手段，可读性与可维护性是目的。
4. **与框架协同**：Spring DI、AOP 已内建多种模式，避免重复造轮子。

### 1.3 推荐包结构

```
src/main/java/com/example/patterns/
├── creational/
│   ├── singleton/
│   ├── factory/
│   ├── abstractfactory/
│   └── builder/
├── structural/
│   ├── adapter/
│   ├── decorator/
│   ├── proxy/
│   └── facade/
└── behavioral/
    ├── observer/
    ├── strategy/
    ├── template/
    └── chain/
```

---

## 2. 单例模式（Singleton）

### 2.1 意图

保证一个类**只有一个实例**，并提供全局访问点。适用于配置中心、连接池管理器、指标注册表等**全局唯一**资源。

### 2.2 枚举实现（推荐）

```java
public enum AppConfigHolder {
  INSTANCE;

  private final Properties props = load();

  public String get(String key) {
    return props.getProperty(key);
  }

  private static Properties load() {
    // 加载配置
    return new Properties();
  }
}

// 使用
String url = AppConfigHolder.INSTANCE.get("db.url");
```

**优点**：JVM 保证单例、天然防反射与序列化破坏（若不定义 `readResolve` 仍可能被序列化破坏，枚举单例无此问题）。

### 2.3 静态内部类（懒加载 + 线程安全）

```java
public final class IdGenerator {
  private IdGenerator() {}

  private static class Holder {
    static final IdGenerator INSTANCE = new IdGenerator();
  }

  public static IdGenerator getInstance() {
    return Holder.INSTANCE;
  }

  public long nextId() {
    return Snowflake.next();
  }
}
```

类加载时初始化 `Holder` 才创建实例，无同步开销。

### 2.4 双重检查锁定（了解即可）

```java
public final class LegacySingleton {
  private static volatile LegacySingleton instance;

  private LegacySingleton() {}

  public static LegacySingleton getInstance() {
    if (instance == null) {
      synchronized (LegacySingleton.class) {
        if (instance == null) {
          instance = new LegacySingleton();
        }
      }
    }
    return instance;
  }
}
```

`volatile` 防止指令重排导致半初始化对象被读到。现代项目优先枚举或静态内部类。

### 2.5 Spring 中的单例

Spring 默认 Bean 作用域为 **singleton**（容器级单例，非类加载器单例）：

```java
@Service
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON) // 默认，可省略
public class CacheService { }
```

---

## 3. 工厂方法模式（Factory Method）

### 3.1 意图

定义创建对象的接口，由**子类决定**实例化哪个具体类。将「创建」与「使用」解耦。

### 3.2 结构

```
Creator（抽象）──createProduct()──> Product（接口）
     ▲                                    ▲
     │                                    │
ConcreteCreatorA                  ConcreteProductA
ConcreteCreatorB                  ConcreteProductB
```

### 3.3 Java 实现

```java
public interface Notification {
  void send(String to, String message);
}

public class EmailNotification implements Notification {
  @Override
  public void send(String to, String message) {
    System.out.println("Email -> " + to + ": " + message);
  }
}

public class SmsNotification implements Notification {
  @Override
  public void send(String to, String message) {
    System.out.println("SMS -> " + to + ": " + message);
  }
}

public abstract class NotificationCreator {
  public void notifyUser(String to, String message) {
  Notification n = createNotification();
    validate(to);
    n.send(to, message);
  }

  protected abstract Notification createNotification();

  private void validate(String to) {
    if (to == null || to.isBlank()) throw new IllegalArgumentException("to");
  }
}

public class EmailNotificationCreator extends NotificationCreator {
  @Override
  protected Notification createNotification() {
    return new EmailNotification();
  }
}
```

### 3.4 简单工厂 vs 工厂方法

```java
// 简单工厂（非 GoF 模式，但常用）
public final class NotificationFactory {
  public static Notification create(String channel) {
    return switch (channel) {
      case "email" -> new EmailNotification();
      case "sms" -> new SmsNotification();
      default -> throw new IllegalArgumentException(channel);
    };
  }
}
```

简单工厂集中创建逻辑，扩展需改工厂类（违反开闭原则）；工厂方法通过新增子类扩展，更符合 OCP。

### 3.5 使用场景

- 创建逻辑复杂，需按类型/配置分支。
- 框架扩展点：如 `DocumentBuilderFactory.newInstance()`。

---

## 4. 抽象工厂模式（Abstract Factory）

### 4.1 意图

提供一个接口，创建**一族相关或相互依赖的对象**，而无需指定具体类。典型场景：**跨平台 UI 组件**、**不同数据库方言的 DAO 套件**。

### 4.2 Java 实现

```java
public interface ConnectionFactory {
  DataSource dataSource();
  TransactionManager transactionManager();
}

public class PostgresFactory implements ConnectionFactory {
  @Override
  public DataSource dataSource() {
    return new HikariDataSource(/* postgres url */);
  }

  @Override
  public TransactionManager transactionManager() {
    return new JdbcTransactionManager(dataSource());
  }
}

public class MysqlFactory implements ConnectionFactory {
  @Override
  public DataSource dataSource() {
    return new HikariDataSource(/* mysql url */);
  }

  @Override
  public TransactionManager transactionManager() {
    return new JdbcTransactionManager(dataSource());
  }
}

public class Application {
  private final ConnectionFactory factory;

  public Application(ConnectionFactory factory) {
    this.factory = factory;
  }

  public void run() {
    var ds = factory.dataSource();
    var tx = factory.transactionManager();
    // 保证 DS 与 TX 来自同一「族」
  }
}
```

### 4.3 与工厂方法的区别

| | 工厂方法 | 抽象工厂 |
|--|---------|---------|
| 产品数量 | 一种产品 | 一族多种相关产品 |
| 扩展方式 | 新增 Creator 子类 | 新增 Factory 实现整套产品 |

---

## 5. 建造者模式（Builder）

### 5.1 意图

将复杂对象的构建与表示分离，使同样的构建过程可以创建不同的表示。

### 5.2 经典 Builder

```java
public final class HttpRequest {
  private final String method;
  private final String url;
  private final Map<String, String> headers;
  private final Optional<String> body;

  private HttpRequest(Builder b) {
    this.method = b.method;
    this.url = b.url;
    this.headers = Map.copyOf(b.headers);
    this.body = Optional.ofNullable(b.body);
  }

  public static Builder builder() {
    return new Builder();
  }

  public static final class Builder {
    private String method = "GET";
    private String url;
    private final Map<String, String> headers = new LinkedHashMap<>();
    private String body;

    public Builder method(String method) { this.method = method; return this; }
    public Builder url(String url) { this.url = url; return this; }
    public Builder header(String k, String v) { headers.put(k, v); return this; }
    public Builder body(String body) { this.body = body; return this; }

    public HttpRequest build() {
      Objects.requireNonNull(url, "url");
      return new HttpRequest(this);
    }
  }
}

// 使用
var req = HttpRequest.builder()
    .method("POST")
    .url("https://api.example.com/orders")
    .header("Content-Type", "application/json")
    .body("{\"sku\":\"A001\"}")
    .build();
```

### 5.3 Lombok `@Builder`

```java
@Builder
@Getter
public class OrderCreateCommand {
  private final Long userId;
  private final List<OrderLine> lines;
  @Builder.Default
  private final String currency = "CNY";
}
```

### 5.4 Record + 紧凑构造器校验

```java
public record CreateUserCommand(String username, String email, int age) {
  public CreateUserCommand {
    Objects.requireNonNull(username);
    if (age < 0) throw new IllegalArgumentException("age");
  }

  public static Builder builder() { return new Builder(); }

  public static class Builder {
    private String username;
    private String email;
    private int age;

    public Builder username(String v) { username = v; return this; }
    public Builder email(String v) { email = v; return this; }
    public Builder age(int v) { age = v; return this; }

    public CreateUserCommand build() {
      return new CreateUserCommand(username, email, age);
    }
  }
}
```

### 5.5 使用场景

- 构造参数多、可选参数多（>4 个常考虑 Builder）。
- 需要不可变对象 + 流式 API。
- 与 **Director** 配合：固定构建步骤，变化部件实现。

---

## 6. 适配器模式（Adapter）

### 6.1 意图

将一个类的接口转换成客户希望的**另一个接口**，使原本不兼容的类可以协同工作。

### 6.2 类适配器 vs 对象适配器

Java 单继承，**对象适配器**更常见（组合）。

```java
// 遗留第三方 SDK
public class LegacyPaymentSdk {
  public void payInCents(int cents, String account) {
    System.out.println("pay " + cents + " to " + account);
  }
}

// 目标接口
public interface PaymentGateway {
  void pay(Money amount, String account);
}

public record Money(BigDecimal amount, Currency currency) {}

// 对象适配器
public class LegacyPaymentAdapter implements PaymentGateway {
  private final LegacyPaymentSdk sdk;

  public LegacyPaymentAdapter(LegacyPaymentSdk sdk) {
    this.sdk = sdk;
  }

  @Override
  public void pay(Money amount, String account) {
    int cents = amount.amount().multiply(BigDecimal.valueOf(100)).intValue();
    sdk.payInCents(cents, account);
  }
}
```

### 6.3 JDK 中的适配器

- `Arrays.asList()` 将数组适配为 `List`。
- `InputStreamReader` 将字节流适配为字符流。
- Spring MVC 的 `HandlerAdapter` 适配不同 Controller 签名。

### 6.4 使用场景

- 集成遗留系统、第三方库。
- 统一多套 API 为内部标准接口。

---

## 7. 装饰器模式（Decorator）

### 7.1 意图

**动态**给对象添加职责，比子类继承更灵活。开闭原则：对扩展开放，对修改关闭。

### 7.2 Java I/O 经典示例

```java
try (InputStream in = new BufferedInputStream(
        new GZIPInputStream(
            Files.newInputStream(Path.of("data.gz"))))) {
  byte[] buf = in.readAllBytes();
}
```

`BufferedInputStream`、`GZIPInputStream` 都是 `InputStream` 的装饰器。

### 7.3 业务装饰器

```java
public interface OrderService {
  Order create(CreateOrderCommand cmd);
}

public class OrderServiceImpl implements OrderService {
  @Override
  public Order create(CreateOrderCommand cmd) {
    return persist(cmd);
  }
}

public abstract class OrderServiceDecorator implements OrderService {
  protected final OrderService delegate;
  protected OrderServiceDecorator(OrderService delegate) {
    this.delegate = delegate;
  }
}

public class AuditingOrderService extends OrderServiceDecorator {
  private final AuditLogger audit;

  public AuditingOrderService(OrderService delegate, AuditLogger audit) {
    super(delegate);
    this.audit = audit;
  }

  @Override
  public Order create(CreateOrderCommand cmd) {
    audit.log("create order", cmd);
    return delegate.create(cmd);
  }
}

public class MetricsOrderService extends OrderServiceDecorator {
  private final MeterRegistry registry;

  @Override
  public Order create(CreateOrderCommand cmd) {
    return registry.timer("order.create").record(() -> delegate.create(cmd));
  }
}
```

可嵌套：`new MetricsOrderService(new AuditingOrderService(new OrderServiceImpl(), audit), registry)`。

### 7.4 装饰器 vs 代理

| | 装饰器 | 代理 |
|--|--------|------|
| 目的 | 增强功能（可叠加多层） | 控制访问（权限、延迟加载、远程） |
| 关注点 | 附加行为 | 访问控制与间接层 |

---

## 8. 代理模式（Proxy）

### 8.1 意图

为其他对象提供一种**代理**以控制对这个对象的访问。

### 8.2 静态代理

```java
public interface UserRepository {
  Optional<User> findById(Long id);
}

public class UserRepositoryImpl implements UserRepository {
  @Override
  public Optional<User> findById(Long id) {
    return queryDb(id);
  }
}

public class CachingUserRepositoryProxy implements UserRepository {
  private final UserRepository target;
  private final Cache<Long, User> cache;

  @Override
  public Optional<User> findById(Long id) {
    User cached = cache.getIfPresent(id);
    if (cached != null) return Optional.of(cached);
    Optional<User> user = target.findById(id);
    user.ifPresent(u -> cache.put(id, u));
    return user;
  }
}
```

### 8.3 JDK 动态代理

```java
UserRepository repo = (UserRepository) Proxy.newProxyInstance(
    UserRepository.class.getClassLoader(),
    new Class<?>[] { UserRepository.class },
    (proxy, method, args) -> {
      long start = System.nanoTime();
      try {
        return method.invoke(new UserRepositoryImpl(), args);
      } finally {
        log.info("{} took {} ms", method.getName(), (System.nanoTime() - start) / 1_000_000);
      }
    }
);
```

要求接口代理；CGLIB 可代理类（Spring 默认对无接口 Bean 用 CGLIB）。

### 8.4 Spring AOP 即代理

```java
@Service
public class OrderService {
  @Transactional
  @Cacheable("orders")
  public Order get(Long id) { ... }
}
```

`@Transactional`、`@Cacheable` 通过 **AOP 代理**在方法前后织入事务与缓存逻辑——本质是**代理 + 装饰**的组合。

---

## 9. 外观模式（Facade）

### 9.1 意图

为子系统中的一组接口提供**统一的高层接口**，降低客户端与子系统的耦合。

### 9.2 实现

```java
// 复杂子系统
class InventoryService { boolean reserve(String sku, int qty) { return true; } }
class PaymentService { String charge(BigDecimal amount) { return "PAY-001"; } }
class ShippingService { String ship(String orderId) { return "SHIP-001"; } }

// Facade
public class CheckoutFacade {
  private final InventoryService inventory;
  private final PaymentService payment;
  private final ShippingService shipping;

  public CheckoutResult checkout(CheckoutRequest req) {
    if (!inventory.reserve(req.sku(), req.qty())) {
      throw new BusinessException("库存不足");
    }
    String paymentId = payment.charge(req.amount());
    String tracking = shipping.ship(req.orderId());
    return new CheckoutResult(paymentId, tracking);
  }
}
```

### 9.3 与 MVC Controller 的关系

REST Controller 常充当 Facade：编排多个 Service，对外暴露简单 API，隐藏领域内部复杂性。

---

## 10. 观察者模式（Observer）

### 10.1 意图

定义对象间**一对多**依赖，当主题状态改变时，所有观察者自动收到通知。

### 10.2 经典实现

```java
public interface DomainEvent { }

public record OrderPaidEvent(Long orderId, BigDecimal amount) implements DomainEvent { }

public interface EventPublisher {
  void publish(DomainEvent event);
}

public interface EventListener<T extends DomainEvent> {
  Class<T> eventType();
  void onEvent(T event);
}

public class SimpleEventBus implements EventPublisher {
  private final Map<Class<?>, List<EventListener<?>>> listeners = new ConcurrentHashMap<>();

  public <T extends DomainEvent> void register(EventListener<T> listener) {
    listeners.computeIfAbsent(listener.eventType(), k -> new CopyOnWriteArrayList<>())
        .add(listener);
  }

  @SuppressWarnings("unchecked")
  public void publish(DomainEvent event) {
    var list = listeners.getOrDefault(event.getClass(), List.of());
    for (EventListener<?> l : list) {
      ((EventListener<DomainEvent>) l).onEvent(event);
    }
  }
}
```

### 10.3 Spring 事件

```java
// 发布
applicationEventPublisher.publishEvent(new OrderPaidEvent(orderId, amount));

// 监听
@Component
public class OrderPaidListener {
  @EventListener
  @Async
  public void onOrderPaid(OrderPaidEvent event) {
    // 发通知、更新积分
  }
}
```

### 10.4 与发布-订阅

观察者多为进程内同步/异步回调；消息队列（Kafka/RabbitMQ）是**分布式**观察者/发布订阅，解耦更强、可靠性更高。

---

## 11. 策略模式（Strategy）

### 11.1 意图

定义一系列算法，把它们**封装**起来，并使它们**可互换**。策略模式让算法的变化独立于使用算法的客户端。

### 11.2 实现

```java
public interface DiscountStrategy {
  BigDecimal apply(BigDecimal original);
}

public class NoDiscount implements DiscountStrategy {
  @Override
  public BigDecimal apply(BigDecimal original) { return original; }
}

public class PercentageDiscount implements DiscountStrategy {
  private final BigDecimal rate;
  public PercentageDiscount(BigDecimal rate) { this.rate = rate; }

  @Override
  public BigDecimal apply(BigDecimal original) {
    return original.multiply(BigDecimal.ONE.subtract(rate));
  }
}

public class PricingService {
  private final Map<String, DiscountStrategy> strategies;

  public PricingService(Map<String, DiscountStrategy> strategies) {
    this.strategies = strategies;
  }

  public BigDecimal quote(String campaign, BigDecimal price) {
    DiscountStrategy strategy = strategies.getOrDefault(campaign, new NoDiscount());
    return strategy.apply(price);
  }
}
```

### 11.3 Spring DI 即策略注入

```java
public interface PaymentStrategy {
  boolean supports(PaymentChannel channel);
  PayResult pay(PayRequest req);
}

@Service
public class PaymentService {
  private final List<PaymentStrategy> strategies;

  public PaymentService(List<PaymentStrategy> strategies) {
    this.strategies = strategies;
  }

  public PayResult pay(PayRequest req) {
    return strategies.stream()
        .filter(s -> s.supports(req.channel()))
        .findFirst()
        .orElseThrow(() -> new BusinessException("unsupported channel"))
        .pay(req);
  }
}
```

多个 `PaymentStrategy` 实现由 Spring 自动注入 `List`，运行时按条件选择——**策略模式 + 依赖注入**是 Spring 项目最常见组合之一。

### 11.4 策略 vs 状态模式

策略由**客户端**选择算法；状态模式中对象在内部根据状态自动切换行为。二者结构相似，意图不同。

---

## 12. 模板方法模式（Template Method）

### 12.1 意图

在父类中定义算法**骨架**，将某些步骤延迟到子类。子类不改变算法结构，只重写特定步骤。

### 12.2 实现

```java
public abstract class AbstractReportExporter {
  public final byte[] export(List<ReportRow> rows) {
    validate(rows);
    String content = buildHeader() + buildBody(rows) + buildFooter();
    return encode(content);
  }

  protected void validate(List<ReportRow> rows) {
    if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("empty");
  }

  protected abstract String buildHeader();
  protected abstract String buildBody(List<ReportRow> rows);
  protected String buildFooter() { return ""; }
  protected abstract byte[] encode(String content);
}

public class CsvReportExporter extends AbstractReportExporter {
  @Override
  protected String buildHeader() { return "id,name,amount\n"; }

  @Override
  protected String buildBody(List<ReportRow> rows) {
    return rows.stream()
        .map(r -> r.id() + "," + r.name() + "," + r.amount())
        .collect(Collectors.joining("\n"));
  }

  @Override
  protected byte[] encode(String content) {
    return content.getBytes(StandardCharsets.UTF_8);
  }
}
```

### 12.3 Spring 中的模板方法

- `JdbcTemplate` / `RestTemplate`：固定资源获取与异常转换流程，回调由用户实现。
- `TransactionTemplate.execute()`：固定事务边界，业务写在回调里。

```java
jdbcTemplate.query("SELECT id, name FROM users WHERE status = ?",
    ps -> ps.setString(1, "ACTIVE"),
    (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("name")));
```

---

## 13. 责任链模式（Chain of Responsibility）

### 13.1 意图

使多个对象都有机会处理请求，将这些对象连成一条链，并沿着链传递请求，直到有对象处理它。

### 13.2 实现

```java
public interface OrderValidationHandler {
  void setNext(OrderValidationHandler next);
  void handle(OrderContext ctx);
}

public abstract class AbstractValidationHandler implements OrderValidationHandler {
  private OrderValidationHandler next;

  @Override
  public void setNext(OrderValidationHandler next) { this.next = next; }

  @Override
  public void handle(OrderContext ctx) {
    doHandle(ctx);
    if (next != null) next.handle(ctx);
  }

  protected abstract void doHandle(OrderContext ctx);
}

public class StockValidationHandler extends AbstractValidationHandler {
  @Override
  protected void doHandle(OrderContext ctx) {
    if (!inventory.available(ctx.sku(), ctx.qty())) {
      throw new BusinessException("库存不足");
    }
  }
}

public class RiskValidationHandler extends AbstractValidationHandler {
  @Override
  protected void doHandle(OrderContext ctx) {
    if (riskService.isBlocked(ctx.userId())) {
      throw new BusinessException("风控拦截");
    }
  }
}

// 组装链
var head = new StockValidationHandler();
head.setNext(new RiskValidationHandler());
head.setNext(new CouponValidationHandler());
head.handle(ctx);
```

### 13.3 Servlet Filter / Spring Interceptor

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {
  @Override
  public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
    if (!tokenValid(req)) {
      res.setStatus(401);
      return false;
    }
    return true;
  }
}
```

Filter 链、Interceptor 链、Netty `ChannelPipeline` 都是责任链的典型应用。

### 13.4 用 List 替代显式链表（Spring 风格）

```java
@Service
public class OrderValidationChain {
  private final List<OrderValidator> validators;

  public OrderValidationChain(List<OrderValidator> validators) {
    this.validators = validators;
  }

  public void validate(OrderContext ctx) {
    for (OrderValidator v : validators) {
      v.validate(ctx);
    }
  }
}
```

顺序由 `@Order` 或 `Ordered` 接口控制，比手动 `setNext` 更易测试与扩展。

---

## 14. Spring 框架中的设计模式映射

| Spring 特性 | 对应模式 | 说明 |
|-------------|----------|------|
| `@Autowired` / 接口注入 | **策略** | 运行时选择实现类 |
| `@Bean` 工厂方法 | **工厂方法** | `@Configuration` 中定义创建逻辑 |
| `BeanFactory` / `ApplicationContext` | **抽象工厂** | 创建一族 Bean |
| AOP `@Aspect` | **代理**（+装饰） | JDK/CGLIB 代理织入横切逻辑 |
| `JdbcTemplate` | **模板方法** | 固定流程，回调定制 |
| `ApplicationEvent` | **观察者** | 事件发布订阅 |
| `HandlerInterceptor` 链 | **责任链** | 请求预处理链 |
| `@Controller` 编排 Service | **外观** | 对外简化子系统调用 |
| `FilterRegistrationBean` | **装饰/链** | 包装 `ServletRequest` |

### 14.1 实战建议

1. **不要手写单例**管理业务 Bean，交给 Spring 容器。
2. **多实现接口 + 注入 List/Map** 代替巨型 `switch`（策略）。
3. **横切关注点**（日志、事务、缓存、鉴权）用 AOP，不要复制粘贴到每个方法。
4. **复杂对象**用 Builder（Lombok 或手写），DTO 用 Record。

---

## 15. 模式选型速查表

| 需求 | 推荐模式 |
|------|----------|
| 全局唯一实例 | Singleton（枚举 / Spring singleton） |
| 按类型创建对象 | Factory Method / 简单工厂 |
| 创建一整套相关对象 | Abstract Factory |
| 构造参数多、不可变对象 | Builder |
| 适配第三方接口 | Adapter |
| 动态叠加功能 | Decorator |
| 控制访问、延迟加载 | Proxy |
| 简化复杂子系统调用 | Facade |
| 状态变更通知多方 | Observer / Spring Event |
| 算法可替换 | Strategy |
| 固定流程、可变步骤 | Template Method |
| 多级校验、过滤 | Chain of Responsibility |

---

## 16. 反模式警示

1. **单例滥用**：把有状态业务类做成单例，导致测试困难与隐式全局状态。
2. **上帝类 Facade**：Facade 只做编排，不包含大量业务规则。
3. **继承爆炸**：为每种组合写子类；应优先考虑装饰器或策略。
4. **过度抽象**：只有两个实现时不必强行上抽象工厂。

---

## 17. 单元测试与模式

```java
@ExtendWith(MockitoExtension.class)
class CheckoutFacadeTest {
  @Mock InventoryService inventory;
  @Mock PaymentService payment;
  @InjectMocks CheckoutFacade facade;

  @Test
  void checkout_success() {
    when(inventory.reserve(any(), anyInt())).thenReturn(true);
    when(payment.charge(any())).thenReturn("PAY-1");

    var result = facade.checkout(new CheckoutRequest("O1", "SKU", 1, BigDecimal.TEN));

    assertThat(result.paymentId()).isEqualTo("PAY-1");
  }
}
```

模式的价值之一是**可替换性**：面向接口编程使 Mock 与 Stub 变得自然。

---

## 18. 小结

掌握 GoF 模式的核心不是背诵 23 种名字，而是识别：

1. **创建**：谁负责 `new`？如何隔离变化？
2. **结构**：如何组合已有类而不改源码？
3. **行为**：算法、流程、通知、职责分配如何解耦？

在 Spring Boot 项目中，**依赖注入承载策略与工厂**，**AOP 承载代理**，**事件机制承载观察者**，**模板类承载模板方法**。理解模式与框架的对应关系，可以避免重复造轮子，并在框架之外（纯领域逻辑、SDK 封装）仍写出清晰可扩展的代码。
