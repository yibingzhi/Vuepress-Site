---
title: Linux
createTime: 2024/11/19 10:54:14
permalink: /article/uwkdk9jv/
---
### 一、文件和目录操作命令

1. **ls（list）命令**：用于查看目录内容。
    - **基本格式**：`ls [选项] [目录或文件]`
    - **常用选项及示例**：
        - `-l`：以长格式显示文件和目录详细信息，包含权限、所有者、大小、修改时间等。例如：`ls -l` 可显示当前目录下所有文件和目录的详细情况。
        - `-a`：显示所有文件和目录，包括隐藏文件（文件名以“.”开头的文件）。比如：`ls -a` 会列出当前目录里的所有文件，包含隐藏的配置文件等。
        - `-h`：与 `-l` 一起使用时，以人类可读的方式显示文件大小，如 `ls -lh`，文件大小会显示为如“1.2K”“23M”这样直观的格式，便于查看。
        - `-R`：递归显示目录及其子目录中的内容，像 `ls -R /home` 会把 `/home` 目录及其所有子目录下的文件和目录都罗列出来。
2. **cd（change directory）命令**：用于切换目录。
    - **示例**：
        - `cd /home/user1`：切换到用户 `user1` 的家目录。
        - `cd..`：返回上一级目录，方便在目录层级中向上导航。
        - `cd /`：切换到根目录（“/”），是整个文件系统的最顶层目录。
3. **mkdir（make directory）命令**：用于创建目录。
    - **基本格式**：`mkdir [选项] 目录名`
    - **常用选项及示例**：
        - `mkdir mydir`：在当前目录下创建名为 `mydir` 的新目录。
        - `mkdir -p dir1/dir2`：递归创建多层目录，即若 `dir1` 不存在，会先创建 `dir1`，然后在其下创建 `dir2`。例如创建
          `/test1/test2` 这样的嵌套目录结构时就可以使用此命令。
4. **rmdir（remove directory）命令**：用于删除空目录。
    - **示例**：`rmdir mydir` 可以删除名为 `mydir` 的当前为空的目录。若目录非空，则无法直接用此命令删除，需要使用 `rm -r`
      命令（后文会介绍）。
5. **cp（copy）命令**：用于复制文件和目录。
    - **基本格式**：`cp [选项] 源文件或目录 目标文件或目录`
    - **常用选项及示例**：
        - `cp file1.txt /home/user1/`：将当前目录下的 `file1.txt` 文件复制到 `/home/user1` 目录下。
        - `cp -r dir1 dir2`：递归复制目录 `dir1` 的所有内容到 `dir2`（若 `dir2` 不存在会创建），常用于复制整个目录树结构，比如备份某个项目目录等情况。
6. **mv（move）命令**：用于移动文件和目录（也可用于重命名）。
    - **示例**：
        - `mv file1.txt file2.txt`：将 `file1.txt` 重命名为 `file2.txt`，相当于在同一目录下移动并更改文件名。
        - `mv dir1 /home/user2/`：把 `dir1` 目录移动到 `/home/user2` 目录下，实现目录位置的转移。
7. **rm（remove）命令**：用于删除文件和目录。
    - **基本格式**：`rm [选项] 文件或目录`
    - **常用选项及示例**：
        - `rm -f file.txt`：强制删除 `file.txt` 文件，不会提示确认信息，常用于批量删除文件或者确定要删除且无需确认的情况，但使用要谨慎以防误删重要文件。
        - `rm -r dirname`：递归删除 `dirname` 目录及其内部所有文件和子目录，比如删除一个包含多个子文件和子目录的项目目录时使用；
          `rm -rf dirname` 则是强制递归删除，更加“果断”，同样需谨慎操作。

### 二、用户和用户组管理命令

1. **useradd 命令**：用于添加新用户。
    - **基本格式**：`useradd [选项] 用户名`
    - **常用选项及示例**：
        - `useradd user2`：添加名为 `user2` 的新用户，同时会在 `/home` 目录下创建对应的家目录，并且分配默认的用户
          ID（UID）等基础配置。
        - `useradd -u 1002 -g group1 user3`：指定用户 `user3` 的 UID 为 1002，并加入到 `group1` 用户组，方便按照特定需求来创建用户并关联用户组。
2. **passwd 命令**：用于设置用户密码。
    - **示例**：`passwd user2` 可以为用户 `user2` 设置密码，输入命令后按系统提示输入新密码并再次确认新密码即可。普通用户只能修改自己的密码，而
      root 用户可以修改任何用户的密码。
3. **userdel 命令**：用于删除用户。
    - **示例**：`userdel user2` 删除用户 `user2`，不过默认情况下不会删除其家目录；若要同时删除其家目录，可以使用
      `userdel -r user2`，这样能彻底清除与该用户相关的所有文件痕迹，但也要谨慎操作以防误删有用数据。
4. **usermod 命令**：用于修改用户信息。
    - **常用示例**：
        - `usermod -g new_group user1`：将用户 `user1` 从原来所在的用户组变更到 `new_group`
          用户组，实现用户组归属的调整，以便改变用户对资源访问的权限范围等。
        - `usermod -l new_name user1`：把用户 `user1` 的用户名更改为 `new_name`，比如用户需要更换更合适的登录名称时可使用此操作。
5. **groupadd 命令**：用于添加用户组。
    - **示例**：`groupadd group2` 可以添加名为 `group2` 的新用户组，创建后可用于对多个用户进行归类管理，便于统一设置权限等操作。
6. **groupdel 命令**：用于删除用户组。
    - **示例**：`groupdel group2` 删除名为 `group2` 的用户组，不过前提是该组没有用户关联，若有用户关联需要先将用户从该组移除，才能成功删除用户组。
7. **gpasswd 命令**：用于管理用户组中的成员。
    - **常用示例**：
        - `gpasswd -a user1 group1`：把用户 `user1` 添加到 `group1` 用户组中，使 `user1` 具备该组相应的权限等。
        - `gpasswd -d user1 group1`：将用户 `user1` 从 `group1` 用户组中移除，改变用户所属的分组关系，进而影响其权限范围。

### 三、权限管理命令

1. **chmod（change mode）命令**：用于修改文件和目录的权限。
    - **符号模式示例**：
        - `chmod u+x file.txt`：给文件 `file.txt` 的所有者（user）添加执行权限，其中“u”代表所有者，“+”表示添加权限，“x”代表执行权限。同理，
          `g-w` 表示去除所属用户组（group）的写权限，`o-r` 表示去除其他用户（others）的读权限，如 `chmod g-w,o-r file.txt`。
    - **数字模式示例**：将 `rwx`（读、写、执行权限）分别用数字表示（`r = 4`，`w = 2`，`x = 1`），然后通过三组权限对应的数字相加来设置权限。例如
      `chmod 754 file.txt`，意味着给所有者设置 `rwx`（`4 + 2 + 1 = 7`）权限，给所属用户组设置 `r - x`（`4 + 1 = 5`）权限，给其他用户设置
      `r--`（`4`）权限。
2. **chown（change owner）命令**：用于修改文件和目录的所有者及所属用户组。
    - **示例**：
        - `chown user1:group1 file.txt`：将文件 `file.txt` 的所有者改为 `user1`，所属用户组改为 `group1`
          ，明确文件归属关系，便于后续权限管理等操作。
        - `chown -R user1:group1 dir1`：递归地将目录 `dir1` 及其内部所有文件和子目录的所有者和所属用户组都变更为 `user1`
          和 `group1`（`-R` 表示递归操作），常用于整个目录树的归属权变更场景，比如项目交接后更改目录所有者情况等。

### 四、文本处理命令

1. **cat（concatenate）命令**：用于查看文本文件内容，简单地将文件全部内容输出显示。
    - **示例**：`cat file.txt` 可直接显示 `file.txt` 文件内容，比较适合文件内容较少的情况，若文件内容很长则会快速滚动显示完，不利于查看细节。
2. **more 命令**：用于分页查看文件内容，便于查看较长的文本文件。
    - **操作方式及示例**：输入 `more file.txt` 后，按回车键逐行查看内容，按空格键可以翻页查看后续内容，按 `q`
      键可退出查看模式。例如查看系统日志文件（通常内容较长）时，可使用 `more` 命令方便地逐页浏览。
3. **less 命令**：功能类似 `more`，但功能更强大，支持向前、向后翻页等操作。
    - **操作方式及示例**：使用 `less file.txt` 打开文件后，可通过 `Page Up` 和 `Page Down` 键向前、向后翻页，还能通过 `/`
      输入关键字进行搜索，找到文件中包含指定关键字的位置，查看完按 `q` 键退出。常用于需要灵活浏览和查找内容的长文本文件查看场景。
4. **nano 命令**：一个简单易用的文本编辑器，适合初学者快速编辑简单的文本文件。
    - **操作示例**：`nano file.txt` 打开 `file.txt` 文件进行编辑，在编辑区域可直接输入、修改文字内容，编辑完成后按
      `Ctrl + X` 组合键，然后按提示保存（输入 `Y` 确认保存，按回车键）或不保存（输入 `N`）并退出。
5. **vim 命令**：功能强大但相对复杂的文本编辑器，有命令模式、插入模式、末行模式等多种工作模式。
    - **基本操作示例**：
        - 打开文件：`vim file.txt`，刚打开时处于命令模式，在此模式下可以进行一些诸如复制、粘贴、删除行等操作（有对应的快捷键）。
        - 进入插入模式：按 `i` 键进入插入模式，此时可以进行文本输入操作，就像在普通文本编辑器里一样输入文字内容。
        - 保存并退出：编辑完后按 `Esc` 键回到命令模式，然后输入 `:wq`（保存并退出）；若不想保存修改直接退出可输入 `:q!`
          （强制不保存退出）。

6. **grep（global search regular expression and print）命令**：用于在文本文件中搜索指定的字符串。
    - **基本格式**：`grep [选项] "关键字" 文件`
    - **常用选项及示例**：
        - `grep "hello" file.txt`：在 `file.txt` 文件中搜索包含 `hello` 的行，并将这些行显示出来。
        - `-i` 选项可忽略大小写进行搜索，如 `grep -i "hello" file.txt`，即使文件里是“Hello”“HELLO”等形式也能被搜索到；`-r`
          选项用于递归搜索目录及其子目录下的文件，例如 `grep -r "error" /var/log` 可以在 `/var/log`
          目录及其所有子目录下的文件中搜索包含“error”的行，常用于查找系统日志中的错误信息等情况。
7. **sed（stream editor）命令**：用于对文本文件进行行编辑、替换等操作。
    - **基本格式及示例**：`sed 's/old_word/new_word/g' file.txt` 会将 `file.txt` 文件中所有的 `old_word` 替换为
      `new_word`（`s` 表示替换操作，`g` 表示全局替换，如果不加 `g` 则只替换每行第一次出现的地方）。例如将一个配置文件里的旧域名替换为新域名时就可以使用此命令进行批量替换操作。

### 五、网络管理命令

1. **ifconfig 命令（部分发行版使用 `ip` 命令替代部分功能）**：用于查看网络接口信息以及进行临时网络配置。
    - **查看信息示例**：
        - `ifconfig`：可以查看当前系统的网络接口（如以太网接口 `eth0`、无线接口 `wlan0` 等）的 IP 地址、MAC
          地址、网络状态等信息，快速了解网络连接基本情况。
        - `ifconfig eth0`：查看指定接口 `eth0` 的详细信息，方便排查特定网络接口的问题。
    - **临时配置示例（重启后失效）**：`ifconfig eth0 192.168.1.100 netmask 255.255.255.0` 可以给以太网接口 `eth0` 临时配置
      IP 地址为 `192.168.1.100`，子网掩码为 `255.255.255.0`，常用于临时改变网络地址等简单场景，不过重启系统后配置就会丢失。
2. **ip 命令**：功能更强大的网络管理命令，涵盖了更多网络相关操作，逐步替代部分 `ifconfig` 的功能。
    - **查看信息示例**：
        - `ip addr show`：可以查看网络接口的 IP 地址等相关信息，类似 `ifconfig` 的功能，能清晰展示各接口的网络配置情况。
        - `ip link show`：查看网络接口的链路层信息，如接口状态（是开启还是关闭等），有助于深入排查网络硬件层面的连接问题。
    - **临时配置示例（重启后失效）**：`ip addr add 192.168.1.100/24 dev eth0` 同样可以给 `eth0` 接口添加指定 IP 地址（`/24`
      表示子网掩码的一种简略表示，对应 `255.255.255.0`），用于临时调整网络接口的地址配置。

### 六、进程管理命令

1. **ps（process status）命令**：用于查看当前系统中的进程状态信息。
    - **基本格式及常用示例**：
        - `ps aux`：显示所有用户（a）的所有进程（u）的详细信息（x，包括没有控制终端的进程），会列出进程的 PID（进程
          ID）、TTY（终端设备）、STAT（进程状态）、TIME（累计运行时间）、COMMAND（执行的命令）等关键信息，方便全面了解系统中正在运行的进程情况，常用于排查系统性能问题或者查看某个程序是否在运行等场景。
        - `ps -ef`：以全格式显示所有进程信息，和 `ps aux` 类似但格式稍有不同，同样可以看到各进程的详细情况，对于分析进程之间的关系等有帮助。
2. **kill 命令**：用于终止（杀死）进程。
    - **基本格式及示例**：`kill PID`（PID 为进程 ID），例如 `kill 1234` 可以终止进程 ID 为 1234
      的进程，常用于强制关闭某个出现故障或者不再需要运行的程序。不过有些进程可能无法直接用普通 `kill` 命令关闭，这时可以使用
      `kill -9 PID`（`-9` 表示强制终止进程，发送 `SIGKILL` 信号），但这种强制终止可能导致进程未保存的数据丢失等问题，需谨慎使用。
3. **top 命令**：实时动态地查看系统中各个进程的资源占用情况，类似 Windows 系统中的任务管理器。
    - **操作及示例**：输入 `top` 命令后，会实时显示系统中 CPU 使用率最高的进程、内存占用最多的进程等信息，并且每隔一定时间（默认
      3 秒左右）更新一次数据。通过按 `q` 键可退出 `top` 查看模式。常用于实时监控系统性能，查看哪些进程消耗资源过多，以便进行相应的优化或故障排查操作。

### 七、系统管理命令

1. **uname（Unix name）命令**：用于获取系统相关信息。
    - **常用选项及示例**：
        - `uname -a`：显示系统的所有信息，包括内核名称、内核版本、主机名、硬件平台、操作系统等，例如
          `Linux server1 5.4.0-125-generic #141-Ubuntu SMP Fri Jun 18 11:18:15 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux`
          ，有助于快速了解当前 Linux 系统的基础配置情况，在进行系统维护、软件安装兼容性判断等场景时可能会用到。
        - `uname -r`：只显示