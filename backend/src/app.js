const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const deckRoutes = require('./routes/deck.routes');
const studyRoutes = require('./routes/study.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ✅ Trust proxy (important for Render/Vercel deployment)
app.set('trust proxy', 1);

// ✅ Security headers
app.use(helmet());

// ✅ CORS (Final Fix)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    // Allow Vercel subdomains + allowed URLs
    if (
      (origin && origin.endsWith('.vercel.app')) ||
      allowed.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle preflight requests properly (VERY IMPORTANT)
app.options('*', cors());

// ✅ Rate limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many uploads. Please wait.' }
});

// Apply limiters
app.use('/api/', limiter);
app.use('/api/decks/upload', uploadLimiter);

// ✅ Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/study', studyRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ✅ Global error handler (CORS-safe)
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  return errorHandler(err, req, res, next);
});

module.exports = app;
