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
   * 获取笔记本信息
   */
  async getNotebookInfo(notebook: string): Promise<{ name: string }> {
    try {
      const headers = this.siyuanToken ? { 'Authorization': `Token ${this.siyuanToken}` } : {}
      const response = await axios.post(`${this.siyuanBaseUrl}/api/notebook/getNotebookInfo`, {
        notebook
      }, { headers })

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || '获取笔记本信息失败')
      }

      return {
        name: response.data.data.name
      }
    } catch (error) {
      console.error('获取笔记本信息失败:', error)
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

  /**
   * 递归获取笔记本下的所有文档
   */
  private async getAllDocsRecursive(notebook: string, path: string = '/'): Promise<DocDto[]> {
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
   * 获取推荐文章
   */
  async getRecommendedDocs(count: number = 10): Promise<DocDto[]> {
    try {
      // 获取所有笔记本
      const notebooks = await this.getNotebooks()
      let allDocs: DocDto[] = []

      // 遍历所有笔记本，获取所有文档并添加笔记本名称
      for (const notebook of notebooks) {
        // 获取笔记本详细信息
        const notebookInfo = await this.getNotebookInfo(notebook.id)
        
        // 获取该笔记本下的所有文档
        const docs = await this.getAllDocsRecursive(notebook.id)
        
        // 为每个文档添加笔记本名称
        const docsWithNotebookName = docs.map(doc => ({
          ...doc,
          notebookName: notebookInfo.name
        }))
        
        allDocs = allDocs.concat(docsWithNotebookName)
      }

      // 过滤掉目录类型的文档，只保留真正的文章（subFileCount === 0）
      const articles = allDocs.filter(doc => doc.subFileCount === 0)

      // 随机打乱数组
      const shuffled = articles.sort(() => 0.5 - Math.random())

      // 返回指定数量的文章
      return shuffled.slice(0, Math.min(count, shuffled.length))
    } catch (error) {
      console.error('获取推荐文章失败:', error)
      throw error
    }
  }
}
