<template>
  <div class="note-tree">
    <!-- 直接展示文档树，跳过笔记本选择 -->
    <div class="docs-section">
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
        v-if="!hasBlogDocumentTree && !props.loading" 
        description="暂无文档"
        :image-size="80"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="props.loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useNoteStore } from '@/stores/note'
import { noteApi } from '@/api/note'
import { storeToRefs } from 'pinia'
import type { Doc } from '@/api/types'
import {
  Document,
  Folder,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'

// Props
interface Props {
  searchText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchText: '',
  loading: false
})

// Emits
interface Emits {
  (e: 'doc-selected', doc: Doc): void
}

const emit = defineEmits<Emits>()

// Store
const noteStore = useNoteStore()
const {
  blogDocumentTree,
  currentDoc,
  hasBlogDocumentTree
} = storeToRefs(noteStore)

// Refs
const docTreeRef = ref<InstanceType<typeof ElTree>>()

// Tree配置
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data: Doc) => data.subFileCount === 0
}

// 过滤后的树数据
const filteredTreeData = computed(() => {
  if (!props.searchText.trim()) {
    return blogDocumentTree.value
  }
  
  const searchLower = props.searchText.toLowerCase()
  return filterTreeData(blogDocumentTree.value, searchLower)
})

// 递归过滤树数据
const filterTreeData = (data: Doc[], searchText: string): Doc[] => {
  return data.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchText)
    const hasChildMatch = item.children && filterTreeData(item.children, searchText).length > 0
    
    if (nameMatch || hasChildMatch) {
      return {
        ...item,
        children: item.children ? filterTreeData(item.children, searchText) : undefined
      }
    }
    return false
  })
}

// 懒加载子文档
const loadSubDocs = async (node: any, resolve: (data: Doc[]) => void) => {
  if (node.level === 0) {
    // 根节点，返回博客文档树
    resolve(blogDocumentTree.value)
    return
  }
  
  try {
    if (node.data && node.data.subFileCount > 0) {
      console.log('🌳 懒加载子文档:', node.data.name, '路径:', node.data.path)
      
      // 直接调用 API 获取子文档，不传 notebook 参数（后端会自动使用博客笔记本）
      const subDocs = await noteApi.getDocs({
        path: node.data.path
      })
      
      console.log('📁 获取到子文档:', subDocs.length, '个')
      resolve(subDocs)
    } else {
      resolve([])
    }
  } catch (error) {
    console.error('加载子文档失败:', error)
    resolve([])
  }
}

// 节点点击事件
const handleNodeClick = (data: Doc, node: any) => {
  if (data.subFileCount === 0) {
    // 这是一个文档，选择它
    noteStore.selectDoc(data)
    emit('doc-selected', data)
  }
}

// 节点展开事件
const handleNodeExpand = (data: Doc, node: any) => {
  console.log('节点展开:', data.name)
}

// 节点折叠事件
const handleNodeCollapse = (data: Doc, node: any) => {
  console.log('节点折叠:', data.name)
}

// 获取节点图标
const getNodeIcon = (data: Doc) => {
  if (data.subFileCount > 0) {
    return 'Folder'
  }
  return 'Document'
}

// 移除文件扩展名
const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.sy$/, '')
}

// 检查文本是否溢出
const isTextOverflow = (text: string): boolean => {
  return text.length > 20
}

// 监听当前文档变化，高亮对应节点
watch(currentDoc, (newDoc) => {
  if (newDoc && docTreeRef.value) {
    nextTick(() => {
      docTreeRef.value?.setCurrentKey(newDoc.id)
    })
  }
}, { immediate: true })

// 监听搜索文本变化
watch(() => props.searchText, () => {
  // 搜索时展开所有节点
  if (props.searchText.trim() && docTreeRef.value) {
    nextTick(() => {
      // 展开所有匹配的节点
      const expandAll = (data: Doc[]) => {
        data.forEach(item => {
          if (item.name.toLowerCase().includes(props.searchText.toLowerCase())) {
            docTreeRef.value?.getNode(item.id)?.expand()
          }
          if (item.children) {
            expandAll(item.children)
          }
        })
      }
      expandAll(filteredTreeData.value)
    })
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

.note-tree {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.docs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}



.doc-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  background: transparent;
}

/* 树节点样式 */
.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  width: 100%;
  min-height: 32px;
}

.node-icon {
  font-size: 16px;
  color: var(--tech-primary);
  flex-shrink: 0;
}

.node-label {
  font-size: 14px;
  color: var(--tech-text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 1.4;
}

.node-info {
  margin-left: auto;
  flex-shrink: 0;
}

/* Element Plus Tree 自定义样式 */
:deep(.el-tree) {
  background: transparent;
  color: var(--tech-text-light);
}

:deep(.el-tree-node) {
  position: relative;
}

:deep(.el-tree-node__content) {
  background: transparent;
  border-radius: 6px;
  margin: 2px 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-height: 40px;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(0, 191, 255, 0.1);
  border-color: var(--tech-primary);
  transform: translateX(4px);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--tech-gradient);
  color: white;
  box-shadow: var(--tech-glow);
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-icon) {
  color: white;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-label) {
  color: white;
  font-weight: 500;
}

:deep(.el-tree-node__expand-icon) {
  color: var(--tech-primary);
  font-size: 14px;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
}

:deep(.el-tree-node__loading-icon) {
  color: var(--tech-primary);
}

/* 加载状态 */
.loading-container {
  padding: 24px;
}

:deep(.el-skeleton__item) {
  background: var(--tech-dark-card);
}

/* 空状态样式 */
:deep(.el-empty) {
  padding: 40px 20px;
}

:deep(.el-empty__description p) {
  color: var(--tech-text-muted);
}

/* 标签样式 */
:deep(.el-tag) {
  background: rgba(0, 191, 255, 0.1);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  font-size: 11px;
}

/* 自定义滚动条 */
.doc-tree::-webkit-scrollbar {
  width: 6px;
}

.doc-tree::-webkit-scrollbar-track {
  background: transparent;
}

.doc-tree::-webkit-scrollbar-thumb {
  background: var(--tech-primary);
  border-radius: 3px;
}

.doc-tree::-webkit-scrollbar-thumb:hover {
  background: var(--tech-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  
  .tree-node {
    min-height: 28px;
  }
  
  .node-label {
    font-size: 13px;
  }
  
  :deep(.el-tree-node__content) {
    margin: 1px 4px;
    padding: 6px 8px;
    min-height: 36px;
  }
}
</style>