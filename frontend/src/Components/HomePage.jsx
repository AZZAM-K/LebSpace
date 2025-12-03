import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../Context/context'
import {
  Heart,
  MessageCircle,
  Bookmark,
  AlertCircle,
  Sparkles,
  RefreshCcw,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const { getAllPostPriorityOfFollowing, addLikeAndRemoveLike, user } =
    useContext(AppContext)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [likeAnimations, setLikeAnimations] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFollowingPosts()
    setRefreshing(false)
  }
  useEffect(() => {
    fetchFollowingPosts()
  }, [])

  const fetchFollowingPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getAllPostPriorityOfFollowing()

      if (result.success) {
        const serverPosts = result.data.posts || []
        console.log(serverPosts)
        setPosts(serverPosts)

        const liked = new Set()

        serverPosts.forEach(post => {
          post.likes?.forEach(like => {
            if (like === user?.id) {
              liked.add(post._id)
            }
          })
        })

        setLikedPosts(liked)
      } else {
        setError(result.message || 'Failed to load posts')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId, e) => {
    e?.preventDefault()
    const isCurrentlyLiked = likedPosts.has(postId)

    setLikeAnimations(prev => ({ ...prev, [postId]: true }))
    setTimeout(() => {
      setLikeAnimations(prev => ({ ...prev, [postId]: false }))
    }, 600)

    setLikedPosts(prev => {
      const updated = new Set(prev)
      if (isCurrentlyLiked) updated.delete(postId)
      else updated.add(postId)
      return updated
    })

    setPosts(prev =>
      prev.map(p => {
        if (p._id === postId) {
          if (isCurrentlyLiked) {
            return {
              ...p,
              likes: p.likes.filter(l => l !== user?.id),
            }
          } else {
            return { ...p, likes: [...p.likes, user?.id] }
          }
        }
        return p
      })
    )

    try {
      const res = await addLikeAndRemoveLike(postId)

      if (res.success) {
        const updatedPost = res.data?.post || res.data?.updatedPost

        if (updatedPost?._id && updatedPost?.likes) {
          setPosts(prev =>
            prev.map(p =>
              p._id === postId ? { ...p, likes: updatedPost.likes } : p
            )
          )
          const userIsLiked = updatedPost.likes.some(l => l === user?.id)
          setLikedPosts(prev => {
            const upd = new Set(prev)
            if (userIsLiked) upd.add(postId)
            else upd.delete(postId)
            return upd
          })
        }
      } else {
        setLikedPosts(prev => {
          const updated = new Set(prev)
          if (isCurrentlyLiked) updated.add(postId)
          else updated.delete(postId)
          return updated
        })

        setPosts(prev =>
          prev.map(p => {
            if (p._id === postId) {
              const revertedCount = isCurrentlyLiked
                ? (p.likes?.length || 0) + 1
                : Math.max(0, (p.likes?.length || 0) - 1)
              return { ...p, likes: Array(revertedCount).fill(null) }
            }
            return p
          })
        )
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setLikedPosts(prev => {
        const updated = new Set(prev)
        if (isCurrentlyLiked) updated.add(postId)
        else updated.delete(postId)
        return updated
      })
      setPosts(prev =>
        prev.map(p => {
          if (p._id === postId) {
            const revertedCount = isCurrentlyLiked
              ? (p.likes?.length || 0) + 1
              : Math.max(0, (p.likes?.length || 0) - 1)
            return { ...p, likes: Array(revertedCount).fill(null) }
          }
          return p
        })
      )
    }
  }

  const formatDate = date => {
    const now = new Date()
    const postDate = new Date(date)
    const diffMs = now - postDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className='min-h-screen rounded-2xl flex items-center justify-center bg-linear-to-b from-black via-gray-950 to-black p-4'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative w-16 h-16'>
            <div
              className='absolute inset-0 bg-linear-to-r from-orange-500 to-orange-600 rounded-full animate-spin'
              style={{ animationDuration: '3s' }}
            />
            <div className='absolute inset-2 bg-black rounded-full' />
            <Sparkles className='absolute inset-4 text-orange-500 animate-pulse' />
          </div>
          <p className='text-gray-300 font-semibold'>
            Fetching your personalized feed…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-full md:max-w-xl'>
      <header
        className='flex items-center justify-between mb-4 px-3 py-2 bg-black/60 backdrop-blur rounded-2xl border
       border-gray-800 shadow-lg'
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-orange-400' />
          <h1 className='text-lg font-extrabold text-white tracking-tight'>
            Post
          </h1>
          <span className='text-xs text-gray-500 ml-1'>Feed</span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className='p-2 rounded-full hover:bg-white/5 transition text-gray-300'
            title='Refresh'
          >
            <RefreshCcw
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </header>

      {error && (
        <div
          className='mb-4 px-4 py-3 rounded-xl bg-red-600/10 border border-red-600/30
         flex items-center gap-3 text-sm text-red-200'
        >
          <AlertCircle className='w-5 h-5' />
          <div className='flex-1'>{error}</div>
          <button
            onClick={fetchFollowingPosts}
            className='text-xs px-3 py-1 rounded bg-red-600/20'
          >
            Retry
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <div className='rounded-2xl bg-linear-to-b from-gray-900/40 to-black/20 p-8 text-center shadow-lg border border-gray-800'>
          <div
            className='mx-auto w-20 h-20 rounded-full bg-linear-to-br from-orange-500/20 to-orange-600/20
           flex items-center justify-center mb-4'
          >
            <Sparkles className='w-10 h-10 text-orange-400' />
          </div>
          <h2 className='text-white font-bold text-xl'>Nothing to show</h2>
          <p className='text-gray-400 mt-2 mb-4'>
            Follow people or create your first post to populate your feed.
          </p>
        </div>
      ) : (
        <div className='space-y-5'>
          {posts.map(post => (
            <article
              key={post._id}
              className='bg-linear-to-b from-gray-900/40 to-black/20 rounded-2xl overflow-hidden border border-gray-800 shadow-sm'
            >
              <div className='flex items-center justify-between px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <Link to={`/users/${post.user?._id}`}>
                    <img
                      src={
                        post.user?.profilePicture?.url ||
                        post.user?.img ||
                        `https://ui-avatars.com/api/?name=${post.user?.username}&background=random`
                      }
                      alt={post.user?.username}
                      className='w-10 h-10 rounded-full object-cover border-2 border-orange-500'
                    />
                  </Link>
                  <div className='min-w-0'>
                    <Link
                      to={`/users/${post.user?._id}`}
                      className='text-sm font-semibold text-white block truncate'
                    >
                      {post.user?.username}
                    </Link>
                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                      <Clock className='w-3.5 h-3.5' />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {post.caption && (
                <div className='px-4 pb-2'>
                  <p className='text-sm text-gray-100'>
                    <Link
                      to={`/users/${post.user?._id}`}
                      className='font-semibold text-white mr-2'
                    >
                      {post.user?.username}
                    </Link>
                    <span>{post.caption}</span>
                  </p>
                </div>
              )}

              {post.media?.url && (
                <Link
                  to={`/post/${post._id}`}
                  className='block relative px-4 pb-4'
                >
                  <div className='overflow-hidden rounded-xl bg-black border border-gray-800 mx-auto max-w-[680px]'>
                    {post.contentType === 'video' ? (
                      <video
                        src={post.media.url}
                        className='w-full max-h-100 object-cover'
                        onDoubleClick={e => handleLike(post._id, e)}
                        controls={false}
                        preload='metadata'
                      />
                    ) : (
                      <img
                        src={post.media.url}
                        alt='Post'
                        className='w-full max-h-100 object-cover'
                        onDoubleClick={e => handleLike(post._id, e)}
                      />
                    )}

                    {likeAnimations[post._id] && (
                      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                        <Heart className='w-20 h-20 text-white fill-white animate-pulse' />
                      </div>
                    )}
                  </div>
                </Link>
              )}

              <div className='flex items-center justify-between px-4 py-3 border-t border-gray-800/40'>
                <div className='flex items-center gap-6'>
                  <button
                    onClick={e => handleLike(post._id, e)}
                    className='flex items-center gap-2 text-sm rounded-md px-2 py-1 hover:bg-white/5 transition'
                    title='Like'
                  >
                    <Heart
                      className={`w-6 h-6 transition-transform ${
                        likedPosts.has(post._id)
                          ? 'text-orange-500 scale-110'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      fill={likedPosts.has(post._id) ? 'currentColor' : 'none'}
                    />
                    <span
                      className={`text-xs ${
                        likedPosts.has(post._id)
                          ? 'text-orange-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {post.likes?.length || 0}
                    </span>
                  </button>

                  <Link
                    to={`/post/${post._id}/add-comment`}
                    className='flex items-center gap-2 text-gray-300 hover:text-white transition'
                    title='Comments'
                  >
                    <MessageCircle className='w-5 h-5' />
                    <span className='text-xs'>
                      {post.comments?.length || 0}
                    </span>
                  </Link>
                </div>

                <div className='flex items-center gap-3'>
                  <button
                    title='Save'
                    className='p-2 rounded-md hover:bg-white/5 transition text-gray-300'
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        post.isSaved ? 'text-orange-400' : ''
                      }`}
                      fill={post.isSaved ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <div className='px-4 pb-4 pt-2'>
                <Link
                  to={`/post/${post._id}/add-comment`}
                  className='text-xs text-gray-400 hover:text-gray-200'
                >
                  View all {post.comments?.length || 0} comments
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
