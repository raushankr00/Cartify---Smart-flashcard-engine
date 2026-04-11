const Deck = require('../models/Deck.model')
const sm2  = require('../utils/sm2')

/**
 * POST /api/study/:deckId/review
 * Body: { cardId, rating }  (rating 0–5)
 */
exports.reviewCard = async (req, res, next) => {
  try {
    const { cardId, rating } = req.body
    if (typeof rating !== 'number' || rating < 0 || rating > 5)
      return res.status(400).json({ success: false, error: 'Rating must be 0–5' })

    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user.id })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })

    const card = deck.cards.id(cardId)
    if (!card) return res.status(404).json({ success: false, error: 'Card not found' })

    // Apply SM-2
    const updated = sm2(card, rating)
    Object.assign(card, updated)
    card.totalReviews += 1
    if (rating >= 3) card.correctCount += 1

    // Update deck-level metadata
    deck.lastStudied = new Date()

    // Simple streak: if last studied was yesterday or today, increment; else reset
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (!deck.lastStudied || new Date(deck.lastStudied).toDateString() === yesterday.toDateString()) {
      deck.streakDays = (deck.streakDays || 0) + 1
    } else if (new Date(deck.lastStudied).toDateString() !== new Date().toDateString()) {
      deck.streakDays = 1
    }

    await deck.save()

    res.json({
      success: true,
      data: {
        cardId,
        nextReview: card.nextReview,
        interval:   card.interval,
        status:     card.status,
        dueCards:   deck.dueCards
      }
    })
  } catch (e) { next(e) }
}

/**
 * GET /api/study/:deckId/stats
 */
exports.deckStats = async (req, res, next) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.deckId, user: req.user.id })
    if (!deck) return res.status(404).json({ success: false, error: 'Deck not found' })

    const now = new Date()
    const statusCounts = { new: 0, learning: 0, review: 0, mastered: 0 }
    deck.cards.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1 })

    const totalReviews  = deck.cards.reduce((s, c) => s + c.totalReviews, 0)
    const totalCorrect  = deck.cards.reduce((s, c) => s + c.correctCount, 0)
    const accuracy      = totalReviews > 0 ? Math.round(totalCorrect / totalReviews * 100) : 0

    // Cards due in next 7 days
    const upcoming = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(); day.setDate(day.getDate() + d)
      const dayStr = day.toDateString()
      upcoming.push({
        label: d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : day.toLocaleDateString('en', { weekday: 'short' }),
        count: deck.cards.filter(c => new Date(c.nextReview).toDateString() === dayStr).length
      })
    }

    res.json({
      success: true,
      data: {
        title:      deck.title,
        totalCards: deck.totalCards,
        dueNow:     deck.dueCards,
        streakDays: deck.streakDays,
        lastStudied: deck.lastStudied,
        statusCounts,
        accuracy,
        totalReviews,
        upcoming
      }
    })
  } catch (e) { next(e) }
}
