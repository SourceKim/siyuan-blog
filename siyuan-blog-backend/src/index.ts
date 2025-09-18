import express, { Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import path from 'path'
import fs from 'fs'
import { config } from './config'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/error-handler'
import { requestLogger, errorLogger } from './middleware/logger'
import { FileConfigService } from './config/file-config.service'

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
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 开发环境日志中间件
app.use(requestLogger)

// 静态文件服务（统一从 dist/assets 提供）
const assetsPath = path.join(__dirname, 'assets')
app.use('/assets', express.static(assetsPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp')
    }
  }
}))

// 静态文件列表路由（统一提供，便于排查）
app.get('/assets', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(assetsPath)
    res.json({
      message: '静态文件列表',
      assetsPath,
      files: files.map((file: string) => ({ name: file, url: `/assets/${file}` }))
    })
  } catch (error) {
    res.status(500).json({ error: '无法读取静态文件目录' })
  }
})

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  })
})

// 路由设置
setupRoutes(app)

// 错误日志中间件
app.use(errorLogger)

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
async function bootstrap() {
  console.log('🚀 启动博客后端服务...')
  
  // 配置文件初始化逻辑已移除，直接启动
  
  // 启动服务器
  const port = config.port
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 服务器运行在端口 ${port}`)
    console.log(`📡 健康检查: http://localhost:${port}/health`)
    console.log(`🌐 API 基础路径: http://localhost:${port}/api`)
    console.log(`📁 静态文件服务: http://localhost:${port}/assets`)
    console.log(`🖼️  头像访问: http://localhost:${port}/assets/image.webp`)
    if (config.nodeEnv === 'development') {
      console.log(`📋 静态文件列表: http://localhost:${port}/assets`)
    }
    console.log(`🔗 前端地址: http://localhost:3000`)
    console.log(`📁 配置文件: 使用多文件JSON配置`)
    if (config.nodeEnv === 'development') {
      console.log(`🔍 开发模式: 已启用详细API日志`)
    }
  })
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('📴 收到 SIGTERM 信号，开始优雅关闭...')
  process.exit(0)
})

bootstrap().catch(error => {
  console.error('启动应用失败:', error)
  process.exit(1)
}) 