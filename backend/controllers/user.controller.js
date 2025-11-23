import User from '../models/User.js'
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
      id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      bio: newUser.bio,
      email: newUser.email,
      img: newUser.profilePicture.url,
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
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      email: user.email,
      img: user.profilePicture.url,
      token: `Bearer ${token}`,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
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
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      email: user.email,
      img: user.profilePicture.url,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
