/**
 * 验证头像 URL 格式
 */
export function isValidAvatarUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    // 如果是相对路径，也认为是有效的
    return url.startsWith('/') || url.startsWith('./')
  }
}

/**
 * 清理和格式化个人简介
 */
export function formatBio(bio: string): string {
  return bio
    .trim()
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .substring(0, 500) // 限制长度
}

/**
 * 验证姓名格式
 */
export function isValidName(name: string): boolean {
  if (!name) return false
  const trimmedName = name.trim()
  return trimmedName.length > 0 && trimmedName.length <= 50
}

/**
 * 生成默认的个人信息
 */
export function getDefaultAboutMe() {
  return {
    name: '博主',
    avatarUrl: '/default-avatar.png',
    bio: '欢迎来到我的博客，这里记录了我的技术学习和生活感悟。'
  }
}
