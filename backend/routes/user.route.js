import { Router } from 'express'
import {
  signUp,
  login,
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../config/uploader.js'

const router = Router()

router.post('/signup', signUp)
router.post('/login', login)
router.get('/profile', authenticate, getUserProfile)
router.put('/profile', authenticate, upload.single('avatar'), updateUserProfile)

export default router
