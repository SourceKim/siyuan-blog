import { 
  HomeDataDto, 
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
      const [homeIntro, blogStats, recommendedDocs] = await Promise.all([
        this.fileConfigService.getConfig('home-intro'),
        this.getBlogStats(),
        this.getRecommendedDocs(recommendedCount)
      ])

      // 兼容：若 home-intro 无 socialLinks 字段，可回退 social_links.json
      const socialLinks = homeIntro?.socialLinks || this.fileConfigService.getConfig('social_links') || {}

      return {
        profile: {
          name: homeIntro?.name || '博主',
          avatarUrl: homeIntro?.avatarUrl || '/default-avatar.png',
          bio: homeIntro?.bio || '欢迎来到我的博客',
          title: homeIntro?.title || '开发者'
        },
        socialLinks: {
          email: socialLinks.email || 'contact@example.com',
          github: socialLinks.github || 'https://github.com',
          website: socialLinks.website || 'https://example.com'
        },
        blogStats,
        recommendedDocs
      }
    } catch (error) {
      console.error('获取首页数据失败:', error)
      throw error
    }
  }

  /**
   * 获取博客统计信息
   */
  async getBlogStats(): Promise<BlogStatsDto> {
    try {
      // 直接读取 home-intro.json 中的写死统计配置
      const intro = this.fileConfigService.getConfig('home-intro') || {}
      const stats = intro.blogStats || {}
      return {
        notebookCount: Number(stats.notebookCount ?? 0),
        documentCount: Number(stats.documentCount ?? 0),
        visitCount: Number(stats.visitCount ?? 1),
        runningDays: Number(stats.runningDays ?? 1)
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
