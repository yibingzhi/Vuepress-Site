---
title: SpringBoot集成Minio
createTime: 2024/11/16 21:24:55
permalink: /SpringBoot/n9h7yax6/
---

### 一、环境准备
- **安装Minio服务器（可选，若已有可用的Minio服务可跳过此步）**：
    - 从Minio官方网站（https://min.io/download）下载适合你操作系统的Minio服务器二进制文件进行安装。
    - 安装完成后启动Minio服务器，例如在Linux系统下，通过命令行指定相关配置参数来启动，像这样（仅供参考，实际参数可按需调整）：
```bash
./minio server /data --address :9000
```
此命令表示将Minio服务器的数据存储在`/data`目录下，并监听在本地的`9000`端口。

### 二、创建Spring Boot项目
利用Spring Initializr（常见开发工具如IntelliJ IDEA、Eclipse等均支持该功能）创建一个Spring Boot项目，创建时依据项目的实际需求勾选对应的依赖，比如若项目需要通过接口来操作Minio，可勾选“Web”依赖。

### 三、添加Minio依赖
- **Maven项目添加依赖方式**：
在项目的`pom.xml`文件中添加Minio Java SDK的依赖，示例如下：
```xml
    <dependency>
        <groupId>io.minio</groupId>
        <artifactId>minio</artifactId>
        <version>8.5.13</version>
    </dependency>
```
- **Gradle项目添加依赖方式**：
在`build.gradle`文件中添加如下配置：
```groovy
implementation 'io.minio:minio-java:8.4.7'
```

### 四、配置Minio连接信息（使用`application.yml`配置）
在`application.yml`文件中配置Minio服务器的连接相关属性，示例如下：
```yaml
minio:
  endpoint: http://localhost:9000
  access-key: your_access_key
  secret-key: your_secret_key
  secure: false
```
其中各配置项含义如下：
- `endpoint`：Minio服务器的访问地址。
- `access-key`：Minio的访问密钥（Access Key），创建桶、上传下载等操作需要此密钥授权，需替换为你实际设置的值。
- `secret-key`：Minio的秘密密钥（Secret Key），同样用于授权，需替换为你实际设置的值。
- `secure`：是否使用SSL连接，这里设置为`false`表示不使用，若Minio服务器启用了SSL，则需设置为`true`并配置好相关证书等。

### 五、创建Minio配置类（用于初始化Minio客户端）
创建一个配置类来初始化Minio客户端，使其能够在整个Spring Boot项目中被注入和使用，示例代码如下：
```java
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.secure}")
    private boolean secure;

    // 创建MinioClient的Bean，方便在其他地方注入使用
    @Bean
    public MinioClient minioClient() throws Exception {
        return MinioClient.builder()
              .endpoint(endpoint)
              .credentials(accessKey, secretKey)
              .build();
    }
}
```

### 六、常用操作及代码示例

#### 1. 创建桶（Bucket）
桶在Minio中是用于存储对象（如文件等）的容器，所有对象都必须存储在桶内，类似于文件系统中的文件夹概念，但又有所不同。示例代码如下：
```java
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public void createBucket(String bucketName) throws Exception {
        if (!minioClient.bucketExists(bucketName)) {
            minioClient.makeBucket(bucketName);
            System.out.println("桶 " + bucketName + " 创建成功");
        } else {
            System.out.println("桶 " + bucketName + " 已存在");
        }
    }
}
```
可在其他地方（比如控制器类或者测试类等）注入`MinioService`并调用`createBucket`方法来创建桶，例如在控制器类中创建相应接口：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 创建桶的接口，接收桶名称作为参数
    @PostMapping("/create-bucket")
    public void createBucket(@RequestParam String bucketName) throws Exception {
        minioService.createBucket(bucketName);
    }
}
```

#### 2. 上传文件到桶中
以下是将本地文件上传到Minio指定桶中的示例代码，假设要上传的文件来自本地路径，并且在上传时可指定对象名称（即文件在Minio中存储的文件名）等信息：
```java
import io.minio.MinioClient;
import io.minio.UploadObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public void uploadFile(String bucketName, String objectName, String filePath) throws Exception {
        File file = new File(filePath);
        try (InputStream inputStream = new FileInputStream(file)) {
            UploadObjectArgs args = UploadObjectArgs.builder()
                  .bucket(bucketName)
                  .object(objectName)
                  .stream(inputStream, file.length(), -1)
                  .build();
            minioClient.uploadObject(args);
            System.out.println("文件 " + filePath + " 上传到桶 " + bucketName + " 中，对象名为 " + objectName + " 成功");
        } catch (IOException e) {
            System.err.println("文件上传失败: " + e.getMessage());
            throw e;
        }
    }
}
```
同样，在控制器类中创建接口来调用这个上传文件的方法，方便前端或者其他客户端发起上传请求，示例如下：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 上传文件的接口，接收桶名称、对象名称（Minio中存储的文件名）、本地文件路径作为参数
    @PostMapping("/upload")
    public void uploadFile(@RequestParam String bucketName, @RequestParam String objectName, @RequestParam String filePath) throws Exception {
        minioService.uploadFile(bucketName, objectName, filePath);
    }
}
```

#### 3. 从桶中下载文件
以下是从Minio桶中下载文件到本地的示例代码，会将下载的文件保存到指定的本地路径：
```java
import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public void downloadFile(String bucketName, String objectName, String localFilePath) throws Exception {
        GetObjectArgs args = GetObjectArgs.builder()
              .bucket(bucketName)
              .object(objectName)
              .build();
        try (InputStream inputStream = minioClient.getObject(args);
             OutputStream outputStream = new FileOutputStream(localFilePath)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer))!= -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            System.out.println("文件从桶 " + bucketName + " 中下载成功，保存到本地路径 " + localFilePath);
        } catch (IOException e) {
            System.err.println("文件下载失败: " + e.getMessage());
            throw e;
        }
    }
}
```
相应的控制器类接口示例如下，用于接收前端请求并调用下载文件的服务方法：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 下载文件的接口，接收桶名称、对象名称（Minio中存储的文件名）、本地保存路径作为参数
    @GetMapping("/download")
    public void downloadFile(@RequestParam String bucketName, @RequestParam String objectName, @RequestParam String localFilePath) throws Exception {
        minioService.downloadFile(bucketName, objectName, localFilePath);
    }
}
```

#### 4. 列出桶中的对象（文件）
以下代码示例展示了如何列出指定桶中的所有对象（文件），返回的结果可以包含对象名称、大小等信息，便于查看桶内存储的内容：
```java
import io.minio.MinioClient;
import io.minio.ListObjectsArgs;
import io.minio.Result;
import io.minio.messages.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public List<String> listObjects(String bucketName) throws Exception {
        List<String> objectNames = new ArrayList<>();
        ListObjectsArgs args = ListObjectsArgs.builder()
              .bucket(bucketName)
              .build();
        Iterable<Result<Item>> results = minioClient.listObjects(args);
        for (Result<Item> result : results) {
            Item item = result.get();
            objectNames.add(item.objectName());
        }
        return objectNames;
    }
}
```
在控制器类中创建接口来调用此方法并返回对象列表给前端等，示例接口如下：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 列出桶中对象的接口，接收桶名称作为参数，返回桶内对象名称列表
    @GetMapping("/list-objects")
    public List<String> listObjects(@RequestParam String bucketName) throws Exception {
        return minioService.listObjects(bucketName);
    }
}
```

#### 5. 删除桶中的对象（文件）
以下是删除Minio桶中指定对象（文件）的示例代码，通过指定桶名称和对象名称来执行删除操作：
```java
import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public void deleteObject(String bucketName, String objectName) throws Exception {
        RemoveObjectArgs args = RemoveObjectArgs.builder()
              .bucket(bucketName)
              .object(objectName)
              .build();
        minioClient.removeObject(args);
        System.out.println("桶 " + bucketName + " 中的对象 " + objectName + " 删除成功");
    }
}
```
对应的控制器类接口示例如下，用于接收前端请求并调用删除对象的服务方法：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 删除桶中对象的接口，接收桶名称和对象名称作为参数
    @DeleteMapping("/delete-object")
    public void deleteObject(@RequestParam String bucketName, @RequestParam String objectName) throws Exception {
        minioService.deleteObject(bucketName, objectName);
    }
}
```

#### 6. 删除桶
以下是删除Minio中指定桶的示例代码，注意只有桶为空（即桶内没有存储任何对象）时才能成功删除桶：
```java
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    public void deleteBucket(String bucketName) throws Exception {
        if (minioClient.bucketExists(bucketName)) {
            boolean isEmpty = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucketName).build()).iterator().hasNext();
            if (!isEmpty) {
                minioClient.removeBucket(bucketName);
                System.out.println("桶 " + bucketName + " 删除成功");
            } else {
                System.out.println("桶 " + bucketName + " 不为空，无法删除");
            }
        } else {
            System.out.println("桶 " + bucketName + " 不存在");
        }
    }
}
```
在控制器类中创建接口来调用此方法示例如下：
```java
import com.example.demo.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    // 删除桶的接口，接收桶名称作为参数
    @DeleteMapping("/delete-bucket")
    public void deleteBucket(@RequestParam String bucketName) throws Exception {
        minioService.deleteBucket(bucketName);
    }
}
```

通过以上步骤及代码示例，能够在Spring Boot项目中完整地集成Minio，实现对象存储相关的各类操作，以满足不同业务场景下对文件存储和管理的需求。在实际应用中，还可根据具体需求进一步优化和扩展功能，比如添加权限验证、文件类型过滤等逻辑。
