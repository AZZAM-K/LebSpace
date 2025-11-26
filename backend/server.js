import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import connectDB from './config/db.js'

import './models/User.js'
import './models/Post.js'
import './models/Comment.js'
import './models/Story.js'

import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import storyRouter from './routes/story.route.js'
import commentRouter from './routes/comment.route.js'
import cors from 'cors'

dotenv.config()
const PORT = process.env.PORT

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/comment', commentRouter)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await connectDB()
})
