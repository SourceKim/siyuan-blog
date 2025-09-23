<template>
  <div class="collapsible-layout">
    <!-- 侧边栏 -->
    <aside 
      class="sidebar" 
      :class="{ 
        'sidebar-collapsed': !sidebarOpen,
        'sidebar-open': sidebarOpen 
      }"
    >
      <!-- 折叠按钮 -->
      <div 
        class="collapse-btn" 
        :class="{ 'collapsed': !sidebarOpen }"
        @click="toggleSidebar"
      >
        <el-icon>
          <ArrowLeft v-if="sidebarOpen" />
          <ArrowRight v-else />
        </el-icon>
      </div>
      
      <div class="sidebar-content" v-show="sidebarOpen">
        <slot name="sidebar" />
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="content">
      <slot name="content" />
    </main>

    <!-- 右侧大纲区域 -->
    <aside class="outline-panel">
      <slot name="outline" />
    </aside>

    <!-- 侧边栏遮罩 (移动端) -->
    <div 
      v-if="sidebarOpen && isMobile" 
      class="sidebar-mask"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// Props
interface Props {
  defaultOpen?: boolean
  sidebarWidth?: string
  collapsedWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true,
  sidebarWidth: '320px',
  collapsedWidth: '60px',
})

// Emits
const emit = defineEmits<{
  'sidebar-toggle': [isOpen: boolean]
  'sidebar-close': []
}>()

// 响应式状态
const sidebarOpen = ref(props.defaultOpen)
const windowWidth = ref(0)

// 计算属性
const isMobile = computed(() => windowWidth.value <= 960)

// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  emit('sidebar-toggle', sidebarOpen.value)
}

const closeSidebar = () => {
  sidebarOpen.value = false
  emit('sidebar-close')
}

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  // 桌面端默认展开，移动端默认收起
  if (windowWidth.value > 960 && !sidebarOpen.value && props.defaultOpen) {
    sidebarOpen.value = true
  } else if (windowWidth.value <= 960) {
    // 移动端自动收起侧边栏
    sidebarOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  windowWidth.value = window.innerWidth
  // 移动端默认收起
  if (windowWidth.value <= 960) {
    sidebarOpen.value = false
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  toggleSidebar,
  closeSidebar,
  sidebarOpen
})
</script>

<style scoped>
/* CSS 变量定义 - 科技感配色 */
.collapsible-layout {
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
  --sidebar-width: v-bind('props.sidebarWidth');
  --collapsed-width: v-bind('props.collapsedWidth');
  --outline-width: 320px;
}

/* 布局容器 */
.collapsible-layout {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  color: var(--tech-text-light);
  font-family: 'Inter', 'Roboto', 'Nunito Sans', sans-serif;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  background: var(--tech-dark-card);
  border-right: 1px solid var(--tech-dark-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  overflow: visible;
  height: 100vh;
  z-index: 1000;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--tech-gradient);
}

/* 桌面端折叠状态 */
.sidebar.sidebar-collapsed {
  width: var(--collapsed-width);
}

.sidebar-content {
  height: 100%;
  white-space: nowrap;
  opacity: 1;
  transition: all 0.3s ease;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 折叠时隐藏内容 */
.sidebar.sidebar-collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

/* 主内容区域 */
.content {
  flex: 1 1 auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  overflow: auto;
  /* 适度放宽内容区左右空间 */
  padding: 0 8px;
  height: 100vh;
}

/* 右侧大纲区域 */
.outline-panel {
  background: var(--tech-dark-card);
  border-left: 1px solid var(--tech-dark-border);
  flex-shrink: 0;
  width: var(--outline-width);
  right: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* 折叠按钮 */
.collapse-btn {
  margin-left: calc(var(--sidebar-width) - 16px);
  margin-top: 40px;
  width: 32px;
  height: 32px;
  background: var(--tech-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  box-shadow: var(--tech-shadow);
  transition: all 0.3s ease;
  border: none;
  z-index: 1001;
  position: fixed;
}

.collapse-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--tech-glow);
}

.collapse-btn.collapsed {
  margin-left: calc(var(--collapsed-width) - 16px);
}

/* 移动端样式 */
@media (max-width: 960px) {
  .collapsible-layout {
    flex-direction: column;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: var(--sidebar-width) !important;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar.sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .content {
    margin-left: 0 !important;
    width: 100%;
  }

  /* 移动端隐藏右侧大纲区域 */
  .outline-panel {
    display: none;
  }
  
  /* 移动端内容区域不需要为大纲留白 */
  .content {
    margin-right: 0 !important;
  }
  
  /* 移动端调整折叠按钮位置 */
  .collapse-btn,
  .collapse-btn.collapsed {
    position: fixed;
    right: 20px;
    top: 20px;
    left: auto;
  }
}

/* 侧边栏遮罩 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 999;
}

/* 焦点可访问性 */
.collapse-btn:focus-visible {
  outline: 2px solid var(--tech-primary);
  outline-offset: 2px;
}

</style>
