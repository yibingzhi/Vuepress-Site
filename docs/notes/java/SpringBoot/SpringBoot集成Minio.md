---
title: SpringBoot集成Minio
createTime: 2024/11/16 21:24:55
permalink: /SpringBoot/n9h7yax6/
---
MinIO 是一个高性能的对象存储服务，兼容 Amazon S3 API，适用于存储非结构化数据，如图片、视频、备份等。在 Spring Boot 项目中集成 MinIO 可以帮助您实现文件的上传、下载和管理。以下是一个关于在 Spring Boot 项目中集成 MinIO 的详细教程。

### 一、准备工作

1. **确保 MinIO 服务器已经安装并运行**。您可以在本地安装 MinIO，也可以使用云服务提供的 MinIO 实例。MinIO 提供了简单的安装指南，您可以通过访问 [MinIO 官方网站](https://min.io/) 获取更多信息。

2. **创建一个 Spring Boot 项目**。您可以使用 Spring Initializr 创建一个新的 Spring Boot 项目，并选择以下依赖：

   - Spring Web

### 二、添加 MinIO 客户端依赖

在 `pom.xml` 文件中添加 MinIO 客户端的依赖（如果使用 Maven）：

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.3</version> <!-- 确保使用最新版本 -->
</dependency>
```

如果使用 Gradle，请在 `build.gradle` 中添加：

```groovy
implementation 'io.minio:minio:8.5.3' // 确保使用最新版本
```

### 三、配置 MinIO 连接

在 `application.properties` 或 `application.yml` 中配置 MinIO 的连接信息：

**application.properties**

```properties
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket-name=mybucket
```

**application.yml**

```yaml
minio:
  url: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: mybucket
```

### 四、创建 MinIO 配置类

创建一个配置类，用于初始化 MinIO 客户端。

```java
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Configuration
public class MinioConfig {

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
    }
}
```

### 五、实现文件上传和下载服务

创建一个服务类，用于实现文件的上传和下载。

```java
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.errors.MinioException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename();
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return fileName;
    }

    public InputStream downloadFile(String fileName) throws Exception {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }
}
```

### 六、创建控制器

创建一个控制器来提供文件上传和下载的端点。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;

@RestController
@RequestMapping("/minio")
public class MinioController {

    @Autowired
    private MinioService minioService;

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            return minioService.uploadFile(file);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error occurred: " + e.getMessage();
        }
    }

    @GetMapping("/download/{fileName}")
    public void downloadFile(@PathVariable String fileName, HttpServletResponse response) {
        try (InputStream stream = minioService.downloadFile(fileName)) {
            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            org.apache.commons.io.IOUtils.copy(stream, response.getOutputStream());
            response.flushBuffer();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 七、测试 MinIO 集成

启动 Spring Boot 应用程序，并通过以下端点测试 MinIO 集成：

- 上传文件：`POST /minio/upload`，通过表单数据上传文件。
- 下载文件：`GET /minio/download/{fileName}`，通过文件名下载文件。

通过这个教程，您可以在 Spring Boot 项目中集成 MinIO，并利用其对象存储功能来处理文件的上传和下载。根据您的具体需求，您可以进一步探索 MinIO 的高级特性，如版本控制、存储策略和访问控制等。