<template>
  <div class="home-view">
    <el-container>
      <el-header>
        <h1>SiYuan Blog</h1>
        <nav>
          <el-menu mode="horizontal" :default-active="$route.path" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/posts">文章</el-menu-item>
            <el-menu-item index="/notebooks">笔记本</el-menu-item>
            <el-menu-item index="/about">关于</el-menu-item>
          </el-menu>
        </nav>
      </el-header>
      
      <el-main>
        <div class="hero-section">
          <h2>将思源笔记转换为个人博客</h2>
          <p>轻松展示您的知识和思考</p>
          <el-button type="primary" size="large" @click="$router.push('/posts')">
            开始阅读
          </el-button>
        </div>

        <div class="recent-posts">
          <h3>最新文章</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="post in recentPosts" :key="post.id">
              <el-card class="post-card" @click="$router.push(`/post/${post.id}`)">
                <h4>{{ post.title }}</h4>
                <p>{{ post.excerpt }}</p>
                <div class="post-meta">
                  <el-tag size="small">{{ post.notebook }}</el-tag>
                  <span>{{ post.date }}</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Post {
  id: string
  title: string
  excerpt: string
  notebook: string
  date: string
}

const recentPosts = ref<Post[]>([])

onMounted(() => {
  // TODO: 从 API 获取最新文章
  recentPosts.value = [
    {
      id: '1',
      title: '欢迎使用 SiYuan Blog',
      excerpt: '这是一个基于思源笔记的博客系统...',
      notebook: '示例笔记本',
      date: '2024-01-01'
    }
  ]
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
}

.hero-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  color: var(--el-text-color-regular);
  margin-bottom: 2rem;
}

.recent-posts {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.post-card {
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}
</style> 