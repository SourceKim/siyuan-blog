import { 
  HomeDataDto, 
  ProfileInfoDto, 
  SocialLinksDto, 
  BlogStatsDto, 
  RecommendedDocDto,
  ContentTemplatesDto 
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
      const [profile, socialLinks, blogStats, recommendedDocs, contentTemplates] = await Promise.all([
        this.getProfileInfo(),
        this.getSocialLinks(),
        this.getBlogStats(),
        this.getRecommendedDocs(recommendedCount),
        this.getContentTemplates()
      ])

      return {
        profile,
        socialLinks,
        blogStats,
        recommendedDocs,
        contentTemplates
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
   * 生成文档摘要（智能摘要生成）
   */
  private generateSummary(title: string): string {
    // 移除 .sy 后缀
    const cleanTitle = title.replace(/\.sy$/, '')
    
    // 根据标题关键词生成智能摘要
    const summaries = [
      `探索${cleanTitle}的深层机制，揭示技术背后的核心原理与实践方法。`,
      `深入分析${cleanTitle}，分享实战经验与最佳实践，助你快速掌握关键技能。`,
      `从理论到实践，全面解析${cleanTitle}的应用场景与解决方案。`,
      `${cleanTitle}的完整指南，包含前沿技术分享与深度思考。`,
      `关于${cleanTitle}的技术洞察，结合实际案例的深度分析。`
    ]
    
    // 根据标题内容智能选择摘要模板
    if (cleanTitle.includes('Vue') || cleanTitle.includes('React') || cleanTitle.includes('前端')) {
      return `深入探讨${cleanTitle}的现代前端开发实践，分享高效开发技巧与架构设计思路。`
    } else if (cleanTitle.includes('Node') || cleanTitle.includes('后端') || cleanTitle.includes('服务器')) {
      return `解析${cleanTitle}的后端技术架构，从基础概念到生产环境的完整实践指南。`
    } else if (cleanTitle.includes('思考') || cleanTitle.includes('总结') || cleanTitle.includes('感悟')) {
      return `关于${cleanTitle}的深度思考与总结，分享个人见解与成长心得。`
    } else if (cleanTitle.includes('教程') || cleanTitle.includes('入门') || cleanTitle.includes('指南')) {
      return `${cleanTitle}完整教程，从零基础到进阶应用的系统性学习路径。`
    }
    
    // 默认随机选择一个摘要
    const randomIndex = Math.floor(Math.random() * summaries.length)
    return summaries[randomIndex]
  }

  /**
   * 获取内容模板配置
   */
  async getContentTemplates(): Promise<ContentTemplatesDto> {
    try {
      const templatesConfig = this.fileConfigService.getConfig('content_templates')
      
      return {
        summaryTemplates: templatesConfig?.summaryTemplates || {
          default: ['探索{title}的深层机制，揭示技术背后的核心原理与实践方法。'],
          frontend: '深入探讨{title}的现代前端开发实践，分享高效开发技巧与架构设计思路。',
          backend: '解析{title}的后端技术架构，从基础概念到生产环境的完整实践指南。',
          thinking: '关于{title}的深度思考与总结，分享个人见解与成长心得。',
          tutorial: '{title}完整教程，从零基础到进阶应用的系统性学习路径。'
        },
        tagRules: templatesConfig?.tagRules || {
          tech: {},
          content: {},
          category: {}
        },
        summaryKeywords: templatesConfig?.summaryKeywords || {
          frontend: ['vue', 'react', '前端'],
          backend: ['node', '后端', '服务器'],
          thinking: ['思考', '总结', '感悟'],
          tutorial: ['教程', '入门', '指南']
        },
        defaults: templatesConfig?.defaults || {
          fallbackName: '博主',
          fallbackTitle: '开发者',
          fallbackBio: '这是我的数字花园，分享技术思考与成长历程。',
          maxTags: 3,
          unknownNotebook: '未知笔记本'
        }
      }
    } catch (error) {
      console.error('获取内容模板失败:', error)
      throw error
    }
  }
}
