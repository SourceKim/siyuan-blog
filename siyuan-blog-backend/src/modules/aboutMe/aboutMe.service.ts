import { AboutMeDto } from './aboutMe.dto'

export class AboutMeService {
  /**
   * 获取个人信息
   * 这里可以从配置文件、数据库或环境变量中获取
   */
  async getAboutMe(): Promise<AboutMeDto> {
    try {
      // 从环境变量或配置中获取个人信息
      const aboutMe: AboutMeDto = {
        name: process.env.AUTHOR_NAME || '博主',
        avatarUrl: process.env.AUTHOR_AVATAR_URL || '/default-avatar.png',
        bio: process.env.AUTHOR_BIO || '欢迎来到我的博客'
      }

      return aboutMe
    } catch (error) {
      console.error('获取个人信息失败:', error)
      throw error
    }
  }

  /**
   * 更新个人信息 (如果需要的话)
   */
  async updateAboutMe(data: Partial<AboutMeDto>): Promise<AboutMeDto> {
    try {
      // 这里可以实现更新逻辑，比如写入数据库或配置文件
      // 目前返回合并后的数据
      const current = await this.getAboutMe()
      const updated = { ...current, ...data }
      
      // 在实际应用中，这里应该持久化数据
      
      return updated
    } catch (error) {
      console.error('更新个人信息失败:', error)
      throw error
    }
  }
}
