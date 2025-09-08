<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-info">
        <p>&copy; {{ footerData?.currentYear || currentYear }} {{ footerData?.siteName || 'SiYuan Blog' }}. {{ footerData?.slogan || '基于思源笔记构建' }}</p>
        <p class="footer-links" v-if="footerData?.links">
          <template v-for="(link, index) in footerData.links" :key="link.url">
            <el-link 
              v-if="link.external"
              :href="link.url" 
              target="_blank" 
              :underline="false"
            >
              {{ link.text }}
            </el-link>
            <el-link 
              v-else
              @click="$router.push(link.url)" 
              :underline="false"
            >
              {{ link.text }}
            </el-link>
            <span v-if="index < footerData.links.length - 1" class="divider">|</span>
          </template>
        </p>
      </div>
      
      <div class="footer-stats" v-if="footerData?.bio">
        <el-text size="small" type="info">
          {{ footerData.bio }}
        </el-text>
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import { storeToRefs } from 'pinia'

// 状态管理
const layoutStore = useLayoutStore()
const { footerData } = storeToRefs(layoutStore)

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 初始化
onMounted(() => {
  if (!footerData.value) {
    layoutStore.fetchLayoutData()
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