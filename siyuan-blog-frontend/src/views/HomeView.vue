<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">将思源笔记转换为个人博客</h1>
        <p class="hero-subtitle">轻松展示您的知识和思考，让您的笔记焕发新的生命力</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/notes')">
            <el-icon><Document /></el-icon>
            开始浏览笔记
          </el-button>
          <el-button size="large" @click="$router.push('/about')">
            <el-icon><User /></el-icon>
            了解更多
          </el-button>
        </div>
      </div>
      
      <!-- 装饰性图标 -->
      <div class="hero-decoration">
        <el-icon size="120" color="var(--el-color-primary-light-5)">
          <Document />
        </el-icon>
      </div>
    </div>

    <!-- 功能特色 -->
    <div class="features-section">
      <h2 class="section-title">功能特色</h2>
      <el-row :gutter="32">
        <el-col :xs="24" :sm="12" :md="8" v-for="feature in features" :key="feature.title">
          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon size="48" :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 使用统计 -->
    <div class="stats-section">
      <h2 class="section-title">实时数据</h2>
      <el-row :gutter="24">
        <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
          <div class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNoteStore } from '@/stores/note'
import { useAboutStore } from '@/stores/about'
import { storeToRefs } from 'pinia'
import {
  Document,
  User,
  FolderOpened,
  Reading,
  Star,
  TrendCharts
} from '@element-plus/icons-vue'

// 状态管理
const noteStore = useNoteStore()
const aboutStore = useAboutStore()
const { notebooks, docs } = storeToRefs(noteStore)

// 功能特色
const features = ref([
  {
    title: '思源笔记集成',
    description: '直接连接思源笔记，实时同步您的笔记内容',
    icon: 'FolderOpened',
    color: 'var(--el-color-primary)'
  },
  {
    title: '响应式设计',
    description: '完美适配桌面端和移动端，随时随地浏览笔记',
    icon: 'Reading',
    color: 'var(--el-color-success)'
  },
  {
    title: '暗黑模式',
    description: '支持明暗主题切换，保护您的眼睛',
    icon: 'Star',
    color: 'var(--el-color-warning)'
  }
])

// 统计数据
const stats = ref([
  { label: '笔记本', value: '0' },
  { label: '文档', value: '0' },
  { label: '今日访问', value: '1' },
  { label: '总访问量', value: '1' }
])

// 更新统计数据
const updateStats = () => {
  stats.value[0].value = notebooks.value.length.toString()
  stats.value[1].value = docs.value.length.toString()
}

// 初始化
onMounted(async () => {
  // 获取笔记本数据以更新统计
  if (notebooks.value.length === 0) {
    await noteStore.fetchNotebooks()
  }
  updateStats()
  
  // 获取个人信息
  if (!aboutStore.aboutMe) {
    await aboutStore.fetchAboutMe()
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100%;
}

/* 英雄区域 */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60vh;
  padding: 60px 0;
  background: linear-gradient(135deg, 
    var(--el-color-primary-light-9) 0%, 
    var(--el-bg-color) 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
  background: linear-gradient(135deg, 
    var(--el-color-primary), 
    var(--el-color-primary-light-3));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 32px;
  color: var(--el-text-color-regular);
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* 功能特色 */
.features-section {
  padding: 80px 0;
  background: var(--el-bg-color);
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 48px;
  color: var(--el-text-color-primary);
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--el-box-shadow-light);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.feature-description {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

/* 统计数据 */
.stats-section {
  padding: 60px 0;
  background: var(--el-fill-color-lighter);
}

.stat-item {
  text-align: center;
  padding: 24px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 0;
    min-height: 50vh;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-decoration {
    order: -1;
    margin-bottom: 24px;
  }
  
  .hero-decoration .el-icon {
    width: 80px !important;
    height: 80px !important;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-section {
    padding: 60px 0;
  }
  
  .stats-section {
    padding: 40px 0;
  }
  
  .stat-value {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-actions .el-button {
    width: 100%;
    max-width: 280px;
  }
  
  .feature-card {
    padding: 24px 16px;
  }
}
</style> 