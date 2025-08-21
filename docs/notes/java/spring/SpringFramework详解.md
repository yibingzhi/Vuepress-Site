---
title: SpringFramework详解
createTime: 2025/08/07 17:23:12
permalink: /框架技术/d6w5k1vy/
---
### 一、Spring 开发理念与设计哲学

#### 1. Spring 的设计原则

**Spring Framework 遵循以下核心设计原则：**

1. **单一职责原则 (SRP)**：每个Bean只负责一个功能
2. **开闭原则 (OCP)**：对扩展开放，对修改关闭
3. **依赖倒置原则 (DIP)**：依赖抽象而非具体实现
4. **接口隔离原则 (ISP)**：使用多个专门的接口而非单一的总接口
5. **里氏替换原则 (LSP)**：子类可以替换父类

#### 2. Spring 的设计模式

**Spring 中使用了大量的设计模式：**

```java
// 1. 工厂模式 - BeanFactory
public interface BeanFactory {
    Object getBean(String name);
    <T> T getBean(String name, Class<T> requiredType);
}

// 2. 单例模式 - 默认Bean作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class SingletonService {
    // 整个应用只有一个实例
}

// 3. 代理模式 - AOP实现
@Aspect
@Component
public class LoggingAspect {
    // 通过代理实现日志记录
}

// 4. 模板方法模式 - JdbcTemplate
public class JdbcTemplate extends JdbcAccessor implements JdbcOperations {
    // 定义算法骨架，子类实现具体步骤
}

// 5. 观察者模式 - 事件机制
@EventListener
public void handleUserCreated(UserCreatedEvent event) {
    // 监听事件并处理
}
```

#### 3. Spring 的核心理念

**Spring 的核心理念可以用一句话概括：**
> "让Java开发变得简单、高效、优雅"

**具体体现在：**

1. **约定优于配置**：提供合理的默认配置
2. **面向接口编程**：降低耦合度
3. **非侵入式设计**：不强制继承或实现特定接口
4. **统一异常处理**：提供一致的异常处理机制
5. **声明式编程**：通过注解声明意图，而非命令式代码

### 二、Spring 核心概念

#### 1. IoC（控制反转）

**IoC（Inversion of Control）** 是Spring的核心概念，将对象的创建和依赖关系的管理交给Spring容器。

**什么是控制反转？**
控制反转是一种设计思想，它改变了传统的对象创建和依赖管理方式：
- **传统方式**：对象自己创建依赖的对象，控制权在对象内部
- **IoC方式**：由外部容器负责创建和注入依赖，控制权转移到容器

**为什么需要IoC？**
1. **解耦**：对象不需要知道如何创建依赖对象
2. **灵活性**：可以轻松替换依赖的实现
3. **可测试性**：便于进行单元测试和模拟测试
4. **生命周期管理**：容器统一管理对象的创建、初始化、销毁

**传统方式 vs IoC方式：**

```java
// 传统方式：手动创建对象，紧耦合
public class UserService {
    private UserDao userDao = new UserDaoImpl();  // 直接依赖具体实现
    private EmailService emailService = new EmailServiceImpl();
    
    public void createUser(User user) {
        userDao.save(user);
        emailService.sendWelcomeEmail(user.getEmail());
    }
}

// IoC方式：由Spring容器管理，松耦合
@Component
public class UserService {
    private final UserDao userDao;           // 依赖抽象
    private final EmailService emailService; // 依赖抽象
    
    // 构造器注入，推荐方式
    public UserService(UserDao userDao, EmailService emailService) {
        this.userDao = userDao;
        this.emailService = emailService;
    }
    
    public void createUser(User user) {
        userDao.save(user);
        emailService.sendWelcomeEmail(user.getEmail());
    }
}
```

**IoC容器的核心接口：**

**BeanFactory - 基础容器接口**
BeanFactory是Spring IoC容器的根接口，提供了最基本的Bean管理功能：
- **getBean()**：获取Bean实例，支持按名称或类型获取
- **containsBean()**：检查容器中是否包含指定名称的Bean
- **isSingleton/isPrototype()**：判断Bean的作用域类型
- **getType()**：获取Bean的类型信息

**为什么需要BeanFactory？**
1. **最小化依赖**：只提供核心的Bean管理功能
2. **轻量级**：适合在资源受限的环境中使用
3. **扩展性**：为高级容器提供基础接口

```java
// BeanFactory - 基础容器接口
public interface BeanFactory {
    Object getBean(String name);
    <T> T getBean(String name, Class<T> requiredType);
    <T> T getBean(Class<T> requiredType);
    boolean containsBean(String name);
    boolean isSingleton(String name);
    boolean isPrototype(String name);
}
```

**ApplicationContext - 高级容器接口**
ApplicationContext继承BeanFactory，并添加了企业级功能：
- **继承BeanFactory**：提供所有Bean管理功能
- **ApplicationEventPublisher**：支持事件发布和监听
- **ResourceLoader**：支持资源加载（文件、类路径等）
- **MessageSource**：支持国际化消息
- **Environment**：支持环境配置管理

**为什么需要ApplicationContext？**
1. **功能丰富**：提供企业级应用需要的所有功能
2. **自动装配**：支持注解驱动的自动装配
3. **AOP支持**：内置AOP代理支持
4. **Web支持**：提供Web应用相关的功能

```java
// ApplicationContext - 高级容器接口，继承BeanFactory
public interface ApplicationContext extends BeanFactory, 
    ApplicationEventPublisher, ResourceLoader, MessageSource {
    
    String getApplicationName();
    ApplicationContext getParent();
    AutowireCapableBeanFactory getAutowireCapableBeanFactory();
}
```

**两个接口的关系和选择：**
- **BeanFactory**：适合轻量级应用，只使用核心功能
- **ApplicationContext**：适合企业级应用，需要完整功能
- **ApplicationContext**内部使用**BeanFactory**作为Bean管理的基础

**Bean的生命周期：**

**什么是Bean生命周期？**
Bean生命周期是指Spring容器中Bean从创建到销毁的整个过程。Spring提供了丰富的生命周期回调机制，让开发者可以在Bean的不同阶段执行自定义逻辑。

**生命周期阶段详解：**

1. **实例化阶段**：创建Bean的实例对象
2. **属性注入阶段**：设置Bean的属性值
3. **Aware接口回调阶段**：让Bean感知Spring容器
4. **初始化阶段**：执行初始化逻辑
5. **使用阶段**：Bean可以被正常使用
6. **销毁阶段**：执行清理和销毁逻辑

**为什么需要生命周期管理？**
1. **资源管理**：确保资源正确初始化和释放
2. **状态管理**：在合适的时机设置Bean状态
3. **扩展性**：提供钩子让开发者自定义行为
4. **一致性**：统一管理所有Bean的生命周期

```java
public class CustomBean implements InitializingBean, DisposableBean {
    
    // 1. 构造方法 - 创建Bean实例
    public CustomBean() {
        System.out.println("1. 构造方法 - 创建Bean实例");
    }
    
    // 2. 属性注入 - Spring设置Bean的属性值
    @Value("${app.name}")
    private String appName;
    
    // 3. BeanNameAware - 让Bean知道自己的名称
    @Override
    public void setBeanName(String name) {
        System.out.println("3. BeanNameAware - Bean名称: " + name);
        // 可以用于日志记录、标识等
    }
    
    // 4. BeanFactoryAware - 让Bean感知BeanFactory
    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        System.out.println("4. BeanFactoryAware - 可以访问BeanFactory");
        // 可以动态获取其他Bean
    }
    
    // 5. ApplicationContextAware - 让Bean感知ApplicationContext
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        System.out.println("5. ApplicationContextAware - 可以访问ApplicationContext");
        // 可以访问环境配置、事件发布等
    }
    
    // 6. @PostConstruct - JSR-250注解，在属性注入后执行
    @PostConstruct
    public void postConstruct() {
        System.out.println("6. @PostConstruct - 属性注入完成后的初始化");
        // 适合进行一些依赖检查、数据验证等
    }
    
    // 7. InitializingBean - Spring接口，在属性注入后执行
    @Override
    public void afterPropertiesSet() {
        System.out.println("7. InitializingBean.afterPropertiesSet - Spring接口初始化");
        // 适合进行一些Spring相关的初始化
    }
    
    // 8. 自定义初始化方法 - 通过配置指定的初始化方法
    public void init() {
        System.out.println("8. 自定义初始化方法 - 业务相关的初始化");
        // 适合进行业务相关的初始化，如连接池、缓存等
    }
    
    // 9. 业务方法 - Bean可以正常使用
    public void doSomething() {
        System.out.println("9. 业务方法 - Bean正常使用阶段");
        // 此时Bean已经完全初始化，可以安全使用
    }
    
    // 10. @PreDestroy - JSR-250注解，在Bean销毁前执行
    @PreDestroy
    public void preDestroy() {
        System.out.println("10. @PreDestroy - Bean销毁前的清理");
        // 适合进行一些资源清理、状态保存等
    }
    
    // 11. DisposableBean - Spring接口，在Bean销毁时执行
    @Override
    public void destroy() {
        System.out.println("11. DisposableBean.destroy - Spring接口销毁");
        // 适合进行Spring相关的清理工作
    }
    
    // 12. 自定义销毁方法 - 通过配置指定的销毁方法
    public void cleanup() {
        System.out.println("12. 自定义销毁方法 - 业务相关的清理");
        // 适合进行业务相关的清理，如关闭连接、释放资源等
    }
}
```

**生命周期回调的执行顺序：**
1. 构造方法 → 2. 属性注入 → 3. Aware接口 → 4. @PostConstruct → 5. InitializingBean → 6. 自定义初始化 → 7. 使用阶段 → 8. @PreDestroy → 9. DisposableBean → 10. 自定义销毁

#### 2. DI（依赖注入）

**什么是依赖注入？**
依赖注入（Dependency Injection）是IoC的一种实现方式，它通过外部容器将依赖对象注入到目标对象中，而不是让目标对象自己创建依赖对象。

**为什么需要依赖注入？**
1. **解耦**：目标对象不需要知道如何创建依赖对象
2. **可测试性**：便于在测试中注入模拟对象
3. **灵活性**：可以轻松替换依赖的实现
4. **生命周期管理**：容器统一管理依赖对象的生命周期

**三种注入方式：**

```java
@Component
public class UserService {
    
    // 1. 构造器注入（推荐）
    private final UserDao userDao;
    
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
    
    // 2. Setter注入
    private EmailService emailService;
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
    
    // 3. 字段注入
    @Autowired
    private LogService logService;
}

**各种注入方式的特点：**

1. **构造器注入（推荐）**：
   - **优点**：依赖不可变、确保依赖完整性、便于测试
   - **缺点**：参数较多时构造器会很长
   - **适用场景**：必需的依赖、依赖数量较少

2. **Setter注入**：
   - **优点**：可以动态修改依赖、支持可选依赖
   - **缺点**：依赖可能为null、状态不稳定
   - **适用场景**：可选的依赖、需要动态修改依赖

3. **字段注入**：
   - **优点**：代码简洁、使用方便
   - **缺点**：无法设置final、难以测试、依赖关系不明确
   - **适用场景**：简单的依赖注入、快速原型开发
```

**@Qualifier注解：**

**什么时候需要使用@Qualifier？**
当Spring容器中存在多个相同类型的Bean时，Spring无法自动确定注入哪一个，这时需要使用@Qualifier注解来指定具体的Bean。

**为什么会出现多个相同类型的Bean？**
1. **接口的多个实现**：如UserDao接口有MySQL和Redis两种实现
2. **配置类中定义的Bean**：通过@Bean方法创建的同类型Bean
3. **不同配置文件的Bean**：如开发环境和生产环境的不同配置

**@Qualifier的工作原理：**
Spring会先按类型查找Bean，如果找到多个，再按@Qualifier指定的名称进行精确匹配。

```java
@Component
public class UserService {
    
    @Autowired
    @Qualifier("mysqlUserDao")  // 指定具体的Bean
    private UserDao userDao;
}

@Component("mysqlUserDao")
public class MySQLUserDao implements UserDao {
    // MySQL实现
}

@Component("redisUserDao")
public class RedisUserDao implements UserDao {
    // Redis实现
}
```

**其他解决多Bean冲突的方法：**
1. **@Primary注解**：标记首选的Bean
2. **@Conditional注解**：根据条件选择Bean
3. **配置类分离**：将不同环境的配置分开

### 二、AOP（面向切面编程）

#### 1. AOP 核心概念

```java
// 切面
@Aspect
@Component
public class LoggingAspect {
    
    // 切点
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}
    
    // 前置通知
    @Before("serviceMethods()")
    public void beforeMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Before method: " + methodName);
    }
    
    // 后置通知
    @After("serviceMethods()")
    public void afterMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("After method: " + methodName);
    }
    
    // 环绕通知
    @Around("serviceMethods()")
    public Object aroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        Object result = joinPoint.proceed();
        
        long end = System.currentTimeMillis();
        System.out.println("Method execution time: " + (end - start) + "ms");
        
        return result;
    }
    
    // 异常通知
    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        System.out.println("Exception in method: " + ex.getMessage());
    }
}
```

#### 2. 自定义注解实现AOP

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
}

// 使用注解的切面
@Aspect
@Component
public class LogExecutionTimeAspect {
    
    @Around("@annotation(LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        Object result = joinPoint.proceed();
        
        long end = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        System.out.println(methodName + " executed in " + (end - start) + "ms");
        
        return result;
    }
}

// 在方法上使用注解
@Service
public class UserService {
    
    @LogExecutionTime
    public User findUserById(Long id) {
        // 业务逻辑
        return userRepository.findById(id);
    }
}
```

### 三、事务管理

#### 1. 声明式事务

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    // 默认事务传播行为：REQUIRED
    public void createUser(User user) {
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail());
    }
    
    // 新事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId);
        user.setStatus(status);
        userRepository.save(user);
    }
    
    // 只读事务
    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    // 指定隔离级别
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void criticalOperation() {
        // 需要最高隔离级别的操作
    }
}
```

#### 2. 编程式事务

```java
@Service
public class UserService {
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    public void createUserWithTransaction(User user) {
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    userRepository.save(user);
                    emailService.sendWelcomeEmail(user.getEmail());
                } catch (Exception e) {
                    status.setRollbackOnly();
                    throw e;
                }
            }
        });
    }
}
```

#### 3. 事务传播行为

```java
@Service
public class OrderService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Transactional
    public void createOrder(Order order) {
        // 主事务
        orderRepository.save(order);
        
        // 调用其他服务
        userService.updateUserPoints(order.getUserId(), order.getPoints());
        inventoryService.reduceStock(order.getProductId(), order.getQuantity());
    }
}

@Service
public class UserService {
    
    @Transactional(propagation = Propagation.REQUIRED)  // 默认，加入当前事务
    public void updateUserPoints(Long userId, int points) {
        // 如果外层有事务，加入；否则创建新事务
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)  // 总是创建新事务
    public void sendNotification(Long userId) {
        // 总是创建新事务，不受外层事务影响
    }
    
    @Transactional(propagation = Propagation.SUPPORTS)  // 支持当前事务
    public User getUserById(Long userId) {
        // 如果外层有事务，加入；否则非事务执行
    }
    
    @Transactional(propagation = Propagation.NOT_SUPPORTED)  // 不支持事务
    public void logUserAction(String action) {
        // 总是非事务执行
    }
}
```

### 四、数据访问层

#### 1. JdbcTemplate

```java
@Repository
public class UserDaoImpl implements UserDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public User findById(Long id) {
        String sql = "SELECT id, name, email FROM users WHERE id = ?";
        
        return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) -> {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            return user;
        });
    }
    
    @Override
    public List<User> findAll() {
        String sql = "SELECT id, name, email FROM users";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            return user;
        });
    }
    
    @Override
    public void save(User user) {
        String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
        jdbcTemplate.update(sql, user.getName(), user.getEmail());
    }
    
    @Override
    public void update(User user) {
        String sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getId());
    }
    
    @Override
    public void deleteById(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
```

#### 2. 批量操作

```java
@Repository
public class BatchUserDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void batchInsert(List<User> users) {
        String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
        
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                User user = users.get(i);
                ps.setString(1, user.getName());
                ps.setString(2, user.getEmail());
            }
            
            @Override
            public int getBatchSize() {
                return users.size();
            }
        });
    }
    
    public void batchUpdate(List<User> users) {
        String sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                User user = users.get(i);
                ps.setString(1, user.getName());
                ps.setString(2, user.getEmail());
                ps.setLong(3, user.getId());
            }
            
            @Override
            public int getBatchSize() {
                return users.size();
            }
        });
    }
}
```

### 五、Spring MVC

#### 1. 控制器配置

```java
@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET /users
    @GetMapping
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // GET /users/{id}
    @GetMapping("/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user/detail";
    }
    
    // GET /users/new
    @GetMapping("/new")
    public String newUserForm(Model model) {
        model.addAttribute("user", new User());
        return "user/form";
    }
    
    // POST /users
    @PostMapping
    public String createUser(@Valid @ModelAttribute User user, 
                           BindingResult result, 
                           RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "user/form";
        }
        
        userService.save(user);
        redirectAttributes.addFlashAttribute("message", "User created successfully");
        return "redirect:/users";
    }
    
    // PUT /users/{id}
    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<User> updateUser(@PathVariable Long id, 
                                         @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.update(user);
        return ResponseEntity.ok(updatedUser);
    }
    
    // DELETE /users/{id}
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // 异常处理
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("User not found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

#### 2. 拦截器

```java
@Component
public class LoggingInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) throws Exception {
        logger.info("Request URL: {}", request.getRequestURL());
        logger.info("Request Method: {}", request.getMethod());
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, 
                          HttpServletResponse response, 
                          Object handler, 
                          ModelAndView modelAndView) throws Exception {
        logger.info("Response Status: {}", response.getStatus());
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                              HttpServletResponse response, 
                              Object handler, 
                              Exception ex) throws Exception {
        if (ex != null) {
            logger.error("Exception occurred: {}", ex.getMessage());
        }
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private LoggingInterceptor loggingInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/static/**", "/error");
    }
}
```

### 六、Spring Security

#### 1. 基本配置

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout=true")
                .permitAll()
            )
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### 2. 自定义认证

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(user.getPassword())
            .roles(user.getRoles().toArray(new String[0]))
            .build();
    }
}

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public Authentication authenticate(Authentication authentication) 
            throws AuthenticationException {
        
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        if (passwordEncoder.matches(password, userDetails.getPassword())) {
            return new UsernamePasswordAuthenticationToken(
                userDetails, password, userDetails.getAuthorities());
        } else {
            throw new BadCredentialsException("Invalid password");
        }
    }
    
    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}
```

### 七、Spring 事件机制

#### 1. 自定义事件

```java
// 自定义事件
public class UserCreatedEvent extends ApplicationEvent {
    private final User user;
    
    public UserCreatedEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
    
    public User getUser() {
        return user;
    }
}

// 事件监听器
@Component
public class UserEventListener {
    
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        User user = event.getUser();
        System.out.println("User created: " + user.getName());
        // 发送欢迎邮件、初始化用户数据等
    }
    
    @EventListener
    @Async
    public void handleUserCreatedAsync(UserCreatedEvent event) {
        // 异步处理
        User user = event.getUser();
        // 异步发送通知
    }
    
    @EventListener(condition = "#event.user.email != null")
    public void handleUserWithEmail(UserCreatedEvent event) {
        // 条件监听
        User user = event.getUser();
        // 处理有邮箱的用户
    }
}

// 发布事件
@Service
public class UserService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void createUser(User user) {
        // 保存用户
        userRepository.save(user);
        
        // 发布事件
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));
    }
}
```

### 八、Spring 配置管理

#### 1. 属性配置

```java
@Configuration
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Value("${app.name}")
    private String appName;
    
    @Value("${app.version}")
    private String appVersion;
    
    @Value("${database.url}")
    private String databaseUrl;
    
    @Bean
    public DataSource dataSource() {
        // 使用配置的属性创建数据源
        return new DriverManagerDataSource(databaseUrl);
    }
}

// 配置属性类
@ConfigurationProperties(prefix = "app")
@Component
public class AppProperties {
    private String name;
    private String version;
    private Database database = new Database();
    
    // getters and setters
    
    public static class Database {
        private String url;
        private String username;
        private String password;
        
        // getters and setters
    }
}
```

#### 2. 条件配置

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "mysql")
    public DataSource mysqlDataSource() {
        // MySQL数据源配置
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "postgresql")
    public DataSource postgresqlDataSource() {
        // PostgreSQL数据源配置
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    public DataSource mysqlDataSourceWithClass() {
        // 基于类路径的条件配置
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource defaultDataSource() {
        // 默认数据源
        return new DriverManagerDataSource();
    }
}
```

### 九、Spring 测试

#### 1. 单元测试

```java
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {TestConfig.class})
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testFindUserById() {
        // Given
        User user = new User();
        user.setId(1L);
        user.setName("John");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // When
        User result = userService.findById(1L);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John");
        verify(userRepository).findById(1L);
    }
    
    @Test
    void testCreateUser() {
        // Given
        User user = new User();
        user.setName("Jane");
        user.setEmail("jane@example.com");
        
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        // When
        User result = userService.createUser(user);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Jane");
        verify(userRepository).save(user);
    }
}
```

#### 2. 集成测试

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver"
})
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    @Transactional
    void testCreateAndFindUser() {
        // Given
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        
        // When
        User savedUser = userService.createUser(user);
        User foundUser = userService.findById(savedUser.getId());
        
        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getName()).isEqualTo("Test User");
        assertThat(foundUser.getEmail()).isEqualTo("test@example.com");
    }
}
```

### 十、性能优化

#### 1. Bean作用域

```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)  // 默认单例
public class SingletonService {
    // 单例Bean，整个应用只有一个实例
}

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)  // 原型
public class PrototypeService {
    // 原型Bean，每次注入都创建新实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class SessionService {
    // 会话作用域，每个HTTP会话一个实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestService {
    // 请求作用域，每个HTTP请求一个实例
}
```

#### 2. 懒加载

```java
@Component
public class HeavyService {
    
    @Lazy
    @Autowired
    private ExpensiveService expensiveService;
    
    public void doSomething() {
        // expensiveService只有在真正使用时才会被初始化
        expensiveService.performExpensiveOperation();
    }
}
```

#### 3. 异步处理

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}

@Service
public class AsyncService {
    
    @Async
    public CompletableFuture<String> processAsync(String input) {
        // 异步处理
        try {
            Thread.sleep(1000);
            return CompletableFuture.completedFuture("Processed: " + input);
        } catch (InterruptedException e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    @Async
    public void processAsyncVoid(String input) {
        // 无返回值的异步处理
        System.out.println("Processing: " + input);
    }
}
```

### 三、Spring 源码分析

#### 1. Spring 容器启动流程

**为什么要分析Spring源码？**
1. **理解原理**：了解Spring是如何工作的，知其然知其所以然
2. **解决问题**：当遇到问题时，能够从源码层面分析原因
3. **学习设计**：学习Spring优秀的设计思想和架构模式
4. **性能优化**：了解内部机制，做出更好的性能优化决策

**Spring 容器的启动过程：**

```java
// 1. 创建ApplicationContext
AnnotationConfigApplicationContext context = 
    new AnnotationConfigApplicationContext();

// 2. 注册配置类
context.register(AppConfig.class);

// 3. 刷新容器
context.refresh();

// 4. 获取Bean
UserService userService = context.getBean(UserService.class);

// 5. 关闭容器
context.close();
```

**Spring 容器启动的核心流程：**

**refresh()方法的作用：**
refresh()方法是Spring容器启动的核心方法，它负责完成容器的初始化、Bean的创建和配置的加载。这个方法被设计为可重复调用，支持容器的重新加载。

**为什么需要synchronized？**
1. **线程安全**：防止多线程同时调用refresh()方法
2. **状态一致性**：确保容器状态在刷新过程中保持一致
3. **资源保护**：防止在刷新过程中被其他操作干扰

**各个步骤的作用和意义：**

```java
// AbstractApplicationContext.refresh() 方法的核心流程
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
        // 1. 准备刷新 - 设置启动时间、状态标志等
        prepareRefresh();
        
        // 2. 获取BeanFactory - 创建或获取Bean工厂
        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
        
        // 3. 准备BeanFactory - 设置类加载器、表达式解析器等
        prepareBeanFactory(beanFactory);
        
        // 4. 允许子类修改BeanFactory - 提供扩展点
        postProcessBeanFactory(beanFactory);
        
        // 5. 调用BeanFactoryPostProcessor - 修改Bean定义
        invokeBeanFactoryPostProcessors(beanFactory);
        
        // 6. 注册BeanPostProcessor - 注册Bean后处理器
        registerBeanPostProcessors(beanFactory);
        
        // 7. 初始化消息源 - 支持国际化
        initMessageSource();
        
        // 8. 初始化应用事件广播器 - 支持事件机制
        initApplicationEventMulticaster();
        
        // 9. 初始化特定上下文子类 - 子类扩展点
        onRefresh();
        
        // 10. 注册监听器 - 注册应用监听器
        registerListeners();
        
        // 11. 实例化所有单例Bean - 核心步骤，创建所有单例Bean
        finishBeanFactoryInitialization(beanFactory);
        
        // 12. 完成刷新 - 发布容器刷新完成事件
        finishRefresh();
    }
}
```

**关键步骤详解：**

1. **prepareRefresh()**：设置启动时间、状态标志，验证必要的环境变量
2. **obtainFreshBeanFactory()**：创建新的BeanFactory或获取现有的
3. **prepareBeanFactory()**：配置BeanFactory的标准特性（类加载器、表达式解析器等）
4. **postProcessBeanFactory()**：子类可以在这里修改BeanFactory
5. **invokeBeanFactoryPostProcessors()**：调用所有BeanFactoryPostProcessor，可以修改Bean定义
6. **registerBeanPostProcessors()**：注册所有BeanPostProcessor，用于Bean创建过程中的干预
7. **initMessageSource()**：初始化国际化支持
8. **initApplicationEventMulticaster()**：初始化事件广播器
9. **onRefresh()**：子类可以在这里进行特定的初始化
10. **registerListeners()**：注册应用监听器
11. **finishBeanFactoryInitialization()**：实例化所有非懒加载的单例Bean
12. **finishRefresh()**：发布容器刷新完成事件

#### 2. Bean 创建过程源码分析

**Bean创建的核心流程：**
Bean的创建是Spring容器的核心功能，整个过程包括：Bean定义解析、实例化、属性注入、初始化等步骤。理解这个过程有助于我们更好地使用Spring的各种特性。

**为什么需要复杂的Bean创建流程？**
1. **灵活性**：支持多种Bean创建方式（构造器、工厂方法等）
2. **扩展性**：通过BeanPostProcessor提供扩展点
3. **生命周期管理**：确保Bean正确初始化和销毁
4. **依赖解析**：处理复杂的依赖关系，包括循环依赖

**Bean 创建的核心方法：**

```java
// AbstractBeanFactory.doGetBean() 方法的核心逻辑
protected <T> T doGetBean(String name, Class<T> requiredType, 
                          Object[] args, boolean typeCheckOnly) {
    
    // 1. 转换Bean名称 - 处理FactoryBean的特殊语法
    String beanName = transformedBeanName(name);
    
    // 2. 尝试从缓存获取单例Bean - 避免重复创建
    Object sharedInstance = getSingleton(beanName);
    if (sharedInstance != null && args == null) {
        return (T) getObjectForBeanInstance(sharedInstance, name, beanName, null);
    }
    
    // 3. 检查Bean是否正在创建 - 防止循环依赖导致的无限递归
    if (isPrototypeCurrentlyInCreation(beanName)) {
        throw new BeanCurrentlyInCreationException(beanName);
    }
    
    // 4. 检查父容器 - 支持容器层次结构
    BeanFactory parentBeanFactory = getParentBeanFactory();
    if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
        String nameToLookup = originalBeanName(name);
        if (parentBeanFactory instanceof AbstractBeanFactory) {
            return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
                nameToLookup, requiredType, args, typeCheckOnly);
        }
    }
    
    // 5. 标记Bean正在创建 - 为循环依赖检测做准备
    if (!typeCheckOnly) {
        markBeanAsCreated(beanName);
    }
    
    try {
        // 6. 获取Bean定义 - 获取合并后的Bean定义信息
        RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
        
        // 7. 检查依赖 - 确保依赖的Bean先创建
        String[] dependsOn = mbd.getDependsOn();
        if (dependsOn != null) {
            for (String dependsOnBean : dependsOn) {
                getBean(dependsOnBean);
            }
        }
        
        // 8. 创建Bean实例 - 根据作用域创建Bean
        if (mbd.isSingleton()) {
            // 单例Bean：使用getSingleton方法，支持循环依赖解决
            sharedInstance = getSingleton(beanName, () -> {
                try {
                    return createBean(beanName, mbd, args);
                } catch (BeansException ex) {
                    destroySingleton(beanName);
                    throw ex;
                }
            });
            return (T) getObjectForBeanInstance(sharedInstance, name, beanName, null);
        }
        
        // 9. 创建原型Bean - 每次都创建新实例
        else if (mbd.isPrototype()) {
            Object prototypeInstance = createBean(beanName, mbd, args);
            return (T) getObjectForBeanInstance(prototypeInstance, name, beanName, null);
        }
        
        // 10. 其他作用域 - 如Session、Request等
        else {
            String scopeName = mbd.getScope();
            Scope scope = this.scopes.get(scopeName);
            if (scope == null) {
                throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
            }
            try {
                Object scopedInstance = scope.get(beanName, () -> {
                    return createBean(beanName, mbd, args);
                });
                return (T) getObjectForBeanInstance(scopedInstance, name, beanName, null);
            } catch (IllegalStateException ex) {
                throw new BeanCreationException(beanName, 
                    "Scope '" + scopeName + "' is not active for the current thread", ex);
            }
        }
    } catch (BeansException ex) {
        cleanupBeanAfterCreationException(beanName, ex);
        throw ex;
    }
}
```

**doGetBean方法的关键设计思想：**

1. **缓存优先**：优先从缓存获取，避免重复创建
2. **循环依赖检测**：通过标记机制防止无限递归
3. **作用域支持**：支持不同的Bean作用域（单例、原型、会话等）
4. **依赖预创建**：确保依赖的Bean先创建完成
5. **异常处理**：创建失败时进行清理，保持容器状态一致

**Bean 实例化的核心方法：**

**createBean方法的作用：**
createBean方法是Bean创建的核心入口，它负责协调整个Bean创建过程，包括类解析、方法重写准备、BeanPostProcessor处理等。

**为什么需要方法重写准备？**
Spring支持lookup-method和replace-method等配置，这些配置需要在Bean创建前进行验证和准备。

**BeanPostProcessor的作用：**
BeanPostProcessor是Spring的重要扩展点，可以在Bean创建的不同阶段进行干预，比如AOP代理的创建。

```java
// AbstractAutowireCapableBeanFactory.createBean() 方法
protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) {
    
    // 1. 解析Bean类 - 确定Bean的实际类型
    Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
    if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
        mbd.setBeanClass(resolvedClass);
    }
    
    // 2. 准备方法重写 - 处理lookup-method和replace-method配置
    try {
        mbd.prepareMethodOverrides();
    } catch (BeanDefinitionValidationException ex) {
        throw new BeanDefinitionStoreException(mbd.getResourceDescription(), 
            beanName, "Validation of method overrides failed", ex);
    }
    
    try {
        // 3. 给BeanPostProcessor机会返回代理对象 - AOP代理等
        Object bean = resolveBeforeInstantiation(beanName, mbd);
        if (bean != null) {
            return bean; // 如果BeanPostProcessor返回了对象，直接使用
        }
    } catch (Throwable ex) {
        throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
            "BeanPostProcessor before instantiation of bean failed", ex);
    }
    
    try {
        // 4. 创建Bean实例 - 调用doCreateBean进行实际的创建
        Object beanInstance = doCreateBean(beanName, mbd, args);
        return beanInstance;
    } catch (BeanCreationException | ImplicitlyAppearedSingletonException ex) {
        throw ex;
    } catch (Throwable ex) {
        throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
            "Unexpected exception during bean creation", ex);
    }
}
```

**createBean方法的设计思想：**

1. **分阶段处理**：将Bean创建分为多个阶段，每个阶段都有明确的职责
2. **扩展点支持**：通过BeanPostProcessor提供扩展能力
3. **异常隔离**：不同阶段的异常有不同的处理策略
4. **提前返回**：如果BeanPostProcessor已经创建了对象，直接返回

// doCreateBean() 方法
protected Object doCreateBean(String beanName, RootBeanDefinition mbd, Object[] args) {
    
    // 1. 实例化Bean - 创建Bean的原始实例
    BeanWrapper instanceWrapper = null;
    if (mbd.isSingleton()) {
        instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
    }
    if (instanceWrapper == null) {
        instanceWrapper = createBeanInstance(beanName, mbd, args);
    }
    
    Object bean = instanceWrapper.getWrappedInstance();
    Class<?> beanType = instanceWrapper.getWrappedClass();
    if (beanType != NullBean.class) {
        mbd.resolvedTargetType = beanType;
    }
    
    // 2. 应用MergedBeanDefinitionPostProcessor - 处理合并后的Bean定义
    synchronized (mbd.postProcessingLock) {
        if (!mbd.postProcessed) {
            try {
                applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
            } catch (Throwable ex) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
                    "Post-processing of merged bean definition failed", ex);
            }
            mbd.postProcessed = true;
        }
    }
    
    // 3. 提前暴露Bean引用（解决循环依赖） - 关键步骤
    boolean earlySingletonExposure = (mbd.isSingleton() && 
        this.allowEarlyReference && isSingletonCurrentlyInCreation(beanName));
    if (earlySingletonExposure) {
        addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
    }
    
    // 4. 初始化Bean - 属性注入和初始化方法调用
    Object exposedObject = bean;
    try {
        populateBean(beanName, mbd, instanceWrapper);  // 属性注入
        exposedObject = initializeBean(beanName, exposedObject, mbd);  // 初始化
    } catch (Throwable ex) {
        if (ex instanceof BeanCreationException && 
            beanName.equals(((BeanCreationException) ex).getBeanName())) {
            throw (BeanCreationException) ex;
        } else {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
                "Initialization of bean failed", ex);
        }
    }
    
    // 5. 处理循环依赖 - 检查是否需要替换早期引用
    if (earlySingletonExposure) {
        Object earlySingletonReference = getSingleton(beanName, false);
        if (earlySingletonReference != null) {
            if (exposedObject == bean) {
                exposedObject = earlySingletonReference;
            } else if (!this.allowRawInjectionDespiteWrapping && 
                hasInstantiationAwareBeanPostProcessors()) {
                Object dependentBean = getDependentBean(beanName);
                if (dependentBean != null) {
                    throw new BeanCurrentlyInCreationException(beanName);
                }
            }
        }
    }
    
    // 6. 注册Bean销毁方法 - 为Bean销毁做准备
    try {
        registerDisposableBeanIfNecessary(beanName, bean, mbd);
    } catch (BeanDefinitionValidationException ex) {
        throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
            "Invalid destruction signature", ex);
    }
    
    return exposedObject;
}
```

**doCreateBean方法的关键步骤详解：**

1. **实例化Bean**：调用构造方法创建原始对象，此时属性还未注入
2. **应用PostProcessor**：处理合并后的Bean定义，如@Autowired等注解
3. **提前暴露引用**：将Bean的早期引用放入三级缓存，解决循环依赖
4. **属性注入**：通过populateBean方法注入依赖的属性
5. **初始化**：调用@PostConstruct、InitializingBean等方法
6. **循环依赖处理**：检查是否需要替换早期引用
7. **注册销毁方法**：为Bean销毁做准备
```

#### 3. 循环依赖解决机制

**什么是循环依赖？**
循环依赖是指两个或多个Bean之间相互依赖，形成一个依赖环。比如A依赖B，B又依赖A，这在传统的对象创建中会导致无限递归。

**为什么会出现循环依赖？**
1. **业务逻辑需要**：某些业务场景确实需要相互引用
2. **设计不当**：架构设计时没有考虑依赖关系
3. **注解滥用**：过度使用@Autowired等注解

**Spring 如何解决循环依赖：**

```java
// 循环依赖示例
@Component
public class UserService {
    @Autowired
    private OrderService orderService;
    
    public void createUser() {
        // 创建用户
        orderService.createOrder(); // 调用订单服务
    }
}

@Component
public class OrderService {
    @Autowired
    private UserService userService;
    
    public void createOrder() {
        // 创建订单
        userService.createUser(); // 调用用户服务
    }
}
```

**循环依赖的危害：**
1. **无限递归**：传统创建方式会导致栈溢出
2. **性能问题**：即使能解决，也会影响启动性能
3. **维护困难**：代码逻辑复杂，难以理解和维护

// Spring 解决循环依赖的核心机制
public class DefaultSingletonBeanRegistry {
    
    // 三级缓存
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);           // 一级缓存：完全初始化好的Bean
    private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);                // 二级缓存：早期暴露的Bean引用
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);        // 三级缓存：Bean工厂
    
    // 添加单例工厂
    protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory) {
        synchronized (this.singletonObjects) {
            if (!this.singletonObjects.containsKey(beanName)) {
                this.singletonFactories.put(beanName, singletonFactory);
                this.earlySingletonObjects.remove(beanName);
            }
        }
    }
    
    // 获取早期Bean引用 - 按优先级从三级缓存中查找
    protected Object getSingleton(String beanName, boolean allowEarlyReference) {
        // 1. 从一级缓存获取 - 优先获取完全初始化的Bean
        Object singletonObject = this.singletonObjects.get(beanName);
        if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
            synchronized (this.singletonObjects) {
                // 2. 从二级缓存获取 - 获取早期暴露的Bean引用
                singletonObject = this.earlySingletonObjects.get(beanName);
                if (singletonObject == null && allowEarlyReference) {
                    // 3. 从三级缓存获取 - 通过工厂创建早期引用
                    ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
                    if (singletonFactory != null) {
                        singletonObject = singletonFactory.getObject();
                        this.earlySingletonObjects.put(beanName, singletonObject);
                        this.singletonFactories.remove(beanName);  // 从三级缓存移除
                    }
                }
            }
        }
        return singletonObject;
    }
}
```

**三级缓存的工作原理：**

1. **一级缓存（singletonObjects）**：存储完全初始化好的Bean，可以直接使用
2. **二级缓存（earlySingletonObjects）**：存储早期暴露的Bean引用，用于解决循环依赖
3. **三级缓存（singletonFactories）**：存储Bean工厂，可以创建Bean的早期引用

**为什么需要三级缓存？**
1. **一级缓存**：正常情况下的Bean存储
2. **二级缓存**：避免重复创建早期引用，提高性能
3. **三级缓存**：存储工厂，支持Bean的延迟创建和AOP代理

**三级缓存的查找顺序：**
1. 先查一级缓存（完全初始化的Bean）
2. 再查二级缓存（早期暴露的引用）
3. 最后查三级缓存（通过工厂创建早期引用）
```

**循环依赖解决流程：**

**整个解决过程的关键步骤：**

```java
// 1. UserService 开始创建
// 2. 实例化 UserService（此时属性还未注入）
// 3. 提前暴露 UserService 到三级缓存
addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));

// 4. 开始属性注入，发现需要 OrderService
// 5. 创建 OrderService
// 6. 实例化 OrderService
// 7. 提前暴露 OrderService 到三级缓存
// 8. 开始属性注入，发现需要 UserService
// 9. 从三级缓存获取 UserService 的早期引用
// 10. 完成 OrderService 的创建
// 11. 完成 UserService 的创建
```

**为什么这种方式能解决循环依赖？**

1. **提前暴露**：在Bean完全初始化前就暴露引用，打破循环
2. **三级缓存**：通过工厂模式支持延迟创建和AOP代理
3. **状态标记**：通过标记机制防止重复创建
4. **引用替换**：最终用完全初始化的Bean替换早期引用

**循环依赖解决的局限性：**

1. **只支持单例Bean**：原型Bean无法解决循环依赖
2. **只支持构造器注入**：字段注入和setter注入可以解决
3. **性能影响**：会增加启动时间和内存使用
4. **设计问题**：循环依赖通常是设计不当的表现

---

### 十三、Spring 注解大全

#### 1. 核心注解

**Bean 定义注解：**

```java
// @Component - 通用组件注解
@Component
public class UserService {
    // 会被Spring扫描并注册为Bean
}

// @Service - 服务层注解
@Service
public class UserService {
    // 标识这是一个服务类
}

// @Repository - 数据访问层注解
@Repository
public class UserDaoImpl implements UserDao {
    // 标识这是一个数据访问类
}

// @Controller - 控制器注解
@Controller
public class UserController {
    // 标识这是一个控制器类
}

// @Configuration - 配置类注解
@Configuration
public class AppConfig {
    // 标识这是一个配置类
}

// @Bean - 方法级别的Bean定义
@Configuration
public class DataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean("customDataSource")  // 指定Bean名称
    public DataSource customDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean(initMethod = "init", destroyMethod = "cleanup")
    public CustomService customService() {
        return new CustomService();
    }
}
```

**依赖注入注解：**

```java
// @Autowired - 自动装配
@Component
public class UserService {
    
    // 1. 构造器注入（推荐）
    private final UserDao userDao;
    
    @Autowired  // 可以省略，Spring 4.3+支持隐式构造器注入
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
    
    // 2. Setter注入
    private EmailService emailService;
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
    
    // 3. 字段注入
    @Autowired
    private LogService logService;
    
    // 4. 方法注入
    @Autowired
    public void injectServices(UserDao userDao, EmailService emailService) {
        // 可以注入多个依赖
    }
    
    // 5. 集合注入
    @Autowired
    private List<NotificationService> notificationServices;
    
    // 6. Map注入
    @Autowired
    private Map<String, NotificationService> notificationServiceMap;
}

// @Qualifier - 指定具体的Bean
@Component
public class UserService {
    
    @Autowired
    @Qualifier("mysqlUserDao")
    private UserDao userDao;
}

// @Resource - JSR-250注解，功能类似@Autowired
@Component
public class UserService {
    
    @Resource(name = "mysqlUserDao")
    private UserDao userDao;
    
    @Resource(type = EmailService.class)
    private EmailService emailService;
}

// @Inject - JSR-330注解，功能类似@Autowired
@Component
public class UserService {
    
    @Inject
    private UserDao userDao;
    
    @Inject
    @Named("mysqlUserDao")
    private UserDao namedUserDao;
}
```

**作用域注解：**

```java
// @Scope - 定义Bean作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)  // 单例（默认）
public class SingletonService {
    // 整个应用只有一个实例
}

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)  // 原型
public class PrototypeService {
    // 每次注入都创建新实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class SessionService {
    // 会话作用域，每个HTTP会话一个实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestService {
    // 请求作用域，每个HTTP请求一个实例
}

@Component
@Scope("custom")  // 自定义作用域
public class CustomScopeService {
    // 使用自定义作用域
}
```

#### 2. 配置注解

**配置类注解：**

```java
// @ComponentScan - 组件扫描
@Configuration
@ComponentScan("com.example")  // 扫描指定包
public class AppConfig {
}

@Configuration
@ComponentScan(basePackages = {"com.example.service", "com.example.dao"})
public class AppConfig {
}

@Configuration
@ComponentScan(basePackageClasses = {UserService.class, UserDao.class})
public class AppConfig {
}

// @Import - 导入其他配置类
@Configuration
@Import({DataSourceConfig.class, SecurityConfig.class})
public class AppConfig {
}

// @PropertySource - 属性文件配置
@Configuration
@PropertySource("classpath:application.properties")
@PropertySource("classpath:database.properties")
public class AppConfig {
    
    @Value("${app.name}")
    private String appName;
}

// @ConfigurationProperties - 配置属性绑定
@ConfigurationProperties(prefix = "app")
@Component
public class AppProperties {
    private String name;
    private String version;
    private Database database = new Database();
    
    // getters and setters
    
    public static class Database {
        private String url;
        private String username;
        private String password;
        
        // getters and setters
    }
}
```

**条件注解：**

```java
// @ConditionalOnProperty - 基于属性的条件
@Configuration
public class DatabaseConfig {
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "mysql")
    public DataSource mysqlDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "postgresql")
    public DataSource postgresqlDataSource() {
        return new DriverManagerDataSource();
    }
}

// @ConditionalOnClass - 基于类路径的条件
@Configuration
public class FeatureConfig {
    
    @Bean
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    public MySQLService mysqlService() {
        return new MySQLService();
    }
    
    @Bean
    @ConditionalOnClass(name = "org.postgresql.Driver")
    public PostgreSQLService postgresqlService() {
        return new PostgreSQLService();
    }
}

// @ConditionalOnMissingBean - 基于Bean存在性的条件
@Configuration
public class DefaultConfig {
    
    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource defaultDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnMissingBean(name = "customDataSource")
    public DataSource fallbackDataSource() {
        return new DriverManagerDataSource();
    }
}

// @Profile - 基于Profile的条件
@Configuration
@Profile("dev")
public class DevConfig {
    
    @Bean
    public DataSource devDataSource() {
        return new DriverManagerDataSource("jdbc:h2:mem:devdb");
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    
    @Bean
    public DataSource prodDataSource() {
        return new DriverManagerDataSource("jdbc:mysql://prod-server:3306/proddb");
    }
}
```

#### 3. AOP 注解

**切面注解：**

```java
// @Aspect - 定义切面
@Aspect
@Component
public class LoggingAspect {
    
    // @Pointcut - 定义切点
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}
    
    @Pointcut("execution(* com.example.dao.*.*(..))")
    public void daoMethods() {}
    
    @Pointcut("serviceMethods() || daoMethods()")
    public void allMethods() {}
    
    // @Before - 前置通知
    @Before("serviceMethods()")
    public void beforeMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Before method: " + methodName);
    }
    
    // @After - 后置通知
    @After("serviceMethods()")
    public void afterMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("After method: " + methodName);
    }
    
    // @AfterReturning - 返回通知
    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Method " + methodName + " returned: " + result);
    }
    
    // @AfterThrowing - 异常通知
    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Exception in method " + methodName + ": " + ex.getMessage());
    }
    
    // @Around - 环绕通知
    @Around("serviceMethods()")
    public Object aroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long end = System.currentTimeMillis();
            System.out.println("Method execution time: " + (end - start) + "ms");
            return result;
        } catch (Exception e) {
            long end = System.currentTimeMillis();
            System.out.println("Method failed after: " + (end - start) + "ms");
            throw e;
        }
    }
}

// 启用AOP
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
}
```

#### 4. 事务注解

**事务管理注解：**

```java
// @Transactional - 声明式事务
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // 默认事务传播行为：REQUIRED
    public void createUser(User user) {
        userRepository.save(user);
    }
    
    // 新事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId);
        user.setStatus(status);
        userRepository.save(user);
    }
    
    // 只读事务
    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    // 指定隔离级别
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void criticalOperation() {
        // 需要最高隔离级别的操作
    }
    
    // 指定超时时间
    @Transactional(timeout = 30)
    public void longRunningOperation() {
        // 长时间运行的操作
    }
    
    // 指定回滚异常
    @Transactional(rollbackFor = {SQLException.class, IOException.class})
    public void operationWithCustomRollback() {
        // 自定义回滚条件
    }
    
    // 指定不回滚异常
    @Transactional(noRollbackFor = {IllegalArgumentException.class})
    public void operationWithNoRollback() {
        // 某些异常不回滚
    }
}

// 启用事务管理
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

#### 5. Spring MVC 注解

**控制器注解：**

```java
// @Controller - 标识控制器
@Controller
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // @RequestMapping - 请求映射
    @RequestMapping(value = "/users", method = RequestMethod.GET)
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // @GetMapping - GET请求映射
    @GetMapping("/users")
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // @PostMapping - POST请求映射
    @PostMapping("/users")
    public String createUser(@Valid @ModelAttribute User user, 
                           BindingResult result, 
                           RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "user/form";
        }
        
        userService.save(user);
        redirectAttributes.addFlashAttribute("message", "User created successfully");
        return "redirect:/users";
    }
    
    // @PutMapping - PUT请求映射
    @PutMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<User> updateUser(@PathVariable Long id, 
                                         @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.update(user);
        return ResponseEntity.ok(updatedUser);
    }
    
    // @DeleteMapping - DELETE请求映射
    @DeleteMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // @PatchMapping - PATCH请求映射
    @PatchMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<User> patchUser(@PathVariable Long id, 
                                        @RequestBody Map<String, Object> updates) {
        User updatedUser = userService.patchUser(id, updates);
        return ResponseEntity.ok(updatedUser);
    }
}

// 请求参数注解
@Controller
public class UserController {
    
    // @PathVariable - 路径变量
    @GetMapping("/users/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user/detail";
    }
    
    // @PathVariable 指定名称
    @GetMapping("/users/{userId}/orders/{orderId}")
    public String getUserOrder(@PathVariable("userId") Long userId, 
                              @PathVariable("orderId") Long orderId, 
                              Model model) {
        // 处理逻辑
        return "user/order";
    }
    
    // @RequestParam - 请求参数
    @GetMapping("/users")
    public String searchUsers(@RequestParam String name, 
                             @RequestParam(required = false) String email,
                             @RequestParam(defaultValue = "1") int page,
                             @RequestParam(defaultValue = "10") int size,
                             Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @RequestHeader - 请求头
    @GetMapping("/users")
    public String getUsers(@RequestHeader("User-Agent") String userAgent,
                          @RequestHeader(value = "Accept-Language", defaultValue = "en") String language,
                          Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @CookieValue - Cookie值
    @GetMapping("/users")
    public String getUsers(@CookieValue(value = "sessionId", required = false) String sessionId,
                          Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @RequestBody - 请求体
    @PostMapping("/users")
    @ResponseBody
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    // @ModelAttribute - 模型属性
    @ModelAttribute("user")
    public User getUser() {
        return new User();
    }
    
    // @ResponseBody - 响应体
    @GetMapping("/users/{id}")
    @ResponseBody
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // @ResponseStatus - 响应状态
    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public void createUser(@RequestBody User user) {
        userService.save(user);
    }
    
    // @ExceptionHandler - 异常处理
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("User not found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // @ControllerAdvice - 全局异常处理
    @ControllerAdvice
    public class GlobalExceptionHandler {
        
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
            ErrorResponse error = new ErrorResponse("Internal server error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
```

#### 6. Spring Security 注解

**安全注解：**

```java
// @EnableWebSecurity - 启用Web安全
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout=true")
                .permitAll()
            )
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
}

// 方法级安全注解
@Service
public class UserService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId) {
        // 只有ADMIN角色才能调用
    }
    
    @PreAuthorize("hasRole('USER') and #user.id == authentication.principal.id")
    public void updateUser(User user) {
        // 只有USER角色且只能更新自己的信息
    }
    
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public void deleteUserByAuthority(Long userId) {
        // 需要特定权限
    }
    
    @PostAuthorize("returnObject.owner == authentication.principal.username")
    public User getUser(Long userId) {
        // 方法执行后的权限检查
        return userRepository.findById(userId);
    }
    
    @PreFilter("filterObject.owner == authentication.principal.username")
    public void updateUsers(List<User> users) {
        // 过滤输入参数
        userRepository.saveAll(users);
    }
    
    @PostFilter("filterObject.owner == authentication.principal.username")
    public List<User> getUsers() {
        // 过滤返回值
        return userRepository.findAll();
    }
}
```

#### 7. 测试注解

**测试相关注解：**

```java
// @SpringBootTest - Spring Boot测试
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateUser() {
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");
        
        User savedUser = userService.save(user);
        
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("John");
    }
}

// @WebMvcTest - Web层测试
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("John");
        
        when(userService.findById(1L)).thenReturn(user);
        
        mockMvc.perform(get("/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("John"));
    }
}

// @DataJpaTest - 数据层测试
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testSaveUser() {
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");
        
        User savedUser = userRepository.save(user);
        
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
    }
}

// @TestPropertySource - 测试属性配置
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver"
})
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateAndFindUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        
        User savedUser = userService.save(user);
        User foundUser = userService.findById(savedUser.getId());
        
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getName()).isEqualTo("Test User");
    }
}
```

#### 8. 其他重要注解

**缓存注解：**

```java
// @EnableCaching - 启用缓存
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}

// 缓存操作注解
@Service
public class UserService {
    
    @Cacheable("users")
    public User findById(Long id) {
        return userRepository.findById(id);
    }
    
    @CacheEvict("users")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @CachePut("users")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @Caching(evict = {
        @CacheEvict("users"),
        @CacheEvict("userList")
    })
    public void deleteUserAndClearCache(Long id) {
        userRepository.deleteById(id);
    }
}
```

**异步注解：**

```java
// @EnableAsync - 启用异步
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}

// 异步方法注解
@Service
public class AsyncService {
    
    @Async
    public CompletableFuture<String> processAsync(String input) {
        try {
            Thread.sleep(1000);
            return CompletableFuture.completedFuture("Processed: " + input);
        } catch (InterruptedException e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    @Async("customExecutor")
    public void processWithCustomExecutor(String input) {
        // 使用自定义执行器
    }
}
```

**验证注解：**

```java
// @Valid - 启用验证
@PostMapping("/users")
public String createUser(@Valid @ModelAttribute User user, 
                        BindingResult result, 
                        Model model) {
    if (result.hasErrors()) {
        return "user/form";
    }
    
    userService.save(user);
    return "redirect:/users";
}

// 自定义验证注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailValidator.class)
public @interface ValidEmail {
    String message() default "Invalid email format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 使用自定义验证
public class User {
    
    @NotNull
    @Size(min = 2, max = 50)
    private String name;
    
    @ValidEmail
    private String email;
    
    @Min(18)
    private int age;
    
    // getters and setters
}
```

### 十四、最佳实践与常见问题

#### 1. Spring 最佳实践

**Bean 设计原则：**

```java
// 1. 优先使用构造器注入
@Component
public class UserService {
    private final UserDao userDao;
    private final EmailService emailService;
    
    public UserService(UserDao userDao, EmailService emailService) {
        this.userDao = userDao;
        this.emailService = emailService;
    }
}

// 2. 使用接口而非具体实现
@Service
public class UserService {
    private final UserDao userDao;  // 依赖接口
    
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}

// 3. 合理使用作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class PrototypeService {
    // 只在需要时使用原型作用域
}

// 4. 使用@Configuration而非@Component
@Configuration  // 推荐
public class DataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource();
    }
}
```

**性能优化建议：**

```java
// 1. 使用懒加载
@Component
public class HeavyService {
    
    @Lazy
    @Autowired
    private ExpensiveService expensiveService;
}

// 2. 合理使用缓存
@Service
public class UserService {
    
    @Cacheable("users")
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// 3. 使用异步处理
@Service
public class NotificationService {
    
    @Async
    public void sendNotification(String message) {
        // 异步发送通知
    }
}
```

#### 2. 常见问题与解决方案

**循环依赖问题：**

```java
// 问题：循环依赖
@Component
public class UserService {
    @Autowired
    private OrderService orderService;
}

@Component
public class OrderService {
    @Autowired
    private UserService userService;
}

// 解决方案1：使用@Lazy
@Component
public class UserService {
    @Lazy
    @Autowired
    private OrderService orderService;
}

// 解决方案2：重新设计架构
@Component
public class UserService {
    // 移除对OrderService的直接依赖
}

@Component
public class OrderService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void createOrder(Order order) {
        // 发布事件而不是直接调用
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}

@Component
public class UserEventListener {
    
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 处理订单创建事件
    }
}
```

**Bean 创建失败问题：**

```java
// 问题：Bean创建失败
@Component
public class UserService {
    
    @Value("${database.url}")
    private String databaseUrl;  // 配置属性不存在时失败
    
    @PostConstruct
    public void init() {
        // 初始化失败
    }
}

// 解决方案1：提供默认值
@Component
public class UserService {
    
    @Value("${database.url:jdbc:h2:mem:defaultdb}")
    private String databaseUrl;
}

// 解决方案2：使用条件注解
@Component
@ConditionalOnProperty(name = "database.url")
public class UserService {
    
    @Value("${database.url}")
    private String databaseUrl;
}

// 解决方案3：异常处理
@Component
public class UserService {
    
    @PostConstruct
    public void init() {
        try {
            // 初始化逻辑
        } catch (Exception e) {
            // 记录日志，不抛出异常
            logger.error("Failed to initialize UserService", e);
        }
    }
}
```

**事务问题：**

```java
// 问题：事务不生效
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail());  // 如果失败，用户已保存
    }
}

// 解决方案1：使用REQUIRES_NEW
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        emailService.sendWelcomeEmailInNewTransaction(user.getEmail());
    }
}

@Service
public class EmailService {
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendWelcomeEmailInNewTransaction(String email) {
        // 新事务中发送邮件
    }
}

// 解决方案2：使用事件机制
@Service
public class UserService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        // 发布事件，异步处理
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));
    }
}
```

**AOP 不生效问题：**

```java
// 问题：AOP不生效
@Component
public class UserService {
    
    public void createUser(User user) {
        // 方法调用
        this.internalMethod();  // 内部方法调用，AOP不生效
    }
    
    @LogExecutionTime
    private void internalMethod() {
        // 这个方法上的AOP注解不会生效
    }
}

// 解决方案1：使用AopContext
@Component
public class UserService {
    
    public void createUser(User user) {
        UserService proxy = (UserService) AopContext.currentProxy();
        proxy.internalMethod();  // 通过代理调用
    }
    
    @LogExecutionTime
    public void internalMethod() {
        // 现在AOP会生效
    }
}

// 解决方案2：重新设计
@Component
public class UserService {
    
    @Autowired
    private UserService self;  // 注入自己
    
    public void createUser(User user) {
        self.internalMethod();  // 通过注入的代理调用
    }
    
    @LogExecutionTime
    public void internalMethod() {
        // AOP会生效
    }
}
```

---

### 十三、Spring 注解大全

#### 1. 核心注解

**Bean 定义注解：**

```java
// @Component - 通用组件注解
@Component
public class UserService {
    // 会被Spring扫描并注册为Bean
}

// @Service - 服务层注解
@Service
public class UserService {
    // 标识这是一个服务类
}

// @Repository - 数据访问层注解
@Repository
public class UserDaoImpl implements UserDao {
    // 标识这是一个数据访问类
}

// @Controller - 控制器注解
@Controller
public class UserController {
    // 标识这是一个控制器类
}

// @Configuration - 配置类注解
@Configuration
public class AppConfig {
    // 标识这是一个配置类
}

// @Bean - 方法级别的Bean定义
@Configuration
public class DataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean("customDataSource")  // 指定Bean名称
    public DataSource customDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean(initMethod = "init", destroyMethod = "cleanup")
    public CustomService customService() {
        return new CustomService();
    }
}
```

**依赖注入注解：**

```java
// @Autowired - 自动装配
@Component
public class UserService {
    
    // 1. 构造器注入（推荐）
    private final UserDao userDao;
    
    @Autowired  // 可以省略，Spring 4.3+支持隐式构造器注入
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
    
    // 2. Setter注入
    private EmailService emailService;
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
    
    // 3. 字段注入
    @Autowired
    private LogService logService;
    
    // 4. 方法注入
    @Autowired
    public void injectServices(UserDao userDao, EmailService emailService) {
        // 可以注入多个依赖
    }
    
    // 5. 集合注入
    @Autowired
    private List<NotificationService> notificationServices;
    
    // 6. Map注入
    @Autowired
    private Map<String, NotificationService> notificationServiceMap;
}

// @Qualifier - 指定具体的Bean
@Component
public class UserService {
    
    @Autowired
    @Qualifier("mysqlUserDao")
    private UserDao userDao;
}

// @Resource - JSR-250注解，功能类似@Autowired
@Component
public class UserService {
    
    @Resource(name = "mysqlUserDao")
    private UserDao userDao;
    
    @Resource(type = EmailService.class)
    private EmailService emailService;
}

// @Inject - JSR-330注解，功能类似@Autowired
@Component
public class UserService {
    
    @Inject
    private UserDao userDao;
    
    @Inject
    @Named("mysqlUserDao")
    private UserDao namedUserDao;
}
```

**作用域注解：**

```java
// @Scope - 定义Bean作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)  // 单例（默认）
public class SingletonService {
    // 整个应用只有一个实例
}

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)  // 原型
public class PrototypeService {
    // 每次注入都创建新实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class SessionService {
    // 会话作用域，每个HTTP会话一个实例
}

@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestService {
    // 请求作用域，每个HTTP请求一个实例
}

@Component
@Scope("custom")  // 自定义作用域
public class CustomScopeService {
    // 使用自定义作用域
}
```

#### 2. 配置注解

**配置类注解：**

```java
// @ComponentScan - 组件扫描
@Configuration
@ComponentScan("com.example")  // 扫描指定包
public class AppConfig {
}

@Configuration
@ComponentScan(basePackages = {"com.example.service", "com.example.dao"})
public class AppConfig {
}

@Configuration
@ComponentScan(basePackageClasses = {UserService.class, UserDao.class})
public class AppConfig {
}

// @Import - 导入其他配置类
@Configuration
@Import({DataSourceConfig.class, SecurityConfig.class})
public class AppConfig {
}

// @PropertySource - 属性文件配置
@Configuration
@PropertySource("classpath:application.properties")
@PropertySource("classpath:database.properties")
public class AppConfig {
    
    @Value("${app.name}")
    private String appName;
}

// @ConfigurationProperties - 配置属性绑定
@ConfigurationProperties(prefix = "app")
@Component
public class AppProperties {
    private String name;
    private String version;
    private Database database = new Database();
    
    // getters and setters
    
    public static class Database {
        private String url;
        private String username;
        private String password;
        
        // getters and setters
    }
}
```

**条件注解：**

```java
// @ConditionalOnProperty - 基于属性的条件
@Configuration
public class DatabaseConfig {
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "mysql")
    public DataSource mysqlDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnProperty(name = "database.type", havingValue = "postgresql")
    public DataSource postgresqlDataSource() {
        return new DriverManagerDataSource();
    }
}

// @ConditionalOnClass - 基于类路径的条件
@Configuration
public class FeatureConfig {
    
    @Bean
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    public MySQLService mysqlService() {
        return new MySQLService();
    }
    
    @Bean
    @ConditionalOnClass(name = "org.postgresql.Driver")
    public PostgreSQLService postgresqlService() {
        return new PostgreSQLService();
    }
}

// @ConditionalOnMissingBean - 基于Bean存在性的条件
@Configuration
public class DefaultConfig {
    
    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource defaultDataSource() {
        return new DriverManagerDataSource();
    }
    
    @Bean
    @ConditionalOnMissingBean(name = "customDataSource")
    public DataSource fallbackDataSource() {
        return new DriverManagerDataSource();
    }
}

// @Profile - 基于Profile的条件
@Configuration
@Profile("dev")
public class DevConfig {
    
    @Bean
    public DataSource devDataSource() {
        return new DriverManagerDataSource("jdbc:h2:mem:devdb");
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    
    @Bean
    public DataSource prodDataSource() {
        return new DriverManagerDataSource("jdbc:mysql://prod-server:3306/proddb");
    }
}
```

#### 3. AOP 注解

**切面注解：**

```java
// @Aspect - 定义切面
@Aspect
@Component
public class LoggingAspect {
    
    // @Pointcut - 定义切点
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}
    
    @Pointcut("execution(* com.example.dao.*.*(..))")
    public void daoMethods() {}
    
    @Pointcut("serviceMethods() || daoMethods()")
    public void allMethods() {}
    
    // @Before - 前置通知
    @Before("serviceMethods()")
    public void beforeMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Before method: " + methodName);
    }
    
    // @After - 后置通知
    @After("serviceMethods()")
    public void afterMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("After method: " + methodName);
    }
    
    // @AfterReturning - 返回通知
    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Method " + methodName + " returned: " + result);
    }
    
    // @AfterThrowing - 异常通知
    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("Exception in method " + methodName + ": " + ex.getMessage());
    }
    
    // @Around - 环绕通知
    @Around("serviceMethods()")
    public Object aroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long end = System.currentTimeMillis();
            System.out.println("Method execution time: " + (end - start) + "ms");
            return result;
        } catch (Exception e) {
            long end = System.currentTimeMillis();
            System.out.println("Method failed after: " + (end - start) + "ms");
            throw e;
        }
    }
}

// 启用AOP
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
}
```

#### 4. 事务注解

**事务管理注解：**

```java
// @Transactional - 声明式事务
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // 默认事务传播行为：REQUIRED
    public void createUser(User user) {
        userRepository.save(user);
    }
    
    // 新事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId);
        user.setStatus(status);
        userRepository.save(user);
    }
    
    // 只读事务
    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    // 指定隔离级别
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void criticalOperation() {
        // 需要最高隔离级别的操作
    }
    
    // 指定超时时间
    @Transactional(timeout = 30)
    public void longRunningOperation() {
        // 长时间运行的操作
    }
    
    // 指定回滚异常
    @Transactional(rollbackFor = {SQLException.class, IOException.class})
    public void operationWithCustomRollback() {
        // 自定义回滚条件
    }
    
    // 指定不回滚异常
    @Transactional(noRollbackFor = {IllegalArgumentException.class})
    public void operationWithNoRollback() {
        // 某些异常不回滚
    }
}

// 启用事务管理
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

#### 5. Spring MVC 注解

**控制器注解：**

```java
// @Controller - 标识控制器
@Controller
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // @RequestMapping - 请求映射
    @RequestMapping(value = "/users", method = RequestMethod.GET)
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // @GetMapping - GET请求映射
    @GetMapping("/users")
    public String listUsers(Model model) {
        List<User> users = userService.findAllUsers();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // @PostMapping - POST请求映射
    @PostMapping("/users")
    public String createUser(@Valid @ModelAttribute User user, 
                           BindingResult result, 
                           RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "user/form";
        }
        
        userService.save(user);
        redirectAttributes.addFlashAttribute("message", "User created successfully");
        return "redirect:/users";
    }
    
    // @PutMapping - PUT请求映射
    @PutMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<User> updateUser(@PathVariable Long id, 
                                         @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.update(user);
        return ResponseEntity.ok(updatedUser);
    }
    
    // @DeleteMapping - DELETE请求映射
    @DeleteMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // @PatchMapping - PATCH请求映射
    @PatchMapping("/users/{id}")
    @ResponseBody
    public ResponseEntity<User> patchUser(@PathVariable Long id, 
                                        @RequestBody Map<String, Object> updates) {
        User updatedUser = userService.patchUser(id, updates);
        return ResponseEntity.ok(updatedUser);
    }
}

// 请求参数注解
@Controller
public class UserController {
    
    // @PathVariable - 路径变量
    @GetMapping("/users/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user/detail";
    }
    
    // @PathVariable 指定名称
    @GetMapping("/users/{userId}/orders/{orderId}")
    public String getUserOrder(@PathVariable("userId") Long userId, 
                              @PathVariable("orderId") Long orderId, 
                              Model model) {
        // 处理逻辑
        return "user/order";
    }
    
    // @RequestParam - 请求参数
    @GetMapping("/users")
    public String searchUsers(@RequestParam String name, 
                             @RequestParam(required = false) String email,
                             @RequestParam(defaultValue = "1") int page,
                             @RequestParam(defaultValue = "10") int size,
                             Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @RequestHeader - 请求头
    @GetMapping("/users")
    public String getUsers(@RequestHeader("User-Agent") String userAgent,
                          @RequestHeader(value = "Accept-Language", defaultValue = "en") String language,
                          Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @CookieValue - Cookie值
    @GetMapping("/users")
    public String getUsers(@CookieValue(value = "sessionId", required = false) String sessionId,
                          Model model) {
        // 处理逻辑
        return "user/list";
    }
    
    // @RequestBody - 请求体
    @PostMapping("/users")
    @ResponseBody
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
    
    // @ModelAttribute - 模型属性
    @ModelAttribute("user")
    public User getUser() {
        return new User();
    }
    
    // @ResponseBody - 响应体
    @GetMapping("/users/{id}")
    @ResponseBody
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    // @ResponseStatus - 响应状态
    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public void createUser(@RequestBody User user) {
        userService.save(user);
    }
    
    // @ExceptionHandler - 异常处理
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("User not found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // @ControllerAdvice - 全局异常处理
    @ControllerAdvice
    public class GlobalExceptionHandler {
        
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
            ErrorResponse error = new ErrorResponse("Internal server error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
```

#### 6. Spring Security 注解

**安全注解：**

```java
// @EnableWebSecurity - 启用Web安全
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout=true")
                .permitAll()
            )
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
}

// 方法级安全注解
@Service
public class UserService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId) {
        // 只有ADMIN角色才能调用
    }
    
    @PreAuthorize("hasRole('USER') and #user.id == authentication.principal.id")
    public void updateUser(User user) {
        // 只有USER角色且只能更新自己的信息
    }
    
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public void deleteUserByAuthority(Long userId) {
        // 需要特定权限
    }
    
    @PostAuthorize("returnObject.owner == authentication.principal.username")
    public User getUser(Long userId) {
        // 方法执行后的权限检查
        return userRepository.findById(userId);
    }
    
    @PreFilter("filterObject.owner == authentication.principal.username")
    public void updateUsers(List<User> users) {
        // 过滤输入参数
        userRepository.saveAll(users);
    }
    
    @PostFilter("filterObject.owner == authentication.principal.username")
    public List<User> getUsers() {
        // 过滤返回值
        return userRepository.findAll();
    }
}
```

#### 7. 测试注解

**测试相关注解：**

```java
// @SpringBootTest - Spring Boot测试
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateUser() {
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");
        
        User savedUser = userService.save(user);
        
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("John");
    }
}

// @WebMvcTest - Web层测试
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("John");
        
        when(userService.findById(1L)).thenReturn(user);
        
        mockMvc.perform(get("/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("John"));
    }
}

// @DataJpaTest - 数据层测试
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testSaveUser() {
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");
        
        User savedUser = userRepository.save(user);
        
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
    }
}

// @TestPropertySource - 测试属性配置
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver"
})
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateAndFindUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        
        User savedUser = userService.save(user);
        User foundUser = userService.findById(savedUser.getId());
        
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getName()).isEqualTo("Test User");
    }
}
```

#### 8. 其他重要注解

**缓存注解：**

```java
// @EnableCaching - 启用缓存
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}

// 缓存操作注解
@Service
public class UserService {
    
    @Cacheable("users")
    public User findById(Long id) {
        return userRepository.findById(id);
    }
    
    @CacheEvict("users")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @CachePut("users")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @Caching(evict = {
        @CacheEvict("users"),
        @CacheEvict("userList")
    })
    public void deleteUserAndClearCache(Long id) {
        userRepository.deleteById(id);
    }
}
```

**异步注解：**

```java
// @EnableAsync - 启用异步
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("Async-");
        executor.initialize();
        return executor;
    }
}

// 异步方法注解
@Service
public class AsyncService {
    
    @Async
    public CompletableFuture<String> processAsync(String input) {
        try {
            Thread.sleep(1000);
            return CompletableFuture.completedFuture("Processed: " + input);
        } catch (InterruptedException e) {
            return CompletableFuture.failedFuture(e);
        }
    }
    
    @Async("customExecutor")
    public void processWithCustomExecutor(String input) {
        // 使用自定义执行器
    }
}
```

**验证注解：**

```java
// @Valid - 启用验证
@PostMapping("/users")
public String createUser(@Valid @ModelAttribute User user, 
                        BindingResult result, 
                        Model model) {
    if (result.hasErrors()) {
        return "user/form";
    }
    
    userService.save(user);
    return "redirect:/users";
}

// 自定义验证注解
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailValidator.class)
public @interface ValidEmail {
    String message() default "Invalid email format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 使用自定义验证
public class User {
    
    @NotNull
    @Size(min = 2, max = 50)
    private String name;
    
    @ValidEmail
    private String email;
    
    @Min(18)
    private int age;
    
    // getters and setters
}
```

### 十四、最佳实践与常见问题

#### 1. Spring 最佳实践

**Bean 设计原则：**

```java
// 1. 优先使用构造器注入
@Component
public class UserService {
    private final UserDao userDao;
    private final EmailService emailService;
    
    public UserService(UserDao userDao, EmailService emailService) {
        this.userDao = userDao;
        this.emailService = emailService;
    }
}

// 2. 使用接口而非具体实现
@Service
public class UserService {
    private final UserDao userDao;  // 依赖接口
    
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}

// 3. 合理使用作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class PrototypeService {
    // 只在需要时使用原型作用域
}

// 4. 使用@Configuration而非@Component
@Configuration  // 推荐
public class DataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource();
    }
}
```

**性能优化建议：**

```java
// 1. 使用懒加载
@Component
public class HeavyService {
    
    @Lazy
    @Autowired
    private ExpensiveService expensiveService;
}

// 2. 合理使用缓存
@Service
public class UserService {
    
    @Cacheable("users")
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// 3. 使用异步处理
@Service
public class NotificationService {
    
    @Async
    public void sendNotification(String message) {
        // 异步发送通知
    }
}
```

#### 2. 常见问题与解决方案

**循环依赖问题：**

```java
// 问题：循环依赖
@Component
public class UserService {
    @Autowired
    private OrderService orderService;
}

@Component
public class OrderService {
    @Autowired
    private UserService userService;
}

// 解决方案1：使用@Lazy
@Component
public class UserService {
    @Lazy
    @Autowired
    private OrderService orderService;
}

// 解决方案2：重新设计架构
@Component
public class UserService {
    // 移除对OrderService的直接依赖
}

@Component
public class OrderService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void createOrder(Order order) {
        // 发布事件而不是直接调用
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}

@Component
public class UserEventListener {
    
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 处理订单创建事件
    }
}
```

**Bean 创建失败问题：**

```java
// 问题：Bean创建失败
@Component
public class UserService {
    
    @Value("${database.url}")
    private String databaseUrl;  // 配置属性不存在时失败
    
    @PostConstruct
    public void init() {
        // 初始化失败
    }
}

// 解决方案1：提供默认值
@Component
public class UserService {
    
    @Value("${database.url:jdbc:h2:mem:defaultdb}")
    private String databaseUrl;
}

// 解决方案2：使用条件注解
@Component
@ConditionalOnProperty(name = "database.url")
public class UserService {
    
    @Value("${database.url}")
    private String databaseUrl;
}

// 解决方案3：异常处理
@Component
public class UserService {
    
    @PostConstruct
    public void init() {
        try {
            // 初始化逻辑
        } catch (Exception e) {
            // 记录日志，不抛出异常
            logger.error("Failed to initialize UserService", e);
        }
    }
}
```

**事务问题：**

```java
// 问题：事务不生效
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail());  // 如果失败，用户已保存
    }
}

// 解决方案1：使用REQUIRES_NEW
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        emailService.sendWelcomeEmailInNewTransaction(user.getEmail());
    }
}

@Service
public class EmailService {
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendWelcomeEmailInNewTransaction(String email) {
        // 新事务中发送邮件
    }
}

// 解决方案2：使用事件机制
@Service
public class UserService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void createUser(User user) {
        userRepository.save(user);
        // 发布事件，异步处理
        eventPublisher.publishEvent(new UserCreatedEvent(this, user));
    }
}
```

**AOP 不生效问题：**

```java
// 问题：AOP不生效
@Component
public class UserService {
    
    public void createUser(User user) {
        // 方法调用
        this.internalMethod();  // 内部方法调用，AOP不生效
    }
    
    @LogExecutionTime
    private void internalMethod() {
        // 这个方法上的AOP注解不会生效
    }
}

// 解决方案1：使用AopContext
@Component
public class UserService {
    
    public void createUser(User user) {
        UserService proxy = (UserService) AopContext.currentProxy();
        proxy.internalMethod();  // 通过代理调用
    }
    
    @LogExecutionTime
    public void internalMethod() {
        // 现在AOP会生效
    }
}

// 解决方案2：重新设计
@Component
public class UserService {
    
    @Autowired
    private UserService self;  // 注入自己
    
    public void createUser(User user) {
        self.internalMethod();  // 通过注入的代理调用
    }
    
    @LogExecutionTime
    public void internalMethod() {
        // AOP会生效
    }
}
```

---

## 总结

Spring Framework 是一个功能强大、设计优雅的企业级Java开发框架。通过深入理解其核心概念、源码实现和最佳实践，我们可以：

1. **更好地使用Spring**：理解原理后，使用起来更加得心应手
2. **避免常见陷阱**：了解内部机制，避免踩坑
3. **优化应用性能**：合理使用Spring特性，提升应用性能
4. **解决复杂问题**：掌握源码分析能力，解决疑难问题

Spring的成功在于其**"约定优于配置"**的理念，**"面向接口编程"**的设计，以及**"非侵入式"**的架构。这些设计原则不仅体现在Spring本身，也值得我们在日常开发中学习和应用。

希望这份详细的Spring Framework笔记能够帮助您深入理解Spring，并在实际项目中更好地使用它！
