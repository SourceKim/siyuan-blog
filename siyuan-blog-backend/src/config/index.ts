import { config as dotenvConfig } from 'dotenv'

// 根据环境加载对应的 .env 文件
console.log("🩸  加载环境变量", process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  dotenvConfig({ path: '.env.development' })
} else if (process.env.NODE_ENV === 'production') {
  dotenvConfig({ path: '.env.production' })
} else {
  dotenvConfig()
}

export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // SiYuan 配置
  siyuan: {
    apiUrl: process.env.SIYUAN_API_URL || 'http://localhost:6806',
    token: process.env.SIYUAN_TOKEN || '',
  },
  
  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
} 