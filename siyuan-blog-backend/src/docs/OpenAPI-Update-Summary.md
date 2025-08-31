# OpenAPI 文档更新总结

## 概述

本次更新为 SiyuanBlog OpenAPI 文档添加了新的 home 和 about 模块的 API 定义，保持了与现有 API 的一致性和兼容性。

## 新增 Tags

添加了两个新的 API 分组标签：

- `backend/home` - 首页相关 API
- `backend/about` - 关于页面相关 API

## Home 模块 API (`/api/home`)

### 新增路径

1. **GET /home/data**
   - 描述：获取首页完整数据
   - 参数：count (query, optional) - 推荐文档数量，默认 12
   - 返回：首页所需的所有数据，包括个人信息、设置、统计、推荐文档等

2. **GET /home/profile**
   - 描述：获取个人信息
   - 返回：姓名、头像URL、个人简介

3. **GET /home/settings**
   - 描述：获取首页设置
   - 返回：首页显示相关的配置选项

4. **GET /home/social**
   - 描述：获取社交链接
   - 返回：邮箱、GitHub、个人网站链接

5. **GET /home/stats**
   - 描述：获取博客统计
   - 返回：笔记本数量、文档数量、访问量、运行天数

6. **POST /home/recommended**
   - 描述：获取推荐文档
   - 参数：count (body) - 推荐文档数量
   - 返回：推荐文档列表，包含摘要信息

## About 模块 API (`/api/about`)

### 新增路径

1. **GET /about/info**
   - 描述：获取关于页面完整信息
   - 返回：个人信息、配置、统计等完整数据（兼容前端现有路由）

2. **GET /about/me**
   - 描述：获取个人基本信息
   - 返回：姓名、头像URL、个人简介

3. **GET /about/config**
   - 描述：获取关于页面配置
   - 返回：about设置、社交链接、技术栈的完整配置

4. **GET /about/settings**
   - 描述：获取关于页面设置
   - 返回：显示控制选项（是否显示联系信息、技术栈、统计等）

5. **GET /about/social**
   - 描述：获取社交链接
   - 返回：邮箱、GitHub、个人网站链接

6. **GET /about/tech-stack**
   - 描述：获取技术栈
   - 返回：技术栈配置数组，包含名称和类型

7. **GET /about/stats**
   - 描述：获取博客统计
   - 返回：笔记本数量、文档数量、访问量、运行天数

## 数据结构规范

### 统一响应格式

所有 API 都使用统一的响应格式：

```json
{
  "code": 0,
  "msg": "success message",
  "data": { /* actual data */ }
}
```

### 主要数据类型

#### Profile Info
```json
{
  "name": "string",
  "avatarUrl": "string", 
  "bio": "string"
}
```

#### Home Settings
```json
{
  "showProfile": "boolean",
  "showSocialLinks": "boolean", 
  "showStats": "boolean",
  "maxRecommendedArticles": "integer",
  "profileCollapsible": "boolean"
}
```

#### About Settings
```json
{

}
```

#### Social Links
```json
{
  "email": "string",
  "github": "string",
  "website": "string"
}
```

#### Blog Stats
```json
{
  "notebookCount": "integer",
  "documentCount": "integer",
  "visitCount": "integer",
  "runningDays": "integer"
}
```

#### Tech Stack Item
```json
{
  "name": "string",
  "type": "string"
}
```

#### Recommended Doc
```json
{
  "id": "string",
  "name": "string", 
  "notebookName": "string",
  "hCtime": "string",
  "hMtime": "string",
  "summary": "string"
}
```

## 安全认证

所有新增的 API 都使用与现有 API 相同的安全认证方式：

- **认证类型**: API Key
- **位置**: Header
- **参数名**: Authorization

## 版本兼容性

### 保持兼容

- 没有修改任何现有的 API 路径
- 保持了原有的 tags 和 API 结构
- 响应格式与现有 API 保持一致

### 前端兼容

- `/about/info` 路径专门为兼容前端现有代码而设计
- 数据结构完全匹配前端组件的需求
- 保持了与原有兼容路由相同的功能

## API 完整列表

### 现有 API (保持不变)
```
POST /api/notebook/lsNotebooks     # Siyuan内核API
POST /api/filetree/getDoc          # Siyuan内核API  
POST /api/filetree/listDocsByPath  # Siyuan内核API
POST /api/notebook/getNotebookInfo # Siyuan内核API
GET  /config                       # 配置管理API
GET  /config/active               # 配置管理API
GET  /config/{configKey}          # 配置管理API
PUT  /config/{configKey}          # 配置管理API
POST /notebooks                   # 后端笔记本API
POST /docs                        # 后端文档API
POST /doc                         # 后端文档API
POST /recommended                 # 后端推荐API
```

### 新增 API
```
# Home 模块
GET  /home/data                   # 首页完整数据
GET  /home/profile               # 个人信息
GET  /home/settings              # 首页设置
GET  /home/social                # 社交链接
GET  /home/stats                 # 博客统计
POST /home/recommended           # 推荐文档

# About 模块  
GET  /about/info                 # 关于页面完整信息
GET  /about/me                   # 个人基本信息
GET  /about/config               # 关于页面配置
GET  /about/settings             # 关于页面设置
GET  /about/social               # 社交链接
GET  /about/tech-stack           # 技术栈
GET  /about/stats                # 博客统计
```

## 使用说明

### 开发环境
- 服务器地址：`http://127.0.0.1:8000/api/`
- 所有路径都基于此基础地址

### 前端集成
- HomeView.vue 可使用 `/home/data` 获取完整数据
- AboutView.vue 可使用 `/about/info` 获取完整信息
- 各组件也可以调用具体的子 API 获取特定数据

### API 测试
可以使用 Apifox 或其他 API 测试工具：
- 导入更新后的 OpenAPI JSON 文件
- 配置正确的服务器地址和认证信息
- 测试各个新增的 API 端点

## 未来扩展

该架构设计支持未来的扩展：

1. **新增模块**：可以继续添加新的 tags 和 API 路径
2. **版本控制**：可以在路径中添加版本号，如 `/v2/home/data`
3. **功能增强**：可以为现有 API 添加新的参数和响应字段
4. **缓存策略**：可以为不同类型的 API 添加不同的缓存头

本次更新确保了 API 文档的完整性和一致性，为前后端开发提供了清晰的接口规范。
