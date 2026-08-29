---
tags:
  - AI
  - Spring AI
  - 大语言模型
  - LLM
  - Java
  - Spring
title: SpringAi笔记
createTime: 2025/07/29 16:15:47
permalink: /article/ycz7qulv/
---

::: tip 保鲜说明（2026-08）
已按 Spring AI Alibaba **1.0.x + DashScope** 现行写法校正：BOM 放进 `dependencyManagement`，配置前缀 `spring.ai.dashscope.*`，API 使用 `ChatClient.prompt().call().content()`。细节以 [java2ai.com](https://java2ai.com/) 为准。
:::

#### 1. 框架简介

Spring AI Alibaba 是一个开源的 AI 应用开发框架，专为 Java 开发者设计，构建于 Spring AI 之上。它提供了高层次的 AI API
抽象和云原生基础设施集成方案，帮助开发者快速构建 AI 应用。核心特点包括：

- **Graph-based 多代理框架**：通过 Spring AI Alibaba Graph 实现工作流和多代理应用的编排，灵感来源于
  LangGraph，简化了状态管理和节点定义，支持低代码平台集成。
- **企业级 AI 生态集成**：深度整合阿里云 Bailian 平台、Nacos3、Higress AI Gateway、Alibaba Cloud ARMS 和向量检索数据库等，支持
  RAG（检索增强生成）和可观测性。
- **计划-行动代理**：如 JManus 和 DeepResearch 代理，提供自主规划和执行任务的能力，适合复杂业务场景。
- **多模态支持**：包括聊天、文生图、音频转录和文生语音等模型类型，支持同步和流式 API。

根据官方文档（[Spring AI Alibaba 官网](https://java2ai.com/en/docs/1.0.0.2/overview/)），框架定位为开源 AI Agent
开发框架，适合从基础聊天机器人到高级多代理系统的开发。

---

#### 2. 环境准备

##### 2.1 依赖要求

- **JDK**: 17 或更高（推荐 17/21 LTS）。
- **Spring Boot**: 3.4.x 一带（与所选 Spring AI Alibaba BOM 对齐）。
- **Maven**: 3.6.0 或更高。
- **API 密钥**: 阿里云百炼（Bailian）DashScope API Key。

##### 2.2 配置 Maven

BOM 必须放在 `dependencyManagement` 里（`import`），再声明 starter：

```xml
<properties>
    <spring-boot.version>3.4.5</spring-boot.version>
    <spring-ai.version>1.0.0</spring-ai.version>
    <spring-ai-alibaba.version>1.0.0.2</spring-ai-alibaba.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud.ai</groupId>
            <artifactId>spring-ai-alibaba-bom</artifactId>
            <version>${spring-ai-alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

> 版本号以 [官方 Starters 指南](https://java2ai.com/en/docs/1.0.0.2/tutorials/starters-and-quick-guide/) 为准；仓库问题见 [FAQ](https://java2ai.com/docs/1.0.0.2/faq)。

##### 2.3 配置阿里云 API 密钥

```yaml
spring:
  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}
      chat:
        options:
          model: qwen-plus
```

或环境变量：`export AI_DASHSCOPE_API_KEY=sk-xxx`。

---

#### 3. 基本使用：构建一个对话机器人

以下是一个简单的 REST API 示例，使用 Spring AI Alibaba 的 `ChatClient` 构建一个对话机器人，接受用户输入并返回模型生成的结果。

##### 3.1 创建 REST Controller

创建一个控制器来处理用户请求：

```java
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatOptions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem("你是一个博学的智能聊天助手，请根据用户提问回答！")
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .defaultOptions(DashScopeChatOptions.builder().withTopP(0.7).build())
                .build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String prompt) {
        return chatClient.prompt(prompt).call().content();
    }
}
```

##### 3.2 配置 Spring Boot 主类

确保 Spring Boot 应用程序正确配置：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatbotApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
    }
}
```

##### 3.3 测试 API

1. 启动应用（默认端口 8080）。
2. 测试：

```bash
curl "http://localhost:8080/chat?prompt=用一句话介绍%20Spring%20AI%20Alibaba"
```

---

#### 4. 高级功能：使用 Spring AI Alibaba Graph

Spring AI Alibaba Graph 是一个强大的功能，用于构建工作流和多代理应用，灵感来源于
LangGraph。它通过预定义节点和简化状态管理，支持低代码开发。以下是一个简单的 Graph 示例，用于实现一个多代理研究任务。

##### 4.1 示例代码：多代理研究任务

以下代码展示了如何使用 Graph 构建一个研究代理，包含协调器和研究节点：

Graph / 多代理能力迭代很快，**不要依赖过时的伪代码**。建议：

1. 引入 `spring-ai-alibaba-graph-core`（版本与 BOM 对齐）。
2. 对照官方示例仓库实现节点与边：[spring-ai-alibaba-examples](https://github.com/springaialibaba/spring-ai-alibaba-examples)。
3. 也可使用独立的 [LangGraph4j](./LangGraph4j详解.md) 做通用图编排。

##### 4.2 多代理参考实现

- **JManus**：计划-行动代理，见 [spring-ai-alibaba-jmanus](https://github.com/alibaba/spring-ai-alibaba/tree/main/spring-ai-alibaba-jmanus)。
- **DeepResearch**：深度研究代理（搜索 / 爬取 / 脚本等），见官方仓库最新模块说明。

---

#### 5. 云原生部署和集成

Spring AI Alibaba 设计为与阿里云生态深度集成，支持以下云原生功能：

##### 5.1 部署方式

- **MCP 部署**: 支持通过 Nacos MCP Registry 实现 MCP Servers 的分布式部署和负载均衡，零代码修改即可发布 API-to-MCP 服务。
- **本地部署 Playground**:
  快速体验核心功能，访问 [Playground 示例](https://github.com/springaialibaba/spring-ai-alibaba-examples/tree/main/spring-ai-alibaba-playground)。
- **生产环境**: 建议使用阿里云服务托管，结合 Nacos3 和 Higress AI Gateway 实现服务发现和负载均衡。

##### 5.2 云集成

- **AI 网关**: 使用 Higress AI Gateway，提供 OpenAI 标准接口，简化服务集成。
- **RAG 知识库**: 通过 Bailian 平台支持数据解析、切分和向量化，适合构建知识库。
- **可观测性**: 兼容 OpenTelemetry，集成 ARMS 和 Langfuse 进行监控和追踪。

以下是云原生功能的对比表：

| **功能**  | **描述**                 | **相关工具/服务**        |
|---------|------------------------|--------------------|
| MCP 部署  | 分布式部署，支持负载均衡           | Nacos MCP Registry |
| AI 网关   | OpenAI 标准接口，简化服务集成     | Higress AI Gateway |
| RAG 知识库 | 数据解析、切分和向量化            | Bailian 平台         |
| 可观测性    | 监控和追踪，兼容 OpenTelemetry | ARMS, Langfuse     |

---

