const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User.model')

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const send = (res, status, user, message) =>
  res.status(status).json({ success: true, message, token: sign(user._id), user: { id: user._id, name: user.name, email: user.email } })

exports.signup = async (req, res, next) => {
  try {
    const errs = validationResult(req)
    if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() })
    const { name, email, password } = req.body
    if (await User.findOne({ email })) return res.status(409).json({ success: false, error: 'Email already registered' })
    const user = await User.create({ name, email, password })
    send(res, 201, user, 'Account created')
  } catch (e) { next(e) }
}

exports.login = async (req, res, next) => {
  try {
    const errs = validationResult(req)
    if (!errs.isEmpty()) return res.status(400).json({ success: false, errors: errs.array() })
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    send(res, 200, user, 'Logged in')
  } catch (e) { next(e) }
}

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } })
  } catch (e) { next(e) }
}
