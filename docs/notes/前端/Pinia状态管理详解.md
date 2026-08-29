---
tags:
  - 前端
  - Pinia
  - Vue3
  - 状态管理
title: Pinia状态管理详解
createTime: 2026/08/29 15:00:00
permalink: /article/pinia-state-management/
---

::: tip 现行默认
Vue 3 官方推荐 **Pinia** 替代 Vuex。新项目勿再引入 Vuex 4。
:::

## 一、为什么 Pinia 优于 Vuex

| 对比项 | Pinia | Vuex 4 |
|--------|-------|--------|
| API 设计 | 简洁，无 mutations | mutations + actions 分离 |
| TypeScript | 原生友好，无需额外封装 | 类型推导繁琐 |
| 模块化 | 天然多 store，无嵌套 modules | 需 modules 嵌套 |
| DevTools | 完整支持 | 完整支持 |
| 体积 | ~1KB | 更大 |
| Vue 2 支持 | 通过插件 | 原生支持 |

Pinia 去掉了 mutations，异步与同步逻辑统一在 `actions` 中处理，心智负担更低。

---

## 二、安装与注册

```bash
npm install pinia
```

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

---

## 三、Setup Store（推荐）

Composition API 风格，与 `<script setup>` 天然契合。

```typescript
// stores/counter.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('Counter')

  // getters
  const doubleCount = computed(() => count.value * 2)

  // actions
  function increment() {
    count.value++
  }

  async function fetchCount() {
    const res = await fetch('/api/count')
    count.value = await res.json()
  }

  return { count, name, doubleCount, increment, fetchCount }
})
```

组件中使用：

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store)

// 直接解构 actions（无需 storeToRefs）
const { increment } = store
</script>
```

::: warning 注意
响应式 state/getters 必须用 `storeToRefs` 解构，否则会丢失响应性。actions 可直接解构。
:::

---

## 四、Options Store

类 Vuex 写法，适合习惯 Options API 的团队。

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  id: number | null
  name: string
  token: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    name: '',
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => state.name || '游客',
  },

  actions: {
  async login(username: string, password: string) {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      this.token = data.token
      this.name = data.name
      this.id = data.id
    },

    logout() {
      this.id = null
      this.name = ''
      this.token = ''
    },
  },
})
```

---

## 五、State / Getters / Actions 详解

### 1. 修改 State

```typescript
// 直接修改
store.count++

// 批量修改
store.$patch({ count: 10, name: 'new' })

// 函数式 patch
store.$patch((state) => {
  state.items.push({ id: 1 })
})
```

### 2. 重置 State

```typescript
store.$reset() // 仅 Options Store 有效
```

Setup Store 需自行实现 reset 方法。

### 3. 订阅变化

```typescript
store.$subscribe((mutation, state) => {
  console.log(mutation.type, mutation.storeId)
})

store.$onAction(({ name, args, after, onError }) => {
  after(() => console.log(`action ${name} 完成`))
})
```

---

## 六、持久化（简要）

Pinia 本身不提供持久化，常用 `pinia-plugin-persistedstate`：

```bash
npm install pinia-plugin-persistedstate
```

```typescript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({ token: '', name: '' }),
  persist: {
    key: 'user-store',
    paths: ['token'], // 仅持久化 token
  },
})
```

---

## 七、在组件外使用 Store

路由守卫、axios 拦截器等非组件场景：

```typescript
// utils/auth.ts
import { useUserStore } from '@/stores/user'

export function getToken() {
  const userStore = useUserStore()
  return userStore.token
}
```

::: warning 注意
必须在 `app.use(pinia)` **之后** 调用 `useStore()`，否则会报错。
:::

在 `main.ts` 中可先创建 pinia 实例再导出：

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
export const pinia = createPinia()

// router/index.ts
import { pinia } from '@/stores'
import { useUserStore } from '@/stores/user'

router.beforeEach((to) => {
  const userStore = useUserStore(pinia)
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return '/login'
  }
})
```

---

## 八、TypeScript 技巧

### 1. 定义 State 类型

```typescript
interface CartItem {
  id: number
  name: string
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  return { items }
})
```

### 2. 导出 Store 类型

```typescript
export const useCartStore = defineStore('cart', { ... })

export type CartStore = ReturnType<typeof useCartStore>
```

### 3. Setup Store 自动推导

Setup Store 的返回值类型会被自动推导，通常无需手动标注 getters/actions 类型。

---

## 九、模块拆分策略

按业务域拆分，避免单一巨型 store：

```
stores/
├── index.ts          # pinia 实例导出
├── modules/
│   ├── user.ts       # 用户认证
│   ├── cart.ts       # 购物车
│   ├── app.ts        # 全局 UI 状态（主题、侧边栏）
│   └── permission.ts # 权限路由
```

### app store 示例

```typescript
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, theme, toggleSidebar }
})
```

### 跨 Store 调用

```typescript
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  async function checkout() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }
    // 结算逻辑...
  }

  return { items, checkout }
})
```

---

## 十、与 Vuex 迁移对照

| Vuex | Pinia |
|------|-------|
| `state` | `state` / `ref` |
| `getters` | `getters` / `computed` |
| `mutations` | 直接修改 / `$patch` |
| `actions` | `actions` |
| `mapState` | `storeToRefs` |
| `mapActions` | 直接解构 actions |

---

## 小结

- Pinia 是 Vue 3 官方状态管理方案，API 更简洁、TS 更友好
- 推荐 Setup Store + `<script setup>` 组合
- 组件外用 store 需传入 pinia 实例
- 按业务域拆分 store，配合 `pinia-plugin-persistedstate` 做持久化
