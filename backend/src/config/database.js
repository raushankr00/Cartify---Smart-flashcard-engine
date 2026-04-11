const mongoose = require('mongoose')

module.exports = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  const conn = await mongoose.connect(uri)
  console.log(`✅ MongoDB: ${conn.connection.host}`)
}
