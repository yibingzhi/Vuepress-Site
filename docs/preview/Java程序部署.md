---
title: Java程序部署
createTime: 2025/08/20 18:31:10
permalink: /article/d7f3sjnm/
---
# Java程序部署完整指南
## 🚀 快速开始


## 🔧 环境准备

### 1. JDK安装与配置

#### 🎯 推荐方式：使用SDKMAN
```bash
# 安装SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 查看可用的Java版本
sdk list java

# 安装指定版本的Java（推荐LTS版本）
sdk install java 17.0.2-open
sdk install java 21.0.1-open

# 设置默认版本
sdk default java 17.0.2-open

# 验证安装
java -version
javac -version
```

#### 🔧 手动安装方式
```bash
# 下载JDK
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz

# 解压到指定目录
sudo tar -xzf openjdk-17.0.2_linux-x64_bin.tar.gz -C /opt/

# 配置环境变量
echo 'export JAVA_HOME=/opt/jdk-17.0.2' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
echo 'export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar' >> ~/.bashrc
source ~/.bashrc

# 验证配置
echo $JAVA_HOME
java -version
```

### 2. Maven安装与配置

#### 🎯 使用SDKMAN安装
```bash
# 安装Maven
sdk install maven

# 设置默认版本
sdk default maven

# 验证安装
mvn -version
```

#### 🔧 配置Maven镜像源（国内用户推荐）
```xml
<!-- ~/.m2/settings.xml -->
<settings>
    <mirrors>
        <mirror>
            <id>aliyun</id>
            <name>Aliyun Maven</name>
            <url>https://maven.aliyun.com/repository/public</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
        <mirror>
            <id>huaweicloud</id>
            <name>Huawei Cloud</name>
            <url>https://mirrors.huaweicloud.com/repository/maven/</url>
            <mirrorOf>*,!central</mirrorOf>
        </mirror>
    </mirrors>
    
    <profiles>
        <profile>
            <id>jdk-17</id>
            <activation>
                <activeByDefault>true</activeByDefault>
                <jdk>17</jdk>
            </activation>
            <properties>
                <maven.compiler.source>17</maven.compiler.source>
                <maven.compiler.target>17</maven.compiler.target>
                <maven.compiler.compilerVersion>17</maven.compiler.compilerVersion>
            </properties>
        </profile>
    </profiles>
</settings>
```

### 3. 系统要求检查
```bash
# 检查内存（推荐至少4GB）
free -h

# 检查磁盘空间（推荐至少10GB可用）
df -h

# 检查系统版本
cat /etc/os-release

# 检查防火墙状态
systemctl status firewalld

# 检查SELinux状态（CentOS/RHEL）
getenforce

# 检查网络连通性
ping -c 3 8.8.8.8
```

## 📦 项目构建

### 1. 项目打包
```bash
# 清理并编译
mvn clean compile

# 运行测试
mvn test

# 打包（跳过测试）
mvn clean package -DskipTests

# 安装到本地仓库
mvn clean install -DskipTests

# 生成可执行JAR（Spring Boot项目）
mvn spring-boot:repackage
```

### 2. 构建配置优化
```xml
<!-- pom.xml 构建配置 -->
<build>
    <finalName>${project.artifactId}</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <executable>true</executable>
                <jvmArguments>
                    -Xms512m -Xmx1024m
                    -XX:+UseG1GC
                    -XX:MaxGCPauseMillis=200
                </jvmArguments>
                <profiles>
                    <profile>prod</profile>
                </profiles>
            </configuration>
        </plugin>
        
        <!-- 资源文件过滤 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-resources-plugin</artifactId>
            <version>3.2.0</version>
            <configuration>
                <encoding>UTF-8</encoding>
                <nonFilteredFileExtensions>
                    <nonFilteredFileExtension>pdf</nonFilteredFileExtension>
                    <nonFilteredFileExtension>swf</nonFilteredFileExtension>
                </nonFilteredFileExtensions>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## 🚀 部署方式

### 1. 传统部署

#### 🔄 后台运行
```bash
# 后台运行Java程序，日志输出到app.log
nohup java -jar /www/myapp/app.jar > /www/myapp/app.log 2>&1 &

# 查看进程
ps -ef | grep java

# 查看日志
tail -f /www/myapp/app.log

# 查看端口占用
netstat -tlnp | grep :8080
```

#### ⚙️ 使用systemd服务管理（推荐）
```bash
# 创建服务文件
sudo vim /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Java Application
Documentation=https://github.com/myapp/myapp
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=myapp
Group=myapp
WorkingDirectory=/www/myapp
ExecStart=/usr/bin/java -jar app.jar
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/www/myapp/logs /www/myapp/data

# 资源限制
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

```bash
# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp

# 查看日志
sudo journalctl -u myapp -f
```

### 2. 脚本化部署
```bash
#!/bin/bash
# deploy.sh - 完整的部署脚本

set -e  # 遇到错误立即退出

# 配置变量
APP_NAME="myapp"
APP_JAR="app.jar"
APP_DIR="/www/myapp"
BACKUP_DIR="/www/backup"
LOG_FILE="/www/myapp/logs/app.log"
PID_FILE="/www/myapp/app.pid"
PORT=8080
HEALTH_URL="http://localhost:$PORT/actuator/health"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v java &> /dev/null; then
        log_error "Java未安装"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        log_error "Maven未安装"
        exit 1
    fi
    
    if [ ! -f "target/$APP_JAR" ]; then
        log_error "JAR文件不存在: target/$APP_JAR"
        exit 1
    fi
}

# 停止应用
stop_app() {
    log_info "停止应用..."
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            sleep 5
            if kill -0 $PID 2>/dev/null; then
                log_warn "强制停止应用..."
                kill -9 $PID
            fi
        fi
        rm -f $PID_FILE
    else
        pkill -f $APP_JAR || true
    fi
    
    # 等待端口释放
    while netstat -tlnp | grep ":$PORT " > /dev/null; do
        log_info "等待端口 $PORT 释放..."
        sleep 1
    done
}

# 备份当前版本
backup_current() {
    log_info "备份当前版本..."
    if [ -f "$APP_DIR/$APP_JAR" ]; then
        mkdir -p $BACKUP_DIR
        BACKUP_NAME="${APP_JAR}.$(date +%Y%m%d_%H%M%S)"
        cp $APP_DIR/$APP_JAR $BACKUP_DIR/$BACKUP_NAME
        log_info "备份完成: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# 部署新版本
deploy_new() {
    log_info "部署新版本..."
    
    # 创建目录
    mkdir -p $APP_DIR/logs
    mkdir -p $APP_DIR/data
    
    # 复制JAR文件
    cp target/$APP_JAR $APP_DIR/
    
    # 设置权限
    chmod +x $APP_DIR/$APP_JAR
}

# 启动应用
start_app() {
    log_info "启动应用..."
    
    cd $APP_DIR
    
    # 启动应用
    nohup java -jar $APP_JAR > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    
    # 等待启动
    log_info "等待应用启动..."
    for i in {1..30}; do
        if curl -s $HEALTH_URL > /dev/null 2>&1; then
            log_info "应用启动成功！"
            return 0
        fi
        sleep 2
    done
    
    log_error "应用启动超时"
    return 1
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    if curl -s $HEALTH_URL | grep -q "UP"; then
        log_info "健康检查通过"
        return 0
    else
        log_error "健康检查失败"
        return 1
    fi
}

# 主函数
main() {
    log_info "开始部署 $APP_NAME..."
    
    check_dependencies
    stop_app
    backup_current
    deploy_new
    start_app
    health_check
    
    if [ $? -eq 0 ]; then
        log_info "部署完成！"
        log_info "应用地址: http://localhost:$PORT"
        log_info "日志文件: $LOG_FILE"
    else
        log_error "部署失败！"
        exit 1
    fi
}

# 执行主函数
main "$@"
```

## 🐳 容器化部署

### 1. Docker部署

#### 🐳 Dockerfile示例
```dockerfile
# 多阶段构建
FROM maven:3.8.6-openjdk-17 AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:17-jre-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制JAR文件
COPY --from=builder /app/target/*.jar app.jar

# 创建非root用户
RUN addgroup --system javauser && adduser --system --ingroup javauser javauser
USER javauser

# 创建必要的目录
RUN mkdir -p /app/logs /app/data

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 🐙 Docker Compose配置
```yaml
version: '3.8'

services:
  myapp:
    build: .
    container_name: myapp
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
      - TZ=Asia/Shanghai
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
      - ./config:/app/config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - myapp-network
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    container_name: myapp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
      MYSQL_USER: myapp
      MYSQL_PASSWORD: myapp123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    networks:
      - myapp-network

  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - myapp-network

  nginx:
    image: nginx:alpine
    container_name: myapp-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - myapp-network
    depends_on:
      - myapp

volumes:
  mysql_data:
  redis_data:

networks:
  myapp-network:
    driver: bridge
```

### 2. Kubernetes部署

#### 🚀 Deployment配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: JAVA_OPTS
          value: "-Xms512m -Xmx1024m -XX:+UseG1GC"
        - name: TZ
          value: "Asia/Shanghai"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: data
          mountPath: /app/data
        - name: config
          mountPath: /app/config
      volumes:
      - name: logs
        emptyDir: {}
      - name: data
        persistentVolumeClaim:
          claimName: myapp-data-pvc
      - name: config
        configMap:
          name: myapp-config
      imagePullSecrets:
      - name: docker-registry-secret
```

#### 🌐 Service配置
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  labels:
    app: myapp
spec:
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
      name: http
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
  labels:
    app: myapp
spec:
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      nodePort: 30080
      name: http
  type: NodePort
```

#### 📊 Ingress配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

## ⚙️ 生产环境配置

### 1. JVM参数优化
```bash
# 生产环境JVM参数（推荐配置）
java -server \
  -Xms2g \
  -Xmx4g \
  -XX:MetaspaceSize=256m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:G1HeapRegionSize=16m \
  -XX:+UseStringDeduplication \
  -XX:+OptimizeStringConcat \
  -XX:+UseCompressedOops \
  -XX:+UseCompressedClassPointers \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/www/myapp/dumps \
  -XX:+PrintGCDetails \
  -XX:+PrintGCTimeStamps \
  -XX:+PrintGCDateStamps \
  -Xloggc:/www/myapp/logs/gc.log \
  -XX:+UseGCLogFileRotation \
  -XX:NumberOfGCLogFiles=5 \
  -XX:GCLogFileSize=100M \
  -Djava.security.egd=file:/dev/./urandom \
  -Dfile.encoding=UTF-8 \
  -Duser.timezone=Asia/Shanghai \
  -jar app.jar
```

### 2. 应用配置
```yaml
# application-prod.yml
server:
  port: 8080
  tomcat:
    threads:
      max: 200
      min-spare: 20
    max-connections: 8192
    accept-count: 100
    connection-timeout: 20000
    max-http-form-post-size: 2MB
    max-swallow-size: 2MB
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
    min-response-size: 1024

spring:
  profiles:
    active: prod
  application:
    name: myapp
  
  # 数据库配置
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
      pool-name: MyAppHikariCP
  
  # Redis配置
  redis:
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
  
  # 缓存配置
  cache:
    type: redis
    redis:
      time-to-live: 600000
      cache-null-values: false
  
  # 安全配置
  security:
    user:
      name: admin
      password: ${ADMIN_PASSWORD:admin123}
      roles: ADMIN

# 日志配置
logging:
  level:
    root: WARN
    com.myapp: INFO
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  file:
    name: /www/myapp/logs/app.log
  logback:
    rollingpolicy:
      max-file-size: 100MB
      max-history: 30
      total-size-cap: 3GB
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

# 管理端点配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized
      show-components: always
  metrics:
    export:
      prometheus:
        enabled: true
  health:
    redis:
      enabled: true
    db:
      enabled: true
```

### 3. 安全配置
```bash
# 防火墙配置
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload

# 用户权限配置
sudo useradd -r -s /bin/false myapp
sudo usermod -aG myapp nginx
sudo chown -R myapp:myapp /www/myapp
sudo chmod 755 /www/myapp
sudo chmod 644 /www/myapp/*.jar

# 设置文件权限
sudo find /www/myapp -type d -exec chmod 755 {} \;
sudo find /www/myapp -type f -exec chmod 644 {} \;
sudo chmod +x /www/myapp/*.jar
sudo chmod 755 /www/myapp/logs
sudo chmod 755 /www/myapp/data

# SELinux配置（CentOS/RHEL）
sudo setsebool -P httpd_can_network_connect 1
sudo semanage port -a -t http_port_t -p tcp 8080
```

## 📊 监控与维护

### 1. 应用监控
```xml
<!-- 添加监控依赖 -->
<dependencies>
    <!-- Spring Boot Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Prometheus监控 -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
    
    <!-- 健康检查 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- 缓存监控 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
</dependencies>
```

### 2. 日志管理
```bash
# 日志轮转配置
sudo vim /etc/logrotate.d/myapp
```

```
/www/myapp/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 myapp myapp
    postrotate
        systemctl reload myapp
    endscript
    size 100M
}

/www/myapp/logs/gc.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 myapp myapp
    postrotate
        systemctl reload myapp
    endscript
    size 100M
}
```

### 3. 性能监控
```bash
# 查看JVM状态
jstat -gc <pid> 1000

# 查看线程状态
jstack <pid> > thread_dump.txt

# 查看内存使用
jmap -heap <pid>

# 生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 查看类加载统计
jstat -class <pid>

# 查看编译统计
jstat -compiler <pid>

# 实时监控脚本
#!/bin/bash
# monitor.sh
PID=$1
if [ -z "$PID" ]; then
    echo "Usage: $0 <pid>"
    exit 1
fi

echo "监控进程 $PID..."
echo "按 Ctrl+C 停止监控"
echo "----------------------------------------"

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo "内存使用:"
    jstat -gc $PID | tail -1
    echo "线程数: $(jstack $PID | grep 'Thread' | wc -l)"
    echo "----------------------------------------"
    sleep 5
done
```

## ❓ 常见问题与解决方案

### 1. 内存不足
```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head -10

# 检查JVM内存
jstat -gc <pid>

# 调整JVM参数
-Xms1g -Xmx2g -XX:MaxMetaspaceSize=256m

# 检查内存泄漏
jmap -histo:live <pid> | head -20
```

### 2. 端口占用
```bash
# 查看端口占用
netstat -tlnp | grep :8080
lsof -i :8080
ss -tlnp | grep :8080

# 杀死进程
kill -9 <pid>

# 查找占用端口的进程
fuser -n tcp 8080
```

### 3. 应用启动失败
```bash
# 查看详细日志
tail -f /www/myapp/logs/app.log
journalctl -u myapp -f

# 检查配置文件
java -jar app.jar --debug

# 检查依赖
mvn dependency:tree

# 检查JAR文件完整性
jar -tf app.jar | head -20

# 手动启动测试
java -jar app.jar --spring.profiles.active=prod
```

### 4. 性能调优
```bash
# GC调优
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:+UseStringDeduplication

# 线程池调优
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20
server.tomcat.max-connections=8192

# 数据库连接池调优
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
```

### 5. 网络问题
```bash
# 检查网络连通性
ping -c 3 8.8.8.8
telnet localhost 8080
curl -v http://localhost:8080/actuator/health

# 检查防火墙
sudo firewall-cmd --list-all
sudo iptables -L

# 检查SELinux
getenforce
sestatus
```

## ✅ 部署检查清单

### 🔧 环境检查
- [ ] JDK版本检查（推荐17+）
- [ ] Maven配置检查
- [ ] 系统资源检查（内存、磁盘、CPU）
- [ ] 网络连通性检查
- [ ] 防火墙配置检查

### 📦 构建检查
- [ ] 项目构建成功
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 代码质量检查通过
- [ ] 安全扫描通过

### ⚙️ 配置检查
- [ ] 配置文件正确
- [ ] 环境变量设置
- [ ] 数据库连接配置
- [ ] Redis连接配置
- [ ] 日志配置正确

### 🚀 部署检查
- [ ] 端口未被占用
- [ ] 用户权限设置
- [ ] 日志目录创建
- [ ] 数据目录创建
- [ ] 服务启动成功

### 📊 监控检查
- [ ] 健康检查通过
- [ ] 监控配置完成
- [ ] 日志轮转配置
- [ ] 告警配置完成
- [ ] 性能指标正常

### 🔒 安全检查
- [ ] 防火墙配置
- [ ] 用户权限最小化
- [ ] 敏感信息加密
- [ ] 安全扫描通过
- [ ] 备份策略制定

### 📋 运维检查
- [ ] 备份策略
- [ ] 回滚方案
- [ ] 监控告警
- [ ] 日志管理
- [ ] 性能基准

## 📚 总结

Java程序部署是一个系统工程，需要从环境准备、构建、部署、监控等多个维度进行考虑。选择合适的部署方式，配置合理的JVM参数，建立完善的监控体系，是确保应用稳定运行的关键。

### 🎯 最佳实践建议

1. **环境标准化**: 使用Docker容器化部署，确保环境一致性
2. **自动化部署**: 建立CI/CD流水线，实现自动化部署
3. **监控完善**: 集成Prometheus + Grafana，实现全方位监控
4. **日志管理**: 使用ELK Stack进行日志收集和分析
5. **安全加固**: 定期进行安全扫描，及时修复漏洞
6. **性能优化**: 建立性能基准，持续优化应用性能
7. **灾备方案**: 制定完善的备份和恢复策略

### 🚀 推荐技术栈

- **构建工具**: Maven + Spring Boot
- **容器化**: Docker + Docker Compose
- **编排工具**: Kubernetes
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **CI/CD**: Jenkins + GitLab CI
- **反向代理**: Nginx
- **数据库**: MySQL + Redis

建议在生产环境中使用容器化部署，结合Kubernetes等编排工具，可以实现更好的可扩展性和可维护性。
