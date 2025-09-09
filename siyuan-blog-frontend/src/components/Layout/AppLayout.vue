<template>
  <el-container class="app-layout">
    <!-- 科技感背景动画 -->
    <TechBackground />
    
    <!-- 头部 -->
    <AppHeader />
    
    <!-- 主要内容区域 -->
    <el-main class="app-main">
      <div class="main-content">
        <router-view />
      </div>
    </el-main>
    
    <!-- 底部 -->
    <AppFooter />
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import TechBackground from '@/components/TechBackground.vue'

// 初始化主题
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-main {
  flex: 1;
  padding: 0;
  background: transparent;
  position: relative;
  z-index: 1;
}

.main-content {
  width: 100%;
  padding: 0px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
}
</style> 