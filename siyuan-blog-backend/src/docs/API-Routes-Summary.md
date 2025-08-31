# API 路由架构更新总结

## 概述

本次更新移除了原有的兼容路由，新增了专门的 `home` 和 `about` 模块，使API架构更加清晰和模块化。

## 新增模块

### 1. Home 模块 (`/api/home`)

#### 路由列表
- `GET /api/home/data` - 获取首页完整数据
- `GET /api/home/profile` - 获取个人信息
- `GET /api/home/settings` - 获取首页设置
- `GET /api/home/social` - 获取社交链接
- `GET /api/home/stats` - 获取博客统计
- `POST /api/home/recommended` - 获取推荐文档

#### 主要功能
- 提供首页所需的所有数据
- 整合个人信息、设置、统计等数据
- 智能生成文档摘要
- 支持推荐文档数量控制

### 2. About 模块 (`/api/about`)

#### 路由列表
- `GET /api/about/info` - 获取关于页面完整信息（兼容前端现有路由）
- `GET /api/about/me` - 获取个人基本信息
- `GET /api/about/config` - 获取关于页面配置
- `GET /api/about/settings` - 获取关于页面设置
- `GET /api/about/social` - 获取社交链接
- `GET /api/about/tech-stack` - 获取技术栈
- `GET /api/about/stats` - 获取博客统计

#### 主要功能
- 提供关于页面的完整信息
- 管理个人信息、技术栈、社交链接
- 博客统计数据计算
- 灵活的配置管理

## 数据源

两个模块都基于 `config` 目录下的 JSON 文件：

- `about_me.json` - 个人基本信息
- `social_links.json` - 社交链接
- `tech_stack.json` - 技术栈配置

## 架构特点

### 1. 模块化设计
每个模块都包含完整的 MVC 结构：
- `*.dto.ts` - 数据传输对象定义
- `*.service.ts` - 业务逻辑层
- `*.controller.ts` - 控制器层
- `*.routes.ts` - 路由定义

### 2. 数据统一性
- 统一使用 `FileConfigService` 读取配置
- 统一使用 `NoteService` 获取文档数据
- 统一的错误处理和响应格式

### 3. 前端兼容性
- `about` 模块保留了 `/info` 路由以兼容现有前端代码
- 响应格式保持一致
- 数据结构向前兼容

## 移除内容

- 删除了 `routes.ts` 中的兼容路由：
  ```typescript
  // 已移除
  app.get(`${apiPrefix}/about/info`, (req, res) => configController.getAboutMe(req, res))
  ```

## 完整的 API 结构

```
/api
├── /notebooks          # Note模块：获取笔记本
├── /docs              # Note模块：获取文档列表
├── /doc               # Note模块：获取文档内容
├── /outline           # Note模块：获取文档大纲
├── /recommended       # Note模块：获取推荐文档
├── /config            # Config模块：配置管理
│   ├── /              # 获取所有配置
│   ├── /active        # 获取活跃配置
│   └── /{configKey}   # 配置的CRUD操作
├── /home              # Home模块：首页数据
│   ├── /data          # 获取首页完整数据
│   ├── /profile       # 获取个人信息
│   ├── /settings      # 获取首页设置
│   ├── /social        # 获取社交链接
│   ├── /stats         # 获取博客统计
│   └── /recommended   # 获取推荐文档
└── /about             # About模块：关于页面数据
    ├── /info          # 获取关于页面完整信息
    ├── /me            # 获取个人基本信息
    ├── /config        # 获取关于页面配置
    ├── /settings      # 获取关于页面设置
    ├── /social        # 获取社交链接
    ├── /tech-stack    # 获取技术栈
    └── /stats         # 获取博客统计
```

## 优势

1. **模块化**：每个模块职责清晰，便于维护
2. **可扩展**：新增功能时可以轻松扩展对应模块
3. **复用性**：服务层可以在不同模块间复用
4. **一致性**：统一的数据访问和错误处理
5. **兼容性**：保持与前端的向后兼容
