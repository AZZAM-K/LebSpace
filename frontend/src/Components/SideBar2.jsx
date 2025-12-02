import React, { useState, useEffect, useContext, useCallback } from 'react'
import { AppContext } from '../Context/context'
import { Link } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'

const SideBar2 = () => {
  const { getUserNotFollowing, sendFollowRequest, user } = useContext(AppContext)
  
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [followingStatus, setFollowingStatus] = useState({})

  // Load suggested users
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true)
        setError('')
        const result = await getUserNotFollowing()
        
        if (result.success) {
          // Limit to 6 suggestions and shuffle them
          const shuffled = result.data
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
          setSuggestions(shuffled)
        } else {
          setError(result.message || 'Failed to load suggestions')
        }
      } catch (err) {
        setError(err.message || 'Error loading suggestions')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadSuggestions()
    }
  }, [getUserNotFollowing, user])

  // Handle follow user
  const handleFollowUser = useCallback(
    async userId => {
      try {
        setFollowingStatus(prev => ({ ...prev, [userId]: 'loading' }))
        const result = await sendFollowRequest(userId)
        
        if (result.success) {
          setFollowingStatus(prev => ({ ...prev, [userId]: 'following' }))
          // Remove user from suggestions after following
          setTimeout(() => {
            setSuggestions(prev => prev.filter(u => u._id !== userId))
          }, 600)
        } else {
          setFollowingStatus(prev => ({ ...prev, [userId]: 'error' }))
        }
      } catch (err) {
        setFollowingStatus(prev => ({ ...prev, [userId]: 'error' }))
      }
    },
    [sendFollowRequest]
  )

  const visibleUsers = showMore ? suggestions : suggestions.slice(0, 5)

  return (
    <div
      className='
        hidden lg:block
        w-[300px]
        h-screen
        fixed
        right-0
        top-0
        bg-black/70
        backdrop-blur-xl
        p-5
        border-l border-white/10
        shadow-xl
        overflow-y-auto
        text-white
        mt-16
        z-20
      '
    >
      {/* Header */}
      <h2 className='text-2xl font-bold mb-6 text-white tracking-wide'>
        Suggested for you
      </h2>

      {/* Loading State */}
      {loading ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='w-8 h-8 animate-spin text-orange-500 mb-2' />
          <p className='text-gray-400 text-sm'>Loading suggestions...</p>
        </div>
      ) : error ? (
        <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300'>
          {error}
        </div>
      ) : suggestions.length === 0 ? (
        <div className='p-4 text-center text-gray-400 text-sm'>
          No more suggestions available
        </div>
      ) : (
        <>
          {/* Suggestions List */}
          <div className='space-y-4'>
            {visibleUsers.map(suggestedUser => {
              const isFollowing = followingStatus[suggestedUser._id] === 'following'
              const isLoading = followingStatus[suggestedUser._id] === 'loading'

              return (
                <div
                  key={suggestedUser._id}
                  className='flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition duration-200'
                >
                  {/* User Info */}
                  <Link
                    to={`/users/${suggestedUser._id}`}
                    className='flex items-center gap-3 flex-1 hover:opacity-80 transition'
                  >
                    <img
                      src={
                        suggestedUser?.profilePicture?.url ||
                        suggestedUser?.img ||
                        `https://ui-avatars.com/api/?name=${suggestedUser?.username}&background=random`
                      }
                      alt={suggestedUser.username}
                      className='w-12 h-12 rounded-full object-cover border border-orange-500/40 shadow-lg'
                    />
                    <div>
                      <p className='font-semibold text-sm'>
                        {suggestedUser.fullName || suggestedUser.username}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        @{suggestedUser.username}
                      </p>
                    </div>
                  </Link>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollowUser(suggestedUser._id)}
                    disabled={isFollowing || isLoading}
                    className={`px-4 py-1.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md flex items-center gap-1 whitespace-nowrap ${
                      isFollowing
                        ? 'bg-gray-600 text-white cursor-default'
                        : isLoading
                        ? 'bg-orange-500/50 text-black'
                        : 'bg-[#F65C21] text-black hover:opacity-90'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className='animate-spin' />
                        <span>...</span>
                      </>
                    ) : isFollowing ? (
                      <>
                        <UserPlus size={14} />
                        <span>Following</span>
                      </>
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* See More/Less Button */}
          {suggestions.length > 5 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className='w-full text-center mt-6 text-orange-400 hover:text-orange-300 font-semibold transition py-2 rounded-lg hover:bg-white/5'
            >
              {showMore ? '↑ See Less' : '↓ See More'}
            </button>
          )}
        </>
      )}

      {/* Footer */}
      <hr className='border-white/10 my-6' />
      <div className='space-y-2 text-gray-400 text-xs text-center'>
        <p>© 2025 LebSpace</p>
        <p className='text-gray-500'>All rights reserved</p>
      </div>
    </div>
  )
}

export default SideBar2