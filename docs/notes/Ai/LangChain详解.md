---
tags:
  - AI
  - LangChain
  - 大语言模型
  - LLM
  - Java
  - Spring Boot
title: LangChain详解 - Java/Spring Boot版本
createTime: 2025/01/27 10:00:00
permalink: /article/langchain-java-guide/
---

::: tip 保鲜说明（2026-08）
已对齐 **LangChain4j 1.19.x**：主接口为 `ChatModel`，调用用 `chat()`（旧 `ChatLanguageModel.generate()` 已淘汰）。模块坐标以 [docs.langchain4j.dev](https://docs.langchain4j.dev/get-started/) 为准。
:::

#### 1. 框架简介

LangChain4j 是 LangChain 的 Java 版本，专为 Java 开发者设计，提供了与 Python 版本相同的核心功能。它基于 Spring Boot 生态系统，帮助开发者快速构建 AI 应用，包括聊天机器人、智能代理、RAG 系统等。

**核心特点**：
- **Java 原生支持**：完全用 Java 编写，与 Spring Boot 无缝集成
- **模块化设计**：提供可组合的组件，如 LLM、提示模板、记忆、索引等
- **多模型支持**：支持 OpenAI、Anthropic、本地模型等多种 LLM 提供商
- **链式调用**：通过 Chain 概念实现复杂的 AI 工作流
- **RAG 支持**：内置检索增强生成功能，支持多种向量数据库
- **Spring Boot 集成**：提供 Spring Boot Starter 和自动配置

---

#### 2. 环境准备

##### 2.1 环境要求

- **JDK**: 17 或更高版本
- **Maven**: 3.6.0 或更高版本
- **Spring Boot**: 3.2.x 或更高版本
- **IDE**: 推荐使用 IntelliJ IDEA 或 Eclipse

##### 2.2 Maven 依赖配置

在 `pom.xml` 中添加以下依赖：

```xml
<properties>
    <langchain4j.version>1.19.0</langchain4j.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>${langchain4j.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- AI Services 等高阶 API -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
    </dependency>

    <!-- OpenAI -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
    </dependency>

    <!-- Anthropic（该模块可能仍是 *-beta 版本，跟 BOM） -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-anthropic</artifactId>
    </dependency>

    <!-- 向量库 / 文档解析：按需选择真实存在的模块，例如 -->
    <!-- langchain4j-embeddings、langchain4j-document-parser-apache-pdfbox -->
    <!-- Redis 等 embedding store 请查官方 Integrations 列表，勿臆造 artifactId -->
</dependencies>
```

##### 2.3 配置文件

在 `application.yml` 中配置 API 密钥：

```yaml
spring:
  application:
    name: langchain-demo

# OpenAI 配置
openai:
  api-key: ${OPENAI_API_KEY:your-openai-api-key}
  model: gpt-4o-mini
  temperature: 0.7
  timeout: 60s

# Anthropic 配置
anthropic:
  api-key: ${ANTHROPIC_API_KEY:your-anthropic-api-key}
  model: claude-sonnet-4-20250514
  timeout: 60s

# LangChain 配置
langchain:
  tracing:
    enabled: true
    endpoint: https://api.smith.langchain.com
    api-key: ${LANGCHAIN_API_KEY:your-langchain-api-key}
```

---

#### 3. 基本使用

##### 3.1 简单的 LLM 调用

创建一个简单的聊天服务：

```java
@Service
public class ChatService {
    
    private final ChatModel chatModel;
    
    public ChatService(@Value("${openai.api-key}") String apiKey) {
        this.chatModel = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(60))
                .build();
    }
    
    public String chat(String message) {
        return chatModel.chat(message);
    }
    
    public String chatWithHistory(List<ChatMessage> messages) {
        return chatModel.chat(messages).aiMessage().text();
    }
}
```

创建 REST 控制器：

```java
@RestController
@RequestMapping("/api/chat")
@Validated
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @PostMapping("/simple")
    public ResponseEntity<String> simpleChat(@RequestBody @Valid ChatRequest request) {
        String response = chatService.chat(request.getMessage());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/conversation")
    public ResponseEntity<String> conversationChat(@RequestBody @Valid ConversationRequest request) {
        List<ChatMessage> messages = request.getMessages().stream()
                .map(msg -> new HumanMessage(msg.getContent()))
                .collect(Collectors.toList());
        
        String response = chatService.chatWithHistory(messages);
        return ResponseEntity.ok(response);
    }
}
```

请求/响应 DTO：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotBlank(message = "消息不能为空")
    private String message;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationRequest {
    @NotEmpty(message = "消息列表不能为空")
    private List<MessageDto> messages;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String content;
    private String role;
}
```

##### 3.2 使用提示模板

创建提示模板服务：

```java
@Service
public class PromptTemplateService {
    
    private final ChatModel chatModel;
    
    public PromptTemplateService(@Value("${openai.api-key}") String apiKey) {
        this.chatModel = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .build();
    }
    
    public String generateContent(String topic, String requirements) {
        PromptTemplate promptTemplate = PromptTemplate.from(
                "你是一个专业的内容创作者。请写一篇关于{{topic}}的文章，要求：{{requirements}}"
        );
        
        Prompt prompt = promptTemplate.apply(Map.of(
                "topic", topic,
                "requirements", requirements
        ));
        
        return chatModel.chat(prompt.text());
    }
    
    public String translateText(String text, String targetLanguage) {
        PromptTemplate promptTemplate = PromptTemplate.from(
                "请将以下文本翻译成{{targetLanguage}}：\n\n{{text}}"
        );
        
        Prompt prompt = promptTemplate.apply(Map.of(
                "targetLanguage", targetLanguage,
                "text", text
        ));
        
        return chatModel.chat(prompt.text());
    }
}
```

---

#### 4. 高级特性

##### 4.1 智能代理 (Agents)

创建工具接口和实现：

```java
public interface CalculatorTool extends Tool {
    
    @Override
    default String name() {
        return "calculator";
    }
    
    @Override
    default String description() {
        return "用于执行数学计算的工具";
    }
    
    @Override
    default Object execute(Object... args) {
        if (args.length != 1) {
            throw new IllegalArgumentException("需要提供一个数学表达式");
        }
        
        String expression = args[0].toString();
        try {
            // 使用 ScriptEngine 执行数学表达式
            ScriptEngineManager manager = new ScriptEngineManager();
            ScriptEngine engine = manager.getEngineByName("JavaScript");
            Object result = engine.eval(expression);
            return result.toString();
        } catch (Exception e) {
            return "计算错误: " + e.getMessage();
        }
    }
}
```

创建代理服务：

```java
@Service
public class AgentService {
    
    private final ChatModel chatModel;
    private final List<Tool> tools;
    
    public AgentService(@Value("${openai.api-key}") String apiKey) {
        this.chatModel = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .build();
        
        this.tools = Arrays.asList(new CalculatorTool());
    }
    
    public String executeWithAgent(String userMessage) {
        Agent agent = Agent.builder()
                .chatLanguageModel(chatModel)
                .tools(tools)
                .build();
        
        return agent.execute(userMessage);
    }
}
```

##### 4.2 RAG 系统 (检索增强生成)

创建文档加载和分割服务：

```java
@Service
public class DocumentService {
    
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    
    public DocumentService(@Value("${openai.api-key}") String apiKey) {
        this.embeddingModel = OpenAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("text-embedding-ada-002")
                .build();
        
        this.embeddingStore = InMemoryEmbeddingStore.create();
    }
    
    public void loadDocument(String content, String metadata) {
        // 分割文档
        DocumentSplitter splitter = DocumentSplitters.recursive(100, 0);
        List<TextSegment> segments = splitter.split(Document.from(content, metadata));
        
        // 生成嵌入向量并存储
        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);
    }
    
    public String queryDocument(String question) {
        // 生成问题的嵌入向量
        Embedding questionEmbedding = embeddingModel.embed(question).content();
        
        // 检索相关文档片段
        List<EmbeddingMatch<TextSegment>> relevantSegments = embeddingStore
                .findRelevant(questionEmbedding, 3);
        
        // 构建上下文
        String context = relevantSegments.stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.joining("\n\n"));
        
        // 使用 LLM 生成答案
        ChatModel chatModel = OpenAiChatModel.builder()
                .apiKey("your-api-key")
                .modelName("gpt-4o-mini")
                .build();
        
        String prompt = String.format(
                "基于以下上下文回答问题：\n\n上下文：%s\n\n问题：%s",
                context, question
        );
        
        return chatModel.chat(prompt);
    }
}
```

##### 4.3 记忆功能

创建对话记忆服务：

```java
@Service
public class ConversationMemoryService {
    
    private final Map<String, List<ChatMessage>> conversationMemories = new ConcurrentHashMap<>();
    
    public void addMessage(String sessionId, ChatMessage message) {
        conversationMemories.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(message);
    }
    
    public List<ChatMessage> getConversationHistory(String sessionId) {
        return conversationMemories.getOrDefault(sessionId, new ArrayList<>());
    }
    
    public void clearConversation(String sessionId) {
        conversationMemories.remove(sessionId);
    }
    
    public String generateResponseWithMemory(String sessionId, String userMessage, 
                                          ChatModel chatModel) {
        List<ChatMessage> history = getConversationHistory(sessionId);
        
        // 添加用户新消息
        history.add(new HumanMessage(userMessage));
        
        // 生成回复（1.x 返回 ChatResponse）
        var response = chatModel.chat(history);
        var aiMessage = response.aiMessage();
        
        // 保存对话历史
        addMessage(sessionId, aiMessage);
        
        return aiMessage.text();
    }
}
```

---

#### 5. 实际应用场景

##### 5.1 智能客服机器人

创建客服机器人服务：

```java
@Service
public class CustomerServiceBot {
    
    private final ChatModel chatModel;
    private final ConversationMemoryService memoryService;
    
    public CustomerServiceBot(@Value("${openai.api-key}") String apiKey,
                            ConversationMemoryService memoryService) {
        this.chatModel = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .build();
        
        this.memoryService = memoryService;
    }
    
    public String handleCustomerInquiry(String sessionId, String inquiry) {
        // 构建客服提示
        String systemPrompt = "你是一个专业的客服代表。请根据客户问题提供专业、友好的回答。" +
                "如果无法解决，请建议联系人工客服。保持礼貌和耐心。";
        
        // 获取对话历史
        List<ChatMessage> history = memoryService.getConversationHistory(sessionId);
        
        // 构建完整对话
        List<ChatMessage> fullConversation = new ArrayList<>();
        fullConversation.add(new SystemMessage(systemPrompt));
        fullConversation.addAll(history);
        fullConversation.add(new HumanMessage(inquiry));
        
        // 生成回复
        var response = chatModel.chat(fullConversation);
        var botResponse = response.aiMessage();
        
        // 保存对话
        memoryService.addMessage(sessionId, new HumanMessage(inquiry));
        memoryService.addMessage(sessionId, botResponse);
        
        return botResponse.text();
    }
}
```

##### 5.2 文档问答系统

创建文档问答服务：

```java
@Service
public class DocumentQAService {
    
    private final DocumentService documentService;
    private final ChatModel chatModel;
    
    public DocumentQAService(DocumentService documentService,
                           @Value("${openai.api-key}") String apiKey) {
        this.documentService = documentService;
        this.chatModel = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .build();
    }
    
    public void uploadDocument(String content, String documentName) {
        documentService.loadDocument(content, documentName);
    }
    
    public String askQuestion(String question) {
        return documentService.queryDocument(question);
    }
    
    public List<String> batchQuery(List<String> questions) {
        return questions.stream()
                .map(this::askQuestion)
                .collect(Collectors.toList());
    }
}
```

---

#### 6. 最佳实践

##### 6.1 性能优化

```java
@Configuration
public class LangChainConfig {
    
    @Bean
    @Primary
    public ChatModel chatLanguageModel(@Value("${openai.api-key}") String apiKey) {
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gpt-4o-mini")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(60))
                .maxTokens(2000)
                .build();
    }
    
    @Bean
    public EmbeddingModel embeddingModel(@Value("${openai.api-key}") String apiKey) {
        return OpenAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("text-embedding-ada-002")
                .timeout(Duration.ofSeconds(60))
                .build();
    }
}
```

##### 6.2 错误处理

```java
@ControllerAdvice
public class LangChainExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        ErrorResponse error = new ErrorResponse(
                "INTERNAL_ERROR",
                "处理请求时发生错误: " + e.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        ErrorResponse error = new ErrorResponse(
                "INVALID_INPUT",
                "输入参数无效: " + e.getMessage(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
}
```

##### 6.3 安全考虑

```java
@Component
public class SecurityValidator {
    
    public void validateInput(String input) {
        // 检查输入长度
        if (input.length() > 10000) {
            throw new IllegalArgumentException("输入内容过长，请控制在10000字符以内");
        }
        
        // 检查敏感词汇
        List<String> sensitiveWords = Arrays.asList("密码", "token", "密钥", "admin");
        for (String word : sensitiveWords) {
            if (input.toLowerCase().contains(word.toLowerCase())) {
                throw new IllegalArgumentException("输入包含敏感词汇");
            }
        }
        
        // 检查 SQL 注入
        if (input.toLowerCase().contains("select") || 
            input.toLowerCase().contains("insert") ||
            input.toLowerCase().contains("delete") ||
            input.toLowerCase().contains("update")) {
            throw new IllegalArgumentException("输入包含非法字符");
        }
    }
}
```

---

#### 7. 部署和监控

##### 7.1 使用 LangSmith 监控

```java
@Configuration
public class LangSmithConfig {
    
    @Bean
    @ConditionalOnProperty(name = "langchain.tracing.enabled", havingValue = "true")
    public LangChainTracer langChainTracer(@Value("${langchain.tracing.api-key}") String apiKey,
                                         @Value("${langchain.tracing.endpoint}") String endpoint) {
        return LangChainTracer.builder()
                .apiKey(apiKey)
                .endpoint(endpoint)
                .build();
    }
}
```

##### 7.2 生产环境部署

```yaml
# application-prod.yml
spring:
  profiles:
    active: prod
  
  # 数据库配置
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  
  # Redis 配置
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
    password: ${REDIS_PASSWORD}

# 日志配置
logging:
  level:
    dev.langchain4j: INFO
    com.example: DEBUG
  file:
    name: logs/langchain-app.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# 监控配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
```

---

