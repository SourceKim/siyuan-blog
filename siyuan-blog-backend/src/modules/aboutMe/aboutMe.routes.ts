import { Router } from 'express'
import { AboutMeController } from './aboutMe.controller'

const router = Router()
const aboutMeController = new AboutMeController()

// 获取个人信息
router.get('/info', (req, res) => aboutMeController.getAboutMe(req, res))

// 更新个人信息 (如果需要的话)
router.put('/info', (req, res) => aboutMeController.updateAboutMe(req, res))

export { router as aboutMeRoutes }
