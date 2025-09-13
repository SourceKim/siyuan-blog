<template>
  <div class="notes-view-container">
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
          <h2 class="section-title">博客文档</h2>
          
        </div>
        
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索文档..."
            :prefix-icon="Search"
            clearable
            size="small"
          />
        </div>

        <!-- 使用 NoteTree 组件 -->
        <div class="tree-container">
          <NoteTree 
            :search-text="searchText"
            :loading="loading"
            @doc-selected="handleDocSelected"
          />
        </div>
      </div>
    </template>

    <!-- 主内容区域 -->
    <template #content>
      <div class="notes-content">
        <!-- 使用 NoteContent 组件 -->
        <NoteContent />
      </div>
    </template>

    <!-- 右侧大纲区域 -->
    <template #outline>
      <div class="notes-outline" v-if="currentDoc">
        <NoteOutline :doc-id="currentDoc.id" />
      </div>
    </template>
  </CollapsibleSidebar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import CollapsibleSidebar from '@/components/Layout/CollapsibleSidebar.vue'
import NoteTree from '@/components/Note/NoteTree.vue'
import NoteContent from '@/components/Note/NoteContent.vue'
import NoteOutline from '@/components/Note/NoteOutline.vue'
import type { Doc } from '@/api/types'
import { Search } from '@element-plus/icons-vue'

// 状态管理
const noteStore = useNoteStore()
const {
  loading,
  currentDoc
} = storeToRefs(noteStore)

// 响应式状态
const searchText = ref('')

// 加载文档树
const refreshDocuments = async () => {
  await noteStore.fetchBlogDocumentTree()
}

const route = useRoute()
const router = useRouter()

const handleDocSelected = (doc: Doc) => {
  console.log('选择的文档:', doc)
  // 更新地址栏 docId，保持可刷新
  router.replace({ query: { ...route.query, docId: doc.id } })
}

const handleSidebarToggle = (isOpen: boolean) => {
  console.log('侧边栏状态:', isOpen ? '展开' : '收起')
  console.log('当前loading状态:', loading.value)
}

const handleSidebarClose = () => {
  console.log('侧边栏关闭')
}

// 生命周期
onMounted(async () => {
  console.log('NotesView mounted, 开始加载文档树')
  try {
    await refreshDocuments()
    console.log('文档树加载完成')
    // 如果路由上带有 docId，自动加载该文档
    const qId = (route.query.docId as string) || ''
    if (qId) {
      await noteStore.selectDocById(qId)
    }
  } catch (error) {
    console.error('文档树加载失败:', error)
  }
})

// 监听路由 docId 变化，动态切换文档
watch(() => route.query.docId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await noteStore.selectDocById(String(newId))
  }
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

/* 容器样式 */
.notes-view-container {
  position: relative;
  height: 100vh;
  background: transparent;
}

/* 侧边栏内容样式 */
.notes-sidebar-content {
  height: 100%;
  padding: 32px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
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

.tree-container {
  flex: 1;
  overflow: hidden;
}

/* 主内容区域样式 */
.notes-content {
  min-height: 100vh;
  background: transparent;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
}

.notes-outline {
  height: 100%;
  display: block;
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