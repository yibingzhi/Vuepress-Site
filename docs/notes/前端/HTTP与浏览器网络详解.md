---
tags:
  - 前端
  - HTTP
  - 网络
  - 浏览器
  - HTTPS
title: HTTP与浏览器网络详解
createTime: 2026/08/29 16:00:00
permalink: /article/http-browser-network/
---

::: tip 2026 实践
生产环境 **HTTPS 全站**；API 优先 **无状态 Token（JWT/Bearer）**；理解 **CORS** 与 **缓存头** 可少踩 80% 前后端联调坑。
:::

## 一、HTTP 协议演进

| 版本 | 关键特性 | 现状 |
|------|----------|------|
| HTTP/1.0 | 短连接 | 已淘汰 |
| HTTP/1.1 | 持久连接、Host 头、分块传输 | 广泛兼容 |
| HTTP/2 | 多路复用、头部压缩 HPACK、二进制帧 | 主流 CDN/网关 |
| HTTP/3 | 基于 QUIC（UDP）、0-RTT 连接 | 逐步普及 |

### 1.1 HTTP/1.1 局限

- 同一域名 TCP 连接数有限（浏览器约 6 个）
- 队头阻塞：一个慢响应阻塞同连接后续请求
- 头部重复传输，无压缩

```
HTTP/1.1 连接 1: [req1][res1][req2][res2]...
HTTP/1.1 连接 2: [req3][res3]...
```

### 1.2 HTTP/2 改进

```
单一 TCP 连接
  Stream 1: req/res
  Stream 3: req/res
  Stream 5: req/res   ← 多路复用，并行
```

- Server Push（已较少用，易被缓存策略替代）
- 仍需 TLS 上跑（h2）

### 1.3 HTTP/3 / QUIC

- 传输层用 UDP，连接迁移（Wi-Fi ↔ 4G）
- 独立流，单流丢包不阻塞其他流
- Chrome、Cloudflare 默认支持

**开发建议：** 前端无需手动选版本；确保 TLS 与现代 cipher；静态资源 CDN 开启 HTTP/2/3。

---

## 二、HTTPS 与 TLS

### 2.1 握手流程（简化）

```
Client                    Server
  │ ClientHello  ────────►│
  │◄──────── ServerHello │
  │        Certificate    │
  │  验证证书链            │
  │  密钥交换              │
  │◄────── 加密通信 ─────►│
```

1. 客户端发起，协商 TLS 版本与 cipher
2. 服务端返回证书（含公钥）
3. 客户端验证证书（CA、域名、有效期）
4. 生成会话密钥，对称加密后续 HTTP

### 2.2 证书与 HSTS

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

- **Let's Encrypt** 免费证书；生产用自动续期（certbot）
- **HSTS** 强制浏览器仅用 HTTPS

### 2.3 混合内容

HTTPS 页面加载 HTTP 资源会被浏览器阻止（active mixed content）。所有 API、CDN 统一 HTTPS。

---

## 三、HTTP 请求与响应结构

### 3.1 请求

```http
POST /api/orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
X-Request-Id: 7f3a9c2e

{"userId":1,"items":[{"sku":"A","qty":2}]}
```

### 3.2 响应

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
ETag: "abc123"
X-Request-Id: 7f3a9c2e

{"orderId":10086,"orderNo":"O-001"}
```

### 3.3 常用方法

| 方法 | 幂等 | 安全 | 用途 |
|------|------|------|------|
| GET | 是 | 是 | 查询 |
| POST | 否 | 否 | 创建 |
| PUT | 是 | 否 | 全量更新 |
| PATCH | 否 | 否 | 部分更新 |
| DELETE | 是 | 否 | 删除 |
| HEAD | 是 | 是 | 仅头，同 GET |

---

## 四、状态码

### 4.1 2xx 成功

| 码 | 含义 |
|----|------|
| 200 OK | 成功（GET/PUT/PATCH） |
| 201 Created | 创建成功，常带 Location |
| 204 No Content | 成功无 body（DELETE） |

### 4.2 3xx 重定向

| 码 | 含义 |
|----|------|
| 301 | 永久重定向，SEO 权重转移 |
| 302/307 | 临时重定向 |
| 304 | Not Modified，走缓存 |

### 4.3 4xx 客户端错误

| 码 | 含义 |
|----|------|
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 已认证但无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（重复创建） |
| 422 | 语义错误（校验失败） |
| 429 | 限流 |

### 4.4 5xx 服务端错误

| 码 | 含义 |
|----|------|
| 500 | 内部错误 |
| 502 | 网关上游无效 |
| 503 | 服务不可用（过载/维护） |
| 504 | 网关超时 |

```typescript
// axios 统一处理
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) router.push('/login')
    if (status === 429) toast.warn('请求过于频繁')
    return Promise.reject(error)
  }
)
```

---

## 五、CORS（跨域资源共享）

浏览器 **同源策略**：协议、域名、端口任一不同即为跨域。

```
前端 https://app.example.com
API   https://api.example.com  ← 跨域
```

### 5.1 简单请求 vs 预检

**简单请求**（不触发 preflight）需同时满足：

- 方法：GET、HEAD、POST
- 头：Accept、Accept-Language、Content-Language、Content-Type（限三种）
- Content-Type：`text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`

其余（如 `Content-Type: application/json`、自定义头）触发 **OPTIONS 预检**。

```
OPTIONS /api/users
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type

← 204
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

### 5.2 服务端配置（Spring Boot）

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

```java
// 或 Spring Security
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.com"));
    config.setAllowedMethods(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

### 5.3 常见坑

| 现象 | 原因 |
|------|------|
| CORS 错误但 Postman 正常 | 浏览器独有，服务端未返回 ACAO 头 |
| `*` + credentials | 不允许；需指定 Origin |
| 302 跨域 | 预检不跟随重定向 |
| 开发代理 | Vite `server.proxy` 同源转发，绕过 CORS |

```typescript
// vite.config.ts 开发代理
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 六、Cookie vs Token

### 6.1 Cookie

```http
Set-Cookie: sessionId=abc; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
```

| 属性 | 作用 |
|------|------|
| HttpOnly | JS 无法读取，防 XSS 窃取 |
| Secure | 仅 HTTPS 传输 |
| SameSite | Strict/Lax/None，防 CSRF |
| Domain/Path | 作用范围 |

**Session Cookie：** 服务端存会话，Cookie 只带 sessionId。

### 6.2 Token（JWT / Bearer）

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| 对比 | Cookie Session | Token（JWT） |
|------|----------------|--------------|
| 存储 | Cookie 自动带 | localStorage / memory |
| 跨域 | 需 SameSite/CORS credentials | Authorization 头，SPA 友好 |
| 注销 | 服务端删 session | 黑名单或短过期 + refresh |
| CSRF | 需防护 | 不受 CSRF（XSS 仍危险） |

### 6.3 2026 推荐实践

**前后端分离 SPA：**

```
Access Token  → 内存变量，15min 过期
Refresh Token → HttpOnly Secure Cookie 或 Rotation 接口
```

```typescript
// 内存存 access，不写 localStorage（降低 XSS 风险）
let accessToken: string | null = null

async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', { credentials: 'include' })
  const { accessToken: token } = await res.json()
  accessToken = token
}
```

**BFF 模式：** 浏览器只认同源 Cookie，Token 不暴露给前端 JS。

---

## 七、缓存

### 7.1 缓存位置

```
浏览器内存缓存 → 磁盘缓存 → Service Worker → CDN → 源站
```

### 7.2 响应头

| 头 | 说明 |
|----|------|
| Cache-Control | 主控：`max-age`、`no-cache`、`no-store`、`private`、`public` |
| ETag | 资源版本标识 |
| Last-Modified | 修改时间 |
| Expires | 绝对过期（HTTP/1.0，优先 Cache-Control） |

```http
# 静态资源（带 hash 文件名）— 长期缓存
Cache-Control: public, max-age=31536000, immutable

# API 响应 — 不缓存
Cache-Control: no-store

# 需协商缓存
Cache-Control: no-cache
ETag: "v1-abc123"
```

```http
# 第二次请求
GET /api/products/1
If-None-Match: "v1-abc123"

← 304 Not Modified（无 body）
```

### 7.3 前端构建缓存

```typescript
// Vite 产物
// assets/index-a1b2c3.js  ← content hash
// Cache-Control: immutable, max-age=1年
// index.html             ← no-cache，每次验证
```

### 7.4 禁止缓存场景

- 用户个人信息 API
- 含 Authorization 的响应（默认 `private`）
- 支付、订单状态查询

```java
@GetMapping("/api/me")
public ResponseEntity<UserDTO> me() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(userService.currentUser());
}
```

---

## 八、连接与性能

### 8.1 持久连接

```http
Connection: keep-alive
```

HTTP/1.1 默认持久连接，减少 TCP 握手。

### 8.2 DNS 与预连接

```html
<link rel="dns-prefetch" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

### 8.3 压缩

```nginx
gzip on;
gzip_types application/json application/javascript text/css;
# 或 Brotli，体积更小
```

`Content-Encoding: gzip` / `br`

### 8.4 HTTP/2 多路复用注意

单连接并行多请求；仍避免 **超大单体 JS**，按路由 code split。

---

## 九、Fetch API

### 9.1 基础用法

```typescript
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    credentials: 'include', // 带 Cookie
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    throw new HttpError(res.status, await res.text())
  }
  return res.json()
}
```

### 9.2 AbortController 取消

```typescript
const controller = new AbortController()

fetch('/api/search?q=vue', { signal: controller.signal })

// 组件卸载时取消
onUnmounted(() => controller.abort())
```

### 9.3 流式响应（SSE / AI）

```typescript
const res = await fetch('/api/chat/stream', { method: 'POST', body: JSON.stringify(payload) })
const reader = res.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  console.log(decoder.decode(value))
}
```

---

## 十、Axios 实践

### 10.1 实例配置

```typescript
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})
```

### 10.2 拦截器

```typescript
http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Request-Id'] = crypto.randomUUID()
  return config
})

let refreshing: Promise<void> | null = null

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      refreshing ??= refreshAccessToken().finally(() => { refreshing = null })
      await refreshing
      return http(original)
    }
    return Promise.reject(error)
  }
)
```

### 10.3 与 Fetch 对比

| | Fetch | Axios |
|--|-------|-------|
| 浏览器原生 | 是 | 否 |
| 超时 | 需 AbortSignal | `timeout` 配置 |
| 拦截器 | 需封装 | 内置 |
| JSON | 手动 `.json()` | 自动转换 |
| 上传进度 | 有限 | `onUploadProgress` |

---

## 十一、安全相关头

```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Referrer-Policy strict-origin-when-cross-origin;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'";
```

| 头 | 作用 |
|----|------|
| CSP | 限制脚本/样式来源，防 XSS |
| X-Frame-Options | 防点击劫持 |
| nosniff | 禁止 MIME 嗅探 |

---

## 十二、WebSocket 与 HTTP 关系

```
HTTP Upgrade
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade

← 101 Switching Protocols
```

长连接双向通信；REST 仍用 HTTP。Socket.IO 可在 WS 不可用时降级 polling。

---

## 十三、调试工具

| 工具 | 用途 |
|------|------|
| Chrome DevTools Network | 瀑布图、头、预览 |
| curl | 命令行复现 |
| Postman / Bruno | API 集合 |
| Charles / mitmproxy | 抓包 HTTPS（需装证书） |

```bash
# 查看响应头
curl -I https://api.example.com/health

# 详细 TLS
curl -v https://api.example.com/api/users/1

# 带 Token
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/api/me
```

**Network 面板关注：** Status、Type、Size（disk/memory cache）、Waterfall、Initiator。

---

## 十四、REST 与 HTTP 语义

```typescript
// 资源导向 URL
GET    /api/orders?page=1&size=20
POST   /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}
PATCH  /api/orders/{id}/status
DELETE /api/orders/{id}
```

错误体统一格式：

```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "库存不足",
  "traceId": "7f3a9c2e",
  "timestamp": "2026-08-29T08:00:00Z"
}
```

详见 [REST接口设计规范](/article/rest-api-design/)。

---

## 十五、检查清单

- [ ] 全站 HTTPS + HSTS
- [ ] API `Cache-Control: no-store`（动态数据）
- [ ] 静态资源 hash + `immutable`
- [ ] CORS 白名单 Origin，禁止 `*` + credentials
- [ ] Token 存内存；Refresh HttpOnly Cookie
- [ ] axios/fetch 统一 401 刷新与错误处理
- [ ] 请求带 `X-Request-Id` 便于链路追踪
- [ ] 理解 401 vs 403，正确返回状态码

---

## 参考

- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JWT认证实战](/article/jwt-auth/)
- [REST接口设计规范](/article/rest-api-design/)
