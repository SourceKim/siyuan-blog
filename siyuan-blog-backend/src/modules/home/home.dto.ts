// 个人信息 DTO (用于首页)
export class ProfileInfoDto {
  name!: string
  avatarUrl!: string
  bio!: string
  title!: string
}

// 社交链接 DTO
export class SocialLinksDto {
  email!: string
  github!: string
  website!: string
}

// 统计信息 DTO
export class BlogStatsDto {
  notebookCount!: number
  documentCount!: number
  visitCount!: number
  runningDays!: number
}

// 推荐文档 DTO (简化版本，用于首页展示)
export class RecommendedDocDto {
  id!: string
  name!: string
  notebookName!: string
  hCtime!: string
  hMtime!: string
  summary?: string
}

// 内容模板 DTO
export class ContentTemplatesDto {
  summaryTemplates!: {
    default: string[]
    frontend: string
    backend: string
    thinking: string
    tutorial: string
  }
  tagRules!: {
    tech: { [key: string]: { keywords: string[], tag: string } }
    content: { [key: string]: { keywords: string[], tag: string } }
    category: { [key: string]: { keywords: string[], tag: string } }
  }
  summaryKeywords!: {
    frontend: string[]
    backend: string[]
    thinking: string[]
    tutorial: string[]
  }
  defaults!: {
    fallbackName: string
    fallbackTitle: string
    fallbackBio: string
    maxTags: number
    unknownNotebook: string
  }
}

// 首页数据响应 DTO
export class HomeDataDto {
  profile!: ProfileInfoDto
  socialLinks!: SocialLinksDto
  blogStats!: BlogStatsDto
  recommendedDocs!: RecommendedDocDto[]
  contentTemplates!: ContentTemplatesDto
}

// 获取推荐文档请求 DTO
export class GetHomeRecommendedRequestDto {
  count?: number
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
