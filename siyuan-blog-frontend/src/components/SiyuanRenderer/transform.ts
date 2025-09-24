/*
  将思源返回的 HTML（带 data-type/data-subtype/class=hN 等）转换为语义化 HTML
  参考 render-example/src/core/render.ts 的节点映射思想，但在前端基于已生成的 HTML 做二次解析
*/

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function unescapeHtml(escaped: string): string {
  return escaped
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}

// 将形如 http(s)://host:port/path?query 的图片地址改写为 /image/path?query
function rewriteImageSrcToProxy(src: string): string {
  if (!src) return src
  try {
    const u = new URL(src)
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      const path = u.pathname || '/'
      const search = u.search || ''
      return `/image${path}${search}`
    }
  } catch (_) {
    // 非绝对 URL，继续尝试正则匹配
  }
  const m = src.match(/^https?:\/\/[^/]+(\/.*)$/i)
  if (m) return `/image${m[1]}`
  return src
}

function getHeadingLevel(el: Element): number {
  const bySubtype = el.getAttribute("data-subtype")
  if (bySubtype && /^h[1-6]$/.test(bySubtype)) {
    return Number(bySubtype.substring(1))
  }
  const cls = el.getAttribute("class") || ""
  const match = cls.match(/\bh([1-6])\b/)
  if (match) return Number(match[1])
  return 2
}

function renderInline(nodes: NodeListOf<ChildNode> | ChildNode[]): string {
  let html = ""
  const list: ChildNode[] = Array.isArray(nodes) ? nodes : Array.from(nodes)
  for (const node of list) {
    if (node.nodeType === Node.TEXT_NODE) {
      html += escapeHtml(node.textContent || "")
      continue
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (tag === "span") {
      const dtype = el.getAttribute("data-type") || ""
      const content = renderInline(el.childNodes as NodeListOf<ChildNode>)
      if (dtype === "strong") html += `<strong>${content}</strong>`
      else if (dtype === "em") html += `<em>${content}</em>`
      else if (dtype === "u") html += `<u>${content}</u>`
      else if (dtype === "s") html += `<s>${content}</s>`
      else if (dtype === "mark") html += `<mark>${content}</mark>`
      else if (dtype === "code") html += `<code>${content}</code>`
      else if (dtype === "img") {
        // 处理内联图片：SiYuan 会在段落内用 span[data-type=img] 包裹 img
        const img = el.querySelector('img') as HTMLImageElement | null
        if (img) {
          const rawSrc = img.getAttribute('data-src') || img.getAttribute('src') || ""
          const src = rewriteImageSrcToProxy(rawSrc)
          const alt = img.getAttribute('alt') || ""
          const title = img.getAttribute('title') || ""
          html += `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}">`
        }
        // 若未找到 img，则忽略该节点
      }
      else if (dtype === "inline-math") {
        const mathRaw = el.getAttribute("data-content") || ""
        const mathText = unescapeHtml(mathRaw)
        html += `<span class="math-inline">${escapeHtml(mathText)}</span>`
      }
      else if (dtype === "inline-memo") html += `${content ? `${content}<sup></sup>` : ""}`
      else if (dtype === "backslash") html += content
      else if (dtype === "a") {
        const href = el.getAttribute("href") || ""
        html += `<a href="${escapeHtml(href)}">${content}</a>`
      } else {
        html += content
      }
    } else if (tag === "a") {
      const href = el.getAttribute("href") || ""
      const content = renderInline(el.childNodes as NodeListOf<ChildNode>)
      html += `<a href="${escapeHtml(href)}">${content}</a>`
    } else if (tag === "code") {
      const content = renderInline(el.childNodes as NodeListOf<ChildNode>)
      html += `<code>${content}</code>`
    } else if (tag === "br") {
      html += "<br>"
    } else {
      // 其他内联容器，扁平化
      html += renderInline(el.childNodes as NodeListOf<ChildNode>)
    }
  }
  return html
}

function pickEditableInline(el: Element): string {
  // 常见块内包含一个 contenteditable 的内联容器
  const editable = el.querySelector('div[contenteditable="true"]') as HTMLElement | null
  if (editable) {
    return renderInline(editable.childNodes as unknown as NodeListOf<ChildNode>)
  }
  // 没有找到则尝试直接渲染其子节点
  return renderInline(el.childNodes as unknown as NodeListOf<ChildNode>)
}

function renderList(el: Element): string {
  const subtype = el.getAttribute("data-subtype") || ""
  const isOrdered = subtype === "o"
  const tag = isOrdered ? "ol" : "ul"
  const items = Array.from(el.children).filter(c => c.getAttribute && c.getAttribute("data-type") === "NodeListItem")
  const inner = items.map(item => renderListItem(item)).join("")
  return `<${tag}>${inner}</${tag}>`
}

function renderListItem(el: Element): string {
  // 列表项通常包含一个段落和可选的子列表
  const parts: string[] = []
  const children = Array.from(el.children) as Element[]
  for (const child of children) {
    const dtype = child.getAttribute("data-type") || ""
    if (dtype === "NodeParagraph") {
      parts.push(pickEditableInline(child))
    } else if (dtype === "NodeList") {
      parts.push(renderList(child))
    }
  }
  const content = parts.join("")
  return `<li>${content}</li>`
}

function renderCodeBlock(el: Element): string {
  // 渲染需要二次处理的代码类块（mermaid/echarts/graphviz/plantuml/abc/flowchart 等）
  const isRenderNode = (el.getAttribute("class") || "").split(/\s+/).includes("render-node")
  if (isRenderNode) {
    const subtype = el.getAttribute("data-subtype") || ""
    const raw = el.getAttribute("data-content") || ""
    const codeText = unescapeHtml(raw)
    const dataSubtype = subtype ? ` data-subtype="${escapeHtml(subtype)}"` : ""
    return `<pre class="render-node"${dataSubtype}><code>${escapeHtml(codeText)}</code></pre>`
  }

  // 常规代码块
  const langEl = el.querySelector('.protyle-action__language') as HTMLElement | null
  const language = (langEl?.textContent || "").trim()
  const hl = el.querySelector('.hljs') as HTMLElement | null
  const codeText = hl ? (hl.textContent || "") : ""
  const classAttr = language ? ` class="language-${escapeHtml(language)}"` : ""
  return `<pre><code${classAttr}>${escapeHtml(codeText)}</code></pre>`
}

function renderBlockquote(el: Element): string {
  const inner = pickEditableInline(el)
  return `<blockquote>${inner}</blockquote>`
}

function renderTable(el: Element): string {
  // 简化处理：将原始 HTML 中的 table 直接保留
  // 若后续需要可解析出 <thead>/<tbody>/<tr>/<td>
  return el.outerHTML
}

function renderImage(el: Element): string {
  // 思源图片结构较复杂，这里兼容常见形式：寻找 img 元素
  const img = el.querySelector('img') as HTMLImageElement | null
  if (img) {
    const rawSrc = img.getAttribute('data-src') || img.getAttribute('src') || ""
    const src = rewriteImageSrcToProxy(rawSrc)
    const title = img.getAttribute('title') || ""
    const style = img.getAttribute('style') || ""
    return `<img src="${escapeHtml(src)}" title="${escapeHtml(title)}" style="${escapeHtml(style)}">`
  }
  return ""
}

function renderBlock(el: Element): string {
  const dtype = el.getAttribute("data-type") || ""
  switch (dtype) {
    case "NodeHeading": {
      // 保留原始块 id，便于目录定位与滚动高亮
      const id = el.getAttribute("id") || el.getAttribute("data-node-id") || ""
      const level = getHeadingLevel(el)
      const content = pickEditableInline(el)
      const idAttr = id ? ` id="${escapeHtml(id)}"` : ""
      return `<h${level}${idAttr}>${content}</h${level}>`
    }
    case "NodeParagraph": {
      const content = pickEditableInline(el)
      // 空段落过滤
      if (!content.trim()) return ""
      return `<p>${content}</p>`
    }
    case "NodeList": {
      return renderList(el)
    }
    case "NodeBlockquote": {
      return renderBlockquote(el)
    }
    case "NodeCodeBlock": {
      return renderCodeBlock(el)
    }
    case "NodeImage": {
      return renderImage(el)
    }
    case "NodeTable": {
      return renderTable(el)
    }
    case "NodeMathBlock": {
      const raw = el.getAttribute("data-content") || ""
      const codeText = unescapeHtml(raw)
      return `<pre class="render-node" data-subtype="math"><code>${escapeHtml(codeText)}</code></pre>`
    }
    default: {
      // 未覆盖的块：尝试递归其子级，保留有效内容
      let acc = ""
      const children = Array.from(el.children) as Element[]
      for (const child of children) {
        acc += renderBlock(child)
      }
      if (acc) return acc
      // 退化为内联渲染
      const inline = pickEditableInline(el)
      return inline
    }
  }
}

export function transformSiyuanHtmlToSemantic(rawHtml: string): string {
  if (!rawHtml) return ""
  // 使用容器解析片段
  const container = document.createElement("div")
  container.innerHTML = rawHtml
  let result = ""
  const children = Array.from(container.children) as Element[]
  for (const child of children) {
    result += renderBlock(child)
  }
  return result
}

export default transformSiyuanHtmlToSemantic


