import {defineNoteConfig, defineNotesConfig} from 'vuepress-theme-plume'

/* =================== locale: zh-CN ======================= */

// Java 技术栈配置
const zhJava = defineNoteConfig({
    dir: 'java/',
    link: 'java',
    sidebar: [
        {
            text: 'Java',
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
        // {
        //     text: 'Java 高级特性',
        //     prefix: '高级特性/',
        //     items: [
        //         'Java安全详解教程',
        //         '正则表达式详解教程',
        //         '日期时间API详解教程',
        //         '国际化详解教程',
        //         'Java性能监控和调优教程',
        //         'java缓存Caffeine详解',
        //     ],
        // },
        // {
        //     text: 'Java 新特性',
        //     prefix: '新特性/',
        //     items: [
        //         'Java新特性教程',
        //         'Java模块系统详解教程',
        //         '函数式编程深入教程',
        //     ],
        // },
        {
            text: 'Java 网络编程',
            prefix: '网络编程/',
            items: [
                'JavaWeb开发教程',
                'Java数据库编程教程',
                'Java网络编程教程',
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
        // {
        //     text: 'Java 并发编程',
        //     prefix: 'juc/',
        //     items: [
        //         'Java并发工具类详解教程',
        //         '锁机制详解教程',
        //     ],
        // },
        // {
        //     text: 'Java 虚拟机',
        //     prefix: 'jvm/',
        //     items: [
        //         'Java内存模型详解',
        //         'JVM深入教程',
        //         'JVM调优详解',
        //     ],
        // },
        // {
        //     text: 'Java 容器化',
        //     prefix: '容器化/',
        //     items: [
        //         'Docker容器化详解',
        //     ],
        // },
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
    dir: 'java/框架技术',
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

// SpringBoot 配置
const zhSpringBoot = defineNoteConfig({
    dir: 'java/SpringBoot',
    link: '/SpringBoot',
    sidebar: [
        {
            text: 'SpringBoot 核心',
            prefix: '',
            items: [
                'SpringBoot核心基础详解',
                'SpringSecurity详解',
                'SpringBoot全局异常处理',
                'SpringBoot统一接口封装',

                'SpringBoot常见注解',
                'SpringSecurity详解'
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
                'RabbitMQ详解',
                'Kafka详解',
                'Nacos详解',
                'Sentinel详解',
                'Bus详解',
                'OpenFeign详解',
                'Gateway详解',
                'Sleuth详解',
            ],
        },
    ],
})

// 前端技术配置
// const zhFrontend = defineNoteConfig({
//     dir: 'notes/前端',
//     link: '/frontend',
//     sidebar: [
//         {
//             text: '前端基础',
//             prefix: '',
//             items: [
//                 'html',
//                 'css',
//                 'js',
//                 'TypeScript详解',
//                 'Vue3详解',
//                 'vue',
//             ],
//         },
//         {
//             text: '移动端开发',
//             prefix: '',
//             items: [
//                 '移动端跨平台详解',
//             ],
//         },
//     ],
// })

// 数据库配置
// const zhDatabase = defineNoteConfig({
//     dir: 'notes/数据库',
//     link: '/database',
//     sidebar: [
//         {
//             text: '关系型数据库',
//             prefix: '关系型/',
//             items: [
//                 'mysql',
//                 'MySQL性能优化详解',
//             ],
//         },
//         {
//             text: 'NoSQL 数据库',
//             prefix: 'NoSQL/',
//             items: [
//                 'Redis基础操作详解',
//                 'Redis高级特性详解',
//                 'mongoDB',
//                 'es',
//             ],
//         },
//     ],
// })

// 中间件配置
// const zhMiddleware = defineNoteConfig({
//     dir: 'notes/中间件',
//     link: '/middleware',
//     sidebar: [
//         {
//             text: '消息中间件',
//             prefix: '',
//             items: [
//                 'RabbitMQ',
//             ],
//         },
//     ],
// })

// AI 技术配置
// const zhAI = defineNoteConfig({
//     dir: 'notes/Ai',
//     link: '/ai',
//     sidebar: [
//         {
//             text: 'AI 技术',
//             prefix: '',
//             items: [
//                 'LangChain详解',
//                 'LangGraph4j详解',
//                 'prompt_工程师笔记（全面细致版） (1)',
//                 'SpringAi笔记',
//                 'SSE流式输出详解',
//             ],
//         },
//     ],
// })

// 数据结构与算法配置
// const zhAlgorithm = defineNoteConfig({
//     dir: 'notes/数据结构与算法',
//     link: '/algorithm',
//     sidebar: [
//         {
//             text: '数据结构与算法',
//             prefix: '',
//             items: [
//                 '数据结构详解',
//                 '算法详解',
//                 // 'LeetCode刷题指南',
//             ],
//         },
//     ],
// })

// 开发规范配置（包含设计模式和开发规范）
// const zhDevelopmentStandards = defineNoteConfig({
//     dir: 'notes/开发规范',
//     link: '/development-standards',
//     sidebar: [
//         {
//             text: '开发规范',
//             prefix: '',
//             items: [
//                 'Java设计模式教程',
//                 '阿里Java开发规范',
//                 '阿里前端开发规范',
//             ],
//         },
//     ],
// })

// 运维配置
// const zhDevOps = defineNoteConfig({
//     dir: 'notes/运维',
//     link: '/devops',
//     sidebar: [
//         {
//             text: '系统运维',
//             prefix: '',
//             items: [
//                 'Linux',
//                 'nginx',
//                 'Kubernetes详解',
//             ],
//         },
//     ],
// })

export const zhNotes = defineNotesConfig({
    dir: 'notes',
    link: '/',
    notes: [
        zhJava,
        zhSpring,
        zhSpringBoot,
        zhSpringCloud,
        // zhFrontend,
        // zhDatabase,
        // zhMiddleware,
        // zhAI,
        // zhAlgorithm,
        // zhDevelopmentStandards,
        // zhDevOps,
    ],
})

/* =================== locale: en-US ======================= */

const enDemoNote = defineNoteConfig({
    dir: 'en/notes/demo',
    link: '/en/demo',
    sidebar: ['', 'foo', 'bar'],
})

export const enNotes = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [enDemoNote],
})

