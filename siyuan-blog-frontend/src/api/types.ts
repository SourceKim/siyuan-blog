// 标准响应格式
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 笔记本类型
export interface Notebook {
  id: string
  name: string
  sort: number
  sortMode: number
  icon: string
}

// 文档类型
export interface Doc {
  id: string
  path: string
  name: string
  sort: number
  icon: string
  mtime: number
  ctime: number
  hMtime: string
  hCtime: string
  subFileCount: number
  notebookName?: string // 可选的笔记本名称字段
}

// 笔记内容类型
export interface Note {
  id: string
  content: string
  path: string
}

// 技术栈项目类型
export interface TechStackItem {
  name: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger' | ''
}

// 配置类型
export interface AboutMeConfig {
  home: {
    showProfile: boolean
    showSocialLinks: boolean
    showStats: boolean
    maxRecommendedArticles: number
    profileCollapsible: boolean
  }
  about: {
    showContactInfo: boolean
    showTechStack: boolean
    showBlogStats: boolean
    showAvatar: boolean
  }
  social: {
    email: string
    github: string
    website: string
  }
  techStack: TechStackItem[]
}

// 个人信息类型
export interface AboutMe {
  name: string
  avatarUrl: string
  bio: string
  config: AboutMeConfig
}

// 请求参数类型
export interface GetDocsRequest {
  notebook: string
  path?: string
}

export interface GetDocRequest {
  id: string
}

export interface GetRecommendedRequest {
  count?: number
} 