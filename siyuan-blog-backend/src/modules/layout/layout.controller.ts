import { Request, Response } from 'express'
import { LayoutService } from './layout.service'
import { ApiResponse, SiteConfigDto, FooterLinkDto } from './layout.dto'

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

  /**
   * 获取网站配置
   */
  async getSiteConfig(req: Request, res: Response): Promise<void> {
    try {
      const siteConfig = this.layoutService.getSiteConfig()
      res.json(ApiResponse.success(siteConfig, '获取网站配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取网站配置失败'))
    }
  }

  /**
   * 更新网站配置
   */
  async updateSiteConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as SiteConfigDto
      
      // 基本验证
      if (!config.siteName || !config.author) {
        res.status(400).json(ApiResponse.error(400, '网站名称和作者不能为空'))
        return
      }

      this.layoutService.updateSiteConfig(config)
      res.json(ApiResponse.success(null, '更新网站配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '更新网站配置失败'))
    }
  }

  /**
   * 获取Footer配置
   */
  async getFooterConfig(req: Request, res: Response): Promise<void> {
    try {
      const footerConfig = this.layoutService.getFooterConfig()
      res.json(ApiResponse.success(footerConfig, '获取Footer配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '获取Footer配置失败'))
    }
  }

  /**
   * 更新Footer配置
   */
  async updateFooterConfig(req: Request, res: Response): Promise<void> {
    try {
      const { slogan, links } = req.body as { slogan: string; links: FooterLinkDto[] }
      
      // 基本验证
      if (!slogan) {
        res.status(400).json(ApiResponse.error(400, '网站标语不能为空'))
        return
      }

      if (!Array.isArray(links)) {
        res.status(400).json(ApiResponse.error(400, '链接配置必须为数组'))
        return
      }

      this.layoutService.updateFooterConfig({ slogan, links })
      res.json(ApiResponse.success(null, '更新Footer配置成功'))
    } catch (error) {
      res.status(500).json(ApiResponse.error(1, '更新Footer配置失败'))
    }
  }
}
