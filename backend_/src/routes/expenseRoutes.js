const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  cancelExpense,
  getExpenseAnalytics,
  getDashboardSummary,
} = require('../controllers/expenseController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

router.use(protect)

// ─── Validation ───────────────────────────────────────────────────────────────
const expenseBodyRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name max 100 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category')
    .isIn(['Entertainment', 'Music', 'Tech', 'Design', 'Health', 'Professional', 'Food', 'Travel', 'Other'])
    .withMessage('Invalid category'),
  body('cycle')
    .optional()
    .isIn(['monthly', 'yearly', 'weekly', 'quarterly', 'one-time'])
    .withMessage('Invalid cycle'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  body('nextBilling').optional().isISO8601().withMessage('Invalid nextBilling date'),
  body('emoji').optional().isString(),
  body('notes').optional().isLength({ max: 500 }),
]

const idRule = [param('id').isMongoId().withMessage('Invalid ID')]

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardSummary)  // must be before /:id
router.get('/analytics', getExpenseAnalytics)
router.get('/', getExpenses)
router.get('/:id', idRule, validate, getExpenseById)
router.post('/', expenseBodyRules, validate, createExpense)
router.put('/:id', [...idRule, ...expenseBodyRules], validate, updateExpense)
router.patch('/:id/cancel', idRule, validate, cancelExpense)
router.delete('/:id', idRule, validate, deleteExpense)

module.exports = router
