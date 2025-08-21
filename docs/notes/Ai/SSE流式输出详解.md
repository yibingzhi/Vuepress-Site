---
tags:
  - AI
  - SSE
  - 流式输出
  - 实时通信
  - 大语言模型
title: SSE流式输出详解 - 实时数据推送技术
createTime: 2025/01/27 10:00:00
permalink: /article/sse-streaming-guide/
---

## 1. SSE 技术概述

### 1.1 什么是 SSE

**Server-Sent Events (SSE)** 是一种 Web 标准，允许服务器向客户端推送实时数据流。它是一种单向通信机制，服务器可以持续向客户端发送数据，而客户端只能接收数据。

**核心特点**：
- **单向通信**：服务器 → 客户端
- **基于 HTTP**：使用标准 HTTP 协议
- **自动重连**：浏览器自动处理连接断开和重连
- **文本格式**：数据以纯文本格式传输
- **实时性**：支持实时数据推送

### 1.2 适用场景

- **实时通知**：系统消息、用户提醒
- **数据监控**：实时图表、仪表盘
- **聊天应用**：消息推送、状态更新
- **AI 对话**：流式响应、打字机效果
- **日志流**：实时日志查看
- **进度跟踪**：文件上传、任务执行进度

### 1.3 与其他技术的对比

| 技术 | 通信方向 | 协议 | 实时性 | 复杂度 |
|------|----------|------|--------|--------|
| **SSE** | 单向 | HTTP | 高 | 低 |
| **WebSocket** | 双向 | WebSocket | 高 | 中 |
| **轮询** | 单向 | HTTP | 低 | 低 |
| **长轮询** | 单向 | HTTP | 中 | 中 |

---

## 2. SSE 工作原理

### 2.1 协议规范

SSE 基于 HTTP 协议，使用以下 HTTP 头：

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 2.2 数据格式

SSE 数据以特定格式传输：

```
event: message
id: 12345
data: 这是第一条消息

event: update
id: 12346
data: 这是第二条消息

: 这是注释行
```

**字段说明**：
- `event`: 事件类型（可选）
- `id`: 消息ID（可选）
- `data`: 消息内容（必需）
- `retry`: 重连时间（可选，毫秒）

### 2.3 连接生命周期

1. **建立连接**：客户端发起 HTTP 请求
2. **保持连接**：服务器保持连接开放
3. **数据推送**：服务器持续发送数据
4. **连接断开**：网络问题或服务器关闭
5. **自动重连**：浏览器自动重新连接

---

## 3. Spring Boot 实现 SSE

### 3.1 基础依赖配置

```xml
<dependencies>
    <!-- Spring Boot Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Reactive Web (可选) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

### 3.2 控制器实现

#### 3.2.1 基础 SSE 控制器

```java
@RestController
@RequestMapping("/api/sse")
public class SSEController {

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamData() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        // 异步发送数据
        CompletableFuture.runAsync(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    // 构建 SSE 消息
                    SseEmitter.SseEventBuilder event = SseEmitter.event()
                            .id(String.valueOf(i))
                            .name("message")
                            .data("消息 " + i + " - " + LocalDateTime.now());
                    
                    emitter.send(event);
                    Thread.sleep(1000); // 每秒发送一条
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}
```

#### 3.2.2 带错误处理的 SSE 控制器

```java
@RestController
@RequestMapping("/api/sse")
public class SSEController {

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamData() {
        SseEmitter emitter = new SseEmitter(30000L); // 30秒超时
        
        // 设置超时回调
        emitter.onTimeout(() -> {
            log.info("SSE 连接超时");
            emitter.complete();
        });
        
        // 设置完成回调
        emitter.onCompletion(() -> {
            log.info("SSE 连接完成");
        });
        
        // 设置错误回调
        emitter.onError((ex) -> {
            log.error("SSE 连接错误", ex);
        });
        
        // 异步发送数据
        CompletableFuture.runAsync(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    if (emitter.isCancelled()) {
                        break;
                    }
                    
                    SseEmitter.SseEventBuilder event = SseEmitter.event()
                            .id(String.valueOf(i))
                            .name("progress")
                            .data(new ProgressData(i * 10, "处理中..."));
                    
                    emitter.send(event);
                    Thread.sleep(1000);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}

@Data
@AllArgsConstructor
class ProgressData {
    private int percentage;
    private String message;
}
```

### 3.3 使用 WebFlux 实现

```java
@RestController
@RequestMapping("/api/sse")
public class SSEWebFluxController {

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamData() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(sequence -> ServerSentEvent.<String>builder()
                        .id(String.valueOf(sequence))
                        .event("message")
                        .data("消息 " + sequence + " - " + LocalDateTime.now())
                        .build())
                .take(10); // 只发送10条消息
    }
    
    @GetMapping(value = "/ai-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamAIResponse() {
        return Flux.fromStream(Stream.of("你好", "，", "我是", "AI", "助手", "！"))
                .delayElements(Duration.ofMillis(500))
                .map(word -> ServerSentEvent.<String>builder()
                        .event("ai-response")
                        .data(word)
                        .build());
    }
}
```

---

## 4. 前端实现 SSE 客户端

### 4.1 原生 JavaScript 实现

```javascript
class SSEClient {
    constructor(url) {
        this.url = url;
        this.eventSource = null;
        this.isConnected = false;
    }
    
    connect() {
        try {
            this.eventSource = new EventSource(this.url);
            this.isConnected = true;
            
            // 连接建立
            this.eventSource.onopen = (event) => {
                console.log('SSE 连接已建立');
                this.onOpen && this.onOpen(event);
            };
            
            // 接收消息
            this.eventSource.onmessage = (event) => {
                console.log('收到消息:', event.data);
                this.onMessage && this.onMessage(event);
            };
            
            // 接收特定事件
            this.eventSource.addEventListener('progress', (event) => {
                const data = JSON.parse(event.data);
                console.log('进度更新:', data);
                this.onProgress && this.onProgress(data);
            });
            
            // 错误处理
            this.eventSource.onerror = (event) => {
                console.error('SSE 连接错误:', event);
                this.isConnected = false;
                this.onError && this.onError(event);
            };
            
        } catch (error) {
            console.error('创建 SSE 连接失败:', error);
            this.onError && this.onError(error);
        }
    }
    
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.isConnected = false;
            console.log('SSE 连接已断开');
        }
    }
    
    // 回调函数
    onOpen = null;
    onMessage = null;
    onProgress = null;
    onError = null;
}

// 使用示例
const sseClient = new SSEClient('/api/sse/stream');

sseClient.onOpen = (event) => {
    console.log('连接已建立');
};

sseClient.onMessage = (event) => {
    const messageContainer = document.getElementById('messages');
    messageContainer.innerHTML += `<div>${event.data}</div>`;
};

sseClient.onProgress = (data) => {
    const progressBar = document.getElementById('progress');
    progressBar.style.width = data.percentage + '%';
    progressBar.textContent = data.message;
};

sseClient.onError = (error) => {
    console.error('连接错误:', error);
};

// 连接
sseClient.connect();

// 页面卸载时断开连接
window.addEventListener('beforeunload', () => {
    sseClient.disconnect();
});
```

### 4.2 Vue.js 实现

```vue
<template>
  <div class="sse-demo">
    <div class="controls">
      <button @click="connect" :disabled="isConnected">连接</button>
      <button @click="disconnect" :disabled="!isConnected">断开</button>
    </div>
    
    <div class="progress-section" v-if="isConnected">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">{{ progressMessage }}</div>
    </div>
    
    <div class="messages">
      <div v-for="(message, index) in messages" :key="index" class="message">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SSEDemo',
  data() {
    return {
      eventSource: null,
      isConnected: false,
      messages: [],
      progress: 0,
      progressMessage: ''
    };
  },
  
  methods: {
    connect() {
      try {
        this.eventSource = new EventSource('/api/sse/stream');
        this.isConnected = true;
        
        this.eventSource.onopen = () => {
          console.log('SSE 连接已建立');
          this.messages.push('连接已建立');
        };
        
        this.eventSource.onmessage = (event) => {
          this.messages.push(event.data);
        };
        
        this.eventSource.addEventListener('progress', (event) => {
          const data = JSON.parse(event.data);
          this.progress = data.percentage;
          this.progressMessage = data.message;
        });
        
        this.eventSource.onerror = (error) => {
          console.error('SSE 连接错误:', error);
          this.isConnected = false;
          this.messages.push('连接错误');
        };
        
      } catch (error) {
        console.error('创建 SSE 连接失败:', error);
      }
    },
    
    disconnect() {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
        this.isConnected = false;
        this.messages.push('连接已断开');
      }
    }
  },
  
  beforeUnmount() {
    this.disconnect();
  }
};
</script>

<style scoped>
.sse-demo {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.controls button {
  margin-right: 10px;
  padding: 8px 16px;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 5px;
}

.messages {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
}

.message {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
</style>
```

---

## 5. AI 对话流式输出实现

### 5.1 后端 AI 流式响应

```java
@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private OpenAiClient openAiClient;
    
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        CompletableFuture.runAsync(() -> {
            try {
                // 调用 OpenAI API 进行流式响应
                openAiClient.chatCompletion(request.getMessages())
                        .streaming()
                        .onNext(chunk -> {
                            try {
                                if (chunk.choices() != null && !chunk.choices().isEmpty()) {
                                    String content = chunk.choices().get(0).delta().content();
                                    if (content != null) {
                                        SseEmitter.SseEventBuilder event = SseEmitter.event()
                                                .name("ai-chunk")
                                                .data(content);
                                        emitter.send(event);
                                    }
                                }
                            } catch (Exception e) {
                                log.error("发送 AI 响应块失败", e);
                            }
                        })
                        .onComplete(() -> {
                            try {
                                SseEmitter.SseEventBuilder event = SseEmitter.event()
                                        .name("ai-complete")
                                        .data("响应完成");
                                emitter.send(event);
                                emitter.complete();
                            } catch (Exception e) {
                                log.error("发送完成事件失败", e);
                            }
                        })
                        .onError(error -> {
                            log.error("AI 流式响应错误", error);
                            emitter.completeWithError(error);
                        })
                        .run();
                        
            } catch (Exception e) {
                log.error("处理 AI 流式响应失败", e);
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
}

@Data
class ChatRequest {
    private List<Message> messages;
}

@Data
class Message {
    private String role;
    private String content;
}
```

### 5.2 前端 AI 对话界面

```vue
<template>
  <div class="ai-chat">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <div class="message-role">{{ message.role === 'user' ? '用户' : 'AI' }}</div>
        <div class="message-content" v-html="message.content"></div>
      </div>
    </div>
    
    <div class="chat-input">
      <textarea
        v-model="userInput" 
        @keydown.enter.prevent="sendMessage"
        placeholder="输入您的问题..."
        :disabled="isLoading"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIChat',
  data() {
    return {
      messages: [],
      userInput: '',
      isLoading: false,
      eventSource: null
    };
  },
  
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;
      
      const userMessage = this.userInput.trim();
      this.messages.push({
        role: 'user',
        content: userMessage
      });
      
      this.messages.push({
        role: 'assistant',
        content: '<span class="typing">正在输入...</span>'
      });
      
      this.userInput = '';
      this.isLoading = true;
      
      try {
        await this.streamAIResponse(userMessage);
      } catch (error) {
        console.error('AI 响应错误:', error);
        this.messages[this.messages.length - 1].content = '抱歉，发生了错误，请重试。';
      } finally {
        this.isLoading = false;
      }
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    async streamAIResponse(userMessage) {
      return new Promise((resolve, reject) => {
        const requestBody = {
          messages: [
            { role: 'user', content: userMessage }
          ]
        };
        
        fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let aiResponse = '';
          
          const readStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                resolve();
                return;
              }
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              lines.forEach(line => {
                if (line.startsWith('data:')) {
                  const data = line.slice(5).trim();
                  if (data && data !== '[DONE]') {
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.event === 'ai-chunk') {
                        aiResponse += parsed.data;
                        this.updateAIMessage(aiResponse);
                      } else if (parsed.event === 'ai-complete') {
                        resolve();
                      }
                    } catch (e) {
                      // 忽略解析错误
                    }
                  }
                }
              });
              
              readStream();
            }).catch(reject);
          };
          
          readStream();
        }).catch(reject);
      });
    },
    
    updateAIMessage(content) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = content;
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    }
  }
};
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
}

.message-role {
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.message-content {
  padding: 10px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.chat-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 60px;
}

.chat-input button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.typing {
  color: #666;
  font-style: italic;
}
</style>
```

---

## 6. 最佳实践与注意事项

### 6.1 性能优化

- **连接池管理**：合理管理 SSE 连接数量
- **内存控制**：避免在内存中积累过多消息
- **超时设置**：设置合理的连接超时时间
- **错误重试**：实现指数退避重连机制

### 6.2 安全考虑

- **身份验证**：验证客户端身份和权限
- **速率限制**：防止客户端滥用 SSE 连接
- **数据验证**：验证发送的数据格式和内容
- **HTTPS**：生产环境使用 HTTPS 加密传输

### 6.3 监控与调试

```java
@Component
public class SSEMonitor {
    
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalMessages = new AtomicLong(0);
    
    public void incrementConnections() {
        activeConnections.incrementAndGet();
        log.info("SSE 连接数: {}", activeConnections.get());
    }
    
    public void decrementConnections() {
        activeConnections.decrementAndGet();
        log.info("SSE 连接数: {}", activeConnections.get());
    }
    
    public void incrementMessages() {
        totalMessages.incrementAndGet();
    }
    
    @Scheduled(fixedRate = 60000) // 每分钟记录一次
    public void logMetrics() {
        log.info("SSE 指标 - 活跃连接: {}, 总消息数: {}", 
                activeConnections.get(), totalMessages.get());
    }
}
```

### 6.4 常见问题解决

#### 6.4.1 连接断开问题

```java
// 实现心跳机制
@Scheduled(fixedRate = 30000) // 每30秒发送心跳
public void sendHeartbeat() {
    activeConnections.forEach((id, emitter) -> {
        try {
            SseEmitter.SseEventBuilder heartbeat = SseEmitter.event()
                    .name("heartbeat")
                    .data(System.currentTimeMillis());
            emitter.send(heartbeat);
        } catch (Exception e) {
            log.warn("发送心跳失败，移除连接: {}", id);
            removeConnection(id);
        }
    });
}
```

#### 6.4.2 内存泄漏防护

```java
@Component
public class SSEConnectionManager {
    
    private final Map<String, SseEmitter> connections = new ConcurrentHashMap<>();
    
    public SseEmitter createConnection(String clientId) {
        SseEmitter emitter = new SseEmitter(30000L);
        
        emitter.onCompletion(() -> removeConnection(clientId));
        emitter.onTimeout(() -> removeConnection(clientId));
        emitter.onError((ex) -> removeConnection(clientId));
        
        connections.put(clientId, emitter);
        return emitter;
    }
    
    public void removeConnection(String clientId) {
        SseEmitter emitter = connections.remove(clientId);
        if (emitter != null) {
            emitter.complete();
        }
    }
    
    public void broadcast(String eventName, Object data) {
        connections.entrySet().removeIf(entry -> {
            try {
                SseEmitter.SseEventBuilder event = SseEmitter.event()
                        .name(eventName)
                        .data(data);
                entry.getValue().send(event);
                return false;
            } catch (Exception e) {
                log.warn("广播消息失败，移除连接: {}", entry.getKey());
                return true;
            }
        });
    }
}
```

---
