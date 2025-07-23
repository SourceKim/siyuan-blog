import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { noteApi } from '@/api/note'
import type { Notebook, Doc, Note } from '@/api/types'

export const useNoteStore = defineStore('note', () => {
  // 状态
  const notebooks = ref<Notebook[]>([])
  const currentNotebook = ref<Notebook | null>(null)
  const docs = ref<Doc[]>([])
  const currentDoc = ref<Doc | null>(null)
  const currentNote = ref<Note | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const hasNotebooks = computed(() => notebooks.value.length > 0)
  const hasDocs = computed(() => docs.value.length > 0)

  // 获取所有笔记本
  const fetchNotebooks = async () => {
    try {
      loading.value = true
      error.value = null
      notebooks.value = await noteApi.getNotebooks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取笔记本失败'
      console.error('获取笔记本失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 选择笔记本
  const selectNotebook = async (notebook: Notebook) => {
    try {
      loading.value = true
      error.value = null
      currentNotebook.value = notebook
      currentDoc.value = null
      currentNote.value = null
      
      // 获取该笔记本的文档列表
      docs.value = await noteApi.getDocs({ notebook: notebook.id })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文档列表失败'
      console.error('获取文档列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取子文档
  const fetchSubDocs = async (parentDoc: Doc) => {
    try {
      loading.value = true
      error.value = null
      
      if (!currentNotebook.value) return
      
      const subDocs = await noteApi.getDocs({
        notebook: currentNotebook.value.id,
        path: parentDoc.path
      })
      
      return subDocs
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取子文档失败'
      console.error('获取子文档失败:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // 选择文档
  const selectDoc = async (doc: Doc) => {
    try {
      loading.value = true
      error.value = null
      currentDoc.value = doc
      
      // 获取文档内容
      currentNote.value = await noteApi.getDoc({ id: doc.id })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文档内容失败'
      console.error('获取文档内容失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 清空状态
  const clearState = () => {
    notebooks.value = []
    currentNotebook.value = null
    docs.value = []
    currentDoc.value = null
    currentNote.value = null
    error.value = null
  }

  return {
    // 状态
    notebooks,
    currentNotebook,
    docs,
    currentDoc,
    currentNote,
    loading,
    error,
    
    // 计算属性
    hasNotebooks,
    hasDocs,
    
    // 方法
    fetchNotebooks,
    selectNotebook,
    fetchSubDocs,
    selectDoc,
    clearState,
  }
}) 