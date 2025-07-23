import api from './index'
import type { Notebook, Doc, Note, GetDocsRequest, GetDocRequest } from './types'

// 笔记相关API
export const noteApi = {
  // 获取所有笔记本
  async getNotebooks(): Promise<Notebook[]> {
    return api.post('/notebooks')
  },

  // 获取文档列表
  async getDocs(params: GetDocsRequest): Promise<Doc[]> {
    return api.post('/docs', params)
  },

  // 获取文档内容
  async getDoc(params: GetDocRequest): Promise<Note> {
    return api.post('/doc', params)
  },
} 