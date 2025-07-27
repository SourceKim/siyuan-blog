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
/* CSS 变量定义 */
:root {
  --vp-c-white: #ffffff;
  --vp-c-black: #000000;
  --vp-c-gray-1: #f8f8f8;
  --vp-c-gray-2: #e5e5e5;
  --vp-c-gray-3: #d1d5db;
  --vp-c-text-1: #213547;
  --vp-c-text-2: #476582;
  --vp-c-text-3: #7c8b9c;
  --vp-c-brand-1: #3451b2;
  --vp-c-brand-2: #3a5ccc;
  --vp-c-bg: #ffffff;
  --vp-c-bg-alt: #f6f6f7;
  --vp-c-bg-elv: #ffffff;
  --vp-sidebar-width: 280px;
  --vp-sidebar-collapsed-width: 60px;
}

/* 全局布局 */
.notes-layout {
  min-height: 100vh;
  background: var(--vp-c-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* 主容器 */
.main-container {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.sidebar {
  width: var(--vp-sidebar-width);
  background: var(--vp-c-bg-alt);
  border-right: 1px solid var(--vp-c-gray-2);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

/* 桌面端折叠状态 */
.sidebar:not(.sidebar-open) {
  width: 60px;
  border-right: 1px solid var(--vp-c-gray-2);
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  z-index: 60;
}

.collapse-btn:hover {
  transform: scale(1.1);
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
  padding: 24px 0;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
  overflow: hidden;
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
  border-bottom: 1px solid var(--vp-c-gray-2);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.search-box {
  padding: 0 24px 16px;
}

/* 主内容区域 */
.content {
  flex: 1;
  margin-left: var(--vp-sidebar-width);
  background: var(--vp-c-bg);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

/* 侧边栏折叠时，内容区域调整 */
.content.sidebar-collapsed {
  margin-left: var(--vp-sidebar-collapsed-width);
}

/* 桌面端内容区域确保正确的margin */
@media (min-width: 961px) {
  .content {
    margin-left: var(--vp-sidebar-width);
  }
  
  .content.sidebar-collapsed {
    margin-left: var(--vp-sidebar-collapsed-width);
  }
}

/* 侧边栏遮罩 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --vp-c-bg: #1a1a1a;
    --vp-c-bg-alt: #2d2d2d;
    --vp-c-bg-elv: #262626;
    --vp-c-text-1: #ffffff;
    --vp-c-text-2: #c9c9c9;
    --vp-c-text-3: #8e8e8e;
    --vp-c-gray-1: #3d3d3d;
    --vp-c-gray-2: #4d4d4d;
    --vp-c-gray-3: #5d5d5d;
  }
}

@media (min-width: 960px) {
  .sidebar {
    transform: translateX(0);
    position: static;
  }
  
  .content {
    margin-left: 0;
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

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --vp-c-bg: #1b1b1f;
    --vp-c-bg-alt: #161618;
    --vp-c-bg-elv: #202127;
    --vp-c-text-1: rgba(255, 255, 245, 0.86);
    --vp-c-text-2: rgba(235, 235, 245, 0.6);
    --vp-c-text-3: rgba(235, 235, 245, 0.38);
    --vp-c-gray-1: #515c67;
    --vp-c-gray-2: #414853;
    --vp-c-gray-3: #32363f;
    --vp-c-brand-1: #a8b1ff;
    --vp-c-brand-2: #5c7cfa;
  }
}
</style> 