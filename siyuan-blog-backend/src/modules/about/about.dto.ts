// 个人基本信息 DTO
export class AboutMeDto {
  name!: string
  avatarUrl!: string
  bio!: string
}

// 技术栈项目 DTO
export class TechStackItemDto {
  name!: string
  type!: string
}

// 工作经历项目 DTO
export class ExperienceItemDto {
  title!: string
  period!: string
  description!: string
}

// 社交链接 DTO
export class AboutSocialLinksDto {
  email!: string
  github!: string
  website!: string
}



// 博客统计 DTO
export class AboutBlogStatsDto {
  notebookCount!: number
  documentCount!: number
  visitCount!: number
  runningDays!: number
}

// 关于页面配置 DTO
export class AboutConfigDto {
  social!: AboutSocialLinksDto
  techStack!: TechStackItemDto[]
  experience!: ExperienceItemDto[]
}

// 关于页面完整信息 DTO
export class AboutPageDto {
  name!: string
  avatarUrl!: string
  bio!: string
  config!: AboutConfigDto
  blogStats?: AboutBlogStatsDto
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
