import User from '../models/User.js'
import Notification from '../models/Notification.js'
import Story from '../models/Story.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import { generateToken } from '../utils/jwt.js'
import bcrypt from 'bcrypt'
import { cloudinary } from '../config/uploader.js'

export const signUp = async (req, res) => {
  try {
    const { username, email, password, dateOfBirth, gender } = req.body
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      email,
      dateOfBirth,
      gender,
      fullName: username,
      password: hashedPassword,
    })
    await newUser.save()
    const token = generateToken(newUser._id)
    res.status(201).json({
      user: {
        id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        bio: newUser.bio,
        email: newUser.email,
        img: newUser.profilePicture.url,
      },
      token: `Bearer ${token}`,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email not found' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' })
    }
    const token = generateToken(user._id)
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        email: user.email,
        img: user.profilePicture.url,
      },
      token: `Bearer ${token}`,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select(
        '-password -stories -blockedUsers -gender -isOnline -lastSeen -savedPosts -dateOfBirth -email'
      )
      .populate([
        {
          path: 'posts',
          select: 'media contentType likes comments createdAt updatedAt',
        },
      ])

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { username, fullName, bio } = req.body
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const usernameExist = await User.findOne({
      username,
      _id: { $ne: req.userId },
    })
    if (usernameExist) {
      return res.status(400).json({ message: 'Username already taken' })
    }

    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                reject(new Error('Failed to upload avatar: ' + error.message))
              } else {
                resolve(result)
              }
            }
          )
          stream.end(req.file.buffer)
        })

        if (user.profilePicture?.public_id) {
          try {
            await cloudinary.uploader.destroy(user.profilePicture.public_id)
          } catch (deleteError) {
            res.status(500).json({
              message: 'Failed to delete old avatar: ' + deleteError.message,
            })
          }
        }

        user.profilePicture = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        }
      } catch (uploadError) {
        return res.status(500).json({ message: uploadError.message })
      }
    }

    user.username = username || user.username
    user.fullName = fullName || user.fullName
    user.bio = bio || user.bio
    await user.save()
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        email: user.email,
        img: user.profilePicture.url,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params
    const data = await User.findById(id)
      .select('followers following')
      .populate('followers following', 'username fullName profilePicture')

    if (!data) {
      return res.status(404).json({ message: 'User not found' })
    }

    res
      .status(200)
      .json({ followers: data.followers, following: data.following })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
      .select(
        '-password -stories -gender -isOnline -lastSeen -savedPosts -dateOfBirth -email'
      )
      .populate({
        path: 'posts',
        select: 'media likes comments createdAt updatedAt contentType',
      })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const requested = await Notification.findOne({
      user: id,
      sender: req.userId,
      type: 'request',
    })

    const isFollowed = user.followers.includes(req.userId)
    const currentUser = await User.findById(req.userId).select('blockedUsers')
    const isBlocked =
      currentUser.blockedUsers.includes(id) ||
      user.blockedUsers.includes(req.userId)

    res
      .status(200)
      .json({ user, requested: Boolean(requested), isFollowed, isBlocked })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const sendFollowRequest = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.followers.includes(req.userId)) {
      return res.status(400).json({ message: 'Already following this user' })
    }

    const existingRequest = await Notification.findOne({
      user: id,
      sender: req.userId,
      type: 'request',
    })

    if (existingRequest) {
      return res.status(400).json({ message: 'Follow request already sent' })
    }

    const currentUser = await User.findById(req.userId)
    if (currentUser.following.includes(id)) {
      return res.status(400).json({ message: 'Already following this user' })
    }

    if (!user.isPrivate) {
      user.followers.push(req.userId)
      currentUser.following.push(id)
      await currentUser.save()
      await user.save()
    }
    const newNotification = new Notification({
      user: id,
      sender: req.userId,
      type: user.isPrivate ? 'request' : 'follow',
    })
    await newNotification.save()

    res.status(200).json({ message: 'Follow request sent' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelFollowRequest = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findOneAndDelete({
      user: id,
      sender: req.userId,
      type: 'request',
    })

    res.status(200).json({ message: 'Follow request cancelled' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const acceptFollowRequest = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const currentUser = await User.findById(req.userId)

    if (currentUser.followers.includes(id)) {
      return res.status(400).json({ message: 'Already followed by this user' })
    }

    currentUser.followers.push(id)
    user.following.push(req.userId)
    await currentUser.save()
    await user.save()

    await Notification.findOneAndDelete({
      user: req.userId,
      sender: id,
      type: 'request',
    })

    res.status(200).json({ message: 'Follow request accepted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const declineFollowRequest = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findOneAndDelete({
      user: req.userId,
      sender: id,
      type: 'request',
    })

    res.status(200).json({ message: 'Follow request declined' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const currentUser = await User.findById(req.userId)

    currentUser.following = currentUser.following.filter(
      followingId => followingId.toString() !== id.toString()
    )
    user.followers = user.followers.filter(
      followerId => followerId.toString() !== req.userId.toString()
    )

    await currentUser.save()
    await user.save()

    await Notification.findOneAndDelete({
      user: id,
      sender: req.userId,
      type: 'follow',
    })

    res.status(200).json({ message: 'Unfollowed user successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const currentUser = await User.findById(req.userId)
    if (currentUser.blockedUsers.includes(id)) {
      return res.status(400).json({ message: 'User already blocked' })
    }

    currentUser.blockedUsers.push(id)
    currentUser.followers = currentUser.followers.filter(
      followerId => followerId.toString() !== id.toString()
    )
    currentUser.following = currentUser.following.filter(
      followingId => followingId.toString() !== id.toString()
    )

    user.followers = user.followers.filter(
      followerId => followerId.toString() !== req.userId.toString()
    )
    user.following = user.following.filter(
      followingId => followingId.toString() !== req.userId.toString()
    )

    await currentUser.save()
    await user.save()

    res.status(200).json({ message: 'User blocked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params
    const currentUser = await User.findById(req.userId)
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      blockedId => blockedId.toString() !== id.toString()
    )
    await currentUser.save()

    res.status(200).json({ message: 'User unblocked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getSettingsData = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('blockedUsers isPrivate')
      .populate('blockedUsers', 'username fullName profilePicture')

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    user.isPrivate = !user.isPrivate
    await user.save()

    res.status(200).json({ message: 'Privacy setting updated' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.userId)
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllUsersNotFollowing = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const currentUser = await User.findById(req.userId).select('following')

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const users = await User.find({
      _id: {
        $ne: req.userId,
        $nin: currentUser.following,
      },
    })
      .select('_id username fullName profilePicture bio followers following')
      .limit(20)

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error in getAllUsersNotFollowing:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    })
  }
}

export const saveUnsavePost = async (req, res) => {
  try {
    const userId = req.userId
    const { postId } = req.params

    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ error: 'User not found' })

    const alreadySaved = user.savedPosts.includes(postId)

    if (alreadySaved) {
      await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: postId },
      })

      return res.json({
        message: 'Post unsaved',
        saved: false,
      })
    } else {
      await User.findByIdAndUpdate(userId, {
        $push: { savedPosts: postId },
      })

      return res.json({
        message: 'Post saved',
        saved: true,
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}
export const getSavedPostsForUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'username profilePicture' },
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      success: true,
      savedPosts: user.savedPosts,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: 'Query is required' })
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    }).select('username fullName profilePicture')

    return res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server Error' })
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body
    const id = req.userId
    const user = await User.findById(id)
      .populate('posts', 'media')
      .populate('stories', 'media')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const commentIds = await Comment.find({ user: id }).select('_id')
    for (const comment of commentIds) {
      await Post.updateMany(
        { comments: comment._id },
        { $pull: { comments: comment._id } }
      )
    }
    await Comment.deleteMany({ user: id })

    for (const post of user.posts) {
      await User.updateMany(
        { likedPosts: post._id },
        { $pull: { likedPosts: post._id } }
      )

      if (post.media?.public_id) {
        try {
          await cloudinary.uploader.destroy(post.media.public_id)
        } catch (err) {
          console.log('Error deleting post media:', err)
        }
      }

      await User.updateMany(
        { savedPosts: post._id },
        { $pull: { savedPosts: post._id } }
      )
    }
    await Post.deleteMany({ user: id })

    for (const story of user.stories) {
      if (story.media?.public_id) {
        try {
          await cloudinary.uploader.destroy(story.media.public_id)
        } catch (err) {
          console.log('Error deleting story media:', err)
        }
      }
    }
    await Story.deleteMany({ user: id })

    await User.updateMany({ following: id }, { $pull: { following: id } })

    await User.updateMany({ followers: id }, { $pull: { followers: id } })

    await User.updateMany({ blockedUsers: id }, { $pull: { blockedUsers: id } })

    await Notification.deleteMany({ user: id })
    await Notification.deleteMany({ sender: id })

    const chats = await Chat.find({ participants: id })

    for (const chat of chats) {
      await Message.deleteMany({ chat: chat._id })
      await Chat.deleteMany({ _id: chat._id })
    }

    if (user.profilePicture?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.public_id)
      } catch (err) {
        console.log('Error deleting profile picture:', err)
      }
    }

    await User.findByIdAndDelete(id)

    res.status(200).json({ message: 'Account deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
