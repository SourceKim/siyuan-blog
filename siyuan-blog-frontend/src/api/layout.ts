import api from './index'

// Layout 相关类型定义
export interface HeaderData {
  siteName: string
  avatarUrl: string
}

export interface FooterLink {
  text: string
  url: string
  external?: boolean
}

export interface FooterData {
  siteName: string
  bio: string
  currentYear: number
  slogan: string
  links: FooterLink[]
}

export interface LayoutData {
  header: HeaderData
  footer: FooterData
}

// Layout 相关API
export const layoutApi = {
  // 获取 Layout 数据
  async getLayoutData(): Promise<LayoutData> {
    return api.get('/layout/data')
  },
}
