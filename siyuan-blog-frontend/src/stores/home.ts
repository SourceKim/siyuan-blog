import { defineStore } from 'pinia'
import { ref } from 'vue'
import { homeApi } from '@/api/home'

export const useHomeStore = defineStore('home', () => {
  // 状态
  const homeData = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取首页完整数据
  const fetchHomeData = async (count?: number) => {
    try {
      loading.value = true
      error.value = null
      homeData.value = await homeApi.getHomeData(count)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取首页数据失败'
      console.error('获取首页数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    homeData,
    loading,
    error,
    
    // 方法
    fetchHomeData,
  }
})
