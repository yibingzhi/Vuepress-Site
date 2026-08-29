---
title: SpringBoot统一接口封装
tags:
  - Spring Boot
  - REST
  - API
  - 统一响应
createTime: 2024/12/19 20:40:02
permalink: /SpringBoot/h66lo7an/
---

::: tip 保鲜说明（2026-08）
本文基于 **Spring Boot 3.x**（`jakarta.*` 命名空间）。统一响应体与全局异常处理配套使用；错误码建议与 [SpringBoot全局异常处理](/SpringBoot/9pt6kmn8/) 中的 `ErrorCode` 枚举保持一致。
:::

## 1. 为什么要统一封装

前后端分离项目中，若每个接口返回结构不同，前端需要写大量适配逻辑。统一封装带来：

| 收益 | 说明 |
|------|------|
| 契约稳定 | `code` / `message` / `data` 字段固定 |
| 错误可处理 | 业务错误与系统错误可区分 |
| 可观测 | 日志、链路追踪可关联 `traceId` |
| 文档友好 | OpenAPI 可复用同一 Schema |

典型成功响应：

```json
{
  "code": "0",
  "message": "success",
  "data": { "id": 1, "username": "alice" },
  "traceId": "a1b2c3d4",
  "timestamp": "2026-08-29T14:30:00+08:00"
}
```

---

## 2. 设计原则

1. **HTTP 状态码表达传输语义**（200/201/400/401/404/500），**业务码 `code` 表达业务结果**。
2. **成功与失败结构一致**，失败时 `data` 可为 `null` 或携带校验详情。
3. **不要**在 Controller 里到处 `new Result()`，使用工厂方法或静态工具。
4. **分页、空列表**仍走同一包装，避免「有时裸数组有时对象」。
5. 与 **RFC 9457 Problem Details** 可并存（异常处理侧），对外 JSON 仍以团队约定为准。

---

## 3. 错误码枚举 ErrorCode

```java
package com.example.common.api;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

  SUCCESS("0", "success", HttpStatus.OK),
  BAD_REQUEST("A0400", "请求参数错误", HttpStatus.BAD_REQUEST),
  VALIDATION_FAILED("A0401", "参数校验失败", HttpStatus.BAD_REQUEST),
  UNAUTHORIZED("A0403", "未认证", HttpStatus.UNAUTHORIZED),
  FORBIDDEN("A0404", "无权限", HttpStatus.FORBIDDEN),
  NOT_FOUND("A0405", "资源不存在", HttpStatus.NOT_FOUND),
  BUSINESS_ERROR("B0001", "业务处理失败", HttpStatus.UNPROCESSABLE_ENTITY),
  INTERNAL_ERROR("C0001", "系统内部错误", HttpStatus.INTERNAL_SERVER_ERROR);

  private final String code;
  private final String defaultMessage;
  private final HttpStatus httpStatus;

  ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
    this.code = code;
    this.defaultMessage = defaultMessage;
    this.httpStatus = httpStatus;
  }

  public String code() { return code; }
  public String defaultMessage() { return defaultMessage; }
  public HttpStatus httpStatus() { return httpStatus; }
}
```

编码建议：`A` 客户端、`B` 业务、`C` 系统，便于监控告警分级。

---

## 4. 统一响应体 Result / R

```java
package com.example.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record Result<T>(
    String code,
    String message,
    T data,
    String traceId,
    OffsetDateTime timestamp
) {

  public static <T> Result<T> ok(T data) {
    return of(ErrorCode.SUCCESS, ErrorCode.SUCCESS.defaultMessage(), data);
  }

  public static <T> Result<T> ok() {
    return ok(null);
  }

  public static <T> Result<T> fail(ErrorCode errorCode) {
    return of(errorCode, errorCode.defaultMessage(), null);
  }

  public static <T> Result<T> fail(ErrorCode errorCode, String message) {
    return of(errorCode, message, null);
  }

  public static <T> Result<T> of(ErrorCode errorCode, String message, T data) {
    return new Result<>(
        errorCode.code(),
        message,
        data,
        TraceContext.currentTraceId(),
        OffsetDateTime.now()
    );
  }

  public boolean isSuccess() {
    return ErrorCode.SUCCESS.code().equals(code);
  }
}
```

若团队习惯类名 `R`：

```java
public final class R {
  private R() {}

  public static <T> Result<T> data(T data) { return Result.ok(data); }
  public static Result<Void> ok() { return Result.ok(); }
  public static <T> Result<T> fail(String message) {
    return Result.fail(ErrorCode.BUSINESS_ERROR, message);
  }
}
```

---

## 5. 分页响应 PageResult

```java
package com.example.common.api;

import java.util.List;

public record PageResult<T>(
    List<T> records,
    long total,
    long page,
    long size
) {
  public static <T> PageResult<T> of(List<T> records, long total, long page, long size) {
    return new PageResult<>(records, total, page, size);
  }
}
```

Controller 返回：

```java
return Result.ok(PageResult.of(list, total, page, size));
```

与 MyBatis-Plus `IPage`、Spring Data `Page` 转换：

```java
public static <T> PageResult<T> from(Page<T> springPage) {
  return PageResult.of(
      springPage.getContent(),
      springPage.getTotalElements(),
      springPage.getNumber() + 1L,
      springPage.getSize()
  );
}
```

---

## 6. TraceId 上下文

```java
package com.example.common.trace;

import org.slf4j.MDC;

public final class TraceContext {
  public static final String MDC_KEY = "traceId";

  private TraceContext() {}

  public static String currentTraceId() {
    String id = MDC.get(MDC_KEY);
    return id != null ? id : "";
  }

  public static void setTraceId(String traceId) {
    MDC.put(MDC_KEY, traceId);
  }

  public static void clear() {
    MDC.remove(MDC_KEY);
  }
}
```

配合 Filter 从请求头 `X-Trace-Id` 读取或生成 UUID（Micrometer Tracing 会自动注入）。

---

## 7. ResponseBodyAdvice 自动包装（可选）

若希望 Controller **直接返回 DTO**，由 Advice 统一包一层：

```java
package com.example.common.web;

import com.example.common.api.Result;
import com.example.common.api.ErrorCode;
import com.example.common.api.SkipResponseWrap;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice(basePackages = "com.example")
public class UnifiedResponseAdvice implements ResponseBodyAdvice<Object> {

  @Override
  public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
    if (returnType.getContainingClass().isAnnotationPresent(SkipResponseWrap.class)) {
      return false;
    }
    if (returnType.hasMethodAnnotation(SkipResponseWrap.class)) {
      return false;
    }
    return !Result.class.isAssignableFrom(returnType.getParameterType());
  }

  @Override
  public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
      Class<? extends HttpMessageConverter<?>> selectedConverterType,
      ServerHttpRequest request, ServerHttpResponse response) {
    if (body == null) {
      return Result.ok();
    }
    if (body instanceof Result) {
      return body;
    }
    return Result.ok(body);
  }
}
```

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface SkipResponseWrap {}
```

**注意**：返回 `String` 时 Jackson 序列化需额外处理；更稳妥是 Controller 显式返回 `Result<T>`。

---

## 8. Controller 显式返回（推荐）

```java
package com.example.user.controller;

import com.example.common.api.Result;
import com.example.common.api.PageResult;
import com.example.common.api.ErrorCode;
import com.example.common.exception.BusinessException;
import com.example.user.dto.UserCreateRequest;
import com.example.user.dto.UserResponse;
import com.example.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/{id}")
  public Result<UserResponse> getById(@PathVariable Long id) {
    return Result.ok(userService.getById(id));
  }

  @PostMapping
  public Result<UserResponse> create(@Valid @RequestBody UserCreateRequest req) {
    return Result.ok(userService.create(req));
  }

  @GetMapping
  public Result<PageResult<UserResponse>> page(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    return Result.ok(userService.page(page, size));
  }
}
```

业务「未找到」等场景**抛 BusinessException**，由全局异常处理转 `Result`，Controller 保持简洁。

---

## 9. DTO 与校验

```java
package com.example.user.dto;

import jakarta.validation.constraints.*;

public record UserCreateRequest(
    @NotBlank @Size(min = 2, max = 32) String username,
    @NotBlank @Email String email,
    @Min(0) @Max(150) Integer age
) {}
```

校验失败由 `MethodArgumentNotValidException` 处理，见全局异常文档。

---

## 10. 业务异常 BusinessException

```java
package com.example.common.exception;

import com.example.common.api.ErrorCode;

public class BusinessException extends RuntimeException {

  private final ErrorCode errorCode;

  public BusinessException(ErrorCode errorCode) {
    super(errorCode.defaultMessage());
    this.errorCode = errorCode;
  }

  public BusinessException(ErrorCode errorCode, String message) {
    super(message);
    this.errorCode = errorCode;
  }

  public ErrorCode errorCode() {
    return errorCode;
  }
}
```

Service 层：

```java
public UserResponse getById(Long id) {
  return userRepository.findById(id)
      .map(UserResponse::from)
      .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在: " + id));
}
```

---

## 11. HTTP 状态与 Result 的配合

全局异常处理器返回 `ResponseEntity<Result<?>>`，根据 `ErrorCode.httpStatus()` 设置状态码：

```java
return ResponseEntity
    .status(ex.errorCode().httpStatus())
    .body(Result.fail(ex.errorCode(), ex.getMessage()));
```

成功统一 `200`（创建可用 `201`，body 仍为 `Result`）。

---

## 12. OpenAPI / Swagger 集成

```java
@Operation(summary = "根据 ID 查询用户")
@ApiResponse(responseCode = "200", description = "成功",
    content = @Content(schema = @Schema(implementation = UserResponseResult.class)))
public Result<UserResponse> getById(@PathVariable Long id) { ... }

// 包装类型供文档引用
public class UserResponseResult extends Result<UserResponse> {}
```

或使用 `@Schema` 在 `Result` 上标注泛型说明。Knife4j 4.x 支持 Spring Boot 3。

---

## 13. 幂等与防重复提交（扩展）

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
  long ttlSeconds() default 60;
}
```

统一响应可携带 `requestId`；重复请求返回 `ErrorCode.BAD_REQUEST` +「请勿重复提交」。

---

## 14. 国际化 message（可选）

```java
public record Result<T>(...) {
  public static <T> Result<T> ok(T data, MessageSource ms, Locale locale) {
    String msg = ms.getMessage("result.success", null, locale);
    return Result.of(ErrorCode.SUCCESS, msg, data);
  }
}
```

`messages.properties` / `messages_zh_CN.properties`。

---

## 15. 与 ProblemDetail 的关系

Boot 3 支持 RFC 9457 `ProblemDetail` 作为错误响应。团队可以：

- **对外 API**：统一 `Result` JSON（本文方案）。
- **内部微服务 / 标准 REST**：异常时返回 `ProblemDetail`，成功仍用 `Result`。

二者在 `@ControllerAdvice` 中分支处理，见全局异常处理文档。

---

## 16. 日志规范

成功接口一般 **INFO** 访问日志由 Filter 记录；业务失败 **WARN**；未预期异常 **ERROR**。

```java
@Slf4j
public class UserService {
  public UserResponse create(UserCreateRequest req) {
    log.info("create user username={}", req.username());
    // ...
  }
}
```

不要在 `Result` 里塞堆栈；`traceId` 足够关联日志。

---

## 17. 反模式

| 反模式 | 问题 |
|--------|------|
| 用 HTTP 200 包一切错误 | 网关、缓存、监控无法区分 |
| `code` 用 int 且与 HTTP 混用 | 扩展业务码困难 |
| 成功时 `data` 再套一层 `data` | 前端解析痛苦 |
| Controller 捕获异常返回 fail | 应用全局异常处理 |
| 返回 `Map<String,Object>` | 失去类型与文档 |

---

## 18. 完整模块结构

```
com.example.common
├── api
│   ├── Result.java
│   ├── PageResult.java
│   ├── ErrorCode.java
│   └── R.java
├── exception
│   └── BusinessException.java
├── trace
│   └── TraceContext.java
└── web
    ├── UnifiedResponseAdvice.java
    └── TraceFilter.java
```

---

## 19. TraceFilter 示例

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String traceId = Optional.ofNullable(request.getHeader("X-Trace-Id"))
        .filter(s -> !s.isBlank())
        .orElse(UUID.randomUUID().toString().replace("-", ""));
    TraceContext.setTraceId(traceId);
    response.setHeader("X-Trace-Id", traceId);
    try {
      filterChain.doFilter(request, response);
    } finally {
      TraceContext.clear();
    }
  }
}
```

---

## 20. 测试

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

  @Autowired MockMvc mvc;
  @MockBean UserService userService;

  @Test
  void getById_ok() throws Exception {
    when(userService.getById(1L)).thenReturn(new UserResponse(1L, "alice", "a@b.com"));

    mvc.perform(get("/api/v1/users/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("0"))
        .andExpect(jsonPath("$.data.username").value("alice"));
  }
}
```

---

## 21. 小结

生产级统一接口封装应包含：

1. **`Result<T>`** 与 **`ErrorCode` 枚举**；
2. **`BusinessException`** + 全局异常处理（配套文档）；
3. **`@Valid` 校验**与分页 `PageResult`；
4. **`traceId`** 与访问日志；
5. **Spring Boot 3 / jakarta.validation**；
6. 可选 **ResponseBodyAdvice**，推荐 Controller **显式返回 `Result`** 以保持类型清晰。

按此约定，前后端契约稳定，错误可追踪，也为 OpenAPI 与监控打下统一基础。
