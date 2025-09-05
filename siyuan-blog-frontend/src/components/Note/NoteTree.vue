<template>
  <div class="note-tree">


    <!-- 笔记本列表 -->
    <div class="notebooks-section" v-if="!currentNotebook">
      <el-empty 
        v-if="!hasNotebooks && !loading" 
        description="暂无笔记本"
        :image-size="100"
      >
        <el-button @click="fetchNotebooks" type="primary">
          重新加载
        </el-button>
      </el-empty>
      
      <div v-else class="notebook-list">
        <div 
          v-for="notebook in filteredNotebooks" 
          :key="notebook.id"
          class="notebook-item"
          @click="selectNotebook(notebook)"
        >
          <el-icon class="notebook-icon">
            <component :is="notebook.icon || 'Folder'" />
          </el-icon>
          <el-tooltip 
            :content="notebook.name" 
            placement="right"
            :disabled="!isTextOverflow(notebook.name)"
            :show-after="500"
          >
            <span class="notebook-name">{{ notebook.name }}</span>
          </el-tooltip>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 文档树 -->
    <div class="docs-section" v-else>
      <!-- 返回按钮 -->
      <div class="docs-header">
        <el-button 
          @click="backToNotebooks"
          :icon="ArrowLeft"
          size="small"
          text
        >
          返回笔记本
        </el-button>
        <h4>{{ currentNotebook.name }}</h4>
      </div>

      <!-- 文档树 -->
      <el-tree
        ref="docTreeRef"
        :data="filteredTreeData"
        :props="treeProps"
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        :lazy="true"
        :load="loadSubDocs"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        class="doc-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <el-icon class="node-icon">
              <component :is="getNodeIcon(data)" />
            </el-icon>
            <el-tooltip 
              :content="removeFileExtension(node.label)" 
              placement="right"
              :disabled="!isTextOverflow(removeFileExtension(node.label))"
              :show-after="500"
            >
              <span class="node-label">{{ removeFileExtension(node.label) }}</span>
            </el-tooltip>
            <div class="node-info" v-if="data.subFileCount > 0">
              <el-tag size="small" type="info">{{ data.subFileCount }}</el-tag>
            </div>
          </div>
        </template>
      </el-tree>

      <el-empty 
        v-if="!hasDocs && !loading" 
        description="该笔记本暂无文档"
        :image-size="80"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      @close="clearError"
      closable
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import type { Doc, Notebook } from '@/api/types'
import {
  Folder,
  Document,
  ArrowRight,
  ArrowLeft,
  FolderOpened
} from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  searchText?: string
}>()

// Emits
const emit = defineEmits<{
  'doc-selected': [doc: Doc]
}>()

// 状态管理
const noteStore = useNoteStore()
const {
  notebooks,
  currentNotebook,
  docs,
  currentDoc,
  loading,
  error,
  hasNotebooks,
  hasDocs
} = storeToRefs(noteStore)

// 树组件引用
const docTreeRef = ref()

// 计算属性：过滤的笔记本
const filteredNotebooks = computed(() => {
  const searchText = props.searchText || ''
  if (!searchText) return notebooks.value
  return notebooks.value.filter(notebook => 
    notebook.name.toLowerCase().includes(searchText.toLowerCase())
  )
})

// 计算属性：过滤的树数据
const filteredTreeData = computed(() => {
  let data = docs.value.map(doc => ({
    ...doc,
    children: []
  }))
  
  const searchText = props.searchText || ''
  if (searchText) {
    data = data.filter(doc => 
      removeFileExtension(doc.name).toLowerCase().includes(searchText.toLowerCase())
    )
  }
  
  console.log('🌳 filteredTreeData 计算属性更新:')
  console.log('📋 原始docs数据:', docs.value)
  console.log('🔍 搜索文本:', searchText)
  console.log('🌲 转换后的树数据:', data)
  
  return data
})

// 树配置
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data: any) => {
    const isLeaf = data.subFileCount === 0
    console.log(`🍃 isLeaf 检查 - 文档: ${data.name}, subFileCount: ${data.subFileCount}, isLeaf: ${isLeaf}`)
    return isLeaf
  }
}

const fetchNotebooks = async () => {
  await noteStore.fetchNotebooks()
}

const selectNotebook = async (notebook: Notebook) => {
  console.log('📚 选择笔记本:', notebook)
  await noteStore.selectNotebook(notebook)
}

const backToNotebooks = () => {
  console.log('⬅️ 返回笔记本列表')
  noteStore.currentNotebook = null
  noteStore.currentDoc = null
  noteStore.currentNote = null
  noteStore.docs = []
}

// 懒加载子文档
const loadSubDocs = async (node: any, resolve: (data: any[]) => void) => {
  console.log('🌲 loadSubDocs 被调用')
  console.log('📁 node:', node)
  console.log('📄 node.data:', node.data)
  console.log('📊 subFileCount:', node.data?.subFileCount)
  
  try {
    if (!currentNotebook.value) {
      console.warn('❌ 没有当前笔记本')
      resolve([])
      return
    }

    console.log('📚 当前笔记本:', currentNotebook.value)
    console.log('🔍 开始获取子文档，父文档路径:', node.data.path)
    
    const subDocs = await noteStore.fetchSubDocs(node.data)
    
    console.log('📋 获取到的子文档原始数据:', subDocs)
    console.log('📈 子文档数量:', subDocs?.length || 0)
    
    // 转换数据格式，确保每个子文档也有children数组
    const formattedSubDocs = (subDocs || []).map(doc => ({
      ...doc,
      children: []
    }))
    
    console.log('✨ 格式化后的子文档:', formattedSubDocs)
    
    resolve(formattedSubDocs)
  } catch (error) {
    console.error('💥 加载子文档失败:', error)
    resolve([])
  }
}

const handleNodeClick = async (data: Doc) => {
  console.log('👆 用户点击节点:', data.name, 'subFileCount:', data.subFileCount)
  await noteStore.selectDoc(data)
  emit('doc-selected', data)
}

const handleNodeExpand = (data: any, node: any) => {
  console.log('📂 节点展开事件触发')
  console.log('📄 展开的数据:', data)
  console.log('🌲 展开的节点:', node)
}

const handleNodeCollapse = (data: any, node: any) => {
  console.log('📁 节点折叠事件触发')
  console.log('📄 折叠的数据:', data)
  console.log('🌲 折叠的节点:', node)
}

const getNodeIcon = (data: Doc) => {
  if (data.subFileCount > 0) {
    return 'FolderOpened'
  }
  return 'Document'
}

const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.sy$/, '')
}

const isTextOverflow = (text: string): boolean => {
  // 根据侧边栏宽度和字体大小估算，超过一定长度就显示tooltip
  // 中文字符按2个字符宽度计算，英文字符按1个字符计算
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  const estimatedWidth = chineseChars * 2 + otherChars
  
  // 大约20个字符宽度就会溢出
  return estimatedWidth > 20
}

const clearError = () => {
  noteStore.error = null
}

// 监听当前选中的文档，设置树的当前项
watch(currentDoc, (newDoc) => {
  if (newDoc && docTreeRef.value) {
    docTreeRef.value.setCurrentKey(newDoc.id)
  }
})

// 监听当前笔记本变化
watch(currentNotebook, (newNotebook) => {
  console.log('📚 当前笔记本变化:', newNotebook)
  if (newNotebook) {
    console.log('📋 当前文档列表:', docs.value)
  }
})

// 监听docs变化
watch(docs, (newDocs) => {
  console.log('📄 文档列表变化:', newDocs)
  newDocs.forEach(doc => {
    console.log(`  - ${doc.name} (subFileCount: ${doc.subFileCount})`)
  })
})

// 初始化
onMounted(() => {
  console.log('🚀 NoteTree 组件挂载完成')
  fetchNotebooks()
})
</script>

<style scoped>
/* 主题变量 - 与示例保持一致 */
.note-tree {
  height: 100%;
  overflow-y: hidden;
  background: transparent;
  position: relative;
  --dark-bg: #111827;
  --dark-card: #1f2937;
  --neon-accent: #3b82f6;
  --purple-accent: #8b5cf6;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

.notebooks-section,
.docs-section {
  padding: 16px;
}

.notebook-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notebook-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: transparent;
}

.notebook-item:hover {
  background: var(--dark-card);
}

.notebook-icon {
  color: var(--text-primary);
  font-size: 20px;
  flex-shrink: 0;
}

.notebook-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-size: 14px;
}

.arrow-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.docs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.docs-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.doc-tree {
  background: transparent;
  margin-top: 12px;
}

/* 覆盖Element Plus树组件样式 - 简洁风格 */
.doc-tree :deep(.el-tree-node) {
  margin-bottom: 2px;
}

.doc-tree :deep(.el-tree-node__content) {
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  background: transparent;
}

.doc-tree :deep(.el-tree-node__content:hover) {
  background: var(--dark-card);
}

.doc-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(59, 130, 246, 0.2);
  color: var(--neon-accent);
}

.doc-tree :deep(.el-tree-node__expand-icon) {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.doc-tree :deep(.el-tree-node__expand-icon.expanded) {
  transform: rotate(90deg);
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  gap: 8px;
}

.node-icon {
  color: var(--text-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.node-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.node-info {
  margin-left: 8px;
}

.node-info :deep(.el-tag) {
  background: var(--dark-card);
  border-color: var(--border-color);
  color: var(--text-secondary);
  font-size: 11px;
  height: 20px;
  line-height: 18px;
}

.loading-container {
  padding: 20px;
}

.loading-container :deep(.el-skeleton__item) {
  background: var(--dark-card);
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

/* 错误提示样式 */
:deep(.el-alert) {
  background: var(--dark-card);
  border-color: #f56565;
  border-radius: 8px;
}

:deep(.el-alert__title) {
  color: #f56565;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-button--primary) {
  background: var(--neon-accent);
  border-color: var(--neon-accent);
}

:deep(.el-button--primary:hover) {
  background: #4f90ff;
  border-color: #4f90ff;
}

:deep(.el-button--text) {
  color: var(--text-secondary);
}

:deep(.el-button--text:hover) {
  color: var(--neon-accent);
  background: var(--dark-card);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notebooks-section,
  .docs-section {
    padding: 12px;
  }
  
  .notebook-item {
    padding: 14px;
  }
  
  .notebook-name {
    font-size: 14px;
  }
}

/* 焦点可访问性 */
.notebook-item:focus-visible {
  outline: 2px solid var(--neon-accent);
  outline-offset: 2px;
}

.doc-tree :deep(.el-tree-node__content:focus-visible) {
  outline: 2px solid var(--neon-accent);
  outline-offset: 2px;
}
</style> 