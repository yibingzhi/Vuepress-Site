---
pageLayout: home
externalLinkIcon: false
config:
  - type: hero
    full: true
    effect: dot-grid
    effectConfig:
      dotSize: 2
      gap: 28
      baseColor: '#0F4C5C'
      activeColor: '#1F7A6A'
      proximity: 120
      speedTrigger: 80
      shockRadius: 180
    hero:
      name: 橦栖云
      tagline: Engineering Notes
      text: 面向工程实践的技术笔记——Java / Spring / 前端 / 数据与运维，按可读、可复用、可保鲜来写。
      actions:
        - theme: brand
          text: 阅读笔记
          link: /blog/
        - theme: alt
          text: 技术栈索引
          link: /article/site-map/
        - theme: alt
          text: GitHub
          link: https://github.com/yibingzhi
          target: _blank
          rel: noopener noreferrer
  - type: features
    title: 笔记范围
    description: 按工程链路组织，不堆清单。
    features:
      - title: 后端与中间件
        details: Java 17/21、Spring Boot 3、微服务治理、消息与缓存一致性。
        link: /java/
        linkText: 进入 Java
      - title: 前端工程化
        details: Vue 3、Vite、TypeScript、路由与状态管理，偏生产脚手架。
        link: /frontend/
        linkText: 进入前端
      - title: 数据与运维
        details: MySQL / Redis / PostgreSQL，Linux、CI、可观测性与容器编排。
        link: /database/
        linkText: 进入数据库
---
