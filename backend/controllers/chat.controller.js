import Chat from '../models/Chat.js'
import User from '../models/User.js'
import Message from '../models/Message.js'

export const getChats = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select('blockedUsers')

    const chats = await Chat.find({ participants: req.userId })
      .populate(
        'participants',
        'username fullName profilePicture isOnline blockedUsers'
      )
      .populate({
        path: 'lastMessage',
        select: 'sender text read createdAt',
      })
      .sort({ updatedAt: -1 })

    if (!chats || chats.length === 0) {
      return res.status(200).json({ chats: [] })
    }

    const chatPromises = chats
      .filter(chat => {
        const otherParticipant = chat.participants.find(
          p => p._id.toString() !== req.userId.toString()
        )

        const isBlocked = currentUser.blockedUsers.includes(
          otherParticipant._id
        )

        const isBlockedByOther = otherParticipant.blockedUsers?.includes(
          req.userId
        )

        return !isBlocked && !isBlockedByOther
      })
      .map(async chat => {
        const otherParticipant = chat.participants.find(
          p => p._id.toString() !== req.userId.toString()
        )

        const unreadMessages = await Message.countDocuments({
          chat: chat._id,
          sender: otherParticipant._id,
          read: false,
        })

        return {
          _id: chat._id,
          participant: otherParticipant,
          lastMessage: chat.lastMessage,
          unread: unreadMessages,
        }
      })

    const formattedChats = await Promise.all(chatPromises)

    res.status(200).json({ chats: formattedChats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getChatById = async (req, res) => {
  try {
    const { id } = req.params

    const chat = await Chat.findById(id)
      .populate(
        'participants',
        'username profilePicture isOnline blockedUsers lastSeen'
      )
      .populate({
        path: 'messages',
        select: 'sender text edited read',
      })

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.userId.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const otherParticipant = chat.participants.find(
      p => p._id.toString() !== req.userId.toString()
    )

    const currentUser = chat.participants.find(
      p => p._id.toString() === req.userId.toString()
    )

    const isBlocked = currentUser.blockedUsers?.includes(otherParticipant._id)

    const isBlockedByOther = otherParticipant.blockedUsers?.includes(req.userId)

    if (isBlocked || isBlockedByOther) {
      return res
        .status(403)
        .json({ message: 'You cannot access this chat due to blocking' })
    }

    const formattedChat = {
      _id: chat._id,
      otherParticipant,
      messages: chat.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }

    res.status(200).json(formattedChat)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createChat = async (req, res) => {
  try {
    const { participantId } = req.body
    const currentUserId = req.userId

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' })
    }

    if (participantId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: 'Cannot create chat with yourself' })
    }

    const existingChat = await Chat.findOne({
      participants: {
        $all: [currentUserId, participantId],
      },
    })

    if (existingChat) {
      return res.status(200).json({ chatId: existingChat._id })
    }

    const newChat = new Chat({
      participants: [currentUserId, participantId],
      messages: [],
    })

    await newChat.save()

    res.status(201).json({ chatId: newChat._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
