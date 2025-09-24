import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/image/i': {
        target: 'http://43.139.177.115:40061',
        changeOrigin: true,
        // 将 /image/i 前缀改写为 /i 后转发
        rewrite: (path) => path.replace(/^\/image\/i(?=\/)/, '/i')
      },
      '/image/picgo-image': {
        target: 'http://43.139.177.115:9000',
        changeOrigin: true,
        // 将 /image/picgo-image 前缀改写为 /picgo-image 后转发
        rewrite: (path) => path.replace(/^\/image\/picgo-image(?=\/)/, '/picgo-image')
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
  },
}) 