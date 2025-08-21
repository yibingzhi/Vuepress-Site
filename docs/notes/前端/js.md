---
tags:
  - 前端
  - JavaScript
  - JS
  - 脚本
title: JavaScript
createTime: 2024/11/16 21:13:49
permalink: /article/5aqinp8d/
---

## 一、基本语法

### 1. 变量声明

- **使用 `var`**

  ```javascript
  var name = "Alice";
  ```

- **使用 `let` 和 `const`**

  ```javascript
  let age = 30;
  const birthYear = 1990;
  ```

### 2. 数据类型

- **原始数据类型**

  ```javascript
  let number = 42;          // Number
  let text = "Hello";       // String
  let isTrue = true;        // Boolean
  let undef = undefined;    // Undefined
  let empty = null;         // Null
  ```

- **对象**

  ```javascript
  let person = {
      name: "Bob",
      age: 25
  };
  ```

### 3. 运算符

- **算术运算符**：`+`, `-`, `*`, `/`, `%`
- **比较运算符**：`==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`
- **逻辑运算符**：`&&`, `||`, `!`

## 二、控制结构

### 1. 条件语句

- **if 语句**

  ```javascript
  if (age > 18) {
      console.log("Adult");
  } else {
      console.log("Minor");
  }
  ```

- **switch 语句**

  ```javascript
  switch (day) {
      case 1:
          console.log("Monday");
          break;
      case 2:
          console.log("Tuesday");
          break;
      default:
          console.log("Other day");
  }
  ```

### 2. 循环语句

- **for 循环**

  ```javascript
  for (let i = 0; i < 5; i++) {
      console.log(i);
  }
  ```

- **while 循环**

  ```javascript
  let i = 0;
  while (i < 5) {
      console.log(i);
      i++;
  }
  ```

## 三、函数

### 1. 函数声明

```javascript
function greet(name) {
    return "Hello, " + name;
}

console.log(greet("Alice"));
```

### 2. 函数表达式

```javascript
const greet = function (name) {
    return "Hello, " + name;
};

console.log(greet("Bob"));
```

### 3. 箭头函数

```javascript
const greet = (name) => "Hello, " + name;

console.log(greet("Charlie"));
```

## 四、对象和数组

### 1. 对象

- **创建和访问对象**

  ```javascript
  let car = {
      brand: "Toyota",
      model: "Corolla",
      year: 2020
  };

  console.log(car.brand); // Toyota
  ```

- **修改对象**

  ```javascript
  car.year = 2021;
  car.color = "blue";
  ```

### 2. 数组

- **创建和访问数组**

  ```javascript
  let fruits = ["Apple", "Banana", "Cherry"];
  console.log(fruits[0]); // Apple
  ```

- **数组方法**

  ```javascript
  fruits.push("Durian"); // 添加元素
  fruits.pop();          // 删除最后一个元素
  ```

## 五、DOM 操作

### 1. 选择元素

- **通过 ID**

  ```javascript
  let element = document.getElementById("header");
  ```

- **通过类名**

  ```javascript
  let elements = document.getElementsByClassName("item");
  ```

- **通过选择器**

  ```javascript
  let element = document.querySelector(".item");
  let elements = document.querySelectorAll(".item");
  ```

### 2. 修改元素

- **修改内容和属性**

  ```javascript
  element.textContent = "New Content";
  element.setAttribute("class", "new-class");
  ```

- **修改样式**

  ```javascript
  element.style.color = "red";
  element.style.fontSize = "20px";
  ```

## 六、事件处理

### 1. 添加事件监听器

```javascript
let button = document.querySelector("button");
button.addEventListener("click", function () {
    alert("Button clicked!");
});
```

### 2. 移除事件监听器

```javascript
function handleClick() {
    alert("Button clicked!");
}

button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);
```

## 七、ES6+ 新特性

### 1. 模板字符串

```javascript
let name = "Alice";
let greeting = `Hello, ${name}!`;
console.log(greeting);
```

### 2. 解构赋值

- **数组解构**

  ```javascript
  let [a, b, c] = [1, 2, 3];
  ```

- **对象解构**

  ```javascript
  let { name, age } = { name: "Alice", age: 25 };
  ```

### 3. 扩展运算符

- **数组扩展**

  ```javascript
  let arr1 = [1, 2, 3];
  let arr2 = [...arr1, 4, 5];
  ```

- **对象扩展**

  ```javascript
  let obj1 = { a: 1, b: 2 };
  let obj2 = { ...obj1, c: 3 };
  ```

### 4. Promise 和异步编程

- **Promise**

  ```javascript
  let promise = new Promise((resolve, reject) => {
      // 异步操作
      if (success) {
          resolve(result);
      } else {
          reject(error);
      }
  });

  promise.then(result => {
      console.log(result);
  }).catch(error => {
      console.error(error);
  });
  ```

- **async/await**

  ```javascript
  async function fetchData() {
      try {
          let response = await fetch('https://api.example.com/data');
          let data = await response.json();
          console.log(data);
      } catch (error) {
          console.error(error);
      }
  }

  fetchData();
  ```

---
