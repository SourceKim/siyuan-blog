import { Request, Response } from 'express'
import { NoteService } from './note.service'
import { GetDocsRequestDto, GetDocRequestDto, GetRecommendedRequestDto, ApiResponse } from './note.dto'

export class NoteController {
  private noteService: NoteService

  constructor() {
    this.noteService = new NoteService()
  }

  /**
   * 获取所有笔记本
   */
  async getNotebooks(req: Request, res: Response): Promise<void> {
    try {
      const notebooks = await this.noteService.getNotebooks()
      res.json(ApiResponse.success(notebooks, '获取笔记本列表成功'))
    } catch (error) {
      console.error('获取笔记本列表失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取笔记本列表失败'))
    }
  }

  /**
   * 获取文档列表
   */
  async getDocs(req: Request, res: Response): Promise<void> {
    try {
      // 简单的参数验证
      const { notebook, path = '/' } = req.body as GetDocsRequestDto
      
      if (!notebook || typeof notebook !== 'string') {
        res.status(400).json(ApiResponse.error(400, 'notebook参数必填且必须为字符串'))
        return
      }

      const docs = await this.noteService.getDocs(notebook, path)
      res.json(ApiResponse.success(docs, '获取文档列表成功'))
    } catch (error) {
      console.error('获取文档列表失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取文档列表失败'))
    }
  }

  /**
   * 获取单个文档内容
   */
  async getDoc(req: Request, res: Response): Promise<void> {
    try {
      // 简单的参数验证
      const { id } = req.body as GetDocRequestDto
      
      if (!id || typeof id !== 'string') {
        res.status(400).json(ApiResponse.error(400, 'id参数必填且必须为字符串'))
        return
      }

      const doc = await this.noteService.getDoc(id)
      res.json(ApiResponse.success(doc, '获取文档内容成功'))
    } catch (error) {
      console.error('获取文档内容失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取文档内容失败'))
    }
  }

  /**
   * 获取推荐文档
   */
  async getRecommendedDocs(req: Request, res: Response): Promise<void> {
    try {
      // 简单的参数验证
      const { count = 10 } = req.body as GetRecommendedRequestDto
      
      // 验证count参数
      const validCount = Math.min(Math.max(parseInt(String(count)) || 10, 1), 50)

      const docs = await this.noteService.getRecommendedDocs(validCount)
      res.json(ApiResponse.success(docs, '获取推荐文档成功'))
    } catch (error) {
      console.error('获取推荐文档失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取推荐文档失败'))
    }
  }
}
