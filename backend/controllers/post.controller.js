import Post from '../models/Post.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { cloudinary } from '../config/uploader.js'

const uploadToCloudinary = (fileBuffer, type) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: type },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

export const addPost = async (req, res) => {
  try {
    const { contentType, caption } = req.body
    const userId = req.userId
    let mediaData = { url: '', public_id: '' }

    if (req.file) {
      const type = contentType === 'video' ? 'video' : 'image'
      const result = await uploadToCloudinary(req.file.buffer, type)
      mediaData = { url: result.secure_url, public_id: result.public_id }
    }

    const newPost = new Post({
      user: userId,
      contentType,
      media: mediaData,
      caption: caption || '',
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
    })

    const savedPost = await newPost.save()

    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } })

    res.status(201).json(savedPost)
  } catch (error) {
    console.error('Error adding post:', error)
    res.status(500).json({ message: error.message || 'Server error' })
  }
}

export const editPost = async (req, res) => {
  try {
    const { postId } = req.params
    const { caption, contentType } = req.body
    const userId = req.userId

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (post.user.toString() !== userId.toString())
      return res.status(403).json({ message: 'Not authorized' })

    if (caption !== undefined) post.caption = caption
    if (contentType) post.contentType = contentType

    if (req.file) {
      const type = contentType === 'video' ? 'video' : 'image'

      if (post.media.public_id) {
        await cloudinary.uploader.destroy(post.media.public_id, {
          resource_type: type,
        })
      }

      const result = await uploadToCloudinary(req.file.buffer, type)
      post.media = { url: result.secure_url, public_id: result.public_id }
    }

    const updatedPost = await post.save()
    res.status(200).json(updatedPost)
  } catch (error) {
    console.error('Error editing post:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.userId

    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    if (String(post.user) !== String(userId))
      return res.status(403).json({ message: 'Not authorized' })

    if (post.media.public_id) {
      const type = post.contentType === 'video' ? 'video' : 'image'
      await cloudinary.uploader.destroy(post.media.public_id, {
        resource_type: type,
      })
    }

    await Post.findByIdAndDelete(postId)

    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } })

    await Notification.deleteMany({ post: postId })

    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findById(postId)
      .populate('user', 'username fullname profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username fullname profilePicture',
        },
      })

    if (!post) return res.status(404).json({ message: 'Post not found' })

    res.status(200).json(post)
  } catch (error) {
    console.error(' Error fetching post:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const addLikeAndRemoveLike = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.userId
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const hasLiked = post.likes.includes(userId)

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString())
      await Notification.deleteOne({
        sender: userId,
        post: post._id,
        type: 'like',
      })
    } else {
      post.likes.push(userId)
      const newNotification = new Notification({
        user: post.user,
        sender: userId,
        post: post._id,
        type: 'like',
      })
      await newNotification.save()
    }
    await post.save()

    return res
      .status(200)
      .json({ success: true, liked: !hasLiked, likesCount: post.likes.length })
  } catch (error) {
    console.error('Error toggling like:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getCountOfLikes = async (req, res) => {
  try {
    const { postId } = req.params
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const likesCount = post.likes.length
    return res.status(200).json({ success: true, likesCount })
  } catch (error) {
    console.error('Error fetching likes count:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}
