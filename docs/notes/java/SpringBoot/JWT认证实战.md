---
title: JWT 认证实战
tags:
  - Java
  - Spring Boot 3
  - Spring Security
  - JWT
  - 认证授权
createTime: 2026/08/29 15:00:00
permalink: /SpringBoot/jwt-auth/
---

::: tip 保鲜说明（2026-08）
本文基于 **Spring Boot 3.4.x** + **Spring Security 6.x**（`SecurityFilterChain` 模型）与 **jjwt 0.12.x** 编写。Spring Security 5 时代的 `WebSecurityConfigurerAdapter` 已废弃，请勿混用旧范例。
:::

## 1. JWT 结构速览

JWT（JSON Web Token）由三段 Base64URL 组成，以 `.` 连接：

```
Header.Payload.Signature
```

| 段 | 内容 | 示例 |
|----|------|------|
| Header | 算法、类型 | `{"alg":"HS256","typ":"JWT"}` |
| Payload | 声明（claims） | `sub`, `exp`, `iat`, 自定义角色等 |
| Signature | 防篡改签名 | HMAC 或 RSA/ECDSA |

**特点**：无状态、适合水平扩展；**缺点**：签发后难以主动作废（需黑名单/短过期 + Refresh Token）。

---

## 2. 整体架构

```
客户端 ──POST /auth/login──► 认证服务 ──签发 Access Token (+ Refresh)
   │
   └──GET /api/xxx  Header: Authorization: Bearer <token>
              │
              ▼
        JwtAuthFilter 解析 → SecurityContext
              │
              ▼
        Controller（@PreAuthorize 等）
```

---

## 3. Maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- jjwt 0.12.x -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

> 若偏好 **Nimbus JOSE + JWT**，可使用 `com.nimbusds:nimbus-jose-jwt`，与 Spring Authorization Server 配合更紧密；本文以 jjwt 为例，API 更直观。

---

## 4. 配置项

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production!!!!!}
    access-expiration-ms: 900000      # 15 分钟
    refresh-expiration-ms: 604800000  # 7 天
```

生产环境：

- `secret` 至少 256 bit，放环境变量或密钥管理服务。
- 优先使用 **RS256**（非对称密钥），便于多服务验签。

---

## 5. JwtService：签发与解析

```java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpirationMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("roles", user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessExpirationMs)))
                .signWith(signingKey())
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails user) {
        String username = extractUsername(token);
        return username.equals(user.getUsername()) && !isExpired(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }
}
```

---

## 6. JwtAuthFilter

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(token, user)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (JwtException e) {
            // 无效 token：不设置 Authentication，交由后续 EntryPoint 处理 401
        }
        chain.doFilter(request, response);
    }
}
```

---

## 7. SecurityFilterChain 配置

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/auth/refresh", "/actuator/health").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    res.getWriter().write("{\"code\":401,\"message\":\"Unauthorized\"}");
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

## 8. 登录接口：签发 Token

```java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest req) {
        var token = new UsernamePasswordAuthenticationToken(req.username(), req.password());
        Authentication auth = authenticationManager.authenticate(token);

        UserDetails user = (UserDetails) auth.getPrincipal();
        String access = jwtService.generateAccessToken(user);
        String refresh = refreshTokenService.create(user.getUsername());

        return new TokenResponse(access, refresh, "Bearer", 900);
    }
}

public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
) {}

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn
) {}
```

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
    }
}
```

---

## 9. 保护业务 API

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public OrderDto get(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @GetMapping("/me")
    public String currentUser(Authentication auth) {
        return auth.getName();
    }
}
```

客户端请求：

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     http://localhost:8080/api/orders/1
```

---

## 10. Refresh Token 简要方案

Access Token 短过期降低泄露风险；Refresh Token 长过期、存 DB/Redis，支持轮换与吊销。

```java
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public String create(String username) {
        String token = UUID.randomUUID().toString();
        var entity = new RefreshToken(token, username,
                Instant.now().plusMillis(refreshExpirationMs));
        repository.save(entity);
        return token;
    }

    public Optional<String> rotate(String refreshToken) {
        return repository.findByToken(refreshToken)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .map(t -> {
                    repository.delete(t);           // 单次使用：轮换
                    return create(t.getUsername());
                });
    }
}
```

```java
@PostMapping("/refresh")
public TokenResponse refresh(@RequestBody RefreshRequest body) {
    String username = refreshTokenService.validateAndGetUsername(body.refreshToken());
    UserDetails user = userDetailsService.loadUserByUsername(username);
    String newAccess = jwtService.generateAccessToken(user);
    String newRefresh = refreshTokenService.rotate(body.refreshToken()).orElseThrow();
    return new TokenResponse(newAccess, newRefresh, "Bearer", 900);
}
```

---

## 11. 常见坑

| 问题 | 原因 | 对策 |
|------|------|------|
| 401 但 token "看起来正确" | 密钥不一致、时钟漂移 | 统一 `secret`；NTP 同步 |
| 403 而非 401 | 有 Authentication 但权限不足 | 检查 `roles` claim 与 `hasRole` 前缀 |
| Token 存 localStorage 被 XSS 窃取 | 前端存储方式 | 考虑 HttpOnly Cookie + CSRF；或严格 CSP |
| 无法登出 | JWT 无状态 | Refresh Token 黑名单；或极短 access + 轮换 |
| `secret` 太短 | HS256 要求 ≥ 256 bit | 使用 `Keys.secretKeyFor(SignatureAlgorithm.HS256)` 生成 |
| Filter 顺序错误 | JWT 过滤器在 Security 链外 | `addFilterBefore(..., UsernamePasswordAuthenticationFilter.class)` |
| CORS 预检失败 | OPTIONS 未放行 | `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` |

---

## 12. 与 OAuth2 / 网关的关系

- **单体 / 内部 API**：本文方案足够。
- **开放平台 / 第三方**：使用 **Spring Authorization Server** 或 Keycloak，JWT 作为 OAuth2 Access Token。
- **API 网关**：网关层可做第一层 JWT 校验，下游服务仍应验证签名（零信任）。

---

## 参考

- [jjwt GitHub](https://github.com/jwtk/jjwt)
- [Spring Security 6  Servlet 架构](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [RFC 7519 JWT](https://datatracker.ietf.org/doc/html/rfc7519)
