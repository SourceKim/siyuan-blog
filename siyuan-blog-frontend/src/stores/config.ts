import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configApi } from '@/api/config'

export const useConfigStore = defineStore('config', () => {
  // 状态
  const configs = ref<{ [key: string]: any }>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性 - 获取各个配置模块
  const aboutMe = computed(() => configs.value.about_me || {})
  const homeSettings = computed(() => configs.value.home_settings || {})
  const aboutSettings = computed(() => configs.value.about_settings || {})
  const socialLinks = computed(() => configs.value.social_links || {})
  const techStack = computed(() => configs.value.tech_stack || [])

  // 整合的个人信息配置（兼容原aboutMe格式）
  const aboutMeConfig = computed(() => ({
    name: aboutMe.value.name || '博主',
    avatarUrl: aboutMe.value.avatarUrl || '/default-avatar.png',
    bio: aboutMe.value.bio || '欢迎来到我的博客',
    config: {
      home: homeSettings.value,
      about: aboutSettings.value,
      social: socialLinks.value,
      techStack: techStack.value
    }
  }))

  // 获取所有活跃配置
  const fetchActiveConfigs = async () => {
    try {
      loading.value = true
      error.value = null
      configs.value = await configApi.getActiveConfigs()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取配置失败'
      console.error('获取配置失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取单个配置
  const fetchConfigByKey = async (configKey: string) => {
    try {
      error.value = null
      const config = await configApi.getConfigByKey(configKey)
      configs.value[configKey] = config.configValue
      return config
    } catch (err) {
      error.value = err instanceof Error ? err.message : `获取配置 ${configKey} 失败`
      console.error(`获取配置 ${configKey} 失败:`, err)
      throw err
    }
  }

  // 更新单个配置
  const updateConfig = async (configKey: string, configValue: any, description?: string) => {
    try {
      error.value = null
      await configApi.updateConfig(configKey, configValue, description)
      configs.value[configKey] = configValue
    } catch (err) {
      error.value = err instanceof Error ? err.message : `更新配置 ${configKey} 失败`
      console.error(`更新配置 ${configKey} 失败:`, err)
      throw err
    }
  }

  // 删除配置
  const deleteConfig = async (configKey: string) => {
    try {
      error.value = null
      await configApi.deleteConfig(configKey)
      delete configs.value[configKey]
    } catch (err) {
      error.value = err instanceof Error ? err.message : `删除配置 ${configKey} 失败`
      console.error(`删除配置 ${configKey} 失败:`, err)
      throw err
    }
  }

  // 更新个人信息
  const updateAboutMe = async (data: { name?: string; avatarUrl?: string; bio?: string }) => {
    const currentAboutMe = { ...aboutMe.value, ...data }
    await updateConfig('about_me', currentAboutMe, '个人基本信息')
  }

  // 更新首页设置
  const updateHomeSettings = async (settings: any) => {
    await updateConfig('home_settings', settings, '首页显示设置')
  }

  // 更新关于页面设置
  const updateAboutSettings = async (settings: any) => {
    await updateConfig('about_settings', settings, '关于页面设置')
  }

  // 更新社交链接
  const updateSocialLinks = async (links: any) => {
    await updateConfig('social_links', links, '社交链接配置')
  }

  // 更新技术栈
  const updateTechStack = async (stack: any[]) => {
    await updateConfig('tech_stack', stack, '技术栈配置')
  }

  return {
    // 状态
    configs,
    loading,
    error,
    
    // 计算属性
    aboutMe,
    homeSettings,
    aboutSettings,
    socialLinks,
    techStack,
    aboutMeConfig,
    
    // 方法
    fetchActiveConfigs,
    fetchConfigByKey,
    updateConfig,
    deleteConfig,
    updateAboutMe,
    updateHomeSettings,
    updateAboutSettings,
    updateSocialLinks,
    updateTechStack,
  }
}) 