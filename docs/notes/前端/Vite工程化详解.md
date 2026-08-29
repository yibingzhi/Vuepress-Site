---
tags:
  - 前端
  - Vite
  - 工程化
  - 构建工具
title: Vite工程化详解
createTime: 2026/08/29 15:00:00
permalink: /article/vite-engineering/
---

::: tip 2026 默认选型
新项目脚手架优先 **Vite + Vue 3 + TypeScript + Pinia**。Webpack 仅作遗留工程对照。
:::

## 一、为什么选择 Vite

### 1. 开发体验

传统打包器（Webpack）在冷启动时需要先打包整个应用，项目越大启动越慢。Vite 利用浏览器原生 ES Module，开发时按需编译，冷启动通常在 **1 秒以内**。

| 维度 | Vite | Webpack |
|------|------|---------|
| 冷启动 | 极快（按需编译） | 慢（全量打包） |
| HMR | 毫秒级 | 随项目增大变慢 |
| 配置复杂度 | 低，开箱即用 | 高，需大量 loader/plugin |
| 生产构建 | Rollup | 自身打包 |
| 生态 | 现代框架首选 | 成熟、遗留项目多 |

### 2. 核心原理

- **开发模式**：浏览器请求模块 → Vite 即时编译 → 返回 ESM
- **生产模式**：调用 Rollup 打包，输出高度优化的静态资源

---

## 二、创建 Vue 项目

### 1. 官方脚手架

```bash
# 创建项目（推荐）
npm create vue@latest my-vue-app

# 交互选项建议
# ✅ TypeScript
# ✅ Pinia
# ✅ Vue Router
# ✅ ESLint + Prettier

cd my-vue-app
npm install
npm run dev
```

### 2. 手动集成 Vite

```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
```

### 3. 常用脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
```

---

## 三、vite.config.ts 核心配置

### 1. 路径别名

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
    },
  },
})
```

`tsconfig.json` 同步配置：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. 开发代理

解决跨域，将 API 请求转发到后端：

```typescript
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
```

### 3. 环境变量

Vite 通过 `import.meta.env` 暴露变量，只有 `VITE_` 前缀的变量会注入客户端。

```bash
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_BASE_URL=http://localhost:8080

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

```typescript
// src/utils/request.ts
const baseURL = import.meta.env.VITE_API_BASE_URL

console.log(import.meta.env.MODE)       // development | production
console.log(import.meta.env.DEV)        // boolean
console.log(import.meta.env.PROD)       // boolean
```

`.env.local` 用于本地覆盖，**不要提交到 Git**。

---

## 四、生产构建优化

### 1. 基础构建配置

```typescript
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

### 2. 分包策略

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vue: ['vue', 'vue-router', 'pinia'],
        ui: ['element-plus'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

### 3. 压缩与 Tree Shaking

```bash
npm install -D vite-plugin-compression
```

```typescript
import viteCompression from 'vite-plugin-compression'

plugins: [
  viteCompression({ algorithm: 'gzip' }),
  viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
]
```

### 4. 构建分析

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer({ open: true, gzipSize: true }),
]
```

---

## 五、常用插件

| 插件 | 用途 |
|------|------|
| `@vitejs/plugin-vue` | Vue SFC 支持 |
| `@vitejs/plugin-vue-jsx` | JSX 支持 |
| `unplugin-auto-import` | 自动导入 API |
| `unplugin-vue-components` | 组件自动注册 |
| `vite-plugin-svg-icons` | SVG 雪碧图 |
| `vite-plugin-pwa` | PWA 支持 |

### 自动导入示例

```bash
npm install -D unplugin-auto-import unplugin-vue-components
```

```typescript
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

plugins: [
  AutoImport({
    imports: ['vue', 'vue-router', 'pinia'],
    resolvers: [ElementPlusResolver()],
    dts: 'src/auto-imports.d.ts',
  }),
  Components({
    resolvers: [ElementPlusResolver()],
    dts: 'src/components.d.ts',
  }),
]
```

---

## 六、与 Webpack 简要对比

### 何时选 Vite

- 新项目、Vue/React/Svelte 现代栈
- 追求开发启动速度与 HMR
- 团队希望降低配置成本

### 何时保留 Webpack

- 大型遗留项目，迁移成本高
- 深度依赖 Webpack 特有 loader/插件
- Module Federation 等特定场景（Vite 有实验性支持）

### 迁移思路

1. 先用 Vite 跑通 `dev`，再处理 `build`
2. 将 `require()` 改为 `import`
3. 将 `process.env` 改为 `import.meta.env`
4. 检查 CommonJS 依赖兼容性

---

## 七、完整配置参考

```typescript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
  }
})
```

---

## 小结

- 开发用 ESM 按需编译，生产用 Rollup 打包
- `vite.config.ts` 集中管理别名、代理、环境变量与构建策略
- 环境变量使用 `VITE_` 前缀 + `import.meta.env`
- 配合 `unplugin-*` 系列插件可大幅减少样板代码
