import { Request, Response } from 'express'
import { HomeService } from './home.service'
import { ApiResponse } from './home.dto'

export class HomeController {
  private homeService: HomeService

  constructor() {
    this.homeService = new HomeService()
  }

  /**
   * 获取首页完整数据（唯一接口）
   */
  async getHomeData(req: Request, res: Response): Promise<void> {
    try {
      const { count } = req.query
      const recommendedCount = count ? parseInt(String(count)) : undefined
      
      const homeData = await this.homeService.getHomeData(recommendedCount)
      res.json(ApiResponse.success(homeData, '获取首页数据成功'))
    } catch (error) {
      console.error('获取首页数据失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取首页数据失败'))
    }
  }
}
