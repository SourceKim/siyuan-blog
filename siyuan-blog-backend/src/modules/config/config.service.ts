import { ConfigDto, UpdateConfigDto } from './config.dto'
import { FileConfigService } from '../../config/file-config.service'

export class ConfigService {
  private fileConfigService: FileConfigService

  constructor() {
    this.fileConfigService = new FileConfigService()
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<ConfigDto[]> {
    try {
      // 已移除 getAllConfig，返回空数组或按需实现收集逻辑
      const allConfig: Record<string, any> = {}
      const configs: ConfigDto[] = []
      
      for (const [key, value] of Object.entries(allConfig)) {
        configs.push({
          configKey: key,
          configValue: value,
          description: this.getConfigDescription(key),
          isActive: true
        })
      }
      
      return configs
    } catch (error) {
      console.error('获取配置失败:', error)
      throw error
    }
  }

  /**
   * 根据配置键获取单个配置
   */
  async getConfigByKey(configKey: string): Promise<ConfigDto | null> {
    try {
      const value = this.fileConfigService.getConfig(configKey)
      
      if (value === undefined) {
        return null
      }

      return {
        configKey,
        configValue: value,
        description: this.getConfigDescription(configKey),
        isActive: true
      }
    } catch (error) {
      console.error('获取配置失败:', error)
      throw error
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(configKey: string, updateData: UpdateConfigDto): Promise<ConfigDto> {
    try {
      this.fileConfigService.updateConfig(configKey, updateData.configValue)

      return {
        configKey,
        configValue: updateData.configValue,
        description: updateData.description || this.getConfigDescription(configKey),
        isActive: updateData.isActive !== undefined ? updateData.isActive : true
      }
    } catch (error) {
      console.error('更新配置失败:', error)
      throw error
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(configKey: string): Promise<boolean> {
    try {
      return this.fileConfigService.deleteConfig(configKey)
    } catch (error) {
      console.error('删除配置失败:', error)
      throw error
    }
  }

  /**
   * 获取活跃配置（用于前端）
   */
  async getActiveConfigs(): Promise<{ [key: string]: any }> {
    try {
      // 已移除 getAllConfig
      return {}
    } catch (error) {
      console.error('获取活跃配置失败:', error)
      throw error
    }
  }

  /**
   * 获取配置描述
   */
  private getConfigDescription(configKey: string): string {
    const descriptions: { [key: string]: string } = {
      'about_me': '个人基本信息',
      'social_links': '社交链接配置',
      'tech_stack': '技术栈配置'
    }
    
    return descriptions[configKey] || '自定义配置'
  }
} 