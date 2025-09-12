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
import mermaid from 'mermaid'

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
  // 代码高亮（跳过 render-node，如 mermaid/math 等）
  el.querySelectorAll('pre:not(.render-node) code').forEach((block) => {
    try {
      hljs.highlightElement(block as HTMLElement)
    } catch {}
  })

  // Mermaid 渲染
  try {
    // 初始化（只需一次）
    if (!(mermaid as any)._initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' })
      ;(mermaid as any)._initialized = true
    }

    // 将预处理节点替换为 mermaid 容器
    const mermaidCodes = el.querySelectorAll('pre.render-node[data-subtype="mermaid"] code')
    mermaidCodes.forEach((codeEl) => {
      const codeText = (codeEl.textContent || '').trim()
      const container = document.createElement('div')
      container.className = 'mermaid'
      container.textContent = codeText
      const pre = codeEl.closest('pre')
      if (pre && pre.parentElement) {
        pre.parentElement.replaceChild(container, pre)
      }
    })

    // 执行渲染
    if (el.querySelector('.mermaid')) {
      await mermaid.run({ querySelector: '.mermaid' })
    }
  } catch (err) {
    console.error('Mermaid 渲染失败:', err)
  }
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


