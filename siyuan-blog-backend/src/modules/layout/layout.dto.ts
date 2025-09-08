// Layout 模块相关 DTO

// 网站基本信息
export class SiteConfigDto {
  siteName!: string
  avatarUrl!: string
  bio!: string
  description!: string
  keywords!: string[]
  author!: string
}

// Header 所需数据
export class HeaderDataDto {
  siteName!: string
  avatarUrl!: string
}

// Footer 链接配置
export class FooterLinkDto {
  text!: string
  url!: string
  external?: boolean // 是否外部链接
}

// Footer 所需数据  
export class FooterDataDto {
  siteName!: string
  bio!: string
  currentYear!: number
  slogan!: string // 网站标语，如 "基于思源笔记构建"
  links!: FooterLinkDto[] // 底部链接
}

// Layout 完整数据
export class LayoutDataDto {
  header!: HeaderDataDto
  footer!: FooterDataDto
}

// 标准响应格式
export class ApiResponse<T = any> {
  code: number
  msg: string
  data: T

  constructor(code: number = 0, msg: string = 'success', data: T = null as any) {
    this.code = code
    this.msg = msg
    this.data = data
  }

  static success<T>(data: T, msg: string = 'success'): ApiResponse<T> {
    return new ApiResponse(0, msg, data)
  }

  static error(code: number = 1, msg: string = 'error'): ApiResponse {
    return new ApiResponse(code, msg, null)
  }
}
