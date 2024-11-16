import { defineNavbarConfig } from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  // { text: '归档', link: '/blog/archives/' },

  {
    text: '前端',
    items: [
      {text: 'html', link: '/notes/前端/html.md'},
      { text: 'css', link: '/notes/前端/css.md' },
      { text: 'JavaScript', link: '/notes/前端/js.md' },
        { text: 'Vue', link: '/notes/前端/vue.md' },


]
  },
  {
    text: 'java',
    items: [
      { text: 'java语法', link: '/notes/java/java综合语法.md' },
      { text: 'SpringBoot集成', link: '/notes/java/SpringBoot/SpringBoot集成Mybatis.md' }



    ]
  },

  {
    text: '数据库',
    items: [
        { text: '安装配置', link: '/notes/sql/安装/mysql安装.md' },
      { text: 'mysql语法', link: '/notes/sql/mysql.md' },
      { text: 'redis', link: '/notes/sql/redis.md' },
      { text: 'mongoDB', link: '/notes/sql/mongoDB.md' },
      { text: 'Elasticsearch', link: '/notes/sql/es.md' },



    ]
  },
])

export const enNavbar = defineNavbarConfig([
  { text: 'Home', link: '/en/' },
  { text: 'Blog', link: '/en/blog/' },
  { text: 'Tags', link: '/en/blog/tags/' },
  { text: 'Archives', link: '/en/blog/archives/' },
  {
    text: 'Notes',
    items: [{ text: 'Demo', link: '/en/notes/demo/README.md' }]
  },
])

