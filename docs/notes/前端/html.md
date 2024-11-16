---
title: html
createTime: 2024/11/16 21:13:37
permalink: /article/41cq72v8/
---
HTML（超文本标记语言）是构建网页的基础语言，用于定义网页的结构和内容。以下是一个 HTML 基础语法教程，涵盖了 HTML 的基本结构、常用标签、属性、表单、表格和多媒体等内容。

---

# HTML 基础语法教程

## 一、HTML 基本结构

### 1. HTML 文档结构

一个基本的 HTML 文档包含以下结构：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Title</title>
</head>
<body>
    <!-- 网页内容 -->
</body>
</html>
```

- `<!DOCTYPE html>`：声明文档类型，告知浏览器这是一个 HTML5 文档。
- `<html>`：根元素，包含所有 HTML 内容。
- `<head>`：包含元数据，如文档标题、字符集、样式和脚本。
- `<body>`：包含网页的可见内容。

## 二、常用标签

### 1. 标题和段落

- **标题标签**

  ```html
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  ```

- **段落标签**

  ```html
  <p>This is a paragraph.</p>
  ```

### 2. 文本格式化

- **加粗和斜体**

  ```html
  <strong>Bold text</strong>
  <em>Italic text</em>
  ```

- **下划线和删除线**

  ```html
  <u>Underlined text</u>
  <del>Deleted text</del>
  ```

### 3. 链接和图像

- **超链接**

  ```html
  <a href="https://www.example.com">Visit Example</a>
  ```

- **图像**

  ```html
  <img src="image.jpg" alt="Description of image">
  ```

### 4. 列表

- **无序列表**

  ```html
  <ul>
      <li>Item 1</li>
      <li>Item 2</li>
  </ul>
  ```

- **有序列表**

  ```html
  <ol>
      <li>First item</li>
      <li>Second item</li>
  </ol>
  ```

## 三、表格

- **创建表格**

  ```html
  <table>
      <thead>
          <tr>
              <th>Header 1</th>
              <th>Header 2</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>Data 1</td>
              <td>Data 2</td>
          </tr>
          <tr>
              <td>Data 3</td>
              <td>Data 4</td>
          </tr>
      </tbody>
  </table>
  ```

- **表格元素**

  - `<table>`：定义表格。
  - `<thead>`：表头部分。
  - `<tbody>`：表格主体。
  - `<tr>`：表格行。
  - `<th>`：表头单元格。
  - `<td>`：表格数据单元格。

## 四、表单

- **创建表单**

  ```html
  <form action="/submit" method="post">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name">
      
      <label for="email">Email:</label>
      <input type="email" id="email" name="email">
      
      <input type="submit" value="Submit">
  </form>
  ```

- **常用表单元素**

  - `<input>`：输入字段。`type` 属性可以是 `text`、`email`、`password`、`checkbox`、`radio` 等。
  - `<textarea>`：多行文本输入。
  - `<button>`：按钮。
  - `<select>`：下拉列表。

## 五、多媒体

### 1. 音频

- **嵌入音频**

  ```html
  <audio controls>
      <source src="audio.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
  </audio>
  ```

### 2. 视频

- **嵌入视频**

  ```html
  <video width="320" height="240" controls>
      <source src="video.mp4" type="video/mp4">
      Your browser does not support the video tag.
  </video>
  ```

## 六、语义化标签

- **常用语义化标签**

  - `<header>`：定义文档或部分的头部。
  - `<nav>`：定义导航链接。
  - `<section>`：定义文档中的节。
  - `<article>`：定义独立的内容块。
  - `<aside>`：定义侧边栏内容。
  - `<footer>`：定义文档或部分的页脚。

---

通过这个基础教程，您可以掌握 HTML 的基本用法，包括文档结构、常用标签、表格、表单和多媒体等。HTML 是构建网页的基础，结合 CSS 和 JavaScript，您可以创建丰富的 Web 应用。根据您的具体需求，您可以进一步探索 HTML5 的新特性和最佳实践。