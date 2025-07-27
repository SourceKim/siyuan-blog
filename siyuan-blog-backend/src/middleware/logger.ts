import { Request, Response, NextFunction } from 'express'
import { config } from '../config'

/**
 * 开发环境请求日志中间件
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (config.nodeEnv !== 'development') {
    return next()
  }

  const startTime = Date.now()
  
  // 记录请求信息
  console.group(`🎯 HTTP Request: ${req.method} ${req.originalUrl}`)
  console.log('📍 请求路径:', req.originalUrl)
  console.log('🔄 请求方法:', req.method)
  console.log('📋 请求头:', req.headers)
  console.log('📦 请求体:', req.body)
  console.log('🔗 查询参数:', req.query)
  console.log('⏰ 请求时间:', new Date().toLocaleTimeString())
  console.groupEnd()

  // 拦截响应
  const originalSend = res.send
  const originalJson = res.json

  res.send = function(data) {
    const endTime = Date.now()
    const duration = endTime - startTime

    console.group(`📤 HTTP Response: ${req.method} ${req.originalUrl}`)
    console.log('📊 响应状态:', res.statusCode, res.statusMessage)
    console.log('💬 响应数据:', data)
    console.log('⏱️ 响应时间:', duration + 'ms')
    console.log('⏰ 完成时间:', new Date().toLocaleTimeString())
    console.groupEnd()

    return originalSend.call(this, data)
  }

  res.json = function(data) {
    const endTime = Date.now()
    const duration = endTime - startTime

    console.group(`📤 HTTP Response: ${req.method} ${req.originalUrl}`)
    console.log('📊 响应状态:', res.statusCode, res.statusMessage)
    console.log('💬 响应数据:', data)
    if (data && typeof data === 'object' && 'data' in data) {
      console.log('📈 业务数据量:', Array.isArray(data.data) ? data.data.length : '单个对象')
      console.log('✅ 业务状态:', data.code === 0 ? '成功' : '失败')
      if (data.code !== 0) {
        console.log('💔 错误消息:', data.msg)
      }
    }
    console.log('⏱️ 响应时间:', duration + 'ms')
    console.log('⏰ 完成时间:', new Date().toLocaleTimeString())
    console.groupEnd()

    return originalJson.call(this, data)
  }

  next()
}

/**
 * 错误日志中间件
 */
export function errorLogger(error: any, req: Request, res: Response, next: NextFunction) {
  if (config.nodeEnv === 'development') {
    console.group(`❌ HTTP Error: ${req.method} ${req.originalUrl}`)
    console.log('💥 错误信息:', error.message)
    console.log('📍 错误堆栈:', error.stack)
    console.log('📦 请求体:', req.body)
    console.log('⏰ 错误时间:', new Date().toLocaleTimeString())
    console.groupEnd()
  }

  next(error)
} 