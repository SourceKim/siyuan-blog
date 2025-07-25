import api from './index'
import type { AboutMe } from './types'

// 个人信息相关API
export const aboutApi = {
  // 获取个人信息
  async getAboutMe(): Promise<AboutMe> {
    return api.get('/about/info')
  },
} 