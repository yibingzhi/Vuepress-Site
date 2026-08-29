---
title: Linux
tags:
  - Linux
  - 运维
  - Shell
  - 服务器
createTime: 2024/11/19 10:54:14
permalink: /article/905y42ne/
---

::: tip 保鲜说明（2026-08）
本文以 **Ubuntu 22.04/24.04 LTS** 与 **RHEL 9 / Rocky 9** 为参考，命令在多数发行版通用。部分网络工具在最小化镜像中需额外安装（如 `net-tools`、`bind-utils`）。生产环境操作前务必确认权限与备份策略。
:::

## 1. 学习路径与心智模型

Linux 运维日常围绕五类资源：

| 资源 | 典型命令 | 出问题时的症状 |
|------|----------|----------------|
| 文件系统 | `ls` `find` `df` `du` | 磁盘满、权限拒绝 |
| 进程 | `ps` `top` `kill` | CPU/内存飙高、僵尸进程 |
| 网络 | `ss` `curl` `ping` | 连不上、超时、端口未监听 |
| 服务 | `systemctl` `journalctl` | 服务起不来、反复重启 |
| 用户与权限 | `chmod` `chown` `sudo` | Permission denied |

建议把本文当作**现场排障手册**：先定位资源类型，再查对应章节。

---

## 2. 文件与目录基础

### 2.1 路径与特殊目录

```bash
pwd                    # 当前目录
cd /var/log            # 绝对路径
cd ~/projects          # ~ 表示当前用户家目录
cd -                   # 回到上一次目录
```

| 路径 | 含义 |
|------|------|
| `/` | 根目录 |
| `/home/<user>` | 用户家目录 |
| `/etc` | 配置文件 |
| `/var/log` | 日志 |
| `/tmp` | 临时文件（重启可能清空） |
| `/usr/bin` | 用户命令 |
| `/opt` | 第三方软件 |

### 2.2 ls：列出目录

```bash
ls -lah                # 人类可读大小、包含隐藏文件、长格式
ls -lt                 # 按修改时间排序
ls -R /etc/nginx       # 递归
```

长格式权限解读：

```
-rwxr-xr-- 1 deploy deploy 4096 Aug 29 10:00 app.sh
│├─┤├─┤├─┤
│ u  g  o   (user / group / others)
│ rwx = 读(4)写(2)执行(1)
```

### 2.3 创建、复制、移动、删除

```bash
mkdir -p /data/app/logs
cp -a src/ dest/       # 归档复制，保留权限与时间戳
mv old.conf new.conf   # 重命名或移动
rm -f /tmp/cache/*     # 删文件
rm -rf build/          # 递归删目录 —— 极度谨慎
```

::: danger
`rm -rf /` 或 `rm -rf /*` 会摧毁系统。脚本里对变量做路径校验，必要时用 `rm -i` 或先 `echo` 预览。
:::

### 2.4 查看文件

```bash
cat /etc/os-release
less /var/log/syslog   # 可搜索：/pattern，退出 q
head -n 20 access.log
tail -f app.log        # 实时跟踪（排障常用）
tail -n 100 -f app.log # 先显示最后 100 行再跟踪
```

---

## 3. 权限管理（chmod / chown）

### 3.1 权限位

- **r (4)**：读；目录表示可 `ls`
- **w (2)**：写；目录表示可创建/删除文件
- **x (1)**：执行；目录表示可 `cd` 进入

```bash
chmod u+x deploy.sh           # 所有者加执行
chmod g-w secret.conf         # 组去掉写
chmod o-r private.key         # 其他人去掉读
chmod 755 app.sh              # rwxr-xr-x
chmod 640 config.env          # rw-r-----
```

常用权限：

| 模式 | 八进制 | 场景 |
|------|--------|------|
| 目录 | 755 | 公共可读、仅所有者可写 |
| 脚本 | 755 | 可执行 |
| 配置含密钥 | 600 | 仅所有者可读写 |
| 协作目录 | 775 + 组 | 同组可写 |

### 3.2 chown 与 chgrp

```bash
sudo chown deploy:deploy /opt/app -R
sudo chown root:root /etc/ssl/private.key
sudo chmod 600 /etc/ssl/private.key
```

### 3.3 特殊权限（了解）

- **setuid**：执行时以文件所有者身份运行（如 `passwd`）
- **setgid**：目录下新文件继承组
- **sticky**：如 `/tmp`，仅所有者可删自己的文件

```bash
ls -ld /tmp    # drwxrwxrwt 末尾 t 为 sticky
```

### 3.4 sudo 与 sudoers

```bash
sudo systemctl restart nginx
sudo -u postgres psql
visudo   # 编辑 /etc/sudoers，勿直接 vim 该文件
```

---

## 4. 进程管理（ps / top / kill）

### 4.1 ps：快照

```bash
ps aux | head
ps aux | grep java
ps -ef --forest          # 树形显示父子进程
ps -p 1234 -o pid,ppid,cmd,%cpu,%mem,etime
```

字段速记：`STAT` 中 `Z` 为僵尸进程，`D` 为不可中断睡眠（常等 IO）。

### 4.2 top / htop

```bash
top
# 交互：P 按 CPU，M 按内存，1 显示每核，k 杀进程，q 退出
```

```bash
htop    # 更友好，需安装
```

### 4.3 找占用端口的进程

```bash
sudo ss -ltnp | grep ':8080'
sudo lsof -i :8080
```

### 4.4 kill 信号

| 信号 | 数字 | 含义 |
|------|------|------|
| SIGTERM | 15 | 礼貌终止（默认） |
| SIGKILL | 9 | 强制杀死，不可捕获 |
| SIGHUP | 1 | 重载配置（部分守护进程） |

```bash
kill 1234
kill -15 1234
kill -9 1234           # 最后手段
killall -9 java        # 按名称 —— 慎用
pkill -f 'spring-boot' # 按命令行匹配
```

**排障顺序**：先 `SIGTERM` 等待优雅退出，无效再用 `-9`。

### 4.5 后台与 nohup

```bash
./long-task.sh &
jobs
fg %1
nohup ./app.sh > app.log 2>&1 &
disown
```

生产环境优先用 **systemd** 管理进程，而非裸 `nohup`。

---

## 5. 网络（ss / curl / ping）

### 5.1 ip 与 ss（替代 netstat）

```bash
ip addr show
ip route show
ss -tuln               # 监听中的 TCP/UDP
ss -tan state established
ss -ltnp | grep 443
```

### 5.2 curl 排障

```bash
curl -I https://example.com          # 只看响应头
curl -v http://127.0.0.1:8080/health # 详细握手
curl -X POST http://api.local/login \
  -H 'Content-Type: application/json' \
  -d '{"user":"admin","pass":"***"}' \
  --connect-timeout 5 --max-time 30
curl -o /dev/null -s -w '%{http_code} %{time_total}s\n' https://api.example.com
```

### 5.3 DNS 与连通性

```bash
ping -c 4 8.8.8.8
dig api.example.com +short
nslookup api.example.com
traceroute api.example.com    # 或 mtr
nc -zv db.internal 5432       # 端口探测
```

### 5.4 防火墙（概览）

```bash
# Ubuntu (ufw)
sudo ufw status
sudo ufw allow 22/tcp

# RHEL (firewalld)
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

---

## 6. systemd 与 journalctl

### 6.1 systemctl 常用

```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl enable nginx      # 开机自启
sudo systemctl disable nginx
sudo systemctl is-active nginx
sudo systemctl list-units --type=service --state=failed
```

### 6.2 单元文件位置

- `/usr/lib/systemd/system/`：包安装
- `/etc/systemd/system/`：管理员覆盖

修改后：

```bash
sudo systemctl daemon-reload
sudo systemctl restart myapp
```

### 6.3 journalctl 日志

```bash
journalctl -u nginx -n 100 --no-pager
journalctl -u myapp.service -f          # 实时
journalctl -u myapp --since "1 hour ago"
journalctl -u myapp --since "2026-08-29 09:00" --until "10:00"
journalctl -p err -b                    # 本次启动以来的错误
journalctl -k                           # 内核日志
```

持久化日志需配置 `/etc/systemd/journald.conf` 中 `Storage=persistent`。

### 6.4 简易 service 示例

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Spring Boot App
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/java -jar /opt/myapp/app.jar
Restart=on-failure
RestartSec=5
Environment=JAVA_OPTS=-Xms512m -Xmx512m

[Install]
WantedBy=multi-user.target
```

---

## 7. 磁盘（df / du）

### 7.1 df：文件系统使用率

```bash
df -h
df -ih                  # inode 使用率（小文件过多时满）
df -h /var
```

### 7.2 du：目录占用

```bash
du -sh /var/log/*
du -h --max-depth=1 /opt
du -sh /var/lib/docker  # 容器镜像常占满
```

### 7.3 找大文件

```bash
sudo find /var -type f -size +100M -exec ls -lh {} \; 2>/dev/null
sudo find / -xdev -type f -size +1G 2>/dev/null | head
```

### 7.4 清理思路

1. 日志：`journalctl --vacuum-size=500M`、应用 logrotate
2. 包缓存：`sudo apt clean` / `sudo yum clean all`
3. Docker：`docker system df` / `docker system prune`

---

## 8. find：查找文件

```bash
find /var/log -name "*.log"
find /opt/app -type f -mtime -7          # 7 天内修改
find /tmp -type f -atime +30 -delete     # 删除 30 天未访问 —— 先不加 -delete 预览
find . -type f -perm 0777                # 危险权限
find /etc -name "nginx.conf" 2>/dev/null
```

按大小：

```bash
find /data -type f -size +500M
```

执行命令：

```bash
find . -name "*.tmp" -print -delete
find . -name "*.sh" -exec chmod +x {} \;
```

---

## 9. grep：文本搜索

```bash
grep "ERROR" app.log
grep -i error app.log              # 忽略大小写
grep -n "Exception" app.log        # 显示行号
grep -C 3 "OutOfMemory" app.log    # 上下文 3 行
grep -r "password" /etc/nginx/     # 递归
grep -E 'ERROR|WARN' app.log       # 扩展正则
grep -v "health" access.log        # 反向匹配
zgrep "ERROR" app.log.1.gz         # 压缩日志
```

### 9.1 与管道结合

```bash
journalctl -u myapp --since today | grep -i exception | tail -20
ps aux | grep '[j]ava'   # 技巧：避免 grep 自身出现在结果中
```

---

## 10. awk 基础

awk 按列处理结构化文本，适合日志统计。

```bash
# 打印第 1、9 列（常见 combined 日志）
awk '{print $1, $9}' access.log

# 统计 HTTP 状态码
awk '{cnt[$9]++} END {for (k in cnt) print k, cnt[k]}' access.log

# 过滤状态码 5xx
awk '$9 >= 500 && $9 < 600' access.log

# 求第 10 列响应时间平均值（假设单位为秒）
awk '{sum+=$10; n++} END {if(n>0) print sum/n}' access.log
```

指定分隔符：

```bash
awk -F',' '{print $1, $3}' users.csv
```

---

## 11. sed 基础

sed 流式编辑，适合替换与删除行。

```bash
sed -n '10,20p' file.txt           # 打印 10-20 行
sed 's/error/ERROR/g' app.log      # 全局替换（默认只改每行首次）
sed 's/^#//g' config.txt           # 去掉行首 #
sed '/^$/d' file.txt               # 删除空行
sed -i.bak 's/old/new/g' conf      # 原地修改并备份 .bak
```

**注意**：`sed -i` 会直接改文件，生产环境先输出到临时文件验证。

---

## 12. SSH 远程管理

### 12.1 基本连接

```bash
ssh user@192.168.1.10
ssh -p 2222 deploy@bastion.example.com
ssh -i ~/.ssh/id_ed25519 deploy@prod
```

### 12.2 配置 ~/.ssh/config

```
Host prod
    HostName 10.0.0.5
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
```

之后：`ssh prod`

### 12.3 密钥与权限

```bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh-copy-id deploy@prod
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### 12.4 隧道与拷贝

```bash
scp file.txt deploy@prod:/opt/
scp -r ./dist/ deploy@prod:/var/www/
rsync -avz --progress ./build/ deploy@prod:/opt/app/

# 本地转发：访问内网数据库
ssh -L 5432:db.internal:5432 deploy@bastion
```

### 12.5 安全建议

- 禁用密码登录，仅密钥（`/etc/ssh/sshd_config`：`PasswordAuthentication no`）
- 禁止 root 直接 SSH（`PermitRootLogin no`）
- 使用堡垒机或 VPN

---

## 13. 环境变量与 PATH

### 13.1 查看与设置

```bash
echo $PATH
echo $HOME
env | sort
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH="$JAVA_HOME/bin:$PATH"
```

### 13.2 作用域

| 文件 | 场景 |
|------|------|
| `~/.bashrc` | 交互式 shell |
| `~/.profile` | 登录 shell |
| `/etc/environment` | 系统全局 |
| `/etc/profile.d/*.sh` | 系统脚本片段 |

```bash
source ~/.bashrc   # 使修改立即生效
```

### 13.3 单次命令带环境变量

```bash
JAVA_OPTS='-Xmx1g' ./start.sh
env MYSQL_HOST=127.0.0.1 ./migrate.sh
```

---

## 14. crontab 定时任务

### 14.1 用户 crontab

```bash
crontab -l
crontab -e
```

格式：

```
分 时 日 月 周 命令
*  *  *  *  *  /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
0  2  *  *  *  /opt/scripts/cleanup.sh
*/5 * * * *    /opt/scripts/healthcheck.sh
```

### 14.2 注意点

1. 使用**绝对路径**。
2. cron 环境变量很少，必要时在脚本里 `source` 或写全 `PATH`。
3. 重定向日志，避免邮件塞满。
4. 与 **systemd timer** 二选一；复杂调度可用 timer。

```bash
# systemd timer 示例
systemctl list-timers
```

### 14.3 /etc/cron.d

系统级任务：

```
# /etc/cron.d/myjob
0 3 * * * deploy /opt/backup.sh
```

---

## 15. 用户与组（补充）

```bash
id
whoami
groups
sudo useradd -m -s /bin/bash deploy
sudo passwd deploy
sudo usermod -aG docker deploy
sudo userdel -r olduser
```

---

## 16. 压缩与归档

```bash
tar -czvf archive.tar.gz /opt/app/config
tar -xzvf archive.tar.gz -C /tmp/
zip -r dist.zip dist/
unzip dist.zip
```

---

## 17. 性能与负载一瞥

```bash
uptime                 # load average
free -h                # 内存
vmstat 1 5
iostat -xz 1           # 磁盘 IO（sysstat 包）
mpstat -P ALL 1        # 每核 CPU
```

load average 高于 CPU 核数且持续，说明 CPU 或 IO 排队严重。

---

## 18. 现场排障检查清单

按顺序执行，避免遗漏：

### 18.1 服务不可用

```bash
# 1. 服务状态
sudo systemctl status myapp

# 2. 最近日志
journalctl -u myapp -n 200 --no-pager

# 3. 端口是否监听
ss -ltnp | grep 8080

# 4. 本地探活
curl -sf http://127.0.0.1:8080/actuator/health || echo FAIL

# 5. 磁盘与内存
df -h
free -h
```

### 18.2 磁盘满

```bash
df -h
du -sh /* 2>/dev/null | sort -h
journalctl --disk-usage
docker system df 2>/dev/null
```

### 18.3 CPU 高

```bash
top -c
ps aux --sort=-%cpu | head
# 对 Java：jstack <pid> 或 arthas
```

### 18.4 网络不通

```bash
ping -c 3 target
dig target
traceroute target
ss -tan | grep ESTAB | wc -l
curl -v telnet://host:port
```

### 18.5 权限问题

```bash
ls -la /path/to/file
namei -l /path/to/file    # 追踪路径每一级权限
id
```

---

## 19. 安全与审计

```bash
last | head              # 登录记录
sudo lastb | head        # 失败登录
sudo ausearch -m avc -ts recent   # SELinux（RHEL）
grep "Failed password" /var/log/auth.log
```

最小权限原则：服务用专用用户，不用 root 跑应用。

---

## 20. 常用一行命令速查

```bash
# 当前 shell 打开文件数
lsof -p $$ | wc -l

# 统计文件数
find . -type f | wc -l

# 去重计数
sort access.log | uniq -c | sort -rn | head

# 替换文本（perl 备选）
perl -pi -e 's/old/new/g' *.conf

# 批量重命名
rename 's/\.bak$//' *.bak
```

---

## 21. 小结

Linux 运维能力 = **命令熟练度** + **系统化排障思路**：

1. **权限**：`chmod`/`chown` 解决 Permission denied。
2. **进程**：`ps`/`top`/`kill` 定位占用与僵死。
3. **网络**：`ss`/`curl` 验证监听与连通。
4. **服务**：`systemctl` + `journalctl` 是 systemd 发行版的核心。
5. **磁盘**：`df`/`du`/`find` 防止写满。
6. **文本**：`grep`/`awk`/`sed` 处理日志。
7. **远程**：SSH 密钥与 `~/.ssh/config`。
8. **调度**：`crontab` 或 systemd timer。
9. **环境**：理解 `PATH` 与 export。

遇到问题时，先**复现 → 看日志 → 看资源 → 看变更**，再动手改配置或重启。养成「改之前备份、改之后验证」的习惯，是生产环境最重要的运维素养。
