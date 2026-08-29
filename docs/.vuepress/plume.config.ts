import { defineThemeConfig } from 'vuepress-theme-plume'
import { enNavbar, zhNavbar } from './navbar'
import { enNotes, zhNotes } from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: '1.jpg',
  docsRepo: 'https://github.com/yibingzhi/Vuepress-Site',
  docsDir: 'docs',
  docsBranch: 'master',

  appearance: true,
  footer: {
    message: 'Engineering notes · 橦栖云',
    copyright: '© 翌冰之',
  },

  social: [
    { icon: 'github', link: 'https://github.com/yibingzhi' },
  ],

  locales: {
    '/': {
      profile: {
        avatar: '1.jpg',
        name: '翌冰之',
        description: 'Java / 全栈工程笔记',
        circle: true,
      },

      navbar: zhNavbar,
      notes: zhNotes,
    },
    '/en/': {
      profile: {
        avatar: '1.jpg',
        name: 'Yibz',
        description: 'Engineering notes',
        circle: true,
      },

      navbar: enNavbar,
      notes: enNotes,
    },
  },
})
