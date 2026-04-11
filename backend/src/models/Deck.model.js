const mongoose = require('mongoose')

// SM-2 spaced repetition fields per card
const cardSchema = new mongoose.Schema({
  front:       { type: String, required: true },   // question / term
  back:        { type: String, required: true },   // answer / definition
  hint:        { type: String, default: '' },
  tags:        [String],

  // SM-2 algorithm state
  interval:    { type: Number, default: 1 },       // days until next review
  repetitions: { type: Number, default: 0 },       // successful reviews in a row
  easeFactor:  { type: Number, default: 2.5 },     // difficulty multiplier (≥ 1.3)
  nextReview:  { type: Date, default: () => new Date() }, // when to show next
  lastReview:  { type: Date, default: null },

  // Stats
  totalReviews:  { type: Number, default: 0 },
  correctCount:  { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['new', 'learning', 'review', 'mastered'],
    default: 'new'
  }
}, { _id: true })

const deckSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 500 },
  sourceFile:  { type: String, default: '' },         // original filename
  coverColor:  { type: String, default: '#3B82F6' },  // hex for deck card bg
  cards:       [cardSchema],

  // Aggregate stats (denormalized for fast reads)
  totalCards:    { type: Number, default: 0 },
  masteredCards: { type: Number, default: 0 },
  dueCards:      { type: Number, default: 0 },
  lastStudied:   { type: Date, default: null },
  streakDays:    { type: Number, default: 0 },
}, { timestamps: true })

// Recompute aggregate stats before every save
deckSchema.pre('save', function (next) {
  const now = new Date()
  this.totalCards    = this.cards.length
  this.masteredCards = this.cards.filter(c => c.status === 'mastered').length
  this.dueCards      = this.cards.filter(c => new Date(c.nextReview) <= now).length
  next()
})

module.exports = mongoose.model('Deck', deckSchema)
