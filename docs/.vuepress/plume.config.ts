import { defineCollection, defineThemeConfig } from 'vuepress-theme-plume'
import { enNavbar, zhNavbar } from './navbar'
import { enNotes, zhNotes } from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: '1.jpg',
  // your git repo url
  docsRepo: '',
  docsDir: 'docs',

  appearance: true,

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

  social: [
    { icon: 'github', link: 'https://github.com/yibingzhi' },
  ],

  locales: {
    '/': {
      profile: {
        avatar: '1.jpg',
        name: '翌冰之',
        description: '',
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
