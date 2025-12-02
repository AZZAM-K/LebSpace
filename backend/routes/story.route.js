// routes/storyRoutes.js
import express from "express"
import {
  addStory,
  deleteStory,
  getMyStories,
  getFollowingStories,
  getUserViewedStories,
  addViewer,
} from "../controllers/story.controller.js"
import { upload } from "../config/uploader.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

router.post("/add-story", authenticate, upload.single("media"), addStory)
router.get("/my-story", authenticate, getMyStories)
router.delete("/delete-story/:storyId", authenticate, deleteStory)

router.get("/following-stories", authenticate, getFollowingStories)
router.get("/get-viewed-stories/:storyId", authenticate, getUserViewedStories)
router.post("/add-viewer/:storyId", authenticate, addViewer)

export default router
