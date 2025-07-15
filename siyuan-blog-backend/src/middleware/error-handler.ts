import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // 默认错误响应
  const statusCode = err.statusCode || 500
  const message = err.message || '服务器内部错误'
  const code = err.code || 'INTERNAL_SERVER_ERROR'

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  })
}

export const createError = (
  message: string, 
  statusCode: number = 500, 
  code?: string
): ApiError => {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  return error
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
} 