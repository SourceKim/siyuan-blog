import { Router } from 'express'
import { NoteController } from './note.controller'

const router = Router()
const noteController = new NoteController()

// 获取所有笔记本
router.post('/notebooks', (req, res) => noteController.getNotebooks(req, res))

// 获取文档列表
router.post('/docs', (req, res) => noteController.getDocs(req, res))

// 获取文档内容
router.post('/doc', (req, res) => noteController.getDoc(req, res))

// 获取文档大纲
router.post('/outline', (req, res) => noteController.getDocOutline(req, res))

// 获取推荐文章
router.post('/recommended', (req, res) => noteController.getRecommendedDocs(req, res))

// 获取博客文档树
router.get('/blog-tree', (req, res) => noteController.getBlogDocumentTree(req, res))

export { router as noteRoutes }
