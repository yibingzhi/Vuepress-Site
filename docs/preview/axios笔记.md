---
title: axios笔记
createTime: 2024/12/20 20:46:19
permalink: /article/8c5ajlfv/
---
# Axios 学习笔记

Axios 是一个基于 Promise 的 HTTP 客户端，用于在浏览器和 Node.js 中发送 HTTP 请求。它具有简洁的 API、丰富的功能以及对请求和响应的拦截器支持，广泛应用于前端和后端开发中与服务器进行数据交互。

## 一、Axios 基本使用

### 1. 安装
在项目中使用 Axios，首先需要安装它。如果是前端项目（使用 npm 或 yarn）：

```bash
# 使用 npm 安装
npm install axios

# 使用 yarn 安装
yarn add axios
```

在 Node.js 项目中同样可以使用上述命令进行安装。

### 2. 发起 GET 请求
```javascript
import axios from 'axios';

axios.get('https://api.example.com/data')
 .then(response => {
    // 成功获取数据后的处理
    console.log(response.data);
  })
 .catch(error => {
    // 处理请求错误
    console.error('请求出错：', error);
  });
```

在上述代码中，`axios.get` 方法用于发起一个 GET 请求，传入目标 URL。它返回一个 Promise，通过 `.then` 处理成功的响应，响应数据存储在 `response.data` 中；通过 `.catch` 处理请求过程中发生的错误。

### 3. 发起 POST 请求
```javascript
axios.post('https://api.example.com/submit', {
  // 要发送的数据对象
  username: 'user123',
  password: 'pass123'
})
 .then(response => {
    console.log('提交成功：', response.data);
  })
 .catch(error => {
    console.error('提交失败：', error);
  });
```

`axios.post` 方法用于发起 POST 请求，第一个参数是请求的 URL，第二个参数是要发送的数据对象。

### 4. 其他请求方法
Axios 还支持 PUT、DELETE、PATCH 等常见的 HTTP 请求方法，使用方式类似：

- PUT 请求：
```javascript
axios.put('https://api.example.com/update', {
  // 更新的数据
  id: 1,
  newData: 'updated value'
})
 .then(response => {
    console.log('更新成功：', response.data);
  })
 .catch(error => {
    console.error('更新失败：', error);
  });
```

- DELETE 请求：
```javascript
axios.delete('https://api.example.com/delete/1')
 .then(response => {
    console.log('删除成功：', response.data);
  })
 .catch(error => {
    console.error('删除失败：', error);
  });
```

- PATCH 请求：
```javascript
axios.patch('https://api.example.com/edit', {
  // 部分更新的数据
  key: 'value'
})
 .then(response => {
    console.log('部分更新成功：', response.data);
  })
 .catch(error => {
    console.error('部分更新失败：', error);
  });
```

## 二、Axios 配置项

Axios 允许在发起请求时传入配置对象，以定制请求的各种行为。

### 1. 常用配置项
- `url`：请求的 URL 地址。
- `method`：请求方法，如 `'GET'`、`'POST'`、`'PUT'`、`'DELETE'` 等，默认为 `'GET'`。
- `data`：用于 POST、PUT、PATCH 等请求的数据，作为请求体发送。
- `params`：添加到 URL 查询字符串中的参数对象。例如：
```javascript
axios.get('https://api.example.com/search', {
  params: {
    keyword: 'axios',
    page: 1
  }
})
 .then(response => {
    console.log(response.data);
  });
```
上述代码会发起一个 GET 请求到 `https://api.example.com/search?keyword=axios&page=1`。

- `headers`：设置请求头信息。例如：
```javascript
axios.post('https://api.example.com/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
 .then(response => {
    console.log(response.data);
  });
```

- `timeout`：设置请求超时时间（单位为毫秒），如果请求超过该时间未响应，则会抛出错误。例如：
```javascript
axios.get('https://api.example.com/slow-api', {
  timeout: 5000 // 5 秒超时
})
 .then(response => {
    console.log(response.data);
  })
 .catch(error => {
    console.error('请求超时：', error);
  });
```

### 2. 全局配置
除了在每个请求中单独设置配置项，还可以进行全局配置，这样所有的请求都会应用这些配置。

```javascript
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.headers.common['Authorization'] = 'Bearer token';
axios.defaults.timeout = 10000;
```

上述代码设置了全局的基础 URL、请求头中的授权信息以及超时时间。之后发起的所有请求都会自动带上这些配置，除非在单个请求中进行了覆盖。

## 三、请求和响应拦截器

Axios 的拦截器是其强大功能之一，可以在请求发送前和响应返回后进行统一的处理。

### 1. 请求拦截器
请求拦截器可以在请求发送前对请求进行修改或添加一些通用的逻辑，例如添加认证信息、显示加载状态等。

```javascript
// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，比如添加请求头
    config.headers['X-Custom-Header'] = 'custom value';
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
```

在上述代码中，`axios.interceptors.request.use` 注册了一个请求拦截器。第一个回调函数在请求成功配置后调用，可以修改请求配置对象 `config`；第二个回调函数在请求配置发生错误时调用，需要返回一个被拒绝的 Promise。

### 2. 响应拦截器
响应拦截器用于在收到响应后对响应数据进行处理或处理响应错误。

```javascript
// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    // 对响应数据做点什么，比如数据格式化
    const formattedData = response.data.map(item => ({
      id: item.id,
      name: item.name.toUpperCase()
    }));
    return {
     ...response,
      data: formattedData
    };
  },
  error => {
    // 对响应错误做点什么，比如统一处理错误提示
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('服务器错误：', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求发送了但没有收到响应
      console.error('网络请求未响应：', error.request);
    } else {
      // 其他错误
      console.error('请求错误：', error.message);
    }
    return Promise.reject(error);
  }
);
```

在响应拦截器中，第一个回调函数处理成功的响应，可以对响应数据进行修改后返回；第二个回调函数处理响应错误，根据错误类型进行相应的处理，并返回一个被拒绝的 Promise。

## 四、Axios 错误处理

在使用 Axios 进行请求时，可能会遇到各种错误情况，如网络问题、服务器错误、请求超时等。

### 1. 网络错误
当网络连接出现问题时，例如无法连接到服务器，`error.request` 将包含错误信息。例如：
```javascript
axios.get('https://nonexistent-api.com/data')
 .then(response => {
    console.log(response.data);
  })
 .catch(error => {
    console.error('网络错误：', error.request);
  });
```

### 2. 服务器错误
如果服务器返回了错误的状态码（如 4xx 或 5xx 系列），`error.response` 将包含响应对象，其中包含状态码、状态文本、响应头和响应数据等信息。例如：
```javascript
axios.post('https://api.example.com/error', {
  // 错误数据导致服务器返回 400 错误
  invalidData: 'bad value'
})
 .then(response => {
    console.log(response.data);
  })
 .catch(error => {
    if (error.response) {
      console.error('服务器错误：', error.response.status, error.response.data);
    }
  });
```

### 3. 请求超时
当请求超过设定的 `timeout` 时间时，会抛出一个超时错误。例如：
```javascript
axios.get('https://slow-api.com/data', {
  timeout: 2000
})
 .then(response => {
    console.log(response.data);
  })
 .catch(error => {
    console.error('请求超时：', error);
  });
```

通过合理地处理这些错误情况，可以提高应用程序的稳定性和用户体验，例如向用户显示友好的错误提示信息等。

Axios 是一个功能强大且灵活的 HTTP 客户端库，在实际项目中能够方便地与各种后端 API 进行交互。熟练掌握其基本使用、配置项、拦截器以及错误处理等方面的知识，对于开发高效、稳定的前端和后端应用程序非常重要。 