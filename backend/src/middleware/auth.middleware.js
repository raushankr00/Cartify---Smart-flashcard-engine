const jwt  = require('jsonwebtoken')
const User = require('../models/User.model')

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ success: false, error: 'Please log in to continue.' })

    const token = auth.split(' ')[1]
    const { id } = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(id)
    if (!user) return res.status(401).json({ success: false, error: 'User no longer exists.' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' })
    return res.status(401).json({ success: false, error: 'Invalid token.' })
  }
}
