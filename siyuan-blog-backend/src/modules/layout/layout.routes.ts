import { Router } from 'express'
import { LayoutController } from './layout.controller'

const router = Router()
const layoutController = new LayoutController()

// 仅保留 Layout 数据接口
router.get('/data', (req, res) => layoutController.getLayoutData(req, res))

export { router as layoutRoutes }
