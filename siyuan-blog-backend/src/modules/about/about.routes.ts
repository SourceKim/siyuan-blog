import { Router } from 'express'
import { AboutController } from './about.controller'

const router = Router()
const aboutController = new AboutController()

// 获取关于页面完整信息（唯一接口）
router.get('/info', (req, res) => aboutController.getAboutPageInfo(req, res))

export { router as aboutRoutes }
