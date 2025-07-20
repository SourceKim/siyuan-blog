// 关于我 DTO
export class AboutMeDto {
  name!: string
  avatarUrl!: string
  bio!: string
}

// 标准响应格式 (复用 Note 模块的)
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
