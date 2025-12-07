import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useEffectEvent,
} from 'react'
import { AppContext } from '../Context/context'
import { Link } from 'react-router-dom'
import { X, Eye, ArrowUp } from 'lucide-react'

const StoryOverlay = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  user,
  token,
}) => {
  const { deleteStory, getViewedStories, addViewer } = useContext(AppContext)

  const [viewersModalOpen, setViewersModalOpen] = useState(false)
  const [viewersList, setViewersList] = useState([])
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentStory, setCurrentStory] = useState(stories[currentIndex])
  const duration = 20000
  const story = stories[currentIndex]

  useEffect(() => {
    if (!story || !user) return

    const fetchStoryData = async () => {
      const result = await getViewedStories(story._id)
      if (result.success) {
        let viewers = result.viewers || []

        if (!viewers.some(v => v._id === user.id)) {
          const addResult = await addViewer(story._id)
          if (addResult.success) {
            viewers = addResult.viewers
          }
        }

        setCurrentStory({
          ...story,
          viewers,
          viewsCount: viewers.length,
        })
      }
    }

    fetchStoryData()
  }, [story, user])

  const openViewers = () => {
    if (
      currentStory &&
      currentStory.viewers &&
      currentStory.viewers.length > 0
    ) {
      setViewersList(currentStory.viewers)
      setViewersModalOpen(true)
    } else {
      setViewersList([])
      setViewersModalOpen(true)
    }
  }

  const storiesEvent = useEffectEvent(() => {
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
  })

  useEffect(() => {
    storiesEvent()
  }, [currentIndex, duration, onNext, story])

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
    story?.user?._id?.toString() === user?.id?.toString()
  const viewCount = currentStory?.viewers?.length || 0

  const handleDelete = async () => {
    const result = await deleteStory(story._id)
    if (result.success) {
      setMenuOpen(false)
      onClose()
    } else {
      alert('Failed to delete story: ' + result.message)
    }
  }

  if (!user || !token) return <div style={{ color: 'white' }}>Loading...</div>
  if (!story) return null
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
                    ? { width: '100%' }
                    : index === currentIndex
                    ? {
                        width: `${progress}%`,
                        transition: 'width 0.05s linear',
                      }
                    : { width: '0%' }
                }
              />
            </div>
          ))}
        </div>

        <div className='absolute top-4 left-4 right-4 flex items-center justify-between text-white z-40'>
          <div className='flex items-center space-x-3'>
            <Link
              to={
                story?.user?._id?.toString() === user?.id?.toString()
                  ? '/profile'
                  : `/users/${story?.user?._id}`
              }
              className='flex items-center mt-1 gap-3 cursor-pointer z-50 relative'
              onClick={e => e.stopPropagation()}
            >
              <img
                src={
                  story?.user?.profilePicture?.url ||
                  story?.user?.img ||
                  `https://ui-avatars.com/api/?name=${story?.user?.username}&background=random`
                }
                alt={story?.user?.username}
                className='w-10 h-10 rounded-full object-cover'
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
                    className='absolute right-0 top-10 w-40 bg-black/95 backdrop-blur-sm border border-white/20
                     rounded-lg shadow-lg z-50'
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
              <X />
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
          {isCurrentUserStory && (
            <div
              className='text-white text-center opacity-90 hover:opacity-100 cursor-pointer'
              onClick={openViewers}
            >
              <div className='flex justify-center mb-1'>
                <ArrowUp />
              </div>
              <div className='text-sm gap-2 font-semibold flex items-center justify-center'>
                <Eye className='mr-2' />
                <div>{viewCount} Views</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewersModalOpen && (
        <div className='fixed inset-0 bg-black/70 flex justify-center items-center z-999'>
          <div className='bg-black/90 w-80 p-4 rounded-xl border border-white/20'>
            <h3 className='text-white font-bold mb-3 text-center'>
              Viewers ({viewersList.length})
            </h3>
            <div className='max-h-64 overflow-y-auto space-y-3'>
              {viewersList && viewersList.length > 0 ? (
                viewersList.map(v => (
                  <div
                    key={v._id}
                    className='flex items-center gap-3 text-white'
                  >
                    <img
                      src={
                        (typeof v.profilePicture === 'object'
                          ? v.profilePicture?.url
                          : v.profilePicture) ||
                        v.img ||
                        `https://ui-avatars.com/api/?name=${v.username}&background=random`
                      }
                      className='w-10 h-10 rounded-full object-cover'
                      alt={v.username}
                    />
                    <span>{v._id === user.id ? 'You' : v.username}</span>
                  </div>
                ))
              ) : (
                <p className='text-center text-gray-400 py-4'>No viewers yet</p>
              )}
            </div>
            <button
              onClick={() => setViewersModalOpen(false)}
              className='w-full mt-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const Story = () => {
  const { user, token, getMyStories, getFollowingStories } =
    useContext(AppContext)

  const [myStories, setMyStories] = useState([])
  const [otherStories, setOtherStories] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeUserStories, setActiveUserStories] = useState(null)
  const [activeUserIndex, setActiveUserIndex] = useState(0)

  const fetchStories = useCallback(async () => {
    if (!user || !token) {
      setLoading(false)
      return
    }

    try {
      const myRes = await getMyStories()
      setMyStories(myRes?.data?.stories || [])

      const followingRes = await getFollowingStories()
      const fetched = followingRes?.data || []

      const grouped = Object.values(
        fetched.reduce((acc, st) => {
          const id = st.user._id

          if (!acc[id]) {
            acc[id] = {
              userId: id,
              username: st.user.username,
              userProfile:
                st.user.profilePicture?.url ||
                st.user.profilePicture ||
                `https://ui-avatars.com/api/?name=${st.user.username}&background=random`,
              stories: [],
            }
          }

          acc[id].stories.push(st)
          return acc
        }, {})
      )

      setOtherStories(grouped)
    } catch (err) {
      console.error('Error fetching stories:', err)
      setMyStories([])
      setOtherStories([])
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const isViewedByUser = (story, userId) => {
    if (!story || !userId) return false
    const viewers = story.viewers ?? []
    return viewers.some(v => {
      const vid =
        typeof v === 'string' ? v : v?._id ? v._id.toString() : v?.toString?.()
      return vid === userId?.toString()
    })
  }

  const markStoryAsViewed = storyId => {
    setOtherStories(prev =>
      prev.map(userStories => ({
        ...userStories,
        stories: userStories.stories.map(s =>
          s._id === storyId
            ? {
                ...s,
                viewers: [
                  ...(s.viewers || []),
                  { _id: user.id, username: user.username },
                ],
              }
            : s
        ),
      }))
    )

    setMyStories(prev =>
      prev.map(s =>
        s._id === storyId
          ? {
              ...s,
              viewers: [
                ...(s.viewers || []),
                { _id: user.id, username: user.username },
              ],
            }
          : s
      )
    )
  }

  const openUserStory = stories => {
    if (!stories || !Array.isArray(stories)) return
    setActiveUserStories(stories)
    setActiveUserIndex(0)
  }

  const closeOverlay = () => setActiveUserStories(null)

  if (loading)
    return (
      <div className='py-4 flex justify-center text-gray-400'>
        Loading stories...
      </div>
    )

  return (
    <div className='w-full md:w-[70%] md:ml-40 bg-black/50 border-2 border-gray-600 rounded-3xl pt-3 pb-4 relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex gap-4 overflow-x-auto py-2 whitespace-nowrap custom-scrollbar-hidden'>
          <div className='text-center'>
            {myStories.length > 0 ? (
              <div
                onClick={() => openUserStory(myStories)}
                className='relative w-16 h-16 p-0.5 rounded-full bg-linear-to-tr from-orange-400 via-red-500
                 to-orange-600 cursor-pointer'
              >
                <img
                  src={
                    user?.img ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                  alt='Profile'
                  className='w-full h-full rounded-full object-cover '
                />
              </div>
            ) : (
              <Link to='/add-story'>
                <div className='relative w-16 h-16 rounded-full'>
                  <img
                    src={
                      user.img ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=random`
                    }
                    alt='Profile'
                    className='w-full h-full rounded-full object-cover border-2 border-gray-600'
                  />
                  <div
                    className='absolute -bottom-1 right-0 w-6 h-6 bg-white text-blue-500 rounded-full flex
                   items-center justify-center border-2 border-gray-900 text-xl font-bold'
                  >
                    +
                  </div>
                </div>
              </Link>
            )}

            <p className='text-[10px] text-gray-300 mt-1 font-medium'>
              Your Story
            </p>
          </div>

          {otherStories.map(st => {
            const allViewed = st.stories.every(s =>
              isViewedByUser(s, user?.id || user?._id)
            )

            return (
              <div
                key={st.userId}
                onClick={() => openUserStory(st.stories)}
                className='flex flex-col items-center w-16 cursor-pointer'
              >
                <div
                  className={`relative w-16 h-16 rounded-full p-0.5 ${
                    allViewed
                      ? 'bg-gray-500'
                      : 'bg-linear-to-tr from-orange-400 via-red-500 to-orange-600'
                  }`}
                >
                  <img
                    src={
                      st.userProfile ||
                      `https://ui-avatars.com/api/?name=${st.username}&background=random`
                    }
                    alt={st.username}
                    className='w-full h-full rounded-full object-cover border-[3px] border-black'
                  />
                </div>

                <p className='text-[11px] text-gray-300 mt-1 font-medium truncate'>
                  {st.username}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {activeUserStories && (
        <StoryOverlay
          stories={activeUserStories}
          currentIndex={activeUserIndex}
          onClose={closeOverlay}
          onNext={() => {
            markStoryAsViewed(activeUserStories[activeUserIndex]._id)
            setActiveUserIndex(prev =>
              prev + 1 < activeUserStories.length
                ? prev + 1
                : (closeOverlay(), 0)
            )
          }}
          onPrev={() => setActiveUserIndex(prev => (prev > 0 ? prev - 1 : 0))}
          user={user}
          token={token}
        />
      )}
    </div>
  )
}

export default Story
