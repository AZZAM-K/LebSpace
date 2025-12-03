import { Link, useParams } from 'react-router'
import { useState, useEffect, useContext, useRef, useEffectEvent } from 'react'
import { AppContext } from '../Context/context'
import {
  ChevronLeft,
  Check,
  CheckCheck,
  Edit2,
  X,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react'

const Chat = () => {
  const {
    getChatById,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    socket,
    user,
  } = useContext(AppContext)
  const { id } = useParams()

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otherUser, setUser] = useState(null)

  const messagesEndRef = useRef(null)

  const fetchChatEvent = useEffectEvent(async () => {
    const res = await getChatById(id)
    if (!res.success) {
      setError(res.message || 'Failed to load chat')
    }

    setUser(res.data.otherParticipant)
    setMessages(res.data.messages)
    await markMessagesAsRead(id)
    setLoading(false)
  })

  useEffect(() => {
    fetchChatEvent()
  }, [])

  useEffect(() => {
    if (!socket || !id) return

    const join = () => socket.emit('join:chat', id)
    join()

    const onCreated = payload => {
      if (payload.chatId !== id) return
      const incoming = payload.msg
      setMessages(prev => {
        if (prev.some(m => m._id === incoming._id)) return prev
        return [...prev, { ...incoming }]
      })
    }

    const onUpdated = payload => {
      if (payload.chatId !== id) return
      const incoming = payload.msg
      setMessages(prev =>
        prev.map(m =>
          m._id === incoming._id
            ? { ...m, text: incoming.text, edited: incoming.edited }
            : m
        )
      )
    }

    const onDeleted = payload => {
      if (payload.chatId !== id) return
      const { messageId } = payload
      setMessages(prev => prev.filter(m => m._id !== messageId))
    }

    const onRead = payload => {
      if (payload.chatId !== id) return
      const { messages: readMessages } = payload
      setMessages(prev =>
        prev.map(m => {
          const readMsg = readMessages.find(rm => rm._id === m._id)
          if (readMsg) {
            return { ...m, read: true }
          }
          return m
        })
      )
    }

    const onUserOnline = payload => {
      if (payload.userId === otherUser?._id) {
        setUser(prev => ({ ...prev, isOnline: true }))
      }
    }

    const onUserOffline = payload => {
      if (payload.userId === otherUser?._id) {
        setUser(prev => ({
          ...prev,
          isOnline: false,
          lastSeen: new Date(),
        }))
      }
    }

    socket.on('user:online', onUserOnline)
    socket.on('user:offline', onUserOffline)

    socket.on('message:created', onCreated)
    socket.on('message:updated', onUpdated)
    socket.on('message:deleted', onDeleted)
    socket.on('messages:read', onRead)

    return () => {
      socket.emit('leave:chat', id)
      socket.off('message:created', onCreated)
      socket.off('message:updated', onUpdated)
      socket.off('message:deleted', onDeleted)
      socket.off('messages:read', onRead)
    }
  }, [socket, id, markMessagesAsRead, otherUser?._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  const handleSendMessage = async e => {
    e.preventDefault()
    if (!inputText.trim()) return

    try {
      if (editingMessageId) {
        const res = await editMessage(editingMessageId, { text: inputText })
        if (!res.success) {
          setError(res.message)
          return
        }
        setMessages(prev =>
          prev.map(msg =>
            msg._id === editingMessageId
              ? {
                  ...msg,
                  text: res.data.msg.text,
                  edited: res.data.msg.edited,
                }
              : msg
          )
        )
        setEditingMessageId(null)
      } else {
        const res = await sendMessage(id, { text: inputText })
        if (!res.success) {
          setError(res.message)
          return
        }
        setMessages([...messages, res.data.msg])
      }
      setInputText('')
    } catch (error) {
      setError(error.message || 'Something went wrong')
    }
  }

  const handleEditClick = msg => {
    setInputText(msg.text)
    setEditingMessageId(msg._id)
  }

  const handleCancelEdit = () => {
    setInputText('')
    setEditingMessageId(null)
  }

  const handleDeleteMessage = async id => {
    if (confirm('Delete this message?')) {
      try {
        const res = await deleteMessage(id)
        if (!res.success) {
          setError(res.message)
          return
        }

        setMessages(prev => prev.filter(msg => msg._id !== id))
      } catch (error) {
        setError(error.message || 'Something went wrong')
      }
    }
  }

  const formatLastSeenTime = date => {
    const d = new Date(date)
    const now = new Date()
    const diff = (now - d) / 1000

    if (diff < 60) return 'just now'
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday'
    }

    const daysDiff = Math.floor(diff / 86400)
    if (daysDiff < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' })
    }

    return d.toLocaleDateString('en-GB')
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
    <div className='flex-1 flex flex-col bg-black relative w-full min-h-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]'>
      <div
        className='h-16 px-4 flex items-center justify-between border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur-md
       sticky top-16.25 z-30'
      >
        <div className='flex items-center gap-3'>
          <Link
            to={`/messages`}
            className='md:hidden text-gray-400 hover:text-white'
          >
            <ChevronLeft size={24} />
          </Link>
          <div className='relative cursor-pointer'>
            <img
              src={
                otherUser.profilePicture?.url ||
                `https://ui-avatars.com/api/?name=${otherUser?.username}&background=random`
              }
              alt='User'
              className='w-10 h-10 rounded-full object-cover'
            />
            {otherUser.isOnline && (
              <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0a0a0a] rounded-full'></span>
            )}
          </div>
          <div className='cursor-pointer'>
            <h2 className='font-bold text-white text-base'>
              {otherUser.username}
            </h2>
            <p className='text-xs text-gray-500'>
              {otherUser.isOnline
                ? 'Online'
                : otherUser.lastSeen && formatLastSeenTime(otherUser.lastSeen)}
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pb-10'>
        {messages.map(msg => {
          const senderId =
            typeof msg.sender === 'object'
              ? msg.sender._id || msg.sender.toString()
              : String(msg.sender)
          const isMine =
            senderId === user?.id || String(msg.sender) === user?.id
          return (
            <div
              key={msg._id}
              className={`flex ${
                isMine ? 'justify-end' : 'justify-start'
              } group`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-[65%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-md ${
                  isMine
                    ? 'bg-[#F65C21] text-white rounded-br-none'
                    : 'bg-[#1f1f1f] text-gray-100 rounded-bl-none'
                }`}
              >
                <p className='wrap-break-word'>
                  {msg.text}
                  {msg.edited && (
                    <span className='text-[10px] opacity-70 ml-1 italic'>
                      (edited)
                    </span>
                  )}
                </p>

                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    isMine ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {isMine && (
                    <span>
                      {msg.read ? (
                        <CheckCheck size={12} className='text-blue-600' />
                      ) : (
                        <Check size={12} />
                      )}
                    </span>
                  )}
                </div>

                {isMine && (
                  <div
                    className='absolute top-0 -left-18 h-full flex items-center gap-2 opacity-0 group-hover:opacity-100
                   transition-opacity px-2'
                  >
                    <button
                      onClick={() => handleEditClick(msg)}
                      className='p-1.5 bg-[#1f1f1f] rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition'
                      title='Edit'
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className='p-1.5 bg-[#1f1f1f] rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700 transition'
                      title='Delete'
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <div className='sticky bottom-20 md:bottom-0 z-40 p-3 md:p-4 bg-[#0a0a0a] border-t border-gray-800'>
        {editingMessageId && (
          <div className='flex justify-between items-center bg-[#161616] p-2 px-4 mb-2 rounded-lg border-l-4 border-[#F65C21]'>
            <div className='flex flex-col'>
              <span className='text-[#F65C21] text-xs font-bold'>
                Editing Message
              </span>
              <span className='text-gray-400 text-xs truncate max-w-xs'>
                {messages.find(m => m._id === editingMessageId)?.text}
              </span>
            </div>
            <button
              onClick={handleCancelEdit}
              className='text-gray-400 hover:text-white'
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className='flex items-center gap-2 md:gap-3'
        >
          <div
            className='flex-1 bg-[#1f1f1f] rounded-2xl flex items-center gap-2 px-4 py-2 border border-transparent
           focus-within:border-[#F65C21] transition-all'
          >
            <input
              type='text'
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder='Type a message...'
              className='w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500 py-1'
            />
          </div>

          <button
            type='submit'
            className='p-3 bg-[#F65C21] hover:bg-orange-600 text-white rounded-full transition-transform active:scale-95
             shadow-lg shadow-orange-900/20 flex justify-center items-center'
          >
            {editingMessageId ? <Check size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
