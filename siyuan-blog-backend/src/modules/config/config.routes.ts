import { Router } from 'express'
import { ConfigController } from './config.controller'

const router = Router()
const configController = new ConfigController()

// 获取所有配置
router.get('/', (req, res) => configController.getAllConfigs(req, res))

// 获取活跃配置（前端使用）
router.get('/active', (req, res) => configController.getActiveConfigs(req, res))

// 获取单个配置
router.get('/:configKey', (req, res) => configController.getConfigByKey(req, res))

// 更新配置
router.put('/:configKey', (req, res) => configController.updateConfig(req, res))

// 删除配置
router.delete('/:configKey', (req, res) => configController.deleteConfig(req, res))

export { router as configRoutes } 