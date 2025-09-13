import { 
  AboutPageDto, 
  AboutMeDto, 
  AboutConfigDto, 
  AboutSocialLinksDto, 
  TechStackItemDto,
  ExperienceItemDto,
  AboutBlogStatsDto 
} from './about.dto'
import { FileConfigService } from '../../config/file-config.service'

export class AboutService {
  private fileConfigService: FileConfigService

  constructor() {
    this.fileConfigService = new FileConfigService()
  }

  /**
   * 获取关于页面完整信息
   */
  async getAboutPageInfo(): Promise<AboutPageDto> {
    try {
      const [aboutMe, blogStats] = await Promise.all([
        this.getAboutMe(),
        this.getBlogStats()
      ])
      const aboutAll = this.fileConfigService.getConfig('aboutme') || {}
      return {
        name: aboutMe.name,
        avatarUrl: aboutMe.avatarUrl,
        bio: aboutMe.bio,
        config: aboutAll.config || {},
        blogStats
      }
    } catch (error) {
      console.error('获取关于页面信息失败:', error)
      throw error
    }
  }

  /**
   * 获取个人基本信息
   */
  async getAboutMe(): Promise<AboutMeDto> {
    try {
      const aboutMeConfig = this.fileConfigService.getConfig('aboutme') || {}
      return {
        name: aboutMeConfig.name || '博主',
        avatarUrl: aboutMeConfig.avatarUrl || '/default-avatar.png',
        bio: aboutMeConfig.bio || '欢迎来到我的博客'
      }
    } catch (error) {
      console.error('获取个人基本信息失败:', error)
      throw error
    }
  }

  /**
   * 获取关于页面配置
   */
  async getAboutConfig(): Promise<AboutConfigDto> {
    try {
      const [socialLinks, techStack, experience] = await Promise.all([
        this.getSocialLinks(),
        this.getTechStack(),
        this.getExperience()
      ])

      return {
        social: socialLinks,
        techStack,
        experience
      }
    } catch (error) {
      console.error('获取关于页面配置失败:', error)
      throw error
    }
  }



  /**
   * 获取社交链接
   */
  async getSocialLinks(): Promise<AboutSocialLinksDto> {
    try {
      const socialConfig = this.fileConfigService.getConfig('social_links') as any
      
      return {
        email: socialConfig?.email || 'contact@example.com',
        github: socialConfig?.github || 'https://github.com',
        website: socialConfig?.website || 'https://example.com'
      }
    } catch (error) {
      console.error('获取社交链接失败:', error)
      throw error
    }
  }

  /**
   * 获取技术栈
   */
  async getTechStack(): Promise<TechStackItemDto[]> {
    try {
      const techStackConfig = this.fileConfigService.getConfig('tech_stack') as any[]
      
      if (!Array.isArray(techStackConfig)) {
        return []
      }

      return techStackConfig.map(item => ({
        name: item.name || '',
        type: item.type || 'default'
      }))
    } catch (error) {
      console.error('获取技术栈失败:', error)
      return []
    }
  }

  /**
   * 获取工作经历
   */
  getExperience(): ExperienceItemDto[] {
    try {
      console.log('=== getExperience 调试信息 ===')
      const experienceConfig = this.fileConfigService.getConfig('experience') as any[]
      console.log('从 getConfig 获取的 experience 数据:', experienceConfig)
      console.log('数据类型:', typeof experienceConfig)
      console.log('是否为数组:', Array.isArray(experienceConfig))
      
      if (!Array.isArray(experienceConfig)) {
        console.log('experienceConfig 不是数组，返回空数组')
        return []
      }

      const result = experienceConfig.map(item => ({
        title: item.title || '',
        period: item.period || '',
        description: item.description || ''
      }))
      
      console.log('处理后的 experience 结果:', result)
      console.log('=== getExperience 调试信息结束 ===')
      
      return result
    } catch (error) {
      console.error('获取工作经历失败:', error)
      return []
    }
  }

  /**
   * 获取博客统计信息（用于关于页面）
   */
  async getBlogStats(): Promise<AboutBlogStatsDto> {
    try {
      // 直接从 aboutme.json 中读取写死的统计配置
      const aboutAll = this.fileConfigService.getConfig('aboutme') || {}
      const stats = aboutAll.blogStats || {}
      return {
        notebookCount: Number(stats.notebookCount ?? 0),
        documentCount: Number(stats.documentCount ?? 0),
        visitCount: Number(stats.visitCount ?? 1),
        runningDays: Number(stats.runningDays ?? 1)
      }
    } catch (error) {
      console.error('获取博客统计失败:', error)
      // 返回默认值而不是抛出错误，保证关于页面正常显示
      return {
        notebookCount: 0,
        documentCount: 0,
        visitCount: 1,
        runningDays: 1
      }
    }
  }

  /**
   * 计算博客运行天数
   */
  private calculateRunningDays(): number {
    try {
      // 这里可以设置博客开始时间，或者从配置文件读取
      const blogStartDate = new Date('2024-01-01') // 示例开始日期
      const currentDate = new Date()
      const timeDiff = currentDate.getTime() - blogStartDate.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
      
      return Math.max(daysDiff, 1) // 至少显示1天
    } catch (error) {
      console.error('计算运行天数失败:', error)
      return 1
    }
  }
}
