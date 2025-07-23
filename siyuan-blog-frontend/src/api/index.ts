import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data
    if (code === 0) {
      return data
    } else {
      throw new Error(msg || '请求失败')
    }
  },
  (error) => {
    const message = error.response?.data?.msg || error.message || '网络错误'
    throw new Error(message)
  }
)

export default api 