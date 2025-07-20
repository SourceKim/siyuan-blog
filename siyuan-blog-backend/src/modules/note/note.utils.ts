/**
 * 格式化文档路径
 */
export function formatDocPath(notebook: string, path: string): string {
  if (path === '/') {
    return `/${notebook}`
  }
  return `/${notebook}${path}`
}

/**
 * 验证文档 ID 格式
 */
export function isValidDocId(id: string): boolean {
  // 思源笔记的块 ID 通常是 20 位的时间戳 + 7 位随机字符
  return /^[0-9]{14}-[a-z0-9]{7}$/.test(id)
}

/**
 * 格式化时间戳为可读格式
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

/**
 * 清理 HTML 内容，提取纯文本
 */
export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * 生成文档摘要
 */
export function generateSummary(content: string, maxLength: number = 100): string {
  const text = extractTextFromHtml(content)
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
