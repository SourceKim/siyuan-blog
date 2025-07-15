import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/error-handler'

export const notebooksRouter = Router()

// 获取笔记本列表
notebooksRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      notebooks: []
    }
  })
})) 