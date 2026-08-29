import {defineNoteConfig, defineNotesConfig} from 'vuepress-theme-plume'

/* =================== locale: zh-CN ======================= */

const zhJava = defineNoteConfig({
    dir: 'java/',
    link: '/java',
    sidebar: [
        {
            text: 'Java 基础',
            prefix: '基础语法/',
            items: [
                'java综合语法',
                '面向对象编程教程',
                'Java异常机制详解',
                'Java泛型机制详解',
                'javaIO流',
                'java多线程',
                '锁机制',
                'java反射机制详解',
                'java注解机制详解',
            ],
        },
        {
            text: 'Java 高级特性',
            prefix: '高级特性/',
            items: [
                'Java安全详解教程',
                '正则表达式详解教程',
                '日期时间API详解教程',
                '国际化详解教程',
                'Java性能监控和调优教程',
                'java缓存Caffeine详解',
                '日志体系SLF4J与Logback详解',
            ],
        },
        {
            text: 'Java 新特性',
            prefix: '新特性/',
            items: [
                'Java17与21新特性详解',
                '函数式编程深入教程',
                'Java模块系统详解教程',
            ],
        },
        {
            text: 'Java 网络编程',
            prefix: '网络编程/',
            items: [
                'JavaWeb开发教程',
                'Java数据库编程教程',
                'Java网络编程教程',
                'Netty入门详解',
            ],
        },
        {
            text: 'Java 集合框架',
            prefix: 'JavaCollection/',
            items: [
                'Java集合框架',
                'ArrayList详解',
                'LinkedList详解',
                'HashSet & HashMap详解',
                'Iterator详解',
                'LinkedHashSet&LinkedHashMap详解',
                'PriorityQueue详解',
                'Stack & Queue详解',
                'TreeSet&TreeMap详解',
                'WeakHashMap详解',
            ],
        },
        {
            text: 'Java 并发编程',
            prefix: 'juc/',
            items: [
                'Java并发工具类详解教程',
                '锁机制详解教程',
                '线程池与CompletableFuture详解',
            ],
        },
        {
            text: 'Java 虚拟机',
            prefix: 'jvm/',
            items: [
                'Java内存模型详解',
                'JVM深入教程',
                'JVM调优详解',
            ],
        },
        {
            text: '容器化',
            prefix: '容器化/',
            items: [
                'Docker容器化详解',
                'DockerCompose详解',
            ],
        },
        {
            text: 'Java IO',
            prefix: 'io/',
            items: [
                'NIO详解教程',
            ],
        },
    ],
})

const zhSpring = defineNoteConfig({
    dir: 'java/spring',
    link: '/spring',
    sidebar: [
        {
            text: 'Spring',
            prefix: '',
            items: [
                'SpringFramework详解',
                'MyBatis详解',
            ],
        },
    ],
})

const zhSpringBoot = defineNoteConfig({
    dir: 'java/SpringBoot',
    link: '/SpringBoot',
    sidebar: [
        {
            text: 'SpringBoot 核心',
            prefix: '',
            items: [
                'SpringBoot核心基础详解',
                'SpringBoot3迁移指南',
                'SpringSecurity详解',
                'JWT认证实战',
                'SpringBoot全局异常处理',
                'SpringBoot统一接口封装',
                'SpringBoot常见注解',
            ],
        },
        {
            text: 'SpringBoot 集成',
            prefix: 'SpringBoot集成/',
            items: [
                'SpringBoot集成Mybatis',
                'SpringBoot集成Redis',
                'SpringBoot集成jpa',
                'SpringBoot集成Minio',
                'SpringBoot集成MongDB',
                'SpringBoot集成Mybatis-plues',
                'SpringBoot集成Mybatis-flex',
                'SpringBoot集成RabbitMq',
                'SpringBoot集成阿里云oss',
                'SpringBoot集成Knife4j',
                'SpringBoot集成ElasticSearch',
            ],
        },
    ],
})

const zhSpringCloud = defineNoteConfig({
    dir: 'java/微服务',
    link: '/微服务',
    sidebar: [
        {
            text: 'SpringCloud 微服务',
            prefix: '',
            items: [
                'SpringCloud微服务详解',
                'Nacos详解',
                'OpenFeign详解',
                'Gateway详解',
                'Sentinel详解',
                'Bus详解',
                'Config详解',
                'MicrometerTracing详解',
                'Sleuth详解',
                'RabbitMQ详解',
                'Kafka详解',
                '分布式锁与缓存一致性',
                '消息幂等与最终一致性',
            ],
        },
    ],
})

const zhFrontend = defineNoteConfig({
    dir: '前端',
    link: '/frontend',
    sidebar: [
        {
            text: '前端',
            prefix: '',
            items: [
                'html',
                'css',
                'CSS布局现代指南',
                'js',
                'HTTP与浏览器网络详解',
                'TypeScript详解',
                'Vite工程化详解',
                'Vue3详解',
                'VueRouter详解',
                'Pinia状态管理详解',
                'vue',
                '移动端跨平台详解',
            ],
        },
    ],
})

const zhDatabase = defineNoteConfig({
    dir: '数据库',
    link: '/database',
    sidebar: [
        {
            text: '关系型数据库',
            prefix: '关系型/',
            items: [
                'mysql',
                'MySQL性能优化详解',
                'MySQL事务与锁详解',
                'PostgreSQL基础',
            ],
        },
        {
            text: 'NoSQL 数据库',
            prefix: 'NoSQL/',
            items: [
                'Redis基础操作详解',
                'Redis高级特性详解',
                'Redis缓存实战模式',
                'mongoDB',
                'es',
            ],
        },
    ],
})

const zhMiddleware = defineNoteConfig({
    dir: '中间件',
    link: '/middleware',
    sidebar: [
        {
            text: '消息中间件',
            prefix: '',
            items: [
                'RabbitMQ通俗教程',
            ],
        },
    ],
})

const zhAI = defineNoteConfig({
    dir: 'Ai',
    link: '/ai',
    sidebar: [
        {
            text: 'AI 技术',
            prefix: '',
            items: [
                'prompt_工程师',
                'SSE流式输出详解',
                'SpringAi笔记',
                'LangChain详解',
                'LangGraph4j详解',
                'RAG检索增强生成详解',
                'ToolCalling与FunctionCalling详解',
            ],
        },
    ],
})

const zhAlgorithm = defineNoteConfig({
    dir: '数据结构与算法',
    link: '/algorithm',
    sidebar: [
        {
            text: '数据结构与算法',
            prefix: '',
            items: [
                '数据结构详解',
                '算法详解',
                'LeetCode刷题指南',
                '面试常考算法题型',
            ],
        },
    ],
})

const zhDevelopmentStandards = defineNoteConfig({
    dir: '开发规范',
    link: '/development-standards',
    sidebar: [
        {
            text: '开发规范',
            prefix: '',
            items: [
                'Java设计模式教程',
                'Java开发规范',
                '前端开发规范',
                'REST接口设计规范',
                'Maven与Gradle详解',
                '单元测试JUnit5详解',
                '代码评审与ConventionalCommits',
            ],
        },
    ],
})

const zhDevOps = defineNoteConfig({
    dir: '运维',
    link: '/devops',
    sidebar: [
        {
            text: '系统运维',
            prefix: '',
            items: [
                'Linux',
                'Shell脚本实战',
                'nginx',
                'Kubernetes详解',
                'Git工作流详解',
                'GitHubActionsCI详解',
                'Prometheus与Grafana详解',
            ],
        },
    ],
})

export const zhNotes = defineNotesConfig({
    dir: 'notes',
    link: '/',
    notes: [
        zhJava,
        zhSpring,
        zhSpringBoot,
        zhSpringCloud,
        zhFrontend,
        zhDatabase,
        zhMiddleware,
        zhAI,
        zhAlgorithm,
        zhDevelopmentStandards,
        zhDevOps,
    ],
})

export const enNotes = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [],
})
