import api from './index'

// 配置相关API
export const configApi = {
  // 获取所有配置
  async getAllConfigs(): Promise<any[]> {
    return api.get('/config')
  },

  // 获取活跃配置（前端使用）
  async getActiveConfigs(): Promise<{ [key: string]: any }> {
    return api.get('/config/active')
  },

  // 获取单个配置
  async getConfigByKey(configKey: string): Promise<any> {
    return api.get(`/config/${configKey}`)
  },

  // 更新配置
  async updateConfig(configKey: string, configValue: any, description?: string): Promise<any> {
    return api.put(`/config/${configKey}`, {
      configValue,
      description,
      isActive: true
    })
  },

  // 删除配置
  async deleteConfig(configKey: string): Promise<void> {
    return api.delete(`/config/${configKey}`)
  },

  // 获取个人信息配置（整合版）
  async getAboutMeConfig(): Promise<any> {
    return api.get('/about/info')
  }
} 