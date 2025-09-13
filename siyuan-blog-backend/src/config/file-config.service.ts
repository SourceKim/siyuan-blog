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
   * 解析新旧键名的兼容映射，返回首个存在的文件键名
   */
  private resolveExistingKey(primaryKey: string, fallbackKeys: string[] = []): string {
    const tryKeys = [primaryKey, ...fallbackKeys]
    for (const key of tryKeys) {
      const p = this.getConfigPath(key)
      if (fs.existsSync(p)) return key
    }
    // 不存在则返回主键（将创建主键文件）
    return primaryKey
  }

  /**
   * 读取指定配置文件
   */
  private readConfig(configKey: string): any {
    try {
      // 新旧键名兼容：layout/layout_config, aboutme/about_me
      const mappedKey =
        configKey === 'layout'
          ? this.resolveExistingKey('layout', ['layout_config'])
          : configKey === 'aboutme'
          ? this.resolveExistingKey('aboutme', ['about_me'])
          : configKey

      const configPath = this.getConfigPath(mappedKey)
      if (!fs.existsSync(configPath)) {
        return null
      }
      const data = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`读取配置文件 ${configKey} 失败:`, error)
      return null
    }
  }

  /**
   * 写入指定配置文件
   */
  private writeConfig(configKey: string, config: any): void {
    try {
      // 写入始终写到新键名
      const targetKey = configKey === 'layout_config' ? 'layout' : configKey === 'about_me' ? 'aboutme' : configKey
      const configPath = this.getConfigPath(targetKey)
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    } catch (error) {
      console.error(`写入配置文件 ${configKey} 失败:`, error)
      throw error
    }
  }

  // 默认配置与自动创建逻辑已移除

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
    const aboutMe = this.readConfig('aboutme')
    const socialLinks = this.readConfig('social_links')
    const techStack = this.readConfig('tech_stack')

    return {
      name: aboutMe?.name || '博主',
      avatarUrl: aboutMe?.avatarUrl || '/default-avatar.png',
      bio: aboutMe?.bio || '欢迎来到我的博客',
      config: {
        social: socialLinks || {},
        techStack: techStack || []
      }
    }
  }

  /**
   * 更新个人信息
   */
  updateAboutMe(data: { name?: string; avatarUrl?: string; bio?: string }): void {
    const currentConfig = this.readConfig('aboutme') || {}
    const updatedConfig = { ...currentConfig, ...data }
    this.writeConfig('aboutme', updatedConfig)
  }

  /**
   * 检查配置文件是否存在
   */
  configExists(configKey: string): boolean {
    return fs.existsSync(this.getConfigPath(configKey))
  }


} 