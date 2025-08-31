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
      <div v-else class="document-layout">
        <!-- 左侧：文档内容 -->
        <article class="article">
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
              <el-tooltip content="显示/隐藏目录">
                <el-button 
                  @click="toggleOutline"
                  :type="showOutline ? 'primary' : 'default'"
                  :icon="Menu"
                  circle
                />
              </el-tooltip>
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

        <!-- 右侧：大纲 -->
        <aside 
          class="outline-sidebar" 
          :class="{ 'outline-visible': showOutline }"
          v-if="currentDoc"
        >
          <NoteOutline :doc-id="currentDoc.id" />
        </aside>
      </div>
    </div>

    <!-- 大纲遮罩层（移动端） -->
    <div 
      v-if="showOutline && isMobile" 
      class="outline-mask"
      @click="hideOutline"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import type { Doc } from '@/api/types'
import NoteOutline from './NoteOutline.vue'
import { 
  Document, 
  Refresh, 
  House, 
  Clock, 
  FolderOpened,
  Menu
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

// 响应式状态
const showOutline = ref(false)
const isMobile = ref(false)

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

const toggleOutline = () => {
  showOutline.value = !showOutline.value
}

const hideOutline = () => {
  showOutline.value = false
}

const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.sy$/, '')
}

const formatTime = (timeStr: string): string => {
  return timeStr.split(',')[0] || timeStr
}

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showOutline.value = true // 桌面端默认显示大纲
  }
}

// 监听窗口尺寸变化
const handleResize = () => {
  checkMobile()
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 主题变量 - 与示例保持一致 */
.note-content {
  height: 100%;
  background: var(--dark-bg);
  --dark-bg: #111827;
  --dark-card: #1f2937;
  --neon-accent: #3b82f6;
  --purple-accent: #8b5cf6;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

.content-container {
  height: 100vh;
  overflow: hidden;
}

/* 欢迎页面 */
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
  position: relative;
}

.welcome-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  z-index: 0;
}

.hero-section {
  text-align: center;
  max-width: 640px;
  position: relative;
  z-index: 1;
}

.hero-icon {
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--neon-accent), var(--purple-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0 0 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 文档布局 */
.document-layout {
  display: flex;
  height: 100vh;
  position: relative;
}

/* 文章样式 */
.article {
  flex: 1;
  overflow-y: auto;
  padding: 40px 32px;
  max-width: calc(100% - 300px);
  margin: 0 auto;
  position: relative;
}

.article-header {
  position: relative;
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 12px;
  background: var(--dark-card);
  border: 1px solid var(--border-color);
}

.content-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 8px;
}

.breadcrumb {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--dark-bg);
  font-weight: 500;
}

.breadcrumb-item.current {
  color: var(--neon-accent);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--border-color);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.article-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.1;
  padding-right: 120px;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--dark-bg);
  border: 1px solid var(--border-color);
  font-weight: 500;
}

/* 内容区域 */
.content-body {
  margin-bottom: 32px;
  border-radius: 12px;
  background: var(--dark-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
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
  color: var(--text-primary);
  padding: 32px;
}

/* HTML内容样式 */
.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3),
.html-content :deep(h4),
.html-content :deep(h5),
.html-content :deep(h6) {
  margin: 40px 0 20px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
  position: relative;
}

.html-content :deep(h1) { 
  font-size: 32px; 
  border-bottom: 2px solid var(--accent-primary);
  padding-bottom: 12px;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.html-content :deep(h2) { 
  font-size: 26px;
  color: var(--accent-primary);
}
.html-content :deep(h3) { 
  font-size: 22px;
  color: var(--accent-secondary);
}
.html-content :deep(h4) { font-size: 20px; }
.html-content :deep(h5) { font-size: 18px; }
.html-content :deep(h6) { font-size: 16px; }

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
  margin: 24px 0;
  padding: 20px 24px;
  background: var(--bg-tertiary);
  border-left: 4px solid var(--accent-primary);
  border-radius: 0 12px 12px 0;
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;
}

.html-content :deep(blockquote::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-tertiary));
}

.html-content :deep(pre) {
  margin: 24px 0;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow-x: auto;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, 'Monaco', monospace;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-secondary);
}

.html-content :deep(code) {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, 'Monaco', monospace;
  font-size: 0.85em;
  border: 1px solid var(--border-primary);
  color: var(--accent-primary);
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
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.html-content :deep(a:hover) {
  color: var(--accent-secondary);
  border-bottom-color: var(--accent-secondary);
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
  margin-top: 64px;
  padding: 32px;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-secondary);
}

.article-nav {
  display: flex;
  justify-content: space-between;
  gap: 24px;
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
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid var(--border-primary);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  color: var(--accent-primary);
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-secondary);
}

.nav-direction {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.nav-title {
  display: block;
  font-weight: 600;
  font-size: 16px;
  position: relative;
  z-index: 1;
}

/* 大纲侧边栏 */
.outline-sidebar {
  width: 320px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-primary);
  position: fixed;
  top: 0;
  right: -320px;
  height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-primary);
}

.outline-sidebar.outline-visible {
  right: 0;
}

/* 大纲遮罩 */
.outline-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 99;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .outline-sidebar {
    position: static;
    right: auto;
  }
  
  .outline-sidebar.outline-visible {
    right: auto;
  }
  
  .article {
    max-width: calc(100% - 300px);
  }
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 24px 16px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .article {
    padding: 24px 16px;
    max-width: 100%;
  }
  
  .article-title {
    font-size: 28px;
    padding-right: 0;
  }
  
  .content-actions {
    position: static;
    margin-top: 16px;
    text-align: left;
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
  
  .outline-sidebar {
    width: 280px;
    right: -280px;
  }
}

/* 按钮样式增强 */
:deep(.el-button) {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-primary);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  border-color: var(--accent-primary);
  color: white;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
  box-shadow: var(--neon-glow);
  transform: translateY(-2px);
}

:deep(.el-button--default) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

:deep(.el-button--default:hover) {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-1px);
}

/* 骨架屏样式 */
:deep(.el-skeleton__item) {
  background: var(--bg-tertiary);
  border-radius: 8px;
}

/* 空状态样式 */
:deep(.el-empty) {
  color: var(--text-secondary);
}

:deep(.el-empty__image svg) {
  fill: var(--text-muted);
}

:deep(.el-empty__description) {
  color: var(--text-secondary);
}

/* 工具提示样式 */
:deep(.el-tooltip__popper) {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 8px !important;
  box-shadow: var(--shadow-secondary) !important;
}

:deep(.el-tooltip__popper .el-popper__arrow::before) {
  background: var(--bg-tertiary) !important;
  border: 1px solid var(--border-primary) !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-primary);
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-header,
.content-body,
.article-footer {
  animation: fadeInUp 0.6s ease-out;
}

.article-header {
  animation-delay: 0.1s;
}

.content-body {
  animation-delay: 0.2s;
}

.article-footer {
  animation-delay: 0.3s;
}

/* 焦点可访问性 */
.nav-link:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

:deep(.el-button:focus-visible) {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
</style> 