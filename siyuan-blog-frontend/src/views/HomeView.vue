<template>
  <div class="home-view">
    <!-- 左侧个人简介抽屉 -->
    <div class="profile-drawer" :class="{ collapsed: drawerCollapsed }">
      <div class="drawer-content">
        <!-- 收缩按钮 -->
        <div class="collapse-btn" @click="toggleDrawer">
          <el-icon>
            <ArrowLeft v-if="!drawerCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </div>

        <!-- 个人信息 -->
        <div class="profile-info" v-if="!drawerCollapsed">
          <div class="avatar-section">
            <el-avatar 
              :size="80" 
              :src="aboutStore.aboutMe?.avatarUrl" 
              icon="User"
              class="profile-avatar"
            />
          </div>
          
          <div class="name-section">
            <h3 class="profile-name">{{ aboutStore.aboutMe?.name || '加载中...' }}</h3>
            <p class="profile-bio">{{ aboutStore.aboutMe?.bio || '这个人很懒，什么都没留下...' }}</p>
          </div>

          <!-- 社交链接 -->
          <div class="social-links">
            <el-button 
              circle 
              :icon="Message" 
              title="邮箱"
              @click="openEmail"
            />
            <el-button 
              circle 
              :icon="Link" 
              title="GitHub"
              @click="openGitHub"
            />
            <el-button 
              circle 
              :icon="Position" 
              title="网站"
              @click="openWebsite"
            />
          </div>

          <!-- 关于我按钮 -->
          <div class="about-action">
            <el-button 
              type="primary" 
              :icon="User" 
              @click="$router.push('/about')"
              style="width: 100%"
            >
              了解更多
            </el-button>
          </div>

          <!-- 统计信息 -->
          <div class="stats-info">
            <div class="stat-item">
              <div class="stat-value">{{ notebooks.length }}</div>
              <div class="stat-label">笔记本</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ recommendedDocs.length }}</div>
              <div class="stat-label">文章</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧推荐文章区域 -->
    <div class="main-content" :class="{ expanded: drawerCollapsed }">
      <div class="content-container">
        <!-- 标题区域 -->
        <div class="content-header">
          <h1 class="content-title">
            <el-icon><Star /></el-icon>
            推荐文章
          </h1>
          <p class="content-subtitle">探索精选内容，发现有趣的思考</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <el-empty 
            description="加载失败"
            :image-size="100"
          >
            <el-button type="primary" @click="loadRecommendedDocs">
              重新加载
            </el-button>
          </el-empty>
        </div>

        <!-- 推荐文章列表 -->
        <div v-else-if="hasRecommendedDocs" class="articles-grid">
          <el-card 
            v-for="doc in recommendedDocs" 
            :key="doc.id"
            class="article-card"
            shadow="hover"
            @click="goToArticle(doc)"
          >
            <div class="article-content">
                             <div class="article-header">
                 <h3 class="article-title">{{ removeFileExtension(doc.name) }}</h3>
                                 <div class="article-meta">
                   <el-tag size="small" type="info">
                     <el-icon><FolderOpened /></el-icon>
                     {{ getNotebookName(doc) }}
                   </el-tag>
                 </div>
              </div>

              <div class="article-summary">
                <p>{{ generateSummary(doc) }}</p>
              </div>

              <!-- 标签区域 -->
              <div class="article-tags" v-if="getArticleTags(doc).length > 0">
                <el-tag 
                  v-for="tag in getArticleTags(doc)" 
                  :key="tag" 
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <div class="article-footer">
                <div class="article-time">
                  <div class="time-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ doc.hCtime }}</span>
                  </div>
                  <div class="time-item" v-if="doc.mtime !== doc.ctime">
                    <el-icon><Edit /></el-icon>
                    <span>{{ doc.hMtime }}</span>
                  </div>
                </div>
                <div class="article-stats">
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <el-empty 
            description="暂无推荐文章"
            :image-size="100"
          >
            <el-button type="primary" @click="loadRecommendedDocs">
              刷新推荐
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { useAboutStore } from '@/stores/about'
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
import type { Doc } from '@/api/types'

const router = useRouter()

// 状态管理
const noteStore = useNoteStore()
const aboutStore = useAboutStore()
const { notebooks, recommendedDocs, loading, error, hasRecommendedDocs } = storeToRefs(noteStore)

// 抽屉状态
const drawerCollapsed = ref(false)

// 切换抽屉状态
const toggleDrawer = () => {
  drawerCollapsed.value = !drawerCollapsed.value
}

// 加载推荐文章
const loadRecommendedDocs = async () => {
  await noteStore.fetchRecommendedDocs(12)
}

// 移除文件扩展名
const removeFileExtension = (filename: string): string => {
  // 移除 .sy 后缀
  return filename.replace(/\.sy$/, '')
}

// 获取笔记本名称
const getNotebookName = (doc: Doc): string => {
  // 直接使用后端返回的笔记本名称
  return doc.notebookName || '未知笔记本'
}

// 生成文章摘要
const generateSummary = (doc: Doc): string => {
  // 这里可以根据实际情况生成摘要，目前使用简单的描述
  const title = removeFileExtension(doc.name)
  return `这是一篇关于"${title}"的文章，包含了深入的思考和有价值的内容。点击查看完整内容...`
}

// 获取文章标签（临时实现）
const getArticleTags = (doc: Doc): string[] => {
  // 这里可以根据文档内容或路径生成标签，目前返回空数组
  const tags: string[] = []
  
  // 简单的标签生成逻辑（基于文档名称）
  const name = removeFileExtension(doc.name)
  if (name.includes('技术')) tags.push('技术')
  if (name.includes('思考')) tags.push('思考')
  if (name.includes('总结')) tags.push('总结')
  if (name.includes('笔记')) tags.push('笔记')
  
  return tags
}

// 跳转到文章详情
const goToArticle = (doc: Doc) => {
  // 这里可以跳转到文章详情页面
  router.push(`/notes?docId=${doc.id}`)
}

// 社交链接操作
const openEmail = () => {
  window.open('mailto:contact@example.com')
}

const openGitHub = () => {
  window.open('https://github.com')
}

const openWebsite = () => {
  window.open('https://example.com')
}

// 初始化
onMounted(async () => {
  // 获取个人信息
  if (!aboutStore.aboutMe) {
    await aboutStore.fetchAboutMe()
  }
  
  // 获取笔记本数据
  if (notebooks.value.length === 0) {
    await noteStore.fetchNotebooks()
  }
  
  // 获取推荐文章
  await loadRecommendedDocs()
})
</script>

<style scoped>
.home-view {
  display: flex;
  height: 100vh;
  background: var(--el-bg-color);
}

/* 左侧个人简介抽屉 */
.profile-drawer {
  width: 280px;
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-lighter);
  transition: width 0.3s ease;
  position: relative;
  z-index: 1000;
}

.profile-drawer.collapsed {
  width: 60px;
}

.drawer-content {
  height: 100%;
  padding: 20px;
  overflow: hidden;
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  box-shadow: var(--el-box-shadow-light);
  transition: transform 0.2s ease;
}

.collapse-btn:hover {
  transform: scale(1.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-section {
  margin-bottom: 10px;
}

.profile-avatar {
  border: 3px solid var(--el-color-primary-light-8);
}

.name-section {
  text-align: center;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.profile-bio {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 8px;
}

.about-action {
  width: 100%;
}

.stats-info {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 右侧主要内容区域 */
.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
  overflow: auto;
}

.content-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-header {
  text-align: center;
  margin-bottom: 40px;
}

.content-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.content-subtitle {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* 文章网格 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.article-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow);
}

.article-content {
  padding: 4px;
}

.article-header {
  margin-bottom: 12px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.article-summary {
  margin-bottom: 16px;
}

.article-summary p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.article-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.article-stats {
  display: flex;
  gap: 12px;
}

.article-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 状态容器 */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-view {
    flex-direction: column;
  }
  
  .profile-drawer {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .profile-drawer.collapsed {
    height: 60px;
    width: 100%;
  }
  
  .drawer-content {
    padding: 16px;
  }
  
  .collapse-btn {
    right: 20px;
    top: 20px;
  }
  
  .main-content {
    flex: none;
  }
  
  .content-container {
    padding: 20px 16px;
  }
  
  .content-title {
    font-size: 24px;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 