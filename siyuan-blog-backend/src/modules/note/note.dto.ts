// 笔记本 DTO
export class NotebookDto {
  id!: string
  name!: string
  sort!: number
  sortMode!: number
  icon!: string
}

// 文档 DTO
export class DocDto {
  id!: string
  path!: string
  name!: string
  sort!: number
  icon!: string
  mtime!: number
  ctime!: number
  hMtime!: string
  hCtime!: string
  subFileCount!: number
  notebookName?: string // 可选的笔记本名称字段
}

// 笔记内容 DTO
export class NoteDto {
  id!: string
  content!: string
  path!: string
}

// 请求参数 DTO
export class GetDocsRequestDto {
  notebook?: string
  path?: string
}

export class GetDocRequestDto {
  id!: string
}

export class GetRecommendedRequestDto {
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
