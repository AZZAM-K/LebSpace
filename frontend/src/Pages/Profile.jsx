import { useState, useContext, useEffect, useEffectEvent } from 'react'
import { AppContext } from '../Context/context'
import { Link, useNavigate } from 'react-router'

import {
  Grid,
  Bookmark,
  Tag,
  Heart,
  MessageCircle,
  Settings,
  Camera,
  Loader2,
} from 'lucide-react'

const Profile = () => {
  const navigate = useNavigate()
  const { getMyProfile } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('posts')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileEvent = useEffectEvent(async () => {
    const result = await getMyProfile()
    if (!result.success) {
      setError(result.message || 'Failed to load profile')
    }
    setUser(result.data)
    setLoading(false)
  })

  useEffect(() => {
    fetchProfileEvent()
  }, [])

  if (error) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center text-red-500'>
        {error}
      </div>
    )
  }
  const sortedPosts = user?.posts
    ? [...user.posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : []

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
        <Loader2 className='w-12 h-12 text-gray-600 animate-spin' />
      </div>
    )
  }

  return (
    <div className='flex-1 relative'>
      <div className='min-h-screen bg-black text-white w-full pb-24 md:pb-10'>
        <div className='max-w-4xl mx-auto pt-6 md:pt-10 px-4 sm:px-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-12'>
            <div className='shrink-0 mx-auto md:mx-0 relative group'>
              <div
                className='w-24 h-24 md:w-40 md:h-40 rounded-full p-[3px] bg-linear-to-tr from-orange-400 via-[#F65C21]
                     to-orange-700'
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
            </div>

            <div className='flex-1 w-full'>
              <div className='flex flex-col md:flex-row md:items-center gap-4 mb-6'>
                <h1 className='text-2xl font-light tracking-wide'>
                  {user.username}
                </h1>
                <div className='flex gap-3'>
                  <Link
                    to='/profile/edit'
                    className='px-6 py-1.5 bg-[#F65C21] text-black font-semibold rounded-lg text-sm hover:bg-orange-500
                         transition'
                  >
                    Edit Profile
                  </Link>
                  <button
                    className='px-4 py-1.5 bg-gray-800 text-white font-semibold rounded-lg text-sm hover:bg-gray-700
                         transition'
                  >
                    Share
                  </button>
                  <Link
                    to='/settings'
                    className='p-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 text-white'
                  >
                    <Settings size={18} />
                  </Link>
                </div>
              </div>

              <div
                className='flex items-center justify-around md:justify-start gap-8 md:gap-10 mb-3 text-sm md:text-base border-y
             md:border-none border-gray-800 py-4 md:py-0'
              >
                <div className='text-center md:text-left'>
                  <span className='font-bold block md:inline text-white mr-1'>
                    {user.posts.length}
                  </span>
                  <span className='text-gray-400'>posts</span>
                </div>
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
              </div>

              <div className='hidden md:block'>
                <div className='font-bold text-white mb-1'>{user.fullName}</div>
                <div className='text-gray-300 text-sm whitespace-pre-line leading-relaxed mb-2'>
                  {user.bio}
                </div>
              </div>
            </div>
          </div>

          <div className='block md:hidden mb-8'>
            <div className='font-bold text-white mb-1'>{user.fullName}</div>
            <div className='text-gray-300 text-sm whitespace-pre-line leading-relaxed mb-2'>
              {user.bio}
            </div>
          </div>

          <div className='border-t border-gray-800 flex justify-around md:justify-center gap-12 mb-4'>
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
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 text-sm tracking-widest uppercase border-t border-transparent -mt-px
                     transition-all
              ${
                activeTab === 'saved'
                  ? 'border-white text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Bookmark size={16} />
              <span className='hidden sm:inline'>Saved</span>
            </button>
            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-4 text-sm tracking-widest uppercase border-t border-transparent -mt-px
                     transition-all
              ${
                activeTab === 'tagged'
                  ? 'border-white text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Tag size={16} />
              <span className='hidden sm:inline'>Tagged</span>
            </button>
          </div>

          {activeTab === 'posts' && (
            <>
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
                      <div className='absolute inset-0 hidden group-hover:flex items-center justify-center gap-6 bg-black/30 text-white font-bold'>
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
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                  <div className='w-20 h-20 rounded-full border-2 border-gray-700 flex items-center justify-center mb-4'>
                    <Camera size={40} className='text-gray-500' />
                  </div>
                  <h2 className='text-2xl font-extrabold text-white mb-2'>
                    No Posts Yet
                  </h2>
                  <p className='text-gray-400 max-w-xs mb-6'>
                    When you share posts, they will appear on your profile.
                  </p>
                  <button className='text-[#F65C21] hover:text-white font-medium'>
                    Share your first post
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab !== 'posts' && (
            <div className='flex flex-col items-center justify-center py-20 text-gray-500'>
              <Settings className='mb-4 animate-spin-slow' />
              <p>This section is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
