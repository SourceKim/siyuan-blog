import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
// 优先加载 .env.development，然后加载 .env 作为后备
const envPath = path.resolve(__dirname, '../../.env.development')
console.log(`尝试加载环境变量文件: ${envPath}`)
dotenv.config({ path: envPath })
dotenv.config()

export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'siyuan_blog',
  },
  
  // SiYuan 配置
  siyuan: {
    apiUrl: process.env.SIYUAN_API_URL || 'http://localhost:6806',
    token: process.env.SIYUAN_TOKEN || '',
  },
  
  // JWT 配置已移除
  
  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
} 