import {defineNoteConfig, defineNotesConfig} from 'vuepress-theme-plume'

/* =================== locale: zh-CN ======================= */

// const zhDemoNote = defineNoteConfig({
//   dir: 'demo',
//   link: '/demo',
//   sidebar: ['', 'foo', 'bar'],
// },)
// const zhSpringBootNote = defineNoteConfig({
//   dir: 'SpringBoot',
//   link: '/SpringBoot',
//   sidebar: ['', 'SpringBoot集成ElasticSearch'
//   ],
// },)
const zhJava = defineNoteConfig(
    {
        dir: 'java/SpringBoot',
        link: '/SpringBoot',
        sidebar: [
            {
                text: 'SpringBoot集成',
                prefix: '',
                items: [
                    'SpringBoot全局异常处理',
                    'SpringBoot统一接口封装',
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
                    'SpringBoot集成Redis',
                ],
            },

        ],
    },
)
const zhJavaCollection = defineNoteConfig(
    {
        dir: 'java/JavaCollection',
        link: '/JavaCollection',
        sidebar: [
            '用法示例',
            {
                text: 'java集合类详解',
                prefix: '',
                items: [
                    'ArrayList详解',
                    'HashSet & HashMap详解',
                    'Iterator详解',
                    'LinkedHahSet&LinkedMap详解',
                    'LinkedList详解',
                    'PriorityQueue详解',
                    'Stack & Queue详解',
                    'TreeSet&TreeMap详解',
                    'WeakHashMap详解',
                ],

            },
        ],
    },
)

export const zhNotes = defineNotesConfig({
    dir: 'notes',
    link: '/',
    notes: [zhJava, zhJavaCollection],
})


/* =================== locale: en-US ======================= */

const enDemoNote = defineNoteConfig({
    dir: 'demo',
    link: '/demo',
    sidebar: ['', 'foo', 'bar'],
})
//
export const enNotes = defineNotesConfig({
    dir: 'en/notes',
    link: '/en/',
    notes: [enDemoNote],
})

