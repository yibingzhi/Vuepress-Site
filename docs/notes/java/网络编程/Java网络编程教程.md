---
title: Java网络编程教程
createTime: 2025/08/18 09:55:33
permalink: /java/rli40g2k/
---


## 网络编程基础概念

网络编程是指编写程序使它们能够通过计算机网络进行通信。Java提供了丰富的API来支持网络编程，主要基于TCP/IP协议族。

网络编程的主要优势包括：
1. **分布式计算**：可以构建分布式应用程序
2. **资源共享**：可以在网络上共享数据和资源
3. **通信能力**：程序之间可以进行实时通信
4. **可扩展性**：可以构建可扩展的网络应用

## 网络协议基础

### TCP协议（传输控制协议）
TCP是一种面向连接的、可靠的、基于字节流的传输层通信协议：
- 面向连接：通信前需要建立连接
- 可靠性：确保数据完整性和顺序
- 适用于：Web浏览、文件传输、邮件等

### UDP协议（用户数据报协议）
UDP是一种无连接的传输层协议：
- 无连接：不需要建立连接
- 不可靠：不保证数据的到达和顺序
- 适用于：实时应用、广播、简单查询等

## TCP编程

TCP编程基于Socket（套接字）进行，使用ServerSocket和Socket类。

### TCP服务器端

```java
// 创建服务器Socket
ServerSocket serverSocket = new ServerSocket(port);

// 等待客户端连接
Socket clientSocket = serverSocket.accept();

// 获取输入输出流
PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
```

### TCP客户端

```java
// 创建客户端Socket
Socket socket = new Socket(hostname, port);

// 获取输入输出流
PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
```

### TCP通信示例

服务器端处理客户端连接：
```java
while (isRunning) {
    try {
        // 等待客户端连接
        Socket clientSocket = serverSocket.accept();
        System.out.println("新客户端连接: " + clientSocket.getInetAddress());

        // 为每个客户端创建一个处理线程
        executorService.submit(new ClientHandler(clientSocket));
    } catch (IOException e) {
        if (isRunning) {
            System.err.println("接受客户端连接时出错: " + e.getMessage());
        }
    }
}
```

## UDP编程

UDP编程使用DatagramSocket和DatagramPacket类进行数据传输。

### UDP服务器端

```java
// 创建UDP Socket
DatagramSocket socket = new DatagramSocket(port);

// 创建数据包用于接收数据
byte[] buffer = new byte[1024];
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

// 接收数据
socket.receive(packet);
```

### UDP客户端

```java
// 创建UDP Socket
DatagramSocket socket = new DatagramSocket();

// 准备发送的数据
byte[] data = "Hello".getBytes(StandardCharsets.UTF_8);
DatagramPacket packet = new DatagramPacket(data, data.length, address, port);

// 发送数据
socket.send(packet);
```

## Socket类详解

### ServerSocket类
用于服务器端监听客户端连接：
- `ServerSocket(int port)`：创建绑定到指定端口的服务器Socket
- `accept()`：监听并接受到此Socket的连接
- `close()`：关闭服务器Socket

### Socket类
用于客户端和服务器端的网络连接：
- `Socket(String host, int port)`：创建连接到指定主机和端口的Socket
- `getInputStream()`：返回此Socket的输入流
- `getOutputStream()`：返回此Socket的输出流
- `close()`：关闭Socket

### DatagramSocket类
用于UDP通信：
- `DatagramSocket()`：创建UDP Socket
- `DatagramSocket(int port)`：创建绑定到指定端口的UDP Socket
- `send(DatagramPacket packet)`：发送数据报包
- `receive(DatagramPacket packet)`：接收数据报包
- `close()`：关闭UDP Socket

### DatagramPacket类
用于表示数据报包：
- `DatagramPacket(byte[] buf, int length)`：构造数据报包
- `DatagramPacket(byte[] buf, int length, InetAddress address, int port)`：构造发送数据报包
- `getData()`：返回数据缓冲区
- `getLength()`：返回要发送或接收的数据的长度

## 多线程处理

在服务器端，通常需要为每个客户端连接创建一个线程来处理并发请求：

```java
while (isRunning) {
    try {
        // 等待客户端连接
        Socket clientSocket = serverSocket.accept();
        
        // 为每个客户端创建一个处理线程
        executorService.submit(new ClientHandler(clientSocket));
    } catch (IOException e) {
        // 处理异常
    }
}
```

使用线程池可以更好地管理线程资源：
```java
ExecutorService executorService = Executors.newCachedThreadPool();
```

## 异常处理

网络编程中常见的异常包括：
- `IOException`：IO操作异常
- `UnknownHostException`：无法解析主机名
- `ConnectException`：连接被拒绝
- `SocketException`：Socket操作异常

良好的异常处理是网络编程的关键：
```java
try {
    // 网络操作
} catch (IOException e) {
    System.err.println("网络错误: " + e.getMessage());
} finally {
    // 资源清理
}
```

## 最佳实践

### 1. 资源管理
始终确保正确关闭网络资源：
```java
finally {
    if (in != null) in.close();
    if (out != null) out.close();
    if (socket != null) socket.close();
}
```

### 2. 线程安全
在多线程环境中注意线程安全问题，使用同步机制保护共享资源。

### 3. 超时设置
为网络操作设置合适的超时时间：
```java
socket.setSoTimeout(5000); // 5秒超时
```

### 4. 缓冲区管理
合理设置缓冲区大小，避免内存浪费和性能问题。

### 5. 错误处理
实现完善的错误处理机制，提供有意义的错误信息。

