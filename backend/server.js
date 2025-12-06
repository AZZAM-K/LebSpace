import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import connectDB from './config/db.js'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import storyRouter from './routes/story.route.js'
import commentRouter from './routes/comment.route.js'
import NotificationRouter from './routes/notification.route.js'
import chatRouter from './routes/chat.route.js'
import messageRouter from './routes/message.route.js'
import { Server } from 'socket.io'
import { verifyToken } from './utils/jwt.js'
import User from './models/User.js'

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

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.use('/api/users', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/comment', commentRouter)
app.use('/api/notifications', NotificationRouter)
app.use('/api/chats', chatRouter)
app.use('/api/messages', messageRouter)

const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await connectDB()
})

export const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})

io.on('connection', async socket => {
  console.log('Socket connected:', socket.id)
  try {
    const token = socket.handshake.auth?.token
    const decoded = verifyToken(token)
    if (!decoded) {
      socket.disconnect(true)
      return
    }

    const userId = decoded.id
    socket.userId = userId

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    })

    io.emit('user:online', { userId })

    socket.on('join:chat', chatId => {
      socket.join(`chat:${chatId}`)
    })

    socket.on('leave:chat', chatId => {
      socket.leave(`chat:${chatId}`)
    })

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      })
      io.emit('user:offline', { userId })
    })
  } catch (err) {
    socket.disconnect(true)
  }
})
