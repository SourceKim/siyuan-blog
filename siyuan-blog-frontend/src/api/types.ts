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
}

// 笔记内容类型
export interface Note {
  id: string
  content: string
  path: string
}

// 个人信息类型
export interface AboutMe {
  name: string
  avatarUrl: string
  bio: string
}

// 请求参数类型
export interface GetDocsRequest {
  notebook: string
  path?: string
}

export interface GetDocRequest {
  id: string
} 