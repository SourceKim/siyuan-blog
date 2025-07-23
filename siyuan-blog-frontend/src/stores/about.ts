import { defineStore } from 'pinia'
import { ref } from 'vue'
import { aboutApi } from '@/api/about'
import type { AboutMe } from '@/api/types'

export const useAboutStore = defineStore('about', () => {
  // 状态
  const aboutMe = ref<AboutMe | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取个人信息
  const fetchAboutMe = async () => {
    try {
      loading.value = true
      error.value = null
      aboutMe.value = await aboutApi.getAboutMe()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取个人信息失败'
      console.error('获取个人信息失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 更新个人信息
  const updateAboutMe = async (data: Partial<AboutMe>) => {
    try {
      loading.value = true
      error.value = null
      aboutMe.value = await aboutApi.updateAboutMe(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新个人信息失败'
      console.error('更新个人信息失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    aboutMe,
    loading,
    error,
    
    // 方法
    fetchAboutMe,
    updateAboutMe,
  }
}) 