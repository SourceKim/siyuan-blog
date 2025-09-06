<template>
  <CollapsibleSidebar 
    :default-open="true"
    sidebar-width="320px"
    collapsed-width="60px"
    @sidebar-toggle="handleSidebarToggle"
    @sidebar-close="handleSidebarClose"
  >
    <!-- 侧边栏内容 -->
    <template #sidebar>
      <div class="notes-sidebar-content">
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
    </template>

    <!-- 主内容区域 -->
    <template #content>
      <div class="notes-content">
        <!-- 使用 NoteContent 组件 -->
        <NoteContent />
      </div>
    </template>
  </CollapsibleSidebar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import CollapsibleSidebar from '@/components/Layout/CollapsibleSidebar.vue'
import NoteTree from '@/components/Note/NoteTree.vue'
import NoteContent from '@/components/Note/NoteContent.vue'
import type { Doc } from '@/api/types'
import {
  Search,
  Refresh
} from '@element-plus/icons-vue'

// 状态管理
const noteStore = useNoteStore()
const {
  loading,
  currentDoc
} = storeToRefs(noteStore)

// 响应式状态
const searchText = ref('')

// 方法
const refreshNotebooks = async () => {
  await noteStore.fetchNotebooks()
}

const handleDocSelected = (doc: Doc) => {
  // 可以在这里添加文档选择后的逻辑
  console.log('选择的文档:', doc)
}

const handleSidebarToggle = (isOpen: boolean) => {
  console.log('侧边栏状态:', isOpen ? '展开' : '收起')
}

const handleSidebarClose = () => {
  console.log('侧边栏关闭')
}

// 生命周期
onMounted(() => {
  refreshNotebooks()
})
</script>

<style scoped>
/* CSS 变量定义 - 科技感配色（与首页统一） */
:root {
  --tech-primary: #00bfff;
  --tech-secondary: #8a2be2;
  --tech-dark-bg: #0a0a0a;
  --tech-dark-card: #1a1a1a;
  --tech-dark-border: #333;
  --tech-text-light: #e0e0e0;
  --tech-text-muted: #9ca3af;
  --tech-gradient: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  --tech-shadow: 0 8px 32px rgba(0, 191, 255, 0.1);
  --tech-glow: 0 0 20px rgba(0, 191, 255, 0.3);
}

/* 侧边栏内容样式 */
.notes-sidebar-content {
  height: 100%;
  padding: 32px 0;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--tech-dark-border);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--tech-text-light);
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

/* 主内容区域样式 */
.notes-content {
  height: 100vh;
  background: var(--tech-dark-bg);
  padding: 0;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notes-sidebar-content {
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

/* 自定义滚动条 */
.notes-sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.notes-sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.notes-sidebar-content::-webkit-scrollbar-thumb {
  background: var(--tech-primary);
  border-radius: 3px;
}

.notes-sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--tech-secondary);
}
</style> 