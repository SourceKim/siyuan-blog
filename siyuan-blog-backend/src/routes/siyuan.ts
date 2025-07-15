import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/error-handler'

export const siyuanRouter = Router()

// SiYuan 连接测试
siyuanRouter.get('/status', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      connected: false,
      message: 'SiYuan 连接待实现'
    }
  })
})) 