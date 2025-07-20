import { Request, Response, NextFunction } from 'express'
import { createError } from './error-handler'

export interface AuthRequest extends Request {
  user?: {
    token: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization
    
    if (!authorization) {
      throw createError('未提供授权令牌', 401, 'UNAUTHORIZED')
    }

    // 支持 Bearer token 或直接 token
    const token = authorization.startsWith('Bearer ') 
      ? authorization.slice(7) 
      : authorization

    if (!token) {
      throw createError('授权令牌格式错误', 401, 'INVALID_TOKEN')
    }

    // 将token信息附加到请求对象
    req.user = { token }
    next()
  } catch (error) {
    next(error)
  }
}

// 可选的认证中间件，即使没有token也能通过
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization
    
    if (authorization) {
      const token = authorization.startsWith('Bearer ') 
        ? authorization.slice(7) 
        : authorization
      
      if (token) {
        req.user = { token }
      }
    }
    
    next()
  } catch (error) {
    next(error)
  }
} 