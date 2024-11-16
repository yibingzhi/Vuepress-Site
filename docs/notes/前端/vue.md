---
title: vue
createTime: 2024/11/16 21:14:00
permalink: /article/vz5a9xri/
---
Vue.js 是一个用于构建用户界面的渐进式 JavaScript 框架。它的核心库专注于视图层，易于上手，并且可以与其他库或现有项目集成。以下是 Vue.js 的基础语法教程，涵盖了创建 Vue 实例、模板语法、计算属性、指令、组件等内容。

---

# Vue.js 基础语法教程

## 一、创建 Vue 实例

### 1. 引入 Vue

- **通过 CDN 引入**

  ```html
  <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
  ```

- **通过 npm 安装**

  ```bash
  npm install vue
  ```

### 2. 创建 Vue 实例

```html
<div id="app">
  {{ message }}
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      message: 'Hello, Vue!'
    }
  });
</script>
```

## 二、模板语法

### 1. 插值

- **文本插值**

  ```html
  <p>{{ message }}</p>
  ```

- **HTML 插值**

  ```html
  <div v-html="rawHtml"></div>
  ```

### 2. 指令

- **v-bind**：绑定 HTML 属性

  ```html
  <img v-bind:src="imageSrc">
  ```

  简写：

  ```html
  <img :src="imageSrc">
  ```

- **v-if**：条件渲染

  ```html
  <p v-if="seen">Now you see me</p>
  ```

- **v-for**：列表渲染

  ```html
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.text }}</li>
  </ul>
  ```

- **v-on**：事件监听

  ```html
  <button v-on:click="greet">Greet</button>
  ```

  简写：

  ```html
  <button @click="greet">Greet</button>
  ```

### 3. 计算属性和侦听器

- **计算属性**

  ```html
  <p>Reversed message: {{ reversedMessage }}</p>

  <script>
    new Vue({
      el: '#app',
      data: {
        message: 'Hello'
      },
      computed: {
        reversedMessage: function() {
          return this.message.split('').reverse().join('');
        }
      }
    });
  </script>
  ```

- **侦听器**

  ```javascript
  new Vue({
    el: '#app',
    data: {
      question: '',
      answer: 'I cannot give you an answer until you ask a question!'
    },
    watch: {
      question: function(newQuestion, oldQuestion) {
        this.answer = 'Waiting for you to stop typing...';
        this.getAnswer();
      }
    },
    methods: {
      getAnswer: _.debounce(function() {
        if (this.question.indexOf('?') === -1) {
          this.answer = 'Questions usually contain a question mark.';
          return;
        }
        this.answer = 'Thinking...';
        var vm = this;
        axios.get('https://yesno.wtf/api')
          .then(function(response) {
            vm.answer = _.capitalize(response.data.answer);
          })
          .catch(function(error) {
            vm.answer = 'Error! Could not reach the API. ' + error;
          });
      }, 500)
    }
  });
  ```

## 三、组件

### 1. 注册组件

- **全局注册**

  ```javascript
  Vue.component('my-component', {
    template: '<div>A custom component!</div>'
  });
  ```

- **局部注册**

  ```javascript
  var Child = {
    template: '<div>A custom component!</div>'
  };

  new Vue({
    el: '#app',
    components: {
      'my-component': Child
    }
  });
  ```

### 2. 组件通信

- **父组件向子组件传递数据（props）**

  ```html
  <child-component :message="parentMessage"></child-component>

  <script>
    Vue.component('child-component', {
      props: ['message'],
      template: '<span>{{ message }}</span>'
    });
  </script>
  ```

- **子组件向父组件发送消息（事件）**

  ```html
  <button-counter @increment="incrementTotal"></button-counter>

  <script>
    Vue.component('button-counter', {
      template: '<button @click="incrementCounter">{{ counter }}</button>',
      data: function() {
        return {
          counter: 0
        };
      },
      methods: {
        incrementCounter: function() {
          this.counter += 1;
          this.$emit('increment');
        }
      }
    });

    new Vue({
      el: '#app',
      data: {
        total: 0
      },
      methods: {
        incrementTotal: function() {
          this.total += 1;
        }
      }
    });
  </script>
  ```

## 四、Vue CLI

- **安装 Vue CLI**

  ```bash
  npm install -g @vue/cli
  ```

- **创建项目**

  ```bash
  vue create my-project
  ```

- **运行项目**

  ```bash
  cd my-project
  npm run serve
  ```

---

通过这个基础教程，您可以掌握 Vue.js 的基本用法，包括创建 Vue 实例、使用模板语法和指令、定义和使用组件等。Vue.js 的强大之处在于其灵活性和易用性，使其成为构建现代 Web 应用的理想选择。根据您的具体需求，您可以进一步探索 Vue.js 的高级特性和优化技巧。