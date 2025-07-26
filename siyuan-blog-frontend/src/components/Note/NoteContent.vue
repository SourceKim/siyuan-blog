<template>
  <div class="note-content">
    <div class="content-container">
      <!-- 欢迎页面 -->
      <div v-if="!currentDoc" class="welcome-page">
        <div class="hero-section">
          <div class="hero-icon">
            <el-icon size="80" color="var(--vp-c-brand-1)">
              <Document />
            </el-icon>
          </div>
          <h1 class="hero-title">笔记浏览器</h1>
          <p class="hero-subtitle">浏览和阅读你的思源笔记</p>
          <div class="hero-actions">
            <el-button @click="goHome" type="primary" :icon="House" size="large">
              返回首页
            </el-button>
          </div>
        </div>
      </div>

      <!-- 文档内容 -->
      <article v-else class="article">
        <!-- 文档头部 -->
        <header class="article-header" v-if="currentDoc">
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ currentNotebook?.name || '笔记本' }}</span>
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
          
          <div class="content-actions">
            <el-tooltip content="刷新内容">
              <el-button 
                @click="refreshContent"
                :loading="loading"
                :icon="Refresh"
                circle
              />
            </el-tooltip>
          </div>
        </header>

        <!-- 内容区域 -->
        <div class="content-body">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-section">
            <div class="loading-content">
              <el-skeleton :rows="6" animated />
            </div>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="error" class="error-section">
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

          <!-- 文档内容 -->
          <div v-else-if="currentNote" class="document-content">
            <!-- 渲染HTML内容 -->
            <div 
              class="html-content"
              v-html="sanitizedContent"
            ></div>
          </div>

          <!-- 空内容 -->
          <div v-else class="empty-section">
            <el-empty 
              description="该文档暂无内容"
              :image-size="100"
            >
              <el-button @click="refreshContent" type="primary">
                重新加载
              </el-button>
            </el-empty>
          </div>
        </div>

        <!-- 文档底部导航 -->
        <footer class="article-footer" v-if="currentNote">
          <div class="article-nav">
            <div class="nav-prev">
              <div v-if="prevDoc" @click="selectDoc(prevDoc)" class="nav-link">
                <span class="nav-direction">← 上一篇</span>
                <span class="nav-title">{{ removeFileExtension(prevDoc.name) }}</span>
              </div>
            </div>
            <div class="nav-next">
              <div v-if="nextDoc" @click="selectDoc(nextDoc)" class="nav-link">
                <span class="nav-direction">下一篇 →</span>
                <span class="nav-title">{{ removeFileExtension(nextDoc.name) }}</span>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import type { Doc } from '@/api/types'
import { 
  Document, 
  Refresh, 
  House, 
  Clock, 
  FolderOpened 
} from '@element-plus/icons-vue'

// Router
const router = useRouter()

// 状态管理
const noteStore = useNoteStore()
const {
  currentNotebook,
  currentDoc,
  currentNote,
  docs,
  loading,
  error
} = storeToRefs(noteStore)

// 清理HTML内容（暂时直接返回内容，后续可添加DOMPurify）
const sanitizedContent = computed(() => {
  if (!currentNote.value?.content) return ''
  
  // TODO: 后续可以添加DOMPurify来清理HTML内容，防止XSS攻击
  return currentNote.value.content
})

// 计算上一篇和下一篇文档
const prevDoc = computed(() => {
  if (!currentDoc.value || !docs.value.length) return null
  const currentIndex = docs.value.findIndex(doc => doc.id === currentDoc.value?.id)
  return currentIndex > 0 ? docs.value[currentIndex - 1] : null
})

const nextDoc = computed(() => {
  if (!currentDoc.value || !docs.value.length) return null
  const currentIndex = docs.value.findIndex(doc => doc.id === currentDoc.value?.id)
  return currentIndex < docs.value.length - 1 ? docs.value[currentIndex + 1] : null
})

// 方法
const refreshContent = async () => {
  if (currentDoc.value) {
    await noteStore.selectDoc(currentDoc.value)
  }
}

const selectDoc = async (doc: Doc) => {
  await noteStore.selectDoc(doc)
}

const goHome = () => {
  router.push('/')
}

const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.sy$/, '')
}

const formatTime = (timeStr: string): string => {
  return timeStr.split(',')[0] || timeStr
}
</script>

<style scoped>
.note-content {
  height: 100%;
  background: var(--vp-c-bg);
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
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

.hero-icon {
  margin-bottom: 24px;
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
  position: relative;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-gray-2);
}

.content-actions {
  position: absolute;
  top: 0;
  right: 0;
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
  padding-right: 60px; /* 为右侧按钮留空间 */
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

/* 内容区域 */
.content-body {
  margin-bottom: 48px;
}

.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-content {
  max-width: 600px;
  width: 100%;
}

.error-alert {
  max-width: 600px;
}

.document-content {
  line-height: 1.8;
  color: var(--vp-c-text-1);
}

/* HTML内容样式 */
.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3),
.html-content :deep(h4),
.html-content :deep(h5),
.html-content :deep(h6) {
  margin: 32px 0 16px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.html-content :deep(h1) { 
  font-size: 28px; 
  border-bottom: 1px solid var(--vp-c-gray-2);
  padding-bottom: 8px;
}
.html-content :deep(h2) { font-size: 24px; }
.html-content :deep(h3) { font-size: 20px; }
.html-content :deep(h4) { font-size: 18px; }
.html-content :deep(h5) { font-size: 16px; }
.html-content :deep(h6) { font-size: 14px; }

.html-content :deep(p) {
  margin: 16px 0;
}

.html-content :deep(ul),
.html-content :deep(ol) {
  margin: 16px 0;
  padding-left: 28px;
}

.html-content :deep(li) {
  margin: 8px 0;
}

.html-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  background: var(--vp-c-bg-alt);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 0 4px 4px 0;
}

.html-content :deep(pre) {
  margin: 20px 0;
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Fira Code', Consolas, 'Monaco', monospace;
}

.html-content :deep(code) {
  padding: 3px 6px;
  background: var(--vp-c-bg-alt);
  border-radius: 3px;
  font-family: 'Fira Code', Consolas, 'Monaco', monospace;
  font-size: 0.9em;
}

.html-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.html-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
}

.html-content :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.html-content :deep(a:hover) {
  text-decoration: underline;
}

.html-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.html-content :deep(th),
.html-content :deep(td) {
  padding: 12px 16px;
  border: 1px solid var(--vp-c-gray-2);
  text-align: left;
}

.html-content :deep(th) {
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

.nav-link {
  display: block;
  padding: 16px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  cursor: pointer;
}

.nav-link:hover {
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

/* 响应式设计 */
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
    padding-right: 0;
  }
  
  .content-actions {
    position: static;
    margin-top: 16px;
    text-align: right;
  }
  
  .article-nav {
    flex-direction: column;
  }
  
  .nav-next {
    text-align: left;
  }
  
  .html-content :deep(h1) { font-size: 24px; }
  .html-content :deep(h2) { font-size: 20px; }
  .html-content :deep(h3) { font-size: 18px; }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .nav-link {
    background: var(--vp-c-bg-elv);
  }
  
  .nav-link:hover {
    background: var(--vp-c-bg-alt);
  }
}
</style> 