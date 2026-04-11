const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth.routes')
const deckRoutes = require('./routes/deck.routes')
const studyRoutes = require('./routes/study.routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many uploads. Please wait.' } })

app.use('/api/', limiter)
app.use('/api/decks/upload', uploadLimiter)

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/decks', deckRoutes)
app.use('/api/study', studyRoutes)

app.use((req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }))
app.use(errorHandler)

module.exports = app
