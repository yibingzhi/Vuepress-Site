---
tags:
  - Java
  - Docker
  - Docker Compose
  - 容器化
title: DockerCompose详解
createTime: 2026/08/29 16:00:00
permalink: /article/docker-compose/
---

::: tip Compose 版本说明
Docker Compose V2 使用 `docker compose`（无连字符）CLI。文件格式推荐 **Compose Specification**（`version` 字段已可选）。本文示例基于 2026 年主流写法。
:::

## 一、Docker Compose 是什么

Compose 用 YAML 定义多容器应用，一条命令启动/停止整套服务栈。

```
docker-compose.yml
        │
        ├── app (Spring Boot)
        ├── mysql
        ├── redis
        └── networks / volumes
```

| 对比 | docker run | docker compose |
|------|------------|----------------|
| 多容器编排 | 需脚本串联 | 声明式 YAML |
| 网络 | 手动创建 | 自动服务发现 |
| 开发体验 | 繁琐 | `docker compose up` 一键 |

---

## 二、文件结构概览

```yaml
# docker-compose.yml
name: order-stack

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: docker
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - backend
    volumes:
      - app-logs:/app/logs

  mysql:
    image: mysql:8.4
    # ...

  redis:
    image: redis:7-alpine
    # ...

networks:
  backend:
    driver: bridge

volumes:
  app-logs:
  mysql-data:
```

---

## 三、Services 详解

### 3.1 构建与镜像

```yaml
services:
  app:
  # 方式一：本地构建
    build:
      context: .
      dockerfile: Dockerfile
      args:
        JAR_FILE: target/order-service-1.0.0.jar

  # 方式二：直接使用镜像
  app:
    image: myregistry.example.com/order-service:${TAG:-latest}
    pull_policy: always
```

**Dockerfile 多阶段构建（Spring Boot）：**

```dockerfile
# Dockerfile
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --chown=spring:spring target/*.jar app.jar

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]
```

### 3.2 端口映射

```yaml
ports:
  - "8080:8080"       # 宿主机:容器
  - "127.0.0.1:8081:8081"  # 仅本机访问
```

容器间通信用 **服务名 + 内部端口**，无需 publish：

```yaml
# app 连接 mysql 使用 jdbc:mysql://mysql:3306/order_db
```

### 3.3 环境变量

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/order_db
  SPRING_DATASOURCE_USERNAME: order
  SPRING_DATASOURCE_PASSWORD: order_pass
  JAVA_OPTS: "-Xms256m -Xmx512m"

# 或从文件加载
env_file:
  - .env
  - .env.docker
```

`.env` 示例：

```bash
MYSQL_ROOT_PASSWORD=root_secret
MYSQL_DATABASE=order_db
TAG=1.2.0
```

Compose 自动读取项目根目录 `.env` 用于变量替换 `${MYSQL_ROOT_PASSWORD}`。

### 3.4 depends_on 与启动顺序

```yaml
depends_on:
  mysql:
    condition: service_healthy   # 等 healthcheck 通过
  redis:
    condition: service_started   # 仅容器启动
```

::: warning
`service_started` **不保证** MySQL 已接受连接，生产本地开发务必配 `healthcheck` + `service_healthy`。
:::

### 3.5 restart 策略

```yaml
restart: unless-stopped  # 推荐开发/单机部署
# 可选: no | always | on-failure | unless-stopped
```

### 3.6 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      memory: 256M
```

`deploy` 在纯 `docker compose`（非 Swarm）部分版本仅作参考，可用 `mem_limit` 兼容写法。

---

## 四、Networks

### 4.1 默认网络

未声明时 Compose 创建默认 bridge 网络，服务名即 DNS 主机名。

```yaml
networks:
  frontend:
  backend:

services:
  app:
    networks:
      - backend
  nginx:
    networks:
      - frontend
      - backend
```

### 4.2 隔离与安全

- 数据库、Redis 仅加入 `backend`，不 publish 端口到宿主机
- 仅 Nginx / API Gateway publish 80/443

```yaml
mysql:
  image: mysql:8.4
  networks:
    - backend
  # 不配置 ports，外部无法直接访问
```

### 4.3 外部网络

```yaml
networks:
  shared:
    external: true
    name: company-overlay
```

---

## 五、Volumes

### 5.1 命名卷（持久化数据）

```yaml
volumes:
  mysql-data:
    driver: local

services:
  mysql:
    volumes:
      - mysql-data:/var/lib/mysql
```

### 5.2 绑定挂载（开发热更新）

```yaml
services:
  app-dev:
    volumes:
      - ./src:/app/src        # 源码挂载
      - ./logs:/app/logs
```

### 5.3 只读挂载

```yaml
volumes:
  - ./config/application-docker.yml:/app/config/application.yml:ro
```

---

## 六、Healthcheck

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: order_db
      MYSQL_USER: order
      MYSQL_PASSWORD: order_pass
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  app:
    build: .
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 90s
```

Spring Boot Actuator health 聚合 DB、Redis 状态：

```yaml
# application-docker.yml
management:
  endpoint:
    health:
      probes:
        enabled: true
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true
```

---

## 七、完整示例：Spring Boot + MySQL + Redis

### 7.1 docker-compose.yml

```yaml
name: order-platform

services:
  mysql:
    image: mysql:8.4
    container_name: order-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: order_db
      MYSQL_USER: order
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-order_pass}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d:ro
    networks:
      - backend
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-p${MYSQL_ROOT_PASSWORD:-root}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: order-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis_pass}
    volumes:
      - redis-data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-redis_pass}", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: order-app
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/order_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: order
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD:-order_pass}
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
      SPRING_DATA_REDIS_PASSWORD: ${REDIS_PASSWORD:-redis_pass}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend
    volumes:
      - app-logs:/app/logs
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health/readiness"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 120s

networks:
  backend:
    driver: bridge

volumes:
  mysql-data:
  redis-data:
  app-logs:
```

### 7.2 application-docker.yml

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
  data:
    redis:
      lettuce:
        pool:
          max-active: 8

logging:
  file:
    name: /app/logs/app.log

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

### 7.3 初始化 SQL

```sql
-- docker/mysql/init/01-schema.sql
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.4 常用命令

```bash
# 构建并后台启动
docker compose up -d --build

# 查看日志
docker compose logs -f app

# 仅启动基础设施（profile 见下文）
docker compose --profile infra up -d

# 停止并删除容器（保留卷）
docker compose down

# 停止并删除卷（清数据）
docker compose down -v

# 进入 MySQL
docker compose exec mysql mysql -uorder -porder_pass order_db
```

---

## 八、Profiles（多场景组合）

Compose Profiles 按场景启用不同服务子集。

```yaml
services:
  mysql:
    image: mysql:8.4
    profiles: ["infra", "full"]
    # ...

  redis:
    image: redis:7-alpine
    profiles: ["infra", "full"]
    # ...

  app:
    build: .
    profiles: ["full"]
    # ...

  adminer:
    image: adminer:latest
    profiles: ["dev-tools"]
    ports:
      - "8081:8080"
    networks:
      - backend

  mailhog:
    image: mailhog/mailhog
    profiles: ["dev-tools"]
    ports:
      - "1025:1025"
      - "8025:8025"
```

```bash
# 仅数据库与缓存
docker compose --profile infra up -d

# 全栈 + 开发工具
docker compose --profile full --profile dev-tools up -d
```

无 profile 的服务 **始终启动**；带 profile 的需显式 `--profile` 启用。

---

## 九、覆盖文件（Override）

```yaml
# docker-compose.override.yml — 自动与主文件合并，适合本地开发
services:
  app:
    build:
      target: dev
    volumes:
      - ./target/classes:/app/classes
    environment:
      SPRING_DEVTOOLS_RESTART_ENABLED: "true"
```

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 十、扩展服务（Scale）

```bash
# 扩展无状态 worker（需无端口冲突设计）
docker compose up -d --scale worker=3
```

有状态服务（MySQL）不要 scale，改用主从或云服务。

---

## 十一、Secrets（生产）

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  app:
    secrets:
      - db_password
    environment:
      SPRING_DATASOURCE_PASSWORD_FILE: /run/secrets/db_password
```

Swarm mode 下 secrets 加密存储；纯 compose 仍可用 file mount，注意文件权限。

---

## 十二、与 CI/CD 集成

```yaml
# .github/workflows/integration-test.yml 片段
- name: Integration test with Compose
  run: |
    docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --wait
    ./mvnw -B verify -Dtest=*IT
    docker compose down -v
```

`docker compose up --wait` 等待所有 healthcheck 通过。

---

## 十三、故障排查

| 问题 | 排查 |
|------|------|
| app 连不上 mysql | 服务名是否为 `mysql`、同一 network |
| 数据库连接拒绝 | healthcheck 是否通过、init SQL 是否失败 |
| 端口占用 | `docker compose ps`、改宿主机端口 |
| 配置未生效 | `docker compose config` 查看合并结果 |
| 磁盘暴涨 | 清理 `docker system prune`、检查日志卷 |

```bash
# 验证最终配置
docker compose config

# 查看容器内 DNS
docker compose exec app getent hosts mysql
```

---

## 十四、生产注意事项

Compose 适合 **开发、测试、小规模单机部署**；生产集群推荐 Kubernetes。

若坚持用 Compose 单机生产：

- 使用命名卷 + 定期备份
- 镜像 pin 具体版本 tag，不用 `latest`
- 不 publish 数据库端口
- 配置日志轮转与监控
- 使用 `docker compose` 配合 systemd 开机自启

---

## 十五、检查清单

- [ ] 服务间用服务名通信，敏感配置走 `.env`（不入库）
- [ ] MySQL/Redis 配置 healthcheck
- [ ] `depends_on.condition: service_healthy`
- [ ] 数据目录使用 named volume
- [ ] Spring `application-docker.yml` profile 分离
- [ ] Actuator readiness 用于 healthcheck
- [ ] profiles 区分 infra / full / dev-tools
- [ ] `docker compose down -v` 仅开发环境使用

---

## 参考

- [Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Docker容器化详解](/article/docker-container/)
- [SpringBoot集成Redis](/article/springboot-redis/)
