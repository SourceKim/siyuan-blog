import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('@/views/PostListView.vue'),
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      component: () => import('@/views/PostDetailView.vue'),
    },
    {
      path: '/notebooks',
      name: 'notebooks',
      component: () => import('@/views/NotebookListView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
  ],
})

export default router 