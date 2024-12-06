---
title: SpringBoot集成Knife4j
createTime: 2024/11/17 14:35:52
permalink: /SpringBoot/o0pl2810/
---
以下是一份关于Knife4j的笔记，涵盖了它的基本介绍、使用步骤、主要功能以及一些常见应用场景等内容，希望对你有所帮助：

### 一、Knife4j简介
- **背景与概述**：
Knife4j是基于Swagger的增强解决方案，旨在为开发者提供更友好、功能更丰富的接口文档生成及展示工具。在使用Spring Boot等框架开发项目时，虽然Swagger本身能实现API文档自动生成，但Knife4j在其基础上进行了优化和扩展，拥有更好的界面交互体验、更多实用的功能特性，方便前后端开发人员基于文档进行协作以及对接口进行测试等操作。

- **与Swagger的关系**：
它底层依赖Swagger，实际上是对Swagger进行了封装和拓展，在保留Swagger原有功能的基础上，新增了很多符合国内开发习惯以及实际项目使用场景需求的功能，比如文档的分组管理、离线文档下载、接口排序等，使得接口文档更易于维护和查看。

### 二、在Spring Boot项目中的集成步骤
1. **添加依赖**：
如果使用Maven构建项目，在`pom.xml`文件中添加如下依赖：
```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>
```
若使用Gradle构建，则在`build.gradle`文件里添加：
```gradle
implementation 'com.github.xiaoymin:knife4j-spring-boot-starter:3.0.3'
```
这里的版本号可根据实际情况进行更新，查看最新版本可前往Maven中央仓库等官方资源库。

2. **配置文件配置（可选）**：
可以在Spring Boot的`application.properties`或`application.yml`配置文件中对Knife4j做一些基础配置，比如修改文档访问的路径、配置接口文档的基本信息等。以下是一个简单的`application.yml`配置示例：
```yaml
knife4j:
  # 配置文档标题
  setting:
    title: My API Documentation
    # 配置文档描述
    description: This is the API documentation for my Spring Boot application.
    # 配置接口文档的版本号
    version: 1.0
    # 开启生产环境是否显示文档，默认是false，开发环境一般设置为true，生产环境可根据需求决定是否开启
    enable: true
```

3. **创建配置类（类似Swagger配置但更简洁）**：
创建一个配置类用于配置Knife4j相关内容，示例如下：
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationPlugin;
import springfox.documentation.spring.web.plugins.DelegatingWebMvcConfiguration;
import springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider;
import springfox.documentation.spring5.plugins.WebFluxRequestHandlerProvider;
import com.github.xiaoymin.knife4j.spring.annotations.EnableKnife4j;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableKnife4j
public class Knife4jConfig {

    @Bean
    public DocumentationPlugin knife4jSpringfoxPlugin() {
        return new DocumentationPlugin()
              .apiInfo(apiInfo())
              .select()
              .apis(RequestHandlerSelectors.basePackage("com.example.demo.controller")) // 替换成项目中Controller所在包路径
              .paths(PathSelectors.any())
              .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
              .title("API Documentation")
              .description("This is the API documentation for the Spring Boot application.")
              .version("1.0")
              .build();
    }

    // 以下部分同样是解决部分Spring Boot版本中请求处理器相关兼容性问题，和Swagger配置类似但可按需调整
    @Bean
    public DelegatingWebMvcConfiguration webMvcConfiguration() {
        return new DelegatingWebMvcConfiguration() {
            // 此处省略和Swagger配置中重复的大量方法覆盖代码，可根据实际项目中遇到的兼容性问题具体添加或调整相关方法覆盖内容
            @Override
            protected void configureWebMvcRequestHandlerProvider(WebMvcRequestHandlerProvider provider) {
                List<WebMvcRequestHandler> handlers = provider.getRequestHandlers().stream()
                      .filter(handler -> handler.getPatternsCondition().getPatterns().stream()
                              .anyMatch(pattern ->!pattern.startsWith("/error")))
                      .collect(Collectors.toList());
                provider.setRequestHandlers(handlers);
            }

            @Override
            protected void configureWebFluxRequestHandlerProvider(WebFluxRequestHandlerProvider provider) {
                List<WebFluxRequestHandler> handlers = provider.getRequestHandlers().stream()
                      .filter(handler -> handler.getPatternsCondition().getPatterns().stream()
                              .anyMatch(pattern ->!pattern.startsWith("/error")))
                      .collect(Collectors.toList());
                provider.setRequestHandlers(handlers);
            }
        };
    }
}
```
在上述配置类中：
- 通过`@EnableKnife4j`注解开启Knife4j功能。
- `knife4jSpringfoxPlugin`方法配置了接口文档的基本信息以及指定扫描Controller的包路径，和Swagger配置思路类似但由Knife4j来处理展示等后续流程。
- `webMvcConfiguration`里处理的请求处理器兼容性问题可视项目具体的Spring Boot版本等情况进行适当调整或简化。

4. **使用注解丰富接口文档信息**：
同样可以使用Swagger中的一些常用注解（因为Knife4j基于Swagger），并且Knife4j自身也有部分扩展注解来进一步完善文档内容。
- **常用Swagger注解示例**：
    - `@Api`（标注在`Controller`类上）：用于对Controller进行分类描述，例如：
```java
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "User Controller")
@RestController
public class UserController {
    // 接口方法定义
    @GetMapping("/users")
    public String getUsers() {
        return "List of users";
    }
}
```
    - `@ApiOperation`（标注在接口方法上）：描述接口方法对应的操作，比如：
```java
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "User Controller")
@RestController
public class UserController {
    @ApiOperation("Get a list of all users")
    @GetMapping("/users")
    public String getUsers() {
        return "List of users";
    }
}
```
- **Knife4j扩展注解示例**：
    - `@ApiSort`：用于对接口进行排序，在有多个接口需要按照一定顺序展示文档时很有用，示例：
```java
import com.github.xiaoymin.knife4j.spring.annotations.ApiSort;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "User Controller")
@ApiSort(1) // 设置排序序号，数字越小越靠前
@RestController
public class UserController {
    @ApiOperation("Get a list of all users")
    @GetMapping("/users")
    public String getUsers() {
        return "List of users";
    }
}
```

### 三、Knife4j的主要功能特性
- **界面优化与增强**：
拥有比Swagger原生UI更美观、简洁且易用的界面，方便开发人员快速定位和查看不同的接口信息。文档页面布局更加清晰，对接口的请求参数、响应结果等展示更加直观，例如参数的必填项、数据类型等都一目了然。

- **文档分组管理**：
可以根据业务模块、功能模块等对接口文档进行分组，避免接口过多时文档显得杂乱无章。比如可以将用户相关接口分为一组、订单相关接口分为另一组等，通过在`Controller`类上使用`@Api`注解的`tags`属性或者其他配置方式来实现分组管理，方便不同开发人员专注于自己负责的模块文档查看与维护。

- **离线文档下载**：
支持将接口文档下载为离线的HTML、Markdown等格式，便于在没有网络或者需要离线查看、分享文档的场景下使用。开发人员可以将下载好的离线文档发送给其他相关人员（如测试人员、前端开发人员等），方便他们在不同环境下查看接口详情，提高协作效率。

- **接口排序功能**：
利用`@ApiSort`等注解可以按照开发人员期望的顺序对接口进行排序，使得文档中的接口呈现更符合逻辑和查看习惯，尤其是对于有先后调用关系或者重要性顺序的接口，能更好地引导查看者理解接口的整体架构和调用流程。

- **接口搜索功能**：
当项目中的接口数量众多时，提供了便捷的搜索功能，开发人员可以通过接口名称、关键字等快速搜索到想要查看的接口，节省查找时间，快速定位到具体的接口文档内容进行参考或者测试操作。

### 四、应用场景
- **前后端分离项目协作**：
在前后端分离的开发模式下，后端开发人员使用Knife4j生成详细、规范的接口文档，前端开发人员可以基于该文档清晰地了解接口的请求参数、响应格式等信息，从而进行前端页面与后端接口的对接开发，减少沟通成本和因接口理解不一致导致的问题。

- **微服务架构中的接口管理**：
在微服务架构中，各个微服务都有大量的接口对外提供服务，通过Knife4j为每个微服务生成接口文档，并利用文档分组、搜索等功能，方便开发团队对整个微服务体系下的接口进行统一管理、维护以及测试，不同微服务的开发人员也能更好地了解其他微服务暴露的接口情况，便于进行服务间的集成与协作。

- **项目接口测试与调试**：
除了查看接口文档，Knife4j的界面提供了直接对接口进行测试的功能，开发人员在开发过程中或者上线前，可以在文档页面输入相应的请求参数，发起请求并查看实时的响应结果，快速验证接口的正确性，及时发现和修复接口存在的问题，提高项目的整体质量。

总之，Knife4j是一个非常实用的接口文档生成及管理工具，能极大地提升开发过程中接口文档相关工作的效率以及团队协作的便利性，尤其适用于Spring Boot等Java开发框架下的项目开发场景。

你可以根据实际使用情况对上述笔记内容进行进一步的补充和完善，若还有其他想了解的关于Knife4j的知识点，可以随时问我哦。 