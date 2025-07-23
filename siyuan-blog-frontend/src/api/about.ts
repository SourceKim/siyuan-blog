import api from './index'
import type { AboutMe } from './types'

// 个人信息相关API
export const aboutApi = {
  // 获取个人信息
  async getAboutMe(): Promise<AboutMe> {
    return api.get('/about/info')
  },

  // 更新个人信息
  async updateAboutMe(data: Partial<AboutMe>): Promise<AboutMe> {
    return api.put('/about/info', data)
  },
} 