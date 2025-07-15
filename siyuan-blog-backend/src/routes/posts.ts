import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/error-handler'

export const postsRouter = Router()

// 获取文章列表
postsRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 实现获取文章列表逻辑
  res.json({
    success: true,
    data: {
      posts: [],
      total: 0,
      page: 1,
      pageSize: 10
    }
  })
}))

// 获取文章详情
postsRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  // TODO: 实现获取文章详情逻辑
  res.json({
    success: true,
    data: {
      id,
      title: '示例文章',
      content: '这是一篇示例文章内容',
      notebook: '示例笔记本',
      tags: ['示例'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
}))

// 同步文章
postsRouter.post('/sync', asyncHandler(async (req: Request, res: Response) => {
  // TODO: 实现从 SiYuan 同步文章逻辑
  res.json({
    success: true,
    message: '文章同步完成',
    data: {
      synced: 0,
      updated: 0,
      created: 0
    }
  })
})) 