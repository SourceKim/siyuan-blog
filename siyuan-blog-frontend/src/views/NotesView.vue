<template>
  <div class="notes-layout">
    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 左侧导航栏 -->
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-content">
          <div class="section-header">
            <h2 class="section-title">笔记导航</h2>
            <div class="header-actions">
              <el-button @click="refreshNotebooks" :loading="loading" :icon="Refresh" size="small" text />
              <el-button @click="toggleSidebar" :icon="Menu" text class="sidebar-toggle" />
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

          <nav class="tree-nav" v-loading="loading">
            <ul class="nav-list">
              <li 
                v-for="(notebook, index) in filteredNotebooks" 
                :key="notebook.id"
                class="nav-item notebook-item"
              >
                <!-- 笔记本节点 -->
                <div class="nav-link notebook-link" @click="toggleNotebook(notebook)">
                  <div class="nav-content">
                    <el-icon class="expand-icon" :class="{ 'expanded': expandedNotebooks.has(notebook.id) }">
                      <ArrowRight />
                    </el-icon>
                    <span class="nav-number">{{ index + 1 }}.</span>
                    <span class="nav-text">{{ notebook.name }}</span>
                  </div>
                  <el-tag v-if="notebookDocCounts[notebook.id]" size="small" type="info" round>
                    {{ notebookDocCounts[notebook.id] }}
                  </el-tag>
                </div>
                
                <!-- 文档子节点 -->
                <ul 
                  v-if="expandedNotebooks.has(notebook.id)" 
                  class="nav-list sub-nav-list"
                  v-loading="loadingNotebooks.has(notebook.id)"
                >
                  <li 
                    v-for="(doc, docIndex) in getNotebookDocs(notebook.id)" 
                    :key="doc.id"
                    class="nav-item doc-item"
                    :class="{ 'active': currentDoc?.id === doc.id }"
                  >
                    <div 
                      class="nav-link doc-link"
                      @click="selectDoc(doc)"
                    >
                      <div class="nav-content">
                        <span class="nav-number">{{ index + 1 }}.{{ docIndex + 1 }}</span>
                        <span class="nav-text">{{ removeFileExtension(doc.name) }}</span>
                      </div>
                      <el-tag v-if="doc.subFileCount > 0" size="small" type="warning" round>
                        {{ doc.subFileCount }}
                      </el-tag>
                    </div>
                  </li>
                  
                  <li v-if="getNotebookDocs(notebook.id).length === 0" class="nav-item empty-item">
                    <div class="nav-link empty-link">
                      <span class="nav-text empty-text">该笔记本暂无文档</span>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
            
            <div v-if="!hasNotebooks && !loading" class="empty-state">
              <p>暂无笔记本</p>
              <el-button @click="refreshNotebooks" type="primary" size="small">重新加载</el-button>
            </div>
          </nav>
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="content">
        <div class="content-container">
          <!-- 欢迎页面 -->
          <div v-if="!currentDoc" class="welcome-page">
            <div class="hero-section">
              <h1 class="hero-title">笔记浏览器</h1>
              <p class="hero-subtitle">浏览和阅读你的思源笔记</p>
              <div class="hero-actions">
                <el-button @click="fetchNotebooks" type="primary" :icon="Refresh">
                  加载笔记本
                </el-button>
                <el-button @click="$router.push('/')" :icon="House">
                  返回首页
                </el-button>
              </div>
            </div>
          </div>

          <!-- 文档内容 -->
          <article v-else-if="currentNote" class="article">
            <!-- 文档头部 -->
            <header class="article-header">
              <div class="breadcrumb">
                <span class="breadcrumb-item">{{ currentNotebook?.name }}</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">{{ removeFileExtension(currentDoc.name) }}</span>
              </div>
              
              <h1 class="article-title">{{ removeFileExtension(currentDoc.name) }}</h1>
              
              <div class="article-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  更新时间：{{ formatTime(currentDoc.hMtime) }}
                </span>
                <span v-if="currentDoc.subFileCount > 0" class="meta-item">
                  <el-icon><FolderOpened /></el-icon>
                  {{ currentDoc.subFileCount }} 个子文档
                </span>
              </div>
            </header>

            <!-- 文档内容 -->
            <div class="article-content">
              <div class="content-wrapper" v-html="sanitizedContent"></div>
            </div>

            <!-- 文档底部 -->
            <footer class="article-footer">
              <div class="article-nav">
                <div class="nav-prev">
                  <a v-if="prevDoc" @click="selectDoc(prevDoc)" class="nav-link">
                    <span class="nav-direction">← 上一篇</span>
                    <span class="nav-title">{{ removeFileExtension(prevDoc.name) }}</span>
                  </a>
                </div>
                <div class="nav-next">
                  <a v-if="nextDoc" @click="selectDoc(nextDoc)" class="nav-link">
                    <span class="nav-direction">下一篇 →</span>
                    <span class="nav-title">{{ removeFileExtension(nextDoc.name) }}</span>
                  </a>
                </div>
              </div>
            </footer>
          </article>

          <!-- 加载状态 -->
          <div v-else-if="loading" class="loading-state">
            <div class="loading-content">
              <el-skeleton :rows="6" animated />
            </div>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="error" class="error-state">
            <el-alert
              :title="error"
              type="error"
              show-icon
              center
              class="error-alert"
            >
              <el-button @click="refreshContent" type="primary" size="small">
                重新加载
              </el-button>
            </el-alert>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="该文档暂无内容" :image-size="100">
              <el-button @click="refreshContent" type="primary">重新加载</el-button>
            </el-empty>
          </div>
        </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import { noteApi } from '@/api/note'
import type { Doc, Notebook } from '@/api/types'
import {
  Menu,
  Search,
  Refresh,
  ArrowRight,
  Clock,
  FolderOpened,
  House
} from '@element-plus/icons-vue'

// 状态管理
const noteStore = useNoteStore()
const {
  notebooks,
  currentNotebook,
  currentDoc,
  currentNote,
  loading,
  error,
  hasNotebooks
} = storeToRefs(noteStore)

// 响应式状态
const sidebarOpen = ref(true) // 默认展开
const searchText = ref('')
const expandedNotebooks = ref(new Set<string>())
const loadingNotebooks = ref(new Set<string>())
const notebookDocs = ref(new Map<string, Doc[]>())
const notebookDocCounts = ref<Record<string, number>>({})

// 计算属性
const filteredNotebooks = computed(() => {
  if (!searchText.value) return notebooks.value
  return notebooks.value.filter(notebook => 
    notebook.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    getNotebookDocs(notebook.id).some(doc => 
      doc.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  )
})

const sanitizedContent = computed(() => {
  if (!currentNote.value?.content) return ''
  return currentNote.value.content
})

const prevDoc = computed(() => {
  if (!currentDoc.value || !currentNotebook.value) return null
  const docs = getNotebookDocs(currentNotebook.value.id)
  const currentIndex = docs.findIndex(doc => doc.id === currentDoc.value?.id)
  return currentIndex > 0 ? docs[currentIndex - 1] : null
})

const nextDoc = computed(() => {
  if (!currentDoc.value || !currentNotebook.value) return null
  const docs = getNotebookDocs(currentNotebook.value.id)
  const currentIndex = docs.findIndex(doc => doc.id === currentDoc.value?.id)
  return currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null
})

// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const fetchNotebooks = async () => {
  await noteStore.fetchNotebooks()
  // 获取每个笔记本的文档数量
  for (const notebook of notebooks.value) {
    try {
      const docs = await noteApi.getDocs({ notebook: notebook.id })
      notebookDocCounts.value[notebook.id] = docs?.length || 0
    } catch (error) {
      console.error(`获取笔记本 ${notebook.name} 文档数量失败:`, error)
      notebookDocCounts.value[notebook.id] = 0
    }
  }
}

const refreshNotebooks = async () => {
  await fetchNotebooks()
}

const toggleNotebook = async (notebook: Notebook) => {
  if (expandedNotebooks.value.has(notebook.id)) {
    // 收起笔记本
    expandedNotebooks.value.delete(notebook.id)
  } else {
    // 展开笔记本
    expandedNotebooks.value.add(notebook.id)
    
    // 如果还没有加载过文档，则加载
    if (!notebookDocs.value.has(notebook.id)) {
      loadingNotebooks.value.add(notebook.id)
      try {
        const docs = await noteApi.getDocs({ notebook: notebook.id })
        notebookDocs.value.set(notebook.id, docs || [])
      } catch (error) {
        console.error('加载文档失败:', error)
        notebookDocs.value.set(notebook.id, [])
      } finally {
        loadingNotebooks.value.delete(notebook.id)
      }
    }
  }
}

const getNotebookDocs = (notebookId: string): Doc[] => {
  return notebookDocs.value.get(notebookId) || []
}

const selectDoc = async (doc: Doc) => {
  // 设置当前笔记本
  const notebook = notebooks.value.find(nb => 
    getNotebookDocs(nb.id).some(d => d.id === doc.id)
  )
  if (notebook) {
    noteStore.currentNotebook = notebook
  }
  
  await noteStore.selectDoc(doc)
  closeSidebar()
}

const refreshContent = async () => {
  if (currentDoc.value) {
    await noteStore.selectDoc(currentDoc.value)
  }
}

const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.sy$/, '')
}

const formatTime = (timeStr: string): string => {
  return timeStr.split(',')[0] || timeStr
}

// 监听路由变化，在移动端关闭侧边栏
watch(() => currentDoc.value, () => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
})

// 生命周期
onMounted(() => {
  fetchNotebooks()
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
  --vp-sidebar-width: 300px;
}

/* 全局布局 */
.notes-layout {
  min-height: 100vh;
  background: var(--vp-c-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  overflow-y: auto;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-content {
  padding: 24px 0;
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

.sidebar-toggle {
  display: none;
}

.search-box {
  padding: 0 24px 16px;
}

/* 树形导航 */
.tree-nav {
  flex: 1;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sub-nav-list {
  margin-left: 20px;
  border-left: 1px solid var(--vp-c-gray-2);
  position: relative;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s;
  cursor: pointer;
  border-left: 2px solid transparent;
}

.nav-link:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.expand-icon {
  transition: transform 0.2s;
  color: var(--vp-c-text-3);
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.nav-number {
  color: var(--vp-c-text-3);
  font-weight: 500;
  min-width: 30px;
}

.nav-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 笔记本样式 */
.notebook-item .notebook-link {
  font-weight: 500;
  background: var(--vp-c-bg);
}

.notebook-item .notebook-link:hover {
  background: var(--vp-c-bg-elv);
}

/* 文档样式 */
.doc-item .doc-link {
  padding-left: 16px;
  font-size: 13px;
}

.doc-item.active .doc-link {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}

.empty-item .empty-link {
  padding-left: 16px;
  font-size: 13px;
  cursor: default;
}

.empty-text {
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* 主内容区域 */
.content {
  flex: 1;
  margin-left: var(--vp-sidebar-width);
  background: var(--vp-c-bg);
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 欢迎页面 */
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.hero-section {
  text-align: center;
  max-width: 640px;
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--vp-c-text-2);
  margin: 0 0 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 文章样式 */
.article {
  max-width: 768px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-gray-2);
}

.breadcrumb {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin-bottom: 16px;
}

.breadcrumb-item {
  color: var(--vp-c-text-3);
}

.breadcrumb-item.current {
  color: var(--vp-c-brand-1);
}

.breadcrumb-separator {
  margin: 0 8px;
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--vp-c-text-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文章内容 */
.article-content {
  font-size: 16px;
  line-height: 1.75;
  color: var(--vp-c-text-1);
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4),
.content-wrapper :deep(h5),
.content-wrapper :deep(h6) {
  margin: 32px 0 16px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.content-wrapper :deep(h1) {
  font-size: 28px;
  border-bottom: 1px solid var(--vp-c-gray-2);
  padding-bottom: 8px;
}

.content-wrapper :deep(h2) {
  font-size: 24px;
}

.content-wrapper :deep(h3) {
  font-size: 20px;
}

.content-wrapper :deep(p) {
  margin: 16px 0;
}

.content-wrapper :deep(ul),
.content-wrapper :deep(ol) {
  margin: 16px 0;
  padding-left: 28px;
}

.content-wrapper :deep(li) {
  margin: 8px 0;
}

.content-wrapper :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  background: var(--vp-c-bg-alt);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 0 4px 4px 0;
}

.content-wrapper :deep(pre) {
  margin: 20px 0;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Fira Code', Consolas, 'Monaco', monospace;
}

.content-wrapper :deep(code) {
  padding: 3px 6px;
  background: var(--vp-c-bg-alt);
  border-radius: 3px;
  font-family: 'Fira Code', Consolas, 'Monaco', monospace;
  font-size: 0.9em;
}

.content-wrapper :deep(pre code) {
  padding: 0;
  background: transparent;
}

.content-wrapper :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
}

.content-wrapper :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.content-wrapper :deep(th),
.content-wrapper :deep(td) {
  padding: 12px 16px;
  border: 1px solid var(--vp-c-gray-2);
  text-align: left;
}

.content-wrapper :deep(th) {
  background: var(--vp-c-bg-alt);
  font-weight: 600;
}

/* 文章导航 */
.article-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-gray-2);
}

.article-nav {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.nav-prev,
.nav-next {
  flex: 1;
}

.nav-next {
  text-align: right;
}

.article-nav .nav-link {
  display: block;
  padding: 16px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  cursor: pointer;
}

.article-nav .nav-link:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
}

.nav-direction {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}

.nav-title {
  display: block;
  font-weight: 500;
}

/* 状态页面 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-content {
  max-width: 600px;
  width: 100%;
}

.error-alert {
  max-width: 600px;
}

.empty-state {
  text-align: center;
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
  .content {
    margin-left: 0;
  }
  
  .sidebar {
    width: 280px;
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .sidebar-mask {
    display: block;
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
  .content-container {
    padding: 24px 16px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .article-title {
    font-size: 28px;
  }
  
  .article-nav {
    flex-direction: column;
  }
  
  .nav-next {
    text-align: left;
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