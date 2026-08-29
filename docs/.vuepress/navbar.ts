import {defineNavbarConfig} from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
    {text: '首页', link: '/'},
    {text: '博客', link: '/blog/'},
    {text: '标签', link: '/blog/tags/'},
    {text: '知识保鲜', link: '/notes/知识保鲜状态.md'},

    {
        text: 'Java',
        items: [
            {text: '基础语法', link: '/notes/java/基础语法/java综合语法.md'},
            {text: '集合框架', link: '/notes/java/JavaCollection/Java集合框架.md'},
            {text: '并发 JUC', link: '/notes/java/juc/Java并发工具类详解教程.md'},
            {text: 'JVM', link: '/notes/java/jvm/JVM深入教程.md'},
            {text: 'Java 17/21 新特性', link: '/notes/java/新特性/Java17与21新特性详解.md'},
            {text: 'Docker', link: '/notes/java/容器化/Docker容器化详解.md'},
            {text: 'Spring Framework', link: '/notes/java/spring/SpringFramework详解.md'},
            {text: 'SpringBoot', link: '/notes/java/SpringBoot/SpringBoot核心基础详解.md'},
            {text: 'JWT 认证', link: '/notes/java/SpringBoot/JWT认证实战.md'},
            {text: 'Spring Cloud', link: '/notes/java/微服务/SpringCloud微服务详解.md'},
            {text: 'Micrometer Tracing', link: '/notes/java/微服务/MicrometerTracing详解.md'},
            {text: '分布式锁与缓存', link: '/notes/java/微服务/分布式锁与缓存一致性.md'},
        ],
    },
    {
        text: '前端',
        items: [
            {text: 'HTML', link: '/notes/前端/html.md'},
            {text: 'CSS', link: '/notes/前端/css.md'},
            {text: 'JavaScript', link: '/notes/前端/js.md'},
            {text: 'TypeScript', link: '/notes/前端/TypeScript详解.md'},
            {text: 'Vite', link: '/notes/前端/Vite工程化详解.md'},
            {text: 'Vue3', link: '/notes/前端/Vue3详解.md'},
            {text: 'Pinia', link: '/notes/前端/Pinia状态管理详解.md'},
            {text: '移动端跨平台', link: '/notes/前端/移动端跨平台详解.md'},
        ],
    },
    {
        text: '数据库',
        items: [
            {text: 'MySQL', link: '/notes/数据库/关系型/mysql.md'},
            {text: 'MySQL 性能优化', link: '/notes/数据库/关系型/MySQL性能优化详解.md'},
            {text: 'PostgreSQL', link: '/notes/数据库/关系型/PostgreSQL基础.md'},
            {text: 'Redis 基础', link: '/notes/数据库/NoSQL/Redis基础操作详解.md'},
            {text: 'Redis 高级', link: '/notes/数据库/NoSQL/Redis高级特性详解.md'},
            {text: 'MongoDB', link: '/notes/数据库/NoSQL/mongoDB.md'},
            {text: 'Elasticsearch', link: '/notes/数据库/NoSQL/es.md'},
        ],
    },
    {
        text: '中间件',
        items: [
            {text: 'RabbitMQ 入门', link: '/notes/中间件/傻子都能懂的RabbitMQ教程.md'},
            {text: 'RabbitMQ（微服务）', link: '/notes/java/微服务/RabbitMQ详解.md'},
            {text: 'Kafka', link: '/notes/java/微服务/Kafka详解.md'},
        ],
    },
    {
        text: '数据结构与算法',
        items: [
            {text: '数据结构', link: '/notes/数据结构与算法/数据结构详解.md'},
            {text: '算法', link: '/notes/数据结构与算法/算法详解.md'},
            {text: 'LeetCode 刷题', link: '/notes/数据结构与算法/LeetCode刷题指南.md'},
        ],
    },
    {
        text: '开发规范',
        items: [
            {text: 'Java 设计模式', link: '/notes/开发规范/Java设计模式教程.md'},
            {text: 'Java 开发规范', link: '/notes/开发规范/Java开发规范.md'},
            {text: '前端开发规范', link: '/notes/开发规范/前端开发规范.md'},
            {text: 'REST 接口设计', link: '/notes/开发规范/REST接口设计规范.md'},
            {text: 'Maven / Gradle', link: '/notes/开发规范/Maven与Gradle详解.md'},
        ],
    },
    {
        text: 'AI',
        items: [
            {text: 'Prompt 工程', link: '/notes/Ai/prompt_工程师.md'},
            {text: 'SSE 流式输出', link: '/notes/Ai/SSE流式输出详解.md'},
            {text: 'Spring AI', link: '/notes/Ai/SpringAi笔记.md'},
            {text: 'LangChain4j', link: '/notes/Ai/LangChain详解.md'},
            {text: 'LangGraph4j', link: '/notes/Ai/LangGraph4j详解.md'},
            {text: 'RAG', link: '/notes/Ai/RAG检索增强生成详解.md'},
        ],
    },
    {
        text: '运维',
        items: [
            {text: 'Linux', link: '/notes/运维/Linux.md'},
            {text: 'Nginx', link: '/notes/运维/nginx.md'},
            {text: 'Kubernetes', link: '/notes/运维/Kubernetes详解.md'},
            {text: 'Git 工作流', link: '/notes/运维/Git工作流详解.md'},
            {text: 'Docker', link: '/notes/java/容器化/Docker容器化详解.md'},
        ],
    },
])

export const enNavbar = defineNavbarConfig([
    {text: 'Home', link: '/en/'},
    {text: 'Blog', link: '/en/blog/'},
    {text: 'Tags', link: '/en/blog/tags/'},
    {text: 'Archives', link: '/en/blog/archives/'},
])
