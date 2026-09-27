import {defineNavbarConfig} from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
    {text: '首页', link: '/'},
    {text: '博客', link: '/blog/'},
    {text: '标签', link: '/blog/tags/'},
    {text: '索引', link: '/article/site-map/'},
    {text: '时效', link: '/notes/文档时效说明.md'},

    {
        text: 'Java',
        items: [
            {text: '语言基础', link: '/notes/java/基础语法/java综合语法.md'},
            {text: '集合框架', link: '/notes/java/JavaCollection/Java集合框架.md'},
            {text: '并发编程', link: '/notes/java/juc/Java并发工具类详解教程.md'},
            {text: '线程池与异步', link: '/notes/java/juc/线程池与CompletableFuture详解.md'},
            {text: 'JVM', link: '/notes/java/jvm/JVM深入教程.md'},
            {text: 'Java 17 / 21', link: '/notes/java/新特性/Java17与21新特性详解.md'},
            {text: '函数式编程', link: '/notes/java/新特性/函数式编程深入教程.md'},
            {text: '日志体系', link: '/notes/java/高级特性/日志体系SLF4J与Logback详解.md'},
            {text: 'Netty', link: '/notes/java/网络编程/Netty入门详解.md'},
            {text: 'Docker Compose', link: '/notes/java/容器化/DockerCompose详解.md'},
            {text: 'Spring Framework', link: '/notes/java/spring/SpringFramework详解.md'},
            {text: 'Spring Boot', link: '/notes/java/SpringBoot/SpringBoot核心基础详解.md'},
            {text: 'Boot 3 迁移', link: '/notes/java/SpringBoot/SpringBoot3迁移指南.md'},
            {text: 'JWT 认证', link: '/notes/java/SpringBoot/JWT认证实战.md'},
            {text: 'Spring Cloud', link: '/notes/java/微服务/SpringCloud微服务详解.md'},
            {text: '链路追踪', link: '/notes/java/微服务/MicrometerTracing详解.md'},
            {text: '分布式锁', link: '/notes/java/微服务/分布式锁与缓存一致性.md'},
            {text: '消息幂等', link: '/notes/java/微服务/消息幂等与最终一致性.md'},
        ],
    },
    {
        text: '前端',
        items: [
            {text: 'HTML / CSS / JS', link: '/notes/前端/html.md'},
            {text: '现代 CSS 布局', link: '/notes/前端/CSS布局现代指南.md'},
            {text: 'HTTP 与浏览器', link: '/notes/前端/HTTP与浏览器网络详解.md'},
            {text: 'TypeScript', link: '/notes/前端/TypeScript详解.md'},
            {text: 'Vite', link: '/notes/前端/Vite工程化详解.md'},
            {text: 'Vue 3', link: '/notes/前端/Vue3详解.md'},
            {text: 'Vue Router', link: '/notes/前端/VueRouter详解.md'},
            {text: 'Pinia', link: '/notes/前端/Pinia状态管理详解.md'},
            {text: '跨端概览', link: '/notes/前端/移动端跨平台详解.md'},
        ],
    },
    {
        text: '数据',
        items: [
            {text: 'MySQL', link: '/notes/数据库/关系型/mysql.md'},
            {text: 'MySQL 性能', link: '/notes/数据库/关系型/MySQL性能优化详解.md'},
            {text: 'MySQL 事务与锁', link: '/notes/数据库/关系型/MySQL事务与锁详解.md'},
            {text: 'PostgreSQL', link: '/notes/数据库/关系型/PostgreSQL基础.md'},
            {text: 'Redis', link: '/notes/数据库/NoSQL/Redis基础操作详解.md'},
            {text: 'Redis 高级', link: '/notes/数据库/NoSQL/Redis高级特性详解.md'},
            {text: 'Redis 缓存模式', link: '/notes/数据库/NoSQL/Redis缓存实战模式.md'},
            {text: 'MongoDB', link: '/notes/数据库/NoSQL/mongoDB.md'},
            {text: 'Elasticsearch', link: '/notes/数据库/NoSQL/es.md'},
        ],
    },
    {
        text: '中间件',
        items: [
            {text: 'RabbitMQ 入门', link: '/notes/中间件/RabbitMQ通俗教程.md'},
            {text: 'RabbitMQ（微服务）', link: '/notes/java/微服务/RabbitMQ详解.md'},
            {text: 'Kafka', link: '/notes/java/微服务/Kafka详解.md'},
        ],
    },
    {
        text: '算法',
        items: [
            {text: '数据结构', link: '/notes/数据结构与算法/数据结构详解.md'},
            {text: '算法', link: '/notes/数据结构与算法/算法详解.md'},
            {text: 'LeetCode', link: '/notes/数据结构与算法/LeetCode刷题指南.md'},
            {text: '常考题型', link: '/notes/数据结构与算法/面试常考算法题型.md'},
        ],
    },
    {
        text: '工程规范',
        items: [
            {text: '设计模式', link: '/notes/开发规范/Java设计模式教程.md'},
            {text: 'Java 规范', link: '/notes/开发规范/Java开发规范.md'},
            {text: '前端规范', link: '/notes/开发规范/前端开发规范.md'},
            {text: 'REST 设计', link: '/notes/开发规范/REST接口设计规范.md'},
            {text: 'Maven / Gradle', link: '/notes/开发规范/Maven与Gradle详解.md'},
            {text: '单元测试', link: '/notes/开发规范/单元测试JUnit5详解.md'},
            {text: '评审与提交约定', link: '/notes/开发规范/代码评审与ConventionalCommits.md'},
        ],
    },
    {
        text: 'AI',
        items: [
            {text: 'Prompt', link: '/notes/Ai/prompt_工程师.md'},
            {text: 'SSE', link: '/notes/Ai/SSE流式输出详解.md'},
            {text: 'Spring AI', link: '/notes/Ai/SpringAi笔记.md'},
            {text: 'LangChain4j', link: '/notes/Ai/LangChain详解.md'},
            {text: 'LangGraph4j', link: '/notes/Ai/LangGraph4j详解.md'},
            {text: 'RAG', link: '/notes/Ai/RAG检索增强生成详解.md'},
            {text: 'Tool Calling', link: '/notes/Ai/ToolCalling与FunctionCalling详解.md'},
        ],
    },
    {
        text: '运维',
        items: [
            {text: 'Linux', link: '/notes/运维/Linux.md'},
            {text: 'Shell', link: '/notes/运维/Shell脚本实战.md'},
            {text: 'Nginx', link: '/notes/运维/nginx.md'},
            {text: 'Kubernetes', link: '/notes/运维/Kubernetes详解.md'},
            {text: 'Git', link: '/notes/运维/Git工作流详解.md'},
            {text: 'GitHub Actions', link: '/notes/运维/GitHubActionsCI详解.md'},
            {text: 'Prometheus / Grafana', link: '/notes/运维/Prometheus与Grafana详解.md'},
            {text: 'Docker Compose', link: '/notes/java/容器化/DockerCompose详解.md'},
        ],
    },
])

export const enNavbar = defineNavbarConfig([
    {text: 'Home', link: '/en/'},
    {text: 'Blog', link: '/en/blog/'},
    {text: 'Tags', link: '/en/blog/tags/'},
    {text: 'Archives', link: '/en/blog/archives/'},
])
