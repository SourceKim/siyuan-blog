import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
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
      res.json(ApiResponse.success(notebooks, '获取笔记本成功'))
    } catch (error) {
      console.error('获取笔记本失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取笔记本失败'))
    }
  }

  /**
   * 获取文档列表
   */
  async getDocs(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetDocsRequestDto, req.body)
      const errors = await validate(dto)
      
      if (errors.length > 0) {
        res.status(400).json(ApiResponse.error(1, '参数验证失败'))
        return
      }

      const docs = await this.noteService.getDocs(dto.notebook, dto.path)
      res.json(ApiResponse.success(docs, '获取文档列表成功'))
    } catch (error) {
      console.error('获取文档列表失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取文档列表失败'))
    }
  }

  /**
   * 获取文档内容
   */
  async getDoc(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetDocRequestDto, req.body)
      const errors = await validate(dto)
      
      if (errors.length > 0) {
        res.status(400).json(ApiResponse.error(1, '参数验证失败'))
        return
      }

      const doc = await this.noteService.getDoc(dto.id)
      res.json(ApiResponse.success(doc, '获取文档内容成功'))
    } catch (error) {
      console.error('获取文档内容失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取文档内容失败'))
    }
  }

  /**
   * 获取推荐文章
   */
  async getRecommendedDocs(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetRecommendedRequestDto, req.body)
      const errors = await validate(dto)
      
      if (errors.length > 0) {
        res.status(400).json(ApiResponse.error(1, '参数验证失败'))
        return
      }

      const recommendedDocs = await this.noteService.getRecommendedDocs(dto.count)
      res.json(ApiResponse.success(recommendedDocs, '获取推荐文章成功'))
    } catch (error) {
      console.error('获取推荐文章失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取推荐文章失败'))
    }
  }
}
