import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AppContext } from "../Context/context"
import {
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
  AlertCircle,
  Loader,
} from "lucide-react"

const PostById = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const {
    getPostById,
    editPost,
    deletePost,
    addLikeAndRemoveLike,
    savePost,
    user,
    setUser,
  } = useContext(AppContext)

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showDblClickHeart, setShowDblClickHeart] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editCaption, setEditCaption] = useState("")
  const [editMediaFile, setEditMediaFile] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("error")

  const menuRef = useRef(null)
  const editFileRef = useRef(null)

  const handleSave = async () => {
    if (!user) return navigate("/login")
    if (saving) return

    const willBookmark = !isBookmarked
    setIsBookmarked(willBookmark)
    setSaving(true)

    try {
      const res = await savePost(postId)

      if (res?.success) {
        let updatedSavedPosts = [...(user.savedPosts || [])]
        if (willBookmark) updatedSavedPosts.push(postId)
        else updatedSavedPosts = updatedSavedPosts.filter(id => id !== postId)

        setUser(prev => ({ ...prev, savedPosts: updatedSavedPosts }))

        setMessage(res.data?.message || (willBookmark ? "Saved" : "Removed"))
        setMessageType("success")
      } else {
        setIsBookmarked(!willBookmark)
        setMessage(res?.message || "Failed to save")
        setMessageType("error")
      }
    } catch (err) {
      setIsBookmarked(!willBookmark)
      setMessage("Error saving post")
      setMessageType("error")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let mounted = true
    const loadPost = async () => {
      try {
        setLoading(true)
        const result = await getPostById(postId)
        if (!mounted) return

        if (result?.success) {
          const fetchedPost = result.data
          setPost(fetchedPost)
          setEditCaption(fetchedPost?.caption || "")
          const likes = fetchedPost?.likes || []
          const currentUserLiked = likes.some(
            l => String(l?._id || l) === String(user?._id || user?.id)
          )
        setIsLiked(Boolean(likedByUser))
        setLikesCount(Array.isArray(likes) ? likes.length : 0)
      } else {
        setMessage(result?.message || 'Failed to load post')
      }
    }

    loadPost()
    return () => (mounted = false)
  }, [postId, getPostById, user?.id, user])

  const handleMediaDblClick = async () => {
    if (!isLiked) {
      setIsLiked(true)
      setShowDblClickHeart(true)
      setTimeout(() => setShowDblClickHeart(false), 800)
      await handleLikeToggle(true)
    }
  }

  const handleLikeToggle = async (forceLike = false) => {
    if (!user) return navigate('/login')

    const actionIsLike = forceLike || !isLiked

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
          const cnt = await getCountOfLikes?.(postId)
          if (cnt?.success) setLikesCount(cnt.data?.likesCount || 0)
        }
      } else {
        setIsLiked(prevLiked)
        setLikesCount(prevCount)
        setMessage("Error updating like")
        setMessageType("error")
      }
    },
    [isLiked, likesCount, user, postId, addLikeAndRemoveLike, navigate]
  )

  const confirmDelete = useCallback(async () => {
    if (!post?._id) return
    setEditLoading(true)
    try {
      const res = await deletePost(post._id)
      if (res?.success) {
        setMessage("Post deleted successfully")
        setMessageType("success")
        setTimeout(() => navigate("/profile"), 1500)
      } else {
        setMessage(res?.message || "Failed to delete post")
        setMessageType("error")
      }
    } catch (err) {
      setMessage(err.message || "Error deleting post")
      setMessageType("error")
    } finally {
      setEditLoading(false)
      setShowDeleteConfirm(false)
      setMenuOpen(false)
    }
  }, [post?._id, deletePost, navigate])

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
    const file = e.target.files?.[0]
    if (file) setEditMediaFile(file)
  }

  const openEdit = useCallback(() => {
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
          setPost(prev => ({ ...prev, caption: editCaption }))
          if (editPreview) {
            setPost(prev => ({
              ...prev,
              media: { ...(prev.media || {}), url: editPreview },
            }))
          }
        } else {
          setMessage(res?.message || "Failed to edit post")
          setMessageType("error")
        }
      } catch (err) {
        setMessage(err.message || "Error editing post")
        setMessageType("error")
      } finally {
        setEditLoading(false)
      }
    },
    [post, editPost, editCaption, editMediaFile]
  )
  useEffect(() => {
    if (!user || !postId) return

    setIsBookmarked(user?.savedPosts?.includes(postId))
  }, [user, postId])

  const isOwner = String(post?.user?._id) === String(user?._id || user?.id)

  const dateString = post?.createdAt
    ? new Date(post.createdAt).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  const userProfileUrl =
    post?.user?.profilePicture?.url ||
    post?.user?.img ||
    `https://ui-avatars.com/api/?name=${post?.user?.username}&background=random`

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center bg-gray-900'>
        <div className='flex flex-col items-center gap-3'>
          <Loader className='w-10 h-10 animate-spin text-orange-500' />
          <p className='text-gray-400'>Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-900'>
        <div className='text-center bg-gray-800 p-8 rounded-lg border border-gray-700'>
          <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-3' />
          <p className='font-bold text-xl text-red-400 mb-2'>Post not found</p>
          <p className='text-gray-400 mb-4'>
            This post may have been deleted or you don't have access to it.
          </p>
          <button
            onClick={() => navigate(-1)}
            className='px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition font-medium'
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwner = String(post.user?._id) === String(user?.id)

  const dateString = post.createdAt
    ? new Date(post.createdAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className='min-h-screen w-full bg-black text-white flex justify-center'>
      <div className='w-full md:max-w-xl lg:max-w-2xl mx-auto min-h-screen border-x border-gray-800/50'>
        <div className='flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 sticky top-0 z-30'>
          <div className='flex items-center'>
            <button
              onClick={() => navigate(-1)}
              className='p-1 rounded-full hover:bg-white/10 transition md:hidden'
              aria-label='Go Back'
            >
              <ChevronLeft className='w-6 h-6' />
            </button>
            <Link
              to={isOwner ? "/profile" : `/users/${post.user?._id}`}
              className='flex items-center gap-3 hover:opacity-80 transition'
            >
              <img
                src={userProfileUrl}
                alt={post.user?.username}
                className='w-10 h-10 rounded-full object-cover border-2 border-orange-500'
              />
              <div>
                <div className='font-bold text-sm md:text-base'>
                  {post.user?.username}
                </div>
                <div className='text-xs text-gray-400'>
                  {post.user?.fullname || "User"}
                </div>
              </div>
            </Link>
          </div>

          {isOwner && (
            <div className='relative' ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className='p-2 rounded-full hover:bg-white/5 transition'
                aria-label='Post Options'
              >
                <MoreVertical className='w-6 h-6 text-gray-300' />
              </button>

              {menuOpen && (
                <div className='absolute right-0 top-10 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-40'>
                  <button
                    onClick={openEdit}
                    className='w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-2 transition'
                  >
                    <Edit className='w-4 h-4' /> Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setMenuOpen(false)
                    }}
                    className='w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-2 text-red-400 transition'
                  >
                    <Trash2 className='w-4 h-4' /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className='relative w-full aspect-square bg-gray-900 flex items-center justify-center overflow-hidden'
          onDoubleClick={handleMediaDblClick}
          style={{ maxHeight: '85vh' }}
        >
          {showDblClickHeart && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/20'>
              <Heart
                className='w-24 h-24 text-orange-500 animate-bounce'
                fill='currentColor'
              />
            </div>
          )}

          {post.media?.url ? (
            post.contentType === "video" ? (
              <video
                src={post.media.url}
                controls
                className='w-full h-full object-contain'
                preload='metadata'
              />
            ) : (
              <img
                src={post.media.url}
                alt='Post content'
                className='w-full h-full object-cover'
              />
            )
          ) : (
            <div className='text-gray-500'>No media available</div>
          )}
        </div>

        <div className='flex items-center justify-between p-3 border-b border-gray-800/50'>
          <div className='flex items-center gap-4'>
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

            <div className='flex items-center gap-1'>
              <Link
                to={`/post/${post._id}/add-comment`}
                className='p-2 hover:bg-white/10 rounded-full transition'
                aria-label='Comment'
              >
                <MessageCircle className='w-6 h-6 text-gray-300' />
              </Link>
            </button>

            <button
              className='p-2 hover:bg-white/10 rounded-full transition'
              aria-label='Send'
            >
              <Send className='w-6 h-6 text-gray-300' />
            </button>
          </div>

          <button
            onClick={handleSave}
            className='p-2 hover:bg-white/10 rounded-full transition'
            aria-label='Save'
          >
            <Bookmark
              fill='currentColor'
              strokeWidth={2}
              className={`w-6 h-6 transition ${
                isBookmarked
                  ? "text-orange-500 fill-orange-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        </div>

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

          <div className='pt-3 text-xs text-gray-500 uppercase tracking-wider'>
            {dateString}
          </div>
        </div>

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
                className='flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition
                 disabled:opacity-50'
                disabled={editLoading}
              >
                {editLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm'>
          <div className='w-full max-w-lg bg-gray-900 rounded-xl border border-gray-800 p-6 my-8 shadow-2xl'>
            <h3 className='text-2xl font-bold mb-6 text-orange-500'>
              Edit Post
            </h3>

            <form onSubmit={submitEdit} className='space-y-6'>
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
                        key={editPreview || post.media.url}
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

        {showEditModal && (
          <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/50'>
            <div className='bg-gray-900 rounded-lg p-6 w-96 border border-gray-700'>
              <h2 className='text-lg font-bold mb-4'>Edit Post</h2>
              <form onSubmit={submitEdit} className='flex flex-col gap-4'>
                <textarea
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  placeholder='Write a caption...'
                  className='bg-gray-800 text-white p-2 rounded-lg border border-gray-700 resize-none'
                  rows={3}
                />

                <div className='flex items-center gap-2'>
                  <input
                    type='file'
                    ref={editFileRef}
                    onChange={handleEditFileChange}
                    accept='image/*,video/*'
                    className='text-sm text-gray-400'
                  />
                  {editPreview && (
                    <div className='w-16 h-16 border border-gray-700 rounded-lg overflow-hidden'>
                      {editMediaFile?.type.startsWith("video") ? (
                        <video
                          src={editPreview}
                          className='w-full h-full object-cover'
                          muted
                          loop
                          autoPlay
                        />
                      ) : (
                        <img
                          src={editPreview}
                          alt='Preview'
                          className='w-full h-full object-cover'
                        />
                      )}
                    </div>
                  )}
                </div>

                {message && (
                  <p
                    className={`text-sm ${
                      messageType === "error"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowEditModal(false)}
                    className='px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={editLoading}
                    className='px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50'
                  >
                    {editLoading ? "Saving..." : "Save"}
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
                  className='w-full p-3 bg-gray-800 rounded-lg border border-gray-700 resize-none text-white focus:ring-1
                   focus:ring-orange-500 focus:border-orange-500 transition'
                  rows={4}
                />
              </div>
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
                  className='px-6 py-3 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition
                   disabled:opacity-50'
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
        )}
      </div>
    </div>
  )
}

export default PostById
