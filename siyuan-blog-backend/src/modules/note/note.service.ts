import axios from 'axios'
import { config } from '../../config'
import { NotebookDto, DocDto, NoteDto } from './note.dto'

export class NoteService {
  private siyuanBaseUrl: string
  private siyuanToken: string

  constructor() {
    // 使用配置文件中的思源笔记 API 设置
    this.siyuanBaseUrl = config.siyuan.apiUrl
    this.siyuanToken = config.siyuan.token
  }

  /**
   * 获取所有笔记本
   */
  async getNotebooks(): Promise<NotebookDto[]> {
    try {
      const headers = this.siyuanToken ? { 'Authorization': `Token ${this.siyuanToken}` } : {}
      const response = await axios.post(`${this.siyuanBaseUrl}/api/notebook/lsNotebooks`, {}, { headers })
      
      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取笔记本失败')
      }

      return response.data.data.notebooks || []
    } catch (error) {
      console.error('获取笔记本失败:', error)
      throw error
    }
  }

  /**
   * 获取指定笔记本下的文档列表
   */
  async getDocs(notebook: string, path: string = '/'): Promise<DocDto[]> {
    try {
      const headers = this.siyuanToken ? { 'Authorization': `Token ${this.siyuanToken}` } : {}
      const response = await axios.post(`${this.siyuanBaseUrl}/api/filetree/listDocsByPath`, {
        notebook,
        path
      }, { headers })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取文档列表失败')
      }

      return response.data.data.files || []
    } catch (error) {
      console.error('获取文档列表失败:', error)
      throw error
    }
  }

  /**
   * 获取文档内容
   */
  async getDoc(id: string): Promise<NoteDto> {
    try {
      const headers = this.siyuanToken ? { 'Authorization': `Token ${this.siyuanToken}` } : {}
      const response = await axios.post(`${this.siyuanBaseUrl}/api/filetree/getDoc`, {
        id
      }, { headers })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取文档内容失败')
      }

      return {
        id: response.data.data.id,
        content: response.data.data.content,
        path: response.data.data.path
      }
    } catch (error) {
      console.error('获取文档内容失败:', error)
      throw error
    }
  }
}
