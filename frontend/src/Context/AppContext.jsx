import { useState } from 'react'
import { AppContext } from './context'

const AppContextProvider = props => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  const signup = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) {
        console.log('Signup error:', data.message)
        return { success: false, message: data.message }
      }

      localStorage.setItem('token', data.token)
      setToken(data.token)

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          username: data.username,
          fullName: data.fullName,
          bio: data.bio,
          email: data.email,
          img: data.img,
        })
      )
      setUser({
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        email: data.email,
        img: data.img,
      })

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const login = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.log('Login error data:', data)
        return { success: false, message: data.message || 'Login failed' }
      }

      localStorage.setItem('token', data.token)
      setToken(data.token)

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          username: data.username,
          fullName: data.fullName,
          bio: data.bio,
          email: data.email,
          img: data.img,
        })
      )
      setUser({
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        email: data.email,
        img: data.img,
      })

      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
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
        console.log('Error getting profile:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error getting profile',
        }
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const updateProfile = async formData => {
    try {
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: token,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        console.log('Error updating profile:', data.message)
        return {
          success: false,
          message: data.message || 'Error updating profile',
        }
      }

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          username: data.username,
          fullName: data.fullName,
          bio: data.bio,
          email: data.email,
          img: data.img,
        })
      )
      setUser({
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        email: data.email,
        img: data.img,
      })

      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
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
        console.log('Error getting followers:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error getting followers',
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
        console.log('Error getting this user', res.statusText)
        return {
          success: false,
          message: data.message || 'Error getting user',
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
        method: 'POST',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error sending follow request:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error sending follow request',
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
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error canceling follow request:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error canceling follow request',
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
          method: 'POST',
          headers: {
            Authorization: token,
          },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        console.log('Error declining follow request:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error declining follow request',
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
          method: 'POST',
          headers: {
            Authorization: token,
          },
        }
      )
      const data = await res.json()
      if (!res.ok) {
        console.log('Error accepting follow request:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error accepting follow request',
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
        console.log('Error getting notifications:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error getting notifications',
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
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log('Error deleting notification:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error deleting notification',
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
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        console.log('Error clearing notifications:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error clearing notifications',
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
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error unFollowing user:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error unFollowing user',
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
        console.log('Error getting settings data:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error getting settings data',
        }
      }

      return { success: true, data }
    } catch (error) {
      console.log('Error in getSettingsData:', error)
      return { success: false, message: error.message }
    }
  }

  const togglePrivacy = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/privacy`, {
        method: 'PUT',
        headers: {
          Authorization: token,
        },
      })

      const data = await res.json()
      if (!res.ok) {
        console.log('Error toggling privacy:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error toggling privacy',
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error changing password:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error changing password',
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
        method: 'POST',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error blocking user:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error blocking user',
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
        method: 'POST',
        headers: {
          Authorization: token,
        },
      })
      const data = await res.json()
      if (!res.ok) {
        console.log('Error unblocking user:', res.statusText)
        return {
          success: false,
          message: data.message || 'Error unblocking user',
        }
      }
      return { success: true }
    } catch (error) {
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
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}

export default AppContextProvider
