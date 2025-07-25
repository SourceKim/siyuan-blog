import * as fs from 'fs'
import * as path from 'path'

export class FileConfigService {
  private configDir: string

  constructor() {
    this.configDir = __dirname
  }

  /**
   * 根据configKey获取配置文件路径
   */
  private getConfigPath(configKey: string): string {
    return path.join(this.configDir, `${configKey}.json`)
  }

  /**
   * 读取指定配置文件
   */
  private readConfig(configKey: string): any {
    try {
      const configPath = this.getConfigPath(configKey)
      
      if (!fs.existsSync(configPath)) {
        this.createDefaultConfig(configKey)
      }
      
      const data = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`读取配置文件 ${configKey} 失败:`, error)
      return this.getDefaultConfigByKey(configKey)
    }
  }

  /**
   * 写入指定配置文件
   */
  private writeConfig(configKey: string, config: any): void {
    try {
      const configPath = this.getConfigPath(configKey)
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    } catch (error) {
      console.error(`写入配置文件 ${configKey} 失败:`, error)
      throw error
    }
  }

  /**
   * 创建默认配置文件
   */
  private createDefaultConfig(configKey: string): void {
    const defaultConfig = this.getDefaultConfigByKey(configKey)
    this.writeConfig(configKey, defaultConfig)
    console.log(`📝 创建默认配置文件: ${configKey}.json`)
  }

  /**
   * 根据configKey获取默认配置
   */
  private getDefaultConfigByKey(configKey: string): any {
    const defaultConfigs: { [key: string]: any } = {
      'about_me': {
        name: process.env.AUTHOR_NAME || '博主',
        avatarUrl: process.env.AUTHOR_AVATAR_URL || '/default-avatar.png',
        bio: process.env.AUTHOR_BIO || '欢迎来到我的博客，这里记录了我的技术学习和生活感悟。'
      },
      'home_settings': {
        showProfile: true,
        showSocialLinks: true,
        showStats: true,
        maxRecommendedArticles: 12,
        profileCollapsible: true
      },
      'about_settings': {
        showContactInfo: true,
        showTechStack: true,
        showBlogStats: true,
        showAvatar: true
      },
      'social_links': {
        email: process.env.AUTHOR_EMAIL || 'contact@example.com',
        github: process.env.AUTHOR_GITHUB || 'https://github.com',
        website: process.env.AUTHOR_WEBSITE || 'https://example.com'
      },
      'tech_stack': [
        { name: 'Vue 3', type: 'primary' },
        { name: 'TypeScript', type: 'success' },
        { name: 'Element Plus', type: 'warning' },
        { name: 'SiYuan', type: 'info' },
        { name: 'Pinia', type: 'danger' },
        { name: 'Vite', type: '' }
      ]
    }

    return defaultConfigs[configKey] || null
  }

  /**
   * 获取所有配置文件列表
   */
  private getAllConfigKeys(): string[] {
    return ['about_me', 'home_settings', 'about_settings', 'social_links', 'tech_stack']
  }

  /**
   * 获取所有配置
   */
  getAllConfig(): any {
    const allConfig: { [key: string]: any } = {}
    
    for (const configKey of this.getAllConfigKeys()) {
      allConfig[configKey] = this.readConfig(configKey)
    }
    
    return allConfig
  }

  /**
   * 获取指定配置
   */
  getConfig(key: string): any {
    return this.readConfig(key)
  }

  /**
   * 更新配置
   */
  updateConfig(key: string, value: any): void {
    this.writeConfig(key, value)
  }

  /**
   * 删除配置
   */
  deleteConfig(key: string): boolean {
    try {
      const configPath = this.getConfigPath(key)
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath)
        return true
      }
      return false
    } catch (error) {
      console.error(`删除配置文件 ${key} 失败:`, error)
      return false
    }
  }

  /**
   * 获取个人信息配置（整合多个配置文件）
   */
  getAboutMeConfig(): any {
    const aboutMe = this.readConfig('about_me')
    const homeSettings = this.readConfig('home_settings')
    const aboutSettings = this.readConfig('about_settings')
    const socialLinks = this.readConfig('social_links')
    const techStack = this.readConfig('tech_stack')

    return {
      name: aboutMe?.name || '博主',
      avatarUrl: aboutMe?.avatarUrl || '/default-avatar.png',
      bio: aboutMe?.bio || '欢迎来到我的博客',
      config: {
        home: homeSettings || {},
        about: aboutSettings || {},
        social: socialLinks || {},
        techStack: techStack || []
      }
    }
  }

  /**
   * 更新个人信息
   */
  updateAboutMe(data: { name?: string; avatarUrl?: string; bio?: string }): void {
    const currentConfig = this.readConfig('about_me')
    const updatedConfig = { ...currentConfig, ...data }
    this.writeConfig('about_me', updatedConfig)
  }

  /**
   * 检查配置文件是否存在
   */
  configExists(configKey: string): boolean {
    return fs.existsSync(this.getConfigPath(configKey))
  }

  /**
   * 初始化所有默认配置文件
   */
  initializeAllConfigs(): void {
    for (const configKey of this.getAllConfigKeys()) {
      if (!this.configExists(configKey)) {
        this.createDefaultConfig(configKey)
      }
    }
  }
} 