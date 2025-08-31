import { Request, Response } from 'express'
import { AboutService } from './about.service'
import { ApiResponse } from './about.dto'

export class AboutController {
  private aboutService: AboutService

  constructor() {
    this.aboutService = new AboutService()
  }

  /**
   * 获取关于页面完整信息（唯一接口）
   */
  async getAboutPageInfo(req: Request, res: Response): Promise<void> {
    try {
      const aboutPageInfo = await this.aboutService.getAboutPageInfo()
      res.json(ApiResponse.success(aboutPageInfo, '获取关于页面信息成功'))
    } catch (error) {
      console.error('获取关于页面信息失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取关于页面信息失败'))
    }
  }
}
