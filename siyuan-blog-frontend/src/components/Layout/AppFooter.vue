<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-info">
        <p>&copy; {{ footerData?.currentYear || currentYear }} {{ footerData?.siteName || 'SiYuan Blog' }}. {{ footerData?.slogan || '基于思源笔记构建' }}</p>
        <p class="footer-links">
          <template v-if="footerData?.links">
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
          </template>
          <template v-else>
            <!-- 加载中的占位符，保持高度 -->
            <span style="opacity: 0;">加载中...</span>
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
  padding: 16px 20px 12px;
  margin-top: auto;
  position: relative;
  z-index: 10;
  height: auto !important; /* 覆盖 Element Plus 的默认高度 */
  min-height: auto; /* 确保没有最小高度限制 */
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  display: block;
}

.footer-info p {
  margin: 4px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 22px; /* 确保即使没有内容也保持高度 */
}

.divider {
  color: var(--el-text-color-disabled);
}

.footer-stats {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .app-footer {
    padding: 12px;
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