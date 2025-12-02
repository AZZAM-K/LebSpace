import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    contentType: {
      type: String,
      enum: ['image', 'video', 'text'],
      required: true,
    },

    media: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },

    caption: { type: String, default: '' },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
)

const Post = mongoose.model('Post', PostSchema)
export default Post
