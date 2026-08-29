---
title: Shell 脚本实战
tags:
  - 运维
  - Shell
  - Bash
  - Linux
  - 自动化
  - DevOps
createTime: 2026/08/29 16:00:00
permalink: /ops/shell-scripting/
---

::: tip 保鲜说明（2026-08）
本文以 **bash 5.x**（GNU Bash）为准，在 Debian/Ubuntu、RHEL/CentOS Stream、macOS 默认 bash 3.2 上需注意关联数组等语法差异。生产脚本建议首行 `#!/usr/bin/env bash` 并注明最低版本。
:::

## 1. 为什么学 Shell？

| 场景 | Shell 的价值 |
|------|--------------|
| 部署发布 | 一条命令拉代码、构建、重启 |
| 巡检 | cron 查磁盘、进程、证书过期 |
| 批处理 | 日志切割、备份、批量改配置 |
| CI/CD | Jenkins/GitHub Actions 中大量步骤本质是 shell |

Python/Go 适合复杂逻辑；**胶水、运维、快速自动化**仍是 bash 主场。

---

## 2. 第一个脚本

```bash
#!/usr/bin/env bash
# deploy.sh — 示例部署脚本

set -euo pipefail

APP_NAME="myapp"
DEPLOY_DIR="/opt/${APP_NAME}"

echo "[$(date '+%F %T')] 开始部署 ${APP_NAME}"
cd "${DEPLOY_DIR}"
git pull origin main
./mvnw -q -DskipTests package
sudo systemctl restart "${APP_NAME}"
echo "部署完成"
```

赋予执行权限：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 3. `set -euo pipefail` 详解

### 3.1 各选项含义

| 选项 | 作用 |
|------|------|
| `-e` | 任一命令返回非 0 立即退出（errexit） |
| `-u` | 引用未定义变量报错（nounset） |
| `-o pipefail` | 管道中任一环节失败，整条管道失败 |

```bash
#!/usr/bin/env bash
set -euo pipefail

# 没有 set -e：下面失败后仍继续
false
echo "这行不会执行（有 set -e）"

# 没有 set -u：echo $UNDEFINED 静默空字符串
# 有 set -u：直接报错退出

# 没有 pipefail：false | true 退出码为 0
# 有 pipefail：退出码非 0
```

### 3.2 例外情况

```bash
# 预期可能失败的命令
if ! grep -q "pattern" file; then
  echo "not found"
fi

# 或临时关闭 -e
set +e
 risky_command
 rc=$?
 set -e

# 逻辑或（常用于探测）
command -v java >/dev/null || { echo "需要 Java"; exit 1; }
```

### 3.3 推荐模板

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'   # 可选：安全地处理带空格的文件名

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

---

## 4. Bash 基础语法

### 4.1 变量

```bash
name="world"
readonly VERSION=1.0
declare -i count=0
declare -a arr=(a b c)
declare -A map=([host]=db [port]=3306)

echo "Hello, ${name}"
echo "长度: ${#name}"
echo "默认值: ${UNDEFINED:-default}"
echo "赋值若空: ${VAR:=default}"
```

### 4.2 引号规则

| 引号 | 变量展开 | 命令替换 |
|------|----------|----------|
| 无引号 | 是 + 分词 | 是 |
| 双引号 `"` | 是 | 是 |
| 单引号 `'` | 否 | 否 |

```bash
file="my file.txt"
cat "$file"           # 正确
cat $file             # 错误：分成两个参数
echo "$(date +%Y)"    # 命令替换推荐 $()
```

### 4.3 条件判断

```bash
# 文件测试
[[ -f "$path" ]]      # 普通文件
[[ -d "$dir" ]]       # 目录
[[ -x "$bin" ]]       # 可执行
[[ -s "$f" ]]         # 非空

# 字符串/数值
[[ -z "$str" ]]       # 空串
[[ "$a" == "$b" ]]
[[ "$n" -gt 10 ]]

# 逻辑
[[ -f "$f" && -r "$f" ]]
```

**经典坑**：用 `[[ ]]` 而非 `[ ]`（bash 内建，支持 `&&`）；数值比较用 `-eq/-gt`，字符串用 `==`。

```bash
# 错误：[ $count -gt 0 ] 当 count 为空时报错
# 正确：
[[ "${count:-0}" -gt 0 ]]
```

### 4.4 循环

```bash
for f in /var/log/*.log; do
  [[ -f "$f" ]] || continue
  gzip -9 "$f"
done

while read -r line; do
  echo "$line"
done < input.txt

# C 风格
for ((i=0; i<10; i++)); do echo "$i"; done
```

**永远**用 `while read -r` 读行，避免 `for line in $(cat file)` 拆词。

### 4.5 case

```bash
case "${1:-}" in
  start)
    start_service
    ;;
  stop|restart)
    stop_service
    [[ "$1" == "restart" ]] && start_service
    ;;
  *)
    echo "用法: $0 {start|stop|restart}" >&2
    exit 1
    ;;
esac
```

---

## 5. 函数

```bash
log() {
  local level="$1"
  shift
  printf '[%s] [%s] %s\n' "$(date '+%F %T')" "$level" "$*" >&2
}

die() {
  log ERROR "$@"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "缺少命令: $1"
}

require_cmd curl
require_cmd jq

log INFO "检查通过"
```

要点：

- 用 `local` 避免污染全局
- 函数通过 `return 0/1` 或 `exit`（慎用 `exit`，会结束整个脚本）
- `$*` / `$@`：传参给子命令时用 `"$@"`

---

## 6. 脚本参数解析

### 6.1 位置参数

```bash
$0    # 脚本名
$1 $2 # 参数
$#    # 个数
"$@"  # 全部参数数组
$?    # 上条命令退出码
```

### 6.2 `getopts` 短选项

```bash
usage() {
  cat <<EOF
用法: $(basename "$0") [-f file] [-v] [-h]
  -f  配置文件路径
  -v  详细输出
  -h  帮助
EOF
}

VERBOSE=0
CONFIG=""

while getopts ":f:vh" opt; do
  case $opt in
    f) CONFIG="$OPTARG" ;;
    v) VERBOSE=1 ;;
    h) usage; exit 0 ;;
    :) die "选项 -$OPTARG 需要参数" ;;
    \?) die "未知选项 -$OPTARG" ;;
  esac
done
shift $((OPTIND - 1))   # 剩余位置参数

[[ -n "$CONFIG" ]] || die "必须指定 -f"
```

### 6.3 长选项（简单版）

```bash
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN=1; shift ;;
  --)
      shift; break ;;
    *)
      break ;;
  esac
done
```

复杂场景可用 `getopt`（外部命令）或直接用 Python `argparse`。

---

## 7. 陷阱 `trap` 与清理

### 7.1 退出时清理临时文件

```bash
TMPFILE="$(mktemp)"
trap 'rm -f "$TMPFILE"' EXIT

# 脚本任意位置 exit 都会删临时文件
```

### 7.2 捕获信号

```bash
cleanup() {
  echo "收到中断，清理中..."
  # 杀子进程、删锁文件
  exit 130
}
trap cleanup INT TERM

# 忽略 SIGHUP（可选，防 SSH 断开杀进程）
trap '' HUP
```

### 7.3 完整示例

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/var/run/mydeploy.lock"
TMP_DIR="$(mktemp -d)"

cleanup() {
  local rc=$?
  rm -rf "$TMP_DIR"
  rm -f "$LOCK_FILE"
  exit "$rc"
}
trap cleanup EXIT INT TERM

exec 9>"$LOCK_FILE"
flock -n 9 || { echo "另一个部署正在进行"; exit 1; }

# ... 部署逻辑
```

`flock` 防止并发部署；`trap EXIT` 保证锁释放。

---

## 8. 子进程与管道

```bash
# 子 shell：( ) 内变量不影响外
count=0
( count=1 )
echo "$count"   # 仍是 0

# 进程替换
diff <(sort a.txt) <(sort b.txt)

# 管道与 while（注意：while 在子 shell，外面改不了变量）
total=0
while read -r n; do
  total=$((total + n))
done < <(awk '{print $1}' data.txt)
echo "total=$total"
```

---

## 9. 实用片段库

### 9.1 重试

```bash
retry() {
  local max="$1" delay="$2"
  shift 2
  local i
  for ((i=1; i<=max; i++)); do
    if "$@"; then return 0; fi
    sleep "$delay"
  done
  return 1
}

retry 5 2 curl -fsS "https://api.example/health"
```

### 9.2 并行（谨慎控制度）

```bash
MAX_JOBS=4
for host in host{1..20}; do
  while (( $(jobs -r | wc -l) >= MAX_JOBS )); do sleep 0.2; done
  ping -c1 "$host" &>/dev/null &
done
wait
```

### 9.3 日志同时打屏和文件

```bash
exec > >(tee -a "/var/log/deploy.log") 2>&1
```

---

## 10. Cron 部署脚本完整示例

### 10.1 脚本 `deploy_myapp.sh`

```bash
#!/usr/bin/env bash
#
# 定时/手动部署 Spring Boot 应用
# 用法: ./deploy_myapp.sh [--branch main] [--profile prod]
#
set -euo pipefail

APP_NAME="myapp"
APP_USER="deploy"
BASE_DIR="/opt/${APP_NAME}"
REPO_DIR="${BASE_DIR}/repo"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"
LOG_DIR="/var/log/${APP_NAME}"
BRANCH="main"
PROFILE="prod"
JAVA_OPTS="-Xms512m -Xmx512m"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "${LOG_DIR}/deploy.log"; }
die() { log "ERROR: $*"; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2 ;;
    --profile) PROFILE="$2"; shift 2 ;;
    *) die "未知参数 $1" ;;
  esac
done

umask 027
mkdir -p "$LOG_DIR" "$RELEASES_DIR"
cd "$BASE_DIR"

LOCK="/tmp/${APP_NAME}.deploy.lock"
exec 200>"$LOCK"
flock -n 200 || die "部署锁占用"

TS="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${RELEASES_DIR}/${TS}"

trap 'log "部署失败，保留 release 目录供排查: ${RELEASE_DIR:-}"' ERR

log "=== 开始部署 branch=${BRANCH} profile=${PROFILE} ==="

# 1. 拉代码
if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone "git@github.com:org/${APP_NAME}.git" "$REPO_DIR"
fi
git -C "$REPO_DIR" fetch origin
git -C "$REPO_DIR" checkout "$BRANCH"
git -C "$REPO_DIR" pull origin "$BRANCH"
COMMIT="$(git -C "$REPO_DIR" rev-parse --short HEAD)"
log "当前 commit: $COMMIT"

# 2. 构建
mkdir -p "$RELEASE_DIR"
cp -a "$REPO_DIR/." "$RELEASE_DIR/"
cd "$RELEASE_DIR"
./mvnw -q -DskipTests clean package -P"${PROFILE}"
JAR="$(find target -maxdepth 1 -name '*.jar' ! -name '*-sources.jar' | head -1)"
[[ -f "$JAR" ]] || die "未找到 jar"

# 3. 健康检查函数
health_check() {
  local url="http://127.0.0.1:8080/actuator/health"
  retry 30 2 curl -fsS "$url" | grep -q '"status":"UP"'
}

# 4. 切换软链并重启
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
sudo systemctl stop "${APP_NAME}" || true
sudo cp "$JAR" "${BASE_DIR}/app.jar"
sudo systemctl start "${APP_NAME}"

log "等待应用启动..."
health_check || die "健康检查失败"

# 5. 清理旧 release（保留最近 5 个）
ls -1dt "${RELEASES_DIR}"/* 2>/dev/null | tail -n +6 | xargs -r rm -rf

log "=== 部署成功 commit=${COMMIT} release=${TS} ==="
```

### 10.2 systemd unit（片段）

```ini
[Unit]
Description=MyApp
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/myapp/current
ExecStart=/usr/bin/java ${JAVA_OPTS} -jar /opt/myapp/app.jar --spring.profiles.active=prod
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 10.3 crontab 条目

```cron
# 每天凌晨 3 点拉取 main 并部署（慎用自动部署生产）
0 3 * * * /opt/myapp/bin/deploy_myapp.sh --branch main --profile prod >> /var/log/myapp/cron.log 2>&1

# 每 5 分钟巡检
*/5 * * * * /opt/myapp/bin/health_watch.sh
```

**cron 环境变量极少**，脚本内显式 `PATH`：

```bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

---

## 11. 安全与规范

| 实践 | 原因 |
|------|------|
| 不硬编码密码 | 用环境变量、vault、`.env`（权限 600） |
| 引号包裹变量 | 防注入与分词 |
| 最小权限用户运行 | 不用 root 跑应用 |
| `shellcheck` 静态检查 | 提前发现常见错误 |
| 幂等脚本 | 重复执行结果一致 |
| 干跑 `--dry-run` | 先打印将执行的命令 |

```bash
# 危险：用户输入进 eval
eval "$user_input"   # 禁止

# 安全：白名单
allowed=(start stop restart)
[[ " ${allowed[*]} " == *" $1 "* ]] || die "非法命令"
```

---

## 12. 调试技巧

```bash
# 打印每条命令
set -x
# 关闭
set +x

# 或局部
set -x
critical_section
set +x

# 语法检查（不执行）
bash -n script.sh

# ShellCheck
shellcheck -x deploy.sh
```

---

## 13. Bash vs sh

| | bash | dash/sh |
|---|------|---------|
| 数组、关联数组 | 支持 | 不支持 |
| `[[ ]]` | 支持 | 不一定 |
| 脚本复杂度 | 高 | 极简 |

`/bin/sh` 在 Ubuntu 上常链到 `dash`，语法更苛刻。运维脚本写 `#!/usr/bin/env bash` 并避免在 sh 上跑复杂逻辑。

---

## 14. 常见错误对照

| 现象 | 原因 | 修复 |
|------|------|------|
| `unbound variable` | `set -u` + 未定义 | `${VAR:-}` |
| 管道后仍成功 | 无 `pipefail` | `set -o pipefail` |
| cron 不执行 | 路径/权限/CRLF | `which cmd`、`chmod +x`、`dos2unix` |
| 空格文件名炸 | 未引号 | `"$var"` |
| 整数比较报错 | 空字符串 | 默认值 |

---

## 15. 学习路径

1. 手写带 `set -euo pipefail` + `trap` 的部署脚本。
2. 用 `shellcheck` 修掉所有 warning。
3. 把重复逻辑抽成 `lib/common.sh` `source` 引入。
4. 对接 CI：GitHub Actions `run:` 复用同一脚本。
5. 复杂编排再考虑 Ansible / Terraform。

---

## 16. 速查

```bash
set -euo pipefail
"$@"                    # 保留参数
$(cmd) / `cmd`          # 命令替换，优先 $()
mktemp / trap / flock   # 临时文件、清理、锁
getopts                 # 短选项
[[ ]]                   # 条件测试
tee / logger            # 日志
```

---

## 17. 参考

- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/)
- [ShellCheck Wiki](https://www.shellcheck.net/wiki/)
- 本仓库：[Linux 运维](/article/linux/)、[Git 工作流](/article/git-workflow/)、[Kubernetes 详解](/article/k8s/)
