以下是在上述 Spring Boot 常用注解笔记基础上补充了 MyBatis 日志以及 Swagger 相关注解的内容：

# Spring Boot 常用注解笔记

## 一、核心注解

### 1. `@SpringBootApplication`
 - **作用**：这是一个组合注解，包含了 `@Configuration`、`@EnableAutoConfiguration` 和 `@ComponentScan`。它是 Spring Boot 应用的核心注解，用于标记主配置类，开启 Spring Boot 的自动配置功能，扫描指定包及其子包下的组件（如 `@Controller`、`@Service`、`@Repository` 等）。
 - **示例**：
```java
@SpringBootApplication
public class MySpringBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(MySpringBootApplication.class, args);
    }
}
```

## 二、配置相关注解

### 1. `@Configuration`
 - **作用**：表明该类是一个配置类，用于定义 Spring 的配置信息。可以在该类中使用 `@Bean` 注解定义各种 Bean。
 - **示例**：
```java
@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}
```

### 2. `@Value`
 - **作用**：用于将配置文件中的属性值注入到 Bean 的属性中，或者直接注入到普通类的属性中。支持多种数据类型的注入，如基本数据类型、字符串、数组等。
 - **示例**：
```java
@Component
public class MyComponent {
    @Value("${my.property}")
    private String propertyValue;

    //...
}
```

### 3. `@ConfigurationProperties`
 - **作用**：将配置文件中的一组相关属性映射到一个 Java 类对象上，使得配置文件的属性更易于管理和使用。通常与 `@Component` 或 `@Configuration` 一起使用，使该类成为 Spring 容器管理的 Bean。
 - **示例**：
```java
@Component
@ConfigurationProperties(prefix = "myapp")
public class MyAppProperties {
    private String name;
    private int port;

    // 生成对应的 getters 和 setters

    //...
}
```

## 三、依赖注入相关注解

### 1. `@Autowired`
 - **作用**：自动按照类型注入依赖对象。如果有多个同一类型的 Bean，则可以结合 `@Qualifier` 注解指定具体的 Bean 名称进行注入。
 - **示例**：
```java
@Service
public class MyService {
    @Autowired
    private MyRepository myRepository;

    //...
}
```

### 2. `@Resource`
 - **作用**：与 `@Autowired` 类似，用于依赖注入。默认按照名称进行注入，如果找不到对应的名称，则按照类型进行注入。可以通过 `name` 属性指定要注入的 Bean 名称。
 - **示例**：
```java
@Service
public class MyService {
    @Resource(name = "mySpecialRepository")
    private MyRepository myRepository;

    //...
}
```

### 3. `@Inject`
 - **作用**：也是用于依赖注入的注解，功能与 `@Autowired` 相似，但它是 JSR-330 规范中的注解。在使用时需要引入对应的依赖包（如 `javax.inject:javax.inject`）。
 - **示例**：
```java
import javax.inject.Inject;

@Service
public class MyService {
    @Inject
    private MyRepository myRepository;

    //...
}
```

## 四、Web 开发相关注解

### 1. `@Controller`
 - **作用**：用于标记一个类是 Spring MVC 的控制器，处理 HTTP 请求并返回响应。通常与请求处理方法注解（如 `@RequestMapping`、`@GetMapping`、`@PostMapping` 等）一起使用。
 - **示例**：
```java
@Controller
public class MyController {
    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}
```

### 2. `@RestController`
 - **作用**：是 `@Controller` 和 `@ResponseBody` 的组合注解。表示该类是一个 RESTful 风格的控制器，所有请求处理方法的返回值将直接作为响应体写入 HTTP 响应中，而不是返回视图名称。
 - **示例**：
```java
@RestController
public class MyRestController {
    @GetMapping("/api/data")
    public MyData getData() {
        MyData data = new MyData();
        data.setName("example");
        data.setValue(123);
        return data;
    }
}
```

### 3. `@RequestMapping`
 - **作用**：用于映射 HTTP 请求的 URL 到控制器的处理方法上，可以指定请求的 URL 路径、请求方法（GET、POST、PUT、DELETE 等）、请求参数等条件。
 - **示例**：
```java
@Controller
@RequestMapping("/user")
public class UserController {
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public String getUserById(@PathVariable("id") Long id) {
        //...
        return "user";
    }
}
```

### 4. `@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`
 - **作用**：分别是 `@RequestMapping` 的简化注解，用于指定特定的 HTTP 请求方法的映射。
 - **示例**：
```java
@RestController
public class ProductController {
    @GetMapping("/products")
    public List<Product> getProducts() {
        //...
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        //...
        return product;
    }
}
```

### 5. `@PathVariable`
 - **作用**：用于获取 URL 中的路径变量值，并将其绑定到方法的参数上。
 - **示例**：
```java
@Controller
@RequestMapping("/order/{id}")
public class OrderController {
    @GetMapping
    public String getOrderById(@PathVariable("id") Long id) {
        //...
        return "order";
    }
}
```

### 6. `@RequestParam`
 - **作用**：用于获取请求参数的值，并将其绑定到方法的参数上。可以指定参数名称、是否必填、默认值等。
 - **示例**：
```java
@Controller
public class SearchController {
    @GetMapping("/search")
    public String search(@RequestParam("keyword") String keyword) {
        //...
        return "search";
    }
}
```

### 7. `@RequestBody`
 - **作用**：用于将 HTTP 请求体中的数据（通常是 JSON 或 XML 格式）绑定到方法的参数对象上，要求请求的 `Content-Type` 为相应的格式（如 `application/json`）。
 - **示例**：
```java
@RestController
public class UserController {
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        //...
        return user;
    }
}
```

### 8. `@ResponseBody`
 - **作用**：用于将方法的返回值直接作为 HTTP 响应体写入响应中，而不是返回视图名称。通常与 `@Controller` 一起使用，用于返回数据而不是页面。
 - **示例**：
```java
@Controller
public class DataController {
    @GetMapping("/data")
    @ResponseBody
    public MyData getData() {
        MyData data = new MyData();
        data.setName("data");
        data.setValue(456);
        return data;
    }
}
```

## 五、数据库访问相关注解

### 1. `@Repository`
 - **作用**：用于标记数据访问层的组件（DAO 层），表示该类是一个用于访问数据库的仓库类。Spring 会自动为其创建代理对象，并处理异常转换等事务。
 - **示例**：
```java
@Repository
public class MyRepository {
    // 数据库访问操作方法
    //...
}
```

### 2. `@Entity`
 - **作用**：用于标记一个 Java 类是 JPA（Java Persistence API）的实体类，与数据库中的表对应。通常与 `@Table` 注解一起使用，指定表名等信息。
 - **示例**：
```java
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int age;

    // 生成对应的 getters 和 setters

    //...
}
```

### 3. `@Id`
 - **作用**：用于标记实体类中的主键字段。
 - **示例**：（见 `@Entity` 示例中的 `id` 字段）

### 4. `@GeneratedValue`
 - **作用**：用于指定主键的生成策略，如自增长、UUID 等。
 - **示例**：（见 `@Entity` 示例中的 `id` 字段）

### 5. `@Transient`
 - **作用**：用于标记实体类中的字段不需要持久化到数据库中，即该字段不会对应数据库表中的列。
 - **示例**：
```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;
    @Transient
    private String tempField;

    // 生成对应的 getters 和 setters

    //...
}
```

### 6. `@Query`
 - **作用**：用于在 JPA 中自定义查询语句，可以是 JPQL（Java Persistence Query Language）语句或本地 SQL 语句。
 - **示例**：
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.name LIKE %?1%")
    List<User> findUsersByNameContaining(String name);

    @Query(nativeQuery = true, value = "SELECT * FROM user WHERE age >?1")
    List<User> findUsersByAgeGreaterThan(int age);
}
```

## 六、事务管理相关注解

### 1. `@Transactional`
 - **作用**：用于声明一个方法或类需要在事务中执行。可以指定事务的传播行为、隔离级别、回滚条件等属性。当方法执行过程中发生异常时，事务会自动回滚，保证数据的一致性。
 - **示例**：
```java
@Service
@Transactional
public class MyService {
    public void saveData(User user) {
        // 数据库保存操作
        //...
    }
}
```

## 七、定时任务相关注解

### 1. `@Scheduled`
 - **作用**：用于标记一个方法是定时任务方法，可以指定任务的执行时间表达式（如 cron 表达式）或固定的延迟时间、固定的速率等。
 - **示例**：
```java
@Component
public class MyScheduledTasks {
    @Scheduled(cron = "0 0/5 * * * *") // 每 5 分钟执行一次
    public void doSomething() {
        // 定时任务逻辑
        //...
    }
}
```

## 八、MyBatis 相关注解

### 1. `@Mapper`
 - **作用**：标记在接口上，表示该接口是一个 MyBatis 的 Mapper 接口，Spring Boot 会自动扫描并创建其代理对象，将其注入到其他需要使用的地方。
 - **示例**：
```java
@Mapper
public interface UserMapper {
    User getUserById(Long id);
    int insertUser(User user);
}
```

### 2. `@Insert`、`@Update`、`@Delete`、`@Select`
 - **作用**：分别用于定义 MyBatis 的插入、更新、删除和查询 SQL 语句。可以直接在 Mapper 接口方法上使用这些注解来指定对应的 SQL 操作。
 - **示例**：
```java
@Mapper
public interface ProductMapper {
    @Select("SELECT * FROM product WHERE id = #{id}")
    Product getProductById(Long id);

    @Insert("INSERT INTO product(name, price) VALUES(#{name}, #{price})")
    int addProduct(Product product);

    @Update("UPDATE product SET name = #{name}, price = #{price} WHERE id = #{id}")
    int updateProduct(Product product);

    @Delete("DELETE FROM product WHERE id = #{id}")
    int deleteProductById(Long id);
}
```

### 3. `@Results` 和 `@Result`
 - **作用**：当查询结果与实体类属性不完全匹配时，使用 `@Results` 和 `@Result` 注解来定义结果映射关系，将查询结果的列映射到实体类的属性上。
 - **示例**：
```java
@Mapper
public interface OrderMapper {
    @Results({
        @Result(property = "orderId", column = "id"),
        @Result(property = "customerName", column = "customer_name")
    })
    @Select("SELECT id, customer_name FROM orders WHERE order_date > #{startDate}")
    List<Order> getOrdersByDate(Date startDate);
}
```

## 九、Swagger 相关注解

### 1. `@EnableSwagger2`
 - **作用**：在 Spring Boot 应用的主配置类上使用该注解，开启 Swagger 2 的支持，用于自动生成 API 文档。
 - **示例**：
```java
@SpringBootApplication
@EnableSwagger2
public class MySpringBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(MySpringBootApplication.class, args);
    }
}
```

### 2. `@Api`
 - **作用**：用于标记在控制器类上，为该类的 API 提供描述信息，如作者、版本、描述等。
 - **示例**：
```java
@RestController
@Api(tags = "用户管理接口", description = "提供用户相关的操作接口", author = "张三", version = "1.0")
public class UserController {
    //...
}
```

### 3. `@ApiOperation`
 - **作用**：用于标记在控制器的方法上，描述该方法对应的 API 操作的功能、返回值等信息。
 - **示例**：
```java
@RestController
@Api(tags = "用户管理接口")
public class UserController {
    @ApiOperation(value = "根据用户 ID 获取用户信息", notes = "返回指定 ID 的用户详细信息", response = User.class)
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        //...
        return user;
    }
}
```

### 4. `@ApiParam`
 - **作用**：用于标记在控制器方法的参数上，描述参数的含义、是否必填等信息，在 Swagger 生成的文档中展示参数详情。
 - **示例**：
```java
@RestController
@Api(tags = "用户管理接口")
public class UserController {
    @ApiOperation(value = "创建新用户")
    @PostMapping("/users")
    public User createUser(@ApiParam(name = "user", value = "用户对象，包含用户名和密码等信息", required = true) @RequestBody User user) {
        //...
        return user;
    }
}
```
