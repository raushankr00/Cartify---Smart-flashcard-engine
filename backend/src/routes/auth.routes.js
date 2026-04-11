const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const ctrl = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')

router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], ctrl.signup)

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], ctrl.login)

router.get('/me', protect, ctrl.me)

module.exports = router
