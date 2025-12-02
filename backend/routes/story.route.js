// routes/storyRoutes.js
import { Router } from 'express'
import {
  addStory,
  deleteStory,
  getMyStories,
} from '../controllers/story.controller.js'
import { upload } from '../config/uploader.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/add-story', authenticate, upload.single('media'), addStory)
router.get('/my-story', authenticate, getMyStories)
router.delete('/delete-story/:storyId', authenticate, deleteStory)

export default router
