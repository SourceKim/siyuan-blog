<template>
  <div class="about-view">
    <div class="about-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-section">
        <el-alert
          :title="error"
          type="error"
          show-icon
        >
          <template #default>
            <p>加载个人信息时出现错误，请稍后重试。</p>
            <el-button @click="fetchAboutMe" type="primary" size="small">
              重新加载
            </el-button>
          </template>
        </el-alert>
      </div>

      <!-- 个人信息内容 -->
      <div v-else-if="aboutMe" class="about-content">
        <!-- 个人信息卡片 -->
        <el-card class="profile-card" shadow="never">
          <div class="profile-header">
            <el-avatar 
              v-if="aboutMe.config.about.showAvatar"
              :src="aboutMe.avatarUrl" 
              :size="120"
              class="profile-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="profile-info">
              <h1 class="profile-name">{{ aboutMe.name }}</h1>
              <p class="profile-bio">{{ aboutMe.bio }}</p>
            </div>
          </div>
        </el-card>

        <!-- 个人介绍 -->
        <el-card class="intro-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>关于我</span>
            </div>
          </template>
          
          <div class="intro-content">
            <p>{{ aboutMe.bio }}</p>
            
            <div 
              v-if="aboutMe.config.about.showContactInfo"
              class="contact-info"
            >
              <h3>联系方式</h3>
              <div class="contact-links">
                <el-link 
                  :href="`mailto:${aboutMe.config.social.email}`" 
                  :icon="Message"
                  target="_blank"
                >
                  发送邮件
                </el-link>
                <el-link 
                  :href="aboutMe.config.social.github" 
                  :icon="Link"
                  target="_blank"
                >
                  GitHub
                </el-link>
                <el-link 
                  :href="aboutMe.config.social.website" 
                  :icon="Position"
                  target="_blank"
                >
                  个人网站
                </el-link>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 博客统计 -->
        <el-card 
          v-if="aboutMe.config.about.showBlogStats"
          class="stats-card" 
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>博客统计</span>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :xs="12" :sm="6" v-for="stat in blogStats" :key="stat.label">
              <div class="stat-item">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 技术栈 -->
        <el-card 
          v-if="aboutMe.config.about.showTechStack"
          class="tech-card" 
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>技术栈</span>
            </div>
          </template>
          
          <div class="tech-stack">
            <el-tag 
              v-for="tech in aboutMe.config.techStack" 
              :key="tech.name"
              :type="tech.type || undefined"
              class="tech-tag"
              size="large"
            >
              {{ tech.name }}
            </el-tag>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-section">
        <el-empty description="暂无个人信息">
          <el-button @click="fetchAboutMe" type="primary">
            重新加载
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAboutStore } from '@/stores/about'
import { useNoteStore } from '@/stores/note'
import { storeToRefs } from 'pinia'
import {
  User,
  InfoFilled,
  Message,
  Link,
  Position,
  TrendCharts,
  Tools
} from '@element-plus/icons-vue'

// 状态管理
const aboutStore = useAboutStore()
const noteStore = useNoteStore()
const { aboutMe, loading, error } = storeToRefs(aboutStore)
const { notebooks, docs } = storeToRefs(noteStore)

// 博客统计
const blogStats = ref([
  { label: '笔记本', value: '0' },
  { label: '文档', value: '0' },
  { label: '访问量', value: '1' },
  { label: '运行天数', value: '1' }
])

// 更新统计数据
const updateStats = () => {
  blogStats.value[0].value = notebooks.value.length.toString()
  blogStats.value[1].value = docs.value.length.toString()
}

// 获取个人信息
const fetchAboutMe = async () => {
  await aboutStore.fetchAboutMe()
}

// 初始化
onMounted(async () => {
  await fetchAboutMe()
  
  // 获取笔记数据以更新统计
  if (notebooks.value.length === 0) {
    await noteStore.fetchNotebooks()
  }
  updateStats()
})
</script>

<style scoped>
.about-view {
  min-height: 100%;
  background: var(--el-bg-color-page);
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 个人信息卡片 */
.profile-card {
  border-radius: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.profile-bio {
  font-size: 16px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* 介绍内容 */
.intro-content {
  line-height: 1.8;
}

.contact-info {
  margin-top: 24px;
}

.contact-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.contact-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 统计卡片 */
.stat-item {
  text-align: center;
  padding: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 技术栈 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tag {
  font-size: 14px;
  padding: 8px 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-container {
    padding: 16px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .profile-name {
    font-size: 24px;
  }
  
  .contact-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .profile-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .tech-stack {
    justify-content: center;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style> 