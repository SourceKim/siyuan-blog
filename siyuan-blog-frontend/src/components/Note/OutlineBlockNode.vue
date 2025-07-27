<template>
  <div class="outline-block-node">
    <!-- 块节点 -->
    <div 
      class="block-item"
      :class="[
        `heading-${block.subType}`,
        `depth-${block.depth}`,
        { 'active': activeId === block.id }
      ]"
      @click="handleClick(block)"
    >
      <div class="block-content">
        <span class="block-text" v-html="cleanBlockContent(block.content)"></span>
      </div>
    </div>

    <!-- 递归渲染子块 -->
    <div v-if="block.children && block.children.length > 0" class="child-blocks">
      <OutlineBlockNode
        v-for="child in block.children"
        :key="child.id"
        :block="child"
        :active-id="activeId"
        @node-click="handleChildClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OutlineBlock } from '@/api/types'

// Props
defineProps<{
  block: OutlineBlock
  activeId: string
}>()

// Emits
const emit = defineEmits<{
  'node-click': [block: OutlineBlock]
}>()

// 方法
const handleClick = (block: OutlineBlock) => {
  emit('node-click', block)
}

const handleChildClick = (block: OutlineBlock) => {
  emit('node-click', block)
}

const cleanBlockContent = (content: string): string => {
  if (!content) return ''
  
  // 清理思源笔记的特殊标记
  return content
    .replace(/&nbsp;/g, ' ')
    .replace(/\u0026nbsp;/g, ' ')
    .replace(/：$/, '') // 移除末尾的冒号
    .trim()
}
</script>

<style scoped>
.outline-block-node {
  font-size: 13px;
}

.block-item {
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1px;
  border-left: 2px solid transparent;
}

.block-item:hover {
  background: var(--vp-c-bg);
  border-left-color: var(--vp-c-brand-2);
}

.block-item.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}

.block-content {
  display: flex;
  align-items: center;
}

.block-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

/* 不同深度的缩进 */
.depth-1 {
  padding-left: 16px;
}

.depth-2 {
  padding-left: 24px;
}

.depth-3 {
  padding-left: 32px;
}

.depth-4 {
  padding-left: 40px;
}

.depth-5 {
  padding-left: 48px;
}

/* 不同标题级别的样式 */
.heading-h2 {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.heading-h3 {
  color: var(--vp-c-text-2);
}

.heading-h4 {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.heading-h5 {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.heading-h6 {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.child-blocks {
  margin-left: 4px;
  border-left: 1px solid var(--vp-c-gray-3);
  padding-left: 6px;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .block-item:hover {
    background: var(--vp-c-bg-elv);
  }
  
  .child-blocks {
    border-left-color: var(--vp-c-gray-2);
  }
}

/* HTML内容样式 */
.block-text :deep(strong) {
  font-weight: 600;
}

.block-text :deep(em) {
  font-style: italic;
}

.block-text :deep(code) {
  background: var(--vp-c-bg-alt);
  padding: 1px 3px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 0.9em;
}

.block-item.active .block-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.block-text :deep(span[data-type="strong"]) {
  font-weight: 600;
}
</style> 