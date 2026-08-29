---
tags:
  - Java
  - 基础语法
  - IO流
  - NIO
title: javaIO流
createTime: 2024/11/19 10:20:35
permalink: /java/基础语法/skjb3m98/
---

::: tip 保鲜说明（2026-08）
本文基于 **JDK 17/21**。新项目读写文件优先 **NIO.2**（`java.nio.file`）；传统 `InputStream`/`Reader` 仍广泛用于网络流、第三方库与序列化。务必使用 **try-with-resources** 与**显式字符集**（`StandardCharsets.UTF_8`），避免平台默认编码陷阱。
:::

## 1. Java I/O 体系概览

Java I/O 按数据单位与 API 年代可分为：

| 维度 | 分类 | 代表类 |
|------|------|--------|
| 数据单位 | **字节流** | `InputStream` / `OutputStream` |
| 数据单位 | **字符流** | `Reader` / `Writer` |
| API 年代 | **传统 IO（java.io）** | 面向流、阻塞 |
| API 年代 | **NIO（java.nio）** | Buffer、Channel、非阻塞（网络） |
| API 年代 | **NIO.2（java.nio.file，Java 7+）** | `Path`、`Files` |

```
                    java.io
        ┌─────────────┴─────────────┐
   字节流                         字符流
InputStream/OutputStream      Reader/Writer
        │                         │
   装饰器包装                  装饰器包装
Buffered/GZIP/Data...      Buffered/InputStreamReader...
        │                         │
        └───────────┬─────────────┘
                    │
              java.nio.file (NIO.2)
                 Path / Files
```

---

## 2. 何时用哪种 API

| 场景 | 推荐 |
|------|------|
| 读写本地文件（文本/二进制） | `Files.readString` / `Files.write` / `Files.newInputStream` |
| 大文件流式处理 | `Files.newBufferedReader` + 逐行，或 `InputStream` 分块读 |
| 网络 Socket 流 | `InputStream`/`OutputStream` 或 NIO `SocketChannel` |
| 对象持久化 | `ObjectInputStream` / `ObjectOutputStream`（或 JSON/Protobuf） |
| 内存缓冲 | `ByteArrayInputStream`、`StringReader` |
| 压缩/加密包装 | 装饰器流 `GZIPInputStream`、`CipherInputStream` |
| 目录遍历、复制树 | `Files.walk`、`Files.copy` |

**原则**：文件操作用 NIO.2；已有库只接受 `InputStream` 时继续用传统流；字符数据**永远指定 Charset**。

---

## 3. 字节流（Byte Streams）

### 3.1 核心抽象

- `InputStream`：`read()` 读单字节（0-255），-1 表示 EOF；`read(byte[] buf)` 批量读。
- `OutputStream`：`write(int b)` / `write(byte[] buf)`；`flush()` 刷缓冲。

### 3.2 FileInputStream / FileOutputStream

```java
import java.io.*;
import java.nio.file.Path;

public class ByteStreamDemo {

  public static void writeBytes(Path path) throws IOException {
    byte[] data = "Hello, 字节流!\n二进制 \u0000 安全".getBytes(java.nio.charset.StandardCharsets.UTF_8);
    try (OutputStream out = new FileOutputStream(path.toFile())) {
      out.write(data);
    }
  }

  public static void readBytes(Path path) throws IOException {
    try (InputStream in = new FileInputStream(path.toFile())) {
      byte[] buf = new byte[8192];
      int n;
      while ((n = in.read(buf)) != -1) {
        // 处理 buf[0..n)
        System.out.write(buf, 0, n);
      }
    }
  }
}
```

### 3.3 使用 try-with-resources（Java 7+）

```java
// 自动调用 close()，异常抑制（suppressed）保留
try (InputStream in = Files.newInputStream(path);
     OutputStream out = Files.newOutputStream(target)) {
  in.transferTo(out); // Java 9+ InputStream.transferTo
}
```

实现 `AutoCloseable` 的类都可用于 try-with-resources。Java 9+ 可写：

```java
try (var in = Files.newInputStream(path)) { ... }
```

### 3.4 DataInputStream / DataOutputStream

读写基本类型，保持二进制格式（**不是**文本）：

```java
try (DataOutputStream dos = new DataOutputStream(Files.newOutputStream(path))) {
  dos.writeInt(42);
  dos.writeUTF("张三");
  dos.writeLong(System.currentTimeMillis());
}

try (DataInputStream dis = new DataInputStream(Files.newInputStream(path))) {
  int i = dis.readInt();
  String name = dis.readUTF();
  long ts = dis.readLong();
}
```

适用于自定义二进制协议；跨语言互通更推荐 Protobuf/MessagePack。

---

## 4. 字符流（Character Streams）

### 4.1 为什么需要字符流

字节流不处理编码；字符流在读写时完成 **Charset 编解码**。处理 `.txt`、`.json`、`.xml`、日志等文本应使用字符流或 NIO.2 文本 API。

### 4.2 InputStreamReader / OutputStreamWriter 桥接

```java
try (Reader reader = new InputStreamReader(
        Files.newInputStream(path), StandardCharsets.UTF_8);
     Writer writer = new OutputStreamWriter(
        Files.newOutputStream(target), StandardCharsets.UTF_8)) {
  reader.transferTo(writer); // Reader.transferTo Java 10+
}
```

**反模式**：`new FileReader(path)` 使用**平台默认编码**，在 Windows 与 Linux 间会乱码。

### 4.3 FileReader / FileWriter（了解，不推荐）

```java
// ❌ 依赖默认编码
try (FileReader fr = new FileReader("data.txt")) { }

// ✅ 指定 UTF-8
try (FileReader fr = new FileReader("data.txt", StandardCharsets.UTF_8)) { }
```

### 4.4 字符流读写示例

```java
try (Writer w = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
  w.write("第一行\n");
  w.write("第二行：中文与 emoji 🚀");
}

try (BufferedReader br = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
  String line;
  while ((line = br.readLine()) != null) {
    System.out.println(line);
  }
}
```

---

## 5. 缓冲流（Buffering）

无缓冲时，每次 `read()`/`write()` 可能触发系统调用，性能差。缓冲流在内存中积攒数据。

```java
// 字节
try (BufferedInputStream bis = new BufferedInputStream(Files.newInputStream(path));
     BufferedOutputStream bos = new BufferedOutputStream(Files.newOutputStream(out))) {
  bis.transferTo(bos);
}

// 字符
try (BufferedReader br = new BufferedReader(
        new InputStreamReader(Files.newInputStream(path), StandardCharsets.UTF_8))) {
  br.lines().forEach(System.out::println); // Java 8+ Stream
}
```

`Files.newBufferedReader` 已内置缓冲，无需再包一层 `BufferedReader`（除非需要 `readLine` 以外的 BufferedReader API）。

默认缓冲区大小通常 8KB，可通过构造器指定。

---

## 6. 字符集（Charset）深入

### 6.1 常用 Charset

```java
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

Charset utf8 = StandardCharsets.UTF_8;
Charset gbk = Charset.forName("GBK");
```

### 6.2 编码与解码

```java
String text = "你好";
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
String restored = new String(bytes, StandardCharsets.UTF_8);

// 错误编码会乱码或抛异常
CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder()
    .onMalformedInput(CodingErrorAction.REPORT);
```

### 6.3 生产建议

1. **全链路 UTF-8**：文件、HTTP、`application.properties`、数据库连接参数。
2. HTTP 响应设置 `Content-Type: text/plain; charset=UTF-8`。
3. 读取外部 CSV/日志时，若来源为 GBK，显式 `Charset.forName("GBK")`，不要猜。

---

## 7. NIO.2：Path 与 Files

### 7.1 Path 表示路径

```java
import java.nio.file.*;

Path p1 = Path.of("/data", "app", "config.yml");     // Java 11+
Path p2 = Paths.get("logs", "app.log");
Path abs = p1.toAbsolutePath().normalize();
String fileName = p1.getFileName().toString();
Path parent = p1.getParent();
```

`Path` 替代旧 `File` 类用于路径运算；`File` 仍可用于部分遗留 API。

### 7.2 文件是否存在与元数据

```java
if (Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
  long size = Files.size(path);
  FileTime modified = Files.getLastModifiedTime(path);
  boolean isDir = Files.isDirectory(path);
  PosixFilePermissions  // POSIX 系统权限
}
```

### 7.3 读写文本与二进制

```java
// 小文件：一次性读写
String content = Files.readString(path, StandardCharsets.UTF_8);
Files.writeString(path, "新内容\n", StandardCharsets.UTF_8,
    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

// 读所有行
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);

// 流式读行（大文件推荐）
try (Stream<String> stream = Files.lines(path, StandardCharsets.UTF_8)) {
  stream.filter(l -> l.contains("ERROR"))
      .forEach(System.out::println);
}

// 字节
byte[] bytes = Files.readAllBytes(path);
Files.write(path, bytes);
```

### 7.4 复制、移动、删除

```java
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
Files.move(oldPath, newPath, StandardCopyOption.ATOMIC_MOVE);
Files.delete(path);                    // 不存在抛异常
Files.deleteIfExists(path);
```

目录复制：

```java
try (Stream<Path> walk = Files.walk(sourceDir)) {
  walk.forEach(src -> {
    Path dest = targetDir.resolve(sourceDir.relativize(src));
    try {
      if (Files.isDirectory(src)) {
        Files.createDirectories(dest);
      } else {
        Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  });
}
```

Java 7+ 也可用 `Files.walkFileTree` + `SimpleFileVisitor`。

### 7.5 创建目录与临时文件

```java
Files.createDirectories(Path.of("/data/app/logs"));
Path tmp = Files.createTempFile("upload-", ".bin");
Path tmpDir = Files.createTempDirectory("work-");
// 用完 Files.deleteIfExists(tmp)
```

### 7.6 监听目录变化（WatchService）

```java
WatchService watcher = FileSystems.getDefault().newWatchService();
Path dir = Path.of("/data/inbox");
dir.register(watcher, StandardWatchEventKinds.ENTRY_CREATE);

WatchKey key;
while ((key = watcher.take()) != null) {
  for (WatchEvent<?> event : key.pollEvents()) {
    Path fileName = (Path) event.context();
    System.out.println("event: " + event.kind() + " -> " + fileName);
  }
  key.reset();
}
```

适合日志采集、热加载配置；高吞吐场景用消息队列更稳。

---

## 8. File 类（遗留，了解即可）

```java
File file = new File("test.txt");
if (file.exists()) {
  System.out.println(file.getAbsolutePath());
  System.out.println(file.length());
}
```

新代码用 `Path` + `Files`；与旧 API 互转：`path.toFile()`、`file.toPath()`。

---

## 9. 标准输入输出与打印

```java
InputStream stdin = System.in;
PrintStream stdout = System.out;
PrintStream stderr = System.err;

// 从控制台读一行
try (var reader = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8))) {
  String line = reader.readLine();
}
```

日志应使用 SLF4J/Logback，而非 `System.out.println`。

---

## 10. 对象序列化（Object Streams）

```java
public record Person(String name, int age) implements Serializable {
  @Serial
  private static final long serialVersionUID = 1L;
}

// 序列化
try (ObjectOutputStream oos = new ObjectOutputStream(
    Files.newOutputStream(Path.of("person.ser")))) {
  oos.writeObject(new Person("张三", 25));
}

// 反序列化
try (ObjectInputStream ois = new ObjectInputStream(
    Files.newInputStream(Path.of("person.ser")))) {
  Person p = (Person) ois.readObject();
}
```

**注意**：

1. `serialVersionUID` 保证版本兼容。
2. 反序列化有**安全风险**，不要对不可信数据使用。
3. 微服务间通信优先 **JSON**（Jackson）、**Protobuf**、Avro。

`transient` 字段不参与序列化；敏感字段加密或根本不序列化。

---

## 11. 装饰器流组合示例

### 11.1 GZIP 压缩

```java
// 写压缩文件
try (OutputStream out = new GZIPOutputStream(Files.newOutputStream(Path.of("data.gz")));
     DataOutputStream dos = new DataOutputStream(out)) {
  dos.writeUTF("payload");
}

// 读
try (InputStream in = new GZIPInputStream(Files.newInputStream(Path.of("data.gz")));
     DataInputStream dis = new DataInputStream(in)) {
  String s = dis.readUTF();
}
```

### 11.2 计算校验和

```java
try (InputStream in = new DigestInputStream(
    Files.newInputStream(path), MessageDigest.getInstance("SHA-256"))) {
  in.transferTo(OutputStream.nullOutputStream());
  byte[] hash = ((DigestInputStream) in).getMessageDigest().digest();
}
```

### 11.3 限制读取大小（防 OOM）

```java
try (InputStream limited = new BoundedInputStream(Files.newInputStream(upload), 10 * 1024 * 1024)) {
  limited.transferTo(target);
}
// BoundedInputStream 可用 Apache Commons IO 或自行实现
```

---

## 12. NIO Channel 与 Buffer（简要）

网络与高吞吐场景使用 `java.nio`：

```java
try (RandomAccessFile raf = new RandomAccessFile("data.bin", "rw");
     FileChannel channel = raf.getChannel()) {
  ByteBuffer buf = ByteBuffer.allocate(4096);
  int read = channel.read(buf);
  buf.flip();
  while (buf.hasRemaining()) {
    System.out.print((char) buf.get());
  }
}
```

`FileChannel.transferTo` 支持零拷贝发送文件。Servlet 3.1+、`Files.copy` 底层可能利用 sendfile。

---

## 13. try-with-resources 深入

### 13.1 多个资源

```java
try (InputStream in = Files.newInputStream(src);
     OutputStream out = Files.newOutputStream(dst)) {
  in.transferTo(out);
} catch (IOException e) {
  log.error("copy failed", e);
}
```

### 13.2 自定义资源

```java
public class DbConnection implements AutoCloseable {
  @Override
  public void close() {
    // 归还连接池
  }
}

try (var conn = pool.acquire()) {
  conn.query(...);
}
```

### 13.3 异常抑制

try 块与 `close()` 都抛异常时，主异常保留，`close()` 异常作为 **suppressed**：

```java
catch (IOException e) {
  for (Throwable s : e.getSuppressed()) {
    log.warn("suppressed", s);
  }
}
```

---

## 14. 异常处理

I/O 方法声明 `IOException`（检查型异常），必须处理或抛出。

```java
public List<String> safeReadLines(Path path) {
  try {
    return Files.readAllLines(path, StandardCharsets.UTF_8);
  } catch (NoSuchFileException e) {
    return List.of();
  } catch (IOException e) {
    throw new UncheckedIOException("read failed: " + path, e);
  }
}
```

业务层可包装为运行时异常；框架边界统一转 HTTP 5xx。

---

## 15. 性能对比与最佳实践

| 做法 | 说明 |
|------|------|
| 大文件勿 `readAllBytes` | 使用流式 `transferTo` 或分块缓冲 |
| 文本用 `Files.lines` Stream | 惰性处理，记得 `close` Stream |
| 复用缓冲区 | `byte[8192]` 或更大，减少 syscall |
| NIO.2 复制文件 | `Files.copy` 可能触发操作系统优化 |
| 避免逐字节 `read()` | 使用数组或 `transferTo` |
| 字符集一次指定 | 不要反复 `new String(bytes)` 不指定编码 |

### 15.1 微基准注意事项

JVM 预热、磁盘缓存会极大影响结果；生产指标用真实负载与 APM。

---

## 16. 实战：HTTP 文件下载接口（Spring Boot）

```java
@GetMapping("/files/{id}")
public ResponseEntity<Resource> download(@PathVariable String id) throws IOException {
  Path path = storageService.resolve(id);
  if (!Files.exists(path)) {
    return ResponseEntity.notFound().build();
  }
  long size = Files.size(path);
  Resource resource = new UrlResource(path.toUri());
  return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(size)
      .body(resource);
}
```

上传：

```java
@PostMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file) throws IOException {
  Path target = uploadDir.resolve(Objects.requireNonNull(file.getOriginalFilename()));
  try (InputStream in = file.getInputStream()) {
    Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
  }
  return "ok";
}
```

---

## 17. 实战：按行处理超大日志

```java
public long countErrors(Path logPath) throws IOException {
  long count = 0;
  try (BufferedReader reader = Files.newBufferedReader(logPath, StandardCharsets.UTF_8)) {
    String line;
    while ((line = reader.readLine()) != null) {
      if (line.contains("ERROR")) {
        count++;
      }
    }
  }
  return count;
}

// 或 Stream（仍须在 try-with-resources 内）
public long countErrorsStream(Path logPath) throws IOException {
  try (Stream<String> lines = Files.lines(logPath, StandardCharsets.UTF_8)) {
    return lines.filter(l -> l.contains("ERROR")).count();
  }
}
```

---

## 18. 常见坑

1. **忘记 close** → 句柄泄漏；用 try-with-resources。
2. **默认编码** → 乱码；统一 UTF-8。
3. **`read()` 返回值未判断** → `read(byte[])` 返回实际读取长度，可能小于数组长度。
4. **把 `InputStream` 读完后再次读** → 流只能顺序消费一次，需 `mark/reset` 或重新打开。
5. **字符与字节混用** → 文本用 Reader/Writer 或 `readString`。
6. **Windows 路径** → 优先 `Path.of`，避免手写 `\` 转义。
7. **并发写同一文件** → 需文件锁 `FileChannel.lock()` 或外部协调。

---

## 19. API 对照速查

| 操作 | 传统 IO | NIO.2 |
|------|---------|-------|
| 读全文 | `Files.readString` 或手动 Reader | `Files.readString` |
| 写全文 | FileWriter | `Files.writeString` |
| 复制 | 流读写 | `Files.copy` |
| 删除 | `File.delete()` | `Files.deleteIfExists` |
| 遍历目录 | `File.list()` | `Files.list` / `walk` |
| 检查存在 | `file.exists()` | `Files.exists` |

---

## 20. 小结

Java I/O 选型可以简化为：

1. **本地文件**：`Path` + `Files`（NIO.2）为第一选择。
2. **文本**：显式 **UTF-8**；大文件流式处理。
3. **二进制/网络流**：`InputStream`/`OutputStream` + **缓冲** + try-with-resources。
4. **对象持久化**：优先 JSON/Protobuf；Java 序列化仅用于可信、封闭场景。
5. **性能**：避免逐字节读写；善用 `transferTo` 与合适缓冲区大小。

掌握字节流与字符流的区别、装饰器组合方式，以及 NIO.2 的高级文件操作，足以应对绝大多数后端开发中的 I/O 需求。
