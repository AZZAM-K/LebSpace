import { useState, useEffect, useEffectEvent, useContext } from 'react'
import { Search, Check, CheckCheck, Mail, Loader2 } from 'lucide-react'
import { AppContext } from '../Context/context'
import { Link } from 'react-router'

const Messages = () => {
  const { getChats, user, socket } = useContext(AppContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchChatsEvent = useEffectEvent(async () => {
    const res = await getChats()
    if (!res.success) {
      setError(res.message || 'Failed to load chats')
    }
    console.log(res.data)
    setChats(res.data.chats)
    setLoading(false)
  })

  useEffect(() => {
    fetchChatsEvent()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('user:online', ({ userId }) => {
      setChats(prev =>
        prev.map(chat =>
          chat.participant._id === userId
            ? { ...chat, participant: { ...chat.participant, isOnline: true } }
            : chat
        )
      )
    })

    socket.on('user:offline', ({ userId }) => {
      setChats(prev =>
        prev.map(chat =>
          chat.participant._id === userId
            ? { ...chat, participant: { ...chat.participant, isOnline: false } }
            : chat
        )
      )
    })

    socket.on('chat:updated', ({ chatId, lastMessage }) => {
      setChats(prev =>
        prev.map(chat =>
          chat._id === chatId
            ? { ...chat, lastMessage: lastMessage, unread: chat.unread + 1 }
            : chat
        )
      )
    })

    return () => {
      socket.off('user:online')
      socket.off('user:offline')
      socket.off('chat:updated')
    }
  }, [socket])

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

  const formatMessageTime = date => {
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

  const filteredChats = chats.filter(
    chat =>
      chat.participant.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chat.participant.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  return (
    <div className='flex-1 flex flex-col bg-[#0a0a0a] min-h-0 w-full pb-20 md:pb-0'>
      <div className='pt-6 px-4 md:px-8 pb-4'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold text-white tracking-wide'>
            Messages
          </h1>
        </div>

        <div className='relative mb-2'>
          <Search className='absolute left-4 top-3.5 text-gray-500 h-5 w-5' />
          <input
            type='text'
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-[#161616] border border-gray-800 hover:border-gray-700 focus:border-[#F65C21] rounded-2xl
               py-3 pl-12 pr-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#F65C21] transition-all'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-2 md:px-6'>
        {filteredChats.length > 0 ? (
          <div className='space-y-1 pb-4'>
            {filteredChats.map(chat => (
              <Link
                to={`/chat/${chat._id}`}
                key={chat._id}
                className='group flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-[#161616] transition-all
                 duration-200 border border-transparent hover:border-gray-800/50'
              >
                <div className='relative shrink-0'>
                  <img
                    src={
                      chat.participant.profilePicture.url ||
                      `https://ui-avatars.com/api/?name=${chat.participant.username}&background=random`
                    }
                    alt={chat.participant.username}
                    className='w-14 h-14 rounded-full object-cover border border-gray-800 group-hover:border-gray-600 transition-colors'
                  />
                  {chat.participant.isOnline && (
                    <span
                      className='absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a0a0a]
                     rounded-full shadow-sm'
                    ></span>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-baseline mb-1'>
                    <h3
                      className={`text-base font-semibold truncate ${
                        chat.unread > 0 ? 'text-white' : 'text-gray-200'
                      }`}
                    >
                      {chat.participant.fullName}
                      <span className='ml-2 text-xs font-normal text-gray-500'>
                        @{chat.participant.username}
                      </span>
                    </h3>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        chat.unread > 0 ? 'text-[#F65C21]' : 'text-gray-500'
                      }`}
                    >
                      {chat?.lastMessage?.createdAt
                        ? formatMessageTime(chat?.lastMessage?.createdAt)
                        : ''}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1 overflow-hidden'>
                      {chat.lastMessage?.sender === user.id && (
                        <span className='text-gray-500'>
                          {chat.lastMessage.read ? (
                            <CheckCheck size={14} className='text-[#F65C21]' />
                          ) : (
                            <Check size={14} />
                          )}
                        </span>
                      )}

                      <p
                        className={`text-sm truncate ${
                          chat.unread > 0
                            ? 'text-gray-200 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        {chat.lastMessage ? (
                          chat.lastMessage.text
                        ) : (
                          <span className='italic text-gray-600'>
                            Start a conversation
                          </span>
                        )}
                      </p>
                    </div>

                    {chat.unread > 0 && (
                      <span
                        className='flex items-center justify-center bg-[#F65C21] text-white text-[10px] font-bold h-5 min-w-5
                       px-1.5 rounded-full ml-3 shadow-sm shadow-orange-500/20'
                      >
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-center'>
            <div className='w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4'>
              <Mail className='text-gray-600 w-8 h-8' />
            </div>
            <p className='text-gray-400 font-medium'>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
