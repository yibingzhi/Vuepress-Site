import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

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
const zhJava = defineNoteConfig({
  dir: 'java/SpringBoot',
  link: '/SpringBoot',


  sidebar: [
    {
      text: '原生',
      prefix: '',
      items:[
        {text:'介绍',link:'SpringBoot集成Mybatis',

        },
        'SpringBoot集成Redis',
      ],

    },


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
  ],
},)



export const zhNotes = defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [zhJava],
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

