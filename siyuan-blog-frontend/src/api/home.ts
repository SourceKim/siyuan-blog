import api from './index'

// 首页数据相关API
export const homeApi = {
  // 获取首页完整数据
  async getHomeData(count?: number): Promise<any> {
    const params = count ? { count } : {}
    return api.get('/home/data', { params })
  },
}
