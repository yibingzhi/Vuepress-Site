---
tags:
  - 开发规范
  - 单元测试
  - JUnit5
  - Mockito
  - AssertJ
title: 单元测试JUnit5详解
createTime: 2026/08/29 16:00:00
permalink: /article/junit5-testing/
---

::: tip 2026 测试栈
Java 后端默认 **JUnit 5 (Jupiter)** + **Mockito** + **AssertJ**。Spring Boot 3 内置 `spring-boot-starter-test`，勿混用 JUnit 4 注解（`@Test` 来自 `org.junit.jupiter.api`）。
:::

## 一、测试金字塔

```
        /\
       /E2E\          少量，慢，贵
      /------\
     /集成测试 \       中等
    /------------\
   /  单元测试     \    大量，快，便宜
  /----------------\
```

| 层级 | 工具 | 速度 |
|------|------|------|
| 单元 | JUnit5 + Mockito | 毫秒级 |
| Web 切片 | @WebMvcTest | 秒级 |
| 全栈 | @SpringBootTest | 秒～分钟 |
| 集成 | Testcontainers | 分钟级 |

---

## 二、依赖与项目结构

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

`spring-boot-starter-test` 包含：

- JUnit Jupiter
- Mockito（含 inline mock final）
- AssertJ
- Hamcrest
- JSONassert
- Spring Test

```
src/test/java
  └── com/example/order
        ├── service/OrderServiceTest.java      # 纯单元
        ├── web/OrderControllerTest.java       # @WebMvcTest
        └── integration/OrderIT.java         # @SpringBootTest + Testcontainers
```

---

## 三、JUnit 5 基础

### 3.1 第一个测试

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void shouldAddTwoNumbers() {
        Calculator calc = new Calculator();
        assertEquals(5, calc.add(2, 3));
    }
}
```

### 3.2 生命周期

```java
import org.junit.jupiter.api.*;

class LifecycleDemo {

    @BeforeAll
    static void initAll() {
        // 类级，执行一次
    }

    @BeforeEach
    void init() {
        // 每个测试前
    }

    @AfterEach
    void tearDown() {
        // 每个测试后
    }

    @AfterAll
    static void tearDownAll() {
    }

    @Test
    void testOne() { }

    @Test
    void testTwo() { }
}
```

### 3.3 显示名称与禁用

```java
@DisplayName("订单服务测试")
class OrderServiceTest {

    @Test
    @DisplayName("创建订单时应生成唯一订单号")
    void createOrder_shouldGenerateUniqueOrderNo() { }

    @Test
    @Disabled("等待库存服务 Mock 完善")
    void pending() { }
}
```

### 3.4 断言（JUnit 内置）

```java
assertAll(
    () -> assertEquals("PAID", order.getStatus()),
    () -> assertNotNull(order.getOrderNo()),
    () -> assertTrue(order.getAmount().compareTo(BigDecimal.ZERO) > 0)
);

assertThrows(InsufficientStockException.class,
    () -> orderService.create(request));

assertTimeout(Duration.ofSeconds(2), () -> slowOperation());
```

---

## 四、AssertJ（推荐）

流式断言，失败信息更清晰。

```java
import static org.assertj.core.api.Assertions.*;

@Test
void assertWithAssertJ() {
    Order order = orderService.create(validRequest());

    assertThat(order)
        .isNotNull()
        .extracting(Order::getStatus, Order::getAmount)
        .containsExactly("PENDING", new BigDecimal("99.00"));

    assertThat(order.getItems())
        .hasSize(2)
        .extracting(OrderItem::getSku)
        .containsExactly("SKU-A", "SKU-B");

    assertThatThrownBy(() -> orderService.pay(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("orderId");
}
```

集合、异常、时间断言：

```java
assertThat(list).isEmpty();
assertThat(map).containsEntry("key", "value");
assertThat(actual).isCloseTo(expected, within(BigDecimal.valueOf(0.01)));
assertThat(instant).isBefore(Instant.now());
```

---

## 五、Mockito

### 5.1 创建 Mock

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private OrderService orderService;

    @Test
    void createOrder_whenStockOk_shouldSave() {
        when(inventoryClient.checkStock("SKU-1", 2)).thenReturn(true);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        Order result = orderService.create(buildRequest());

        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository).save(any(Order.class));
        verify(inventoryClient).checkStock("SKU-1", 2);
        verifyNoMoreInteractions(orderRepository);
    }
}
```

### 5.2 常用 API

```java
// 返回值
when(repo.findById(1L)).thenReturn(Optional.of(order));
when(repo.findById(99L)).thenReturn(Optional.empty());

// 抛异常
when(client.call()).thenThrow(new RemoteException("timeout"));

// void 方法
doNothing().when(repo).deleteById(1L);
doThrow(new RuntimeException()).when(repo).flush();

// 参数匹配
when(repo.findByStatus(anyString())).thenReturn(List.of());
verify(repo).save(argThat(o -> o.getAmount().signum() > 0));

// 调用次数
verify(repo, times(1)).save(any());
verify(repo, never()).delete(any());
```

### 5.3 @Captor

```java
@Captor
private ArgumentCaptor<Order> orderCaptor;

@Test
void shouldPassCorrectOrderToRepo() {
    orderService.create(request);
    verify(orderRepository).save(orderCaptor.capture());

    Order saved = orderCaptor.getValue();
    assertThat(saved.getUserId()).isEqualTo(100L);
}
```

### 5.4 Mock static / final（mockito-inline）

```java
try (MockedStatic<IdGenerator> mocked = mockStatic(IdGenerator.class)) {
    mocked.when(IdGenerator::nextOrderNo).thenReturn("O-FIXED-001");
    Order order = orderService.create(request);
    assertThat(order.getOrderNo()).isEqualTo("O-FIXED-001");
}
```

---

## 六、参数化测试

```java
@ParameterizedTest
@ValueSource(strings = { "", "  ", "\t" })
void shouldRejectBlankSku(String sku) {
    assertThatThrownBy(() -> validator.validateSku(sku))
        .isInstanceOf(IllegalArgumentException.class);
}

@ParameterizedTest
@CsvSource({
    "2, 3, 5",
    "0, 0, 0",
    "-1, 1, 0"
})
void add(int a, int b, int expected) {
    assertThat(new Calculator().add(a, b)).isEqualTo(expected);
}

@ParameterizedTest
@MethodSource("orderStatusProvider")
void isCancellable(String status, boolean expected) {
    assertThat(OrderRules.isCancellable(status)).isEqualTo(expected);
}

static Stream<Arguments> orderStatusProvider() {
    return Stream.of(
        Arguments.of("PENDING", true),
        Arguments.of("PAID", false),
        Arguments.of("SHIPPED", false)
    );
}
```

---

## 七、SpringBootTest vs @WebMvcTest

### 7.1 对比

| 注解 | 加载上下文 | 适用 |
|------|------------|------|
| `@SpringBootTest` | 完整或自定义 | 集成测试、Repository、全链路 |
| `@WebMvcTest` | 仅 Web 层 | Controller 单元测试 |
| `@DataJpaTest` | JPA + 内存库 | Repository |
| `@JsonTest` | Jackson | JSON 序列化 |

### 7.2 @WebMvcTest

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void getOrder_shouldReturn200() throws Exception {
        OrderDTO dto = new OrderDTO(1L, "O-001", "PAID");
        when(orderService.getById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/orders/1")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderNo").value("O-001"))
            .andExpect(jsonPath("$.status").value("PAID"));

        verify(orderService).getById(1L);
    }

    @Test
    void createOrder_invalidBody_shouldReturn400() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }
}
```

`@MockBean` 替换 Spring 容器中 Bean；`@WebMvcTest` **不加载** Service 真实实现。

### 7.3 @SpringBootTest

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void clean() {
        orderRepository.deleteAll();
    }

    @Test
    void fullCreateFlow() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"userId":1,"items":[{"sku":"A","qty":1}]}
                    """))
            .andExpect(status().isCreated());

        assertThat(orderRepository.count()).isEqualTo(1);
    }
}
```

### 7.4 随机端口与 TestRestTemplate

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiE2ETest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void health() {
        ResponseEntity<String> res = restTemplate.getForEntity("/actuator/health", String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

### 7.5 测试切片选择原则

```
只测 Controller 入参校验、HTTP 状态、JSON 结构？
  → @WebMvcTest + @MockBean Service

要测 Service + DB？
  → @SpringBootTest 或 @DataJpaTest

要测真实 MySQL 方言？
  → @SpringBootTest + Testcontainers
```

---

## 八、Testcontainers 简要

使用 Docker 启动真实 MySQL/Redis，避免 H2 与 MySQL 方言差异。

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>mysql</artifactId>
    <scope>test</scope>
</dependency>
```

```java
@SpringBootTest
@Testcontainers
class OrderRepositoryIT {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4")
        .withDatabaseName("test_db")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void shouldPersistOrder() {
        Order order = Order.builder().orderNo("O-IT-001").build();
        orderRepository.save(order);
        assertThat(orderRepository.findByOrderNo("O-IT-001")).isPresent();
    }
}
```

```java
// 可复用单例容器加速（同一 JVM 测试套件）
@TestConfiguration
public class ContainersConfig {

    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    static {
        MYSQL.start();
    }
}
```

CI 需 Docker（GitHub Actions `ubuntu-latest` 默认支持）。

---

## 九、测试数据与 Fixture

### 9.1 Builder / Factory

```java
public class OrderTestFactory {

    public static CreateOrderRequest validRequest() {
        return new CreateOrderRequest(1L, List.of(
            new ItemRequest("SKU-A", 2)
        ));
    }
}
```

### 9.2 @Sql

```java
@Test
@Sql("/sql/orders-seed.sql")
void shouldListOrders() {
    List<Order> orders = orderRepository.findAll();
    assertThat(orders).hasSize(3);
}

@Test
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
void isolatedTest() { }
```

---

## 十、覆盖率

### 10.1 JaCoCo（Maven）

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
    </executions>
</plugin>
```

```bash
./mvnw test jacoco:report
# 报告：target/site/jacoco/index.html
```

### 10.2 覆盖率建议

| 指标 | 建议 |
|------|------|
| 行覆盖率 | 核心业务 ≥ 80% |
| 分支覆盖率 | 关键计费、状态机重点覆盖 |
| 无意义覆盖 | 不为覆盖率测 getter/setter |

**测行为不测实现：** 关注公共 API 与业务规则，避免断言内部私有方法调用次数导致脆弱测试。

### 10.3 CI 门禁

```yaml
- run: ./mvnw -B verify
- uses: codecov/codecov-action@v4
  with:
  files: target/site/jacoco/jacoco.xml
```

---

## 十一、测试命名与组织

### 11.1 命名 convention

```
methodName_condition_expectedResult
```

示例：`createOrder_whenStockInsufficient_shouldThrow`

### 11.2 @Nested

```java
@DisplayName("OrderService")
class OrderServiceTest {

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void success() { }

        @Test
        void insufficientStock() { }
    }

    @Nested
    @DisplayName("cancel")
    class Cancel {
        @Test
        void whenPaid_shouldReject() { }
    }
}
```

---

## 十二、时间与随机性

```java
// 注入 Clock 便于测试
@Service
@RequiredArgsConstructor
public class OrderService {
    private final Clock clock;

    public Order create() {
        return Order.builder()
            .createdAt(Instant.now(clock))
            .build();
    }
}

@Test
void shouldUseFixedClock() {
    Clock fixed = Clock.fixed(Instant.parse("2026-08-29T08:00:00Z"), ZoneOffset.UTC);
    OrderService service = new OrderService(fixed, ...);
    // ...
}
```

---

## 十三、常见坑

| 坑 | 说明 |
|----|------|
| `@Transactional` 测试不回滚数据 | 默认回滚；`@Commit` 显式提交 |
| `@MockBean` 过慢 | 全量 `@SpringBootTest` 每个测试重建上下文；用 `@WebMvcTest` 或 `@Import` 最小配置 |
| 测试顺序依赖 | 禁止；每个测试独立 |
| 静态时间/随机 | 注入 Clock / 固定种子 |
| JUnit 4 混用 | 使用 `org.junit.jupiter.api.Test` |

```java
@SpringBootTest
@Transactional  // 测试后自动回滚
class RepoTest { }
```

---

## 十四、完整示例：Service 单元测试

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService 单元测试")
class OrderServiceUnitTest {

    @Mock OrderRepository orderRepository;
    @Mock InventoryClient inventoryClient;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks OrderService orderService;

    private CreateOrderRequest request;

    @BeforeEach
    void setUp() {
        request = OrderTestFactory.validRequest();
    }

    @Test
    @DisplayName("库存充足时应保存订单并发布事件")
    void create_success() {
        when(inventoryClient.reserve(any())).thenReturn(true);
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(100L);
            return o;
        });

        Order result = orderService.create(request);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(eventPublisher).publishEvent(any(OrderCreatedEvent.class));
    }

    @Test
    @DisplayName("库存不足时应抛异常且不保存")
    void create_insufficientStock() {
        when(inventoryClient.reserve(any())).thenReturn(false);

        assertThatThrownBy(() -> orderService.create(request))
            .isInstanceOf(InsufficientStockException.class);

        verify(orderRepository, never()).save(any());
    }
}
```

---

## 十五、检查清单

- [ ] JUnit 5 + MockitoExtension / Spring Test
- [ ] 断言优先 AssertJ
- [ ] Controller 用 `@WebMvcTest`，业务逻辑纯 Mockito 单测
- [ ] 集成测试 Testcontainers 对齐生产数据库
- [ ] 测试命名表达 condition + expectation
- [ ] JaCoCo 接入 CI，关注核心模块覆盖率
- [ ] 测试快速：单元测试不启 Spring 上下文

---

## 参考

- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito 文档](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Spring Boot Testing](https://docs.spring.io/spring-boot/reference/testing/index.html)
- [Testcontainers](https://java.testcontainers.org/)
