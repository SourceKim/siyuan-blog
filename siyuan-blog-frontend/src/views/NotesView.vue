<template>
  <div class="notes-layout">
    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 左侧导航栏 -->
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="toggleSidebar">
          <el-icon>
            <ArrowLeft v-if="sidebarOpen" />
            <ArrowRight v-else />
          </el-icon>
        </div>

        <div class="sidebar-content">
          <div class="section-header">
            <h2 class="section-title">笔记导航</h2>
            <div class="header-actions">
              <el-button @click="refreshNotebooks" :loading="loading" :icon="Refresh" size="small" text />
            </div>
          </div>
          
          <div class="search-box">
            <el-input
              v-model="searchText"
              placeholder="搜索笔记本和文档..."
              :prefix-icon="Search"
              clearable
              size="small"
            />
          </div>

          <!-- 使用 NoteTree 组件 -->
          <NoteTree 
            v-loading="loading"
            :search-text="searchText"
            @doc-selected="handleDocSelected"
          />
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="content" :class="{ 'sidebar-collapsed': !sidebarOpen }">
        <!-- 使用 NoteContent 组件 -->
        <NoteContent />
      </main>
    </div>

    <!-- 侧边栏遮罩 (移动端) -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-mask"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import NoteTree from '@/components/Note/NoteTree.vue'
import NoteContent from '@/components/Note/NoteContent.vue'
import type { Doc } from '@/api/types'
import {
  Search,
  Refresh,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'

// 状态管理
const noteStore = useNoteStore()
const {
  loading,
  currentDoc
} = storeToRefs(noteStore)

// 响应式状态
// 桌面端默认展开，移动端默认收起
const sidebarOpen = ref(window.innerWidth > 960)
const searchText = ref('')

// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const refreshNotebooks = async () => {
  await noteStore.fetchNotebooks()
}

const handleDocSelected = (doc: Doc) => {
  // 在移动端选择文档后关闭侧边栏
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
}

// 监听路由变化，在移动端关闭侧边栏
watch(() => currentDoc.value, () => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
})

// 生命周期
onMounted(() => {
  refreshNotebooks()
})
</script>

<style scoped>
/* CSS 变量定义 - 参考示例的深色主题 */
:root {
  --dark-bg: #111827;
  --dark-card: #1f2937;
  --neon-accent: #3b82f6;
  --purple-accent: #8b5cf6;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  --vp-sidebar-width: 320px;
  --vp-sidebar-collapsed-width: 70px;
}

/* 全局布局 */
.notes-layout {
  min-height: 100vh;
  background: var(--dark-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  color: var(--text-primary);
}

/* 主容器 */
.main-container {
  display: flex;
  min-height: 100vh;
  background: var(--dark-bg);
}

/* 侧边栏 */
.sidebar {
  width: var(--vp-sidebar-width);
  background: var(--dark-bg);
  border-right: 1px solid var(--border-color);
  position: fixed;
  top: 60px; /* 为AppHeader留出空间 */
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

/* 桌面端折叠状态 */
.sidebar:not(.sidebar-open) {
  width: var(--vp-sidebar-collapsed-width);
  border-right: 1px solid var(--border-color);
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  right: -16px;
  top: 24px;
  width: 32px;
  height: 32px;
  background: var(--neon-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 9999;
  border: 1px solid var(--border-color);
}

.collapse-btn:hover {
  transform: scale(1.05);
  background: #4f90ff;
}

/* 移动端的transform逻辑 */
@media (max-width: 960px) {
  .sidebar {
    width: var(--vp-sidebar-width) !important;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  /* 移动端折叠状态下也要重置宽度 */
  .sidebar:not(.sidebar-open) {
    width: var(--vp-sidebar-width) !important;
  }
  
  /* 移动端隐藏折叠按钮 */
  .collapse-btn {
    display: none;
  }
}

.sidebar-content {
  padding: 32px 0;
  white-space: nowrap;
  opacity: 1;
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 92px); /* 减去header和padding的高度 */
}

/* 折叠时隐藏内容 */
.sidebar:not(.sidebar-open) .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.02em;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-box {
  padding: 0 24px 16px;
}

/* 主内容区域 */
.content {
  flex: 1;
  margin-left: var(--vp-sidebar-width);
  margin-top: 60px; /* 为AppHeader留出空间 */
  background: var(--dark-bg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: calc(100vh - 60px); /* 减去header高度 */
  position: relative;
  z-index: 1;
}

/* 侧边栏折叠时，内容区域调整 */
.content.sidebar-collapsed {
  margin-left: var(--vp-sidebar-collapsed-width);
  margin-top: 60px; /* 为AppHeader留出空间 */
}

/* 桌面端内容区域确保正确的margin */
@media (min-width: 961px) {
  .content {
    margin-left: var(--vp-sidebar-width);
    margin-top: 60px; /* 为AppHeader留出空间 */
  }
  
  .content.sidebar-collapsed {
    margin-left: var(--vp-sidebar-collapsed-width);
    margin-top: 60px; /* 为AppHeader留出空间 */
  }
}

/* 侧边栏遮罩 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 40;
  display: none;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .content,
  .content.sidebar-collapsed {
    margin-left: 0 !important;
  }
  
  .sidebar-mask {
    display: block;
  }
}

/* 动画效果 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: var(--shadow-secondary);
  }
  50% {
    box-shadow: var(--neon-glow), var(--shadow-secondary);
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}

/* 主题适配 */
.dark {
  --bg-primary: #0f1419;
  --bg-secondary: #1a1f29;
  --bg-tertiary: #242936;
  --text-primary: #e6e8eb;
  --text-secondary: #8b949e;
  --accent-primary: #58a6ff;
}

@media (min-width: 960px) {
  .sidebar {
    transform: translateX(0);
    position: static;
  }
  
  .content {
    margin-left: 0;
    margin-top: 60px; /* 移动端也需要为header留出空间 */
  }
}

@media (max-width: 768px) {
  .sidebar-content {
    padding: 16px 0;
  }
  
  .section-header {
    padding: 0 16px 12px;
    margin-bottom: 12px;
  }
  
  .search-box {
    padding: 0 16px 12px;
  }
}

/* 响应式动画 */
@media (prefers-reduced-motion: no-preference) {
  .sidebar,
  .content,
  .collapse-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* 焦点可访问性 */
.collapse-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* 侧边栏滚动条样式 */
.sidebar-content {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.sidebar-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style> 