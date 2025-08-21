---
title: 阿里Java开发规范
createTime: 2024/11/16 21:00:00
tags:
  - 开发规范
  - Java
  - 阿里巴巴
  - 代码规范
permalink: /article/tmfh9os6/
---

## 1. 命名规范

### 1.1 类命名
- 类名使用 UpperCamelCase 风格，必须遵从驼峰形式
- 抽象类命名使用 Abstract 或 Base 开头
- 异常类命名使用 Exception 结尾
- 测试类命名以它要测试的类的名称开始，以 Test 结尾

```java
// 正例
public class UserService {}
public abstract class AbstractUserService {}
public class UserNotFoundException extends Exception {}
public class UserServiceTest {}

// 反例
public class userservice {}
public class user_service {}
public class User {}
```

### 1.2 方法命名
- 方法名、参数名、成员变量、局部变量都统一使用 lowerCamelCase 风格
- 获取单个对象的方法用 get 做前缀
- 获取多个对象的方法用 list 做前缀
- 获取统计值的方法用 count 做前缀

```java
// 正例
public User getUserById(Long id) {}
public List<User> listUsersByStatus(String status) {}
public int countUsersByDepartment(String dept) {}
public void updateUserInfo(User user) {}
public boolean deleteUserById(Long id) {}

// 反例
public User find(Long id) {}
public List<User> getUsers(String status) {}
public int getCount(String dept) {}
```

### 1.3 常量命名
- 常量命名全部大写，单词间用下划线隔开
- 力求语义表达完整清楚，不要嫌名字长

```java
// 正例
public static final String DEFAULT_USER_NAME = "admin";
public static final int MAX_RETRY_COUNT = 3;
public static final String USER_STATUS_ACTIVE = "ACTIVE";
public static final String USER_STATUS_INACTIVE = "INACTIVE";

// 反例
public static final String NAME = "admin";
public static final int COUNT = 3;
```

## 2. 代码格式

### 2.1 缩进
- 采用 4 个空格缩进，禁止使用 tab 字符
- 如果是大括号内为空，则简洁地写成 {} 即可，不需要换行

```java
// 正例
public class UserService {
    public void doSomething() {
        if (condition) {
            // 执行逻辑
        }
    }
}

// 反例
public class UserService {
	public void doSomething() {
		if (condition) {
			// 执行逻辑
		}
	}
}
```

### 2.2 空行
- 方法体内的执行语句组、变量的定义语句组、不同的业务逻辑之间或者不同的语义之间插入一个空行
- 相同业务逻辑之间、语义相关的代码之间不需要插入空行

```java
// 正例
public class UserService {
    private UserRepository userRepository;
    private EmailService emailService;
    
    public User createUser(UserCreateRequest request) {
        // 参数验证
        validateRequest(request);
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // 保存用户
        User savedUser = userRepository.save(user);
        
        // 发送欢迎邮件
        emailService.sendWelcomeEmail(savedUser);
        
        return savedUser;
    }
}
```

### 2.3 空格
- 任何二目、三目运算符的左右两边都需要加一个空格
- 关键字 if/for/while/switch/do 等与括号之间都必须加空格
- 方法名与左括号之间不要加空格
- 多个参数逗号后边要加空格

```java
// 正例
if (condition) {
    // 执行逻辑
}

for (int i = 0; i < 10; i++) {
    // 循环逻辑
}

int result = a + b;
boolean flag = a > b ? true : false;
String message = String.format("Hello %s", name);

// 反例
if(condition){
    // 执行逻辑
}

for(int i=0;i<10;i++){
    // 循环逻辑
}

int result=a+b;
boolean flag=a>b?true:false;
String message=String.format("Hello %s",name);
```

## 3. 注释规范

### 3.1 类注释
- 所有的类都必须添加创建者和创建日期
- 类注释使用 JavaDoc 规范
- 类注释应该包含类的功能描述、使用场景等信息

```java
/**
 * 用户服务类
 * 
 * 提供用户相关的业务逻辑处理，包括用户的增删改查、权限验证等功能。
 * 该类是用户模块的核心服务类，所有用户相关的业务操作都应该通过该类进行。
 * 
 * @author 张三
 * @date 2024-11-16
 * @version 1.0
 * @since 1.0
 */
public class UserService {
    // 类实现
}
```

### 3.2 方法注释
- 所有的 public 方法都必须添加 JavaDoc 注释
- 方法注释必须包含：功能描述、参数说明、返回值说明、异常说明
- 对于复杂的业务逻辑，应该详细说明实现思路

```java
/**
 * 根据用户ID查询用户信息
 * 
 * 该方法会根据用户ID从数据库中查询用户信息。如果用户不存在，返回null。
 * 该方法会同时查询用户的基本信息和扩展信息。
 * 
 * @param id 用户ID，不能为null，且必须大于0
 * @return 用户信息对象，如果用户不存在返回null
 * @throws IllegalArgumentException 当id为null或小于等于0时抛出
 * @throws ServiceException 当数据库查询异常时抛出
 * @see User
 * @see UserRepository
 */
public User getUserById(Long id) {
    if (id == null || id <= 0) {
        throw new IllegalArgumentException("用户ID不能为空且必须大于0");
    }
    
    try {
        return userRepository.findById(id);
    } catch (Exception e) {
        log.error("查询用户信息失败，用户ID: {}", id, e);
        throw new ServiceException("查询用户信息失败", e);
    }
}
```

### 3.3 代码注释
- 复杂逻辑必须添加注释，说明实现思路
- 注释要简洁明了，避免废话
- 对于算法、业务规则等复杂逻辑，应该详细注释

```java
// 计算用户积分
// 积分规则：基础积分100 + 注册天数 * 2 + 活跃天数 * 1
int baseScore = 100;
int registerDays = (int) ((System.currentTimeMillis() - user.getRegisterTime()) / (24 * 60 * 60 * 1000));
int activeDays = user.getActiveDays();
int totalScore = baseScore + registerDays * 2 + activeDays;

// 根据用户等级调整积分
if (user.getLevel() == UserLevel.VIP) {
    totalScore = (int) (totalScore * 1.5); // VIP用户积分1.5倍
} else if (user.getLevel() == UserLevel.SUPER_VIP) {
    totalScore = totalScore * 2; // 超级VIP用户积分2倍
}
```

## 4. 异常处理

### 4.1 异常捕获
- 不要忽略异常，要记录日志
- 不要使用空的 catch 块
- 异常不要用来做流程控制，条件控制
- 捕获异常后要进行适当的处理

```java
// 正例
try {
    User user = userRepository.findById(id);
    if (user == null) {
        throw new UserNotFoundException("用户不存在");
    }
    return user;
} catch (UserNotFoundException e) {
    log.warn("用户不存在，用户ID: {}", id);
    throw e;
} catch (Exception e) {
    log.error("查询用户信息失败，用户ID: {}", id, e);
    throw new ServiceException("查询用户信息失败", e);
}

// 反例
try {
    return userRepository.findById(id);
} catch (Exception e) {
    // 空的catch块，忽略异常
}
```

### 4.2 异常抛出
- 异常信息应该包含排查问题的关键信息
- 异常应该包含原始异常信息
- 自定义异常要继承合适的异常类

```java
// 正例
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 抛出异常时包含详细信息
if (user == null) {
    throw new UserNotFoundException(
        String.format("用户不存在，用户ID: %d, 查询时间: %s", 
            id, LocalDateTime.now())
    );
}
```

### 4.3 异常分类
- 业务异常：继承 RuntimeException，用于业务逻辑错误
- 系统异常：继承 Exception，用于系统级错误
- 参数异常：使用 IllegalArgumentException

```java
// 业务异常
public class BusinessException extends RuntimeException {
    private String errorCode;
    
    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

// 使用示例
if (user.getStatus() == UserStatus.DISABLED) {
    throw new BusinessException("USER_DISABLED", "用户已被禁用");
}
```

## 5. 集合处理

### 5.1 集合初始化
- 集合初始化时，指定集合初始值大小
- 使用 entrySet 遍历 Map 类集合 KV，而不是 keySet 方式进行遍历
- 合理选择集合类型

```java
// 正例
// 指定初始容量，避免扩容
Map<String, String> userMap = new HashMap<>(16);
List<String> userList = new ArrayList<>(100);
Set<String> userSet = new HashSet<>(50);

// 使用 entrySet 遍历 Map
for (Map.Entry<String, String> entry : userMap.entrySet()) {
    String key = entry.getKey();
    String value = entry.getValue();
    System.out.println(key + " = " + value);
}

// 反例
// 不指定初始容量，可能导致频繁扩容
Map<String, String> userMap = new HashMap<>();
List<String> userList = new ArrayList<>();

// 使用 keySet 遍历，需要额外获取值
for (String key : userMap.keySet()) {
    String value = userMap.get(key); // 额外的查找操作
    System.out.println(key + " = " + value);
}
```

### 5.2 集合操作
- 不要在 foreach 循环里进行元素的 remove/add 操作
- 使用 Collection.isEmpty() 检测空集合，而不是 Collection.size() == 0
- 合理使用集合工具类

```java
// 正例
// 使用 isEmpty() 检测空集合
if (userList.isEmpty()) {
    return Collections.emptyList();
}

// 使用迭代器进行删除操作
Iterator<String> iterator = userList.iterator();
while (iterator.hasNext()) {
    String item = iterator.next();
    if (shouldRemove(item)) {
        iterator.remove(); // 安全的删除操作
    }
}

// 使用 Stream API 进行集合操作
List<String> filteredList = userList.stream()
    .filter(item -> !shouldRemove(item))
    .collect(Collectors.toList());

// 反例
// 在 foreach 中删除元素，会抛出 ConcurrentModificationException
for (String item : userList) {
    if (shouldRemove(item)) {
        userList.remove(item); // 错误！会抛出异常
    }
}

// 使用 size() 检测空集合
if (userList.size() == 0) { // 不够优雅
    return Collections.emptyList();
}
```

### 5.3 集合类型选择
- ArrayList：随机访问频繁，增删操作少
- LinkedList：增删操作频繁，随机访问少
- HashMap：键值对存储，无序
- LinkedHashMap：键值对存储，保持插入顺序
- TreeMap：键值对存储，按键排序

```java
// 根据使用场景选择合适的集合
// 需要频繁随机访问
List<String> randomAccessList = new ArrayList<>();

// 需要频繁增删操作
List<String> frequentModifyList = new LinkedList<>();

// 需要保持插入顺序的Map
Map<String, String> orderedMap = new LinkedHashMap<>();

// 需要按键排序的Map
Map<String, String> sortedMap = new TreeMap<>();
```

## 6. 并发处理

### 6.1 线程安全
- 线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式
- SimpleDateFormat 是线程不安全的类，不要定义为 static 变量
- 使用线程安全的集合类

```java
// 正例
// 使用 ThreadPoolExecutor 创建线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // 核心线程数
    10,                     // 最大线程数
    60L,                    // 空闲线程存活时间
    TimeUnit.SECONDS,       // 时间单位
    new LinkedBlockingQueue<>(100),  // 工作队列
    new ThreadFactory() {            // 线程工厂
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r);
            t.setName("user-service-" + t.getId());
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

// 使用线程安全的日期格式化器
private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

// 使用线程安全的集合
private final Map<String, User> userCache = new ConcurrentHashMap<>();
private final List<String> userList = Collections.synchronizedList(new ArrayList<>());

// 反例
// 使用 Executors 创建线程池，无法自定义参数
ExecutorService executor = Executors.newFixedThreadPool(10);

// SimpleDateFormat 定义为 static，线程不安全
private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

// 使用非线程安全的集合
private final Map<String, User> userCache = new HashMap<>();
```

### 6.2 锁使用
- 避免使用 synchronized 关键字，优先使用 Lock 接口
- 使用 CountDownLatch 进行异步转同步操作
- 合理使用 volatile 关键字

```java
// 正例
// 使用 ReentrantLock 替代 synchronized
private final Lock lock = new ReentrantLock();
private final Condition condition = lock.newCondition();

public void updateUser(User user) {
    lock.lock();
    try {
        // 临界区代码
        userRepository.update(user);
        condition.signalAll(); // 通知等待的线程
    } finally {
        lock.unlock(); // 确保锁被释放
    }
}

// 使用 CountDownLatch 等待多个异步操作完成
public void processUsers(List<Long> userIds) throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(userIds.size());
    
    for (Long userId : userIds) {
        executor.submit(() -> {
            try {
                processUser(userId);
            } finally {
                latch.countDown();
            }
        });
    }
    
    // 等待所有任务完成
    latch.await();
}

// 使用 volatile 保证可见性
private volatile boolean running = true;

public void stop() {
    running = false;
}

public void run() {
    while (running) {
        // 执行任务
    }
}

// 反例
// 使用 synchronized 方法，粒度太粗
public synchronized void updateUser(User user) {
    userRepository.update(user);
}

// 没有使用 CountDownLatch，无法等待异步操作完成
public void processUsers(List<Long> userIds) {
    for (Long userId : userIds) {
        executor.submit(() -> processUser(userId));
    }
    // 无法等待所有任务完成
}
```

### 6.3 并发工具类
- 使用 ConcurrentHashMap 替代 HashMap
- 使用 CopyOnWriteArrayList 替代 ArrayList（读多写少场景）
- 使用 BlockingQueue 进行线程间通信

```java
// 使用 ConcurrentHashMap
private final Map<String, User> userCache = new ConcurrentHashMap<>();

// 使用 CopyOnWriteArrayList（读多写少）
private final List<String> userNames = new CopyOnWriteArrayList<>();

// 使用 BlockingQueue 进行生产者-消费者模式
private final BlockingQueue<User> userQueue = new LinkedBlockingQueue<>(100);

// 生产者
public void produceUser(User user) throws InterruptedException {
    userQueue.put(user);
}

// 消费者
public User consumeUser() throws InterruptedException {
    return userQueue.take();
}
```

## 7. 数据库规范

### 7.1 SQL规范
- 不要使用 count(列名)或 count(常量)来替代 count(*)
- 分页查询逻辑写在 SQL 中，而不是在 Java 代码中处理
- 使用预编译语句，防止 SQL 注入
- 避免使用 SELECT *，明确指定需要的字段

```java
// 正例
// 使用 count(*) 统计记录数
String countSql = "SELECT COUNT(*) FROM users WHERE status = ?";
PreparedStatement pstmt = connection.prepareStatement(countSql);
pstmt.setString(1, "ACTIVE");
ResultSet rs = pstmt.executeQuery();

// 分页查询写在 SQL 中
String pageSql = "SELECT id, username, email FROM users WHERE status = ? LIMIT ? OFFSET ?";
PreparedStatement pstmt = connection.prepareStatement(pageSql);
pstmt.setString(1, "ACTIVE");
pstmt.setInt(2, pageSize);
pstmt.setInt(3, (pageNum - 1) * pageSize);

// 明确指定需要的字段
String selectSql = "SELECT id, username, email, create_time FROM users WHERE id = ?";

// 反例
// 使用 count(列名) 统计记录数
String countSql = "SELECT COUNT(id) FROM users WHERE status = ?";

// 在 Java 代码中处理分页
String sql = "SELECT * FROM users WHERE status = ?";
// 然后在 Java 中截取结果集

// 使用 SELECT * 查询所有字段
String selectSql = "SELECT * FROM users WHERE id = ?";
```

### 7.2 事务处理
- 事务不要嵌套，如果嵌套，请使用 REQUIRES_NEW
- 事务方法中不要调用其他事务方法
- 合理设置事务传播行为和隔离级别

```java
// 正例
@Service
@Transactional(rollbackFor = Exception.class)
public class UserService {
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createUserLog(User user) {
        // 创建用户日志，使用新事务
        userLogRepository.save(new UserLog(user.getId(), "CREATE"));
    }
    
    @Transactional(rollbackFor = Exception.class)
    public void createUser(UserCreateRequest request) {
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        userRepository.save(user);
        
        // 调用新事务方法
        createUserLog(user);
        
        // 发送邮件（如果失败不影响用户创建）
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
            log.error("发送欢迎邮件失败", e);
        }
    }
}

// 反例
@Service
@Transactional
public class UserService {
    
    @Transactional
    public void createUser(UserCreateRequest request) {
        // 事务嵌套，可能导致问题
        userRepository.save(user);
        
        // 调用其他事务方法
        emailService.sendEmail(user); // 如果这个方法也有事务注解
    }
}
```

### 7.3 数据库连接管理
- 使用连接池管理数据库连接
- 及时释放数据库资源
- 使用 try-with-resources 语句

```java
// 正例
// 使用 try-with-resources 自动关闭资源
public User getUserById(Long id) {
    String sql = "SELECT id, username, email FROM users WHERE id = ?";
    
    try (Connection conn = dataSource.getConnection();
         PreparedStatement pstmt = conn.prepareStatement(sql)) {
        
        pstmt.setLong(1, id);
        try (ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setUsername(rs.getString("username"));
                user.setEmail(rs.getString("email"));
                return user;
            }
        }
    } catch (SQLException e) {
        log.error("查询用户失败", e);
        throw new ServiceException("查询用户失败", e);
    }
    
    return null;
}

// 反例
// 手动管理资源，容易忘记关闭
public User getUserById(Long id) {
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    try {
        conn = dataSource.getConnection();
        pstmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
        pstmt.setLong(1, id);
        rs = pstmt.executeQuery();
        // 处理结果集
    } catch (SQLException e) {
        log.error("查询用户失败", e);
    } finally {
        // 手动关闭资源，容易遗漏
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
    
    return null;
}
```

## 8. 日志规范

### 8.1 日志级别
- 使用 SLF4J 作为日志门面
- 合理使用日志级别：ERROR、WARN、INFO、DEBUG
- 生产环境建议只输出 INFO 及以上级别

```java
// 正例
// 使用 SLF4J 作为日志门面
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    public User getUserById(Long id) {
        // DEBUG 级别：详细的调试信息
        log.debug("开始查询用户，用户ID: {}", id);
        
        try {
            User user = userRepository.findById(id);
            
            if (user != null) {
                // INFO 级别：重要的业务信息
                log.info("查询用户成功，用户ID: {}, 用户名: {}", id, user.getUsername());
            } else {
                // WARN 级别：警告信息，不影响系统运行
                log.warn("用户不存在，用户ID: {}", id);
            }
            
            return user;
        } catch (Exception e) {
            // ERROR 级别：错误信息，需要立即关注
            log.error("查询用户失败，用户ID: {}, 错误信息: {}", id, e.getMessage(), e);
            throw new ServiceException("查询用户失败", e);
        }
    }
}

// 反例
// 直接使用具体的日志实现
import org.apache.log4j.Logger;
import org.apache.log4j.LogManager;

public class UserService {
    private static final Logger log = LogManager.getLogger(UserService.class);
}
```

### 8.2 日志内容
- 日志中不要出现敏感信息（密码、身份证号、手机号等）
- 日志信息要清晰，便于问题排查
- 使用占位符而不是字符串拼接

```java
// 正例
// 使用占位符，避免字符串拼接
log.info("用户登录成功，用户ID: {}, 登录时间: {}, IP地址: {}", 
    userId, loginTime, ipAddress);

// 记录关键业务信息
log.info("订单创建成功，订单号: {}, 用户ID: {}, 金额: {}", 
    order.getOrderNo(), order.getUserId(), order.getAmount());

// 错误日志包含足够的上下文信息
log.error("数据库连接失败，数据库地址: {}, 错误码: {}, 错误信息: {}", 
    dbConfig.getUrl(), e.getErrorCode(), e.getMessage(), e);

// 反例
// 记录敏感信息
log.info("用户密码: " + user.getPassword()); // 错误！

// 使用字符串拼接，性能差
log.info("用户登录成功，用户ID: " + userId + ", 登录时间: " + loginTime);

// 错误日志信息不完整
log.error("操作失败", e); // 缺少上下文信息
```

### 8.3 日志配置
- 配置日志输出格式，包含时间、级别、类名、线程等信息
- 配置日志文件滚动策略
- 配置日志级别过滤

```properties
# logback.xml 配置示例
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

### 8.4 日志最佳实践
- 在方法入口和出口记录日志
- 记录关键的业务操作
- 记录异常和错误信息
- 避免在循环中记录日志

```java
// 正例
public void processUsers(List<Long> userIds) {
    log.info("开始处理用户列表，用户数量: {}", userIds.size());
    
    try {
        for (Long userId : userIds) {
            processUser(userId);
        }
        log.info("用户列表处理完成，用户数量: {}", userIds.size());
    } catch (Exception e) {
        log.error("处理用户列表失败，用户数量: {}, 错误信息: {}", userIds.size(), e.getMessage(), e);
        throw e;
    }
}

// 反例
public void processUsers(List<Long> userIds) {
    for (Long userId : userIds) {
        // 在循环中记录日志，性能差
        log.info("处理用户: {}", userId);
        processUser(userId);
    }
}
```

## 9. 性能规范

### 9.1 字符串处理
- 使用 StringBuilder 进行字符串拼接
- 使用 String.valueOf() 替代 "" + 对象
- 避免在循环中使用字符串拼接

```java
// 正例
// 使用 StringBuilder 进行字符串拼接
public String buildUserInfo(User user) {
    StringBuilder sb = new StringBuilder();
    sb.append("用户ID: ").append(user.getId())
      .append(", 用户名: ").append(user.getUsername())
      .append(", 邮箱: ").append(user.getEmail());
    return sb.toString();
}

// 使用 String.valueOf() 替代 "" + 对象
String userId = String.valueOf(user.getId());
String userName = String.valueOf(user.getUsername());

// 反例
// 使用 + 进行字符串拼接，性能差
public String buildUserInfo(User user) {
    return "用户ID: " + user.getId() + 
           ", 用户名: " + user.getUsername() + 
           ", 邮箱: " + user.getEmail();
}

// 使用 "" + 对象，性能差
String userId = "" + user.getId();
String userName = "" + user.getUsername();
```

### 9.2 对象创建
- 及时释放不用的对象引用
- 避免在循环中创建对象
- 使用对象池复用对象

```java
// 正例
// 及时释放对象引用
public void processData() {
    List<String> dataList = loadData();
    try {
        processDataList(dataList);
    } finally {
        // 及时释放大对象引用
        dataList.clear();
        dataList = null;
    }
}

// 避免在循环中创建对象
public List<String> processItems(List<Item> items) {
    List<String> results = new ArrayList<>(items.size()); // 预分配容量
    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd"); // 循环外创建
    
    for (Item item : items) {
        String formattedDate = formatter.format(item.getCreateTime());
        results.add(item.getName() + " - " + formattedDate);
    }
    
    return results;
}

// 反例
// 在循环中创建对象，性能差
public List<String> processItems(List<Item> items) {
    List<String> results = new ArrayList<>();
    
    for (Item item : items) {
        // 每次循环都创建新的格式化器，性能差
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        String formattedDate = formatter.format(item.getCreateTime());
        results.add(item.getName() + " - " + formattedDate);
    }
    
    return results;
}
```

### 9.3 集合操作优化
- 预分配集合容量，避免频繁扩容
- 使用合适的集合类型
- 避免频繁的装箱拆箱操作

```java
// 正例
// 预分配集合容量
public List<User> getUsersByDepartment(String dept) {
    List<User> users = userRepository.findByDepartment(dept);
    List<User> activeUsers = new ArrayList<>(users.size()); // 预分配容量
    
    for (User user : users) {
        if (user.isActive()) {
            activeUsers.add(user);
        }
    }
    
    return activeUsers;
}

// 使用基本类型集合，避免装箱拆箱
public int[] getUserIdArray(List<User> users) {
    int[] ids = new int[users.size()];
    for (int i = 0; i < users.size(); i++) {
        ids[i] = users.get(i).getId().intValue(); // 一次性拆箱
    }
    return ids;
}

// 反例
// 不预分配容量，可能导致频繁扩容
public List<User> getUsersByDepartment(String dept) {
    List<User> users = userRepository.findByDepartment(dept);
    List<User> activeUsers = new ArrayList<>(); // 不预分配容量
    
    for (User user : users) {
        if (user.isActive()) {
            activeUsers.add(user); // 可能导致扩容
        }
    }
    
    return activeUsers;
}

// 频繁的装箱拆箱操作
public List<Integer> getUserIdList(List<User> users) {
    List<Integer> ids = new ArrayList<>();
    for (User user : users) {
        ids.add(user.getId()); // 每次都是装箱操作
    }
    return ids;
}
```

### 9.4 缓存使用
- 合理使用缓存，避免重复计算
- 使用本地缓存和分布式缓存
- 设置合适的缓存过期时间

```java
// 正例
// 使用本地缓存
@Service
public class UserService {
    private final Map<Long, User> userCache = new ConcurrentHashMap<>();
    
    public User getUserById(Long id) {
        // 先从缓存获取
        User user = userCache.get(id);
        if (user != null) {
            return user;
        }
        
        // 缓存未命中，从数据库查询
        user = userRepository.findById(id);
        if (user != null) {
            userCache.put(id, user); // 放入缓存
        }
        
        return user;
    }
}

// 使用 Spring Cache
@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public void updateUser(User user) {
        userRepository.update(user);
    }
}
```

## 10. 安全规范

### 10.1 输入验证
- 所有的外部输入都要进行验证
- 使用白名单验证，而不是黑名单
- 对特殊字符进行转义处理

```java
// 正例
// 使用白名单验证
public void createUser(UserCreateRequest request) {
    // 验证用户名：只允许字母、数字、下划线，长度3-20
    if (!request.getUsername().matches("^[a-zA-Z0-9_]{3,20}$")) {
        throw new IllegalArgumentException("用户名格式不正确");
    }
    
    // 验证邮箱格式
    if (!request.getEmail().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
        throw new IllegalArgumentException("邮箱格式不正确");
    }
    
    // 验证手机号：只允许数字，长度11位
    if (!request.getPhone().matches("^\\d{11}$")) {
        throw new IllegalArgumentException("手机号格式不正确");
    }
    
    // 创建用户
    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    userRepository.save(user);
}

// 使用 Apache Commons Validator
public void validateEmail(String email) {
    EmailValidator validator = EmailValidator.getInstance();
    if (!validator.isValid(email)) {
        throw new IllegalArgumentException("邮箱格式不正确");
    }
}

// 反例
// 使用黑名单验证，容易被绕过
public void createUser(UserCreateRequest request) {
    // 只检查是否包含某些字符，容易被绕过
    if (request.getUsername().contains("<") || request.getUsername().contains(">")) {
        throw new IllegalArgumentException("用户名包含非法字符");
    }
    
    // 没有验证邮箱格式
    // 没有验证手机号格式
}
```

### 10.2 敏感信息处理
- 不要在日志中记录敏感信息（密码、身份证号、手机号等）
- 密码等敏感信息要进行加密存储
- 使用 HTTPS 传输敏感数据

```java
// 正例
// 敏感信息脱敏
public void logUserInfo(User user) {
    // 手机号脱敏：138****8888
    String maskedPhone = maskPhone(user.getPhone());
    
    // 身份证号脱敏：110***********1234
    String maskedIdCard = maskIdCard(user.getIdCard());
    
    log.info("用户信息 - 用户ID: {}, 用户名: {}, 手机号: {}, 身份证号: {}", 
        user.getId(), user.getUsername(), maskedPhone, maskedIdCard);
}

// 手机号脱敏方法
private String maskPhone(String phone) {
    if (phone == null || phone.length() != 11) {
        return phone;
    }
    return phone.substring(0, 3) + "****" + phone.substring(7);
}

// 身份证号脱敏方法
private String maskIdCard(String idCard) {
    if (idCard == null || idCard.length() < 8) {
        return idCard;
    }
    return idCard.substring(0, 3) + "***********" + idCard.substring(idCard.length() - 4);
}

// 密码加密存储
@Service
public class UserService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public void createUser(UserCreateRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        
        // 密码加密存储
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(encodedPassword);
        
        userRepository.save(user);
    }
    
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}

// 反例
// 在日志中记录敏感信息
public void logUserInfo(User user) {
    log.info("用户信息 - 用户ID: {}, 用户名: {}, 密码: {}, 身份证号: {}", 
        user.getId(), user.getUsername(), user.getPassword(), user.getIdCard()); // 错误！
}

// 密码明文存储
public void createUser(UserCreateRequest request) {
    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(request.getPassword()); // 错误！明文存储
    userRepository.save(user);
}
```

### 10.3 SQL注入防护
- 使用预编译语句，不要拼接SQL
- 使用参数化查询
- 对特殊字符进行转义

```java
// 正例
// 使用预编译语句
public User getUserByUsername(String username) {
    String sql = "SELECT * FROM users WHERE username = ?";
    
    try (Connection conn = dataSource.getConnection();
         PreparedStatement pstmt = conn.prepareStatement(sql)) {
        
        pstmt.setString(1, username);
        try (ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
        }
    } catch (SQLException e) {
        log.error("查询用户失败", e);
        throw new ServiceException("查询用户失败", e);
    }
    
    return null;
}

// 使用 JPA 的 @Query 注解
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.username = :username")
    User findByUsername(@Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE u.status = :status AND u.department = :dept")
    List<User> findByStatusAndDepartment(@Param("status") String status, @Param("dept") String dept);
}

// 反例
// 拼接SQL，容易SQL注入
public User getUserByUsername(String username) {
    String sql = "SELECT * FROM users WHERE username = '" + username + "'"; // 危险！
    
    try (Connection conn = dataSource.getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery(sql)) {
        
        if (rs.next()) {
            return mapResultSetToUser(rs);
        }
    } catch (SQLException e) {
        log.error("查询用户失败", e);
    }
    
    return null;
}
```

### 10.4 文件上传安全
- 验证文件类型和大小
- 限制文件上传目录
- 对文件名进行安全处理

```java
// 正例
// 安全的文件上传
@Service
public class FileUploadService {
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    public String uploadFile(MultipartFile file) {
        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小超过限制");
        }
        
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("不支持的文件类型");
        }
        
        // 生成安全的文件名
        String safeFilename = generateSafeFilename(originalFilename);
        
        // 保存文件到安全目录
        String uploadPath = "/uploads/images/" + safeFilename;
        File dest = new File(uploadPath);
        
        try {
            file.transferTo(dest);
            return uploadPath;
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new ServiceException("文件上传失败", e);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
    
    private String generateSafeFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + random + "." + extension;
    }
}
```

## 总结

遵循以上规范可以提高代码质量，增强代码可读性和可维护性。规范不是一成不变的，团队可以根据实际情况进行调整和完善。记住：安全无小事，性能无止境，代码质量是团队协作的基础。
