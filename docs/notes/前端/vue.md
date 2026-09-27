---
title: Vue 2 历史对照
createTime: 2024/11/16 21:14:00
permalink: /article/vz5a9xri/
tags:
  - 前端
  - Vue
  - 历史
---

::: warning 已过时 · 仅作历史对照
Vue 2 已于 **2023-12-31** 结束官方维护。新项目请直接学习 **[Vue3详解](./Vue3详解.md)**（Composition API + `createApp`）。

下文保留常见 Vue 2 写法，方便读旧项目时对照，**不要照抄到新工程**。
:::

## Vue 2 → Vue 3 速查

| Vue 2（旧） | Vue 3（现行） |
|-------------|---------------|
| `new Vue({ el })` | `createApp(...).mount()` |
| `Vue.component` | `app.component` 或 SFC |
| Options API 为主 | `<script setup>` + Composition API |
| Vuex | Pinia |
| `@vue/cli` | `npm create vue@latest`（Vite） |
| CDN `vue@2` | CDN `vue@3` |

## 创建应用（对照）

**Vue 2：**

```html
<script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
<div id="app">{{ message }}</div>
<script>
  new Vue({
    el: '#app',
    data: { message: 'Hello, Vue 2' }
  })
</script>
```

**Vue 3（推荐）：**

```html
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
<div id="app">{{ message }}</div>
<script>
  const { createApp, ref } = Vue
  createApp({
    setup() {
      const message = ref('Hello, Vue 3')
      return { message }
    }
  }).mount('#app')
</script>
```

## 旧项目迁移提示

1. 用官方 [Migration Build](https://v3-migration.vuejs.org/) 做兼容层，再逐步改 Composition API。
2. 状态从 Vuex 迁到 Pinia；路由用 `vue-router@4`。
3. 构建从 webpack/vue-cli 迁到 Vite。

完整现行教程 → **[Vue3详解](./Vue3详解.md)**。
