import { useState, useContext, useEffect, useCallback } from 'react'
import { AppContext } from '../Context/context'
import { Link, useNavigate } from 'react-router'
import {
  Grid,
  Bookmark,
  Heart,
  MessageCircle,
  Settings,
  Camera,
  Loader2,
  AlertCircle,
  Share2,
} from 'lucide-react'

const Profile = () => {
  const navigate = useNavigate()
  const { getMyProfile, getSavedPostsForUser } = useContext(AppContext)

  const [activeTab, setActiveTab] = useState('posts')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedPosts, setSavedPosts] = useState([])
  const [copyNotification, setCopyNotification] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSavedPosts = async userId => {
      if (!userId) return

      try {
        const result = await getSavedPostsForUser(userId)

        if (result.success) {
          setSavedPosts(result.data)
        }
      } catch (err) {
        console.error('Error loading saved posts:', err)
      }
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const result = await getMyProfile()

        if (!mounted) return

        if (result?.success) {
          setUser(result.data)
          setError('')

          await loadSavedPosts(result.data._id)
        } else {
          setError(result?.message || 'Failed to load profile')
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error loading profile')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => (mounted = false)
  }, [getMyProfile, getSavedPostsForUser])

  const sortedPosts = user?.posts
    ? [...user.posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : []

  const handleShareProfile = useCallback(() => {
    const profileUrl = `${window.location.origin}/users/${user?._id}`
    navigator.clipboard.writeText(profileUrl)
    setCopyNotification(true)
    setTimeout(() => setCopyNotification(false), 2000)
  }, [user?._id])

  const handlePostClick = useCallback(
    postId => {
      navigate(`/post/${postId}`)
    },
    [navigate]
  )

  if (error) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center px-4'>
        <div className='text-center bg-gray-900 p-8 rounded-lg border border-gray-800 max-w-md w-full'>
          <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-3' />
          <p className='font-bold text-lg text-red-400 mb-2'>
            Error Loading Profile
          </p>
          <p className='text-gray-400 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-12 h-12 text-orange-500 animate-spin' />
          <p className='text-gray-400'>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center px-4'>
        <div className='text-center bg-gray-900 p-8 rounded-lg border border-gray-800 max-w-md w-full'>
          <AlertCircle className='w-12 h-12 text-yellow-400 mx-auto mb-3' />
          <p className='font-bold text-lg text-white mb-2'>Profile Not Found</p>
          <p className='text-gray-400'>
            Unable to load your profile at this time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 relative'>
      <div className='min-h-screen bg-black text-white w-full pb-24 md:pb-10'>
        <div className='max-w-4xl mx-auto pt-6 md:pt-10 px-4 sm:px-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-12'>
            <div className='shrink-0 mx-auto md:mx-0 relative'>
              <div
                className='w-24 h-24 md:w-40 md:h-40 rounded-full p-[3px] bg-linear-to-tr from-orange-400
               via-[#F65C21] to-orange-700'
              >
                <img
                  src={
                    user?.profilePicture?.url ||
                    user?.img ||
                    `https://ui-avatars.com/api/?name=${user?.username}&background=random`
                  }
                  alt={user?.username}
                  className='w-full h-full rounded-full object-cover border-4 border-black bg-gray-800'
                />
              </div>
            </div>

            <div className='flex-1 w-full'>
              <div className='flex flex-col md:flex-row md:items-center gap-4 mb-6'>
                <h1 className='text-2xl md:text-3xl font-light tracking-wide'>
                  {user?.username}
                </h1>
                <div className='flex gap-2 flex-wrap'>
                  <Link
                    to='/profile/edit'
                    className='px-6 py-1.5 bg-[#F65C21] text-black font-semibold rounded-lg text-sm hover:bg-orange-500
                     transition duration-200'
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleShareProfile}
                    className='px-4 py-1.5 bg-gray-800 text-white font-semibold rounded-lg text-sm hover:bg-gray-700
                     transition duration-200 flex items-center gap-2'
                  >
                    <Share2 size={16} />
                    <span className='hidden sm:inline'>Share</span>
                  </button>
                  <Link
                    to='/settings'
                    className='p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 text-white transition duration-200'
                    title='Settings'
                  >
                    <Settings size={18} />
                  </Link>
                </div>
              </div>

              <div
                className='flex items-center justify-around md:justify-start gap-8 md:gap-10 text-sm md:text-base
               border-y md:border-none border-gray-800 py-4 md:py-2'
              >
                <div className='text-center md:text-left'>
                  <span className='font-bold block md:inline text-white mr-1'>
                    {user?.posts?.length || 0}
                  </span>
                  <span className='text-gray-400'>
                    post{user?.posts?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Link
                  to={`/users/${user?._id}/followers`}
                  className='text-center md:text-left hover:opacity-80 transition'
                >
                  <span className='font-bold block md:inline text-white mr-1'>
                    {user?.followers?.length || 0}
                  </span>
                  <span className='text-gray-400'>
                    follower{user?.followers?.length !== 1 ? 's' : ''}
                  </span>
                </Link>
                <Link
                  to={`/users/${user?._id}/followers`}
                  className='text-center md:text-left hover:opacity-80 transition'
                >
                  <span className='font-bold block md:inline text-white mr-1'>
                    {user?.following?.length || 0}
                  </span>
                  <span className='text-gray-400'>following</span>
                </Link>
              </div>

              <div className='hidden md:block mt-4'>
                <div className='font-bold text-white mb-1'>
                  {user?.fullName || user?.fullname}
                </div>
                {user?.bio && (
                  <div className='text-gray-300 text-sm whitespace-pre-wrap leading-relaxed'>
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='block md:hidden mb-8'>
            <div className='font-bold text-white mb-1'>
              {user?.fullName || user?.fullname}
            </div>
            {user?.bio && (
              <div className='text-gray-300 text-sm whitespace-pre-wrap leading-relaxed'>
                {user.bio}
              </div>
            )}
          </div>

          <div className='border-t border-gray-800 flex justify-around md:justify-center gap-12 mb-4'>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-4 text-sm tracking-widest uppercase border-t-2 border-transparent
               transition-colors duration-200 ${
                 activeTab === 'posts'
                   ? 'border-white text-white'
                   : 'text-gray-500 hover:text-gray-300'
               }`}
            >
              <Grid size={16} />
              <span className='hidden sm:inline'>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 text-sm tracking-widest uppercase border-t-2 border-transparent
               transition-colors duration-200 ${
                 activeTab === 'saved'
                   ? 'border-white text-white'
                   : 'text-gray-500 hover:text-gray-300'
               }`}
            >
              <Bookmark size={16} />
              <span className='hidden sm:inline'>Saved</span>
            </button>
          </div>

          {activeTab === 'posts' && (
            <>
              {sortedPosts.length > 0 ? (
                <div className='grid grid-cols-3 gap-1 md:gap-6'>
                  {sortedPosts.map(post => (
                    <div
                      key={post._id}
                      className='relative group aspect-square cursor-pointer bg-gray-900 overflow-hidden rounded-lg'
                      onClick={() => handlePostClick(post._id)}
                    >
                      {post.contentType === 'video' ? (
                        <>
                          <video
                            src={post.media?.url}
                            className='w-full h-full object-cover'
                            autoPlay
                            muted
                            loop
                            playsInline
                          />

                          <div
                            className='absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white
                           opacity-0 group-hover:opacity-100 transition'
                          >
                            Video
                          </div>
                        </>
                      ) : (
                        <img
                          src={post.media?.url}
                          alt='Post'
                          className='w-full h-full object-cover transition duration-300 group-hover:scale-105'
                        />
                      )}

                      <div
                        className='absolute inset-0 hidden group-hover:flex items-center justify-center gap-6
                       bg-black/40 text-white font-bold transition duration-200'
                      >
                        <div className='flex items-center gap-1'>
                          <Heart size={20} fill='currentColor' />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <MessageCircle size={20} fill='currentColor' />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <div className='w-20 h-20 rounded-full border-2 border-gray-700 flex items-center justify-center mb-4'>
                    <Camera size={40} className='text-gray-500' />
                  </div>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    No Posts Yet
                  </h2>
                  <p className='text-gray-400 max-w-xs mb-6'>
                    When you share posts, they will appear on your profile.
                  </p>
                  <Link
                    to='/add-post'
                    className='text-[#F65C21] hover:text-white font-medium transition'
                  >
                    Share your first post
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedPosts.length > 0 ? (
                <div className='grid grid-cols-3 gap-1 md:gap-6'>
                  {savedPosts.map(post => (
                    <div
                      key={post._id}
                      className='relative group aspect-square cursor-pointer bg-gray-900 overflow-hidden rounded-lg'
                      onClick={() => handlePostClick(post._id)}
                    >
                      {post.contentType === 'video' ? (
                        <>
                          <video
                            src={post.media?.url}
                            className='w-full h-full object-cover transition duration-300 group-hover:scale-105'
                            onMouseEnter={e => e.target.play()}
                            onMouseLeave={e => e.target.pause()}
                          />
                          <div
                            className='absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white opacity-0
                           group-hover:opacity-100 transition'
                          >
                            Video
                          </div>
                        </>
                      ) : (
                        <img
                          src={post.media?.url || '/fallback-image.png'}
                          alt='Post'
                          className='w-full h-full object-cover transition duration-300 group-hover:scale-105'
                        />
                      )}

                      <div
                        className='absolute inset-0 hidden group-hover:flex items-center justify-center gap-6
                       bg-black/40 text-white font-bold transition duration-200'
                      >
                        <div className='flex items-center gap-1'>
                          <Heart
                            size={20}
                            fill='currentColor'
                            className='text-red-500'
                          />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <MessageCircle size={20} fill='currentColor' />
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <Bookmark size={48} className='text-gray-500 mb-4' />
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    No Saved Posts
                  </h2>
                  <p className='text-gray-400'>
                    Save posts to view them here later
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {copyNotification && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-gray-900 border border-green-500/30 text-green-300 p-6 rounded-xl shadow-xl w-full max-w-sm'>
            <p className='text-lg font-semibold mb-4'>
              ✓ Profile link copied to clipboard!
            </p>

            <button
              onClick={() => setCopyNotification(false)}
              className='w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
