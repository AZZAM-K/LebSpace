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

  const getProfile = async () => {
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
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  )
}

export default AppContextProvider
