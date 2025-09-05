import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 检查是否为开发环境
const isDevelopment = import.meta.env.DEV

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      console.log('📍 完整URL:', `${config.baseURL}${config.url}`)
      console.log('📋 请求头:', config.headers)
      if (config.data) {
        console.log('📦 请求参数:', config.data)
      }
      if (config.params) {
        console.log('🔗 URL参数:', config.params)
      }
      console.log('⏰ 请求时间:', new Date().toLocaleTimeString())
      console.groupEnd()
    }
    return config
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ 请求拦截器错误:', error)
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
      console.log('📍 完整URL:', `${response.config.baseURL}${response.config.url}`)
      console.log('📊 状态码:', response.status, response.statusText)
      console.log('📋 响应头:', response.headers)
      console.log('📦 原始响应数据:', response.data)
      console.log('⏰ 响应时间:', new Date().toLocaleTimeString())
      
      if (response.config.data) {
        try {
          const requestData = JSON.parse(response.config.data)
          console.log('📤 对应的请求参数:', requestData)
        } catch (e) {
          console.log('📤 对应的请求参数:', response.config.data)
        }
      }
      console.groupEnd()
    }

    const { code, msg, data } = response.data
    if (code === 0) {
      if (isDevelopment) {
        console.log(`✨ 返回给组件的数据:`, data)
      }
      return data
    } else {
      if (isDevelopment) {
        console.error(`❌ 业务错误 [${code}]:`, msg)
      }
      throw new Error(msg || '请求失败')
    }
  },
  (error) => {
    if (isDevelopment) {
      console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
      console.log('📍 完整URL:', `${error.config?.baseURL}${error.config?.url}`)
      console.log('📊 错误状态:', error.response?.status, error.response?.statusText)
      console.log('📋 错误响应头:', error.response?.headers)
      console.log('📦 错误响应数据:', error.response?.data)
      console.log('💬 错误信息:', error.message)
      if (error.config?.data) {
        try {
          const requestData = JSON.parse(error.config.data)
          console.log('📤 对应的请求参数:', requestData)
        } catch (e) {
          console.log('📤 对应的请求参数:', error.config.data)
        }
      }
      console.log('⏰ 错误时间:', new Date().toLocaleTimeString())
      console.groupEnd()
    }

    const message = error.response?.data?.msg || error.message || '网络错误'
    throw new Error(message)
  }
)

export default api 