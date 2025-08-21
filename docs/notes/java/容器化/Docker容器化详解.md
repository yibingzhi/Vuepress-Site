---
title: Docker容器化详解
createTime: 2024/11/19 11:00:15
permalink: /java/docker-containerization/
---

### 一、Docker 基础概念

#### 1. 容器化技术概述

**Docker** 是一个开源的容器化平台，允许开发者将应用程序和其依赖项打包到一个轻量级、可移植的容器中。

**核心优势：**

- **一致性**：开发、测试、生产环境一致
- **轻量级**：比虚拟机更小、更快
- **可移植性**：一次构建，到处运行
- **隔离性**：容器间相互隔离

#### 2. Docker 架构

```bash
# Docker 架构组件
┌─────────────────────────────────────────┐
│              Docker Client              │
├─────────────────────────────────────────┤
│              Docker Daemon              │
├─────────────────────────────────────────┤
│              Docker Engine              │
├─────────────────────────────────────────┤
│  Containers  │  Images  │  Registry   │
└─────────────────────────────────────────┘
```

### 二、Docker 基础操作

#### 1. 镜像管理

**查看镜像：**

```bash
# 列出本地镜像
docker images

# 查看镜像详细信息
docker inspect nginx:latest

# 查看镜像历史
docker history nginx:latest
```

**拉取镜像：**

```bash
# 拉取官方镜像
docker pull nginx:latest
docker pull mysql:8.0
docker pull redis:7-alpine

# 拉取私有镜像
docker pull registry.example.com/myapp:v1.0
```

**删除镜像：**

```bash
# 删除指定镜像
docker rmi nginx:latest

# 强制删除镜像
docker rmi -f nginx:latest

# 删除所有未使用的镜像
docker image prune -a
```

#### 2. 容器操作

**运行容器：**

```bash
# 运行交互式容器
docker run -it ubuntu:20.04 /bin/bash

# 运行后台容器
docker run -d --name my-nginx nginx:latest

# 运行容器并映射端口
docker run -d -p 8080:80 --name web nginx:latest

# 运行容器并挂载卷
docker run -d -v /host/path:/container/path --name app myapp:latest
```

**容器管理：**

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 启动容器
docker start my-nginx

# 停止容器
docker stop my-nginx

# 重启容器
docker restart my-nginx

# 删除容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx
```

**进入容器：**

```bash
# 进入运行中的容器
docker exec -it my-nginx /bin/bash

# 在容器中执行命令
docker exec my-nginx ls /var/www/html
```

### 三、Dockerfile 镜像构建

#### 1. 基础 Dockerfile

**Java 应用 Dockerfile：**

```dockerfile
# 使用官方OpenJDK镜像作为基础镜像
FROM openjdk:11-jre-slim

# 设置工作目录
WORKDIR /app

# 复制JAR文件到容器
COPY target/myapp.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置JVM参数
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**多阶段构建：**

```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-11 AS builder

WORKDIR /app

# 复制pom.xml
COPY pom.xml .

# 下载依赖
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:11-jre-slim

WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /app/target/myapp.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. 优化策略

**优化镜像大小：**

```dockerfile
# 使用Alpine Linux减小镜像大小
FROM openjdk:11-jre-alpine

# 安装必要的包
RUN apk add --no-cache curl

WORKDIR /app

COPY target/myapp.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**优化构建速度：**

```dockerfile
# 利用Docker缓存优化构建
FROM maven:3.8-openjdk-11

WORKDIR /app

# 先复制pom.xml，利用缓存
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 再复制源代码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=0 /app/target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 四、Docker Compose

#### 1. 基础配置

**docker-compose.yml：**

```yaml
version: '3.8'

services:
  # 应用服务
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - app-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: app123
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    networks:
      - app-network

volumes:
  mysql-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

#### 2. 高级配置

**环境变量配置：**

```yaml
version: '3.8'

services:
  app:
    build: .
    env_file:
      - .env
      - .env.local
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

**健康检查：**

```yaml
services:
  app:
    build: .
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:8080/actuator/health" ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 五、Docker 网络

#### 1. 网络类型

**默认网络：**

```bash
# 查看网络列表
docker network ls

# 创建自定义网络
docker network create my-network

# 使用自定义网络运行容器
docker run -d --name app1 --network my-network nginx:latest
docker run -d --name app2 --network my-network nginx:latest
```

**网络配置：**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app1:
    image: nginx:latest
    networks:
      - frontend
      - backend

  app2:
    image: nginx:latest
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # 内部网络，不连接外部
```

#### 2. 网络通信

**容器间通信：**

```bash
# 在同一网络中，容器可以通过服务名通信
docker run -d --name app1 --network my-network myapp:latest
docker run -d --name app2 --network my-network myapp:latest

# app2可以通过app1访问app1服务
curl http://app1:8080/api/users
```

### 六、数据卷管理

#### 1. 卷操作

**创建和管理卷：**

```bash
# 创建数据卷
docker volume create my-data

# 查看卷信息
docker volume inspect my-data

# 列出所有卷
docker volume ls

# 删除卷
docker volume rm my-data
```

**使用卷：**

```bash
# 运行容器并挂载卷
docker run -d \
  --name mysql \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  mysql:8.0

# 挂载主机目录
docker run -d \
  --name nginx \
  -v /host/path:/container/path:ro \
  nginx:latest
```

#### 2. 卷配置

**docker-compose.yml 中的卷配置：**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    volumes:
      - mysql-data:/var/lib/mysql
      - ./backup:/backup
      - ./init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf

volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
```

### 七、Docker 安全

#### 1. 安全最佳实践

**非root用户运行：**

```dockerfile
# 使用非root用户
FROM openjdk:11-jre-slim

# 创建应用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY target/myapp.jar app.jar

# 更改文件所有者
RUN chown appuser:appuser app.jar

# 切换到非root用户
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**最小化攻击面：**

```dockerfile
# 使用最小化基础镜像
FROM openjdk:11-jre-alpine

# 只安装必要的包
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY target/myapp.jar app.jar

# 设置只读文件系统
RUN chmod 444 app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. 安全扫描

**使用 Docker Scout：**

```bash
# 扫描镜像漏洞
docker scout cves nginx:latest

# 扫描本地镜像
docker scout cves myapp:latest

# 生成安全报告
docker scout quickview myapp:latest
```

### 八、Docker 监控

#### 1. 容器监控

**查看容器状态：**

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器状态
docker stats my-nginx

# 查看容器日志
docker logs my-nginx

# 实时查看日志
docker logs -f my-nginx
```

**监控命令：**

```bash
# 查看容器详细信息
docker inspect my-nginx

# 查看容器进程
docker top my-nginx

# 查看容器端口映射
docker port my-nginx
```

#### 2. 日志管理

**日志配置：**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**日志驱动：**

```bash
# 使用syslog驱动
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=udp://localhost:514 \
  nginx:latest

# 使用fluentd驱动
docker run -d \
  --log-driver=fluentd \
  --log-opt fluentd-address=localhost:24224 \
  nginx:latest
```

### 九、Docker 生产环境

#### 1. 生产环境配置

**高可用配置：**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      rollback_config:
        parallelism: 1
        delay: 5s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:8080/health" ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**资源限制：**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
          pids: 100
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### 2. 备份和恢复

**数据备份：**

```bash
# 备份MySQL数据
docker exec mysql mysqldump -u root -p myapp > backup.sql

# 备份卷数据
docker run --rm -v mysql-data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .

# 恢复数据
docker exec -i mysql mysql -u root -p myapp < backup.sql
```

### 十、Docker 最佳实践

#### 1. 镜像优化

**多阶段构建最佳实践：**

```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-11 AS builder

WORKDIR /app

# 复制依赖文件
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:11-jre-alpine

# 安装必要的包
RUN apk add --no-cache curl

# 创建应用用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# 复制JAR文件
COPY --from=builder /app/target/myapp.jar app.jar

# 设置文件权限
RUN chown appuser:appgroup app.jar

# 切换到非root用户
USER appuser

EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. 安全最佳实践

**安全配置：**

```dockerfile
# 使用最小化基础镜像
FROM openjdk:11-jre-alpine

# 设置非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

COPY target/myapp.jar app.jar

# 设置文件权限
RUN chown appuser:appgroup app.jar && \
    chmod 444 app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 3. 性能优化

**镜像层优化：**

```dockerfile
# 合并RUN命令减少层数
FROM openjdk:11-jre-alpine

RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY target/myapp.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### 总结

Docker 容器化技术为应用部署提供了标准化的解决方案：

**核心优势：**

1. **环境一致性**：开发、测试、生产环境完全一致
2. **快速部署**：镜像构建后可以快速部署到任何环境
3. **资源隔离**：容器间相互隔离，提高安全性
4. **易于扩展**：支持水平扩展和负载均衡
5. **版本管理**：支持镜像版本管理和回滚

**关键要点：**

1. **镜像构建**：使用多阶段构建优化镜像大小
2. **网络配置**：合理配置容器网络通信
3. **数据管理**：使用卷管理持久化数据
4. **安全实践**：使用非root用户和最小化攻击面
5. **监控运维**：配置健康检查和日志管理
