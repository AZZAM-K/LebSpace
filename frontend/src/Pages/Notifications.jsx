import {
  Bell,
  Heart,
  MessageCircle,
  MessageSquare,
  Trash2,
  UserPlus,
  Loader2,
} from 'lucide-react'
import { useContext, useEffect, useEffectEvent, useState } from 'react'
import { AppContext } from '../Context/context'
import { Link } from 'react-router'

const Notifications = () => {
  const {
    getNotifications,
    deleteNotification,
    clearNotifications,
    acceptFollowRequest,
    declineFollowRequest,
  } = useContext(AppContext)

  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [accepting, setAccepting] = useState(null)
  const [declining, setDeclining] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')

  const fetchNotificationsEvent = useEffectEvent(async () => {
    const result = await getNotifications()
    if (!result.success) {
      setError(result.message || 'Failed to load notifications')
    }
    setNotifications(result.data.notifications)
    setLoading(false)
  })

  useEffect(() => {
    fetchNotificationsEvent()
  }, [])

  const handleClearAll = async () => {
    try {
      setClearing(true)
      const result = await clearNotifications()
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotifications(prev => prev.filter(n => n.type === 'request'))
    } catch (error) {
      setError(error.message)
    }
    setClearing(false)
  }

  const handleAccept = async id => {
    try {
      setAccepting(id)
      const result = await acceptFollowRequest(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotifications(prev =>
        prev.filter(n => n.sender._id !== id && n.type !== 'request')
      )
    } catch (error) {
      setError(error.message)
    }
    setAccepting(null)
  }

  const handleDecline = async id => {
    try {
      setDeclining(id)
      const result = await declineFollowRequest(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotifications(prev =>
        prev.filter(n => n.sender._id !== id && n.type !== 'request')
      )
    } catch (error) {
      setError(error.message)
    }
    setDeclining(null)
  }

  const handleDelete = async id => {
    try {
      const result = await deleteNotification(id)
      if (!result.success) {
        setError(result.message)
        return
      }
      setNotifications(prev => prev.filter(n => n._id !== id))
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

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white w-full pb-20 md:pb-10'>
      <div className='max-w-2xl mx-auto pt-6 px-0 sm:px-4'>
        <div className='flex items-center justify-between px-4 mb-6'>
          <h1 className='text-2xl font-bold tracking-wide'>Notifications</h1>
          <div className='flex gap-2'>
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className='text-xs font-semibold text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800
             px-3 py-1.5 rounded-lg transition-colors'
            >
              {clearing ? (
                <Loader2 className='w-4 h-4 inline-block animate-spin' />
              ) : (
                'Clear All'
              )}
            </button>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          {notifications.length > 0 ? (
            notifications.map(n => {
              return (
                <div
                  key={n._id}
                  className='relative flex gap-4 p-4 transition-all duration-200 border-b border-gray-900/50 hover:bg-gray-900/30'
                >
                  <div className='relative shrink-0 ml-2'>
                    <img
                      src={
                        n.sender.profilePicture.url ||
                        `https://ui-avatars.com/api/?name=${n.sender.username}&background=random`
                      }
                      alt={n.sender.username}
                      className='w-12 h-12 rounded-full object-cover border border-gray-800'
                    />
                    {n.type !== 'request' && (
                      <div
                        className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-[#0a0a0a] text-white
                       flex items-center justify-center w-6 h-6 text-[10px]
                                    ${
                                      n.type === 'like'
                                        ? 'bg-red-500'
                                        : n.type === 'comment'
                                        ? 'bg-blue-500'
                                        : n.type === 'message'
                                        ? 'bg-purple-500'
                                        : n.type === 'follow'
                                        ? 'bg-[#F65C21]'
                                        : ''
                                    }`}
                      >
                        {n.type === 'like' && <Heart size={10} fill='white' />}
                        {n.type === 'comment' && (
                          <MessageCircle size={10} fill='white' />
                        )}
                        {n.type === 'message' && (
                          <MessageSquare size={10} fill='white' />
                        )}
                        {n.type === 'follow' && <UserPlus size={10} />}
                      </div>
                    )}
                  </div>

                  <div className='flex-1 min-w-0 flex flex-col justify-center'>
                    <div className='text-sm text-gray-200'>
                      <Link
                        to={`/users/${n.sender._id}`}
                        className='font-bold text-white mr-1 cursor-pointer hover:underline'
                      >
                        {n.sender.username}
                      </Link>

                      <span className='text-gray-400'>
                        {n.type === 'like' && 'liked your '}
                        {n.type === 'comment' && 'commented on your '}
                        {n.type === 'follow' && 'started following you.'}
                      </span>
                      {(n.type === 'like' || n.type === 'comment') && (
                        <Link
                          to={`/post/${n.post}`}
                          className='text-orange-500 font-bold'
                        >
                          post
                        </Link>
                      )}
                    </div>
                    <span className='text-xs text-gray-600 font-medium mt-0.5'>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.type === 'request' && (
                      <div className='flex gap-3 mt-3'>
                        <button
                          onClick={() => handleAccept(n.sender._id)}
                          disabled={
                            accepting === n.sender._id ||
                            declining === n.sender._id
                          }
                          className='px-4 py-1.5 bg-[#F65C21] hover:bg-orange-600 text-white text-xs font-bold
                         rounded-lg transition-colors shadow-lg shadow-orange-900/20'
                        >
                          {accepting === n.sender._id ? (
                            <Loader2 className='w-4 h-4 inline-block animate-spin' />
                          ) : (
                            'Accept'
                          )}
                        </button>
                        <button
                          onClick={() => handleDecline(n.sender._id)}
                          disabled={
                            accepting === n.sender._id ||
                            declining === n.sender._id
                          }
                          className='px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold
                         rounded-lg transition-colors'
                        >
                          {declining === n.sender._id ? (
                            <Loader2 className='w-4 h-4 inline-block animate-spin' />
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-3'>
                    {n.type !== 'request' && (
                      <button
                        onClick={() => handleDelete(n._id)}
                        className='p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all'
                        title='Clear notification'
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4'>
                <Bell className='text-gray-600 w-8 h-8' />
              </div>
              <h3 className='text-lg font-bold text-white mb-1'>
                No Notifications
              </h3>
              <p className='text-gray-500 text-sm'>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
