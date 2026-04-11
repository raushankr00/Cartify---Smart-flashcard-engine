module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err.message)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: Object.values(err.errors).map(e => e.message).join(', ') })
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: `${Object.keys(err.keyValue)[0]} already exists` })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID' })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  })
}
