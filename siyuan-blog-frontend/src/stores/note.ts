import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { noteApi } from '@/api/note'
import type { Notebook, Doc, Note } from '@/api/types'

export const useNoteStore = defineStore('note', () => {
  // 状态
  const notebooks = ref<Notebook[]>([])
  const currentNotebook = ref<Notebook | null>(null)
  const docs = ref<Doc[]>([])
  const blogDocumentTree = ref<Doc[]>([])
  const currentDoc = ref<Doc | null>(null)
  const currentNote = ref<Note | null>(null)
  const recommendedDocs = ref<Doc[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const hasNotebooks = computed(() => notebooks.value.length > 0)
  const hasDocs = computed(() => docs.value.length > 0)
  const hasBlogDocumentTree = computed(() => blogDocumentTree.value.length > 0)
  const hasRecommendedDocs = computed(() => recommendedDocs.value.length > 0)



  // 获取子文档
  const fetchSubDocs = async (parentDoc: Doc): Promise<Doc[]> => {
    console.log('🏪 store.fetchSubDocs 被调用')
    console.log('📁 父文档:', parentDoc)
    
    try {
      loading.value = true
      error.value = null
      
      if (!currentNotebook.value) {
        console.warn('❌ store: 没有当前笔记本')
        return []
      }
      
      console.log('📚 store: 当前笔记本ID:', currentNotebook.value.id)
      console.log('📂 store: 请求路径:', parentDoc.path)
      
      const subDocs = await noteApi.getDocs({
        notebook: currentNotebook.value.id,
        path: parentDoc.path
      })
      
      console.log('🎯 store: API返回的子文档:', subDocs)
      console.log('📊 store: 返回的子文档数量:', subDocs?.length || 0)
      
      return subDocs
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取子文档失败'
      console.error('💥 store: 获取子文档失败:', err)
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
      
      // 先清空当前状态，避免触发不必要的大纲请求
      currentDoc.value = null
      currentNote.value = null
      
      console.log('🎯 开始获取文档内容:', doc.id, doc.name)
      
      // 获取文档内容
      const noteContent = await noteApi.getDoc({ id: doc.id })
      
      console.log('✅ 文档内容获取成功，设置当前文档')
      
      // 只有文档内容获取成功后，才设置 currentDoc，这样可以避免并发的大纲请求
      currentNote.value = noteContent
      currentDoc.value = doc
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文档内容失败'
      console.error('❌ 获取文档内容失败:', err)
      
      // 出错时清空状态
      currentDoc.value = null
      currentNote.value = null
    } finally {
      loading.value = false
    }
  }

  // 根据文档 ID 选择文档（用于路由恢复）
  const selectDocById = async (docId: string) => {
    try {
      loading.value = true
      error.value = null

      // 先获取文档内容
      const noteContent = await noteApi.getDoc({ id: docId })

      // 在已有的文档树中尝试找到对应的文档元信息
      const findInTree = (nodes: Doc[]): Doc | null => {
        for (const n of nodes) {
          if ((n as Doc).id === docId) return n as Doc
          if ((n as any).children && Array.isArray((n as any).children)) {
            const found = findInTree((n as any).children as Doc[])
            if (found) return found
          }
        }
        return null
      }

      const foundDoc = findInTree(blogDocumentTree.value)

      // 尝试从内容中提取标题（优先第一个标题块/heading）
      const extractTitleFromContent = (html: string): string | null => {
        try {
          if (!html) return null
          const container = document.createElement('div')
          container.innerHTML = html
          // 优先思源结构的标题块
          const headingNode = container.querySelector('[data-type="NodeHeading"]') as HTMLElement | null
          if (headingNode) {
            const editable = headingNode.querySelector('div[contenteditable="true"]') as HTMLElement | null
            const text = (editable?.innerText || '').trim()
            if (text) return text
          }
          // 退化：若已有语义化 h1/h2（可能来自后端或其他来源）
          const h = container.querySelector('h1, h2, h3') as HTMLElement | null
          if (h) {
            const text = (h.innerText || '').trim()
            if (text) return text
          }
          return null
        } catch {
          return null
        }
      }

      const titleFromContent = extractTitleFromContent(noteContent.content)

      // 构造用于展示的 Doc：
      // 1) 若树中存在，优先采用内容标题覆盖 name（避免显示文件名/扩展名）
      // 2) 若不存在，构造占位 Doc，并尽量用内容标题或从路径推断文件名
      const selectedDoc: Doc = foundDoc 
        ? { 
            ...foundDoc, 
            name: (titleFromContent && titleFromContent.trim()) || foundDoc.name 
          }
        : {
            id: docId,
            path: noteContent.path || '',
            name: (titleFromContent && titleFromContent.trim())
              || (noteContent.path ? (noteContent.path.split('/').pop() || '').replace(/\?.*$/, '') : '')
              || '未命名',
            sort: 0,
            icon: '',
            mtime: 0,
            ctime: 0,
            hMtime: '',
            hCtime: '',
            subFileCount: 0
          }

      currentNote.value = noteContent
      currentDoc.value = selectedDoc
    } catch (err) {
      error.value = err instanceof Error ? err.message : '通过ID获取文档失败'
      console.error('❌ 通过ID获取文档失败:', err)
      currentDoc.value = null
      currentNote.value = null
    } finally {
      loading.value = false
    }
  }

  // 获取推荐文章
  const fetchRecommendedDocs = async (count: number = 10) => {
    try {
      loading.value = true
      error.value = null
      recommendedDocs.value = await noteApi.getRecommendedDocs({ count })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取推荐文章失败'
      console.error('获取推荐文章失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取博客文档树
  const fetchBlogDocumentTree = async () => {
    try {
      loading.value = true
      error.value = null
      blogDocumentTree.value = await noteApi.getBlogDocumentTree()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取博客文档树失败'
      console.error('获取博客文档树失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 清空状态
  const clearState = () => {
    notebooks.value = []
    currentNotebook.value = null
    docs.value = []
    blogDocumentTree.value = []
    currentDoc.value = null
    currentNote.value = null
    recommendedDocs.value = []
    error.value = null
  }

  return {
    // 状态
    notebooks,
    currentNotebook,
    docs,
    blogDocumentTree,
    currentDoc,
    currentNote,
    recommendedDocs,
    loading,
    error,
    
    // 计算属性
    hasNotebooks,
    hasDocs,
    hasBlogDocumentTree,
    hasRecommendedDocs,
    
    // 方法
    fetchSubDocs,
    selectDoc,
    fetchRecommendedDocs,
    fetchBlogDocumentTree,
    selectDocById,
    clearState,
  }
}) 