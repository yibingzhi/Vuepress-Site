---
tags:
  - 开发规范
  - REST
  - API
  - 接口设计
title: REST接口设计规范
createTime: 2026/08/29 15:00:00
permalink: /article/rest-api-design/
---

## 一、资源命名

### 1. 基本原则

- 使用**名词**表示资源，不用动词
- 使用**复数**形式：`/users` 而非 `/user`
- 层级表示关联：`/users/{userId}/orders`
- 使用小写字母，单词间用连字符 `-`：`/order-items`

### 2. 正确与错误示例

| ✅ 推荐 | ❌ 避免 |
|---------|---------|
| `GET /users` | `GET /getUsers` |
| `POST /orders` | `POST /createOrder` |
| `GET /users/{id}/orders` | `GET /users/{id}/getOrders` |
| `DELETE /articles/{id}` | `POST /articles/{id}/delete` |

### 3. 非 CRUD 操作

用子资源或动作资源表达：

```
POST /orders/{id}/cancel          # 取消订单
POST /users/{id}/password-reset   # 重置密码
POST /payments/{id}/refund        # 退款
```

避免：`POST /cancelOrder?id=123`

---

## 二、HTTP 动词与状态码

### 1. 动词映射

| 动词 | 用途 | 幂等 | 示例 |
|------|------|------|------|
| `GET` | 查询资源 | ✅ | `GET /users/{id}` |
| `POST` | 创建资源 | ❌ | `POST /users` |
| `PUT` | 全量更新 | ✅ | `PUT /users/{id}` |
| `PATCH` | 部分更新 | ❌ | `PATCH /users/{id}` |
| `DELETE` | 删除资源 | ✅ | `DELETE /users/{id}` |

### 2. 常用状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| `200` | OK | GET/PUT/PATCH 成功 |
| `201` | Created | POST 创建成功 |
| `204` | No Content | DELETE 成功 |
| `400` | Bad Request | 参数校验失败 |
| `401` | Unauthorized | 未认证 |
| `403` | Forbidden | 无权限 |
| `404` | Not Found | 资源不存在 |
| `409` | Conflict | 资源冲突（重复创建） |
| `422` | Unprocessable Entity | 业务校验失败 |
| `429` | Too Many Requests | 限流 |
| `500` | Internal Server Error | 服务端异常 |

### 3. 响应头

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/42
X-Request-Id: 8f3a2b1c-...
```

---

## 三、分页

### 1. 偏移分页（Offset）

适合传统列表，深分页性能差：

```
GET /users?page=1&pageSize=20
```

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### 2. 游标分页（Cursor）

适合 Feed、大数据量场景：

```
GET /messages?cursor=eyJpZCI6MTIzfQ&limit=20
```

```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

### 3. Spring 示例

```java
@GetMapping("/users")
public PageResult<UserVO> listUsers(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "20") int pageSize) {
    Page<User> result = userService.page(Page.of(page, pageSize));
    return PageResult.of(result);
}
```

---

## 四、错误响应体

### 1. 统一结构

```json
{
  "code": "USER_NOT_FOUND",
  "message": "用户不存在",
  "details": [
    { "field": "email", "message": "邮箱格式不正确" }
  ],
  "timestamp": "2026-08-29T15:00:00+08:00",
  "path": "/api/v1/users/999",
  "requestId": "8f3a2b1c-d4e5-6789-abcd-ef0123456789"
}
```

### 2. 设计原则

- `code`：机器可读的业务错误码（非 HTTP 状态码）
- `message`：人类可读的简短描述
- `details`：字段级校验错误（可选）
- `requestId`：便于日志关联排查

### 3. Spring Boot 全局异常

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(ErrorResponse.of("RESOURCE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> details = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest()
            .body(ErrorResponse.of("VALIDATION_ERROR", "参数校验失败", details));
    }
}
```

---

## 五、版本管理

### 1. URL 路径版本（推荐，直观）

```
GET /api/v1/users
GET /api/v2/users
```

### 2. Header 版本

```http
GET /users
Accept: application/vnd.example.v1+json
```

### 3. 实践建议

- 新版本保持向后兼容，废弃字段用 `deprecated` 标注
- 在 OpenAPI 文档中声明版本策略
- 旧版本保留至少一个发布周期

---

## 六、幂等性

### 1. 天然幂等

- `GET`、`PUT`、`DELETE` 对同一资源多次调用结果一致

### 2. POST 幂等保障

使用客户端幂等键：

```http
POST /payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "orderId": "ORD-001", "amount": 99.00 }
```

服务端逻辑：

1. 检查 `Idempotency-Key` 是否已处理
2. 已处理 → 返回缓存的响应
3. 未处理 → 执行业务并存储结果

### 3. 分布式场景

结合 Redis 或数据库唯一约束实现幂等表。

---

## 七、认证与请求头

### 1. 常用 Header

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
Accept-Language: zh-CN
X-Request-Id: <uuid>          # 链路追踪
X-Tenant-Id: tenant-001        # 多租户
```

### 2. 认证方式

| 方式 | 适用场景 |
|------|----------|
| Bearer Token（JWT） | 前后端分离、微服务 |
| API Key | 开放平台、B2B |
| OAuth 2.0 | 第三方授权 |
| Basic Auth | 内部工具、遗留系统 |

### 3. 安全规范

- 敏感接口强制 HTTPS
- Token 设置合理过期时间，支持刷新
- 不在 URL 中传递 Token 或密码
- 响应中不返回密码、完整卡号等敏感字段

---

## 八、OpenAPI 规范

### 1. 注解示例（SpringDoc）

```java
@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Operation(summary = "获取用户详情")
    @ApiResponse(responseCode = "200", description = "成功")
    @ApiResponse(responseCode = "404", description = "用户不存在")
    @GetMapping("/{id}")
    public UserVO getUser(@Parameter(description = "用户 ID") @PathVariable Long id) {
        return userService.getById(id);
    }
}
```

### 2. 依赖

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

访问：`http://localhost:8080/swagger-ui.html`

### 3. 文档即契约

- 接口变更同步更新 OpenAPI
- CI 中校验文档与实现一致性
- 可导出 JSON/YAML 供前端 Mock 与代码生成

---

## 九、反模式（Anti-Patterns）

### 1. 避免的做法

| 反模式 | 问题 | 改进 |
|--------|------|------|
| 所有操作用 POST | 语义不清 | 按场景选动词 |
| 返回 200 + 错误码 | 客户端难处理 | 用正确 HTTP 状态码 |
| 巨型响应体 | 性能差 | 分页、字段过滤 |
| 无版本策略 | 破坏性变更 | `/api/v1` |
| 泄露堆栈信息 | 安全风险 | 统一错误体 |
| `GET` 带 body | 部分客户端不支持 | 查询放 Query |
| 过度嵌套 `/a/b/c/d/e` | 难维护 | 扁平化 + 关联资源 |

### 2. 过度设计

- 不必为每个字段提供独立端点
- HATEOAS 在多数业务 API 中非必需
- GraphQL 与 REST 按场景选型，非互相替代

### 3. 字段过滤（可选优化）

```
GET /users/1?fields=id,name,email
```

---

## 十、完整接口示例

```http
### 创建用户
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer eyJhbG...

{
  "name": "张三",
  "email": "zhangsan@example.com"
}

### 响应 201
{
  "id": 42,
  "name": "张三",
  "email": "zhangsan@example.com",
  "createdAt": "2026-08-29T15:00:00+08:00"
}

### 查询列表
GET /api/v1/users?page=1&pageSize=10&status=active

### 部分更新
PATCH /api/v1/users/42
Content-Type: application/json

{
  "name": "张三丰"
}
```

---

## 小结

- 资源用名词复数，操作用 HTTP 动词
- 状态码表达结果，错误体统一结构
- 分页选 offset 或 cursor，POST 用幂等键
- 版本放 URL，认证用 Bearer Token
- OpenAPI 文档与实现同步，远离常见反模式
