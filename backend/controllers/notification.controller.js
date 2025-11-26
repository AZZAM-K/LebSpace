import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })

    res.status(200).json({ notifications })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndDelete(id)
    res.status(200).json({ message: 'Notification deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.userId,
      type: { $ne: 'request' },
    })
    res.status(200).json({ message: 'All notifications cleared successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
