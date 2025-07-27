<template>
  <div class="note-outline">
    <!-- 标题 -->
    <div class="outline-header">
      <h3 class="outline-title">
        <el-icon><Menu /></el-icon>
        目录
      </h3>
      <el-button 
        @click="refreshOutline" 
        :loading="loading"
        :icon="Refresh"
        size="small"
        circle
        text
      />
    </div>

    <!-- 大纲内容 -->
    <div class="outline-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="4" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-section">
        <el-alert
          :title="error"
          type="error"
          size="small"
          :closable="false"
        />
      </div>

      <!-- 大纲树 -->
      <div v-else-if="outlineItems.length > 0" class="outline-tree">
        <OutlineNode 
          v-for="item in outlineItems" 
          :key="item.id"
          :item="item"
          :active-id="activeId"
          @node-click="handleNodeClick"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-section">
        <el-empty 
          description="该文档暂无目录"
          :image-size="60"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { noteApi } from '@/api/note'
import type { OutlineItem } from '@/api/types'
import { Menu, Refresh } from '@element-plus/icons-vue'
import OutlineNode from './OutlineNode.vue'

// Props
const props = defineProps<{
  docId?: string
}>()

// 响应式状态
const outlineItems = ref<OutlineItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const activeId = ref<string>('')

// 防止重复请求的状态
const currentRequestId = ref<string>('')
const fetchTimeoutId = ref<number>()

// 方法
const fetchOutline = async (docId?: string) => {
  const targetDocId = docId || props.docId
  
  if (!targetDocId) {
    outlineItems.value = []
    currentRequestId.value = ''
    return
  }

  // 防止重复请求同一个文档
  if (currentRequestId.value === targetDocId) {
    console.log('🔄 跳过重复的大纲请求:', targetDocId)
    return
  }

  try {
    loading.value = true
    error.value = null
    currentRequestId.value = targetDocId
    
    console.log('🎯 开始获取文档大纲:', targetDocId)
    
    const result = await noteApi.getDocOutline({
      id: targetDocId,
      preview: false
    })
    
    // 检查请求是否已过期（用户可能已经切换到其他文档）
    if (currentRequestId.value !== targetDocId) {
      console.log('⚠️ 大纲请求已过期，忽略结果:', targetDocId)
      return
    }
    
    console.log('✅ 文档大纲获取成功:', result?.length || 0, '项')
    outlineItems.value = result || []
    
    // 获取大纲后，设置滚动监听
    await nextTick()
    setupScrollSpy()
    
  } catch (err) {
    // 只有当前请求才显示错误
    if (currentRequestId.value === targetDocId) {
      error.value = err instanceof Error ? err.message : '获取文档大纲失败'
      console.error('❌ 获取文档大纲失败:', err)
    }
  } finally {
    // 只有当前请求才更新loading状态
    if (currentRequestId.value === targetDocId) {
      loading.value = false
    }
  }
}

// 防抖版本的 fetchOutline
const debouncedFetchOutline = (docId?: string) => {
  // 清除之前的定时器
  if (fetchTimeoutId.value) {
    clearTimeout(fetchTimeoutId.value)
  }
  
  // 设置新的定时器
  fetchTimeoutId.value = setTimeout(() => {
    fetchOutline(docId)
  }, 150) // 150ms 防抖
}

const refreshOutline = async () => {
  // 强制刷新，清除防重复机制
  currentRequestId.value = ''
  await fetchOutline()
}

const handleNodeClick = (item: OutlineItem | { id: string }) => {
  console.log('点击大纲节点:', item)
  
  // 尝试滚动到对应的元素
  const element = document.getElementById(item.id)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
    activeId.value = item.id
  } else {
    console.warn('未找到对应的元素:', item.id)
  }
}

// 设置滚动监听，高亮当前可见的标题
const setupScrollSpy = () => {
  // 获取所有标题元素的ID
  const headingIds = getAllHeadingIds()
  
  if (headingIds.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0
    }
  )

  headingIds.forEach(id => {
    const element = document.getElementById(id)
    if (element) {
      observer.observe(element)
    }
  })
}

// 获取所有标题ID
const getAllHeadingIds = (): string[] => {
  const ids: string[] = []
  
  const collectIds = (items: OutlineItem[]) => {
    items.forEach(item => {
      ids.push(item.id)
      if (item.blocks) {
        item.blocks.forEach(block => {
          ids.push(block.id)
          if (block.children) {
            const childIds = extractBlockIds(block.children)
            ids.push(...childIds)
          }
        })
      }
    })
  }
  
  const extractBlockIds = (blocks: any[]): string[] => {
    const blockIds: string[] = []
    blocks.forEach(block => {
      blockIds.push(block.id)
      if (block.children) {
        blockIds.push(...extractBlockIds(block.children))
      }
    })
    return blockIds
  }
  
  collectIds(outlineItems.value)
  return ids
}

// 监听文档ID变化
watch(() => props.docId, (newDocId, oldDocId) => {
  console.log('📋 大纲组件检测到文档ID变化:', oldDocId, '->', newDocId)
  
  // 清除之前的请求状态
  if (newDocId !== oldDocId) {
    currentRequestId.value = ''
  }
  
  debouncedFetchOutline(newDocId)
}, { immediate: true })

// 组件挂载
onMounted(() => {
  console.log('🚀 大纲组件挂载完成')
  debouncedFetchOutline()
})

// 组件卸载
onUnmounted(() => {
  console.log('🔚 大纲组件卸载，清理定时器')
  if (fetchTimeoutId.value) {
    clearTimeout(fetchTimeoutId.value)
  }
  currentRequestId.value = ''
})
</script>

<style scoped>
.note-outline {
  height: 100%;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  overflow: hidden;
}

.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-gray-2);
  background: var(--vp-c-bg);
}

.outline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.outline-content {
  height: calc(100% - 65px);
  overflow-y: auto;
  padding: 12px;
}

.loading-section,
.error-section,
.empty-section {
  padding: 16px;
}

.outline-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 滚动条样式 */
.outline-content::-webkit-scrollbar {
  width: 4px;
}

.outline-content::-webkit-scrollbar-track {
  background: transparent;
}

.outline-content::-webkit-scrollbar-thumb {
  background: var(--vp-c-gray-3);
  border-radius: 2px;
}

.outline-content::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-brand-1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .outline-header {
    padding: 12px;
  }
  
  .outline-content {
    padding: 8px;
    height: calc(100% - 57px);
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .note-outline {
    background: var(--vp-c-bg-elv);
  }
  
  .outline-header {
    background: var(--vp-c-bg-alt);
    border-bottom-color: var(--vp-c-gray-3);
  }
}
</style> 