/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Rating scale (what the user clicks):
 *   0 = Complete blackout / wrong
 *   1 = Wrong but remembered on seeing answer
 *   2 = Hard — correct with serious difficulty
 *   3 = Good — correct with some difficulty
 *   4 = Easy — correct with hesitation
 *   5 = Perfect — instant recall
 * 
 * Returns updated card fields.
 */
const sm2 = (card, rating) => {
  let { interval, repetitions, easeFactor } = card

  // Clamp rating
  const q = Math.max(0, Math.min(5, rating))

  if (q < 3) {
    // Incorrect — reset streak
    repetitions = 0
    interval    = 1
  } else {
    // Correct
    if (repetitions === 0)      interval = 1
    else if (repetitions === 1) interval = 6
    else                        interval = Math.round(interval * easeFactor)

    repetitions += 1
  }

  // Update ease factor (never below 1.3)
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  // Next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  // Determine status
  let status = 'learning'
  if (repetitions === 0)      status = 'learning'
  else if (repetitions >= 5 && easeFactor >= 2.2) status = 'mastered'
  else if (interval >= 21)    status = 'mastered'
  else if (repetitions >= 2)  status = 'review'

  return { interval, repetitions, easeFactor, nextReview, lastReview: new Date(), status }
}

module.exports = sm2
