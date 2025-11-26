import express from 'express'
import dotenv from '@dotenvx/dotenvx'
import connectDB from './config/db.js'
import userRouter from './routes/user.route.js'
import NotificationRouter from './routes/notification.route.js'
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
app.use('/api/notifications', NotificationRouter)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await connectDB()
})
