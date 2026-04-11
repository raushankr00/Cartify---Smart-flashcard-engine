const multer = require('multer')
const pdfParse = require('pdf-parse')
const { generateCards, suggestTitle } = require('../services/cardGen.service')
const Deck = require('../models/Deck.model')

// Multer: memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are supported'))
  }
}).single('pdf')

// Deck cover colors — rotated per user
const COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#84CC16']
const pickColor = (idx) => COLORS[idx % COLORS.length]

// POST /api/decks/upload
exports.uploadDeck = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message })
    if (!req.file) return res.status(400).json({ success: false, error: 'No PDF uploaded' })

    try {
      // 1. Extract text from PDF
      const parsed = await pdfParse(req.file.buffer)
      const text   = parsed.text?.trim()
      if (!text || text.length < 100)
        return res.status(422).json({ success: false, error: 'PDF appears to be empty or image-only. Please use a text-based PDF.' })

      // 2. Determine deck title
      const customTitle = req.body.title?.trim()
      const title = customTitle || await suggestTitle(text)

      // 3. Determine card count (10–30)
      const count = Math.min(30, Math.max(10, parseInt(req.body.cardCount) || 20))

      // 4. Generate cards
      const rawCards = await generateCards(text, title, count)

      // 5. Count existing decks for color rotation
      const deckCount = await Deck.countDocuments({ user: req.user.id })

      // 6. Persist
      const deck = await Deck.create({
        user:       req.user.id,
        title,
        description: req.body.description?.trim() || '',
        sourceFile:  req.file.originalname,
        coverColor:  pickColor(deckCount),
        cards:       rawCards
      })

      res.status(201).json({ success: true, data: deck })
    } catch (e) { next(e) }
  })
}

// GET /api/decks
exports.listDecks = async (req, res, next) => {
  try {
    const decks = await Deck.find({ user: req.user.id })
      .select('title description coverColor totalCards masteredCards dueCards lastStudied streakDays sourceFile createdAt')
      .sort({ updatedAt: -1 })
    res.json({ success: true, data: decks })
  } catch (e) { next(e) }
}

// GET /api/decks/:id
exports.getDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })
    res.json({ success: true, data: deck })
  } catch (e) { next(e) }
}

// DELETE /api/decks/:id
exports.deleteDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })
    res.json({ success: true, message: 'Deck deleted' })
  } catch (e) { next(e) }
}

// GET /api/decks/:id/due  — cards due for review today
exports.getDueCards = async (req, res, next) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, user: req.user.id })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })

    const now = new Date()
    const due = deck.cards
      .filter(c => new Date(c.nextReview) <= now)
      .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))

    res.json({ success: true, data: { deckId: deck._id, title: deck.title, cards: due } })
  } catch (e) { next(e) }
}
