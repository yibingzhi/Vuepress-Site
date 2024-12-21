# Vuex 学习笔记

## 一、Vuex 概述
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式 + 库。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 二、核心概念

### 1. State（状态）
- 存储应用的各种数据状态，是响应式的。在 Vue 组件中可以通过 `this.$store.state` 来访问。例如：
```javascript
const store = new Vuex.Store({
  state: {
    count: 0,
    user: {
      name: 'John',
      age: 30
    }
  }
});
```
在组件中：
```vue
<template>
  <div>
    <p>Count: {{ $store.state.count }}</p>
  </div>
</template>
```

### 2. Mutations（突变）
- 是更改 Vuex 中 `state` 的唯一推荐方法。它们必须是同步函数，接收 `state` 作为第一个参数，并且可以接收额外的参数。例如：
```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state, payload) {
      state.count += payload;
    }
  }
});
```
在组件中通过 `this.$store.commit` 来提交一个 mutation：
```vue
<template>
  <div>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  methods: {
    increment() {
      this.$store.commit('increment', 1);
    }
  }
};
</script>
```

### 3. Actions（动作）
- 用于处理异步操作，例如发送 AJAX 请求等。它们可以提交 mutations，接收一个与 store 实例具有相同方法和属性的 `context` 对象，也可以接收额外的参数。例如：
```javascript
const store = new Vuex.Store({
  state: {
    todos: []
  },
  mutations: {
    setTodos(state, todos) {
      state.todos = todos;
    }
  },
  actions: {
    fetchTodos({ commit }) {
      axios.get('/todos')
       .then(response => {
          commit('setTodos', response.data);
        });
    }
  }
});
```
在组件中通过 `this.$store.dispatch` 来分发一个 action：
```vue
<template>
  <div>
    <ul>
      <li v-for="todo in $store.state.todos" :key="todo.id">{{ todo.title }}</li>
    </ul>
    <button @click="fetchTodos">Fetch Todos</button>
  </div>
</template>

<script>
export default {
  methods: {
    fetchTodos() {
      this.$store.dispatch('fetchTodos');
    }
  }
};
</script>
```

### 4. Getters（计算属性）
- 类似于 Vue 组件中的计算属性，用于从 `state` 中派生出新的数据状态。例如：
```javascript
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true }
    ]
  },
  getters: {
    completedTodos(state) {
      return state.todos.filter(todo => todo.completed);
    },
    totalTodos(state) {
      return state.todos.length;
    }
  }
});
```
在组件中通过 `this.$store.getters` 来访问 getters：
```vue
<template>
  <div>
    <p>Total Todos: {{ $store.getters.totalTodos }}</p>
    <p>Completed Todos: {{ $store.getters.completedTodos }}</p>
  </div>
</template>
```

## 三、模块（Modules）
- 当应用变得复杂时，可以将 `store` 分割成模块。每个模块拥有自己的 `state`、`mutations`、`actions` 和 `getters`。例如：
```javascript
const moduleA = {
  state: {
    //...
  },
  mutations: {
    //...
  },
  actions: {
    //...
  },
  getters: {
    //...
  }
};

const moduleB = {
  state: {
    //...
  },
  mutations: {
    //...
  },
  actions: {
    //...
  },
  getters: {
    //...
  }
};

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
});
```
在组件中访问模块中的状态等：
```vue
<template>
  <div>
    <p>Module A State: {{ $store.state.a.someState }}</p>
  </div>
</template>
```

## 四、辅助函数
- Vuex 提供了一些辅助函数来简化在组件中的使用：
  - `mapState`：将 `state` 映射为组件的计算属性。例如：
```javascript
import { mapState } from 'vuex';

export default {
  computed: mapState({
    count: state => state.count,
    user: 'user'
  })
};
```
  - `mapMutations`：将 `mutations` 映射为组件的方法。例如：
```javascript
import { mapMutations } from 'vuex';

export default {
  methods: mapMutations({
    increment: 'increment'
  })
};
```
  - `mapActions`：将 `actions` 映射为组件的方法。例如：
```javascript
import { mapActions } from 'vuex';

export default {
  methods: mapActions({
    fetchTodos: 'fetchTodos'
  })
};
```
  - `mapGetters`：将 `getters` 映射为组件的计算属性。例如：
```javascript
import { mapGetters } from 'vuex';

export default {
  computed: mapGetters([
    'completedTodos',
    'totalTodos'
  ])
};
```

## 五、严格模式
- 可以开启 Vuex 的严格模式，在严格模式下，任何对 `state` 的变更如果不是通过 `mutation` 进行的，将会抛出错误。在创建 `store` 时设置 `strict: true`：
```javascript
const store = new Vuex.Store({
  state: {
    //...
  },
  mutations: {
    //...
  },
  strict: true
});
```

## 六、插件
- Vuex 允许开发插件来扩展其功能，例如可以编写一个插件来记录 `state` 的变化历史等。插件是一个函数，接收 `store` 作为参数，并可以在 `store` 的生命周期钩子中进行操作。例如：
```javascript
const myPlugin = store => {
  // 当 store 初始化时调用
  store.subscribe((mutation, state) => {
    // 记录 mutation 和 state 的变化
    console.log(mutation.type, state);
  });
};

const store = new Vuex.Store({
  //...
  plugins: [myPlugin]
});
```

通过对 Vuex 的学习和应用，可以更好地管理 Vue.js 应用程序中的状态，使得数据的流动更加清晰、可预测，提高应用的可维护性和可扩展性。 