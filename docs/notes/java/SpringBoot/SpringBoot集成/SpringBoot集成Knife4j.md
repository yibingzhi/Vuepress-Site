---
title: SpringBoot集成Knife4j
createTime: 2024/11/17 14:35:52
permalink: /SpringBoot/SpringBoot集成/fw58rklz/
---

::: tip 保鲜说明（2026-08）
Spring Boot **3.x** 请使用 **OpenAPI3 + Jakarta** 坐标。旧的 `knife4j-spring-boot-starter`（Springfox）已不兼容 Boot 3。
:::

### 一、Knife4j简介

Knife4j 是 OpenAPI / Swagger 文档的增强 UI，方便分组、调试、导出离线文档。底层走 **springdoc-openapi**（Boot 3）或历史上的 Springfox（仅 Boot 2）。

### 二、Spring Boot 3 集成（推荐）

1. **依赖**

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.5.0</version>
</dependency>
```

Gradle：

```gradle
implementation 'com.github.xiaoymin:knife4j-openapi3-jakarta-spring-boot-starter:4.5.0'
```

版本以 [Maven Central](https://central.sonatype.com/search?q=knife4j-openapi3-jakarta) 为准。

2. **配置（可选）**

```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs

knife4j:
  enable: true
  setting:
    language: zh_cn
```

3. **OpenAPI 元信息**

```java
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Documentation")
                        .description("Spring Boot 3 + Knife4j")
                        .version("1.0"));
    }
}
```

4. **Controller 注解示例**

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "示例接口")
@RestController
public class DemoController {

    @Operation(summary = "健康检查")
    @GetMapping("/api/health")
    public String health() {
        return "ok";
    }
}
```

5. **访问地址**

- 文档 UI：`http://localhost:8080/doc.html`（Knife4j 增强页）
- 或 springdoc 默认：`/swagger-ui.html`

生产环境建议关闭或加鉴权：`knife4j.enable=false` / Spring Security 拦截文档路径。

### 三、Boot 2 历史方案（勿用于新项目）

旧坐标 `knife4j-spring-boot-starter` + Springfox（`springfox.documentation.*`）仅适用于 Spring Boot 2.x。新项目一律用上文 OpenAPI3 Jakarta starter。

### 四、常见问题

| 问题 | 处理 |
|------|------|
| 404 / 文档空白 | 检查上下文 path、Security 放行 `/doc.html`、`/v3/api-docs/**` |
| 与 Security 冲突 | 对文档路径 `permitAll`，或仅在 `dev` profile 启用 |
| 依赖拉不下来 | 换中央仓镜像，核对 artifactId 是否带 `openapi3-jakarta` |
