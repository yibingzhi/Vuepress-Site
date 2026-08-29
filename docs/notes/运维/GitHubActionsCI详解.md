---
tags:
  - 运维
  - CI/CD
  - GitHub Actions
  - DevOps
title: GitHubActionsCI详解
createTime: 2026/08/29 16:00:00
permalink: /article/github-actions-ci/
---

::: tip 2026 实践要点
- Node 项目优先 **pnpm** + `actions/setup-node` 的 `cache: pnpm`
- Java 使用 **Temurin 21** LTS + Maven Wrapper（`./mvnw`）
- PR 必跑 lint + test；主分支合并后再 deploy
- Secrets 仅存于 GitHub Settings，禁止写入 workflow 日志
:::

## 一、Workflow 基础结构

GitHub Actions 工作流定义在 `.github/workflows/*.yml`。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch: # 手动触发

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test:unit
```

### 1.1 触发器（on）

| 事件 | 典型用途 |
|------|----------|
| `push` | 主分支持续集成 |
| `pull_request` | PR 质量门禁 |
| `schedule` | 定时任务（cron） |
| `workflow_dispatch` | 手动发布 |
| `release` | Tag 发布 |

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - 'src/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
```

`paths` 过滤可减少无关 PR 的 CI 消耗。

### 1.2 Job 与 Step

- **Job**：并行执行单元，默认相互独立
- **Step**：Job 内顺序执行
- **needs**：Job 依赖 DAG

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo "deploy after build"
```

---

## 二、前端项目：pnpm + Node

### 2.1 完整 CI 示例

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:

env:
  NODE_ENV: test

jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: frontend/coverage/lcov.info
          fail_ci_if_error: false

  build:
    needs: quality
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Upload dist artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 7
```

### 2.2 Monorepo 矩阵构建

```yaml
jobs:
  build-packages:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        package: [web, admin, shared-ui]

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter ${{ matrix.package }} build
```

---

## 三、Java 项目：Maven

### 3.1 标准 Maven CI

```yaml
# .github/workflows/java-ci.yml
name: Java CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  maven-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven

      - name: Verify with Maven
        run: ./mvnw -B verify -DskipITs=false

      - name: Upload test reports
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: surefire-reports
          path: target/surefire-reports/
```

### 3.2 多模块 + 集成测试

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: app_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -h 127.0..1"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    env:
      SPRING_DATASOURCE_URL: jdbc:mysql://localhost:3306/app_test
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      SPRING_DATA_REDIS_HOST: localhost

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven

      - run: ./mvnw -B -pl app-service -am verify
```

### 3.3 Gradle 简要

```yaml
- uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: 21
    cache: gradle

- run: ./gradlew build --no-daemon
```

---

## 四、缓存策略

### 4.1 内置 cache

```yaml
# Node — setup-node 自动缓存 pnpm store
- uses: actions/setup-node@v4
  with:
    cache: pnpm

# Maven — setup-java cache: maven
- uses: actions/setup-java@v4
  with:
    cache: maven

# Gradle
- uses: actions/setup-java@v4
  with:
    cache: gradle
```

### 4.2 actions/cache 自定义

```yaml
- name: Cache Vite pre-bundle
  uses: actions/cache@v4
  with:
    path: |
      frontend/node_modules/.vite
    key: vite-${{ runner.os }}-${{ hashFiles('frontend/pnpm-lock.yaml') }}
    restore-keys: |
      vite-${{ runner.os }}-
```

### 4.3 缓存失效原则

- Key 包含 **锁文件 hash**（`pnpm-lock.yaml`、`pom.xml`）
- 路径精确，避免缓存整个 `node_modules`（pnpm 用 store 即可）
- 依赖变更后自动新 key，旧缓存作 `restore-keys` 回退

---

## 五、PR 检查与分支保护

### 5.1 PR 专用 Job

```yaml
jobs:
  pr-check:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 全量历史供 diff 工具

      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test:unit

      - name: Build affected only
        run: pnpm exec nx affected -t build --base=origin/main
```

### 5.2 状态检查与 Review

在 GitHub **Settings → Branches → Branch protection** 配置：

- Require status checks: `quality`, `build`, `maven-test`
- Require pull request reviews
- Dismiss stale reviews

### 5.3 PR 评论机器人（可选）

```yaml
- name: Comment coverage
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ CI passed. Coverage uploaded to Codecov.'
      })
```

---

## 六、部署到 Vercel

### 6.1 官方 Action

```yaml
# .github/workflows/deploy-vercel.yml
name: Deploy Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          VITE_API_BASE: ${{ vars.VITE_API_BASE }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'
```

### 6.2 Vercel Git 集成对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| Vercel Git 集成 | 零配置 Preview | 定制流水线弱 |
| GitHub Actions | 与测试门禁统一 | 需维护 secrets |

**Preview 部署（PR）：**

```yaml
on:
  pull_request:

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... build steps
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
```

---

## 七、部署到 GitHub Pages

### 7.1 静态站点（Vite/VuePress）

```yaml
# .github/workflows/deploy-gh-pages.yml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm docs:build
        env:
          BASE_URL: /my-repo/

      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vuepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

仓库 Settings → Pages → Source 选 **GitHub Actions**。

### 7.2 Java API 文档（可选）

```yaml
- run: ./mvnw -B javadoc:javadoc
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: target/site/apidocs
```

---

## 八、Secrets 与 Variables

### 8.1 层级

| 类型 | 作用域 | 可见性 |
|------|--------|--------|
| Secrets | Repo / Environment | 加密，日志掩码 |
| Variables | Repo / Environment | 明文，非敏感配置 |
| `GITHUB_TOKEN` | 每次运行自动注入 | 权限受 `permissions` 限制 |

### 8.2 常用 Secrets

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
SSH_PRIVATE_KEY          # 自建机部署
NPM_TOKEN                # 发布私有包
CODECOV_TOKEN
```

### 8.3 安全写法

```yaml
# ✅ 正确
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ 禁止 echo secret
- run: echo "${{ secrets.API_KEY }}"

# 使用 Environment 保护生产
jobs:
  deploy-prod:
    environment: production
    steps:
      - run: ./deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

### 8.4 OIDC 免长期密钥（AWS 示例）

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
      aws-region: ap-northeast-1
```

---

## 九、Docker 镜像构建与推送

```yaml
name: Docker Publish

on:
  push:
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            myorg/myapp:${{ github.ref_name }}
            myorg/myapp:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 十、Reusable Workflow

```yaml
# .github/workflows/reusable-node-test.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '22'
      working-directory:
        required: false
        type: string
        default: '.'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
```

```yaml
# 调用方
jobs:
  frontend:
    uses: ./.github/workflows/reusable-node-test.yml
    with:
      working-directory: frontend
```

---

## 十一、并发、超时与重试

```yaml
concurrency:
  group: deploy-prod
  cancel-in-progress: false # 部署不取消进行中实例

jobs:
  flaky-e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: nick-fields/retry@v3
        with:
          timeout_minutes: 10
          max_attempts: 3
          command: pnpm test:e2e
```

---

## 十二、完整 Monorepo 流水线草图

```yaml
name: Monorepo CI/CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'frontend/**'
            backend:
              - 'backend/**'

  frontend-ci:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    uses: ./.github/workflows/reusable-node-test.yml
    with:
      working-directory: frontend

  backend-ci:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven
      - run: ./mvnw -B verify
        working-directory: backend

  deploy:
    needs: [frontend-ci, backend-ci]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "Deploy when all required jobs succeed or are skipped"
```

---

## 十三、调试技巧

```yaml
# 临时开启 debug 日志
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

- Actions 页查看每一步日志与耗时
- `if: failure()` 上传 artifact 保留现场
- 本地用 [act](https://github.com/nektos/act) 模拟（与云端略有差异）

---

## 十四、检查清单

- [ ] `pull_request` 与 `push` 分开配置 paths 过滤
- [ ] `pnpm install --frozen-lockfile` / `./mvnw` 锁定依赖
- [ ] setup-node / setup-java 开启 cache
- [ ] PR 必过 lint + test；deploy 仅 main + environment
- [ ] Secrets 不入库、不打印；敏感用 Environment protection
- [ ] `concurrency` 避免重复部署
- [ ] 失败时上传报告 artifact

---

## 参考

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/setup-java](https://github.com/actions/setup-java)
