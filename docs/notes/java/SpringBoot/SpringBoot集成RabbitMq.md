---
title: SpringBoot集成RabbitMq
createTime: 2024/11/16 21:27:31
permalink: /SpringBoot/nqf16eq9/
---
以下是一份Spring Boot集成RabbitMQ的笔记，详细介绍了从环境准备到具体功能实现的各个步骤：

### 一、前提准备
1. **安装RabbitMQ**
    - **Linux系统**：可以通过官网提供的安装包（如`.deb`或`.rpm`格式，根据对应Linux发行版选择）进行安装，安装完成后启动服务。例如在Ubuntu系统下，使用`sudo apt-get install rabbitmq-server`命令安装，然后通过`sudo service rabbitmq-server start`启动服务。
    - **Windows系统**：下载Windows版本的安装包，按照安装向导进行安装，安装后在服务中启动RabbitMQ服务。
    - **Docker方式（可选）**：如果熟悉Docker，也可以使用`docker pull rabbitmq`拉取镜像，再通过`docker run`命令启动容器来运行RabbitMQ服务。
2. **RabbitMQ管理界面（可选但推荐）**：
安装完成后，默认情况下RabbitMQ没有开启管理界面，可通过命令（如在Linux下使用`sudo rabbitmq-plugins enable rabbitmq_management`）开启管理插件，之后通过浏览器访问`http://[RabbitMQ服务器IP地址]:15672`（默认端口是15672），使用默认账号`guest`（密码也是`guest`，生产环境建议修改）登录管理界面，可方便地查看队列、交换机等信息以及进行相关配置管理。

### 二、创建Spring Boot项目
通过Spring Initializr（例如在`https://start.spring.io/`网站）创建Spring Boot项目，选择必要的依赖，至少要包含`Spring AMQP`依赖（它为Spring Boot集成RabbitMQ提供了基础支持），也可按需添加如`Spring Web`等其他依赖方便后续接口测试等操作，然后将项目导入到常用的开发工具（如Intellij IDEA、Eclipse等）中。

### 三、添加依赖
- **Maven项目（`pom.xml`）**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```
- **Gradle项目（`build.gradle`）**：
```groovy
implementation 'org.springframework.boot:spring-boot-starter-amqp'
```

### 四、配置文件添加RabbitMQ配置
- **`application.properties`配置示例**：
```properties
spring.rabbitmq.host=127.0.0.1  # RabbitMQ服务器的IP地址，如果是本地安装就是127.0.0.1，若是远程服务器则填写对应IP
spring.rabbitmq.port=5672  # RabbitMQ服务监听的端口，默认5672
spring.rabbitmq.username=guest  # 登录RabbitMQ的用户名，默认是guest（生产环境记得修改）
spring.rabbitmq.password=guest  # 登录RabbitMQ的密码，默认是guest（生产环境记得修改）
spring.rabbitmq.virtual-host=/  # RabbitMQ的虚拟主机，默认是/，可根据实际需求设置不同的虚拟主机来隔离资源
```
- **`application.yml`配置示例（格式更清晰，推荐使用）**：
```yaml
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: guest
    password: guest
    virtual-host: /
```

### 五、消息生产者示例
创建一个消息发送者类（例如`RabbitMQProducer.java`），用于向RabbitMQ发送消息，示例代码如下：

```java
import org.example.rabbitmq.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


// 消息生产者
@Component
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void send(String message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
    }
}
```
在上述代码中：
- 通过`@Autowired`注入`RabbitTemplate`，它是Spring AMQP提供的用于发送消息的核心类，封装了与RabbitMQ交互的底层操作。
- `send方法接收交换机（exchange）名称、路由键（routingKey）和消息内容（message）作为参数，然后调用`convertAndSend`方法将消息发送到指定的交换机，交换机再根据路由键将消息路由到对应的队列中。

### 六、消息消费者示例
创建一个消息消费者类（例如`RabbitMQConsumer.java`），用于从RabbitMQ接收并处理消息，示例代码如下：

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQConsumer {

    // 监听队列
    @RabbitListener(queues = "myQueue")  // 监听名为myQueue的队列
    public void receiveMessage(String message) {
        System.out.println("Received message: " + message);
        // 在这里可以添加具体的业务逻辑来处理接收到的消息，比如存入数据库、进行数据加工等操作
    }
}
```
在上述代码中：
- 使用`@RabbitListener`注解来标记该方法为一个消息监听器，`queues`属性指定了要监听的队列名称（这里假设队列名为`myQueue`）。
- 当有消息发送到`myQueue`队列时，该方法会被自动触发，接收到的消息作为参数传入，在这里只是简单地打印了消息内容，实际项目中可以添加具体的业务逻辑来处理消息。

### 七、配置队列、交换机等（可选项，根据需求自定义配置）
如果需要在Spring Boot项目中自定义配置队列、交换机以及它们之间的绑定关系等，可以创建一个配置类（例如`RabbitMQConfig.java`），示例代码如下：

```java
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "myQueue";    // 队列
    public static final String EXCHANGE_NAME = "myExchange"; // 交换机
    public static final String ROUTING_KEY = "myRoutingKey"; // 路由键

    // 定义队列
    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME);
    }

    // 定义交换机，这里以DirectExchange为例（还有其他类型如FanoutExchange、TopicExchange等）
    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    // 定义队列和交换机的绑定关系
    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
}
```
在上述配置类中：
- 首先定义了队列、交换机的名称以及路由键等常量，方便后续引用。
- 通过`@Bean`注解定义了`Queue`对象，表示一个队列实体。
- 定义了`DirectExchange`对象，代表一种直连型交换机（不同类型交换机有不同的路由规则，直连型是根据完全匹配的路由键来路由消息）。
- 最后通过`BindingBuilder`构建了队列和交换机之间的绑定关系，指定了按照定义的路由键进行绑定，这样消息就能从交换机正确路由到队列了。

### 八、测试

```java
import org.example.rabbitmq.Producer.RabbitMQProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class RabbitMqApplication {

    public static void main(String[] args) {
        SpringApplication.run(RabbitMqApplication.class, args);
    }


    @Autowired
    private RabbitMQProducer RabbitMQProducer;

    @GetMapping("/send")
    public String sendMessage(@RequestParam String message) {
        RabbitMQProducer.send(message);
        return "Message sent: " + message;
    }

}

```

启动Spring Boot项目后：
- **生产者测试**：可以在项目的其他地方（比如某个控制器类中）注入`RabbitMQProducer`，然后调用`send`方法，传入合适的交换机、路由键和消息内容来发送消息，观察RabbitMQ管理界面中相应队列的消息数量是否增加等情况来验证消息是否发送成功。
- **消费者测试**：查看控制台输出或者在`receiveMessage`方法中添加断点等方式，验证当有消息发送到对应的队列时，消费者是否能正确接收到并执行相应的业务逻辑。

以上就是Spring Boot集成RabbitMQ的基本笔记内容，你可以根据实际项目需求进一步拓展功能，比如使用不同类型的交换机实现更复杂的消息路由，处理消息的确认和重试机制等。 

