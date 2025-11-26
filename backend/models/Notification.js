import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'message', 'request'],
      required: true,
    },

    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },

    message: { type: String, default: '' },
  },
  { timestamps: true }
)

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification
