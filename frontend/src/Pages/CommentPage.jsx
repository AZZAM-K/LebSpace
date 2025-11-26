import React, { useState, useContext, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AppContext } from "../Context/context"

const AllCommentsPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { getPostById, getCommentsByPostId, user, addComment, deleteComment } =
    useContext(AppContext)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)

  const [newComment, setNewComment] = useState("")

  const handleAddComment = async e => {
    e.preventDefault()

    if (!newComment.trim()) return

    const res = await addComment(postId, newComment)

    if (res?.success) {
      setComments(prev => [...prev, res.data.comment])
      setNewComment("")
    } else {
      console.log("Error adding comment")
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const postRes = await getPostById(postId)
      if (postRes?.success) setPost(postRes.data)

      const commentRes = await getCommentsByPostId(postId)
      if (commentRes?.success) setComments(commentRes.data.comments || [])
      else setMessage(commentRes.message)

      setLoading(false)
    }
    load()
  }, [postId])

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center bg-black'>
        <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-black text-white relative'>
      <div className='sticky top-0 bg-black/70 backdrop-blur-xl flex items-center gap-4 px-4 py-4 border-b border-gray-800 z-20 shadow-md'>
        <button
          onClick={() => navigate(`/post/${postId}`)}
          className='p-2 hover:bg-gray-800 rounded-full transition cursor-pointer'
        >
          <svg
            className='w-6 h-6 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
        <p className='text-lg font-bold tracking-wide '>Comments</p>
        <span className='text-sm ml-auto text-gray-400 bg-gray-800 px-4 py-2 rounded-full'>
          {comments.length}
        </span>
      </div>

      <div className='max-w-xl mx-auto px-4 pb-24 pt-6'>
        {message && (
          <div className='bg-red-500/20 text-red-400 border border-red-500/40 p-3 rounded-lg mb-4 text-center'>
            {message}
          </div>
        )}

        {comments.length === 0 ? (
          <div className='text-center text-gray-400 py-16'>
            <p className='mb-4 text-lg font-light tracking-wide'>
              No comments yet
            </p>

            <Link
              to={`/post/${postId}/add-comment`}
              className='px-5 py-2.5 bg-orange-600 rounded-xl hover:bg-orange-700 transition shadow-md font-medium'
            >
              Add a comment
            </Link>
          </div>
        ) : (
          <div className='space-y-6'>
            {comments.map(c => (
              <div
                key={c._id}
                className='relative flex items-start gap-3 bg-gray-900/40 p-3 rounded-xl border border-gray-800 hover:bg-gray-900/70 transition'
              >
                <img
                  src={
                    user?.profilePicture?.url ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                  alt='Profile'
                  className='w-10 h-10 rounded-full object-cover border-4 border-black bg-gray-800'
                />

                <div className='flex-1'>
                  <p className='text-sm leading-relaxed'>
                    <span className='font-semibold mr-2 text-orange-400'>
                      {c.user?.username}
                    </span>
                    <span className='text-gray-200'>{c.text}</span>
                  </p>

                  <div className='flex items-center gap-6 text-xs text-gray-500 mt-2'>
                    <span>
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* 3 DOTS BUTTON */}
                {user?._id === c.user?._id && (
                  <div className='relative'>
                    <button
                      onClick={() =>
                        setOpenMenuId(prev => (prev === c._id ? null : c._id))
                      }
                      className='p-2 hover:bg-gray-800 rounded-full transition'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-5 h-5 text-gray-300'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
                        />
                      </svg>
                    </button>

                    {/* MENU */}
                    {openMenuId === c._id && (
                      <div className='absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-xl shadow-lg w-32 py-2 z-50'>
                        <button
                          onClick={async () => {
                            const res = await deleteComment(c._id)

                            if (
                              res.success ||
                              res.message === "Comment deleted successfully"
                            ) {
                              const fresh = await getCommentsByPostId(postId)
                              if (fresh?.success) {
                                setComments(fresh.data.comments || [])
                              }
                            }

                            setOpenMenuId(null)
                          }}
                          className='w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition text-sm'
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='fixed bottom-0 w-full md:w-auto left-0 -right-65 bg-black/80 backdrop-blur-xl border-t border-gray-800 p-3 z-30'>
        <form
          onSubmit={handleAddComment}
          className='max-w-xl mx-auto flex items-center gap-3'
        >
          <input
            type='text'
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder='Write a comment...'
            className='flex-1 px-4 py-2 bg-gray-900 border border-gray-700 
            rounded-xl text-sm mb-19 w-19 md:mb-0 text-white outline-none focus:border-orange-600'
          />

          <button
            type='submit'
            className='px-8 py-2 bg-orange-600 mb-19 md:mb-0 rounded-xl font-medium hover:bg-orange-700 
            transition shadow-md'
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default AllCommentsPage
