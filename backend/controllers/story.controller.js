import Story from '../models/Story.js'
import { cloudinary } from '../config/uploader.js'
import User from '../models/User.js'

const uploadToCloudinary = (fileBuffer, contentType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: contentType === 'video' ? 'video' : 'image',
        folder: 'stories',
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )

    uploadStream.end(fileBuffer)
  })
}

export const addStory = async (req, res) => {
  try {
    const userId = req.userId
    const { contentType } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded!' })
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      contentType
    )

    const newStory = new Story({
      user: userId,
      contentType: contentType || 'image',
      media: {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      },
      expiresAt,
    })

    await newStory.save()

    return res
      .status(201)
      .json({ message: 'Story added for 24 hours', story: newStory })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getMyStories = async (req, res) => {
  try {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const stories = await Story.find({
      user: req.userId,
      createdAt: { $gte: twentyFourHoursAgo },
      expiresAt: { $gt: now },
    })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, stories })
  } catch (err) {
    console.error('Error fetching user stories:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params
    const userId = req.userId
    const story = await Story.findById(storyId)

    if (!story) return res.status(404).json({ message: 'Story not found' })

    if (String(story.user) !== String(userId))
      return res.status(403).json({ message: 'Not authorized' })

    if (story.media.public_id) {
      const type = story.contentType === 'video' ? 'video' : 'image'
      await cloudinary.uploader.destroy(story.media.public_id, {
        resource_type: type,
      })
    }
    await Story.findByIdAndDelete(storyId)
    res.status(200).json({ message: 'Story deleted successfully' })
  } catch (err) {
    console.error('Error deleting story:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getFollowingStories = async (req, res) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Missing userId in token' })
    }

    const user = await User.findById(userId).select('following')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const followingIds = user.following || []

    if (followingIds.length === 0) {
      return res.status(200).json({
        success: true,
        stories: [],
        message: 'No following users',
      })
    }

    const stories = await Story.find({
      user: { $in: followingIds },
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      stories,
    })
  } catch (error) {
    console.error('Error fetching following stories:', error)
    return res
      .status(500)
      .json({ message: 'Server error fetching following stories' })
  }
}

export const getUserViewedStories = async (req, res) => {
  try {
    const { storyId } = req.params
    const story = await Story.findById(storyId).populate(
      'viewers',
      'username profilePicture img _id'
    )

    if (!story) return res.status(404).json({ message: 'Story not found' })

    res.status(200).json({
      success: true,
      viewers: story.viewers || [],
      count: story.viewers.length,
    })
  } catch (err) {
    console.error('Error fetching story viewers:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const addViewer = async (req, res) => {
  try {
    const { storyId } = req.params
    const userId = req.userId

    const story = await Story.findById(storyId)
    if (!story) return res.status(404).json({ message: 'Story not found' })

    const alreadyViewed = story.viewers.some(
      v => v.toString() === userId.toString()
    )

    if (!alreadyViewed) {
      story.viewers.push(userId)
      story.viewsCount = story.viewsCount + 1
      await story.save()
    }

    const populatedStory = await Story.findById(storyId).populate(
      'viewers',
      'username profilePicture _id'
    )

    res.status(200).json({
      success: true,
      viewers: populatedStory.viewers,
      viewsCount: populatedStory.viewsCount,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error adding viewer' })
  }
}
