# 笔记本白名单功能使用说明

## 功能概述

笔记本白名单功能允许您控制哪些思源笔记本可以通过API访问，提高博客的安全性和内容控制。

## 功能特性

- ✅ 支持启用/禁用白名单功能
- ✅ 可配置允许访问的笔记本列表
- ✅ 自动过滤API返回的笔记本和文档
- ✅ 支持环境变量配置
- ✅ 支持配置文件管理
- ✅ 提供管理API接口

## 配置方式

### 方式1: 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 是否启用白名单功能
NOTEBOOK_WHITELIST_ENABLED=true

# 允许的笔记本ID列表，用逗号分隔
NOTEBOOK_WHITELIST_IDS=notebook-id-1,notebook-id-2,notebook-id-3
```

### 方式2: 配置文件管理

配置文件位置：`src/config/notebook_whitelist.json`

```json
{
  "enabled": true,
  "whitelistedNotebooks": [
    {
      "id": "notebook-id-1",
      "name": "公开笔记本1",
      "description": "这是一个示例笔记本配置"
    },
    {
      "id": "notebook-id-2", 
      "name": "公开笔记本2",
      "description": "这是另一个示例笔记本配置"
    }
  ]
}
```

### 方式3: API接口管理

#### 获取白名单配置
```http
GET /api/note/whitelist
```

响应示例：
```json
{
  "code": 0,
  "msg": "获取白名单配置成功",
  "data": {
    "enabled": true,
    "whitelistedNotebooks": [
      {
        "id": "notebook-id-1",
        "name": "公开笔记本1",
        "description": "这是一个示例笔记本配置"
      }
    ]
  }
}
```

#### 更新白名单配置
```http
POST /api/note/whitelist
Content-Type: application/json

{
  "enabled": true,
  "whitelistedNotebooks": [
    {
      "id": "notebook-id-1",
      "name": "公开笔记本1",
      "description": "允许公开访问的笔记本"
    },
    {
      "id": "notebook-id-2",
      "name": "技术博客",
      "description": "技术相关的文章"
    }
  ]
}
```

## 获取笔记本ID

要配置白名单，您需要先获取思源笔记中笔记本的ID：

1. 在思源笔记中打开笔记本
2. 查看笔记本的属性或URL中的ID
3. 或者临时禁用白名单，调用 `/api/note/notebooks` 接口查看所有笔记本的ID

## 工作原理

### 过滤逻辑

1. **白名单禁用时**：允许访问所有笔记本
2. **白名单启用但为空**：拒绝访问所有笔记本  
3. **白名单启用且有配置**：只允许访问白名单中的笔记本

### 影响的API接口

以下接口会应用白名单过滤：

- `POST /api/note/notebooks` - 获取笔记本列表
- `POST /api/note/docs` - 获取文档列表
- `POST /api/note/recommended` - 获取推荐文档
- 所有需要访问笔记本内容的接口

### 安全保护

- 非白名单笔记本的文档无法通过API访问
- 推荐文章只从白名单笔记本中选择
- 提供详细的日志记录（开发环境）

## 使用示例

### 场景1：公开博客
```json
{
  "enabled": true,
  "whitelistedNotebooks": [
    {
      "id": "blog-public",
      "name": "公开博客",
      "description": "对外公开的博客文章"
    }
  ]
}
```

### 场景2：分类内容
```json
{
  "enabled": true,
  "whitelistedNotebooks": [
    {
      "id": "tech-blog",
      "name": "技术博客",
      "description": "技术相关文章"
    },
    {
      "id": "life-blog", 
      "name": "生活随笔",
      "description": "生活感悟和随笔"
    }
  ]
}
```

### 场景3：临时禁用
```json
{
  "enabled": false,
  "whitelistedNotebooks": []
}
```

## 注意事项

1. **笔记本ID必须准确**：确保配置的笔记本ID与思源笔记中的实际ID一致
2. **配置文件优先级**：配置文件的设置会覆盖环境变量设置
3. **实时生效**：配置更新后立即生效，无需重启服务
4. **备份配置**：建议在修改前备份配置文件
5. **日志监控**：建议在生产环境中监控相关日志

## 故障排除

### 问题1：笔记本不显示
- 检查笔记本ID是否正确
- 确认白名单功能是否启用
- 查看服务器日志

### 问题2：配置不生效
- 确认配置文件格式正确
- 检查文件权限
- 重新调用API更新配置

### 问题3：API返回403错误
- 确认请求的笔记本在白名单中
- 检查白名单配置是否为空

## 开发和测试

运行测试脚本：
```bash
npx ts-node src/scripts/test-whitelist.ts
```

查看开发日志：
```bash
# 确保 NODE_ENV=development
npm run dev
```

## 相关文件

- `src/config/notebook_whitelist.json` - 白名单配置文件
- `src/config/file-config.service.ts` - 配置服务
- `src/modules/note/note.service.ts` - 笔记服务（包含过滤逻辑）
- `src/modules/note/note.controller.ts` - 控制器（包含管理API）
- `src/modules/note/note.routes.ts` - 路由配置
- `src/scripts/test-whitelist.ts` - 测试脚本
