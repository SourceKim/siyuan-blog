import axios from 'axios'
import { config } from '../../config'
import { NotebookDto, DocDto, NoteDto, OutlineItemDto } from './note.dto'

export class NoteService {
  private siyuanBaseUrl: string
  private siyuanToken: string
  private blogNotebookId: string

  constructor() {
    // 使用配置文件中的思源笔记 API 设置
    this.siyuanBaseUrl = config.siyuan.apiUrl
    this.siyuanToken = config.siyuan.token
    this.blogNotebookId = config.blog.notebookId
  }

  /**
   * 获取统一的请求头
   */
  private getHeaders(): Record<string, string> {
    return this.siyuanToken ? { 'Authorization': `Token ${this.siyuanToken}` } : {}
  }

  /**
   * 开发环境日志记录
   */
  private logSiyuanRequest(apiPath: string, requestData?: any): void {
    if (config.nodeEnv === 'development') {
      console.group(`🔗 SiYuan API Request: ${apiPath}`)
      console.log('📍 API地址:', `${this.siyuanBaseUrl}${apiPath}`)
      console.log('🔑 请求头:', this.getHeaders())
      if (requestData) {
        console.log('📦 请求数据:', requestData)
      }
      console.log('⏰ 请求时间:', new Date().toLocaleTimeString())
      console.groupEnd()
    }
  }

  private logSiyuanResponse(apiPath: string, response: any, requestData?: any): void {
    if (config.nodeEnv === 'development') {
      console.group(`📡 SiYuan API Response: ${apiPath}`)
      console.log('📍 API地址:', `${this.siyuanBaseUrl}${apiPath}`)
      console.log('📊 响应状态:', response.status, response.statusText)
      console.log('📦 响应数据:', response.data)
      console.log('✅ 业务状态:', response.data?.code === 0 ? '成功' : '失败')
      if (response.data?.code !== 0) {
        console.log('💬 错误消息:', response.data?.msg)
      }
      if (requestData) {
        console.log('📤 对应请求数据:', requestData)
      }
      console.log('📈 返回数据量:', Array.isArray(response.data?.data) ? response.data.data.length : '单个对象')
      console.log('⏰ 响应时间:', new Date().toLocaleTimeString())
      console.groupEnd()
    }
  }

  private logSiyuanError(apiPath: string, error: any, requestData?: any): void {
    if (config.nodeEnv === 'development') {
      console.group(`❌ SiYuan API Error: ${apiPath}`)
      console.log('📍 API地址:', `${this.siyuanBaseUrl}${apiPath}`)
      console.log('💥 错误信息:', error.message)
      console.log('📊 HTTP状态:', error.response?.status, error.response?.statusText)
      console.log('📦 错误响应:', error.response?.data)
      if (requestData) {
        console.log('📤 对应请求数据:', requestData)
      }
      console.log('⏰ 错误时间:', new Date().toLocaleTimeString())
      console.groupEnd()
    }
  }

  /**
   * 获取博客笔记本信息
   */
  async getBlogNotebook(): Promise<NotebookDto | null> {
    const apiPath = '/api/notebook/lsNotebooks'
    const requestData = {}
    
    try {
      this.logSiyuanRequest(apiPath, requestData)
      
      const response = await axios.post(`${this.siyuanBaseUrl}${apiPath}`, requestData, { 
        headers: this.getHeaders() 
      })
      
      this.logSiyuanResponse(apiPath, response, requestData)
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取笔记本失败')
      }

      const allNotebooks = response.data.data.notebooks || []
      
      // 查找博客笔记本
      const blogNotebook = allNotebooks.find((notebook: any) => notebook.id === this.blogNotebookId)
      
      if (config.nodeEnv === 'development') {
        console.log('📝 博客笔记本查找结果:')
        console.log('  - 目标笔记本ID:', this.blogNotebookId)
        console.log('  - 找到博客笔记本:', blogNotebook ? blogNotebook.name : '未找到')
      }
      
      return blogNotebook ? {
        id: blogNotebook.id,
        name: blogNotebook.name,
        icon: blogNotebook.icon,
        sort: blogNotebook.sort,
        sortMode: blogNotebook.sortMode ?? 0
      } : null
    } catch (error) {
      this.logSiyuanError(apiPath, error, requestData)
      throw error
    }
  }



  /**
   * 获取博客笔记本下的文档列表
   */
  async getDocs(notebook?: string, path: string = '/'): Promise<DocDto[]> {
    // 如果没有指定 notebook，使用博客笔记本
    const targetNotebook = notebook || this.blogNotebookId
    
    // 只允许访问博客笔记本
    if (targetNotebook !== this.blogNotebookId) {
      if (config.nodeEnv === 'development') {
        console.log(`❌ 只允许访问博客笔记本 ${this.blogNotebookId}，拒绝访问 ${targetNotebook}`)
      }
      throw new Error('访问被拒绝：只允许访问博客笔记本')
    }

    const apiPath = '/api/filetree/listDocsByPath'
    const requestData = { notebook: targetNotebook, path }
    
    try {
      this.logSiyuanRequest(apiPath, requestData)
      
      const response = await axios.post(`${this.siyuanBaseUrl}${apiPath}`, requestData, { 
        headers: this.getHeaders() 
      })

      this.logSiyuanResponse(apiPath, response, requestData)

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取文档列表失败')
      }

      return response.data.data.files || []
    } catch (error) {
      this.logSiyuanError(apiPath, error, requestData)
      throw error
    }
  }

  

  /**
   * 获取文档内容
   */
  async getDoc(id: string): Promise<NoteDto> {
    const apiPath = '/api/filetree/getDoc'
    const requestData = { id }
    
    try {
      this.logSiyuanRequest(apiPath, requestData)
      
      const response = await axios.post(`${this.siyuanBaseUrl}${apiPath}`, requestData, { 
        headers: this.getHeaders() 
      })

      this.logSiyuanResponse(apiPath, response, requestData)

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取文档内容失败')
      }

      return {
        id: response.data.data.id,
        content: response.data.data.content,
        path: response.data.data.path
      }
    } catch (error) {
      this.logSiyuanError(apiPath, error, requestData)
      throw error
    }
  }

  /**
   * 获取文档大纲
   */
  async getDocOutline(id: string, preview: boolean = false): Promise<OutlineItemDto[]> {
    const apiPath = '/api/outline/getDocOutline'
    const requestData = { id, preview }
    
    try {
      this.logSiyuanRequest(apiPath, requestData)
      
      const response = await axios.post(`${this.siyuanBaseUrl}${apiPath}`, requestData, { 
        headers: this.getHeaders() 
      })

      this.logSiyuanResponse(apiPath, response, requestData)

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取文档大纲失败')
      }

      return response.data.data || []
    } catch (error) {
      this.logSiyuanError(apiPath, error, requestData)
      throw error
    }
  }

  /**
   * 递归获取笔记本下的所有文档
   */
  private async getAllDocsRecursive(notebook: string = this.blogNotebookId, path: string = '/'): Promise<DocDto[]> {
    // 只允许访问博客笔记本
    if (notebook !== this.blogNotebookId) {
      if (config.nodeEnv === 'development') {
        console.log(`❌ 只允许访问博客笔记本 ${this.blogNotebookId}，跳过获取 ${notebook}`)
      }
      return []
    }

    const docs = await this.getDocs(notebook, path)
    let allDocs: DocDto[] = []

    for (const doc of docs) {
      allDocs.push(doc)
      
      // 如果文档有子文档，递归获取
      if (doc.subFileCount > 0) {
        const subDocs = await this.getAllDocsRecursive(notebook, doc.path)
        allDocs = allDocs.concat(subDocs)
      }
    }

    return allDocs
  }

  /**
   * 获取推荐文章（从博客笔记本）
   */
  async getRecommendedDocs(count: number = 10): Promise<DocDto[]> {
    try {
      if (config.nodeEnv === 'development') {
        console.log('🎲 开始从博客笔记本获取推荐文章, 需要数量:', count)
      }
      
      // 获取博客笔记本信息
      const blogNotebook = await this.getBlogNotebook()
      if (!blogNotebook) {
        if (config.nodeEnv === 'development') {
          console.log('❌ 博客笔记本未找到')
        }
        return []
      }

      // 获取博客笔记本下的所有文档
      const docs = await this.getAllDocsRecursive(this.blogNotebookId)
      
      // 为每个文档添加笔记本名称
      const docsWithNotebookName = docs.map(doc => ({
        ...doc,
        notebookName: blogNotebook.name
      }))

      // 过滤掉目录类型的文档，只保留真正的文章（subFileCount === 0）
      const articles = docsWithNotebookName.filter(doc => doc.subFileCount === 0)

      // 随机打乱数组
      const shuffled = articles.sort(() => 0.5 - Math.random())

      // 返回指定数量的文章
      const result = shuffled.slice(0, Math.min(count, shuffled.length))
      
      if (config.nodeEnv === 'development') {
        console.log('📊 推荐文章统计:')
        console.log('  - 博客笔记本:', blogNotebook.name)
        console.log('  - 总文档数:', docs.length)
        console.log('  - 文章数量:', articles.length)
        console.log('  - 返回数量:', result.length)
      }
      
      return result
    } catch (error) {
      if (config.nodeEnv === 'development') {
        console.error('❌ 获取推荐文章失败:', error)
      }
      throw error
    }
  }

  /**
   * 获取博客笔记本的文档树结构
   */
  async getBlogDocumentTree(): Promise<DocDto[]> {
    try {
      if (config.nodeEnv === 'development') {
        console.log('🌳 获取博客笔记本文档树结构')
      }
      
      // 获取博客笔记本根目录的文档
      const docs = await this.getDocs(this.blogNotebookId, '/')
      
      if (config.nodeEnv === 'development') {
        console.log('📄 博客笔记本根目录文档数:', docs.length)
      }
      
      return docs
    } catch (error) {
      if (config.nodeEnv === 'development') {
        console.error('❌ 获取博客文档树失败:', error)
      }
      return []
    }
  }
}
