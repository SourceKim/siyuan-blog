<template>
  <div class="home-view">
    <!-- 科技感背景动画 -->
    <TechBackground />
    <!-- 左侧个人信息侧边栏 -->
    <aside 
      class="profile-sidebar" 
      :class="{ collapsed: drawerCollapsed }"
    >
      <div class="sidebar-content">
        <!-- 收缩按钮 -->
        <div 
          class="collapse-btn" 
          @click="toggleDrawer"
        >
          <el-icon>
            <ArrowLeft v-if="!drawerCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </div>

        <!-- 个人信息卡片 -->
        <div class="profile-card" v-if="!drawerCollapsed">
          <!-- 头像区域 -->
          <div class="avatar-container">
            <div class="avatar-wrapper">
              <el-avatar 
                :size="120" 
                :src="homeData?.profile?.avatarUrl" 
                icon="User"
                class="profile-avatar"
              />
              <div class="avatar-glow"></div>
              <div class="status-indicator"></div>
            </div>
          </div>
          
          <!-- 姓名和标题 -->
          <div class="profile-header">
            <h3 class="profile-name">{{ homeData?.profile?.name || homeData?.contentTemplates?.defaults?.fallbackName || '博主' }}</h3>
            <p class="profile-title">{{ homeData?.profile?.title || homeData?.contentTemplates?.defaults?.fallbackTitle || '开发者' }}</p>
          </div>

          <!-- 个人简介 -->
          <div class="profile-bio">
            <p>{{ homeData?.profile?.bio || homeData?.contentTemplates?.defaults?.fallbackBio || '这是我的数字花园，分享技术思考与成长历程。' }}</p>
          </div>

          <!-- 统计信息 -->
          <div 
            class="stats-container"
          >
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ homeData?.blogStats?.notebookCount || 0 }}</div>
                <div class="stat-label">笔记本</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ homeData?.blogStats?.documentCount || 0 }}</div>
                <div class="stat-label">文章</div>
              </div>
            </div>
          </div>

          <!-- 社交链接 -->
          <div 
            class="social-links"
          >
            <button 
              class="social-btn"
              title="邮箱"
              @click="openEmail"
            >
              <el-icon><Message /></el-icon>
              <span>Email</span>
            </button>
            <button 
              class="social-btn"
              title="GitHub"
              @click="openGitHub"
            >
              <el-icon><Link /></el-icon>
              <span>GitHub</span>
            </button>
            <button 
              class="social-btn"
              title="LinkedIn"
              @click="openWebsite"
            >
              <el-icon><Position /></el-icon>
              <span>LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 
      expanded: drawerCollapsed 
    }">
      <div class="content-container">
        <!-- 推荐文章区域 -->
        <section class="featured-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Star /></el-icon>
              推荐阅读
            </h2>
            <p class="section-subtitle">精选内容，探索有趣的思考</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>

          <!-- 推荐文章大卡片 -->
          <div v-else-if="featuredArticle" class="featured-article">
            <div class="featured-card" @click="goToArticle(featuredArticle)">
              <div class="featured-image">
                <div class="image-overlay"></div>
                <div class="featured-content">
                  <h3 class="featured-title">{{ removeFileExtension(featuredArticle.name) }}</h3>
                  <p class="featured-description">{{ generateSummary(featuredArticle) }}</p>
                  <div class="featured-meta">
                    <span class="featured-category">
                      <el-icon><FolderOpened /></el-icon>
                      {{ getNotebookName(featuredArticle) }}
                    </span>
                    <span class="featured-date">{{ featuredArticle.hCtime }}</span>
                  </div>
                  <button class="explore-btn">
                    <span>立即阅读</span>
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 最近更新区域 -->
        <section class="recent-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Clock /></el-icon>
              最近更新
            </h2>
          </div>

          <!-- 错误状态 -->
          <div v-if="error" class="error-container">
            <el-empty 
              description="加载失败"
              :image-size="100"
            >
              <el-button type="primary" @click="loadRecommendedDocs">
                重新加载
              </el-button>
            </el-empty>
          </div>

          <!-- 最近文章时间线 -->
          <div v-else-if="recentArticles.length > 0" class="timeline-container">
            <div 
              v-for="(doc, index) in recentArticles" 
              :key="doc.id"
              class="timeline-item"
              @click="goToArticle(doc)"
            >
              <div class="timeline-marker">
                <div class="marker-dot">
                  <el-icon><Document /></el-icon>
                </div>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">{{ removeFileExtension(doc.name) }}</h3>
                <p class="timeline-date">{{ doc.hCtime }}</p>
                <div class="timeline-tags" v-if="getArticleTags(doc).length > 0">
                  <span 
                    v-for="tag in getArticleTags(doc)" 
                    :key="tag" 
                    class="timeline-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-container">
            <el-empty 
              description="暂无文章"
              :image-size="100"
            >
              <el-button type="primary" @click="loadRecommendedDocs">
                刷新内容
              </el-button>
            </el-empty>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { useHomeStore } from '@/stores/home'
import { storeToRefs } from 'pinia'
import {
  User,
  Document,
  Star,
  FolderOpened,
  Clock,
  Edit,
  View,
  Message,
  Link,
  Position,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import type { Doc, ContentTemplates } from '@/api/types'
import TechBackground from '@/components/TechBackground.vue'

const router = useRouter()

// 状态管理
const noteStore = useNoteStore()
const homeStore = useHomeStore()
const { notebooks } = storeToRefs(noteStore)
const { homeData, loading, error } = storeToRefs(homeStore)

// 抽屉状态
const drawerCollapsed = ref(false)

// 切换侧边栏状态
const toggleDrawer = () => {
  drawerCollapsed.value = !drawerCollapsed.value
}

// 从 homeData 中获取推荐文档
const recommendedDocs = computed(() => {
  return homeData.value?.recommendedDocs || []
})

// 计算推荐文章（第一篇作为特色文章）
const featuredArticle = computed(() => {
  return recommendedDocs.value?.[0] || null
})

// 计算最近文章（排除特色文章的其他文章）
const recentArticles = computed(() => {
  return recommendedDocs.value?.slice(1, 6) || []
})

// 加载推荐文章（现在从完整首页数据获取）
const loadRecommendedDocs = async () => {
  const maxArticles = 12 // 硬编码最大推荐文章数
  await homeStore.fetchHomeData(maxArticles)
}

// 移除文件扩展名
const removeFileExtension = (filename: string): string => {
  // 移除 .sy 后缀
  return filename.replace(/\.sy$/, '')
}

// 获取笔记本名称
const getNotebookName = (doc: Doc): string => {
  // 使用配置的默认值
  return doc.notebookName || homeData.value?.contentTemplates?.defaults?.unknownNotebook || '未知笔记本'
}

// 生成文章摘要（使用配置化模板）
const generateSummary = (doc: Doc): string => {
  const title = removeFileExtension(doc.name)
  const templates = homeData.value?.contentTemplates?.summaryTemplates
  const keywords = homeData.value?.contentTemplates?.summaryKeywords
  
  if (!templates) {
    return `关于${title}的精彩内容，值得一读。`
  }
  
  // 根据关键词智能选择模板
  const titleLower = title.toLowerCase()
  
  // 检查前端关键词
  if (keywords?.frontend?.some((keyword: string) => titleLower.includes(keyword.toLowerCase()))) {
    return templates.frontend.replace('{title}', title)
  }
  
  // 检查后端关键词  
  if (keywords?.backend?.some((keyword: string) => titleLower.includes(keyword.toLowerCase()))) {
    return templates.backend.replace('{title}', title)
  }
  
  // 检查思考关键词
  if (keywords?.thinking?.some((keyword: string) => titleLower.includes(keyword.toLowerCase()))) {
    return templates.thinking.replace('{title}', title)
  }
  
  // 检查教程关键词
  if (keywords?.tutorial?.some((keyword: string) => titleLower.includes(keyword.toLowerCase()))) {
    return templates.tutorial.replace('{title}', title)
  }
  
  // 使用默认模板（随机选择）
  if (templates.default && templates.default.length > 0) {
    const randomIndex = Math.floor(Math.random() * templates.default.length)
    return templates.default[randomIndex].replace('{title}', title)
  }
  
  return `关于${title}的精彩内容，值得一读。`
}

// 获取文章标签（使用配置化规则）
const getArticleTags = (doc: Doc): string[] => {
  const tags: string[] = []
  const title = removeFileExtension(doc.name).toLowerCase()
  const notebookName = doc.notebookName?.toLowerCase() || ''
  const tagRules = homeData.value?.contentTemplates?.tagRules
  const maxTags = homeData.value?.contentTemplates?.defaults?.maxTags || 3
  
  if (!tagRules) {
    return tags
  }
  
  // 检查技术类标签
  if (tagRules.tech) {
    Object.values(tagRules.tech).forEach((rule: any) => {
      if (rule.keywords?.some((keyword: string) => title.includes(keyword.toLowerCase()))) {
        tags.push(rule.tag)
      }
    })
  }
  
  // 检查内容类型标签
  if (tagRules.content) {
    Object.values(tagRules.content).forEach((rule: any) => {
      if (rule.keywords?.some((keyword: string) => title.includes(keyword.toLowerCase()))) {
        tags.push(rule.tag)
      }
    })
  }
  
  // 检查分类标签（基于笔记本名称）
  if (tagRules.category) {
    Object.values(tagRules.category).forEach((rule: any) => {
      if (rule.keywords?.some((keyword: string) => notebookName.includes(keyword.toLowerCase()))) {
        tags.push(rule.tag)
      }
    })
  }
  
  // 去重并限制标签数量
  return [...new Set(tags)].slice(0, maxTags)
}

// 跳转到文章详情
const goToArticle = (doc: Doc) => {
  // 这里可以跳转到文章详情页面
  router.push(`/notes?docId=${doc.id}`)
}

// 社交链接操作
const openEmail = () => {
  const email = homeData.value?.socialLinks?.email || 'contact@example.com'
  window.open(`mailto:${email}`)
}

const openGitHub = () => {
  const github = homeData.value?.socialLinks?.github || 'https://github.com'
  window.open(github)
}

const openWebsite = () => {
  const website = homeData.value?.socialLinks?.website || 'https://example.com'
  window.open(website)
}

// 初始化
onMounted(async () => {
  // 获取首页完整数据（包含个人信息、设置、推荐文档等）
  const maxArticles = 12 // 默认推荐文章数量
  await homeStore.fetchHomeData(maxArticles)
  
  // 保持向后兼容：如果需要单独的笔记本数据
  if (notebooks.value.length === 0) {
    await noteStore.fetchNotebooks()
  }
})
</script>

<style scoped>
/* CSS 变量定义 - 科技感配色 */
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

.home-view {
  display: flex;
  min-height: 100vh;
  background: var(--tech-dark-bg);
  color: var(--tech-text-light);
  font-family: 'Inter', 'Roboto', 'Nunito Sans', sans-serif;
}

/* 左侧个人信息侧边栏 */
.profile-sidebar {
  width: 320px;
  background: var(--tech-dark-card);
  border-right: 1px solid var(--tech-dark-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1000;
  overflow: hidden;
}

.profile-sidebar.collapsed {
  width: 60px;
}

.profile-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--tech-gradient);
}

.sidebar-content {
  height: 100%;
  padding: 24px;
  overflow: hidden;
  position: relative;
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 24px;
  width: 28px;
  height: 28px;
  background: var(--tech-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  box-shadow: var(--tech-shadow);
  transition: all 0.3s ease;
  border: none;
  z-index: 10;
}

.collapse-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--tech-glow);
}

/* 个人信息卡片 */
.profile-card {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 32px 24px;
  border: 1px solid var(--tech-dark-border);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  height: calc(100vh - 48px);
  overflow-y: auto;
}

/* 头像区域 */
.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid transparent;
  background: var(--tech-gradient);
  background-clip: padding-box;
  transition: all 0.3s ease;
}

.avatar-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: var(--tech-gradient);
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(8px);
  z-index: -1;
  animation: pulse 2s infinite;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid var(--tech-dark-card);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* 个人信息头部 */
.profile-header {
  text-align: center;
  margin-bottom: 16px;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--tech-text-light);
  letter-spacing: 0.02em;
}

.profile-title {
  font-size: 14px;
  color: var(--tech-primary);
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 个人简介 */
.profile-bio {
  text-align: left;
  flex-grow: 1;
}

.profile-bio p {
  font-size: 14px;
  color: var(--tech-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* 统计信息 */
.stats-container {
  width: 100%;
  margin: 16px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: rgba(0, 191, 255, 0.05);
  border: 1px solid rgba(0, 191, 255, 0.2);
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--tech-gradient);
}

.stat-card:hover {
  background: rgba(0, 191, 255, 0.08);
  border-color: var(--tech-primary);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--tech-primary);
  margin-bottom: 4px;
  text-shadow: 0 0 8px rgba(0, 191, 255, 0.3);
}

.stat-label {
  font-size: 11px;
  color: var(--tech-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* 社交链接 */
.social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: auto;
}

.social-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--tech-dark-border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--tech-text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
}

.social-btn:hover {
  background: rgba(0, 191, 255, 0.1);
  border-color: var(--tech-primary);
  color: var(--tech-primary);
  transform: translateX(4px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  background: var(--tech-dark-bg);
}

.main-content.expanded {
  margin-left: 0;
}

.content-container {
  padding: 40px;
  max-width: 960px;
  margin: 0 auto;
}

/* 区域标题 */
.section-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--tech-text-light);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.02em;
}

.section-subtitle {
  font-size: 16px;
  color: var(--tech-text-muted);
  margin: 0;
}

/* 推荐文章区域 */
.featured-section {
  margin-bottom: 64px;
}

.featured-article {
  margin-top: 24px;
}

.featured-card {
  background: var(--tech-dark-card);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--tech-dark-border);
  position: relative;
}

.featured-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tech-gradient);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
  z-index: -1;
}

.featured-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--tech-shadow);
}

.featured-card:hover::before {
  opacity: 0.1;
}

.featured-image {
  height: 240px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  position: relative;
  display: flex;
  align-items: center;
  padding: 32px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%);
}

.featured-content {
  position: relative;
  z-index: 2;
}

.featured-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--tech-text-light);
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.featured-description {
  font-size: 14px;
  color: var(--tech-text-muted);
  line-height: 1.6;
  margin: 0 0 20px 0;
  max-width: 500px;
}

.featured-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.featured-category,
.featured-date {
  font-size: 12px;
  color: var(--tech-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.explore-btn {
  background: var(--tech-gradient);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--tech-glow);
}

/* 最近更新区域 */
.recent-section {
  margin-bottom: 40px;
}

.timeline-container {
  position: relative;
  padding-left: 24px;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--tech-dark-border);
}

.timeline-item {
  position: relative;
  padding-bottom: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-content {
  transform: translateX(8px);
}

.timeline-marker {
  position: absolute;
  left: -20px;
  top: 4px;
}

.marker-dot {
  width: 16px;
  height: 16px;
  background: var(--tech-dark-card);
  border: 2px solid var(--tech-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: var(--tech-primary);
}

.timeline-content {
  transition: transform 0.3s ease;
}

.timeline-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--tech-text-light);
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.timeline-date {
  font-size: 12px;
  color: var(--tech-text-muted);
  margin: 0 0 12px 0;
}

.timeline-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-tag {
  background: rgba(0, 191, 255, 0.1);
  color: var(--tech-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* 状态容器 */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: var(--tech-text-muted);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    padding: 32px 24px;
  }
  
  .profile-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .home-view {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--tech-dark-border);
  }
  
  .profile-sidebar.collapsed {
    height: 60px;
    width: 100%;
  }
  
  .sidebar-content {
    padding: 20px;
  }
  
  .profile-card {
    height: auto;
    padding: 24px 20px;
  }
  
  .collapse-btn {
    right: 20px;
    top: 20px;
  }
  
  .main-content {
    flex: none;
  }
  
  .content-container {
    padding: 24px 20px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .featured-image {
    height: 200px;
    padding: 24px;
  }
  
  .featured-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 20px 16px;
  }
  
  .featured-image {
    height: 180px;
    padding: 20px;
  }
  
  .featured-title {
    font-size: 18px;
  }
  
  .timeline-container {
    padding-left: 20px;
  }
  
  .timeline-marker {
    left: -16px;
  }
}
</style> 