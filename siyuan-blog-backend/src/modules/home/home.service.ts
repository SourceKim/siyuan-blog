import { 
  HomeDataDto, 
  ProfileInfoDto, 
  SocialLinksDto, 
  BlogStatsDto, 
  RecommendedDocDto
} from './home.dto'
import { FileConfigService } from '../../config/file-config.service'
import { NoteService } from '../note/note.service'

export class HomeService {
  private fileConfigService: FileConfigService
  private noteService: NoteService

  constructor() {
    this.fileConfigService = new FileConfigService()
    this.noteService = new NoteService()
  }

  /**
   * 获取首页完整数据
   */
  async getHomeData(recommendedCount?: number): Promise<HomeDataDto> {
    try {
      const [profile, socialLinks, blogStats, recommendedDocs] = await Promise.all([
        this.getProfileInfo(),
        this.getSocialLinks(),
        this.getBlogStats(),
        this.getRecommendedDocs(recommendedCount)
      ])

      return {
        profile,
        socialLinks,
        blogStats,
        recommendedDocs
      }
    } catch (error) {
      console.error('获取首页数据失败:', error)
      throw error
    }
  }

  /**
   * 获取个人信息
   */
  async getProfileInfo(): Promise<ProfileInfoDto> {
    try {
      // 直接从 about_me 配置获取数据
      const aboutMeData = this.fileConfigService.getConfig('about_me')
      
      return {
        name: aboutMeData?.name || '博主',
        avatarUrl: aboutMeData?.avatarUrl || '/default-avatar.png',
        bio: aboutMeData?.bio || '欢迎来到我的博客',
        title: aboutMeData?.title || '开发者'
      }
    } catch (error) {
      console.error('获取个人信息失败:', error)
      throw error
    }
  }

  /**
   * 获取社交链接
   */
  async getSocialLinks(): Promise<SocialLinksDto> {
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
   * 获取博客统计信息
   */
  async getBlogStats(): Promise<BlogStatsDto> {
    try {
      // 获取笔记本数量
      const notebooks = await this.noteService.getNotebooks()
      const notebookCount = notebooks.length

      // 获取推荐文档来计算文档总数（这里可以根据实际需求调整）
      const docs = await this.noteService.getRecommendedDocs(1000) // 获取大量文档来统计
      const documentCount = docs.length

      // 这里可以根据实际需求从数据库或其他地方获取真实的访问量和运行天数
      const visitCount = 1 // 默认值，后续可以接入真实的统计
      const runningDays = 1 // 默认值，后续可以计算真实的运行天数

      return {
        notebookCount,
        documentCount,
        visitCount,
        runningDays
      }
    } catch (error) {
      console.error('获取博客统计失败:', error)
      // 返回默认值而不是抛出错误，保证首页正常显示
      return {
        notebookCount: 0,
        documentCount: 0,
        visitCount: 1,
        runningDays: 1
      }
    }
  }

  /**
   * 获取推荐文档（用于首页展示）
   */
  async getRecommendedDocs(count?: number): Promise<RecommendedDocDto[]> {
    try {
      const recommendedCount = count || 12
      const docs = await this.noteService.getRecommendedDocs(recommendedCount)
      
      return docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        notebookName: doc.notebookName || '未知笔记本',
        hCtime: doc.hCtime,
        hMtime: doc.hMtime,
        summary: this.generateSummary(doc.name) // 生成摘要
      }))
    } catch (error) {
      console.error('获取推荐文档失败:', error)
      return []
    }
  }

  /**
   * 生成文档摘要（简单摘要）
   */
  private generateSummary(title: string): string {
    // 移除 .sy 后缀
    const cleanTitle = title.replace(/\.sy$/, '')
    return `关于${cleanTitle}的精彩内容，值得一读。`
  }

}
