require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/database')

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`)
  })
}

start().catch(err => {
  console.error('Startup failed:', err.message)
  process.exit(1)
})
