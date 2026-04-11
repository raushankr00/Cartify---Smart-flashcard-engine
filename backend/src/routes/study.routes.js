const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/study.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)

router.post('/:deckId/review', ctrl.reviewCard)
router.get('/:deckId/stats',   ctrl.deckStats)

module.exports = router
