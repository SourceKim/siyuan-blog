# Layout 配置管理说明

## 配置文件结构

### layout_config.json - 布局配置（统一配置）
```json
{
  "site": {
    "siteName": "SiYuan Blog",
    "avatarUrl": "/default-avatar.png",
    "bio": "基于思源笔记构建的个人博客",
    "description": "记录技术学习和生活感悟的个人博客",
    "keywords": ["博客", "技术", "思源笔记", "个人网站"],
    "author": "博主"
  },
  "footer": {
    "slogan": "基于思源笔记构建",
    "links": [
      {
        "text": "关于我",
        "url": "/about",
        "external": false
      },
      {
        "text": "思源笔记",
        "url": "https://github.com/siyuan-note/siyuan",
        "external": true
      },
      {
        "text": "Element Plus",
        "url": "https://element-plus.org/",
        "external": true
      }
    ]
  }
}
```

## API接口

### 网站配置管理

#### 获取网站配置
```http
GET /api/layout/site-config
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取网站配置成功",
  "data": {
    "siteName": "SiYuan Blog",
    "avatarUrl": "/default-avatar.png",
    "bio": "基于思源笔记构建的个人博客",
    "description": "记录技术学习和生活感悟的个人博客",
    "keywords": ["博客", "技术", "思源笔记", "个人网站"],
    "author": "博主"
  }
}
```

#### 更新网站配置
```http
POST /api/layout/site-config
Content-Type: application/json

{
  "siteName": "我的博客",
  "avatarUrl": "/my-avatar.png",
  "bio": "我的个人博客",
  "description": "记录我的学习和生活",
  "keywords": ["个人博客", "技术分享"],
  "author": "张三"
}
```

### Footer配置管理

#### 获取Footer配置
```http
GET /api/layout/footer-config
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取Footer配置成功",
  "data": {
    "slogan": "基于思源笔记构建",
    "links": [
      {
        "text": "关于我",
        "url": "/about",
        "external": false
      },
      {
        "text": "思源笔记",
        "url": "https://github.com/siyuan-note/siyuan",
        "external": true
      }
    ]
  }
}
```

#### 更新Footer配置
```http
POST /api/layout/footer-config
Content-Type: application/json

{
  "slogan": "基于思源笔记构建的个人博客",
  "links": [
    {
      "text": "首页",
      "url": "/",
      "external": false
    },
    {
      "text": "GitHub",
      "url": "https://github.com/myusername",
      "external": true
    }
  ]
}
```

## 配置分离的优势

### 1. 模块解耦
- **Layout 模块**：专门处理布局相关配置
- **About 模块**：专门处理个人详细信息
- **独立配置**：各模块配置相互独立，职责清晰

### 2. 配置层级
```
layout_config.json     # 布局相关所有配置（网站信息 + Footer配置）
about_me.json          # 详细个人信息（经历、技能等）
```

### 3. 数据使用范围
- **layout_config.site**: 用于 Header、Footer 等布局组件的网站基本信息
- **layout_config.footer**: 专门用于 Footer 链接和标语
- **about_me**: 用于 About 页面的详细展示

## 配置字段说明

### SiteConfig 字段
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| siteName | string | 是 | 网站名称，显示在Header和Footer |
| avatarUrl | string | 否 | 头像URL，显示在Header |
| bio | string | 否 | 简短介绍，显示在Footer |
| description | string | 否 | 网站描述，用于SEO |
| keywords | string[] | 否 | 关键词数组，用于SEO |
| author | string | 是 | 作者名称 |

### FooterConfig 字段
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| slogan | string | 是 | 网站标语 |
| links | FooterLink[] | 否 | 底部链接列表 |

### FooterLink 字段
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 链接显示文本 |
| url | string | 是 | 链接地址 |
| external | boolean | 否 | 是否外部链接，默认false |

## 使用建议

1. **开发环境**：可以通过API接口动态修改配置进行测试
2. **生产环境**：建议直接修改配置文件，确保配置的稳定性
3. **备份配置**：重要配置修改前建议备份原配置文件
4. **SEO优化**：合理设置 description 和 keywords 字段
5. **链接管理**：Footer链接支持内部和外部链接，灵活配置

## 配置示例

### 个人博客配置
```json
// site_config.json
{
  "siteName": "张三的技术博客",
  "avatarUrl": "/avatar.jpg",
  "bio": "全栈开发工程师，热爱技术分享",
  "description": "记录前端、后端、DevOps等技术心得",
  "keywords": ["前端", "后端", "DevOps", "技术博客"],
  "author": "张三"
}
```

### 企业博客配置
```json
// site_config.json
{
  "siteName": "TechCorp 技术博客",
  "avatarUrl": "/company-logo.png",
  "bio": "分享最新技术趋势和实践经验",
  "description": "TechCorp官方技术博客，分享行业洞察",
  "keywords": ["企业博客", "技术分享", "行业洞察"],
  "author": "TechCorp"
}
```
