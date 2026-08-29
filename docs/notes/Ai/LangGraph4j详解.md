---
tags:
  - AI
  - LangGraph4j
  - 大语言模型
  - LLM
  - Java
title: LangGraph4j详解
createTime: 2025/08/15 14:06:22
permalink: /article/dyckf07q/
---

# LangGraph4j 详解

::: tip 保鲜说明（2026-08）
旧版笔记误用了不存在的坐标 `dev.langchain4j:langchain4j-langgraph4j`。  
正式项目是 **[langgraph4j/langgraph4j](https://github.com/langgraph4j/langgraph4j)**，Maven 坐标为 `org.bsc.langgraph4j`，可与 LangChain4j / Spring AI 配合使用。
:::

## 概述

LangGraph4j 是面向 Java 的 **有状态多智能体工作流** 库，灵感来自 Python LangGraph。核心能力：

- **有状态执行**：节点之间共享 `AgentState`
- **可成环图**：适合 Agent 重试、追问、工具循环
- **显式控制流**：普通边 + 条件边
- **Checkpoint**：落盘/恢复，便于调试长流程
- **集成**：`langgraph4j-langchain4j`、`langgraph4j-spring-ai`、Studio 可视化

要求：**Java 17+**。版本以 [Maven Central](https://central.sonatype.com/search?q=g%3Aorg.bsc.langgraph4j) / [GitHub Releases](https://github.com/langgraph4j/langgraph4j/releases) 为准（整理时约为 `1.8.23`）。

## 核心概念

| 概念 | 作用 |
|------|------|
| `StateGraph<S>` | 定义节点与边 |
| `AgentState` | 图共享状态（本质是带 reducer 的 Map） |
| Node | `NodeAction` / 异步节点，读状态并返回增量更新 |
| Edge | `START → … → END`；条件边按状态选下一节点 |
| `compile()` | 校验图结构，得到可运行的 `CompiledGraph` |
| Checkpoint | `CheckpointSaver` 持久化执行快照 |

## Maven 依赖

```xml
<properties>
    <langgraph4j.version>1.8.23</langgraph4j.version>
</properties>

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.bsc.langgraph4j</groupId>
      <artifactId>langgraph4j-bom</artifactId>
      <version>${langgraph4j.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.bsc.langgraph4j</groupId>
        <artifactId>langgraph4j-core</artifactId>
    </dependency>
    <!-- 需要接 LLM 时再加：langgraph4j-langchain4j 或 spring-ai 相关模块 -->
</dependencies>
```

## 最小示例：线性图

### 1. 定义状态

```java
import org.bsc.langgraph4j.state.AgentState;
import org.bsc.langgraph4j.state.Channel;
import org.bsc.langgraph4j.state.Channels;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

class SimpleState extends AgentState {
    public static final String MESSAGES_KEY = "messages";

    public static final Map<String, Channel<?>> SCHEMA = Map.of(
            MESSAGES_KEY, Channels.appender(ArrayList::new)
    );

    public SimpleState(Map<String, Object> initData) {
        super(initData);
    }

    public List<String> messages() {
        return this.<List<String>>value("messages").orElse(List.of());
    }
}
```

### 2. 定义节点

```java
import org.bsc.langgraph4j.action.NodeAction;
import java.util.List;
import java.util.Map;

class GreeterNode implements NodeAction<SimpleState> {
    @Override
    public Map<String, Object> apply(SimpleState state) {
        return Map.of(SimpleState.MESSAGES_KEY, "Hello from GreeterNode!");
    }
}

class ResponderNode implements NodeAction<SimpleState> {
    @Override
    public Map<String, Object> apply(SimpleState state) {
        List<String> messages = state.messages();
        if (messages.contains("Hello from GreeterNode!")) {
            return Map.of(SimpleState.MESSAGES_KEY, "Acknowledged greeting!");
        }
        return Map.of(SimpleState.MESSAGES_KEY, "No greeting found.");
    }
}
```

### 3. 连边、编译、运行

```java
import org.bsc.langgraph4j.StateGraph;
import org.bsc.langgraph4j.GraphStateException;
import static org.bsc.langgraph4j.action.AsyncNodeAction.node_async;
import static org.bsc.langgraph4j.StateGraph.START;
import static org.bsc.langgraph4j.StateGraph.END;

import java.util.Map;

public class SimpleGraphApp {
    public static void main(String[] args) throws GraphStateException {
        var greeterNode = new GreeterNode();
        var responderNode = new ResponderNode();

        var stateGraph = new StateGraph<>(SimpleState.SCHEMA, SimpleState::new)
                .addNode("greeter", node_async(greeterNode))
                .addNode("responder", node_async(responderNode))
                .addEdge(START, "greeter")
                .addEdge("greeter", "responder")
                .addEdge("responder", END);

        var compiledGraph = stateGraph.compile();

        for (var item : compiledGraph.stream(
                Map.of(SimpleState.MESSAGES_KEY, "Let's, begin!"))) {
            System.out.println(item);
        }
    }
}
```

流程：`START → greeter → responder → END`，状态里的 `messages` 由 appender 逐段累加。

## 进阶方向

- **条件边**：路由 / 工具调用分支
- **Checkpoint**：MySQL / Postgres / Redis 等 saver 模块
- **与 LLM 集成**：官方 `langchain4j`、`spring-ai` 子模块
- **Studio**：可视化调试

## 参考

- 文档与示例：[langgraph4j GitHub](https://github.com/langgraph4j/langgraph4j)
- DeepWiki：[deepwiki.com/langgraph4j/langgraph4j](https://deepwiki.com/langgraph4j/langgraph4j)
- 同站相关：[LangChain详解](./LangChain详解.md)、[SpringAi笔记](./SpringAi笔记.md)
