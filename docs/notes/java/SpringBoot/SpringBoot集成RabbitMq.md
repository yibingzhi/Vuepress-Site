---
title: SpringBoot集成RabbitMq
createTime: 2024/11/16 21:27:31
permalink: /SpringBoot/nqf16eq9/
---
在 Spring Boot 中集成 RabbitMQ 是一个常见的任务，特别是在需要处理异步消息传递的应用中。Spring Boot 提供了对 RabbitMQ 的良好支持，通过 Spring AMQP 模块可以轻松实现。以下是一个关于在 Spring Boot 项目中集成 RabbitMQ 的详细教程。

### 一、准备工作

1. **确保 RabbitMQ 服务器已经安装并运行**。您可以在本地安装 RabbitMQ，也可以使用云服务提供的 RabbitMQ 实例。RabbitMQ 提供了简单的安装指南，您可以通过访问 [RabbitMQ 官方网站](https://www.rabbitmq.com/) 获取更多信息。

2. **创建一个 Spring Boot 项目**。您可以使用 Spring Initializr 创建一个新的 Spring Boot 项目，并选择以下依赖：

   - Spring Web
   - Spring AMQP

### 二、添加 RabbitMQ 客户端依赖

在 `pom.xml` 文件中添加 Spring AMQP 的依赖（如果使用 Maven）：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

如果使用 Gradle，请在 `build.gradle` 中添加：

```groovy
implementation 'org.springframework.boot:spring-boot-starter-amqp'
```

### 三、配置 RabbitMQ 连接

在 `application.properties` 或 `application.yml` 中配置 RabbitMQ 的连接信息：

**application.properties**

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

**application.yml**

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

### 四、创建配置类

创建一个配置类，用于定义队列、交换机和绑定。

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String QUEUE_NAME = "myQueue";
    public static final String EXCHANGE_NAME = "myExchange";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, false);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("routing.key.#");
    }
}
```

### 五、创建生产者

创建一个服务类，用于发送消息到 RabbitMQ。

```java
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQSender {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void send(String message) {
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, "routing.key.test", message);
    }
}
```

### 六、创建消费者

创建一个消费者，用于接收来自 RabbitMQ 的消息。

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQReceiver {

    @RabbitListener(queues = RabbitConfig.QUEUE_NAME)
    public void receive(String message) {
        System.out.println("Received: " + message);
    }
}
```

### 七、创建控制器

创建一个控制器来提供发送消息的端点。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rabbitmq")
public class RabbitMQController {

    @Autowired
    private RabbitMQSender rabbitMQSender;

    @PostMapping("/send")
    public String sendMessage(@RequestParam String message) {
        rabbitMQSender.send(message);
        return "Message sent: " + message;
    }
}
```

### 八、测试 RabbitMQ 集成

启动 Spring Boot 应用程序，并通过以下端点测试 RabbitMQ 集成：

- 发送消息：`POST /rabbitmq/send`，通过请求参数发送消息。

通过这个教程，您可以在 Spring Boot 项目中集成 RabbitMQ，并利用其消息传递功能来处理异步通信。根据您的具体需求，您可以进一步探索 RabbitMQ 的高级特性，如消息确认、持久化、交换机类型和路由等。