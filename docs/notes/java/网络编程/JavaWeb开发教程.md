# Java Web开发教程

本文档配合`com.ibz.网络编程.web`包中的Java文件和`src/main/webapp`目录中的Web资源文件，详细介绍Java Web开发中Servlet和JSP的基本概念和实现方式。

## Web开发基础概念

Web开发是指创建可以在互联网或内部网上运行的应用程序的过程。Java Web开发主要涉及以下技术：

1. **Servlet**：运行在服务器端的Java程序，用于处理HTTP请求和响应
2. **JSP（JavaServer Pages）**：用于创建动态Web页面的技术，结合了HTML和Java代码
3. **HTTP协议**：Web应用的基础通信协议
4. **Web容器**：如Tomcat、Jetty等，用于运行Servlet和JSP

Java Web开发的主要优势：
1. **平台无关性**：基于Java，具有良好的跨平台特性
2. **安全性**：Java的安全机制为Web应用提供保护
3. **可扩展性**：支持大型企业级应用开发
4. **丰富的生态系统**：大量的框架和工具支持

## Servlet技术

Servlet是Java Web开发的核心技术之一，它是一个Java类，用于扩展服务器的功能，处理客户端的请求并生成响应。

### Servlet生命周期

Servlet的生命周期由Web容器管理，包括以下阶段：
1. **加载和实例化**：Web容器加载Servlet类并创建实例
2. **初始化**：调用init()方法进行初始化
3. **处理请求**：调用service()方法处理客户端请求
4. **销毁**：调用destroy()方法释放资源

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // 处理GET请求
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // 处理POST请求
    }
}
```

### Servlet API核心接口

1. **HttpServlet**：所有Servlet类的基类
2. **HttpServletRequest**：封装HTTP请求信息
3. **HttpServletResponse**：封装HTTP响应信息
4. **HttpSession**：用于会话管理
5. **ServletContext**：提供Web应用的上下文信息

### Servlet注解配置

使用@WebServlet注解可以简化Servlet的配置：

```java
@WebServlet(
    name = "HelloServlet",
    urlPatterns = {"/hello", "/greeting"},
    initParams = {
        @WebInitParam(name = "configParam", value = "configValue")
    }
)
public class HelloServlet extends HttpServlet {
    // Servlet实现
}
```

## JSP技术

JSP（JavaServer Pages）是一种动态网页技术，允许在HTML中嵌入Java代码。

### JSP基本语法

1. **JSP表达式**：`<%= expression %>` - 输出表达式的值
2. **JSP脚本段**：`<% Java代码 %>` - 执行Java代码
3. **JSP声明**：`<%! 声明 %>` - 声明变量和方法
4. **JSP注释**：`<%-- 注释 --%>` - JSP页面注释

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Hello JSP</title>
</head>
<body>
    <h1>Hello, JSP World!</h1>
    <p>当前时间: <%= new java.util.Date() %></p>
    
    <% 
        String message = "这是在JSP中执行的Java代码";
        out.println("<p>" + message + "</p>");
    %>
</body>
</html>
```

### JSP隐式对象

JSP提供了9个隐式对象，可以直接使用：
1. **request**：HttpServletRequest对象
2. **response**：HttpServletResponse对象
3. **session**：HttpSession对象
4. **application**：ServletContext对象
5. **out**：JspWriter对象
6. **config**：ServletConfig对象
7. **pageContext**：PageContext对象
8. **page**：当前Servlet实例
9. **exception**：Exception对象（仅在错误页面中可用）

### JSP动作

JSP动作是一组标准的标签，用于控制Servlet引擎的行为：

```jsp
<!-- 包含其他页面 -->
<jsp:include page="header.jsp" />

<!-- 转发请求 -->
<jsp:forward page="error.jsp" />

<!-- 使用JavaBean -->
<jsp:useBean id="user" class="com.example.User" scope="session" />
<jsp:setProperty name="user" property="name" value="张三" />
<jsp:getProperty name="user" property="name" />
```

## Web应用结构

标准的Java Web应用遵循特定的目录结构：

```
webapp/
├── index.html                  # 首页
├── hello.jsp                   # JSP页面
├── user-form.html              # HTML表单
├── error/                      # 错误页面目录
│   ├── 404.html
│   ├── 500.html
│   └── general.html
├── WEB-INF/                    # 受保护的配置目录
│   ├── web.xml                 # Web应用配置文件
│   ├── classes/                # 编译后的Java类文件
│   └── lib/                    # 依赖的JAR文件
└── META-INF/                   # 元数据目录
    └── MANIFEST.MF
```

## 表单处理

Web应用经常需要处理用户通过HTML表单提交的数据。

### GET vs POST方法

1. **GET方法**：
   - 数据附加在URL后面
   - 有长度限制
   - 不安全，数据可见
   - 适用于查询操作

2. **POST方法**：
   - 数据在请求体中发送
   - 无长度限制
   - 相对安全
   - 适用于数据提交操作

### 获取请求参数

```java
@Override
protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    
    // 设置请求编码
    request.setCharacterEncoding("UTF-8");
    
    // 获取单值参数
    String name = request.getParameter("name");
    
    // 获取多值参数
    String[] hobbies = request.getParameterValues("hobby");
    
    // 获取所有参数
    Map<String, String[]> parameterMap = request.getParameterMap();
}
```

### 数据验证

在处理表单数据时，需要进行数据验证：

```java
private boolean validateUser(String name, String email) {
    if (name == null || name.trim().isEmpty()) {
        return false;
    }
    
    if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
        return false;
    }
    
    return true;
}
```

## 会话管理

HTTP协议是无状态的，会话管理用于在多个请求之间保持用户状态。

### HttpSession

```java
// 获取会话对象
HttpSession session = request.getSession();

// 设置会话属性
session.setAttribute("username", "张三");

// 获取会话属性
String username = (String) session.getAttribute("username");

// 移除会话属性
session.removeAttribute("username");

// 设置会话超时时间（秒）
session.setMaxInactiveInterval(30 * 60);
```

### 应用范围属性

ServletContext用于存储应用范围的属性：

```java
// 获取ServletContext
ServletContext context = getServletContext();

// 设置应用属性
context.setAttribute("appVersion", "1.0");

// 获取应用属性
String appVersion = (String) context.getAttribute("appVersion");
```

## 错误处理

Web应用需要妥善处理各种错误情况。

### 错误页面配置

在web.xml中配置错误页面：

```xml
<error-page>
    <error-code>404</error-code>
    <location>/error/404.html</location>
</error-page>

<error-page>
    <exception-type>java.lang.Exception</exception-type>
    <location>/error/general.html</location>
</error-page>
```

### 异常处理

在Servlet中处理异常：

```java
@Override
protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    try {
        // 处理业务逻辑
        processRequest(request, response);
    } catch (ValidationException e) {
        // 处理验证异常
        request.setAttribute("errorMessage", e.getMessage());
        request.getRequestDispatcher("/error/validation.jsp").forward(request, response);
    } catch (Exception e) {
        // 处理其他异常
        throw new ServletException("处理请求时发生错误", e);
    }
}
```

## Web应用配置

### web.xml配置文件

web.xml是Web应用的部署描述符：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="4.0" xmlns="http://xmlns.jcp.org/xml/ns/javaee">
    <!-- 欢迎页面 -->
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
    
    <!-- 会话配置 -->
    <session-config>
        <session-timeout>30</session-timeout>
    </session-config>
</web-app>
```

### Servlet 3.0+注解配置

使用注解可以简化配置：

```java
@WebServlet(
    name = "UserServlet",
    urlPatterns = "/user",
    initParams = @WebInitParam(name = "maxAge", value = "30")
)
public class UserServlet extends HttpServlet {
    // Servlet实现
}
```

## 最佳实践

### 1. 编码设置

确保正确的字符编码：

```java
// 在处理请求前设置编码
request.setCharacterEncoding("UTF-8");
response.setContentType("text/html;charset=UTF-8");
```

### 2. 资源管理

正确关闭资源：

```java
@Override
protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    
    response.setContentType("text/html;charset=UTF-8");
    PrintWriter out = response.getWriter();
    
    try {
        // 处理响应内容
        out.println("<h1>Hello World</h1>");
    } finally {
        // 确保关闭输出流
        out.close();
    }
}
```

### 3. MVC模式

采用MVC（Model-View-Controller）模式组织代码：

```
src/main/java/com/ibz/网络编程/web/
├── controller/                 # 控制器（Servlet）
│   ├── HelloServlet.java
│   ├── UserServlet.java
│   └── UserListServlet.java
├── model/                      # 模型（业务逻辑和数据）
│   └── User.java
└── view/                       # 视图（JSP页面，通常在webapp目录中）
    ├── hello.jsp
    ├── user-form.html
    └── user-list.jsp
```

### 4. 安全性考虑

1. **防止SQL注入**：使用PreparedStatement
2. **防止XSS攻击**：对用户输入进行转义
3. **CSRF保护**：使用令牌验证
4. **会话安全**：设置安全的会话管理策略

## 包结构说明

为了更好地组织代码，我们将Web编程相关的类放在`com.ibz.网络编程.web`包中：

```
src/main/java/com/ibz/网络编程/web/
├── HelloServlet.java           // 简单Servlet示例
├── UserServlet.java            // 用户表单处理Servlet
└── UserListServlet.java        // 用户列表Servlet

src/main/webapp/
├── index.html                  // 首页
├── hello.jsp                   // JSP示例
├── user-list.jsp               // 用户列表JSP示例
├── user-form.html              // 用户表单HTML
├── footer.jsp                  // 页脚包含文件
├── error/                      # 错误页面目录
│   ├── 404.html
│   ├── 500.html
│   └── general.html
└── WEB-INF/
    └── web.xml                 # Web应用配置文件
```

## 运行示例

要运行Web开发示例，需要一个Servlet容器，如Tomcat。可以使用以下方法：

### 1. 使用Maven Tomcat插件

在pom.xml中添加Tomcat插件：

```xml
<plugin>
    <groupId>org.apache.tomcat.maven</groupId>
    <artifactId>tomcat7-maven-plugin</artifactId>
    <version>2.2</version>
    <configuration>
        <port>8080</port>
        <path>/</path>
    </configuration>
</plugin>
```

然后运行：

```bash
mvn tomcat7:run
```

### 2. 手动部署到Tomcat

1. 构建WAR文件：
```bash
mvn clean package
```

2. 将生成的WAR文件部署到Tomcat的webapps目录

3. 启动Tomcat服务器

### 3. 使用IDE内置服务器

在IntelliJ IDEA等IDE中，可以直接配置Tomcat服务器并运行应用。

## 总结

Java Web开发是构建Web应用程序的重要技术，掌握Servlet和JSP是学习Java Web开发的基础：

1. **Servlet**：处理HTTP请求和响应的核心组件
2. **JSP**：创建动态Web页面的技术
3. **表单处理**：获取和验证用户输入数据
4. **会话管理**：在多个请求间保持用户状态
5. **错误处理**：妥善处理各种异常情况
6. **配置管理**：通过web.xml和注解配置应用

通过学习本教程，您应该能够：
- 理解Servlet和JSP的基本概念
- 创建和配置Servlet
- 编写JSP页面
- 处理表单数据
- 管理会话和应用范围属性
- 配置错误页面和Web应用

在实际开发中，通常会使用更高级的框架（如Spring MVC、Struts等）来简化Web开发，但掌握原生Servlet和JSP技术对于理解Web框架的工作原理非常重要。