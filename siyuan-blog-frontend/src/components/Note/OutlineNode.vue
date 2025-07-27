<template>
  <div class="outline-node">
    <!-- 主节点 -->
    <div 
      class="node-item"
      :class="[
        `level-${item.depth}`,
        `heading-${item.subType}`,
        { 'active': activeId === item.id }
      ]"
      @click="handleClick(item)"
    >
      <div class="node-content">
        <span class="node-text" v-html="cleanNodeName(item.name)"></span>
        <span v-if="item.count > 0" class="node-count">{{ item.count }}</span>
      </div>
    </div>

    <!-- 子节点 (blocks) -->
    <div v-if="item.blocks && item.blocks.length > 0" class="sub-nodes">
      <OutlineBlockNode
        v-for="block in item.blocks"
        :key="block.id"
        :block="block"
        :active-id="activeId"
        @node-click="handleBlockClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OutlineItem, OutlineBlock } from '@/api/types'
import OutlineBlockNode from './OutlineBlockNode.vue'

// Props
defineProps<{
  item: OutlineItem
  activeId: string
}>()

// Emits
const emit = defineEmits<{
  'node-click': [item: OutlineItem | OutlineBlock]
}>()

// 方法
const handleClick = (item: OutlineItem) => {
  emit('node-click', item)
}

const handleBlockClick = (block: OutlineBlock) => {
  emit('node-click', block)
}

const cleanNodeName = (name: string): string => {
  if (!name) return ''
  
  // 移除思源笔记的特殊标记，但保留基本的HTML标签
  return name
    .replace(/&nbsp;/g, ' ')
    .replace(/\u0026nbsp;/g, ' ')
    .trim()
}
</script>

<style scoped>
.outline-node {
  font-size: 14px;
}

.node-item {
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  border-left: 2px solid transparent;
}

.node-item:hover {
  background: var(--vp-c-bg);
  border-left-color: var(--vp-c-brand-2);
}

.node-item.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.node-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.node-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-alt);
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

.node-item.active .node-count {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

/* 不同层级的样式 */
.level-0 {
  font-weight: 600;
  font-size: 15px;
}

/* 不同标题级别的样式 */
.heading-h1 {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.heading-h2 {
  font-weight: 500;
  color: var(--vp-c-text-1);
  padding-left: 12px;
}

.heading-h3 {
  color: var(--vp-c-text-2);
  padding-left: 16px;
}

.heading-h4 {
  color: var(--vp-c-text-2);
  padding-left: 20px;
  font-size: 13px;
}

.heading-h5 {
  color: var(--vp-c-text-3);
  padding-left: 24px;
  font-size: 13px;
}

.heading-h6 {
  color: var(--vp-c-text-3);
  padding-left: 28px;
  font-size: 12px;
}

.sub-nodes {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--vp-c-gray-3);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .node-item:hover {
    background: var(--vp-c-bg-elv);
  }
  
  .node-count {
    background: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
  }
  
  .sub-nodes {
    border-left-color: var(--vp-c-gray-2);
  }
}

/* HTML内容样式 */
.node-text :deep(strong) {
  font-weight: 600;
}

.node-text :deep(em) {
  font-style: italic;
}

.node-text :deep(code) {
  background: var(--vp-c-bg-alt);
  padding: 1px 4px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 0.9em;
}

.node-item.active .node-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}
</style> 