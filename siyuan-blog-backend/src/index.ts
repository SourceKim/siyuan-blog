import 'reflect-metadata'
import express, { Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import { config } from './config'
import { AppDataSource } from './database/data-source'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/error-handler'

const app = express()

// 中间件配置
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(compression() as any)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 限流功能已移除

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// 路由配置
setupRoutes(app)

// 错误处理
app.use(errorHandler)

// 启动服务器
async function bootstrap() {
  // 尝试初始化数据库连接（可选）
  try {
    await AppDataSource.initialize()
    console.log('✅ 数据库连接成功')
  } catch (error: any) {
    console.warn('⚠️  数据库连接失败，将在无数据库模式下运行:', error?.message || error)
  }

  // 启动服务器
  const port = config.port
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在端口 ${port}`)
    console.log(`📡 健康检查: http://localhost:${port}/health`)
    console.log(`🌐 API 基础路径: http://localhost:${port}/api`)
    console.log(`🔗 前端地址: http://localhost:3000`)
  })
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('📴 收到 SIGTERM 信号，开始优雅关闭...')
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  } catch (error: any) {
    console.warn('关闭数据库连接时出错:', error?.message || error)
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('📴 收到 SIGINT 信号，开始优雅关闭...')
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  } catch (error: any) {
    console.warn('关闭数据库连接时出错:', error?.message || error)
  }
  process.exit(0)
})

bootstrap() 