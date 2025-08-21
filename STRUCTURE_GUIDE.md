# VuePress 站点结构指南

## 📁 项目结构

```
VuePress-Site/
├── docs/
│   ├── .vuepress/           # VuePress 配置目录
│   │   ├── config.ts        # 主配置文件
│   │   ├── notes.ts         # 笔记配置
│   │   ├── navbar.ts        # 导航栏配置
│   │   └── plume.config.ts  # 主题配置
│   ├── notes/               # 笔记内容目录
│   │   ├── java/            # Java 技术栈
│   │   │   ├── 基础语法/     # Java 基础语法
│   │   │   ├── JavaCollection/ # Java 集合框架
│   │   │   ├── SpringBoot/  # SpringBoot 集成
│   │   │   └── *.md         # Java 相关文档
│   │   ├── 前端/            # 前端技术
│   │   │   ├── 工程化/      # 前端工程化
│   │   │   ├── 框架/        # 前端框架
│   │   │   └── *.md         # 前端相关文档
│   │   ├── sql/             # 数据库技术
│   │   │   ├── 安装/        # 数据库安装指南
│   │   │   └── *.md         # 数据库相关文档
│   │   ├── Ai/              # AI 技术
│   │   │   ├── 机器学习/     # 机器学习
│   │   │   └── *.md         # AI 相关文档
│   │   ├── 运维/            # 运维技术
│   │   │   ├── CI-CD/       # CI/CD 相关
│   │   │   ├── 监控/        # 监控相关
│   │   │   └── *.md         # 运维相关文档
│   │   └── 数据库/          # 数据库分类（备用）
│   ├── en/                  # 英文内容
│   │   └── notes/           # 英文笔记
│   └── preview/             # 预览内容
├── package.json
└── README.md
```

## 🔧 配置说明

### 1. 笔记配置 (notes.ts)

已重新整理所有笔记配置，包括：

- **Java 技术栈** (`/java/`)
  - Java 基础语法
  - Java 集合框架
  - Spring 生态

- **SpringBoot 集成** (`/springboot/`)
  - 各种框架集成指南

- **前端技术** (`/frontend/`)
  - HTML/CSS/JavaScript
  - Vue 相关技术

- **数据库技术** (`/database/`)
  - 关系型数据库
  - NoSQL 数据库

- **AI 技术** (`/ai/`)
  - Spring AI
  - 机器学习

- **运维技术** (`/devops/`)
  - CI/CD
  - 监控

### 2. 导航栏配置 (navbar.ts)

已修正所有路径，确保与实际文件结构匹配：

- 移除了错误的路径前缀
- 统一了链接格式
- 按技术栈分类组织

### 3. 路径修正

所有文档的 `permalink` 已更新为正确的路径格式：

- Java 相关：`/java/xxx`
- SpringBoot 相关：`/springboot/xxx`
- 前端相关：`/frontend/xxx`
- 数据库相关：`/database/xxx`
- AI 相关：`/ai/xxx`
- 运维相关：`/devops/xxx`

## 📝 使用指南

### 添加新文档

1. **选择合适的位置**：根据内容类型选择对应的目录
2. **创建 Markdown 文件**：使用统一的命名规范
3. **添加 Front Matter**：
   ```yaml
   ---
   title: 文档标题
   createTime: 2024/11/19 11:00:15
   permalink: /category/document-name/
   ---
   ```
4. **更新配置**：在 `notes.ts` 中添加对应的侧边栏配置

### 命名规范

- **文件名**：使用中文描述，避免特殊字符
- **目录名**：使用中文，便于理解
- **permalink**：使用英文，便于 URL 友好

### 分类原则

- **按技术栈分类**：Java、前端、数据库、AI、运维
- **按功能分类**：基础、框架、集成、优化
- **按难度分类**：入门、进阶、高级

## 🚀 部署说明

1. **开发环境**：
   ```bash
   pnpm docs:dev
   ```

2. **构建生产版本**：
   ```bash
   pnpm docs:build
   ```

3. **预览构建结果**：
   ```bash
   pnpm docs:preview
   ```

## 📋 待办事项

- [ ] 完善各目录下的 README.md 文件
- [ ] 添加更多示例和最佳实践
- [ ] 优化文档结构和导航
- [ ] 添加搜索功能配置
- [ ] 完善英文版本内容

## 🔍 常见问题

### Q: 如何添加新的技术栈？
A: 在 `notes.ts` 中添加新的 `defineNoteConfig`，在 `navbar.ts` 中添加对应的导航项。

### Q: 如何修改文档路径？
A: 修改文档的 Front Matter 中的 `permalink` 字段，同时更新配置文件中的路径。

### Q: 如何添加新的语言支持？
A: 在 `config.ts` 的 `locales` 中添加新的语言配置，创建对应的目录结构。

---

**注意**：此结构已优化，所有路径已修正，配置文件已更新。建议按照此指南进行后续的文档管理。
