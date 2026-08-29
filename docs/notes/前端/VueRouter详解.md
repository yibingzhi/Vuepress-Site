---
tags:
  - 前端
  - Vue
  - Vue Router
  - 路由
title: VueRouter详解
createTime: 2026/08/29 16:00:00
permalink: /article/vue-router-guide/
---

::: tip 现行默认
Vue 3 项目统一使用 **vue-router 4**（`^4.x`），与 Vue 2 时代的 vue-router 3 API 有差异。本文以 Composition API + TypeScript 为准。
:::

## 一、安装与基础配置

```bash
pnpm add vue-router@4
```

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', requiresAuth: false },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
```

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <RouterView />
</template>
```

---

## 二、History 模式对比

| 模式 | API | URL 形态 | 部署注意 |
|------|-----|----------|----------|
| HTML5 History | `createWebHistory()` | `/user/123` | 需服务端 fallback 到 `index.html` |
| Hash | `createWebHashHistory()` | `/#/user/123` | 无需服务端配置，SEO 较差 |
| Memory | `createMemoryHistory()` | 无真实 URL | SSR / 测试环境 |

```typescript
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'

// 生产推荐 History
const router = createRouter({
  history: createWebHistory('/app/'), // 子路径部署时设置 base
  routes,
})
```

**Nginx fallback 示例：**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vite 开发服务器已内置 History fallback**，生产环境务必配置反向代理。

---

## 三、路由定义详解

### 3.1 静态路由

```typescript
{
  path: '/contact',
  name: 'Contact',
  component: () => import('@/views/ContactView.vue'),
  alias: '/reach-us',           // 别名，/reach-us 同样渲染
  props: { theme: 'light' },    // 静态 props 传给组件
}
```

### 3.2 动态参数

```typescript
{
  path: '/user/:id',
  name: 'UserDetail',
  component: () => import('@/views/UserDetail.vue'),
  props: true, // 将 params 作为 props 传入：{ id: string }
}

// 可选参数：/posts 与 /posts/vue-router 均匹配
{
  path: '/posts/:slug?',
  name: 'Post',
  component: () => import('@/views/PostView.vue'),
}

// 正则约束：仅匹配数字 id
{
  path: '/order/:orderId(\\d+)',
  name: 'Order',
  component: () => import('@/views/OrderView.vue'),
}
```

```vue
<!-- UserDetail.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 读取参数
const userId = route.params.id as string

function goEdit() {
  router.push({ name: 'UserEdit', params: { id: userId } })
}
</script>
```

### 3.3 查询参数与 hash

```typescript
router.push({
  path: '/search',
  query: { q: 'vue', page: '1' },
  hash: '#results',
})
// => /search?q=vue&page=1#results
```

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const keyword = computed(() => route.query.q as string | undefined)
</script>
```

### 3.4 命名视图（多 `<router-view>`）

```typescript
{
  path: '/dashboard',
  components: {
    default: () => import('@/views/DashboardMain.vue'),
    sidebar: () => import('@/views/DashboardSidebar.vue'),
    footer: () => import('@/views/DashboardFooter.vue'),
  },
}
```

```vue
<template>
  <RouterView name="sidebar" />
  <RouterView />
  <RouterView name="footer" />
</template>
```

---

## 四、嵌套路由

典型后台布局：外层 Layout 固定，内层 `<RouterView>` 切换内容区。

```typescript
{
  path: '/admin',
  component: () => import('@/layouts/AdminLayout.vue'),
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      redirect: { name: 'AdminDashboard' },
    },
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { title: '控制台' },
    },
    {
      path: 'users',
      name: 'AdminUsers',
      component: () => import('@/views/admin/Users.vue'),
      meta: { title: '用户管理' },
    },
    {
      path: 'users/:id',
      name: 'AdminUserDetail',
      component: () => import('@/views/admin/UserDetail.vue'),
      props: true,
    },
  ],
}
```

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <main>
      <!-- 子路由渲染点 -->
      <RouterView />
    </main>
  </div>
</template>
```

**注意：** 子路由 `path` 不要以 `/` 开头（除非要跳出父级），否则会从根路径匹配。

---

## 五、导航方式

### 5.1 声明式导航

```vue
<template>
  <RouterLink to="/">首页</RouterLink>
  <RouterLink :to="{ name: 'UserDetail', params: { id: '42' } }">
    用户 42
  </RouterLink>

  <!-- 自定义激活类名 -->
  <RouterLink
    to="/about"
    active-class="is-active"
    exact-active-class="is-exact-active"
  >
    关于
  </RouterLink>
</template>
```

### 5.2 编程式导航

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 常用
router.push('/login')
router.push({ name: 'Home' })
router.replace({ path: '/welcome' }) // 不留历史记录

// 前进后退
router.back()
router.forward()
router.go(-2)

// 解析目标（不跳转）
const resolved = router.resolve({ name: 'UserDetail', params: { id: '1' } })
console.log(resolved.href) // /user/1
```

### 5.3 导航失败处理

```typescript
const result = await router.push('/protected')
if (result) {
  // 导航被守卫拦截
  console.warn('Navigation aborted', result)
}
```

---

## 六、路由懒加载

```typescript
// ✅ 推荐：按路由切块，配合 Vite 魔法注释
const UserView = () => import(
  /* webpackChunkName: "user" */ '@/views/UserView.vue'
)

// 分组加载
const AdminModule = () => import(
  /* webpackChunkName: "admin" */ '@/views/admin/AdminModule.vue'
)
```

**按功能分包策略：**

```typescript
// router/modules/admin.ts
import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'reports',
        component: () => import('@/views/admin/Reports.vue'),
      },
    ],
  },
]

// router/index.ts
import { adminRoutes } from './modules/admin'
const routes = [...publicRoutes, ...adminRoutes]
```

**加载态与错误边界：**

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncPage = defineAsyncComponent({
  loader: () => import('@/views/HeavyPage.vue'),
  loadingComponent: () => import('@/components/PageSkeleton.vue'),
  errorComponent: () => import('@/components/PageLoadError.vue'),
  delay: 200,
  timeout: 15000,
})
</script>
```

---

## 七、导航守卫

### 7.1 全局前置守卫

```typescript
import { useAuthStore } from '@/stores/auth'

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // 设置页面标题
  document.title = `${to.meta.title ?? 'App'} | MyApp`

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
  next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.role && !auth.hasRole(to.meta.role as string)) {
    next({ name: 'Forbidden' })
    return
  }

  next()
})
```

::: warning Vue Router 4 推荐写法
`next()` 回调在 vue-router 4 中仍可用，但更推荐 **return 路由位置** 或 **return false** 中止导航：

```typescript
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
```
:::

### 7.2 全局解析与后置钩子

```typescript
// 在组件内守卫之前、异步组件解析之后
router.beforeResolve(async (to) => {
  if (to.meta.preload) {
    await prefetchData(to.params.id as string)
  }
})

router.afterEach((to, from, failure) => {
  if (!failure) {
    // 埋点、关闭 loading
    analytics.pageView(to.fullPath)
  }
})
```

### 7.3 路由独享守卫

```typescript
{
  path: '/billing',
  component: () => import('@/views/Billing.vue'),
  beforeEnter: (to, from) => {
    const auth = useAuthStore()
    if (!auth.hasSubscription) {
      return { name: 'Pricing' }
    }
  },
}
```

### 7.4 组件内守卫

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开前确认（如表单未保存）
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    return window.confirm('有未保存的更改，确定离开？')
  }
})

// 同组件复用、仅 params 变化时
onBeforeRouteUpdate(async (to) => {
  await loadUser(to.params.id as string)
})
</script>
```

---

## 八、Meta 与 TypeScript 增强

```typescript
// src/types/router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    role?: string
    keepAlive?: boolean
    layout?: 'default' | 'blank'
  }
}
```

```typescript
// 按 meta 选择布局
// App.vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

const route = useRoute()
const layout = computed(() =>
  route.meta.layout === 'blank' ? BlankLayout : DefaultLayout
)
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
```

---

## 九、KeepAlive 与路由缓存

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive :include="cachedViews">
      <component :is="Component" :key="route.name" />
    </KeepAlive>
  </RouterView>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedViews = ref<string[]>([])

watch(
  () => route.name,
  (name) => {
    if (route.meta.keepAlive && name && !cachedViews.value.includes(name as string)) {
      cachedViews.value.push(name as string)
    }
  },
  { immediate: true }
)
</script>
```

路由 `meta.keepAlive: true` 与组件 `defineOptions({ name: 'ListPage' })` 的 `name` 需与 `include` 一致。

---

## 十、Pinia 组合实战

路由守卫中直接使用 Pinia store 是常见模式；注意在 `pinia` 安装后再 `app.use(router)`，守卫内调用 `useAuthStore()` 即可。

```typescript
// stores/auth.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: string; roles: string[] } | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function hasRole(role: string) {
    return user.value?.roles.includes(role) ?? false
  }

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    token.value = data.token
    localStorage.setItem('token', data.token)
    user.value = data.user
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push({ name: 'Login' })
  }

  return { token, user, isLoggedIn, hasRole, login, logout }
})
```

```typescript
// api/http.ts — 与路由、Pinia 联动
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const http = axios.create({ baseURL: '/api' })

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    }
    return Promise.reject(error)
  }
)

export default http
```

**在组件内结合路由参数与 Store：**

```vue
<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cart = useCartStore()

watchEffect(() => {
  const productId = route.params.productId as string | undefined
  if (productId) {
    cart.loadProduct(productId)
  }
})
</script>
```

---

## 十一、动态路由与权限

登录后按角色注入路由，避免未授权菜单暴露。

```typescript
// router/dynamic.ts
import type { RouteRecordRaw } from 'vue-router'
import router from './index'

const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/ops',
    meta: { role: 'ops' },
    children: [
      {
        path: 'monitor',
        name: 'OpsMonitor',
        component: () => import('@/views/ops/Monitor.vue'),
      },
    ],
  },
]

export function setupDynamicRoutes(roles: string[]) {
  asyncRoutes.forEach((route) => {
    if (!route.meta?.role || roles.includes(route.meta.role as string)) {
      router.addRoute(route)
    }
  })
}

export function resetRouter() {
  // 移除动态路由需记录 name 后 removeRoute
  router.getRoutes().forEach((r) => {
    if (r.name && String(r.name).startsWith('Ops')) {
      router.removeRoute(r.name)
    }
  })
}
```

```typescript
// 登录成功后
const auth = useAuthStore()
await auth.login(form.username, form.password)
setupDynamicRoutes(auth.user!.roles)
router.push((route.query.redirect as string) || '/')
```

---

## 十二、滚动行为与过渡动画

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="route.meta.transition as string || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 十三、SSR 与 vue-router

Nuxt 3 内置文件路由；手写 SSR 时使用 `createMemoryHistory` 或 `createWebHistory` 配合服务端 `renderToString`。

```typescript
// entry-server.ts 片段
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from './routes'

export async function render(url: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  await router.push(url)
  await router.isReady()
  // ... render app with router
}
```

---

## 十四、测试

```typescript
// router.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router/routes'

describe('router', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    await router.push('/')
    await router.isReady()
  })

  it('redirects unauthenticated user to login', async () => {
    router.beforeEach((to) => {
      if (to.meta.requiresAuth) return '/login'
    })
    await router.push('/admin/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
```

---

## 十五、常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 刷新 404 | History 模式无 fallback | Nginx `try_files` 或 CDN 规则 |
| 动态路由添加后跳转无效 | 需使用 **name** 导航 | `router.push({ name: 'X' })` |
| 守卫死循环 | 未区分目标路由 | 检查 `to.name === 'Login'` |
| params 丢失 | 用 path 字符串跳转 | 改用 `name + params` |
| Pinia 报错 pinia 未激活 | 守卫在 app 外执行 | 确保 `app.use(pinia)` 先于路由 |

---

## 十六、生产检查清单

- [ ] 使用 `createWebHistory`，配置服务器 fallback
- [ ] 路由级懒加载，控制首屏 chunk 体积
- [ ] `meta` 类型扩展，统一 `title` / 权限字段
- [ ] 全局 `beforeEach` 鉴权 + 401 拦截器联动
- [ ] 动态路由 `addRoute` 与登出 `removeRoute` 成对
- [ ] `scrollBehavior` 处理锚点与浏览器后退
- [ ] 关键路径 Vitest + MemoryHistory 单测

---

## 参考

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Pinia 状态管理详解](/article/pinia-state-management/)
- [Vite 工程化详解](/article/vite-engineering/)
