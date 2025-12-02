import jwt from 'jsonwebtoken'

export const generateToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return token
}

export const verifyToken = token => {
  try {
    const slicedToken = token.replace('Bearer ', '')
    const decoded = jwt.verify(slicedToken, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}
