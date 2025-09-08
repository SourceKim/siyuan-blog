import { Router } from 'express'
import { LayoutController } from './layout.controller'

const router = Router()
const layoutController = new LayoutController()

// 获取 Layout 数据
router.get('/data', (req, res) => layoutController.getLayoutData(req, res))

// 获取网站配置
router.get('/site-config', (req, res) => layoutController.getSiteConfig(req, res))

// 更新网站配置
router.post('/site-config', (req, res) => layoutController.updateSiteConfig(req, res))

// 获取Footer配置
router.get('/footer-config', (req, res) => layoutController.getFooterConfig(req, res))

// 更新Footer配置
router.post('/footer-config', (req, res) => layoutController.updateFooterConfig(req, res))

export { router as layoutRoutes }
