import { Router } from 'express'
import {
  createChat,
  getChatById,
  getChats,
} from '../controllers/chat.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.post('/create', createChat)
router.get('/', getChats)
router.get('/:id', getChatById)

export default router
