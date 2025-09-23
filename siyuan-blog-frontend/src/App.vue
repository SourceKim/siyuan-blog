<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App 根组件
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  overscroll-behavior: none;
}

#app {
  min-height: 100vh;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition: background-color 0.3s, color 0.3s;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}

/* 暗黑模式过渡 */
.dark {
  color-scheme: dark;
}

/* Element Plus 组件样式覆盖 */
.el-menu--horizontal {
  border-bottom: none !important;
}

.el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
}

/* 代码高亮样式 */
.hljs {
  color: var(--el-text-color-primary) !important;
}
</style> 