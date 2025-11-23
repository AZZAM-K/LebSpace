import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import dotenv from '@dotenvx/dotenvx'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'video/mp4') {
      cb(null, true)
    } else {
      cb(new Error('Only image and mp4 video files are allowed!'), false)
    }
  },
})

export { cloudinary, upload }
