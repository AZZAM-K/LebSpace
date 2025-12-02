import Message from '../models/Message.js'
import Chat from '../models/Chat.js'
import { io } from '../server.js'

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' })
    }

    const chat = await Chat.findById(id)
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.userId.toString()
    )
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' })
    }

    const isReceiverInChat = io.sockets.adapter.rooms.get(`chat:${id}`)
    const receiverIsInsideThisChat = isReceiverInChat?.size > 1

    let read = false

    if (receiverIsInsideThisChat) {
      read = true
    }

    const message = new Message({
      chat: chat._id,
      sender: req.userId,
      text,
      read,
    })
    await message.save()

    chat.messages.push(message._id)
    chat.lastMessage = message._id
    await chat.save()

    if (io) {
      const payload = {
        chatId: chat._id,
        msg: {
          _id: message._id,
          text: message.text,
          sender: message.sender,
          edited: message.edited,
          read: true,
          createdAt: message.createdAt,
        },
      }
      io.to(`chat:${chat._id}`).emit('message:created', payload)
      io.emit('chat:updated', {
        chatId: chat._id,
        lastMessage: payload.msg,
      })
    }

    res.status(201).json({
      message: 'Message sent',
      msg: {
        _id: message._id,
        text: message.text,
        sender: message.sender,
        edited: message.edited,
        read: message.read,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' })
    }

    const message = await Message.findById(id)
    if (!message) return res.status(404).json({ message: 'Message not found' })

    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not allowed' })
    }

    message.text = text
    message.edited = true
    await message.save()

    if (io) {
      const payload = {
        chatId: message.chat,
        msg: {
          _id: message._id,
          text: message.text,
          sender: message.sender,
          edited: message.edited,
          read: message.read,
          updatedAt: message.updatedAt,
        },
      }
      io.to(`chat:${message.chat}`).emit('message:updated', payload)
    }

    res.status(200).json({
      message: 'Message updated',
      msg: {
        _id: message._id,
        text: message.text,
        sender: message.sender,
        edited: message.edited,
        read: message.read,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params

    const message = await Message.findById(id)
    if (!message) return res.status(404).json({ message: 'Message not found' })

    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not allowed' })
    }

    const chat = await Chat.findById(message.chat)
    if (chat) {
      chat.messages = chat.messages.filter(
        m => m.toString() !== message._id.toString()
      )

      if (
        chat.lastMessage &&
        chat.lastMessage.toString() === message._id.toString()
      ) {
        const last = await Message.findOne({ chat: chat._id }).sort({
          createdAt: -1,
        })
        chat.lastMessage = last ? last._id : undefined
      }

      await chat.save()

      if (io) {
        io.to(`chat:${chat._id}`).emit('message:deleted', {
          chatId: chat._id,
          messageId: message._id,
        })
        io.to(`chat:${chat._id}`).emit('chat:updated', {
          chatId: chat._id,
          lastMessage: chat.lastMessage ? { _id: chat.lastMessage } : null,
        })
      }
    }

    await message.deleteOne()

    res.status(200).json({ message: 'Message deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.userId.toString()
    )
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' })
    }

    const messages = await Message.updateMany(
      {
        chat: chatId,
        read: false,
        sender: { $ne: req.userId },
      },
      { read: true }
    )

    const messagesToUpdate = []
    if (messages.modifiedCount > 0) {
      const updatedMessages = await Message.find({
        chat: chatId,
        sender: { $ne: req.userId },
        read: true,
      })

      messagesToUpdate.push(
        ...updatedMessages.map(m => ({
          _id: m._id,
          read: true,
        }))
      )

      if (io) {
        io.to(`chat:${chatId}`).emit('messages:read', {
          chatId,
          messages: messagesToUpdate,
          readBy: req.userId,
        })
      }
    }

    res.status(200).json({
      message: 'Messages marked as read',
      data: { messagesRead: messages.modifiedCount },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
