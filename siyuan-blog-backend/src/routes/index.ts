import { Express, Request, Response } from 'express'
import { postsRouter } from './posts'
import { notebooksRouter } from './notebooks'
import { siyuanRouter } from './siyuan'

export const setupRoutes = (app: Express) => {
  // API 路由前缀
  const apiPrefix = '/api'

  // 注册路由
  app.use(`${apiPrefix}/posts`, postsRouter)
  app.use(`${apiPrefix}/notebooks`, notebooksRouter)
  app.use(`${apiPrefix}/siyuan`, siyuanRouter)

  // 404 处理
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `路径 ${req.originalUrl} 未找到`,
        timestamp: new Date().toISOString()
      }
    })
  })
} 