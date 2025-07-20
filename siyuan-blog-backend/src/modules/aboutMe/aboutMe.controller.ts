import { Request, Response } from 'express'
import { AboutMeService } from './aboutMe.service'
import { ApiResponse } from './aboutMe.dto'

export class AboutMeController {
  private aboutMeService: AboutMeService

  constructor() {
    this.aboutMeService = new AboutMeService()
  }

  /**
   * 获取个人信息
   */
  async getAboutMe(req: Request, res: Response): Promise<void> {
    try {
      const aboutMe = await this.aboutMeService.getAboutMe()
      res.json(ApiResponse.success(aboutMe, '获取个人信息成功'))
    } catch (error) {
      console.error('获取个人信息失败:', error)
      res.status(500).json(ApiResponse.error(1, '获取个人信息失败'))
    }
  }

  /**
   * 更新个人信息 (如果需要的话)
   */
  async updateAboutMe(req: Request, res: Response): Promise<void> {
    try {
      const updateData = req.body
      const aboutMe = await this.aboutMeService.updateAboutMe(updateData)
      res.json(ApiResponse.success(aboutMe, '更新个人信息成功'))
    } catch (error) {
      console.error('更新个人信息失败:', error)
      res.status(500).json(ApiResponse.error(1, '更新个人信息失败'))
    }
  }
}
