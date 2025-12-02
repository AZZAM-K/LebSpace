import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: { type: Date, default: Date.now },
      },
    ],
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Message = mongoose.model('Message', MessageSchema)
export default Message
