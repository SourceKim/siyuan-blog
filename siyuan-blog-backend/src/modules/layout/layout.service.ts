import { FileConfigService } from '../../config/file-config.service'
import { HeaderDataDto, FooterDataDto, LayoutDataDto, FooterLinkDto, SiteConfigDto } from './layout.dto'

export class LayoutService {
  private fileConfigService: FileConfigService

  constructor() {
    this.fileConfigService = new FileConfigService()
  }

  /**
   * 获取布局配置
   */
  private getLayoutConfig() {
    return this.fileConfigService.getConfig('layout_config')
  }

  /**
   * 获取网站基本信息
   */
  private getSiteInfo() {
    const layoutConfig = this.getLayoutConfig()
    const siteConfig = layoutConfig?.site || {}
    return {
      name: siteConfig.siteName || 'SiYuan Blog',
      avatarUrl: siteConfig.avatarUrl || '/default-avatar.png',
      bio: siteConfig.bio || '基于思源笔记构建的个人博客',
      description: siteConfig.description || '记录技术学习和生活感悟的个人博客',
      keywords: siteConfig.keywords || [],
      author: siteConfig.author || '博主'
    }
  }

  /**
   * 获取 Footer 配置（私有方法）
   */
  private getFooterConfigInternal() {
    const layoutConfig = this.getLayoutConfig()
    const footerConfig = layoutConfig?.footer || {}
    return {
      slogan: footerConfig.slogan || '基于思源笔记构建',
      links: footerConfig.links || []
    }
  }

  /**
   * 获取 Layout 数据
   */
  getLayoutData(): LayoutDataDto {
    const siteInfo = this.getSiteInfo()
    const footerConfig = this.getFooterConfigInternal()
    
    return {
      header: {
        siteName: siteInfo.name,
        avatarUrl: siteInfo.avatarUrl
      },
      footer: {
        siteName: siteInfo.name,
        bio: siteInfo.bio,
        currentYear: new Date().getFullYear(),
        slogan: footerConfig.slogan,
        links: footerConfig.links
      }
    }
  }

  /**
   * 获取网站配置
   */
  getSiteConfig(): SiteConfigDto {
    const layoutConfig = this.getLayoutConfig()
    const siteConfig = layoutConfig?.site || {}
    return {
      siteName: siteConfig.siteName || 'SiYuan Blog',
      avatarUrl: siteConfig.avatarUrl || '/default-avatar.png',
      bio: siteConfig.bio || '基于思源笔记构建的个人博客',
      description: siteConfig.description || '记录技术学习和生活感悟的个人博客',
      keywords: siteConfig.keywords || [],
      author: siteConfig.author || '博主'
    }
  }

  /**
   * 更新网站配置
   */
  updateSiteConfig(config: SiteConfigDto): void {
    const layoutConfig = this.getLayoutConfig() || {}
    layoutConfig.site = config
    this.fileConfigService.updateConfig('layout_config', layoutConfig)
  }

  /**
   * 获取Footer配置
   */
  getFooterConfig(): { slogan: string; links: FooterLinkDto[] } {
    const layoutConfig = this.getLayoutConfig()
    const footerConfig = layoutConfig?.footer || {}
    return {
      slogan: footerConfig.slogan || '基于思源笔记构建',
      links: footerConfig.links || []
    }
  }

  /**
   * 更新Footer配置
   */
  updateFooterConfig(config: { slogan: string; links: FooterLinkDto[] }): void {
    const layoutConfig = this.getLayoutConfig() || {}
    layoutConfig.footer = config
    this.fileConfigService.updateConfig('layout_config', layoutConfig)
  }
}
