import { Request, Response } from 'express'
import { LayoutService } from './layout.service'
import { ApiResponse } from './layout.dto'

export class LayoutController {
  private layoutService: LayoutService

  constructor() {
    this.layoutService = new LayoutService()
  }

  /**
   * 获取 Layout 数据
   */
  async getLayoutData(req: Request, res: Response): Promise<void> {
    try {
      const layoutData = this.layoutService.getLayoutData()
      res.json(ApiResponse.success(layoutData, '获取Layout数据成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取Layout数据失败'))
    }
  }

  // 其余接口已移除
}
