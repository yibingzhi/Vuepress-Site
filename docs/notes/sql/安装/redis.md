---
title: redis
createTime: 2024/11/16 20:57:14
permalink: /article/iemepmct/
---
# Redis 安装与配置指南

## 一、Windows 系统安装与配置

### 1. 下载和安装 Redis

1. **下载 Redis for Windows**

   - 访问 [Redis](https://github.com/tporadowski/redis/releases )。
  
   - 下载适合您系统的 Redis zip 包。

2. **解压 Redis**

   - 将下载的 zip 文件解压到您选择的目录，例如 `C:\Redis`。

3. **安装 Redis 作为 Windows 服务**

   - 打开命令提示符，以管理员身份运行。
   - 导航到 Redis 的解压目录，例如 `cd C:\Redis`。
   - 执行以下命令将 Redis 安装为 Windows 服务：

     ```bash
     redis-server --service-install redis.windows.conf
     ```

   - 启动 Redis 服务：

     ```bash
     redis-server --service-start
     ```

### 2. 配置 Redis

- **编辑 Redis 配置文件**

  - 打开 `redis.windows.conf` 文件，进行必要的配置更改。除了密码基本不要配置
  - 常用配置项包括：
    - **绑定地址**：设置为 `127.0.0.1` 以限制本地访问。// 
    - **端口**：默认 6379，可以根据需要更改。
    - **持久化**：启用 RDB 或 AOF 持久化。
    - **密码保护**：设置 `requirepass` 启用密码。

- **重启 Redis 服务**

  - 每次修改配置文件后，重启服务以应用更改：

    ```bash
    redis-server --service-stop
    redis-server --service-start
    ```

### 3. 测试 Redis

- 使用 Redis CLI 测试：

  ```bash
  redis-cli
  ```

- 检查连接：

  ```plaintext
  127.0.0.1:6379> ping
  PONG
  ```

## 二、Linux 系统安装与配置（以 Ubuntu 为例）

### 1. 安装 Redis

1. **更新系统包**

   - 更新系统的包管理器：

     ```bash
     sudo apt update
     sudo apt upgrade
     ```

2. **安装 Redis**

   - 使用 `apt` 包管理器安装 Redis：

     ```bash
     sudo apt install redis-server
     ```

3. **验证安装**

   - 检查 Redis 版本：

     ```bash
     redis-server --version
     ```

### 2. 配置 Redis

- **编辑 Redis 配置文件**

  - 打开 `/etc/redis/redis.conf` 进行编辑：

    ```bash
    sudo nano /etc/redis/redis.conf
    ```

  - 常用配置项：
    - **绑定地址**：默认 `127.0.0.1`，可设置为 `0.0.0.0` 允许远程连接。
    - **端口**：默认 6379。
    - **持久化**：根据需要启用 RDB 或 AOF。
    - **密码保护**：设置 `requirepass`。

- **重启 Redis 服务**

  - 修改配置后，重启服务：

    ```bash
    sudo systemctl restart redis-server
    ```

### 3. 测试 Redis

- 使用 Redis CLI 测试：

  ```bash
  redis-cli
  ```

- 检查连接：

  ```plaintext
  127.0.0.1:6379> ping
  PONG
  ```

## 三、注意事项

- **安全性**：无论是在 Windows 还是 Linux 上，确保配置防火墙和密码保护以防止未经授权的访问。
- **服务管理**：在 Windows 上使用服务管理器，在 Linux 上使用 `systemctl` 管理 Redis 服务。
- **配置备份**：在进行重大配置更改前，备份配置文件以便在需要时恢复。
