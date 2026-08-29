---
tags:
  - 前端
  - Vue3
  - Vue
  - 框架
title: Vue3详解
createTime: 2024/11/19 11:15:30
permalink: /article/vue3-detailed/
---

::: tip 现行默认
新项目用 `npm create vue@latest`（Vite）+ `<script setup>` + **Pinia**。Vue 2 写法见 [Vue 2 历史对照](./vue.md)。
:::

### 一、Vue3 核心特性

#### 1. Composition API

**Vue3** 引入了 **Composition API**，提供了一种更灵活的组织组件逻辑的方式。

**核心优势：**
- **逻辑复用**：更好的逻辑复用和组合
- **类型推导**：更好的 TypeScript 支持
- **逻辑分离**：按功能组织代码，而不是按选项
- **性能优化**：更精确的响应式追踪

#### 2. 响应式系统

**Vue3 使用 Proxy 替代 Object.defineProperty：**

```javascript
// Vue2 的响应式系统
const data = {
  message: 'Hello'
}
Object.defineProperty(data, 'message', {
  get() {
    return this._message
  },
  set(value) {
    this._message = value
    // 触发更新
  }
})

// Vue3 的响应式系统
const data = reactive({
  message: 'Hello'
})
```

### 二、Composition API 基础

#### 1. setup 函数

**setup 函数是 Composition API 的入口：**

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="increment">+1</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'Counter',
  setup() {
    // 响应式数据
    const count = ref(0)
    const state = reactive({
      message: 'Hello Vue3'
    })

    // 方法
    const increment = () => {
      count.value++
    }

    // 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 返回模板需要的数据和方法
    return {
      count,
      message: state.message,
      increment
    }
  }
}
</script>
```

#### 2. 响应式 API

**ref 和 reactive：**

```javascript
import { ref, reactive, computed, watch } from 'vue'

// ref - 用于基本类型
const count = ref(0)
const name = ref('Vue3')
const isActive = ref(false)

// reactive - 用于对象
const user = reactive({
  name: 'John',
  age: 25,
  address: {
    city: 'Beijing',
    country: 'China'
  }
})

// computed - 计算属性
const doubleCount = computed(() => count.value * 2)
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// watch - 监听器
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})
```

### 三、Vue3 生命周期

#### 1. 生命周期钩子

**Vue3 的生命周期钩子：**

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from 'vue'

export default {
  setup() {
    // 组件挂载前
    onBeforeMount(() => {
      console.log('组件挂载前')
    })

    // 组件挂载后
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 组件更新前
    onBeforeUpdate(() => {
      console.log('组件更新前')
    })

    // 组件更新后
    onUpdated(() => {
      console.log('组件已更新')
    })

    // 组件卸载前
    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })

    // 组件卸载后
    onUnmounted(() => {
      console.log('组件已卸载')
    })

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error('捕获到错误:', err)
      return false // 阻止错误继续传播
    })

    // 渲染追踪
    onRenderTracked((event) => {
      console.log('追踪到响应式依赖:', event)
    })

    // 渲染触发
    onRenderTriggered((event) => {
      console.log('触发重新渲染:', event)
    })
  }
}
```

#### 2. 生命周期对比

**Vue2 vs Vue3 生命周期：**

```javascript
// Vue2 选项式 API
export default {
  beforeCreate() {
    // 实例创建前
  },
  created() {
    // 实例创建后
  },
  beforeMount() {
    // 挂载前
  },
  mounted() {
    // 挂载后
  },
  beforeUpdate() {
    // 更新前
  },
  updated() {
    // 更新后
  },
  beforeDestroy() {
    // 销毁前
  },
  destroyed() {
    // 销毁后
  }
}

// Vue3 Composition API
import { onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      // 挂载后
    })
    
    onUnmounted(() => {
      // 卸载后
    })
  }
}
```

### 四、组件通信

#### 1. Props 和 Emits

**父组件向子组件传递数据：**

```vue
<!-- 父组件 -->
<template>
  <ChildComponent 
    :title="title" 
    :user="user"
    @update-title="handleUpdateTitle"
    @user-change="handleUserChange"
  />
</template>

<script>
import { ref, reactive } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: { ChildComponent },
  setup() {
    const title = ref('Vue3 Tutorial')
    const user = reactive({
      name: 'John',
      age: 25
    })

    const handleUpdateTitle = (newTitle) => {
      title.value = newTitle
    }

    const handleUserChange = (newUser) => {
      Object.assign(user, newUser)
    }

    return {
      title,
      user,
      handleUpdateTitle,
      handleUserChange
    }
  }
}
</script>
```

**子组件接收和发送事件：**

```vue
<!-- 子组件 -->
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ user.name }} - {{ user.age }}</p>
    <button @click="updateTitle">更新标题</button>
    <button @click="updateUser">更新用户</button>
  </div>
</template>

<script>
import { defineProps, defineEmits } from 'vue'

export default {
  // 定义 props
  props: {
    title: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  },

  // 定义 emits
  emits: ['update-title', 'user-change'],

  setup(props, { emit }) {
    const updateTitle = () => {
      emit('update-title', 'New Title')
    }

    const updateUser = () => {
      emit('user-change', {
        name: 'Jane',
        age: 30
      })
    }

    return {
      updateTitle,
      updateUser
    }
  }
}
</script>
```

#### 2. Provide/Inject

**跨层级组件通信：**

```vue
<!-- 祖先组件 -->
<template>
  <div>
    <h1>{{ theme }}</h1>
    <ChildComponent />
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: { ChildComponent },
  setup() {
    const theme = ref('dark')
    const user = ref({
      name: 'John',
      role: 'admin'
    })

    // 提供数据给后代组件
    provide('theme', theme)
    provide('user', user)
    provide('updateTheme', (newTheme) => {
      theme.value = newTheme
    })

    return {
      theme
    }
  }
}
</script>
```

**后代组件注入数据：**

```vue
<!-- 后代组件 -->
<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <p>用户: {{ user.name }}</p>
    <button @click="changeTheme">切换主题</button>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  setup() {
    // 注入数据
    const theme = inject('theme')
    const user = inject('user')
    const updateTheme = inject('updateTheme')

    const changeTheme = () => {
      updateTheme(theme.value === 'dark' ? 'light' : 'dark')
    }

    return {
      theme,
      user,
      changeTheme
    }
  }
}
</script>
```

### 五、响应式系统详解

#### 1. ref 和 reactive

**ref 的使用：**

```javascript
import { ref, isRef, unref } from 'vue'

// 基本类型使用 ref
const count = ref(0)
const name = ref('Vue3')
const isActive = ref(false)

// 访问和修改值
console.log(count.value) // 0
count.value = 1

// 检查是否为 ref
console.log(isRef(count)) // true
console.log(isRef(0)) // false

// 解包 ref
const unwrappedCount = unref(count) // 等同于 count.value
```

**reactive 的使用：**

```javascript
import { reactive, isReactive, toRefs } from 'vue'

// 对象使用 reactive
const state = reactive({
  count: 0,
  name: 'Vue3',
  user: {
    name: 'John',
    age: 25
  }
})

// 直接修改属性
state.count = 1
state.user.name = 'Jane'

// 检查是否为 reactive 对象
console.log(isReactive(state)) // true

// 解构 reactive 对象
const { count, name } = toRefs(state)
// 现在 count 和 name 是 ref，保持响应式
```

#### 2. computed 和 watch

**computed 计算属性：**

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    const names = value.split(' ')
    firstName.value = names[0]
    lastName.value = names[1] || ''
  }
})

console.log(fullName.value) // "John Doe"
fullNameWritable.value = 'Jane Smith'
```

**watch 监听器：**

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue3')

// 监听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count changed: ${oldValue} -> ${newValue}`)
})

// 监听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${oldCount} -> ${newCount}`)
  console.log(`name: ${oldName} -> ${newName}`)
})

// 深度监听对象
const user = ref({
  name: 'John',
  age: 25
})

watch(user, (newUser, oldUser) => {
  console.log('user changed:', newUser)
}, { deep: true })

// watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`)
})
```

### 六、组件组合

#### 1. 组合函数 (Composables)

**创建可复用的逻辑：**

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubleCount = computed(() => count.value * 2)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}
```

**使用组合函数：**

```vue
<template>
  <div>
    <h2>计数器: {{ count }}</h2>
    <p>双倍: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script>
import { useCounter } from './useCounter'

export default {
  setup() {
    const { count, doubleCount, increment, decrement, reset } = useCounter(10)
    
    return {
      count,
      doubleCount,
      increment,
      decrement,
      reset
    }
  }
}
</script>
```

#### 2. 异步组合函数

**处理异步逻辑：**

```javascript
// useAsync.js
import { ref, onMounted } from 'vue'

export function useAsync(asyncFn) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn(...args)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}
```

**使用异步组合函数：**

```vue
<template>
  <div>
    <button @click="fetchData" :disabled="loading">
      {{ loading ? '加载中...' : '获取数据' }}
    </button>
    
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="data">
      <h3>用户信息:</h3>
      <p>姓名: {{ data.name }}</p>
      <p>邮箱: {{ data.email }}</p>
    </div>
  </div>
</template>

<script>
import { useAsync } from './useAsync'

export default {
  setup() {
    const fetchUser = async (id) => {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }
      return response.json()
    }

    const { data, loading, error, execute: fetchData } = useAsync(fetchUser)

    return {
      data,
      loading,
      error,
      fetchData: () => fetchData(1)
    }
  }
}
</script>
```

### 七、模板语法增强

#### 1. v-model 增强

**Vue3 的 v-model：**

```vue
<template>
  <!-- 基本用法 -->
  <input v-model="message" />
  
  <!-- 自定义组件 v-model -->
  <CustomInput v-model="title" />
  
  <!-- 多个 v-model -->
  <UserForm
    v-model:name="user.name"
    v-model:email="user.email"
    v-model:age="user.age"
  />
  
  <!-- 自定义修饰符 -->
  <input v-model.trim="message" />
  <input v-model.number="age" />
  <input v-model.lazy="message" />
</template>

<script>
import { ref, reactive } from 'vue'
import CustomInput from './CustomInput.vue'
import UserForm from './UserForm.vue'

export default {
  components: { CustomInput, UserForm },
  setup() {
    const message = ref('')
    const title = ref('')
    const user = reactive({
      name: '',
      email: '',
      age: 0
    })

    return {
      message,
      title,
      user
    }
  }
}
</script>
```

#### 2. 自定义组件 v-model

```vue
<!-- CustomInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script>
```

### 八、性能优化

#### 1. 响应式优化

**shallowRef 和 shallowReactive：**

```javascript
import { ref, shallowRef, reactive, shallowReactive } from 'vue'

// 深层响应式
const deepRef = ref({
  nested: {
    value: 'deep'
  }
})

// 浅层响应式
const shallowRef = shallowRef({
  nested: {
    value: 'shallow'
  }
})

// 深层响应式对象
const deepReactive = reactive({
  nested: {
    value: 'deep'
  }
})

// 浅层响应式对象
const shallowReactive = shallowReactive({
  nested: {
    value: 'shallow'
  }
})
```

#### 2. 组件优化

**异步组件：**

```javascript
// 异步组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

**组件缓存：**

```vue
<template>
  <div>
    <keep-alive :include="['UserList', 'UserDetail']">
      <component :is="currentComponent" />
    </keep-alive>
  </div>
</template>
```

### 九、TypeScript 支持

#### 1. 类型定义

```typescript
// 组件 Props 类型
interface UserProps {
  name: string
  age: number
  email?: string
}

// 组件 Emits 类型
interface UserEmits {
  (e: 'update', user: User): void
  (e: 'delete', id: number): void
}

// 组合函数类型
interface UseCounterReturn {
  count: Ref<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(initialValue = 0): UseCounterReturn {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  return {
    count,
    increment,
    decrement,
    reset
  }
}
```

#### 2. 组件类型

```vue
<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  emits: {
    update: (user: User) => true,
    delete: (id: number) => true
  },
  
  setup(props, { emit }) {
    const localCount = ref(props.count)
    
    const updateUser = (user: User) => {
      emit('update', user)
    }
    
    const deleteUser = (id: number) => {
      emit('delete', id)
    }
    
    return {
      localCount,
      updateUser,
      deleteUser
    }
  }
})
</script>
```

### 十、最佳实践

#### 1. 代码组织

```javascript
// 按功能组织代码
export default {
  setup() {
    // 1. 响应式数据
    const count = ref(0)
    const user = reactive({
      name: '',
      email: ''
    })

    // 2. 计算属性
    const doubleCount = computed(() => count.value * 2)
    const fullName = computed(() => `${user.firstName} ${user.lastName}`)

    // 3. 方法
    const increment = () => count.value++
    const updateUser = (newUser) => Object.assign(user, newUser)

    // 4. 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 5. 监听器
    watch(count, (newValue) => {
      console.log('count changed:', newValue)
    })

    // 6. 返回模板需要的数据
    return {
      count,
      user,
      doubleCount,
      fullName,
      increment,
      updateUser
    }
  }
}
```

#### 2. 性能优化

```javascript
// 使用 shallowRef 优化大对象
const largeObject = shallowRef({
  // 大量数据
})

// 使用 markRaw 标记非响应式对象
import { markRaw } from 'vue'

const staticObject = markRaw({
  // 静态数据
})

// 使用 toRef 优化 props 访问
import { toRef } from 'vue'

export default {
  props: ['user'],
  setup(props) {
    // 保持响应式
    const userName = toRef(props, 'user')
    
    return {
      userName
    }
  }
}
```

---

### 总结

Vue3 通过 Composition API 提供了更灵活、更强大的组件开发方式：

**核心优势：**

1. **逻辑复用**：通过组合函数实现更好的逻辑复用
2. **类型安全**：更好的 TypeScript 支持
3. **性能优化**：更精确的响应式追踪和更好的性能
4. **逻辑组织**：按功能组织代码，提高可维护性
5. **开发体验**：更好的开发工具支持

**关键要点：**

1. **响应式系统**：使用 ref 和 reactive 管理状态
2. **生命周期**：使用 onMounted 等钩子函数
3. **组件通信**：Props、Emits、Provide/Inject
4. **组合函数**：创建可复用的逻辑
5. **性能优化**：合理使用 shallowRef、异步组件等

通过合理使用 Vue3 的特性，可以构建出高效、可维护的现代化前端应用。
