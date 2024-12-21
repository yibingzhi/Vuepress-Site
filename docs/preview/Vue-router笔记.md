
# Vue Router 学习笔记

## 一、Vue Router 简介
Vue Router 是 Vue.js 官方的路由管理器，它与 Vue.js 核心深度集成，能够轻松地实现单页面应用（SPA）中的页面导航和路由功能。通过 Vue Router，我们可以定义不同的路由路径，将它们映射到对应的 Vue 组件，从而实现页面之间的无缝切换和状态管理。

## 二、基本使用

### 1. 安装
使用 npm 或 yarn 安装 Vue Router：
```
npm install vue-router@4
// 或者
yarn add vue-router@4
```

### 2. 创建路由实例
在项目的 `src` 目录下创建一个 `router.js` 文件（文件名可自定义），用于配置路由。首先导入 `createRouter` 和 `createWebHistory`（用于浏览器的路由模式）函数，然后定义路由数组 `routes`，每个路由对象包含 `path`（路径）、`name`（路由名称，可选但推荐使用）和 `component`（对应的组件）等属性。最后使用 `createRouter` 创建路由实例并导出。
```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 3. 在 Vue 应用中使用路由
在 `main.js` 文件中，导入创建好的路由实例，并使用 `app.use(router)` 将其挂载到 Vue 应用实例上。
```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

### 4. 路由视图与导航
在 `App.vue` 组件中，使用 `<router-view>` 标签来显示当前路由对应的组件内容。同时，可以使用 `<router-link>` 组件来创建导航链接，`to` 属性指定目标路由的路径或名称。
```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>
```

## 三、路由参数

### 1. 动态路由参数
可以在路由路径中定义动态参数，使用冒号 `:` 开头。在组件中通过 `$route.params` 对象获取参数值。例如：
```javascript
// 路由配置
const routes = [
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
];

// User 组件中获取参数
export default {
  mounted() {
    const userId = this.$route.params.id;
    // 可以根据 userId 进行数据获取等操作
  }
};
```

### 2. 查询参数
除了动态路由参数，还可以使用查询参数传递数据。在导航时，通过在 `to` 属性中添加查询字符串的形式传递，在组件中通过 `$route.query` 对象获取。例如：
```vue
<router-link :to="{ path: '/search', query: { keyword: 'vue' } }">Search</router-link>

// 在 Search 组件中
export default {
  mounted() {
    const keyword = this.$route.query.keyword;
  }
};
```

## 四、路由导航守卫

### 1. 全局前置守卫
可以使用全局前置守卫在路由跳转前进行权限验证、日志记录等操作。通过 `router.beforeEach` 方法注册全局前置守卫，它接收一个回调函数，回调函数有三个参数：`to`（即将要进入的路由对象）、`from`（当前离开的路由对象）和 `next`（用于控制路由跳转的函数）。例如：
```javascript
router.beforeEach((to, from, next) => {
  // 检查用户是否登录，如果未登录且要进入需要登录的页面，则跳转到登录页面
  const isLoggedIn = checkLoginStatus();
  if (!isLoggedIn && to.meta.requiresAuth) {
    next('/login');
  } else {
    next();
  }
});
```

### 2. 全局后置守卫
全局后置守卫在路由跳转完成后执行，可以用于页面标题的更新等操作。使用 `router.afterEach` 方法注册，它接收两个参数：`to` 和 `from`。例如：
```javascript
router.afterEach((to, from) => {
  document.title = to.meta.title || 'Default Title';
});
```

### 3. 路由独享守卫
可以在单个路由配置上定义路由独享守卫，`beforeEnter` 钩子函数只在进入该路由时触发。例如：
```javascript
const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 特定于 /admin 路由的权限验证
      if (isAdminLoggedIn()) {
        next();
      } else {
        next('/login');
      }
    }
  }
];
```

### 4. 组件内守卫
在 Vue 组件内，可以定义 `beforeRouteEnter`、`beforeRouteUpdate` 和 `beforeRouteLeave` 守卫。`beforeRouteEnter` 在组件实例创建之前调用，不能访问组件实例 `this`；`beforeRouteUpdate` 在当前路由改变且组件被复用时调用；`beforeRouteLeave` 在离开当前组件路由时调用。例如：
```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // 在这里不能使用 this，因为组件实例还未创建
    next((vm) => {
      // 在这里可以通过 vm 访问组件实例
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 可以在这里根据路由参数变化更新组件数据
    next();
  },
  beforeRouteLeave(to, from, next) {
    // 可以在这里进行一些离开前的确认操作，如提示用户是否保存数据等
    const confirmLeave = confirm('Are you sure you want to leave?');
    if (confirmLeave) {
      next();
    } else {
      next(false);
    }
  }
};
```

## 五、路由懒加载
为了优化应用的初始加载性能，可以使用路由懒加载。将组件定义改为使用 `import()` 函数动态导入组件，这样只有在访问到对应的路由时才会加载组件代码。例如：
```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
];
```

## 六、嵌套路由
可以在路由配置中定义嵌套路由，实现复杂的页面布局和子路由功能。例如，在一个 `/dashboard` 路由下有多个子页面：
```javascript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    children: [
      {
        path: 'profile',
        name: 'DashboardProfile',
        component: DashboardProfile
      },
      {
        path: 'settings',
        name: 'DashboardSettings',
        component: DashboardSettings
      }
    ]
  }
];
```
在 `Dashboard` 组件中，需要使用 `<router-view>` 来显示子路由对应的组件内容。

## 七、命名视图
有时候需要在同一个路由下展示多个视图，可以使用命名视图。在路由配置中，使用 `components` 属性（注意是复数形式），并为每个视图指定一个名称和对应的组件。例如：
```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar
    }
  }
];
```
在 `App.vue` 中，使用 `<router-view>` 和 `<router-view name="sidebar">` 来分别显示对应的视图组件。

## 八、路由模式
Vue Router 支持两种路由模式：`hash` 模式和 `history` 模式。
- `hash` 模式：默认模式，使用 URL 的哈希部分（`#`）来表示路由路径。例如 `http://localhost:8080/#/about`。这种模式兼容性好，在不支持 HTML5 History API 的浏览器中也能正常工作。
- `history` 模式：使用 HTML5 History API，使 URL 看起来更像普通的 URL，没有 `#` 符号。例如 `http://localhost:8080/about`。但需要服务器进行配置，以处理所有可能的 URL 路径请求，否则在直接访问非根路径时可能会出现 404 错误。

在创建路由实例时，通过 `createWebHistory()` 或 `createWebHashHistory()` 函数来指定路由模式：
```javascript
const router = createRouter({
  history: createWebHistory(), // 使用 history 模式
  // history: createWebHashHistory(), // 使用 hash 模式
  routes
});
```

通过深入学习 Vue Router，能够构建出功能强大、用户体验良好的单页面应用，实现灵活的页面导航和状态管理，为 Vue.js 项目的开发提供坚实的路由基础。 