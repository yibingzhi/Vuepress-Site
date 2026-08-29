---
tags:
  - 开发规范
  - Maven
  - Gradle
  - 构建工具
  - Java
title: Maven与Gradle详解
createTime: 2026/08/29 15:00:00
permalink: /article/maven-gradle-guide/
---

## 一、Maven 与 Gradle 概览

| 维度 | Maven | Gradle |
|------|-------|--------|
| 配置语言 | XML（pom.xml） | DSL（build.gradle.kts / Groovy） |
| 构建模型 | 固定生命周期 | 灵活 Task 图 |
| 依赖管理 | 成熟、中央仓库 | 兼容 Maven 仓库 |
| 增量构建 | 一般 | 优秀（构建缓存） |
| 学习曲线 | 低 | 中等 |
| Spring 生态 | 传统首选 | 官方 increasingly 推荐 |

---

## 二、pom.xml vs build.gradle.kts

### 1. Maven 基础 POM

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. Gradle Kotlin DSL

```kotlin
// build.gradle.kts
plugins {
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
    java
}

group = "com.example"
version = "1.0.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

### 3. 对照

| Maven | Gradle |
|-------|--------|
| `groupId` | `group` |
| `artifactId` | 项目名 / `rootProject.name` |
| `version` | `version` |
| `<dependency>` | `implementation(...)` |
| `<scope>test</scope>` | `testImplementation(...)` |
| `mvn package` | `./gradlew build` |

---

## 三、dependencyManagement 与 BOM

### 1. Maven dependencyManagement

父 POM 或 BOM 统一版本，子模块引用时无需写 version：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.3.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
        <!-- 版本由 BOM 管理 -->
    </dependency>
</dependencies>
```

### 2. Gradle 等价方案

Spring Boot Gradle 插件通过 `io.spring.dependency-management` 实现 BOM 导入：

```kotlin
plugins {
    id("io.spring.dependency-management") version "1.1.5"
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.boot:spring-boot-dependencies:3.3.0")
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2023.0.1")
    }
}
```

或使用 Spring Boot 插件自带的 dependency management（推荐）。

### 3. 自定义 BOM

```xml
<!-- bom/pom.xml -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common-core</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 四、多模块项目

### 1. Maven 多模块

```
parent/
├── pom.xml              # 父 POM（packaging=pom）
├── common/
│   └── pom.xml
├── service/
│   └── pom.xml
└── api/
    └── pom.xml
```

父 POM：

```xml
<packaging>pom</packaging>

<modules>
    <module>common</module>
    <module>service</module>
    <module>api</module>
</modules>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

子模块引用：

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>common</artifactId>
</dependency>
```

### 2. Gradle 多模块

```
root/
├── settings.gradle.kts
├── build.gradle.kts
├── common/
│   └── build.gradle.kts
├── service/
│   └── build.gradle.kts
└── api/
    └── build.gradle.kts
```

```kotlin
// settings.gradle.kts
rootProject.name = "demo"
include("common", "service", "api")
```

```kotlin
// service/build.gradle.kts
dependencies {
    implementation(project(":common"))
}
```

---

## 五、Spring Boot Parent

### Maven

`spring-boot-starter-parent` 提供：

- 默认 Java 版本
- 依赖版本 BOM
- 插件版本（compiler、surefire 等）
- 资源过滤配置

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>
```

### Gradle

无 parent 概念，通过插件 + BOM 等效：

```kotlin
plugins {
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
}
```

Spring Initializr 默认生成 Gradle 或 Maven 项目均可。

---

## 六、常用命令

### Maven

```bash
mvn clean                    # 清理 target/
mvn compile                  # 编译
mvn test                     # 运行测试
mvn package                  # 打包（跳过测试：-DskipTests）
mvn install                  # 安装到本地仓库
mvn dependency:tree          # 依赖树
mvn versions:display-dependency-updates  # 检查可升级依赖
mvn spring-boot:run          # 启动 Spring Boot
```

### Gradle

```bash
./gradlew clean
./gradlew compileJava
./gradlew test
./gradlew build
./gradlew bootRun            # Spring Boot 启动
./gradlew dependencies       # 依赖树
./gradlew build --scan       # 构建扫描报告
```

### Wrapper

```bash
# Maven
mvn -N wrapper:wrapper

# Gradle（项目通常自带 gradlew）
gradle wrapper --gradle-version 8.8
```

始终使用 Wrapper（`mvnw` / `gradlew`），保证团队构建环境一致。

---

## 七、何时选择 Maven / Gradle

### 选 Maven

- 团队熟悉 XML 配置，遗留 Maven 项目
- 企业内 Maven 私服、CI 模板成熟
- 简单单体 Spring Boot 项目

### 选 Gradle

- 需要更快增量构建与构建缓存
- Android / Kotlin 项目（Gradle 是官方构建工具）
- 复杂多模块、自定义构建逻辑多
- Spring 官方示例 increasingly 使用 Gradle

### 混合注意

- 同一项目不要混用两种构建工具
- 发布到 Maven Central 时两种工具均支持

---

## 八、依赖 Scope 对照

| Maven scope | Gradle configuration |
|-------------|---------------------|
| compile（默认） | `implementation` |
| provided | `compileOnly` |
| runtime | `runtimeOnly` |
| test | `testImplementation` |
| import（BOM） | `platform()` / `mavenBom()` |

```kotlin
dependencies {
    implementation("org.postgresql:postgresql")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
```

---

## 九、发布与版本管理

### Maven flatten / versions 插件

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>versions-maven-plugin</artifactId>
    <version>2.16.2</version>
</plugin>
```

### Gradle 版本目录（推荐）

```toml
# gradle/libs.versions.toml
[versions]
spring-boot = "3.3.0"

[libraries]
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
```

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.spring.boot)
}
dependencies {
    implementation(libs.spring.boot.starter.web)
}
```

---

## 小结

- Maven 用 XML + 固定生命周期，Gradle 用 DSL + 灵活 Task
- BOM / dependencyManagement 统一依赖版本，避免冲突
- 多模块：Maven 用 `<modules>`，Gradle 用 `settings.gradle.kts`
- Spring Boot：Maven 靠 parent，Gradle 靠插件 + BOM
- 新项目可优先 Gradle（构建速度 + Kotlin DSL），Maven 仍是企业主流
