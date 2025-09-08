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

// 大纲块类型
export interface OutlineBlock {
  box: string
  path: string
  hPath: string
  id: string
  rootID: string
  parentID: string
  name: string
  alias: string
  memo: string
  tag: string
  content: string
  fcontent: string
  markdown: string
  folded: boolean
  type: string
  subType: string // h1, h2, h3, h4, h5, h6
  refText: string
  refs: any
  defID: string
  defPath: string
  ial: any
  children: OutlineBlock[] | null
  depth: number
  count: number
  sort: number
  created: string
  updated: string
  riffCardID: string
  riffCard: any
}

// 大纲项类型
export interface OutlineItem {
  id: string
  box: string
  name: string
  hPath: string
  type: string
  nodeType: string
  subType: string // h1, h2, h3, h4, h5, h6
  blocks?: OutlineBlock[]
  depth: number
  count: number
  updated: string
  created: string
}

// 技术栈项目类型
export interface TechStackItem {
  name: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger' | ''
}

// 工作经历项目类型
export interface ExperienceItem {
  title: string
  period: string
  description: string
}


// 配置类型
export interface AboutMeConfig {
  social: {
    email: string
    github: string
    website: string
  }
  techStack: TechStackItem[]
  experience: ExperienceItem[]
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

export interface GetOutlineRequest {
  id: string
  preview?: boolean
} 