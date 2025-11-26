import React, { useState, useEffect, useContext, useCallback } from "react"
import { AppContext } from "../Context/context"
import { Link } from "react-router-dom"
import { Flame, Send } from "lucide-react"

const CloseIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-6 h-6'
  >
    <line x1='18' y1='6' x2='6' y2='18'></line>
    <line x1='6' y1='6' x2='18' y2='18'></line>
  </svg>
)

const ViewersIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className='w-4 h-4'
  >
    <path d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' />
    <path
      fillRule='evenodd'
      d='M1.323 11.45L2.57 12a1 1 0 0 0 .86 1H21.57a1 1 0 0 0 .86-1l1.247-.55C22.25 10.95 19.33 5 12 5S1.75 10.95 1.323 11.45ZM21.57 13H2.57l1.095 1.05a12.872 12.872 0 0 0 16.66 0l1.095-1.05Z'
      clipRule='evenodd'
    />
  </svg>
)

const UpArrowIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4'
  >
    <polyline points='12 19 12 5'></polyline>
    <polyline points='5 12 12 5 19 12'></polyline>
  </svg>
)

const StoryOverlay = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  user,
  token,
}) => {
  const { deleteStory } = useContext(AppContext)

  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const duration = 5000
  const story = stories[currentIndex]

  if (!user || !token) {
    return <div style={{ color: "white" }}>Loading...</div>
  }

  useEffect(() => {
    setProgress(0)
    let interval
    if (story) {
      const updateIntervalMs = 50
      const progressStep = 100 / (duration / updateIntervalMs)

      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressStep
          if (newProgress >= 100) {
            clearInterval(interval)
            onNext()
            return 100
          }
          return newProgress
        })
      }, updateIntervalMs)
    }
    return () => clearInterval(interval)
  }, [currentIndex, duration, onNext, story])

  if (!story) return null

  const formatTime = createdAt => {
    const now = new Date()
    const past = new Date(createdAt)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const isCurrentUserStory =
    story?.user?._id?.toString() === user?._id?.toString()
  const viewCount = story.viewers?.length || 0

  const handleDelete = async () => {
    const result = await deleteStory(story._id)
    if (result.success) {
      setMenuOpen(false)
      onClose()
    } else {
      alert("Failed to delete story: " + result.message)
    }
  }
  console.log("Story user:", story?.user?._id)
  console.log("Logged user:", user?._id)
  console.log(
    "Same user?",
    story?.user?._id?.toString() === user?._id?.toString()
  )

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center bg-black/90'>
      <div className='relative w-full h-full max-w-md'>
        <img
          src={story.media.url}
          alt='story'
          className='w-full h-full object-cover'
        />

        <div className='absolute top-2 left-2 right-2 flex space-x-1'>
          {stories.map((s, index) => (
            <div
              key={s._id || index}
              className='flex-1 h-1 bg-white/40 rounded-full overflow-hidden'
            >
              <div
                className='h-1 bg-white rounded-full'
                style={
                  index < currentIndex
                    ? { width: "100%" }
                    : index === currentIndex
                    ? {
                        width: `${progress}%`,
                        transition: "width 0.05s linear",
                      }
                    : { width: "0%" }
                }
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className='absolute top-4 left-4 right-4 flex items-center justify-between text-white z-40'>
          <div className='flex items-center space-x-3'>
            <Link
              to='/profile'
              className='flex items-center mt-1 gap-3 cursor-pointer z-50 relative'
              onClick={e => e.stopPropagation()}
            >
              <img
                src={
                  user?.profilePicture?.url ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=random`
                }
                alt='Profile'
                className='w-10 h-10 rounded-full object-cover border-4 border-black bg-gray-800'
              />
              <span className='font-bold text-sm'>{story.user.username}</span>
            </Link>
            <span className='text-xs mt-1 text-gray-300'>
              • {formatTime(story.createdAt)}
            </span>
          </div>

          <div className='flex items-center space-x-2 relative'>
            {isCurrentUserStory && (
              <div className='relative'>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(!menuOpen)
                  }}
                  className='text-white p-2 hover:bg-white/10 rounded-full transition z-50'
                >
                  <svg
                    className='w-6 h-6 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <circle cx='12' cy='5' r='2' />
                    <circle cx='12' cy='12' r='2' />
                    <circle cx='12' cy='19' r='2' />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    className='absolute right-0 top-10 w-40 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50'
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDelete()
                      }}
                      className='w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 rounded-lg text-sm font-medium'
                    >
                      Delete Story
                    </button>
                    <Link
                      to='/add-story'
                      className='block w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg text-sm font-medium'
                    >
                      Add Story +
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={e => {
                e.stopPropagation()
                onClose()
              }}
              className='text-white p-2 opacity-80 hover:opacity-100 transition z-50'
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className='absolute inset-0 flex justify-between pointer-events-none'>
          <div
            className='w-2/5 h-full pointer-events-auto cursor-pointer'
            onClick={onPrev}
          />
          <div
            className='w-3/5 h-full pointer-events-auto cursor-pointer'
            onClick={onNext}
          />
        </div>

        <div className='absolute bottom-0 left-0 right-0 p-4 z-40'>
          {isCurrentUserStory ? (
            <div className='text-white text-center opacity-90 hover:opacity-100 cursor-pointer'>
              <div className='flex justify-center mb-1'>
                <UpArrowIcon />
              </div>
              <div className='text-sm gap-2 font-semibold flex items-center justify-center'>
                <div>
                  <ViewersIcon className='mr-2 ' />
                </div>
                <div>{viewCount} Views</div>
              </div>
            </div>
          ) : (
            <div className='flex items-center space-x-3'>
              <input
                type='text'
                placeholder='Send message...'
                className='w-full bg-white/20 border border-white/40 rounded-full py-2 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-white'
              />
              <button className='text-white p-2'>
                <Send className='text-xl' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const otherStories = [
  {
    userId: "67240128aa12bc1f9a3f0011",
    username: "ahmad",
    userProfile: "https://i.pravatar.cc/150?u=ahmad",
    stories: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
        createdAt: "2024-11-25T09:30:00Z",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        createdAt: "2024-11-25T10:10:00Z",
      },
    ],
  },

  {
    userId: "67240128aa12bc1f9a3f0022",
    username: "mohamed",
    userProfile: "https://i.pravatar.cc/150?u=mohamed",
    stories: [
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        createdAt: "2024-11-25T08:00:00Z",
      },
    ],
  },

  {
    userId: "67240128aa12bc1f9a3f0033",
    username: "sara",
    userProfile: "https://i.pravatar.cc/150?u=sara",
    stories: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        createdAt: "2024-11-25T11:45:00Z",
      },
    ],
  },
  {
    userId: "67240128aa12bc1f9a3f0033",
    username: "sara",
    userProfile: "https://i.pravatar.cc/150?u=sara",
    stories: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        createdAt: "2024-11-25T11:45:00Z",
      },
    ],
  },
  {
    userId: "67240128aa12bc1f9a3f0033",
    username: "sara",
    userProfile: "https://i.pravatar.cc/150?u=sara",
    stories: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        createdAt: "2024-11-25T11:45:00Z",
      },
    ],
  },
  {
    userId: "67240128aa12bc1f9a3f0033",
    username: "sara",
    userProfile: "https://i.pravatar.cc/150?u=sara",
    stories: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        createdAt: "2024-11-25T11:45:00Z",
      },
    ],
  },
]
const Story = () => {
  const { user, token, getMyStories } = useContext(AppContext)
  const [allStories, setAllStories] = useState([])
  const [userStory, setUserStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(null)

  const fetchStories = useCallback(async () => {
    if (!user || !token) {
      setLoading(false)
      return
    }

    try {
      const { success, data } = await getMyStories()
      if (!success) {
        setUserStory(null)
        setAllStories([])
      } else {
        const fetchedStories = data.stories || []

        const currentUserId = user?._id || user?.id || user

        const myStories = fetchedStories.filter(story => {
          const storyUserId =
            story?.user?._id ||
            (typeof story?.user === "string" ? story.user : undefined) ||
            story?.user

          if (!storyUserId || !currentUserId) return false
          return String(storyUserId) === String(currentUserId)
        })

        setUserStory(myStories.length > 0 ? { user, stories: myStories } : null)
        setAllStories(myStories)
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setUserStory(null)
      setAllStories([])
    } finally {
      setLoading(false)
    }
  }, [user, token, getMyStories])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const openStory = () => {
    if (allStories.length > 0) setActiveIndex(0)
  }
  const closeStory = () => setActiveIndex(-1)

  const nextStory = () => {
    if (activeIndex !== null && activeIndex + 1 < allStories.length) {
      setActiveIndex(prev => prev + 1)
    } else {
      closeStory()
    }
  }
  const prevStory = () =>
    setActiveIndex(prev => (prev !== null && prev > 0 ? prev - 1 : 0))

  if (loading)
    return (
      <div className='py-4 flex justify-center text-gray-400'>
        Loading stories...
      </div>
    )

  const userHasStory = userStory && allStories.length > 0

  return (
    <div className='w-full bg-gray-900 rounded-3xl pt-3 pb-4 border-b border-gray-800 relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex gap-4 sm:gap-6 overflow-x-auto py-2 whitespace-nowrap custom-scrollbar-hidden'>
          <div className='w-16 sm:w-20 text-center'>
            {userHasStory ? (
              <div
                onClick={openStory}
                className={`relative w-16 h-16 rounded-full p-0.5 cursor-pointer ${
                  activeIndex === -1
                    ? "bg-gray-500" 
                    : activeIndex === -1
                    ? "bg-gray-500" 
                    : "bg-linear-to-tr from-yellow-400 via-orange-500 to-red-600" 
                }`}
              >
                <img
                  src={
                    user?.profilePicture?.url ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                  alt='Profile'
                  className='w-full h-full rounded-full object-cover border-4 border-black bg-gray-800'
                />
              </div>
            ) : (
              <Link to='/add-story' className='block'>
                <div className='relative w-16 h-16 sm:w-16 mx-auto rounded-full p-0.5 border-2 border-gray-500 cursor-pointer'>
                  <img
                    src={
                      user?.profilePicture?.url ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=random`
                    }
                    alt='Profile'
                    className='w-full h-full rounded-full object-cover border-4 border-black bg-gray-800'
                  />

                  <div className='absolute -bottom-1 pb-1 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-500 text-lg font-bold leading-none -translate-y-px -translate-x-px border-2 border-gray-900'>
                    +
                  </div>
                </div>
              </Link>
            )}
            <p className='text-[10px] sm:text-xs mt-1 text-gray-300 truncate font-medium'>
              Your Story
            </p>
          </div>
          {otherStories?.map((story, index) => (
            <div
              key={story.userId}
              className='flex flex-col items-center w-16 shrink-0'
            >
              <div
                onClick={() => openOtherStory(index)}
                className='relative w-16 h-16 rounded-full p-0.5 bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 cursor-pointer'
              >
                <img
                  src={
                    story.userProfile ||
                    `https://ui-avatars.com/api/?name=${story.username}&background=random`
                  }
                  alt={story.username}
                  className='w-full h-full rounded-full object-cover border-[3px] border-black'
                />
              </div>

              <p className='text-[11px] text-gray-300 mt-1 font-medium truncate w-full text-center'>
                {story.username}
              </p>
            </div>
          ))}
        </div>
      </div>

      {activeIndex !== null && allStories.length > 0 && (
        <StoryOverlay
          stories={allStories}
          currentIndex={activeIndex}
          onClose={closeStory}
          onNext={nextStory}
          onPrev={prevStory}
          user={user}
          token={token}
        />
      )}

      <style>{`.custom-scrollbar-hidden::-webkit-scrollbar { display: none; } .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}

export default Story
