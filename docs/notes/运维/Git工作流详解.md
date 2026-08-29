---
tags:
  - 运维
  - Git
  - 版本控制
  - 工作流
title: Git工作流详解
createTime: 2026/08/29 15:00:00
permalink: /article/git-workflow/
---

## 一、基础操作

### 1. 克隆与初始化

```bash
# 克隆远程仓库
git clone https://github.com/org/repo.git
git clone -b develop https://github.com/org/repo.git  # 指定分支

# 初始化本地仓库
git init
git remote add origin https://github.com/org/repo.git
```

### 2. 分支管理

```bash
# 查看分支
git branch          # 本地分支
git branch -a       # 所有分支（含远程）
git branch -vv      # 含跟踪关系

# 创建与切换
git switch -c feature/login   # 创建并切换（推荐）
git checkout -b feature/login # 旧写法，等效

# 删除分支
git branch -d feature/login     # 已合并
git branch -D feature/login     # 强制删除
```

### 3. 提交规范

```bash
# 查看状态与差异
git status
git diff                    # 工作区 vs 暂存区
git diff --staged           # 暂存区 vs 最后一次提交

# 暂存与提交
git add src/                # 暂存目录
git add -p                  # 交互式暂存（挑选 hunks）
git commit -m "feat: 添加用户登录功能"

# 修改最后一次提交
git commit --amend -m "feat: 添加用户登录功能（修正描述）"
```

---

## 二、Rebase vs Merge

### 1. Merge（合并）

保留完整分支历史，产生合并提交：

```bash
git switch main
git merge feature/login
```

```
main:     A --- B ------- M (merge commit)
                 \     /
feature:          C --- D
```

**适用场景**：公共分支合并、需要保留分支上下文。

### 2. Rebase（变基）

将提交「嫁接」到目标分支顶端，历史线性整洁：

```bash
git switch feature/login
git rebase main
```

```
main:     A --- B
                 \
feature:          C' --- D'  (线性历史)
```

**适用场景**：个人功能分支同步主分支、PR 前整理提交。

::: warning 黄金法则
**不要对已推送到公共分支的提交执行 rebase**，否则他人历史会混乱。
:::

### 3. 交互式 Rebase 整理提交

```bash
git rebase -i HEAD~3

# 编辑器中可选：
# pick   - 保留提交
# squash - 合并到前一个提交
# reword - 修改提交信息
# drop   - 删除提交
```

---

## 三、Pull Request 工作流

### 1. 标准流程

```bash
# 1. 从 main 创建功能分支
git switch main
git pull origin main
git switch -c feature/order-export

# 2. 开发并推送
git add .
git commit -m "feat(order): 支持订单 Excel 导出"
git push -u origin feature/order-export

# 3. 在 GitHub/GitLab 创建 PR
# 4. Code Review → CI 通过 → 合并
# 5. 合并后清理本地分支
git switch main
git pull origin main
git branch -d feature/order-export
```

### 2. PR 最佳实践

- 一个 PR 只做一件事，便于 Review
- PR 标题遵循 Conventional Commits
- 关联 Issue 编号：`fix: 修复登录超时 (#123)`
- 合并前确保 CI 绿灯、无冲突

### 3. 同步远程更新

```bash
# 功能分支落后 main 时
git fetch origin
git rebase origin/main
# 或
git merge origin/main
git push --force-with-lease  # rebase 后推送（仅个人分支）
```

---

## 四、Conventional Commits

### 1. 格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 2. 常用 type

| type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建/工具变更 |
| `ci` | CI 配置 |

### 3. 示例

```bash
feat(auth): 支持 OAuth2 第三方登录
fix(api): 修复分页参数 pageSize 为 0 时的异常
docs(readme): 更新部署文档
chore(deps): 升级 Spring Boot 到 3.3.0
```

### 4. 配合工具

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
npx husky init
```

---

## 五、.gitignore 配置

```gitignore
# 依赖
node_modules/
target/
dist/

# IDE
.idea/
.vscode/
*.swp

# 环境变量与密钥
.env
.env.local
*.pem
secrets/

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
logs/

# 构建产物
*.class
*.jar
!gradle-wrapper.jar
```

全局忽略（个人机器）：

```bash
git config --global core.excludesfile ~/.gitignore_global
```

---

## 六、Stash 暂存

临时切换任务时保存未提交改动：

```bash
# 暂存当前改动
git stash push -m "WIP: 登录页样式调整"

# 查看 stash 列表
git stash list

# 恢复（保留 stash）
git stash apply stash@{0}

# 恢复并删除 stash
git stash pop

# 删除指定 stash
git stash drop stash@{0}

# 暂存包含未跟踪文件
git stash -u
```

---

## 七、冲突解决

### 1. 识别冲突

```bash
git merge feature/login
# Auto-merging src/auth.ts
# CONFLICT (content): Merge conflict in src/auth.ts
```

### 2. 解决步骤

```bash
# 1. 查看冲突文件
git status

# 2. 编辑文件，删除冲突标记
<<<<<<< HEAD
const timeout = 3000
=======
const timeout = 5000
>>>>>>> feature/login

# 3. 标记已解决
git add src/auth.ts
git commit  # merge 提交
# 或 git rebase --continue  # rebase 场景
```

### 3. 工具辅助

```bash
git mergetool                    # 调用配置的合并工具
git diff --name-only --diff-filter=U  # 仅列出冲突文件
```

### 4. 放弃合并/变基

```bash
git merge --abort
git rebase --abort
```

---

## 八、保护 main 分支

### 1. GitHub Branch Protection Rules

- Require pull request before merging
- Require status checks to pass（CI）
- Require review from CODEOWNERS
- Do not allow bypassing
- Restrict who can push

### 2. 禁止直接 push main

```bash
# 团队约定：main 只通过 PR 合并
# 本地钩子辅助（.git/hooks/pre-push）
#!/bin/sh
protected_branch='main'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
if [ "$current_branch" = "$protected_branch" ]; then
  echo "禁止直接 push 到 $protected_branch，请使用 PR"
  exit 1
fi
```

### 3. 签名提交（可选）

```bash
git config --global commit.gpgsign true
git config --global user.signingkey <KEY_ID>
```

---

## 九、实用别名

```bash
# ~/.gitconfig 或 git config --global
[alias]
  st = status -sb
  co = checkout
  br = branch
  ci = commit
  lg = log --oneline --graph --decorate --all -20
  last = log -1 HEAD --stat
  unstage = reset HEAD --
  amend = commit --amend --no-edit
  pushf = push --force-with-lease
  fetchall = fetch --all --prune
  cleanup = !git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d
```

使用：

```bash
git st
git lg
git cleanup   # 清理已合并的本地分支
```

---

## 十、常用场景速查

```bash
# 撤销工作区修改
git restore src/file.ts

# 撤销暂存
git restore --staged src/file.ts

# 回退提交（保留改动）
git reset --soft HEAD~1

# 回退提交（丢弃改动）
git reset --hard HEAD~1

# 查看某文件历史
git log -p -- src/file.ts

# 找回误删提交
git reflog
git cherry-pick <commit-hash>
```

---

## 小结

- 功能分支 + PR 是团队协作标准模式
- 个人分支用 rebase 保持历史整洁，公共分支用 merge
- Conventional Commits 便于自动生成 Changelog
- 保护 main、配置 `.gitignore`、善用 stash 与别名提升效率
