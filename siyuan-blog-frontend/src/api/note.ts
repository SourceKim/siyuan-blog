import api from './index'
import type { Notebook, Doc, Note, GetDocsRequest, GetDocRequest, GetRecommendedRequest } from './types'

// 笔记相关API
export const noteApi = {
  // 获取所有笔记本
  async getNotebooks(): Promise<Notebook[]> {
    console.log('🌐 API: 调用 getNotebooks')
    const result = await api.post('/notebooks') as Notebook[]
    console.log('📊 API: getNotebooks 返回结果:', result)
    return result
  },

  // 获取文档列表
  async getDocs(params: GetDocsRequest): Promise<Doc[]> {
    console.log('🌐 API: 调用 getDocs, 参数:', params)
    const result = await api.post('/docs', params) as Doc[]
    console.log('📊 API: getDocs 返回结果:', result)
    return result
  },

  // 获取文档内容
  async getDoc(params: GetDocRequest): Promise<Note> {
    console.log('🌐 API: 调用 getDoc, 参数:', params)
    const result = await api.post('/doc', params) as Note
    console.log('📊 API: getDoc 返回结果:', result)
    return result
  },

  // 获取推荐文章
  async getRecommendedDocs(params: GetRecommendedRequest = {}): Promise<Doc[]> {
    console.log('🌐 API: 调用 getRecommendedDocs, 参数:', params)
    const result = await api.post('/recommended', params) as Doc[]
    console.log('📊 API: getRecommendedDocs 返回结果:', result)
    return result
  },
} 