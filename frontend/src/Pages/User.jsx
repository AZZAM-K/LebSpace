import { useState, useContext, useEffect, useEffectEvent } from 'react'
import { AppContext } from '../Context/context'
import { Link, useParams, useNavigate } from 'react-router'
import {
  Grid,
  Tag,
  Heart,
  MessageCircle,
  Loader2,
  Ban,
  Bookmark,
  Lock,
} from 'lucide-react'

const User = () => {
  const { id } = useParams()
  const {
    getUserById,
    user: currentUser,
    sendFollowRequest,
    cancelFollowRequest,
    unfollowUser,
    blockUser,
    createChat,
  } = useContext(AppContext)
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [requested, setRequested] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [isAction, setIsAction] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const sortedPosts = user?.posts
    ? [...user.posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : []

  const fetchUserEvent = useEffectEvent(async () => {
    if (id === currentUser.id) {
      navigate('/profile')
    }

    const result = await getUserById(id)
    if (!result.success) {
      setError(result.message || 'Failed to load this user')
    }

    setUser(result.data.user)
    setRequested(result.data.requested)
    setFollowed(result.data.isFollowed)
    setBlocked(result.data.isBlocked)
    setLoading(false)
  })

  useEffect(() => {
    fetchUserEvent()
  }, [id])

  const unfollow = async () => {
    try {
      const result = await unfollowUser(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setFollowed(false)
    } catch (error) {
      setError(error.message)
    }
  }

  const sendRequest = async () => {
    try {
      const result = await sendFollowRequest(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      if (user.isPrivate) {
        setRequested(true)
      } else {
        setFollowed(true)
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const cancelRequest = async () => {
    try {
      const result = await cancelFollowRequest(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setRequested(false)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleClick = async () => {
    setIsAction(true)
    if (followed) {
      await unfollow()
    } else if (requested) {
      await cancelRequest()
    } else {
      await sendRequest()
    }
    setIsAction(false)
  }

  const handleBlockUser = async () => {
    try {
      setIsBlocking(true)
      const result = await blockUser(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setBlocked(true)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleMessage = async () => {
    try {
      const result = await createChat({ participantId: user._id })
      if (!result.success) {
        setError(result.message)
        return
      }

      navigate(`/chat/${result.data.chatId}`)
    } catch (error) {
      setError(error.message)
    }
  }

  if (error) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center text-red-500'>
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
        <Loader2 className='w-12 h-12 text-gray-600 animate-spin' />
      </div>
    )
  }

  if (blocked) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-4'>
        <Ban size={48} className='text-red-500 mb-4' />
        <h2 className='text-2xl font-bold text-white mb-2'>User Blocked</h2>
        <p className='text-gray-400 max-w-md'>
          You have blocked this user or they have blocked you. You cannot view
          their profile or interact with them.
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white w-full pb-24 md:pb-10'>
      <div className='max-w-4xl mx-auto pt-6 md:pt-10 px-4 sm:px-6'>
        <div className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-8'>
          <div className='shrink-0 mx-auto md:mx-0'>
            <div className='w-24 h-24 md:w-40 md:h-40 rounded-full p-0.5 bg-linear-to-tr from-gray-700 to-gray-600'>
              <img
                src={
                  user?.profilePicture?.url ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=random`
                }
                alt='Profile'
                className='w-full h-full rounded-full object-cover border-4 border-black'
              />
            </div>
          </div>

          <div className='flex-1 w-full'>
            <div className='flex flex-col md:flex-row md:items-center gap-4 mb-5'>
              <h1 className='text-2xl font-light tracking-wide'>
                {user.username}
              </h1>

              <div className='flex gap-2 items-center w-full md:w-auto'>
                <button
                  onClick={handleClick}
                  disabled={isAction || isBlocking}
                  className={`flex-1 md:flex-none px-6 py-1.5 font-semibold rounded-lg text-sm transition-all duration-200
                   flex items-center justify-center gap-2
                    ${
                      !followed && !requested
                        ? 'bg-[#F65C21] hover:bg-orange-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                >
                  {isAction ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : followed ? (
                    'Following'
                  ) : requested ? (
                    'Requested'
                  ) : (
                    'Follow'
                  )}
                </button>

                {(followed || !user.isPrivate) && (
                  <button
                    onClick={handleMessage}
                    className='flex-1 md:flex-none px-4 py-1.5 bg-gray-800 text-white font-semibold rounded-lg text-sm
                 hover:bg-gray-700 transition'
                  >
                    Message
                  </button>
                )}

                <button
                  onClick={handleBlockUser}
                  disabled={isBlocking || isAction}
                  className='p-1.5 bg-gray-900/50 border border-gray-800 text-red-500 rounded-lg
                   hover:bg-red-500/10 hover:border-red-500/50 transition'
                  title='Block User'
                >
                  {isBlocking ? (
                    <Loader2 size={18} className='animate-spin' />
                  ) : (
                    <Ban size={18} />
                  )}
                </button>
              </div>
            </div>

            <div
              className='flex items-center justify-around md:justify-start gap-8 md:gap-10 mb-5 text-sm md:text-base
             border-y md:border-none border-gray-800 py-4 md:py-0'
            >
              <div className='text-center md:text-left'>
                <span className='font-bold block md:inline text-white mr-1'>
                  {user.posts.length}
                </span>
                <span className='text-gray-400'>posts</span>
              </div>
              {followed || !user.isPrivate ? (
                <>
                  <Link
                    to={`/users/${user._id}/followers`}
                    className='text-center md:text-left'
                  >
                    <span className='font-bold block md:inline text-white mr-1'>
                      {user.followers.length}
                    </span>
                    <span className='text-gray-400'>followers</span>
                  </Link>
                  <Link
                    to={`/users/${user._id}/followers`}
                    className='text-center md:text-left'
                  >
                    <span className='font-bold block md:inline text-white mr-1'>
                      {user.following.length}
                    </span>
                    <span className='text-gray-400'>following</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className='text-center md:text-left'>
                    <span className='font-bold block md:inline text-white mr-1'>
                      {user.followers.length}
                    </span>
                    <span className='text-gray-400'>followers</span>
                  </div>
                  <div className='text-center md:text-left'>
                    <span className='font-bold block md:inline text-white mr-1'>
                      {user.following.length}
                    </span>
                    <span className='text-gray-400'>following</span>
                  </div>
                </>
              )}
            </div>

            <div className='px-1'>
              <div className='font-bold text-white mb-1'>{user.fullName}</div>
              <div className='text-gray-300 text-sm whitespace-pre-line leading-relaxed'>
                {user.bio}
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-800 min-h-[300px]'>
          {!user.isPrivate || followed ? (
            <>
              <div className='flex justify-around md:justify-center gap-12 mb-4'>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center gap-2 py-4 text-sm tracking-widest uppercase border-t border-transparent -mt-px
                     transition-all
              ${
                activeTab === 'posts'
                  ? 'border-white text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
                >
                  <Grid size={16} />
                  <span className='hidden sm:inline'>Posts</span>
                </button>
              </div>

              {user.posts.length > 0 ? (
                <div className='grid grid-cols-3 gap-1 md:gap-6'>
                  {sortedPosts.map(post => (
                    <div
                      key={post._id}
                      className='relative group aspect-square cursor-pointer bg-gray-900 overflow-hidden'
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <img
                        src={post.media?.url || '/fallback-image.png'}
                        alt='Post'
                        className='w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:opacity-50'
                      />
                      <div
                        className='absolute inset-0 hidden group-hover:flex items-center justify-center gap-6 bg-black/30
                       text-white font-bold'
                      >
                        <div className='flex items-center gap-1'>
                          <Heart size={20} fill='white' />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <MessageCircle size={20} fill='white' />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-16 h-16 border-2 border-gray-700 rounded-full flex items-center justify-center mb-4'>
                    <Grid size={30} className='text-gray-500' />
                  </div>
                  <h3 className='text-xl font-bold mb-1'>No Posts Yet</h3>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center py-16 md:py-24 text-center'>
              <div className='w-24 h-24 rounded-full border-2 border-gray-800 flex items-center justify-center mb-6'>
                <Lock size={40} className='text-gray-200' />
              </div>
              <h2 className='text-lg font-bold text-white mb-2'>
                This Account is Private
              </h2>
              <p className='text-gray-400 text-sm max-w-xs'>
                Follow this account to see their photos and videos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default User
