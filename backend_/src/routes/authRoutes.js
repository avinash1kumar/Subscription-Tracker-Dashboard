const express = require('express')
const { body } = require('express-validator')
const router  = express.Router()

const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  updatePreferences,
  getNotificationSettings,
  updateNotificationSettings,
  deleteAccount,
} = require('../controllers/authController')

const { protect }  = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('currency').optional().isIn(['INR','USD','EUR','GBP']).withMessage('Invalid currency'),
]

const loginRules = [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
]

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]

const deleteAccountRules = [
  body('password').notEmpty().withMessage('Password is required to delete account'),
]

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register',      registerRules,      validate, register)
router.post('/login',         loginRules,         validate, login)
router.post('/refresh-token', refreshToken)

// ── Protected routes (all below require valid JWT) ────────────────────────────
router.use(protect)

// Auth
router.post('/logout', logout)

// Profile
router.get('/profile',         getProfile)
router.put('/profile',         updateProfile)
router.put('/change-password', changePasswordRules, validate, changePassword)

// Preferences (appearance / UI settings)
router.get('/preferences',     (req, res) => res.json({ success: true, preferences: req.user.preferences }))
router.put('/preferences',     updatePreferences)

// Notification settings
router.get('/notification-settings', getNotificationSettings)
router.put('/notification-settings', updateNotificationSettings)

// Account deletion — requires password confirmation
router.delete('/account', deleteAccountRules, validate, deleteAccount)

module.exports = router
