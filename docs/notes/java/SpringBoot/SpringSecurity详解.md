---
title: SpringSecurity详解
createTime: 2025/08/12 16:57:11
permalink: /SpringBoot/zq2twbjf/
---

#### 1. Spring Security 概述

Spring Security 是 Spring 生态系统中专门用于处理安全性的框架，提供了全面的安全解决方案，包括认证、授权、会话管理、密码加密等核心功能。

**核心特性**：

- **认证（Authentication）**：验证用户身份
- **授权（Authorization）**：控制用户访问权限
- **会话管理**：管理用户会话状态
- **密码加密**：安全的密码存储和验证
- **CSRF 防护**：防止跨站请求伪造攻击
- **XSS 防护**：防止跨站脚本攻击

**适用场景**：

- Web 应用安全
- REST API 安全
- 微服务安全
- 单点登录（SSO）
- OAuth2 认证授权

---

#### 2. 基础配置

##### 2.1 Maven 依赖

```xml

<dependencies>
    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- JWT 支持 -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- 验证器 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

##### 2.2 基础安全配置

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 禁用 CSRF（REST API 场景）
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                .accessDeniedHandler(new JwtAccessDeniedHandler())
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
```

---

#### 3. 用户认证系统

##### 3.1 用户实体类

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private RoleName name;
    
    private String description;
}

public enum RoleName {
    ROLE_USER,
    ROLE_ADMIN,
    ROLE_MODERATOR
}

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    LOCKED,
    DELETED
}
```

##### 3.2 用户服务

```java
@Service
@Transactional
@Slf4j
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(CreateUserRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("用户名已存在: " + request.getUsername());
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("邮箱已存在: " + request.getEmail());
        }
        
        // 创建用户
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .status(UserStatus.ACTIVE)
                .build();
        
        // 设置默认角色
        user.getRoles().add(Role.builder().name(RoleName.ROLE_USER).build());
        
        User savedUser = userRepository.save(user);
        log.info("用户创建成功: {}", savedUser.getUsername());
        
        return savedUser;
    }
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + id));
    }
    
    public void updatePassword(Long userId, String newPassword) {
        User user = findById(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("用户密码更新成功: {}", user.getUsername());
    }
    
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = findById(userId);
        user.setStatus(status);
        userRepository.save(user);
        log.info("用户状态更新成功: {} -> {}", user.getUsername(), status);
    }
}
```

##### 3.3 用户认证服务

```java
@Service
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));
        
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new DisabledException("用户账户已被禁用");
        }
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()))
                .accountExpired(false)
                .accountLocked(user.getStatus() == UserStatus.LOCKED)
                .credentialsExpired(false)
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
}
```

---

#### 4. JWT 认证

##### 4.1 JWT 工具类

```java
@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    public String generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("authorities", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);
        
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }
    
    public List<String> getAuthoritiesFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.get("authorities", List.class);
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT 令牌验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

##### 4.2 JWT 认证过滤器

```java
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                String username = jwtTokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("JWT 认证处理失败", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

#### 5. 认证控制器

##### 5.1 认证请求/响应 DTO

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度不能少于6位")
    private String password;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo userInfo;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private String status;
}
```

##### 5.2 认证控制器

```java
@RestController
@RequestMapping("/api/auth")
@Validated
@Slf4j
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(), 
                            loginRequest.getPassword()
                    )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String accessToken = jwtTokenProvider.generateAccessToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getUsername());
            
            User user = userService.findByUsername(loginRequest.getUsername());
            UserInfo userInfo = UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(user.getRoles().stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toList()))
                    .status(user.getStatus().name())
                    .build();
            
            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(3600) // 1小时
                    .userInfo(userInfo)
                    .build();
            
            log.info("用户登录成功: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (AuthenticationException e) {
            log.warn("用户登录失败: {}", loginRequest.getUsername());
            throw new BadCredentialsException("用户名或密码错误");
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserInfo> register(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        
        UserInfo userInfo = UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList()))
                .status(user.getStatus().name())
                .build();
        
        log.info("用户注册成功: {}", user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(userInfo);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam String refreshToken) {
        try {
            if (jwtTokenProvider.validateToken(refreshToken)) {
                String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
                User user = userService.findByUsername(username);
                
                // 生成新的访问令牌
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        user.getUsername(), null, 
                        user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                                .collect(Collectors.toList())
                );
                
                String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);
                
                AuthResponse response = AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(refreshToken)
                        .expiresIn(3600)
                        .build();
                
                return ResponseEntity.ok(response);
            } else {
                throw new BadCredentialsException("刷新令牌无效");
            }
        } catch (Exception e) {
            log.error("刷新令牌失败", e);
            throw new BadCredentialsException("刷新令牌失败");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        // 实现令牌黑名单逻辑
        log.info("用户登出");
        return ResponseEntity.ok().build();
    }
}
```

---

#### 6. 方法级安全

##### 6.1 控制器方法安全

```java
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class UserManagementController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserInfo>> getAllUsers() {
        // 获取所有用户
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserInfo> getUserById(@PathVariable Long id) {
        // 获取指定用户信息
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long id, 
                                               @RequestParam UserStatus status) {
        userService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<Void> updatePassword(@PathVariable Long id, 
                                             @RequestParam String newPassword) {
        userService.updatePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }
}
```

##### 6.2 服务方法安全

```java
@Service
@Transactional
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId) {
        // 删除用户逻辑
        log.info("管理员删除用户: {}", userId);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void assignRole(Long userId, RoleName roleName) {
        // 分配角色逻辑
        log.info("管理员为用户 {} 分配角色: {}", userId, roleName);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void revokeRole(Long userId, RoleName roleName) {
        // 撤销角色逻辑
        log.info("管理员撤销用户 {} 的角色: {}", userId, roleName);
    }
}
```

---

#### 7. OAuth2 集成

##### 7.1 OAuth2 配置

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class OAuth2SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService())
                )
                .successHandler(oauth2AuthenticationSuccessHandler())
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
    
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        
        return userRequest -> {
            OAuth2User oauth2User = delegate.loadUser(userRequest);
            
            // 自定义 OAuth2 用户信息处理
            return processOAuth2User(userRequest, oauth2User);
        };
    }
    
    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        // 处理 OAuth2 用户信息
        return oauth2User;
    }
    
    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            // OAuth2 登录成功处理
            log.info("OAuth2 登录成功: {}", authentication.getName());
        };
    }
    
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        
        return jwtAuthenticationConverter;
    }
}
```

---

#### 8. 安全最佳实践

##### 8.1 密码策略

```java
@Component
public class PasswordPolicyValidator {
    
    public void validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password.length() < 8) {
            errors.add("密码长度不能少于8位");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            errors.add("密码必须包含大写字母");
        }
        
        if (!password.matches(".*[a-z].*")) {
            errors.add("密码必须包含小写字母");
        }
        
        if (!password.matches(".*\\d.*")) {
            errors.add("密码必须包含数字");
        }
        
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            errors.add("密码必须包含特殊字符");
        }
        
        if (!errors.isEmpty()) {
            throw new InvalidPasswordException("密码不符合策略要求: " + String.join(", ", errors));
        }
    }
}
```

##### 8.2 登录尝试限制

```java
@Component
@Slf4j
public class LoginAttemptService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION = 900; // 15分钟
    
    public void recordFailedAttempt(String username) {
        String key = "login:attempts:" + username;
        String attempts = redisTemplate.opsForValue().get(key);
        
        int currentAttempts = attempts == null ? 0 : Integer.parseInt(attempts);
        currentAttempts++;
        
        if (currentAttempts >= MAX_ATTEMPTS) {
            // 锁定账户
            blockAccount(username);
        } else {
            // 记录失败次数
            redisTemplate.opsForValue().set(key, String.valueOf(currentAttempts), 
                    Duration.ofSeconds(300)); // 5分钟过期
        }
    }
    
    public boolean isAccountBlocked(String username) {
        String key = "login:blocked:" + username;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    private void blockAccount(String username) {
        String key = "login:blocked:" + username;
        redisTemplate.opsForValue().set(key, "blocked", Duration.ofSeconds(BLOCK_DURATION));
        log.warn("账户被锁定: {}", username);
    }
    
    public void resetAttempts(String username) {
        String attemptsKey = "login:attempts:" + username;
        String blockedKey = "login:blocked:" + username;
        
        redisTemplate.delete(attemptsKey);
        redisTemplate.delete(blockedKey);
    }
}
```

##### 8.3 安全审计日志

```java
@Aspect
@Component
@Slf4j
public class SecurityAuditAspect {
    
    @Around("@annotation(securityAudit)")
    public Object auditSecurityOperation(ProceedingJoinPoint joinPoint, SecurityAudit securityAudit) throws Throwable {
        String operation = securityAudit.operation();
        String username = getCurrentUsername();
        
        log.info("安全操作开始: operation={}, user={}, timestamp={}", 
                operation, username, LocalDateTime.now());
        
        try {
            Object result = joinPoint.proceed();
            log.info("安全操作成功: operation={}, user={}, timestamp={}", 
                    operation, username, LocalDateTime.now());
            return result;
        } catch (Exception e) {
            log.error("安全操作失败: operation={}, user={}, error={}, timestamp={}", 
                    operation, username, e.getMessage(), LocalDateTime.now());
            throw e;
        }
    }
    
    private String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication != null ? authentication.getName() : "anonymous";
        } catch (Exception e) {
            return "unknown";
        }
    }
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SecurityAudit {
    String operation();
}
```

---

#### 9. 配置文件

##### 9.1 application.yml

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope:
              - user:email
              - read:user

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-here}
  expiration: 3600000  # 1小时
  refresh-expiration: 86400000  # 24小时

logging:
  level:
    org.springframework.security: DEBUG
    com.example.security: DEBUG
```

---

#### 10. 总结

Spring Security 提供了全面的安全解决方案，通过合理的配置和实现，可以构建出安全可靠的企业级应用。

**关键要点**：

- **认证机制**：支持多种认证方式，包括用户名密码、JWT、OAuth2
- **授权控制**：细粒度的权限控制，支持方法级和URL级安全
- **安全防护**：内置CSRF、XSS等攻击防护
- **扩展性**：支持自定义认证逻辑和安全策略

**最佳实践**：

- 使用强密码策略
- 实现登录尝试限制
- 启用安全审计日志
- 定期更新安全配置
- 使用HTTPS传输
- 实现令牌刷新机制
