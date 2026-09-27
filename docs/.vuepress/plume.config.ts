import { defineCollection, defineThemeConfig } from 'vuepress-theme-plume'
import { enNavbar, zhNavbar } from './navbar'
import { enNotes, zhNotes } from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: '/mark.svg',
  docsRepo: 'https://github.com/yibingzhi/Vuepress-Site',
  docsDir: 'docs',
  docsBranch: 'master',

  appearance: true,

  // 新版主题不再自动生成 /blog/，需要显式声明文章集合。
  // permalink: false 保留每篇笔记自己的链接，避免把旧地址改掉。
  collections: [
    defineCollection({
      type: 'post',
      dir: 'notes',
      title: '笔记',
      link: '/blog/',
      linkPrefix: '/article/',
      tags: true,
      tagsLink: '/blog/tags/',
      archives: true,
      archivesLink: '/blog/archives/',
      autoFrontmatter: {
        permalink: false,
      },
      exclude: ['**/README.md'],
    }),
  ],
  footer: {
    message: '橦云异梦',
    copyright: '翌冰之',
  },

  social: [
    { icon: 'github', link: 'https://github.com/yibingzhi' },
  ],

  locales: {
    '/': {
      profile: {
        avatar: '/1.jpg',
        name: '翌冰之',
        description: '橦云异梦 · 工程笔记',
        circle: true,
        location: '',
        organization: '',
      },

      navbar: zhNavbar,
      notes: zhNotes,
    },
    '/en/': {
      profile: {
        avatar: 'https://theme-plume.vuejs.press/plume.png',
        name: 'My Vuepress Site',
        description: '',
        // circle: true,
        // location: '',
        // organization: '',
      },

      navbar: enNavbar,
      notes: enNotes,
    },
  },
})
