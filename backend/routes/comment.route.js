import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import {
  addComment,
  deleteComment,
  getCommentsByPostId,
  getCountOfComments,
} from "../controllers/comment.controller.js"

const router = Router()

router.post("/add-comment/:postId", authenticate, addComment)
router.get("/get-comments/:postId", getCommentsByPostId)
router.get("/count-comments/:postId", getCountOfComments)
router.delete("/delete/:commentId", authenticate, deleteComment)
export default router
