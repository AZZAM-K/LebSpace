import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom' // Use react-router-dom for Link
import { AppContext } from '../Context/context' // Adjust path as necessary
import {
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
} from 'lucide-react'

// Assuming your AppContext, getPostById, etc., are correctly implemented.
// Icon components are now removed and replaced with Lucide React icons.

const PostById = () => {
  const { postId } = useParams()
  const navigate = useNavigate()

  // Destructure context functions and state
  const {
    getPostById,
    editPost,
    deletePost,
    addLikeAndRemoveLike,
    getCountOfLikes,
    user,
  } = useContext(AppContext)

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false) // Assuming a bookmark function exists in context
  const [showDblClickHeart, setShowDblClickHeart] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [editCaption, setEditCaption] = useState('')
  const [editMediaFile, setEditMediaFile] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const editFileRef = useRef(null)
  const [editLoading, setEditLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Ref for the menu to handle clicks outside
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuRef])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      const result = await getPostById(postId)
      if (!mounted) return
      if (result?.success) {
        const fetchedPost = result.data
        setPost(fetchedPost)
        setEditCaption(fetchedPost?.caption || '')

        const likes = fetchedPost?.likes || []
        const likedByUser =
          !!user &&
          Array.isArray(likes) &&
          likes.some(
            l =>
              String(l) === String(user?.id) ||
              String(l?._id) === String(user?.id)
          )
        setIsLiked(Boolean(likedByUser))
        setLikesCount(Array.isArray(likes) ? likes.length : 0)

        // **TODO: Implement and fetch isBookmarked state if a context function is available**
        // For now, keeping it as local state until logic is implemented.
      } else {
        setMessage(result?.message || 'Failed to load post')
      }
      setLoading(false)
    }
    load()
    return () => (mounted = false)
  }, [postId, getPostById, user?.id])

  // Double-click to like
  const handleMediaDblClick = async () => {
    if (!isLiked) {
      // Skip dbl-click if already liked, single click handler will handle unliking
      setIsLiked(true)
      setShowDblClickHeart(true)
      setTimeout(() => setShowDblClickHeart(false), 800)
      await handleLikeToggle(true) // Force like action
    }
  }

  // Handle Like/Unlike Toggle
  const handleLikeToggle = async (forceLike = false) => {
    if (!user) return navigate('/login') // Redirect if not logged in

    const actionIsLike = forceLike || !isLiked

    // Optimistic Update
    const prevLiked = isLiked
    const prevCount = likesCount
    setIsLiked(actionIsLike)
    setLikesCount(v => (actionIsLike ? v + 1 : Math.max(0, v - 1)))

    try {
      const res = await addLikeAndRemoveLike(postId)
      if (res?.success) {
        setIsLiked(Boolean(res.data?.liked))
        if (typeof res.data?.likesCount === 'number') {
          setLikesCount(res.data.likesCount)
        } else {
          // Fallback: refetch count
          const cnt = await getCountOfLikes?.(postId)
          if (cnt?.success) setLikesCount(cnt.data?.likesCount || 0)
        }
      } else {
        // Revert on failure
        setIsLiked(prevLiked)
        setLikesCount(prevCount)
      }
    } catch (err) {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const toggleMenu = () => setMenuOpen(v => !v)

  const confirmDelete = async () => {
    setEditLoading(true)
    try {
      const res = await deletePost(post._id)
      setEditLoading(false)
      if (res?.success) {
        navigate('/profile')
      } else {
        setMessage(res?.message || 'Failed to delete')
      }
    } catch (err) {
      setEditLoading(false)
      setMessage(err.message || 'Error deleting')
    } finally {
      setShowDeleteConfirm(false)
      setMenuOpen(false)
    }
  }

  useEffect(() => {
    if (!editMediaFile) {
      setEditPreview(null)
      return
    }
    const url = URL.createObjectURL(editMediaFile)
    setEditPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [editMediaFile])

  const handleEditFileChange = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setEditMediaFile(f)
  }

  const openEdit = () => {
    setShowEditModal(true)
    setMenuOpen(false)
    setEditCaption(post?.caption || '')
    setEditMediaFile(null)
    setEditPreview(null)
  }

  const submitEdit = async e => {
    e.preventDefault()
    if (!post) return
    setEditLoading(true)
    setMessage('')
    try {
      const form = new FormData()
      form.append('contentType', post.contentType || 'image')
      if (editMediaFile) form.append('media', editMediaFile)
      form.append('caption', editCaption || '')

      const res = await editPost(post._id, form)
      if (res?.success) {
        const updated = res.data?.story || res.data?.post || res.data
        if (updated && updated._id) {
          setPost(prev => ({ ...prev, ...updated }))
        } else {
          // Fallback update logic
          setPost(prev => ({ ...prev, caption: editCaption }))
          if (editPreview) {
            setPost(prev => ({
              ...prev,
              media: { ...(prev.media || {}), url: editPreview },
            }))
          }
        }
        setShowEditModal(false)
      } else {
        setMessage(res?.message || 'Failed to edit post')
      }
    } catch (err) {
      setMessage(err.message || 'Error editing post')
    } finally {
      setEditLoading(false)
    }
  }

  // --- Render States ---
  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center bg-gray-950'>
        <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (!post) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-950 text-red-400'>
        <div className='text-center'>
          <p className='font-bold text-xl'>404 — Post not found</p>
          <button
            onClick={() => navigate(-1)}
            className='mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition'
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Determine if the post belongs to the current user
  const isOwner = String(post.user?._id) === String(user?.id)

  // Format creation date
  const dateString = post.createdAt
    ? new Date(post.createdAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  // --- Main Component JSX ---
  return (
    <div className='min-h-screen w-full bg-black text-white flex justify-center'>
      <div className='w-full md:max-w-xl lg:max-w-2xl mx-auto min-h-screen border-x border-gray-800/50'>
        {/* Header (Top of Post/Screen) */}
        <div className='flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 sticky top-0 z-30'>
          {/* Back button for mobile view, Post Author for desktop */}
          <div className='flex items-center'>
            <button
              onClick={() => navigate(-1)}
              className='mr-3 p-1 rounded-full hover:bg-white/10 transition md:hidden'
              aria-label='Go Back'
            >
              <ChevronLeft className='w-6 h-6 text-white' />
            </button>
            <Link
              to={`/profile/${post.user?.username || post.user?._id}`}
              className='flex items-center gap-3'
            >
              <img
                src={
                  user?.img ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=random`
                }
                alt='Profile'
                className='w-10 h-10 rounded-full object-cover border-4 border-black bg-gray-800'
              />
              <div>
                <div className='font-bold text-sm md:text-base hover:text-orange-500 transition'>
                  {post.user?.username}
                </div>
                <div className='text-xs text-gray-400'>
                  {post.user?.fullname || 'Post Author'}
                </div>
              </div>
            </Link>
          </div>

          {/* Post Menu (Edit/Delete) */}
          {isOwner && (
            <div className='relative' ref={menuRef}>
              <button
                onClick={toggleMenu}
                className='p-2 rounded-full hover:bg-white/5 transition'
                aria-label='Post Options Menu'
              >
                <MoreVertical className='w-6 h-6 text-gray-300' />
              </button>

              {menuOpen && (
                <div className='absolute right-0 top-10 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-40'>
                  <button
                    className='w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-2'
                    onClick={openEdit}
                  >
                    <Edit className='w-4 h-4' /> Edit
                  </button>
                  <button
                    className='w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-2 text-red-400'
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setMenuOpen(false)
                    }}
                  >
                    <Trash2 className='w-4 h-4' /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Media Area */}
        <div
          className='relative w-full aspect-square bg-gray-950 flex items-center justify-center'
          onDoubleClick={handleMediaDblClick}
          style={{ maxHeight: '85vh' }} // Limit height on desktop
        >
          {showDblClickHeart && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'>
              <Heart
                className='w-24 h-24 text-red-500 animate-pop-in'
                fill='currentColor'
                strokeWidth={1.5}
              />
            </div>
          )}
          {post.contentType === 'video' ? (
            <video
              src={post.media?.url}
              controls
              className='w-full h-full object-contain'
              preload='metadata'
            />
          ) : (
            <img
              src={post.media?.url}
              alt='post media'
              className='w-full h-full object-cover'
            />
          )}
        </div>

        {/* Post Actions (Likes, Comments, Save) */}
        <div className='flex items-center justify-between p-3 border-b border-gray-800/50'>
          <div className='flex items-center gap-4'>
            {/* Like Button & Count */}
            <div className='flex items-center gap-1'>
              <button
                onClick={() => handleLikeToggle()}
                className='p-1 rounded-full focus:outline-none transition'
                aria-label={isLiked ? 'Unlike Post' : 'Like Post'}
              >
                <Heart
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isLiked
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  fill={isLiked ? 'currentColor' : 'none'}
                />
              </button>
              <span className='text-sm font-semibold text-gray-300'>
                {likesCount}
              </span>
            </div>

            {/* Comment Button & Count */}
            <div className='flex items-center gap-1'>
              <Link
                to={`/post/${post._id}/add-comment`}
                className='p-1 rounded-full focus:outline-none'
                aria-label='Add a Comment'
              >
                <MessageCircle
                  className='w-6 h-6 text-gray-400 hover:text-white transition-colors duration-200'
                  strokeWidth={2}
                />
              </Link>
              <span className='text-sm font-semibold text-gray-300'>
                {post.comments?.length || 0}
              </span>
            </div>

            {/* Share/Send Button (Placeholder) */}
            <button
              className='p-1 rounded-full focus:outline-none'
              aria-label='Share Post'
            >
              <Send
                className='w-6 h-6 text-gray-400 hover:text-white transition-colors duration-200'
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked(v => !v)}
            className='p-1 rounded-full focus:outline-none transition'
            aria-label={isBookmarked ? 'Unsave Post' : 'Save Post'}
          >
            <Bookmark
              className={`w-6 h-6 transition-colors duration-200 ${
                isBookmarked
                  ? 'text-white fill-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Caption and Comments */}
        <div className='p-4'>
          {post.caption && (
            <div className='mb-3 text-sm leading-snug'>
              <Link
                to={`/profile/${post.user?.username || post.user?._id}`}
                className='font-bold mr-2 hover:text-gray-300 transition'
              >
                {post.user?.username}
              </Link>
              <span className='text-gray-200 whitespace-pre-wrap'>
                {post.caption}
              </span>
            </div>
          )}

          {post.comments?.length > 0 && (
            <>
              <Link
                to={`/post/${post._id}/comments`}
                className='text-sm text-gray-400 hover:text-gray-300 transition block mb-3'
              >
                View all {post.comments.length} comments
              </Link>
              <div className='space-y-1'>
                {(post.comments || []).slice(0, 2).map((c, i) => (
                  <div key={i} className='text-sm flex leading-snug'>
                    <span className='font-semibold mr-2'>
                      {c.user?.username || 'Anonymous'}
                    </span>
                    <span className='text-gray-300'>{c.text}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Timestamp */}
          <div className='pt-3 text-xs text-gray-500 uppercase tracking-wider'>
            {dateString}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm'>
          <div className='w-full max-w-sm bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl'>
            <h3 className='text-xl font-bold mb-3 text-center text-red-400'>
              Confirm Delete
            </h3>
            <p className='text-sm text-gray-300 mb-6 text-center'>
              Are you absolutely sure you want to delete this post? This action
              cannot be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='flex-1 px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50'
                disabled={editLoading}
              >
                {editLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm'>
          <div className='w-full max-w-lg bg-gray-900 rounded-xl border border-gray-800 p-6 my-8 shadow-2xl'>
            <h3 className='text-2xl font-bold mb-6 text-orange-500'>
              Edit Post
            </h3>

            <form onSubmit={submitEdit} className='space-y-6'>
              {/* Media Preview/Change */}
              <div>
                <label className='text-sm text-gray-300 block mb-2 font-semibold'>
                  Media Preview
                </label>
                <div className='w-full h-72 bg-black rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center'>
                  {editPreview || post.media?.url ? (
                    post.contentType === 'video' ? (
                      <video
                        src={editPreview || post.media.url}
                        controls
                        className='w-full h-full object-contain'
                        key={editPreview || post.media.url} // Key ensures re-render if src changes
                      />
                    ) : (
                      <img
                        src={editPreview || post.media.url}
                        alt='preview'
                        className='w-full h-full object-cover'
                      />
                    )
                  ) : (
                    <div className='text-gray-500'>No media to preview</div>
                  )}
                </div>

                <div className='mt-4 flex gap-3'>
                  <input
                    ref={editFileRef}
                    type='file'
                    accept='image/*,video/*'
                    onChange={handleEditFileChange}
                    className='hidden'
                  />
                  <button
                    type='button'
                    onClick={() => editFileRef.current?.click()}
                    className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium'
                  >
                    Change Media
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setEditMediaFile(null)
                      setEditPreview(null)
                      if (editFileRef.current) editFileRef.current.value = null
                    }}
                    className='px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition font-medium'
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor='edit-caption'
                  className='text-sm text-gray-300 block mb-2 font-semibold'
                >
                  Caption
                </label>
                <textarea
                  id='edit-caption'
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  placeholder="What's on your mind?"
                  className='w-full p-3 bg-gray-800 rounded-lg border border-gray-700 resize-none text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition'
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowEditModal(false)}
                  className='px-6 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition font-medium'
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-3 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50'
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              {message && (
                <div className='text-sm text-red-400 mt-4 text-center'>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostById
