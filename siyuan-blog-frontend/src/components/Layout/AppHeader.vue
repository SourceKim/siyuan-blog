<template>
  <el-header class="app-header">
    <div class="header-content">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <el-avatar 
          :src="aboutMe?.avatarUrl" 
          :size="36"
          class="logo-avatar"
        >
          <el-icon><User /></el-icon>
        </el-avatar>
        <span class="site-title">{{ aboutMe?.name || 'SiYuan Blog' }}</span>
      </div>

      <!-- 导航菜单 -->
      <el-menu 
        :default-active="$route.path" 
        mode="horizontal" 
        router
        class="nav-menu"
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/notes">
          <el-icon><Document /></el-icon>
          <span>笔记</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>关于我</span>
        </el-menu-item>
      </el-menu>

      <!-- 工具栏 -->
      <div class="toolbar">
        <!-- 主题切换 -->
        <el-tooltip :content="isDark ? '切换到浅色模式' : '切换到深色模式'">
          <el-button 
            circle 
            @click="toggleTheme"
            :icon="isDark ? Sunny : Moon"
          />
        </el-tooltip>

        <!-- 移动端菜单按钮 -->
        <el-button 
          circle 
          @click="toggleMobileMenu"
          :icon="Menu"
          class="mobile-menu-btn"
        />
      </div>
    </div>

    <!-- 移动端菜单 -->
    <el-drawer 
      v-model="showMobileMenu" 
      direction="rtl" 
      size="250px"
      title="菜单"
    >
      <el-menu 
        :default-active="$route.path" 
        router
        @select="handleMobileMenuSelect"
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/notes">
          <el-icon><Document /></el-icon>
          <span>笔记</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>关于我</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </el-header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAboutStore } from '@/stores/about'
import { storeToRefs } from 'pinia'
import {
  House,
  Document,
  InfoFilled,
  Sunny,
  Moon,
  Menu,
  User
} from '@element-plus/icons-vue'

// 状态管理
const themeStore = useThemeStore()
const aboutStore = useAboutStore()
const { isDark } = storeToRefs(themeStore)
const { aboutMe } = storeToRefs(aboutStore)

// 移动端菜单
const showMobileMenu = ref(false)

// 方法
const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleMobileMenuSelect = () => {
  showMobileMenu.value = false
}

// 初始化
onMounted(() => {
  aboutStore.fetchAboutMe()
})
</script>

<style scoped>
.app-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.site-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.nav-menu {
  flex: 1;
  justify-content: center;
  border-bottom: none;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-menu-btn {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .site-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 16px;
  }
  
  .logo-section {
    gap: 8px;
  }
  
  .logo-avatar {
    width: 32px;
    height: 32px;
  }
}
</style> 