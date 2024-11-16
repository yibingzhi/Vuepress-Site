---
title: npm、yarn、pnpm 设置最新国内镜像源
createTime: 2024/11/09 22:56:54
permalink: /article/0icmtj6y/
tags:
  - npm
  - yarn
  - pnpm
---
## npm

```BASH
#查询源
npm get registry
#设置源
# 国内 淘宝 镜像源
npm config set registry https://registry.npmmirror.com/
# 官方镜像源
npm config set registry https://registry.npmjs.org/
```

## pnpm

```BASH
# 查询源
pnpm get registry
# 设置源
# 国内 淘宝 镜像源
pnpm config set registry https://registry.npmmirror.com/
# 官方镜像源
pnpm config set registry https://registry.npmjs.org/
```

## yarn

```BASH
查询源
yarn config get registry
设置源
# 国内 淘宝 镜像源
yarn config set registry https://registry.npmmirror.com/
# 官方镜像源
yarn config set registry https://registry.yarnpkg.com/
```

## 镜像源集合

```json
{
  "npm": "https://registry.npmjs.org/",
  "yarn": "https://registry.yarnpkg.com/",
  "tencent": "https://mirrors.cloud.tencent.com/npm/",
  "cnpm": "https://r.cnpmjs.org/",
  "taobao": "https://registry.npmmirror.com/",
  "npmMirror": "https://skimdb.npmjs.com/registry/",
  "ali": "https://registry.npm.alibaba-inc.com/",
  "huawei": "https://mirrors.huaweicloud.com/repository/npm/",
  "163": "https://mirrors.163.com/npm/",
  "ustc": "https://mirrors.ustc.edu.cn/",
  "tsinghua": "https://mirrors.tuna.tsinghua.edu.cn/"
}
```

## 使用 nrm 切换镜像源

### 安装

```
npm install nrm -g
# or
sudo npm install nrm -g
```

### 使用

```
#列出所有的镜像源或查看当前使用的源
nrm ls
# 切换源
nrm use 
# 添加源
nrm add testRegistry https://baidu.com/
# 删除源
nrm del testRegistry
```