<template>
  <div class="note-content">
    <!-- 内容头部 -->
    <div class="content-header" v-if="currentDoc">
      <div class="doc-info">
        <h2 class="doc-title">{{ currentDoc.name }}</h2>
        <div class="doc-meta">
          <el-tag size="small" type="info">
            {{ currentDoc.hMtime }}
          </el-tag>
          <el-tag v-if="currentDoc.subFileCount > 0" size="small">
            {{ currentDoc.subFileCount }} 个子文档
          </el-tag>
        </div>
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
    </div>

    <!-- 内容区域 -->
    <div class="content-body">
      <!-- 欢迎页面 -->
      <div v-if="!currentDoc" class="welcome-section">
        <el-result
          icon="info"
          title="欢迎使用笔记浏览器"
          sub-title="请从左侧选择笔记本和文档来查看内容"
        >
          <template #extra>
            <el-icon size="64" color="var(--el-color-primary)">
              <Document />
            </el-icon>
          </template>
        </el-result>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-section">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-section">
        <el-alert
          :title="error"
          type="error"
          show-icon
        >
          <template #default>
            <p>加载文档内容时出现错误，请稍后重试。</p>
            <el-button @click="refreshContent" type="primary" size="small">
              重新加载
            </el-button>
          </template>
        </el-alert>
      </div>

      <!-- 文档内容 -->
      <div v-else-if="currentNote" class="document-content">
        <!-- 渲染HTML内容 -->
        <div 
          class="html-content"
          v-html="sanitizedContent"
        ></div>

        <!-- 如果有子文档，显示子文档列表 -->
        <div v-if="currentDoc.subFileCount > 0" class="sub-docs-section">
          <el-divider content-position="left">
            <span>子文档</span>
          </el-divider>
          <el-empty 
            description="暂无子文档数据"
            :image-size="60"
          />
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import { Document, Refresh } from '@element-plus/icons-vue'
// 移除DOMPurify依赖，暂时不使用

// 状态管理
const noteStore = useNoteStore()
const {
  currentDoc,
  currentNote,
  loading,
  error
} = storeToRefs(noteStore)

// 清理HTML内容（暂时直接返回内容，后续可添加DOMPurify）
const sanitizedContent = computed(() => {
  if (!currentNote.value?.content) return ''
  
  // TODO: 后续可以添加DOMPurify来清理HTML内容，防止XSS攻击
  return currentNote.value.content
})

// 方法
const refreshContent = async () => {
  if (currentDoc.value) {
    await noteStore.selectDoc(currentDoc.value)
  }
}
</script>

<style scoped>
.note-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
}

.doc-info {
  flex: 1;
}

.doc-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}

.doc-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.content-actions {
  margin-left: 16px;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-section,
.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.document-content {
  max-width: 800px;
  margin: 0 auto;
}

/* HTML内容样式 */
.html-content {
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.html-content :deep(h1),
.html-content :deep(h2),
.html-content :deep(h3),
.html-content :deep(h4),
.html-content :deep(h5),
.html-content :deep(h6) {
  margin: 24px 0 16px 0;
  font-weight: 600;
  line-height: 1.3;
}

.html-content :deep(h1) { font-size: 28px; }
.html-content :deep(h2) { font-size: 24px; }
.html-content :deep(h3) { font-size: 20px; }
.html-content :deep(h4) { font-size: 18px; }
.html-content :deep(h5) { font-size: 16px; }
.html-content :deep(h6) { font-size: 14px; }

.html-content :deep(p) {
  margin: 12px 0;
}

.html-content :deep(ul),
.html-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.html-content :deep(li) {
  margin: 4px 0;
}

.html-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--el-color-primary);
  background: var(--el-fill-color-light);
  border-radius: 0 4px 4px 0;
}

.html-content :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: var(--el-fill-color);
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.html-content :deep(code) {
  padding: 2px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
  margin: 12px 0;
}

.html-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.html-content :deep(a:hover) {
  text-decoration: underline;
}

.html-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.html-content :deep(th),
.html-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  text-align: left;
}

.html-content :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.sub-docs-section {
  margin-top: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-header {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .content-actions {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .content-body {
    padding: 16px;
  }
  
  .doc-title {
    font-size: 20px;
  }
  
  .html-content :deep(h1) { font-size: 24px; }
  .html-content :deep(h2) { font-size: 20px; }
  .html-content :deep(h3) { font-size: 18px; }
}
</style> 