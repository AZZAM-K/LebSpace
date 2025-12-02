import { useState } from "react"
import { AppContext } from "./context"

const AppContextProvider = props => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (!storedUser || storedUser === "undefined") {
        return null
      }
      return JSON.parse(storedUser)
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error)
      localStorage.removeItem("user")
      return null
    }
  })

  const getAuthHeaders = (isJson = false) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    }
    if (isJson) headers["Content-Type"] = "application/json"
    return headers
  }

  const getMyStories = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/story/my-story`, {
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const deleteStory = async storyId => {
    try {
      const res = await fetch(
        `${backendUrl}/api/story/delete-story/${storyId}`,
        {
          method: "DELETE",
          headers: { Authorization: token },
        }
      )
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const addStory = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/story/add-story`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const addPost = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/post/add-post`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const editPost = async (postId, formData) => {
    try {
      const res = await fetch(`${backendUrl}/api/post/edit/${postId}`, {
        method: "PUT",
        headers: { Authorization: token },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const deletePost = async postId => {
    try {
      const res = await fetch(`${backendUrl}/api/post/delete/${postId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getPostById = async postId => {
    try {
      const res = await fetch(`${backendUrl}/api/post/get-post/${postId}`, {
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const signup = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }

      localStorage.setItem("token", data.token)
      setToken(data.token)

      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const login = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }

      localStorage.setItem("token", data.token)
      setToken(data.token)
      console.log(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const getViewedStories = async storyId => {
    try {
      const res = await fetch(
        `${backendUrl}/api/story/get-viewed-stories/${storyId}`,
        {
          headers: { Authorization: token },
        }
      )

      const data = await res.json()

      if (!res.ok) return { success: false, message: data.message }

      return {
        success: true,
        viewers: data.viewers,
        count: data.count,
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const addViewer = async storyId => {
    try {
      const res = await fetch(`${backendUrl}/api/story/add-viewer/${storyId}`, {
        method: "POST",
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getUserNotFollowing = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/get-users`, {
        headers: { Authorization: token },
      })
      const json = await res.json()

      if (!res.ok) {
        return {
          success: false,
          message: json.message || "Failed to load suggestions",
          data: [],
        }
      }

      // return only the users array
      return { success: true, data: json.data }
    } catch (error) {
      console.error("Error fetching users:", error)
      return {
        success: false,
        message: error.message || "Failed to load suggestions",
        data: [],
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken("")
    setUser(null)
  }

  const getMyProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.message }
      }

      const userData = data.data || data
      localStorage.setItem("user", JSON.stringify(userData))

      return { success: true, data: userData }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const updateProfile = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: token },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }

      localStorage.setItem("user", JSON.stringify(data))
      setUser(data)

      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getCountOfLikes = async postId => {
    try {
      const res = await fetch(`${backendUrl}/api/post/count-Likes/${postId}`, {
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
  const getCountOfComments = async postId => {
    try {
      const res = await fetch(
        `${backendUrl}/api/comment/count-comments/${postId}`,
        {
          headers: { Authorization: token },
        }
      )
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const addComment = async (postId, content) => {
    try {
      const res = await fetch(
        `${backendUrl}/api/comment/add-comment/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ content }),
        }
      )
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getCommentsByPostId = async postId => {
    try {
      const res = await fetch(
        `${backendUrl}/api/comment/get-comments/${postId}`,
        {
          headers: { Authorization: token },
        }
      )
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const deleteComment = async commentId => {
    try {
      const res = await fetch(`${backendUrl}/api/comment/delete/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      console.error("Error deleting comment:", error)
      return { success: false, message: "Server error" }
    }
  }

  const getFollowers = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/followers`, {
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error getting followers:", res.statusText)
        return {
          success: false,
          message: data.message || "Error getting followers",
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getUserById = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}`, {
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log("Error getting this user", res.statusText)
        return {
          success: false,
          message: data.message || "Error getting user",
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const sendFollowRequest = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/follow-request`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error sending follow request:", res.statusText)
        return {
          success: false,
          message: data.message || "Error sending follow request",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const cancelFollowRequest = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/follow-request`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error canceling follow request:", res.statusText)
        return {
          success: false,
          message: data.message || "Error canceling follow request",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const declineFollowRequest = async id => {
    try {
      const res = await fetch(
        `${backendUrl}/api/users/${id}/follow-request/decline`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        console.log("Error declining follow request:", res.statusText)
        return {
          success: false,
          message: data.message || "Error declining follow request",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const acceptFollowRequest = async id => {
    try {
      const res = await fetch(
        `${backendUrl}/api/users/${id}/follow-request/accept`,
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        console.log("Error accepting follow request:", res.statusText)
        return {
          success: false,
          message: data.message || "Error accepting follow request",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getNotifications = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/notifications`, {
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log("Error getting notifications:", res.statusText)
        return {
          success: false,
          message: data.message || "Error getting notifications",
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const deleteNotification = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log("Error deleting notification:", res.statusText)
        return {
          success: false,
          message: data.message || "Error deleting notification",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const clearNotifications = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log("Error clearing notifications:", res.statusText)
        return {
          success: false,
          message: data.message || "Error clearing notifications",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const unfollowUser = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/follow`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error unFollowing user:", res.statusText)
        return {
          success: false,
          message: data.message || "Error unFollowing user",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getSettingsData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/settings`, {
        headers: {
          Authorization: token,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        console.log("Error getting settings data:", res.statusText)
        return {
          success: false,
          message: data.message || "Error getting settings data",
        }
      }

      return { success: true, data }
    } catch (error) {
      console.log("Error in getSettingsData:", error)
      return { success: false, message: error.message }
    }
  }

  const togglePrivacy = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/privacy`, {
        method: "PUT",
        headers: {
          Authorization: token,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        console.log("Error toggling privacy:", res.statusText)
        return {
          success: false,
          message: data.message || "Error toggling privacy",
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const changePassword = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error changing password:", res.statusText)
        return {
          success: false,
          message: data.message || "Error changing password",
        }
      }
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const blockUser = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/block`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error blocking user:", res.statusText)
        return {
          success: false,
          message: data.message || "Error blocking user",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const unblockUser = async id => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${id}/unblock`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log("Error unblocking user:", res.statusText)
        return {
          success: false,
          message: data.message || "Error unblocking user",
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
  const getFollowingStories = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/story/following-stories`, {
        headers: { Authorization: token },
      })
      const data = await res.json()

      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data: data.stories }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getAllPostPriorityOfFollowing = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/post/get-all-posts`, {
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to fetch posts",
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getTaggedPosts = async userId => {
    try {
      const res = await fetch(
        `${backendUrl}/api/post/get-tagged-posts/${userId}`,
        {
          headers: { Authorization: token },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to fetch tagged posts",
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getSavedPostsForEachUser = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/post/get-saved-posts`, {
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Failed to fetch saved posts",
        }
      }
      return { success: true, data: data.posts }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
  const addLikeAndRemoveLike = async postId => {
    try {
      const res = await fetch(`${backendUrl}/api/post/like/${postId}`, {
        method: "POST",
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
  const savePost = async postId => {
    try {
      const res = await fetch(`${backendUrl}/api/users/save-post/${postId}`, {
        method: "POST",
        headers: { Authorization: token },
      })
      const data = await res.json()
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const getSavedPostsForUser = async userId => {
    try {
      const res = await fetch(`${backendUrl}/api/users/saved-posts/${userId}`, {
        headers: { Authorization: token },
      })
      console.log(res)

      const data = await res.json()
      console.log(data)
      if (!res.ok) return { success: false, message: data.message }
      return { success: true, data: data.savedPosts } // <— لازم تطابق المفتاح
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const searchUsers = async query => {
    try {
      const res = await fetch(
        `${backendUrl}/api/users/search?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: token } }
      )

      const data = await res.json()

      if (!res.ok) {
        console.error("Backend returned error:", data.message) // ← log
        return { success: false, message: data.message }
      }

      return { success: true, data: data.users || [] }
    } catch (error) {
      console.error("Fetch error:", error) // ← log
      return { success: false, message: error.message }
    }
  }

  const value = {
    backendUrl,
    token,
    setToken,
    user,
    setUser,
    login,
    signup,
    logout,
    getMyProfile,
    updateProfile,
    addStory,
    getMyStories,
    addPost,
    editPost,
    deletePost,
    getPostById,
    deleteStory,
    addLikeAndRemoveLike,
    getCountOfLikes,
    addComment,
    getCommentsByPostId,
    getCountOfComments,
    deleteComment,
    getFollowers,
    getUserById,
    sendFollowRequest,
    cancelFollowRequest,
    acceptFollowRequest,
    declineFollowRequest,
    unfollowUser,
    getNotifications,
    deleteNotification,
    clearNotifications,
    getSettingsData,
    togglePrivacy,
    changePassword,
    blockUser,
    unblockUser,
    getFollowingStories,
    getViewedStories,
    addViewer,
    getUserNotFollowing,
    getAllPostPriorityOfFollowing,
    getTaggedPosts,
    getSavedPostsForEachUser,
    savePost,
    getSavedPostsForUser,
    searchUsers,
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}

export default AppContextProvider
