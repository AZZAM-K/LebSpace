import { Router } from 'express'
import {
  deleteNotification,
  getNotifications,
  clearNotifications,
} from '../controllers/notification.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getNotifications)
router.delete('/:id', authenticate, deleteNotification)
router.delete('/', authenticate, clearNotifications)

export default router
