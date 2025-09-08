import { Request, Response } from 'express'
import { NoteService } from './note.service'
import { GetDocsRequestDto, GetDocRequestDto, GetRecommendedRequestDto, GetOutlineRequestDto, ApiResponse, UpdateNotebookWhitelistRequestDto } from './note.dto'
import { FileConfigService } from '../../config/file-config.service'

export class NoteController {
  private noteService: NoteService
  private fileConfigService: FileConfigService

  constructor() {
    this.noteService = new NoteService()
    this.fileConfigService = new FileConfigService()
  }

  /**
   * 获取所有笔记本
   */
  async getNotebooks(req: Request, res: Response): Promise<void> {
    try {
      const notebooks = await this.noteService.getNotebooks()
      res.json(ApiResponse.success(notebooks, '获取笔记本列表成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取笔记本列表失败'))
    }
  }

  /**
   * 获取文档列表
   */
  async getDocs(req: Request, res: Response): Promise<void> {
    try {
      const { notebook, path = '/' } = req.body as GetDocsRequestDto
      
      if (!notebook || typeof notebook !== 'string') {
        res.status(400).json(ApiResponse.error(400, 'notebook参数必填且必须为字符串'))
        return
      }

      const docs = await this.noteService.getDocs(notebook, path)
      res.json(ApiResponse.success(docs, '获取文档列表成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取文档列表失败'))
    }
  }

  /**
   * 获取单个文档内容
   */
  async getDoc(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body as GetDocRequestDto
      
      if (!id || typeof id !== 'string') {
        res.status(400).json(ApiResponse.error(400, 'id参数必填且必须为字符串'))
        return
      }

      const doc = await this.noteService.getDoc(id)
      res.json(ApiResponse.success(doc, '获取文档内容成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取文档内容失败'))
    }
  }

  /**
   * 获取文档大纲
   */
  async getDocOutline(req: Request, res: Response): Promise<void> {
    try {
      const { id, preview = false } = req.body as GetOutlineRequestDto
      
      if (!id || typeof id !== 'string') {
        res.status(400).json(ApiResponse.error(400, 'id参数必填且必须为字符串'))
        return
      }

      const outline = await this.noteService.getDocOutline(id, preview)
      res.json(ApiResponse.success(outline, '获取文档大纲成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取文档大纲失败'))
    }
  }

  /**
   * 获取推荐文档
   */
  async getRecommendedDocs(req: Request, res: Response): Promise<void> {
    try {
      const { count = 10 } = req.body as GetRecommendedRequestDto
      
      // 验证count参数
      const validCount = Math.min(Math.max(parseInt(String(count)) || 10, 1), 50)

      const docs = await this.noteService.getRecommendedDocs(validCount)
      res.json(ApiResponse.success(docs, '获取推荐文档成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取推荐文档失败'))
    }
  }

  /**
   * 获取笔记本白名单配置
   */
  async getNotebookWhitelist(req: Request, res: Response): Promise<void> {
    try {
      const whitelist = this.fileConfigService.getNotebookWhitelist()
      res.json(ApiResponse.success(whitelist, '获取白名单配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取白名单配置失败'))
    }
  }

  /**
   * 更新笔记本白名单配置
   */
  async updateNotebookWhitelist(req: Request, res: Response): Promise<void> {
    try {
      const { enabled, whitelistedNotebooks } = req.body as UpdateNotebookWhitelistRequestDto
      
      // 验证请求参数
      if (typeof enabled !== 'boolean') {
        res.status(400).json(ApiResponse.error(400, 'enabled参数必须为布尔值'))
        return
      }

      if (!Array.isArray(whitelistedNotebooks)) {
        res.status(400).json(ApiResponse.error(400, 'whitelistedNotebooks参数必须为数组'))
        return
      }

      // 验证白名单项的格式
      for (const notebook of whitelistedNotebooks) {
        if (!notebook.id || typeof notebook.id !== 'string') {
          res.status(400).json(ApiResponse.error(400, '白名单项必须包含有效的id字段'))
          return
        }
        if (!notebook.name || typeof notebook.name !== 'string') {
          res.status(400).json(ApiResponse.error(400, '白名单项必须包含有效的name字段'))
          return
        }
      }

      // 更新配置
      this.fileConfigService.updateNotebookWhitelist({
        enabled,
        whitelistedNotebooks
      })

      res.json(ApiResponse.success(null, '更新白名单配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '更新白名单配置失败'))
    }
  }
}
