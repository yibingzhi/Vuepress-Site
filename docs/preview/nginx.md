---
title: nginx
createTime: 2024/11/14 20:33:56
permalink: /article/bmua5kjy/
---


## 1.安装nginx

### 1. CentOS系Linux发⾏版可以使⽤yum来安装
```yaml
# 1. 安装EPEL仓库
sudo yum install epel-release

# 2. 更新repo
sudo yum update

# 3. 安装nginx
sudo yum install nginx

# 4. 验证安装
sudo nginx -v
```    



### 2.Debian、Ubuntu系列的Linux发⾏版可以使⽤apt来安装
```yaml
# 1.更新仓库信息
sudo apt update

# 2.安装nginx
sudo apt install nginx

# 3.验证安装
sudo nginx -v

```

## 2.Nginx的配置⽂件

Nginx的配置⽂件是nginx.conf，⼀般位于/etc/nginx/nginx.conf。
可以使⽤nginx -t来查看配置⽂件的位置和检查配置⽂件是否正确。

### 2.1 配置⽂件的结构
Nginx的配置⽂件是由⼀系列的指令组成的，每个指令都是由⼀个指令名和⼀个或者多个参数
组成的。
指令和参数之间使⽤空格来分隔，指令以分号;结尾，参数可以使⽤单引号或者双引号来包
裹。

配置⽂件分为以下⼏个部分：

```yaml
# 全局块
worker_processes  1;
events {
    # events块
}
 http {
    # http块
    server {
        # server块
        location / {
            # location块
        }
    }
 }
```
#### 2.1.1 全局块
全局块是配置⽂件的第⼀个块，也是配置⽂件的主体部分，主要⽤来设置⼀些影响Nginx服务
器整体运⾏的配置指令，主要包括配置运⾏Nginx服务器的⽤户（组）、允许⽣成的worker
process数、进程PID存放路径、⽇志存放路径和类型以及配置⽂件引⼊等。
```yaml

# 指定运⾏Nginx服务器的⽤户，只能在全局块配置
# 将user指令注释掉，或者配置成nobody的话所有⽤户都可以运⾏
# user [user] [group]
 # user nobody nobody;
 user  nginx;
 # 指定⽣成的worker进程的数量，也可使⽤⾃动模式，只能在全局块配置
worker_processes  1;
 # 错误⽇志存放路径和类型
error_log  /var/log/nginx/error.log warn;
 # 进程PID存放路径
pid        /var/run/nginx.pid;

```

#### 2.1.2 events块
events块是处理Nginx与用户之间请求处理相关配置，如：最大连接数、开启的连接数等。
```yaml
events {
    # 指定使⽤哪种⽹络IO模型，只能在events块中进⾏配置
    # use epoll
    # 每个worker process允许的最⼤连接数
    worker_connections  1024;
 }
```


#### 2.1.3 http块
http块是配置⽂件的主要部分，包括http全局块和server块
```yaml
 http {
    # nginx 可以使⽤include指令引⼊其他配置⽂件
    include       /etc/nginx/mime.types;
    # 默认类型，如果请求的URL没有包含⽂件类型，会使⽤默认类型
    default_type  application/octet-stream;  # 默认类型
    # 开启⾼效⽂件传输模式
    sendfile        on;
    # 连接超时时间
    keepalive_timeout  65;
    # access_log ⽇志存放路径和类型
    # 格式为：access_log  <path> [format [buffer=size] [gzip[=level]] 
[flush=time] [if=condition]];
    access_log  /var/log/nginx/access.log  main;
    # 定义⽇志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] 
"$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    # 设置sendfile最⼤传输⽚段⼤⼩，默认为0，表示不限制
    # sendfile_max_chunk 1m;
    # 每个连接的请求次数
    # keepalive_requests 100;
    # keepalive超时时间
    keepalive_timeout  65;
    # 开启gzip压缩
    # gzip  on;
    # 开启gzip压缩的最⼩⽂件⼤⼩
    # gzip_min_length 1k;
    # gzip压缩级别，1-9，级别越⾼压缩率越⾼，但是消耗CPU资源也越多
    # gzip_comp_level 2;
    # gzip压缩⽂件类型
    # gzip_types text/plain application/javascript application/x
javascript text/css application/xml text/javascript application/x-httpd
php image/jpeg image/gif image/png;
    # upstream指令⽤于定义⼀组服务器，⼀般⽤来配置反向代理和负载均衡
    upstream www.example.com {
        # ip_hash指令⽤于设置负载均衡的⽅式，ip_hash表示使⽤客户端的IP进⾏hash，
这样可以保证同⼀个客户端的请求每次都会分配到同⼀个服务器，解决了session共享的问题
        ip_hash;
        # weight ⽤于设置权重，权重越⾼被分配到的⼏率越⼤
        server 192.168.50.11:80 weight=3;
        server 192.168.50.12:80;
        server 192.168.50.13:80;
        server {
        # 参考server块的配置
    }
 }
```
#### 2.1.4 server块
server块是配置虚拟主机的，⼀个http块可以包含多个server块，每个server块就是⼀个虚拟主
机。
```yaml
 server {
    # 监听IP和端⼝
    # listen的格式为：
    # listen  [ip]:port [default_server] [ssl] [http2] [spdy] 
[proxy_protocol] [setfib=number] [fastopen=number] [backlog=number];
    # listen指令⾮常灵活，可以指定多个IP和端⼝，也可以使⽤通配符
    # 下⾯是⼏个实际的例⼦：
    # listen 127.0.0.1:80;  # 监听来⾃127.0.0.1的80端⼝的请求
    # listen 80;  # 监听来⾃所有IP的80端⼝的请求
    # listen *:80;  # 监听来⾃所有IP的80端⼝的请求，同上
    # listen 127.0.0.1;  # 监听来⾃来⾃127.0.0.1的80端⼝，默认端⼝为80
    listen       80;
    # server_name ⽤来指定虚拟主机的域名，可以使⽤精确匹配、通配符匹配和正则匹配等⽅式
    # server_name  example.org  www.example.org; # 精确匹配
    # server_name  *.example.org;                # 通配符匹配
    # server_name  ~^www\d+\.example\.net$;      # 正则匹配
    server_name  localhost;
    # location块⽤来配置请求的路由，⼀个server块可以包含多个location块，每个
location块就是⼀个请求路由
    # location块的格式是：
    # location [=|~|~*|^~] /uri/ { ... }
    # = 表示精确匹配，只有完全匹配上才能⽣效
    # ~ 表示区分⼤⼩写的正则匹配
    # ~* 表示不区分⼤⼩写的正则匹配
    # ^~ 表示普通字符匹配，如果匹配成功，则不再匹配其他location
    # /uri/ 表示请求的URI，可以是字符串，也可以是正则表达式
    # { ... } 表示location块的配置内容
    location / {
        # root指令⽤于指定请求的根⽬录，可以是绝对路径，也可以是相对路径
        root   /usr/share/nginx/html;  # 根⽬录
        # index指令⽤于指定默认⽂件，如果请求的是⽬录，则会在⽬录下查找默认⽂件
        index  index.html index.htm;  # 默认⽂件
    }
    # 下⾯是⼀些location的示例：
    location = / { # 精确匹配请求
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    location ^~ /images/ { # 匹配以/images/开头的请求
        root   /usr/share/nginx/html;
    }
    location ~* \.(gif|jpg|jpeg)$ { # 匹配以gif、jpg或者jpeg结尾的请求
        root   /usr/share/nginx/html;
    }
    location !~ \.(gif|jpg|jpeg)$ { # 不匹配以gif、jpg或者jpeg结尾的请求
        root   /usr/share/nginx/html;
    }
    location !~* \.(gif|jpg|jpeg)$ { # 不匹配以gif、jpg或者jpeg结尾的请求
        root   /usr/share/nginx/html;
    }
    # error_page ⽤于指定错误⻚⾯，可以指定多个，按照优先级从⾼到低依次查找
    error_page   500 502 503 504  /50x.html;  # 错误⻚⾯
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
 }


```
## 3.nginx常用命令

```yaml
 nginx               # 启动Nginx
 nginx -c filename   # 指定配置⽂件
 nginx -V            # 查看Nginx的版本和编译参数等信息
 nginx -t            # 检查配置⽂件是否正确，也可⽤来定位配置⽂件的位置
 nginx -s quit       # 优雅停⽌Nginx
 nginx -s stop       # 快速停⽌Nginx
 nginx -s reload     # 重新加载配置⽂件
 nginx -s reopen     # 重新打开⽇志⽂件
```
