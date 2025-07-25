import express, { Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import { config } from './config'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/error-handler'
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

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
async function bootstrap() {
  console.log('🚀 启动博客后端服务...')
  
  // 初始化配置文件
  try {
    const fileConfigService = new FileConfigService()
    fileConfigService.initializeAllConfigs()
    console.log('⚙️  配置文件初始化完成')
  } catch (error) {
    console.warn('⚠️  配置文件初始化失败:', error)
  }
  
  // 启动服务器
  const port = config.port
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 服务器运行在端口 ${port}`)
    console.log(`📡 健康检查: http://localhost:${port}/health`)
    console.log(`🌐 API 基础路径: http://localhost:${port}/api`)
    console.log(`🔗 前端地址: http://localhost:3000`)
    console.log(`📁 配置文件: 使用多文件JSON配置`)
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