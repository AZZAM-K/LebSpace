import { Router } from 'express'
import {
  addLikeAndRemoveLike,
  addPost,
  deletePost,
  editPost,
  getAllPostsPriorityForFollowing,
  getCountOfLikes,
  getPostById,
} from '../controllers/post.controller.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../config/uploader.js'

const router = Router()

router.post('/add-post', authenticate, upload.single('media'), addPost)
router.put('/edit/:postId', authenticate, upload.single('media'), editPost)
router.delete('/delete/:postId', authenticate, deletePost)
router.get('/get-post/:postId', authenticate, getPostById)
router.post('/like/:postId', authenticate, addLikeAndRemoveLike)
router.get('/count-Likes/:postId', getCountOfLikes)
router.get('/get-all-posts', authenticate, getAllPostsPriorityForFollowing)

export default router
