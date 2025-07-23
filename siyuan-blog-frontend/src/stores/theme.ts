import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题状态
  const isDark = ref(false)

  // 从localStorage获取保存的主题设置
  const initTheme = () => {
    const savedTheme = localStorage.getItem('siyuan-blog-theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统主题偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 设置主题
  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  // 监听主题变化，保存到localStorage
  watch(isDark, (newValue) => {
    localStorage.setItem('siyuan-blog-theme', newValue ? 'dark' : 'light')
    applyTheme()
  })

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
  }
}) 