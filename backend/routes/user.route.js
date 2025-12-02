import { Router } from "express"
import {
  signUp,
  login,
  getMyProfile,
  updateProfile,
  getFollowers,
  getUserById,
  acceptFollowRequest,
  declineFollowRequest,
  unfollowUser,
  sendFollowRequest,
  cancelFollowRequest,
  blockUser,
  unblockUser,
  changePassword,
  togglePrivacy,
  getSettingsData,
  getAllUsersNotFollowing,
  saveUnsavePost,
  getSavedPostsForUser,
  searchUsers,
} from "../controllers/user.controller.js"
import { authenticate } from "../middleware/auth.js"
import { upload } from "../config/uploader.js"

const router = Router()

router.post("/signup", signUp)
router.post("/login", login)

router
  .route("/profile")
  .get(authenticate, getMyProfile)
  .put(authenticate, upload.single("avatar"), updateProfile)

router.get('/settings', authenticate, getSettingsData)
router.put('/change-password', authenticate, changePassword)
router.put('/privacy', authenticate, togglePrivacy)
router.delete('/delete', authenticate, deleteAccount)

router.get("/get-users", authenticate, getAllUsersNotFollowing)
router.get("/search", authenticate, searchUsers)

router.get("/:id/followers", authenticate, getFollowers)
router.get("/:id", authenticate, getUserById)

router.post("/:id/follow-request", authenticate, sendFollowRequest)
router.delete("/:id/follow-request", authenticate, cancelFollowRequest)
router.post("/:id/follow-request/accept", authenticate, acceptFollowRequest)
router.post("/:id/follow-request/decline", authenticate, declineFollowRequest)

router.delete("/:id/follow", authenticate, unfollowUser)
router.post("/:id/block", authenticate, blockUser)
router.post("/:id/unblock", authenticate, unblockUser)
router.post("/save-post/:postId", authenticate, saveUnsavePost)
router.get("/saved-posts/:userId", authenticate, getSavedPostsForUser)

export default router
