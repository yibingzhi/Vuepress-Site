---
title: CSS 布局现代指南
tags:
  - 前端
  - CSS
  - Flexbox
  - Grid
  - 响应式
  - 布局
createTime: 2026/08/29 16:00:00
permalink: /frontend/css-layout-modern/
---

::: tip 保鲜说明（2026-08）
Flexbox、Grid、Container Queries 在现代浏览器（Chrome 105+、Safari 16+、Firefox 110+）均已稳定可用。示例采用标准 CSS，不依赖特定 UI 框架。单位混用 `rem`（根字体）与 `%`/`fr`（布局比例）为常见实践。
:::

## 1. 布局技术选型

```text
一维（行或列为主）     → Flexbox
二维（行+列同时控制）  → Grid
组件内部随容器宽度变化 → Container Queries
整体视口断点           → Media Queries
脱离文档流定位         → position / fixed / sticky
```

| 场景 | 推荐 |
|------|------|
| 导航栏、工具条、卡片内对齐 | Flexbox |
| 页面整体栅格、仪表盘 | Grid |
| 侧边栏 + 主内容 | Grid 或 Flex |
| 悬浮按钮、遮罩 | `position: fixed` |
| 表头吸顶 | `position: sticky` |

---

## 2. 盒模型与基础

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px; /* 1rem 基准 */
}

body {
  margin: 0;
  line-height: 1.5;
  font-family: system-ui, sans-serif;
}
```

`box-sizing: border-box`：`width` 含 `padding`/`border`，避免宽度算爆。

---

## 3. Flexbox 详解

### 3.1 容器属性

```css
.flex-container {
  display: flex;
  flex-direction: row;        /* row | row-reverse | column | column-reverse */
  flex-wrap: wrap;            /* 换行 */
  justify-content: center;    /* 主轴对齐 */
  align-items: center;        /* 交叉轴对齐 */
  align-content: stretch;     /* 多行时交叉轴分布 */
  gap: 1rem;                  /* 子项间距 */
}
```

**主轴**由 `flex-direction` 决定：`row` 时主轴为水平。

### 3.2 子项属性

```css
.flex-item {
  flex-grow: 1;      /* 剩余空间分配比例 */
  flex-shrink: 1;    /* 空间不足时收缩 */
  flex-basis: 200px; /* 初始主轴尺寸 */
  flex: 1 1 auto;    /* grow shrink basis 简写 */
  align-self: flex-end;
  order: 0;          /* 排序，慎用 */
}
```

常见简写：

```css
.flex-1 { flex: 1; }           /* 1 1 0% 等分 */
.flex-none { flex: none; }     /* 0 0 auto 不伸缩 */
.flex-auto { flex: auto; }     /* 1 1 auto */
```

### 3.3 经典模式：水平垂直居中

```css
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

### 3.4 导航栏

```html
<header class="navbar">
  <a class="logo" href="/">App</a>
  <nav class="nav-links">
    <a href="/docs">文档</a>
    <a href="/blog">博客</a>
  </nav>
  <div class="nav-actions">
    <button>登录</button>
  </div>
</header>
```

```css
.navbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1.5rem;
  height: 56px;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  font-weight: 600;
  margin-right: auto; /* 把后面顶到右侧 */
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
}
```

`margin-left: auto` / `margin-right: auto` 是 Flex 里「推开」元素的常用技巧。

### 3.5 等高卡片列

```css
.card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 280px;   /* 最小约 280px，自动换行 */
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card-body {
  flex: 1;           /* 把 footer 推到底 */
}

.card-footer {
  margin-top: auto;
}
```

### 3.6 Flex 常见坑

| 坑 | 原因 | 解决 |
|----|------|------|
| 子项溢出不换行 | 默认 `flex-wrap: nowrap` | `flex-wrap: wrap` |
| 文字把 flex 撑破 | `min-width: auto` 默认阻止收缩 | 子项 `min-width: 0` |
| `gap` 老浏览器 | IE 不支持 | 用 `margin` 或 postcss |

---

## 4. CSS Grid 详解

### 4.1 基础网格

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}
```

`fr`：剩余空间份数，比 `%` 更适合栅格（避免溢出叠加 gap）。

### 4.2 显式区域命名

```css
.page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; min-width: 0; }
.footer  { grid-area: footer; }
```

### 4.3 `minmax` 与 `auto-fit`

```css
/* 响应式卡片：自动列数，每列至少 260px */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}
```

- `auto-fit`：空轨道折叠，拉伸现有列
- `auto-fill`：保留空轨道

### 4.4 跨行跨列

```css
.featured {
  grid-column: span 2;
  grid-row: span 2;
}

/* 或线号 */
.wide {
  grid-column: 1 / -1; /* 整行 */
}
```

### 4.5 子项对齐

```css
.grid {
  justify-items: stretch;   /* 单元格内水平 */
  align-items: stretch;     /* 单元格内垂直 */
  justify-content: center;  /* 整个网格在容器内 */
  align-content: start;
}

.item {
  justify-self: end;
  align-self: center;
}
```

### 4.6 圣杯布局（Grid 版）

```css
.holy-grail {
  display: grid;
  grid-template:
    "head head head" auto
    "nav  main aside" 1fr
    "foot foot foot" auto
    / 200px 1fr 200px;
  min-height: 100vh;
}
```

比传统 float + 负 margin 清晰得多。

---

## 5. Flex vs Grid 如何选

| 问题 | 选 |
|------|-----|
| 只有一行按钮/toolbar | Flex |
| 整个页面区域划分 | Grid |
| 组件内左图标右文字 | Flex |
| 不规则拼图块 | Grid `grid-area` |
| 等分三列且要换行 | 均可；`auto-fit` Grid 更省事 |

可以嵌套：Grid 划大区，区内 Flex 排细节。

---

## 6. Container Queries（容器查询）

### 6.1 与 Media Query 区别

| | Media Query | Container Query |
|---|-------------|-----------------|
| 依据 | 视口宽度 | **父容器**宽度 |
| 场景 | 整页断点 | 可复用组件（侧边栏窄时卡片竖排） |

### 6.2 基本用法

```css
.card-container {
  container-type: inline-size;
  container-name: card; /* 可选 */
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

简写：

```css
.card-wrapper {
  container: card / inline-size;
}
```

### 6.3 单位 `cqw` / `cqh`

```css
@container (min-width: 300px) {
  .title {
    font-size: clamp(1rem, 4cqw, 1.5rem);
  }
}
```

### 6.4 注意

- 祖先需设 `container-type`，否则查询不生效
- 不宜嵌套过多层查询，难调试
- 与 Media Query 配合：页面级用 `@media`，组件级用 `@container`

---

## 7. 响应式设计

### 7.1 移动优先

```css
/* 默认：手机 */
.sidebar {
  display: none;
}

.main {
  padding: 1rem;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 220px 1fr;
  }
  .sidebar {
    display: block;
  }
  .main {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .main {
    max-width: 960px;
    margin: 0 auto;
  }
}
```

常用断点（按项目调整，非标准）：

| 名称 | 宽度 |
|------|------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

### 7.2 流式排版

```css
html {
  font-size: clamp(14px, 2.5vw, 18px);
}

.prose {
  max-width: 65ch; /* 阅读舒适宽度 */
  margin-inline: auto;
}
```

### 7.3 图片响应式

```css
img,
video {
  max-width: 100%;
  height: auto;
  display: block;
}
```

```html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(min-width: 1024px) 960px, 100vw"
  alt="..."
/>
```

---

## 8. 常见布局模式实现

### 8.1 粘性页脚（Sticky Footer）

```css
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-main {
  flex: 1;
}
```

### 8.2 固定顶栏 + 可滚动主区

```css
.app {
  display: grid;
  grid-template-rows: 56px 1fr;
  height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-content {
  overflow: auto;
  min-height: 0; /* 允许 grid 子项收缩滚动 */
}
```

### 8.3 左右两栏：左固定右自适应

**Flex：**

```css
.split {
  display: flex;
  gap: 1rem;
}
.split-aside {
  flex: 0 0 280px;
}
.split-main {
  flex: 1;
  min-width: 0;
}
```

**Grid：**

```css
.split {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
}
```

### 8.4 居中绝对定位元素

```css
.modal-center {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
}

.modal {
  width: min(90vw, 480px);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
}
```

`place-items: center` = `align-items` + `justify-items`。

### 8.5 表单两列

```css
.form-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.75rem 1rem;
  align-items: center;
}
```

窄屏改为单列：`grid-template-columns: 1fr`。

---

## 9. `position` 速查（略）

`sticky` 表头：`position: sticky; top: 0; background: #fff; z-index: 1`。

---

## 10. 现代 CSS 辅助

`gap`（Flex/Grid）、逻辑属性（`margin-inline`）、`aspect-ratio`、`clamp()` — 见 MDN。

---

## 11. 反模式与速查

| 反模式 | 更好做法 |
|--------|----------|
| `float` 布局 | Flex / Grid |
| 固定 1200px 宽 | `max-width` + `%` |
| 仅设备断点 | `auto-fit` + Container Queries |

```text
Flex: justify-content; align-items; gap; flex 1; min-width 0
Grid: repeat(auto-fit, minmax(260px, 1fr)); grid-template-areas
居中: place-items center
```

---

## 12. 参考

- [MDN — CSS layout](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout)
- 本仓库：[css 基础](/article/css/)、[Vue3 详解](/article/vue3/)
