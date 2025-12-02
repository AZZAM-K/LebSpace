import { Router } from 'express'
import {
  sendMessage,
  editMessage,
  deleteMessage,
  markMessagesAsRead,
} from '../controllers/message.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.route('/:id').post(sendMessage).put(editMessage).delete(deleteMessage)

router.post('/:chatId/mark-read', markMessagesAsRead)

export default router
