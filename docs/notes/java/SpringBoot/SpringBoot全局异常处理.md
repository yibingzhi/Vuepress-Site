---
title: SpringBoot全局异常处理
tags:
  - Spring Boot
  - 异常处理
  - ControllerAdvice
  - ProblemDetail
createTime: 2024/12/19 20:39:41
permalink: /SpringBoot/9pt6kmn8/
---

::: tip 保鲜说明（2026-08）
本文基于 **Spring Boot 3.x**（`jakarta.*`）。与 [SpringBoot统一接口封装](/SpringBoot/h66lo7an/) 共用 `Result`、`ErrorCode`、`BusinessException`。Boot 3 内置 **RFC 9457 ProblemDetail** 支持，可按对外 API 风格选择统一 `Result` 或标准 Problem JSON。
:::

## 1. 为什么需要全局异常处理

若没有集中处理：

- Controller 充斥 `try-catch`，可读性差；
- 相同异常在不同接口返回格式不一致；
- 堆栈可能泄露给客户端；
- 日志级别混乱，难以告警。

`@ControllerAdvice` + `@ExceptionHandler` 将异常转换为**稳定 HTTP 响应**与**统一业务结构**。

---

## 2. 核心注解

### 2.1 @ControllerAdvice

作用于全局（或指定包/注解）控制器，可包含：

- `@ExceptionHandler` 异常处理
- `@InitBinder` 数据绑定
- `@ModelAttribute` 模型属性

```java
@ControllerAdvice(basePackages = "com.example")
public class GlobalExceptionHandler {
}
```

### 2.2 @RestControllerAdvice

等于 `@ControllerAdvice` + `@ResponseBody`，REST 项目常用。

### 2.3 @ExceptionHandler

```java
@ExceptionHandler(BusinessException.class)
public ResponseEntity<Result<Void>> handleBusiness(BusinessException ex) {
  return ResponseEntity
      .status(ex.errorCode().httpStatus())
      .body(Result.fail(ex.errorCode(), ex.getMessage()));
}
```

---

## 3. 共享模型（与统一封装一致）

### 3.1 ErrorCode

```java
public enum ErrorCode {
  SUCCESS("0", "success", HttpStatus.OK),
  BAD_REQUEST("A0400", "请求参数错误", HttpStatus.BAD_REQUEST),
  VALIDATION_FAILED("A0401", "参数校验失败", HttpStatus.BAD_REQUEST),
  UNAUTHORIZED("A0403", "未认证", HttpStatus.UNAUTHORIZED),
  FORBIDDEN("A0404", "无权限", HttpStatus.FORBIDDEN),
  NOT_FOUND("A0405", "资源不存在", HttpStatus.NOT_FOUND),
  BUSINESS_ERROR("B0001", "业务处理失败", HttpStatus.UNPROCESSABLE_ENTITY),
  INTERNAL_ERROR("C0001", "系统内部错误", HttpStatus.INTERNAL_SERVER_ERROR);
  // 字段与构造同统一封装文档
}
```

### 3.2 Result

```java
public record Result<T>(String code, String message, T data, String traceId, OffsetDateTime timestamp) {
  public static <T> Result<T> fail(ErrorCode ec, String msg) { ... }
}
```

### 3.3 BusinessException

```java
public class BusinessException extends RuntimeException {
  private final ErrorCode errorCode;
  // 构造与 errorCode() 见统一封装文档
}
```

---

## 4. 生产级 GlobalExceptionHandler

```java
package com.example.common.web;

import com.example.common.api.ErrorCode;
import com.example.common.api.Result;
import com.example.common.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<Result<Void>> handleBusiness(BusinessException ex, HttpServletRequest request) {
    log.warn("business error uri={} code={} msg={}",
        request.getRequestURI(), ex.errorCode().code(), ex.getMessage());
    return ResponseEntity
        .status(ex.errorCode().httpStatus())
        .body(Result.fail(ex.errorCode(), ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Result<Map<String, String>>> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(
            FieldError::getField,
            fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid",
            (a, b) -> a,
            LinkedHashMap::new
        ));
    log.warn("validation failed uri={} errors={}", request.getRequestURI(), errors);
    return ResponseEntity
        .status(ErrorCode.VALIDATION_FAILED.httpStatus())
        .body(new Result<>(
            ErrorCode.VALIDATION_FAILED.code(),
            ErrorCode.VALIDATION_FAILED.defaultMessage(),
            errors,
            com.example.common.trace.TraceContext.currentTraceId(),
            java.time.OffsetDateTime.now()
        ));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<Result<Map<String, String>>> handleConstraintViolation(
      ConstraintViolationException ex) {
    Map<String, String> errors = ex.getConstraintViolations().stream()
        .collect(Collectors.toMap(
            v -> v.getPropertyPath().toString(),
            v -> v.getMessage(),
            (a, b) -> a,
            LinkedHashMap::new
        ));
    return ResponseEntity
        .status(ErrorCode.VALIDATION_FAILED.httpStatus())
        .body(new Result<>(
            ErrorCode.VALIDATION_FAILED.code(),
            ErrorCode.VALIDATION_FAILED.defaultMessage(),
            errors,
            com.example.common.trace.TraceContext.currentTraceId(),
            java.time.OffsetDateTime.now()
        ));
  }

  @ExceptionHandler({
      MissingServletRequestParameterException.class,
      MethodArgumentTypeMismatchException.class,
      HttpMessageNotReadableException.class
  })
  public ResponseEntity<Result<Void>> handleBadRequest(Exception ex, HttpServletRequest request) {
    log.warn("bad request uri={} msg={}", request.getRequestURI(), ex.getMessage());
    return ResponseEntity
        .status(ErrorCode.BAD_REQUEST.httpStatus())
        .body(Result.fail(ErrorCode.BAD_REQUEST, ex.getMessage()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<Result<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
    return ResponseEntity
        .status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(Result.fail(ErrorCode.BAD_REQUEST, "不支持的方法: " + ex.getMethod()));
  }

  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  public ResponseEntity<Result<Void>> handleMediaType(HttpMediaTypeNotSupportedException ex) {
    return ResponseEntity
        .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .body(Result.fail(ErrorCode.BAD_REQUEST, "不支持的 Content-Type"));
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<Result<Void>> handleNotFound(NoHandlerFoundException ex) {
    return ResponseEntity
        .status(ErrorCode.NOT_FOUND.httpStatus())
        .body(Result.fail(ErrorCode.NOT_FOUND, "接口不存在"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Result<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
    log.error("unexpected error uri={}", request.getRequestURI(), ex);
    return ResponseEntity
        .status(ErrorCode.INTERNAL_ERROR.httpStatus())
        .body(Result.fail(ErrorCode.INTERNAL_ERROR, "服务繁忙，请稍后重试"));
  }
}
```

**要点**：

- 业务异常 **WARN**，未知异常 **ERROR** 且不把堆栈返回客户端；
- 校验错误 `data` 携带字段级详情；
- HTTP 状态与 `ErrorCode` 对齐。

---

## 5. 启用 404 抛出 NoHandlerFoundException

默认 Spring MVC 404 不进 `@ExceptionHandler`，需配置：

```yaml
# application.yml
spring:
  mvc:
    throw-exception-if-no-handler-found: true
  web:
    resources:
      add-mappings: false   # 若仅需 API，关闭静态资源映射
```

或 Java 配置：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
  @Override
  public void configurePathMatch(PathMatchConfigurer configurer) {
    // Boot 3 路径匹配默认 PathPatternParser
  }
}
```

---

## 6. @Valid 与校验注解

### 6.1 请求体校验

```java
public record OrderCreateRequest(
    @NotBlank String sku,
    @Min(1) int quantity,
    @NotNull @Positive BigDecimal price
) {}

@PostMapping("/orders")
public Result<OrderResponse> create(@Valid @RequestBody OrderCreateRequest req) {
  return Result.ok(orderService.create(req));
}
```

### 6.2 路径与查询参数

```java
@GetMapping("/orders/{id}")
public Result<OrderResponse> get(@PathVariable @Min(1) Long id) { ... }

@GetMapping("/search")
public Result<List<Item>> search(@RequestParam @NotBlank String q) { ... }
```

类上需 `@Validated` 才能校验方法参数：

```java
@RestController
@Validated
public class OrderController { ... }
```

### 6.3 自定义校验

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
  String message() default "手机号格式错误";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}
```

---

## 7. ProblemDetail（RFC 9457，Boot 3 可选）

Spring Framework 6 / Boot 3 提供 `org.springframework.http.ProblemDetail`。

```java
@ExceptionHandler(BusinessException.class)
public ProblemDetail handleBusinessProblem(BusinessException ex) {
  ProblemDetail problem = ProblemDetail.forStatusAndDetail(
      ex.errorCode().httpStatus(), ex.getMessage());
  problem.setTitle(ex.errorCode().defaultMessage());
  problem.setProperty("code", ex.errorCode().code());
  problem.setProperty("traceId", TraceContext.currentTraceId());
  return problem;
}
```

响应示例：

```json
{
  "type": "about:blank",
  "title": "资源不存在",
  "status": 404,
  "detail": "用户不存在: 99",
  "code": "A0405",
  "traceId": "abc123"
}
```

### 7.1 ResponseEntityExceptionHandler 扩展

```java
@RestControllerAdvice
public class ProblemExceptionHandler extends ResponseEntityExceptionHandler {

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    ProblemDetail problem = ProblemDetail.forStatus(status);
    problem.setTitle("参数校验失败");
    Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));
    problem.setProperty("errors", errors);
    return ResponseEntity.status(status).body(problem);
  }
}
```

**选型**：对外 BFF/移动端常用自定义 `Result`；对外开放 API 或遵循标准 REST 时可采用 `ProblemDetail`。

---

## 8. 异常处理优先级

匹配规则：**最具体异常类型优先**。

```java
@ExceptionHandler(NullPointerException.class)   // 更具体，先匹配
public ResponseEntity<Result<Void>> handleNpe(NullPointerException ex) { ... }

@ExceptionHandler(RuntimeException.class)       // 更宽泛
public ResponseEntity<Result<Void>> handleRuntime(RuntimeException ex) { ... }
```

`BusinessException` 应单独处理，不要落到笼统 `RuntimeException`。

---

## 9. 作用域控制

```java
// 仅处理指定包
@ControllerAdvice(basePackages = "com.example.api")

// 仅处理带注解的控制器
@ControllerAdvice(annotations = RestController.class)

//  assignableTypes 指定类
@ControllerAdvice(assignableTypes = {AdminController.class})
```

可拆分多个 Advice：如 `AdminExceptionHandler` 与 `ApiExceptionHandler`。

---

## 10. 安全：Authentication / AccessDenied

```java
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<Result<Void>> handleAccessDenied(AccessDeniedException ex) {
  log.warn("access denied: {}", ex.getMessage());
  return ResponseEntity
      .status(ErrorCode.FORBIDDEN.httpStatus())
      .body(Result.fail(ErrorCode.FORBIDDEN));
}

@ExceptionHandler(AuthenticationException.class)
public ResponseEntity<Result<Void>> handleAuth(AuthenticationException ex) {
  return ResponseEntity
      .status(ErrorCode.UNAUTHORIZED.httpStatus())
      .body(Result.fail(ErrorCode.UNAUTHORIZED, "认证失败"));
}
```

Spring Security 6 需确保异常能传播到 MVC（`exceptionHandling` 配置）。

---

## 11. 日志与敏感信息

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<Result<Void>> handleUnexpected(Exception ex, HttpServletRequest req) {
  // 记录完整堆栈
  log.error("uri={} method={} remote={}",
      req.getRequestURI(), req.getMethod(), req.getRemoteAddr(), ex);

  // 客户端仅通用文案
  String clientMessage = "服务繁忙，请稍后重试";

  // 开发环境可返回 detail（通过 Profile 控制）
  if (isDevProfile()) {
    clientMessage = ex.getMessage();
  }

  return ResponseEntity
      .status(ErrorCode.INTERNAL_ERROR.httpStatus())
      .body(Result.fail(ErrorCode.INTERNAL_ERROR, clientMessage));
}
```

**禁止**向用户返回：SQL、堆栈、内部 IP、密钥路径。

---

## 12. 与 Filter 层异常的区别

| 层级 | 典型异常 | 处理方式 |
|------|----------|----------|
| Filter / Security | 认证失败、CORS | `AuthenticationEntryPoint` / 自定义 Filter |
| Controller | 业务、校验 | `@ControllerAdvice` |
| 未进入 Spring | 404 静态资源 | 容器默认页或 `ErrorController` |

```java
@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {
  @Override
  public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException ex)
      throws IOException {
    res.setStatus(HttpStatus.UNAUTHORIZED.value());
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    var body = Result.fail(ErrorCode.UNAUTHORIZED);
    new ObjectMapper().writeValue(res.getOutputStream(), body);
  }
}
```

---

## 13. ErrorController（兜底）

```java
@RestController
public class CustomErrorController implements ErrorController {

  @RequestMapping("${server.error.path:${error.path:/error}}")
  public Result<Void> error(HttpServletRequest request) {
    Integer status = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
    if (status != null && status == 404) {
      return Result.fail(ErrorCode.NOT_FOUND, "资源不存在");
    }
    return Result.fail(ErrorCode.INTERNAL_ERROR);
  }
}
```

Boot 3 中 `ErrorController` 接口已简化，也可仅用 `@ControllerAdvice` + `throw-exception-if-no-handler-found`。

---

## 14. 业务异常分层

```java
// 可重试（下游超时）
public class RetryableException extends BusinessException {
  public RetryableException(String message) {
    super(ErrorCode.BUSINESS_ERROR, message);
  }
}

// 领域细分
public class InsufficientStockException extends BusinessException {
  public InsufficientStockException(String sku) {
    super(ErrorCode.BUSINESS_ERROR, "库存不足: " + sku);
  }
}
```

Handler 可合并处理 `BusinessException` 子类，或对特定子类返回不同 `code`。

---

## 15. 响应式 WebFlux（补充）

WebFlux 使用 `@ControllerAdvice` + `ResponseEntity` 同样适用；也可 `ErrorWebExceptionHandler`。校验异常为 `WebExchangeBindException`，字段提取方式类似。

---

## 16. 测试全局异常

```java
@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class ExceptionHandlerTest {

  @Autowired MockMvc mvc;
  @MockBean UserService userService;

  @Test
  void validation_failed() throws Exception {
    mvc.perform(post("/api/v1/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"username\":\"\",\"email\":\"bad\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("A0401"))
        .andExpect(jsonPath("$.data.username").exists());
  }

  @Test
  void business_not_found() throws Exception {
    when(userService.getById(1L)).thenThrow(new BusinessException(ErrorCode.NOT_FOUND, "用户不存在"));

    mvc.perform(get("/api/v1/users/1"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("A0405"));
  }
}
```

---

## 17. 监控与告警

在 `handleUnexpected` 中打点：

```java
meterRegistry.counter("api.errors.unexpected", "uri", request.getRequestURI()).increment();
```

对 `BusinessException` 按 `errorCode` 分维度统计，避免把预期业务失败当系统故障告警。

---

## 18. 常见问题

### 18.1 异常被吞掉

Service 中 `catch (Exception e) { return null; }` 导致问题隐藏。应抛出或记录后抛 `BusinessException`。

### 18.2 重复包装

```java
// ❌
catch (BusinessException e) {
  throw new BusinessException(ErrorCode.BUSINESS_ERROR, e.getMessage());
}
// ✅ 直接向上抛
```

### 18.3 @Transactional 回滚

默认仅 `RuntimeException` 回滚。业务异常继承 `RuntimeException` 即可；检查型异常需 `@Transactional(rollbackFor = Exception.class)`。

### 18.4 异步 @Async 异常

`@Async` 方法异常不会传到调用方 Controller，需在 `AsyncUncaughtExceptionHandler` 中记录。

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return (ex, method, params) ->
        log.error("async error method={}", method.getName(), ex);
  }
}
```

---

## 19. 完整处理流程图

```
请求 → Controller
         │
         ├─ 参数绑定/校验失败 → MethodArgumentNotValidException → 400 + 字段 errors
         │
         ├─ BusinessException → 对应 HTTP + Result.fail(code)
         │
         ├─ Security 异常 → 401/403
         │
         └─ 其他 Exception → 500 + 通用提示 + ERROR 日志
```

---

## 20. 检查清单（上线前）

- [ ] 所有对外接口错误均为 `Result` 或 `ProblemDetail`，无裸字符串/HTML
- [ ] 500 不泄露堆栈与 SQL
- [ ] 校验失败返回字段级信息
- [ ] `traceId` 贯穿日志与响应
- [ ] Security 异常与业务异常 HTTP 状态正确
- [ ] 404 API 路径可进入统一处理
- [ ] 集成测试覆盖 400/404/422/500

---

## 21. 小结

Spring Boot 3 生产级全局异常处理应做到：

1. **`@RestControllerAdvice`** 集中转换异常；
2. 与 **`Result` + `ErrorCode` + `BusinessException`** 配套；
3. **`@Valid` / `@Validated`** 校验失败结构化返回；
4. 可选 **`ProblemDetail`** 满足标准 REST；
5. **分级日志**：业务 WARN、系统 ERROR；
6. 客户端消息**安全、友好**，详情靠 `traceId` 查日志。

配合统一接口封装，可形成完整、可维护、可观测的 API 错误体系。
