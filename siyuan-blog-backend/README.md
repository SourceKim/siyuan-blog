# SiYuan Blog Backend

> 基于 Express + TypeScript + TypeORM + MySQL 的思源笔记博客后端 API 服务

## 🚀 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **包管理**: Yarn

## 📁 目录结构

```
siyuan-blog-backend/
├── src/
│   ├── controllers/       # 控制器
│   ├── services/         # 业务逻辑服务
│   ├── entities/         # 数据库实体
│   ├── repositories/     # 数据访问层
│   ├── routes/           # 路由配置
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── config/           # 配置文件
│   ├── database/         # 数据库配置
│   ├── migrations/       # 数据库迁移
│   └── index.ts          # 应用入口
├── dist/                 # 编译输出
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── env.example           # 环境变量示例
└── README.md            # 项目文档
```

## 🛠️ 开发环境

### 系统要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- Yarn >= 1.22.0

### 环境变量配置

复制环境变量模板：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```bash
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=siyuan_blog

# SiYuan 配置
SIYUAN_API_URL=http://localhost:6806
SIYUAN_TOKEN=

# CORS 配置
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 安装依赖

```bash
yarn install
```

### 数据库设置

1. **创建数据库**
   ```sql
   CREATE DATABASE siyuan_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **运行数据库迁移**
   ```bash
   yarn migration:run
   ```

### 启动开发服务器

```bash
# TypeScript 开发模式（推荐）
yarn dev:ts

# 或者编译后运行
yarn dev

# 访问 API
# http://localhost:8000/api
# 健康检查: http://localhost:8000/health
```

### 构建生产版本

```bash
# 编译 TypeScript
yarn build

# 启动生产服务器
yarn start
```

## 🏗️ 项目架构

### API 架构

```mermaid
graph TB
    A[Client Request] --> B[Express Router]
    B --> C[Middleware]
    C --> D[Controller]
    D --> E[Service Layer]
    E --> F[Repository]
    F --> G[TypeORM Entity]
    G --> H[MySQL Database]
    
    I[SiYuan API] --> E
```

### 数据库架构

```mermaid
erDiagram
    notebooks {
        id varchar(36) PK
        name varchar(255)
        icon varchar(50)
        sort int
        created_at timestamp
        updated_at timestamp
    }
    
    posts {
        id varchar(36) PK
        title varchar(255)
        content text
        excerpt text
        notebook_id varchar(36) FK
        tags json
        created_at timestamp
        updated_at timestamp
        published_at timestamp
    }
    
    notebooks ||--o{ posts : contains
```

### 服务层设计

```typescript
// 示例服务层结构
export class PostService {
  async getPosts(params: GetPostsParams): Promise<PaginatedPosts> {
    // 业务逻辑实现
  }
  
  async syncFromSiYuan(): Promise<SyncResult> {
    // SiYuan 数据同步逻辑
  }
}
```

## 🔌 API 接口

### 基础响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    timestamp: string
  }
}
```

### 主要接口

#### 文章管理

| 接口 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/posts` | GET | 获取文章列表 | `page`, `limit`, `tag`, `notebook` |
| `/api/posts/:id` | GET | 获取文章详情 | `id` |
| `/api/posts/sync` | POST | 同步文章数据 | - |

#### 笔记本管理

| 接口 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/notebooks` | GET | 获取笔记本列表 | - |
| `/api/notebooks/:id` | GET | 获取笔记本详情 | `id` |

#### SiYuan 集成

| 接口 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/siyuan/status` | GET | 检查连接状态 | - |

### 示例请求

```bash
# 获取文章列表
curl "http://localhost:8000/api/posts?page=1&limit=10"

# 获取文章详情
curl "http://localhost:8000/api/posts/123"

# 检查 SiYuan 状态
curl "http://localhost:8000/api/siyuan/status"
```

## 💾 数据库管理

### TypeORM 命令

```bash
# 生成新的迁移文件
yarn migration:generate src/migrations/CreatePostTable

# 运行迁移
yarn migration:run

# 回滚迁移
yarn migration:revert

# 删除数据库架构
yarn schema:drop
```

### 实体定义示例

```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 255 })
  title: string

  @Column('text')
  content: string

  @Column({ length: 500, nullable: true })
  excerpt: string

  @ManyToOne(() => Notebook, notebook => notebook.posts)
  notebook: Notebook

  @Column('json', { nullable: true })
  tags: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

## 🔗 SiYuan 集成

### API 配置

```typescript
export class SiYuanService {
  private apiUrl = config.siyuan.apiUrl
  private token = config.siyuan.token

  async getNotebooks(): Promise<Notebook[]> {
    const response = await axios.post(`${this.apiUrl}/api/notebook/lsNotebooks`, {
      token: this.token
    })
    return response.data.data
  }
}
```

### 数据同步流程

1. **连接 SiYuan API**
2. **获取笔记本列表**
3. **遍历文档树**
4. **解析 Markdown 内容**
5. **更新数据库记录**
6. **返回同步结果**

## 📦 Docker 部署

### Dockerfile

```dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 8000
CMD ["node", "dist/index.js"]
```

### Docker Compose 示例

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
      
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=siyuan_blog
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 🔧 开发工具

### 代码检查

```bash
# ESLint 检查
yarn lint

# 代码格式化
yarn format
```

### 调试

```bash
# 开启调试模式
DEBUG=app:* yarn dev:ts

# 使用 VS Code 调试器
# 在 .vscode/launch.json 中配置断点调试
```

### 测试

```bash
# 运行单元测试（待实现）
yarn test

# 运行集成测试（待实现）
yarn test:integration

# 生成测试覆盖率报告（待实现）
yarn test:coverage
```

## 🚀 部署

### 生产环境配置

1. **环境变量设置**
   ```bash
   export NODE_ENV=production
   export DB_HOST=your-mysql-host
   export DB_PASSWORD=your-secure-password
   ```

2. **构建应用**
   ```bash
   yarn build
   ```

3. **数据库迁移**
   ```bash
   yarn migration:run
   ```

4. **启动服务**
   ```bash
   yarn start
   ```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'siyuan-blog-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8000
    }
  }]
}

# 启动应用
pm2 start ecosystem.config.js
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 常见问题

### 数据库连接问题

**问题**: `ECONNREFUSED` 错误
**解决**: 
1. 检查 MySQL 服务是否启动
2. 验证数据库连接配置
3. 确认防火墙设置

### SiYuan API 连接问题

**问题**: SiYuan API 连接失败
**解决**:
1. 确认 SiYuan 服务运行在指定端口
2. 检查 API Token 配置
3. 验证网络连接

### TypeScript 编译问题

**问题**: 类型定义错误
**解决**:
1. 更新 `@types/*` 包
2. 检查 `tsconfig.json` 配置
3. 重新安装依赖

## 📚 相关文档

- [Express.js 官方文档](https://expressjs.com/)
- [TypeORM 官方文档](https://typeorm.io/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [SiYuan API 文档](https://github.com/siyuan-note/siyuan/blob/master/API.md)

## �� 许可证

MIT License 