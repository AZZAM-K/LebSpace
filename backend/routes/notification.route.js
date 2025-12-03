import { Router } from 'express'
import {
  deleteNotification,
  getNotifications,
  clearNotifications,
} from '../controllers/notification.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/', getNotifications)
router.delete('/', clearNotifications)
router.delete('/:id', deleteNotification)

export default router
