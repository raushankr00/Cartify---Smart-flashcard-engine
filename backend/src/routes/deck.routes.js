const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/deck.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)

router.post('/upload',   ctrl.uploadDeck)
router.get('/',          ctrl.listDecks)
router.get('/:id',       ctrl.getDeck)
router.delete('/:id',    ctrl.deleteDeck)
router.get('/:id/due',   ctrl.getDueCards)

module.exports = router
