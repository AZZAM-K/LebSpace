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

      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken("")
    setUser(null)
  }

  const getProfile = async () => {
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
      setUser(userData)
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

  const deleteComment = async (commentId) => {
  try {
    const res = await fetch(
      `${backendUrl}/api/comment/delete/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,   // جاهز وفيه Bearer
        }
      }
    );

    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message }
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: "Server error" };
  }
};



  const value = {
    backendUrl,
    token,
    setToken,
    user,
    setUser,
    login,
    signup,
    logout,
    getProfile,
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
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}

export default AppContextProvider
