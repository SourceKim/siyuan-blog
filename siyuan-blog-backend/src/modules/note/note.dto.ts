import { IsString, IsOptional } from 'class-validator'

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
}

// 笔记内容 DTO
export class NoteDto {
  id!: string
  content!: string
  path!: string
}

// 请求参数 DTO
export class GetDocsRequestDto {
  @IsString()
  notebook!: string

  @IsString()
  @IsOptional()
  path?: string = '/'
}

export class GetDocRequestDto {
  @IsString()
  id!: string
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
