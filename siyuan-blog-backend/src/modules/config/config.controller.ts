import { Request, Response } from 'express'
import { ConfigService } from './config.service'
import { ApiResponse } from './config.dto'
import { FileConfigService } from '../../config/file-config.service'

export class ConfigController {
  private configService: ConfigService
  private fileConfigService: FileConfigService

  constructor() {
    this.configService = new ConfigService()
    this.fileConfigService = new FileConfigService()
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = await this.configService.getAllConfigs()
      res.json(ApiResponse.success(configs, '获取配置列表成功'))
    } catch (error) {
      console.error('获取配置列表失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取配置列表失败'))
    }
  }

  /**
   * 获取单个配置
   */
  async getConfigByKey(req: Request, res: Response): Promise<void> {
    try {
      const { configKey } = req.params
      const config = await this.configService.getConfigByKey(configKey)
      
      if (!config) {
        res.status(404).json(ApiResponse.error(404, '配置不存在'))
        return
      }

      res.json(ApiResponse.success(config, '获取配置成功'))
    } catch (error) {
      console.error('获取配置失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取配置失败'))
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { configKey } = req.params
      const updateData = req.body
      
      const config = await this.configService.updateConfig(configKey, updateData)
      res.json(ApiResponse.success(config, '更新配置成功'))
    } catch (error) {
      console.error('更新配置失败:', error)
      res.status(500).json(ApiResponse.error(1, '更新配置失败'))
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(req: Request, res: Response): Promise<void> {
    try {
      const { configKey } = req.params
      const success = await this.configService.deleteConfig(configKey)
      
      if (!success) {
        res.status(404).json(ApiResponse.error(404, '配置不存在'))
        return
      }

      res.json(ApiResponse.success(null, '删除配置成功'))
    } catch (error) {
      console.error('删除配置失败:', error)
      res.status(500).json(ApiResponse.error(1, '删除配置失败'))
    }
  }

  /**
   * 获取活跃配置（用于前端）
   */
  async getActiveConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = await this.configService.getActiveConfigs()
      res.json(ApiResponse.success(configs, '获取活跃配置成功'))
    } catch (error) {
      console.error('获取活跃配置失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取活跃配置失败'))
    }
  }

  /**
   * 获取个人信息（兼容原aboutMe接口）
   */
  async getAboutMe(req: Request, res: Response): Promise<void> {
    try {
      const aboutMeConfig = this.fileConfigService.getAboutMeConfig()
      res.json(ApiResponse.success(aboutMeConfig, '获取个人信息成功'))
    } catch (error) {
      console.error('获取个人信息失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取个人信息失败'))
    }
  }
} 