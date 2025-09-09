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

// 大纲块 DTO
export class OutlineBlockDto {
  box!: string
  path!: string
  hPath!: string
  id!: string
  rootID!: string
  parentID!: string
  name!: string
  alias!: string
  memo!: string
  tag!: string
  content!: string
  fcontent!: string
  markdown!: string
  folded!: boolean
  type!: string
  subType!: string // h1, h2, h3, h4, h5, h6
  refText!: string
  refs!: any
  defID!: string
  defPath!: string
  ial!: any
  children!: OutlineBlockDto[] | null
  depth!: number
  count!: number
  sort!: number
  created!: string
  updated!: string
  riffCardID!: string
  riffCard!: any
}

// 大纲项 DTO
export class OutlineItemDto {
  id!: string
  box!: string
  name!: string
  hPath!: string
  type!: string
  nodeType!: string
  subType!: string // h1, h2, h3, h4, h5, h6
  blocks?: OutlineBlockDto[]
  depth!: number
  count!: number
  updated!: string
  created!: string
}

// 请求参数 DTO
export class GetDocsRequestDto {
  notebook?: string  // 可选，不传时后端自动使用博客笔记本
  path?: string
}

export class GetDocRequestDto {
  id!: string
}

export class GetRecommendedRequestDto {
  count?: number
}

export class GetOutlineRequestDto {
  id!: string
  preview?: boolean
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
