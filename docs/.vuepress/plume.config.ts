import { defineThemeConfig } from 'vuepress-theme-plume'
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
