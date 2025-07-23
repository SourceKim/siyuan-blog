<template>
  <div class="notes-view">
    <el-container class="notes-container">
      <!-- 左侧：笔记树 -->
      <el-aside 
        :width="sidebarWidth" 
        class="notes-sidebar"
        :class="{ 'is-collapsed': isSidebarCollapsed }"
      >
        <div class="sidebar-header">
          <h2 v-show="!isSidebarCollapsed">笔记浏览</h2>
          <el-button 
            @click="toggleSidebar"
            :icon="isSidebarCollapsed ? Expand : Fold"
            circle
            size="small"
          />
        </div>
        
        <div class="sidebar-content" v-show="!isSidebarCollapsed">
          <NoteTree />
        </div>
      </el-aside>

      <!-- 右侧：笔记内容 -->
      <el-main class="notes-main">
        <NoteContent />
      </el-main>
    </el-container>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="showMobileDrawer"
      title="笔记浏览"
      direction="ltr"
      size="280px"
      class="mobile-drawer"
    >
      <NoteTree />
    </el-drawer>

    <!-- 移动端浮动按钮 -->
    <el-button
      class="mobile-fab"
      type="primary"
      :icon="Menu"
      circle
      @click="showMobileDrawer = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NoteTree from '@/components/Note/NoteTree.vue'
import NoteContent from '@/components/Note/NoteContent.vue'
import { Expand, Fold, Menu } from '@element-plus/icons-vue'

// 响应式状态
const isSidebarCollapsed = ref(false)
const showMobileDrawer = ref(false)
const isMobile = ref(false)

// 计算属性
const sidebarWidth = computed(() => {
  if (isMobile.value) return '0px'
  return isSidebarCollapsed.value ? '60px' : '320px'
})

// 方法
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isSidebarCollapsed.value = false
  }
}

const handleResize = () => {
  checkIsMobile()
}

// 生命周期
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.notes-view {
  height: calc(100vh - 60px); /* 减去header高度 */
  position: relative;
}

.notes-container {
  height: 100%;
}

.notes-sidebar {
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notes-sidebar.is-collapsed {
  width: 60px !important;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  min-height: 60px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
}

.notes-main {
  padding: 0;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.mobile-fab {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 1000;
  box-shadow: var(--el-box-shadow);
  display: none;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .notes-sidebar {
    display: none;
  }
  
  .mobile-fab {
    display: flex;
  }
  
  .notes-view {
    height: calc(100vh - 60px);
  }
}

/* 抽屉样式 */
.mobile-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.mobile-drawer :deep(.el-drawer__body) {
  padding: 0;
}

/* 侧边栏折叠时的样式 */
.notes-sidebar.is-collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 8px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .notes-sidebar {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .notes-sidebar {
    width: 260px;
  }
}

/* 美化滚动条 */
.notes-sidebar :deep(.el-scrollbar__bar) {
  opacity: 0.3;
}

.notes-sidebar:hover :deep(.el-scrollbar__bar) {
  opacity: 0.6;
}
</style> 