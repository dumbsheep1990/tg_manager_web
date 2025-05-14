# TG营销系统 - 前端项目

## 2025-05-07 开发更新

### TData账号管理实现

- 实现 `/src/view/tg/tdata/import/index.vue` 导入页面，支持文件上传、账号分组选择、账号等级设置
- 实现 `/src/view/tg/tdata/list/index.vue` 账号列表页面，支持账号搜索、详情查看、编辑和删除
- 改造 `/src/view/tg/tdata/index.vue` 为路由容器，完成导舐菜单实现

### API和路由更新

- 在 `/src/api/tg/tdata.js` 中实现完整的TData账号API接口
- 在 `/src/router/tg.js` 中更新路由配置，增加TData账号导入和列表子路由

### 其他功能

- 实现日期格式化功能，优化时间展示
- 使用Element Plus组件实现响应式页面布局

## 项目简介

TG营销系统前端项目是基于Vue.js开发的Telegram营销管理平台客户端，提供用户友好的界面用于管理电报账号、任务调度、消息发送等功能。项目基于gin-vue-admin模板二次开发，采用现代化的前端技术栈，包括Vue 3、Pinia、Element Plus等，为用户提供流畅的交互体验和强大的营销管理功能。

## 技术栈

- **核心框架**：Vue.js 3.x
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP客户端**：Axios
- **CSS预处理器**：SCSS


## 主要功能

- **账号管理**：电报账号的创建、编辑、分组和TData导入
- **任务管理**：营销任务的创建、调度和监控
- **消息管理**：消息模板创建和发送历史记录查看
- **TData管理**：TData文件上传和处理
- **系统仪表盘**：系统状态和数据统计可视化
- **用户管理**：系统用户权限和角色管理

## 项目安装

```bash
npm install
```

### 开发环境编译和热重载

```bash
npm run serve
```

### 生产环境构建

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

### 代码格式化

```bash
npm run lint
```

## 配置文件

项目中包含三个环境配置文件：

- `.env` - 基础配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

在这些文件中配置后端 API 的基础路径和其他必要的环境变量。

## 项目定制

可以在 `src/core/config.js` 文件中进行系统配置，包括：

- 页面标题
- 系统 logo
- 默认布局
- 主题颜色
- 其他系统配置

## TG营销系统特有功能

### 1. 账号管理模块

位于 `src/view/tg/account` 目录下，包含：

- 账号列表与管理
- 账号分组
- TData导入界面
- 账号状态监控

### 2. 任务管理模块

位于 `src/view/tg/task` 目录下，包含：

- 任务创建与配置
- 任务等待列表
- 任务执行记录
- 任务实时状态监控

### 3. 消息管理模块

位于 `src/view/tg/message` 目录下，包含：

- 消息模板管理
- 模板编辑器
- 发送历史记录

### 4. TData管理模块

位于 `src/view/tg/tdata` 目录下，包含：

- 文件上传
- 文件列表
- 导入状态跟踪

### 5. 仪表盘模块

位于 `src/view/tg/dashboard` 目录下，包含：

- 系统概览
- 数据统计图表
- 账号与任务状态分布

整理代码结构

```lua
web
 ├── babel.config.js
 ├── Dockerfile
 ├── favicon.ico
 ├── index.html                 -- 主页面
 ├── limit.js                   -- 助手代码
 ├── package.json               -- 包管理器代码
 ├── src                        -- 源代码
 │   ├── api                    -- api 组
 │   ├── App.vue                -- 主页面
 │   ├── assets                 -- 静态资源
 │   ├── components             -- 全局组件
 │   ├── core                   -- gva 组件包
 │   │   ├── config.js          -- gva网站配置文件
 │   │   ├── gin-vue-admin.js   -- 注册欢迎文件
 │   │   └── global.js          -- 统一导入文件
 │   ├── directive              -- v-auth 注册文件
 │   ├── main.js                -- 主文件
 │   ├── permission.js          -- 路由中间件
 │   ├── pinia                  -- pinia 状态管理器，取代vuex
 │   │   ├── index.js           -- 入口文件
 │   │   └── modules            -- modules
 │   │       ├── dictionary.js
 │   │       ├── router.js
 │   │       └── user.js
 │   ├── router                 -- 路由声明文件
 │   │   └── index.js
 │   ├── style                  -- 全局样式
 │   │   ├── base.scss
 │   │   ├── basics.scss
 │   │   ├── element_visiable.scss  -- 此处可以全局覆盖 element-plus 样式
 │   │   ├── iconfont.css           -- 顶部几个icon的样式文件
 │   │   ├── main.scss
 │   │   ├── mobile.scss
 │   │   └── newLogin.scss
 │   ├── utils                  -- 方法包库
 │   │   ├── asyncRouter.js     -- 动态路由相关
 │   │   ├── bus.js             -- 全局mitt声明文件
 │   │   ├── date.js            -- 日期相关
 │   │   ├── dictionary.js      -- 获取字典方法
 │   │   ├── downloadImg.js     -- 下载图片方法
 │   │   ├── format.js          -- 格式整理相关
 │   │   ├── image.js           -- 图片相关方法
 │   │   ├── page.js            -- 设置页面标题
 │   │   ├── request.js         -- 请求
 │   │   └── stringFun.js       -- 字符串文件
 |   ├── view -- 主要view代码
 |   |   ├── about -- 关于我们
 |   |   ├── dashboard -- 面板
 |   |   ├── error -- 错误
 |   |   ├── example --上传案例
 |   |   ├── iconList -- icon列表
 |   |   ├── init -- 初始化数据
 |   |   |   ├── index -- 新版本
 |   |   |   ├── init -- 旧版本
 |   |   ├── layout  --  layout约束页面
 |   |   |   ├── aside
 |   |   |   ├── bottomInfo     -- bottomInfo
 |   |   |   ├── screenfull     -- 全屏设置
 |   |   |   ├── setting        -- 系统设置
 |   |   |   └── index.vue      -- base 约束
 |   |   ├── login              --登录
 |   |   ├── person             --个人中心
 |   |   ├── superAdmin         -- 超级管理员操作
 |   |   ├── system             -- 系统检测页面
 |   |   ├── systemTools        -- 系统配置相关页面
 |   |   └── routerHolder.vue   -- page 入口页面
 ├── vite.config.js             -- vite 配置文件
 └── yarn.lock

```
