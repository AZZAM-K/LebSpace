import { Router } from 'express'
import {
  addStory,
  deleteStory,
  getMyStories,
  getFollowingStories,
  getUserViewedStories,
  addViewer,
} from '../controllers/story.controller.js'
import { upload } from '../config/uploader.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.post('/add-story', upload.single('media'), addStory)
router.get('/my-story', getMyStories)
router.delete('/delete-story/:storyId', deleteStory)

router.get('/following-stories', getFollowingStories)
router.get('/get-viewed-stories/:storyId', getUserViewedStories)
router.post('/add-viewer/:storyId', addViewer)

export default router
