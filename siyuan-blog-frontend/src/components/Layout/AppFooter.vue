<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-info">
        <p>&copy; {{ currentYear }} {{ aboutMe?.name || 'SiYuan Blog' }}. 基于思源笔记构建</p>
        <p class="footer-links">
          <el-link @click="$router.push('/about')" :underline="false">关于我</el-link>
          <span class="divider">|</span>
          <el-link href="https://github.com/siyuan-note/siyuan" target="_blank" :underline="false">
            思源笔记
          </el-link>
          <span class="divider">|</span>
          <el-link href="https://element-plus.org/" target="_blank" :underline="false">
            Element Plus
          </el-link>
        </p>
      </div>
      
      <div class="footer-stats" v-if="aboutMe">
        <el-text size="small" type="info">
          {{ aboutMe.bio }}
        </el-text>
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAboutStore } from '@/stores/about'
import { storeToRefs } from 'pinia'

// 状态管理
const aboutStore = useAboutStore()
const { aboutMe } = storeToRefs(aboutStore)

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 初始化
onMounted(() => {
  if (!aboutMe.value) {
    aboutStore.fetchAboutMe()
  }
})
</script>

<style scoped>
.app-footer {
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  padding: 24px 20px 16px;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-info p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.divider {
  color: var(--el-text-color-disabled);
}

.footer-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .app-footer {
    padding: 16px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 4px;
  }
  
  .divider {
    display: none;
  }
}
</style> 