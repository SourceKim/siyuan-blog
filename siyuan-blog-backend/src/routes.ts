import { Express, Request, Response } from 'express'
import { authMiddleware } from './middleware/auth'
import { noteRoutes } from './modules/note/note.routes'
import { aboutMeRoutes } from './modules/aboutMe/aboutMe.routes'

export const setupRoutes = (app: Express) => {
  // API 路由前缀
  const apiPrefix = '/api'

  // Note 模块路由 - 根据 API 设计文档，直接挂载到 /api 下
  app.use(apiPrefix, noteRoutes)

  // AboutMe 模块路由 - 挂载到 /api/about 下
  app.use(`${apiPrefix}/about`, aboutMeRoutes)

  // 404 处理
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      code: 404,
      msg: '接口不存在',
      data: null
    })
  })
} 