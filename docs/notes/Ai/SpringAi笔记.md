---
title: SpringAi笔记
createTime: 2025/07/29 16:15:47
permalink: /article/kiii7nxw/
---

### Spring AI Alibaba 开发详细笔记

---

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

- **JDK**: 17 或更高版本（2025 年 7 月 29 日推荐使用最新稳定版本）。
- **Spring Boot**: 3.2.x 或更高版本，确保与 Spring AI Alibaba 的兼容性。
- **Maven**: 3.6.0 或更高版本，用于管理项目依赖。
- **阿里云 API 密钥**: 需要从阿里云控制台获取 Bailian 平台的 API 密钥，用于模型访问。

##### 2.2 配置 Maven

在 `pom.xml` 中添加 Spring AI Alibaba 的依赖，确保包含 BOM（Bill of Materials）以管理版本：

```xml

<dependencies>
    <!-- Spring AI Alibaba BOM -->
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-bom</artifactId>
        <version>1.0.0.2</version>
        <type>pom</type>
        <scope>import</scope>
    </dependency>
    <!-- Spring AI Alibaba Starter -->
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
    </dependency>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

> **注意**: 如果遇到依赖问题，可参考 FAQ 页面（[Spring AI Alibaba FAQ](https://java2ai.com/docs/1.0.0.2/faq)）配置 Spring
> Milestones 仓库。

##### 2.3 配置阿里云 API 密钥

在 `application.properties` 或 `application.yml` 中配置阿里云 Bailian 平台的 API 密钥：

```properties
spring.ai.alibabacloud.api-key=your-api-key
spring.ai.alibabacloud.model=qwen-2.5
```

获取 API 密钥步骤：

1. 登录阿里云控制台。
2. 进入 Bailian 平台，从“服务广场”获取 API 密钥。

---

#### 3. 基本使用：构建一个对话机器人

以下是一个简单的 REST API 示例，使用 Spring AI Alibaba 的 `ChatClient` 构建一个对话机器人，接受用户输入并返回模型生成的结果。

##### 3.1 创建 REST Controller

创建一个控制器来处理用户请求：

```java
import org.springframework.ai.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String prompt) {
        return chatClient.call(prompt);
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

1. 启动应用程序（默认端口：8080）。
2. 使用 `curl` 或 Postman 测试：
   ```bash
   curl "[invalid url, do not cite] AI Alibaba"
   ```
   预期返回类似：
   ```
   Spring AI Alibaba 是一个基于 Spring AI 的开源框架，专注于为 Java 开发者提供便捷的 AI 应用开发支持，深度集成了阿里云通义模型和 Bailian 平台...
   ```

---

#### 4. 高级功能：使用 Spring AI Alibaba Graph

Spring AI Alibaba Graph 是一个强大的功能，用于构建工作流和多代理应用，灵感来源于
LangGraph。它通过预定义节点和简化状态管理，支持低代码开发。以下是一个简单的 Graph 示例，用于实现一个多代理研究任务。

##### 4.1 示例代码：多代理研究任务

以下代码展示了如何使用 Graph 构建一个研究代理，包含协调器和研究节点：

```java
import com.alibaba.cloud.ai.graph.StateGraph;
import com.alibaba.cloud.ai.graph.Node;
import org.springframework.ai.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ResearchWorkflow {

    @Autowired
    private ChatClient.Builder chatClientBuilder;

    public StateGraph createResearchGraph() {
        StateGraph stateGraph = new StateGraph("research-workflow");
        
        // 定义节点
        stateGraph.addNode("coordinator", new Node((state) -> {
            ChatClient client = chatClientBuilder.build();
            String response = client.call("分析用户问题并分配任务");
            return response;
        }));
        
        stateGraph.addNode("researcher", new Node((state) -> {
            ChatClient client = chatClientBuilder.build();
            String response = client.call("执行研究任务并生成报告");
            return response;
        }));
        
        // 定义边
        stateGraph.addEdge("coordinator", "researcher");
        
        return stateGraph;
    }
}
```

##### 4.2 运行工作流

在控制器中调用工作流：

```java
@GetMapping("/research")
public String runResearch(@RequestParam String task) {
    StateGraph graph = researchWorkflow.createResearchGraph();
    return graph.execute(task);
}
```

测试：

```bash
curl "[invalid url, do not cite] Spring AI Alibaba 的核心功能"
```

##### 4.3 多代理模式

Spring AI Alibaba 支持多代理模式，如 JManus 和 DeepResearch：

- **JManus**:
  计划-行动代理，适合自主规划和执行任务，仓库地址：[https://github.com/alibaba/spring-ai-alibaba/tree/main/spring-ai-alibaba-jmanus/](https://github.com/alibaba/spring-ai-alibaba/tree/main/spring-ai-alibaba-jmanus/)。
- **DeepResearch**: 深度研究代理，支持 Web 搜索、数据爬取和 Python 脚本引擎，Web UI 仍在开发中。

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

#### 6. 常见问题与解决方法

- **依赖问题**: 如果无法解析 `spring-ai-alibaba-starter`，确保配置了 Spring Milestones
  仓库，参考 [FAQ 页面](https://java2ai.com/docs/1.0.0.2/faq)。
- **API 密钥无效**: 调用模型时返回 401 Unauthorized，确认 `spring.ai.alibabacloud.api-key` 配置正确，并在阿里云控制台验证密钥。
- **性能优化**: 对于高并发场景，建议启用 Nacos MCP Registry 和 ARMS 监控。

---

#### 7. 参考资源

- **官方文档**: [Spring AI Alibaba 官网](https://java2ai.com/en/docs/1.0.0.2/overview/)
- **GitHub 仓库**: [Spring AI Alibaba](https://github.com/alibaba/spring-ai-alibaba)
- **示例代码**: [Spring AI Alibaba Examples](https://github.com/springaialibaba/spring-ai-alibaba-examples)
- **阿里云 Bailian 平台**: [Alibaba Cloud Bailian](https://www.alibabacloud.com/product/bailian)
- **Spring AI 官方**: [Spring AI](https://spring.io/projects/spring-ai/)

---

#### 8. 注意事项

- **版本兼容性**: 确保使用 Spring AI Alibaba 1.0 GA 或更高版本（2025 年 7 月 29 日推荐 1.0.0.2），以获取完整功能支持。
- **社区支持**: 加入 Spring AI Alibaba 社区（GitHub Discussions 或阿里云社区）获取最新更新和技术支持。
- **企业级部署**: 对于生产环境，建议集成 ARMS 和 Langfuse 进行监控和评估。

---
