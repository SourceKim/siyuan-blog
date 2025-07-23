<template>
  <div class="note-tree">
    <!-- 头部：笔记本选择 -->
    <div class="tree-header">
      <h3>笔记本</h3>
      <el-button 
        @click="fetchNotebooks" 
        :loading="loading"
        :icon="Refresh"
        size="small"
        circle
      />
    </div>

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
          v-for="notebook in notebooks" 
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
        :data="treeData"
        :props="treeProps"
        node-key="id"
        :highlight-current="true"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        class="doc-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <el-icon class="node-icon">
              <component :is="getNodeIcon(data)" />
            </el-icon>
            <span class="node-label">{{ node.label }}</span>
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
  Refresh,
  FolderOpened
} from '@element-plus/icons-vue'

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

// 树配置
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data: any) => data.subFileCount === 0
}

// 转换文档为树形数据
const treeData = computed(() => {
  return docs.value.map(doc => ({
    ...doc,
    children: []
  }))
})

// 方法
const fetchNotebooks = async () => {
  await noteStore.fetchNotebooks()
}

const selectNotebook = async (notebook: Notebook) => {
  await noteStore.selectNotebook(notebook)
}

const backToNotebooks = () => {
  noteStore.currentNotebook = null
  noteStore.currentDoc = null
  noteStore.currentNote = null
  noteStore.docs = []
}

const handleNodeClick = async (data: Doc) => {
  await noteStore.selectDoc(data)
}

const getNodeIcon = (data: Doc) => {
  if (data.subFileCount > 0) {
    return 'FolderOpened'
  }
  return 'Document'
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

// 初始化
onMounted(() => {
  fetchNotebooks()
})
</script>

<style scoped>
.note-tree {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
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
  border: 1px solid var(--el-border-color-lighter);
}

.notebook-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
}

.notebook-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.notebook-name {
  flex: 1;
  font-weight: 500;
}

.arrow-icon {
  color: var(--el-text-color-secondary);
}

.docs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.docs-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
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
  color: var(--el-color-primary);
}

.node-label {
  flex: 1;
  font-size: 14px;
}

.node-info {
  margin-left: 8px;
}

.loading-container {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tree-header {
    padding: 12px;
  }
  
  .notebooks-section,
  .docs-section {
    padding: 8px;
  }
}
</style> 