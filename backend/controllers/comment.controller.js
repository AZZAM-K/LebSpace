import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Notification from '../models/Notification.js'

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.userId
    const { content } = req.body

    if (!content || content.trim() === '') {
      return res
        .status(400)
        .json({ message: 'Comment content cannot be empty' })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const newComment = new Comment({
      user: userId,
      post: postId,
      text: content.trim(),
    })

    await newComment.save()

    if (post.user.toString() !== userId.toString()) {
      const newNotification = new Notification({
        user: post.user,
        sender: userId,
        post: postId,
        type: 'comment',
      })
      await newNotification.save()
    }

    post.comments.push(newComment._id)
    await post.save()

    const populatedComment = await Comment.findById(newComment._id).populate(
      'user',
      'username fullName profilePicture'
    )

    return res.status(201).json({
      message: 'Comment added',
      comment: populatedComment,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
    return res.status(200).json({ success: true, comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getCountOfComments = async (req, res) => {
  try {
    const { postId } = req.params
    const count = await Comment.countDocuments({ post: postId })

    return res.status(200).json({ success: true, count })
  } catch (error) {
    console.error('Error fetching comments count:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const userId = req.userId

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const post = await Post.findById(comment.post)

    if (
      comment.user.toString() !== userId.toString() &&
      post.user.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await Comment.findByIdAndDelete(commentId)

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    })

    return res.json({ success: true, message: 'Comment deleted' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}
