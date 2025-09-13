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

  // 代码块工具栏（语言徽标 + 复制按钮）
  try {
    const pres = el.querySelectorAll('pre:not(.render-node)')
    pres.forEach((pre) => {
      const parent = pre.parentElement
      if (!parent) return
      // 已包装则跳过
      if (parent.classList.contains('code-block')) return

      const wrapper = document.createElement('div')
      wrapper.className = 'code-block'
      parent.replaceChild(wrapper, pre)
      wrapper.appendChild(pre)

      const codeEl = pre.querySelector('code') as HTMLElement | null
      const langMatch = codeEl?.className.match(/language-([\w+-]+)/i)
      const lang = (langMatch?.[1] || 'text').toLowerCase()

      const badge = document.createElement('div')
      badge.className = 'code-badge'

      const langEl = document.createElement('span')
      langEl.className = 'code-lang'
      langEl.textContent = lang

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-copy-btn'
      btn.textContent = '复制'
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        try {
          const text = codeEl?.innerText || ''
          await navigator.clipboard.writeText(text)
          const old = btn.textContent
          btn.textContent = '已复制'
          setTimeout(() => { btn.textContent = old || '复制' }, 1200)
        } catch {}
      })

      badge.appendChild(langEl)
      badge.appendChild(btn)
      wrapper.appendChild(badge)
    })
  } catch {}
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

/* 代码块工具栏样式（与父级深色系相容） */
:deep(.code-block) {
  position: relative;
}

:deep(.code-block) pre {
  margin-top: 32px; /* 为顶部徽标留出空间 */
}

:deep(.code-badge) {
  position: absolute;
  top: 6px;
  right: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(36, 41, 54, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 4px 8px;
  z-index: 1;
  backdrop-filter: blur(4px);
}

:deep(.code-lang) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.9;
}

:deep(.code-copy-btn) {
  border: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
}

:deep(.code-copy-btn:hover) {
  background: var(--bg-secondary);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}
</style>


