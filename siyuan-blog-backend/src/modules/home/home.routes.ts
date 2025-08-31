import { Router } from 'express'
import { HomeController } from './home.controller'

const router = Router()
const homeController = new HomeController()

// 获取首页完整数据（唯一接口）
router.get('/data', (req, res) => homeController.getHomeData(req, res))

export { router as homeRoutes }
