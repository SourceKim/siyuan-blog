<template>
  <div class="siyuan-renderer" ref="root" v-html="semanticHtml"></div>
  <!-- 注意：外层页面可用一个容器套上现有样式类，如 .html-content -->
  <!-- 本组件只负责把思源结构化 HTML 转为语义化 HTML -->
  <!-- 样式交由父组件控制 -->
</template>

<script setup lang="ts">
import { computed, onMounted, watch, nextTick, ref } from 'vue'
import transformSiyuanHtmlToSemantic from './transform'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const root = ref<HTMLElement | null>(null)

const semanticHtml = computed(() => {
  if (!props.content) return ''
  return transformSiyuanHtmlToSemantic(props.content)
})

async function enhanceRenderedContent() {
  await nextTick()
  const el = root.value
  if (!el) return
  // 代码高亮
  el.querySelectorAll('pre code').forEach((block) => {
    try {
      hljs.highlightElement(block as HTMLElement)
    } catch {}
  })
}

onMounted(() => {
  enhanceRenderedContent()
})

watch(semanticHtml, () => {
  enhanceRenderedContent()
})
</script>

<style scoped>
.siyuan-renderer {
  /* 交由父容器定义排版；此处只做必要的安全边界 */
  width: 100%;
}
</style>


