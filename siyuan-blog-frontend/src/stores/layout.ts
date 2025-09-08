import { defineStore } from 'pinia'
import { ref } from 'vue'
import { layoutApi } from '@/api/layout'
import type { HeaderData, FooterData, LayoutData } from '@/api/layout'

export const useLayoutStore = defineStore('layout', () => {
  // 状态
  const headerData = ref<HeaderData | null>(null)
  const footerData = ref<FooterData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取 Layout 数据
  const fetchLayoutData = async () => {
    try {
      loading.value = true
      error.value = null
      const layoutData: LayoutData = await layoutApi.getLayoutData()
      headerData.value = layoutData.header
      footerData.value = layoutData.footer
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取Layout数据失败'
      console.error('获取Layout数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 清除数据
  const clearData = () => {
    headerData.value = null
    footerData.value = null
    error.value = null
  }

  return {
    // 状态
    headerData,
    footerData,
    loading,
    error,
    
    // 方法
    fetchLayoutData,
    clearData
  }
})
