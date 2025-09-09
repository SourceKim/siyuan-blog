<template>
  <div class="about-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <el-icon class="error-icon"><Warning /></el-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <el-button @click="fetchAboutMe" type="primary" class="retry-btn">
          重新加载
        </el-button>
      </div>
    </div>

    <!-- 个人信息内容 -->
    <div v-else-if="aboutMe" class="about-content">
      <!-- 个人信息头部 -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="profile-section">
            <div class="avatar-container">
              <div 
                class="profile-avatar neon-border"
                :style="`background-image: url(${aboutMe.avatarUrl || '/default-avatar.png'})`"
              >
              </div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name neon-text">{{ aboutMe.name }}</h1>
              <p class="profile-title">开发者 / 写作者</p>
              <p class="profile-bio">{{ aboutMe.bio }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系方式与技能 -->
      <div class="contact-skills-section">
        <div class="section-content">
          <h2 class="section-title">联系方式 & 技能</h2>
          <div class="contact-skills-grid">
            <!-- 联系方式 -->
            <div class="social-links">
              <a 
                :href="`mailto:${aboutMe.config.social.email}`"
                class="social-link hover-glow"
                title="邮箱"
              >
                <el-icon><Message /></el-icon>
              </a>
              <a 
                :href="aboutMe.config.social.github"
                class="social-link hover-glow"
                title="GitHub"
                target="_blank"
              >
                <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                :href="aboutMe.config.social.website"
                class="social-link hover-glow"
                title="个人网站"
                target="_blank"
              >
                <el-icon><Position /></el-icon>
              </a>
            </div>

            <div class="divider"></div>

            <!-- 技能标签 -->
            <div class="tech-skills">
              <span 
                v-for="tech in aboutMe.config.techStack" 
                :key="tech.name"
                class="tech-tag"
                :class="`tech-${tech.type || 'default'}`"
              >
                {{ tech.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作经历 -->
      <div class="experience-section">
        <div class="section-content">
          <h2 class="section-title">经历</h2>
          <div class="timeline">
            <div 
              v-for="(exp, index) in aboutMe?.config?.experience || []" 
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-marker"></div>
              <h3 class="timeline-title">{{ exp.title }}</h3>
              <p class="timeline-period">{{ exp.period }}</p>
              <p class="timeline-description">{{ exp.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 博客统计 -->
      <div class="stats-section">
        <div class="section-content">
          <h2 class="section-title">博客统计</h2>
          <div class="stats-grid">
            <div v-for="stat in blogStats" :key="stat.label" class="stat-card">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-section">
      <div class="empty-content">
        <el-icon class="empty-icon"><User /></el-icon>
        <h3>暂无个人信息</h3>
        <el-button @click="fetchAboutMe" type="primary" class="retry-btn">
          重新加载
        </el-button>
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
  Warning,
  Message,
  Position
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
  
  // 笔记本数据现在通过博客文档树获取，不需要单独获取
  updateStats()
})
</script>

<style scoped>
/* CSS 变量定义 */
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --accent-primary: #3b82f6;
  --accent-secondary: #818cf8;
  --border-color: rgba(75, 85, 99, 0.3);
  --neon-glow: 0 0 5px var(--accent-secondary), 0 0 10px var(--accent-secondary), 0 0 15px var(--accent-primary);
}

.about-view {
  min-height: 100vh;
  background: transparent;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* 加载和错误状态 */
.loading-section,
.error-section,
.empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-card,
.empty-content {
  text-align: center;
  padding: 3rem;
  border-radius: 12px;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.error-card h3,
.empty-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.error-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: var(--accent-primary) !important;
  border-color: var(--accent-primary) !important;
}

/* 主要内容容器 */
.about-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  padding-bottom: 3rem;
  text-align: center;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid var(--accent-primary);
  position: relative;
}

/* 霓虹边框效果 */
.neon-border {
  box-shadow: var(--neon-glow);
  animation: pulse-border 2s ease-in-out infinite alternate;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 5px var(--accent-secondary), 0 0 10px var(--accent-secondary), 0 0 15px var(--accent-primary);
  }
  100% {
    box-shadow: 0 0 8px var(--accent-secondary), 0 0 15px var(--accent-secondary), 0 0 25px var(--accent-primary);
  }
}

.profile-info {
  max-width: 600px;
}

.profile-name {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.05em;
}

/* 霓虹文字效果 */
.neon-text {
  text-shadow: 0 0 5px var(--accent-secondary);
}

.profile-title {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.profile-bio {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

/* 联系方式与技能区域 */
.contact-skills-section {
  padding: 3rem 0;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 3rem;
}

.section-content {
  padding: 0 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 2rem 0;
  letter-spacing: 0.05em;
}

.contact-skills-grid {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* 社交链接 */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--accent-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--text-secondary);
  transform: translateY(-2px);
}

/* 悬停发光效果 */
.hover-glow:hover {
  box-shadow: 0 0 8px var(--accent-primary);
}

.github-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* 分隔线 */
.divider {
  height: 2rem;
  width: 1px;
  background: var(--border-color);
}

/* 技能标签 */
.tech-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.tech-tag {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.tech-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 技能标签颜色 */
.tech-primary { border-color: var(--accent-primary); color: var(--accent-primary); }
.tech-success { border-color: #10b981; color: #10b981; }
.tech-warning { border-color: #f59e0b; color: #f59e0b; }
.tech-info { border-color: #06b6d4; color: #06b6d4; }
.tech-danger { border-color: #ef4444; color: #ef4444; }

/* 经历时间线 */
.experience-section {
  margin-bottom: 3rem;
}

.timeline {
  position: relative;
  border-left: 2px solid var(--border-color);
  padding-left: 2rem;
  margin-left: 1rem;
}

.timeline-item {
  margin-bottom: 2.5rem;
  position: relative;
}

.timeline-marker {
  position: absolute;
  left: -2.25rem;
  top: 0.375rem;
  width: 1rem;
  height: 1rem;
  background: var(--accent-secondary);
  border-radius: 50%;
  border: 4px solid var(--bg-primary);
  box-shadow: 0 0 0 1px var(--border-color);
}

.timeline-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin: 0 0 0.25rem 0;
}

.timeline-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.timeline-description {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

/* 博客统计 */
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 0.25rem;
  display: block;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-content {
    padding: 1rem;
  }
  
  .profile-section {
    gap: 1.5rem;
  }
  
  .profile-name {
    font-size: 2rem;
  }
  
  .contact-skills-grid {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .divider {
    height: 1px;
    width: 50%;
  }
  
  .section-content {
    padding: 0 1rem;
  }
  
  .timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.75rem;
  }
}

@media (max-width: 480px) {
  .profile-avatar {
    width: 120px;
    height: 120px;
  }
  
  .profile-name {
    font-size: 1.75rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .social-links {
    gap: 0.75rem;
  }
  
  .social-link {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}

/* 深色主题兼容 */
.dark .about-view {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: rgba(71, 85, 105, 0.3);
}
</style> 