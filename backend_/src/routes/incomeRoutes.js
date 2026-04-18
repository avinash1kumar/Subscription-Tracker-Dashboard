const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()
const {
  getIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeAnalytics,
} = require('../controllers/incomeController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

// All routes require authentication
router.use(protect)

// ─── Validation ───────────────────────────────────────────────────────────────
const incomeBodyRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category')
    .isIn(['Salary', 'Freelance', 'Passive', 'Investment', 'Business', 'Other'])
    .withMessage('Invalid category'),
  body('cycle')
    .optional()
    .isIn(['monthly', 'yearly', 'weekly', 'quarterly', 'one-time'])
    .withMessage('Invalid cycle'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('emoji').optional().isString(),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes max 500 chars'),
]

const idRule = [
  param('id').isMongoId().withMessage('Invalid ID'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/', getIncome)
router.get('/analytics', getIncomeAnalytics)
router.get('/:id', idRule, validate, getIncomeById)
router.post('/', incomeBodyRules, validate, createIncome)
router.put('/:id', [...idRule, ...incomeBodyRules], validate, updateIncome)
router.delete('/:id', idRule, validate, deleteIncome)

module.exports = router
