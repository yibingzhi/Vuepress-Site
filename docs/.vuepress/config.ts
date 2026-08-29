import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'




export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  locales: {
    '/': {
      title: 'Yibz',
      lang: 'zh-CN',
      description: '',
    },
    // '/en/': {
    //   title: 'My Vuepress Site',
    //   lang: 'en-US',
    //   description: '',
    // },
  },

  bundler: viteBundler(),

  theme: plumeTheme({
    // 添加您的部署域名
    // hostname: 'https://your_site_url',

    plugins: {
      /**
       * Shiki 代码高亮
       * @see https://theme-plume.vuejs.press/config/plugins/code-highlight/
       */
      shiki: {
        languages: [
          'shell', 'bash', 'typescript', 'javascript', 'java', 'sql', 'xml', 'yaml',
          'json', 'python', 'lua', 'ini', 'properties', 'vue', 'html', 'css', 'groovy',
          'dockerfile', 'markdown', 'diff', 'http',
        ],
      },

      /**
       * 评论 comments
       * @see https://theme-plume.vuejs.press/guide/features/comments/
       */
      comment: {
        provider: "Giscus",
        comment: true,
        repo: 'yibingzhi/giscus',
        repoId: 'R_kgDONPFazg',
        category: 'Announcements',
        categoryId: 'DIC_kwDONPFazs4CkQLI',
        mapping: 'pathname',
        reactionsEnabled: true,
        inputPosition: 'top',
      },
    },
  }),
})
