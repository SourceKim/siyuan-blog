# Layout 模块使用说明

## 功能概述

Layout 模块专门为前端 Header 和 Footer 组件提供数据接口，避免了它们对 about 模块的依赖，实现了模块间的解耦。

## API接口

### 获取 Layout 数据
```http
GET /api/layout/data
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取Layout数据成功",
  "data": {
    "header": {
      "siteName": "博主",
      "avatarUrl": "/default-avatar.png"
    },
    "footer": {
      "siteName": "博主",
      "bio": "欢迎来到我的博客，这里记录了我的技术学习和生活感悟。",
      "currentYear": 2024
    }
  }
}
```

## 数据来源

Layout 模块的数据来源于 `about_me.json` 配置文件：

```json
{
  "name": "博主",
  "avatarUrl": "/default-avatar.png",
  "bio": "欢迎来到我的博客，这里记录了我的技术学习和生活感悟。",
  "title": "全栈开发工程师"
}
```

## 前端使用

### 1. API 调用
```typescript
import { layoutApi } from '@/api/layout'

// 获取 Layout 数据
const layoutData = await layoutApi.getLayoutData()
```

### 2. Store 使用
```typescript
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

// 获取数据
await layoutStore.fetchLayoutData()

// 使用数据
const { headerData, footerData } = storeToRefs(layoutStore)
```

### 3. 组件中使用
```vue
<template>
  <div>
    <img :src="headerData?.avatarUrl" />
    <h1>{{ headerData?.siteName }}</h1>
    <p>{{ footerData?.bio }}</p>
  </div>
</template>

<script setup>
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'

const layoutStore = useLayoutStore()
const { headerData, footerData } = storeToRefs(layoutStore)

onMounted(() => {
  layoutStore.fetchLayoutData()
})
</script>
```

## 架构优势

### 1. 模块解耦
- Header 和 Footer 不再依赖 about 模块
- 各模块职责更加清晰
- 减少模块间的耦合度

### 2. 性能优化
- 专门的轻量级接口，只返回必要数据
- 避免加载 about 模块的完整数据
- 更快的响应速度

### 3. 维护性
- 布局相关逻辑集中管理
- 易于扩展和维护
- 清晰的API设计

## 文件结构

```
src/modules/layout/
├── layout.dto.ts          # 数据传输对象定义
├── layout.service.ts      # 业务逻辑服务
├── layout.controller.ts   # 路由控制器
└── layout.routes.ts       # 路由配置

src/api/layout.ts          # 前端API定义
src/stores/layout.ts       # 前端状态管理
```

## 注意事项

1. **数据同步**：Layout 数据来源于 `about_me.json`，修改配置后会自动生效
2. **缓存策略**：前端 store 实现了简单的缓存，避免重复请求
3. **错误处理**：提供了完整的错误处理机制
4. **类型安全**：前后端都使用了 TypeScript，确保类型安全

## 扩展建议

1. **添加缓存**：可以在服务端添加缓存机制，提高性能
2. **增加字段**：根据需要可以扩展更多布局相关字段
3. **主题支持**：可以扩展支持多主题配置
4. **国际化**：可以添加多语言支持
