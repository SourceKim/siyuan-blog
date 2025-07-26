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
          <span class="notebook-name">{{ notebook.name }}</span>
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
            <span class="node-label">{{ removeFileExtension(node.label) }}</span>
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

// 方法
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
.note-tree {
  height: 100%;
  overflow-y: auto;
  background: transparent;
}

.notebooks-section,
.docs-section {
  padding: 12px;
}

.notebook-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notebook-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--vp-c-gray-2);
  background: var(--vp-c-bg);
}

.notebook-item:hover {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-brand-1);
}

.notebook-icon {
  margin-right: 8px;
  color: var(--vp-c-brand-1);
}

.notebook-name {
  flex: 1;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.arrow-icon {
  color: var(--vp-c-text-3);
}

.docs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-gray-2);
}

.docs-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.doc-tree {
  background: transparent;
  margin-top: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.node-icon {
  margin-right: 8px;
  color: var(--vp-c-brand-1);
}

.node-label {
  flex: 1;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.node-info {
  margin-left: 8px;
}

.loading-container {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notebooks-section,
  .docs-section {
    padding: 8px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .notebook-item {
    background: var(--vp-c-bg-elv);
    border-color: var(--vp-c-gray-3);
  }
  
  .notebook-item:hover {
    background: var(--vp-c-bg-alt);
    border-color: var(--vp-c-brand-2);
  }
}
</style> 