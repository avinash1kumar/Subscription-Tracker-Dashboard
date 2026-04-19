const express      = require('express')
const { body, param } = require('express-validator')
const router       = express.Router()

const {
  getSubscriptions, getSubscriptionById, createSubscription,
  updateSubscription, deleteSubscription, toggleStatus,
  bulkDelete, getAnalytics, getUpcoming,
} = require('../controllers/subscriptionController')

const { protect }  = require('../middleware/auth')
const { validate } = require('../middleware/errorHandler')

// All routes protected
router.use(protect)

// ── Validation ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Entertainment','Music','Software','Social Media',
  'Professional','Health','Education','Finance','Gaming','Other',
]
const CYCLES = ['monthly','yearly','quarterly','weekly']

const subRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('cycle').optional().isIn(CYCLES).withMessage(`Cycle must be one of: ${CYCLES.join(', ')}`),
  body('nextBilling').notEmpty().withMessage('Next billing date is required').isISO8601(),
  body('category').isIn(CATEGORIES).withMessage(`Invalid category`),
  body('status').optional().isIn(['active','cancelled']),
  body('emoji').optional().isString(),
  body('notes').optional().isLength({ max: 500 }),
  body('website').optional().isString(),
  body('startDate').optional().isISO8601(),
]

const idRule = [param('id').isMongoId().withMessage('Invalid subscription ID')]

// ── Routes — specific before /:id ─────────────────────────────────────────────
router.get('/analytics',     getAnalytics)
router.get('/upcoming',      getUpcoming)
router.delete('/bulk',       bulkDelete)

router.get('/',              getSubscriptions)
router.post('/',             subRules, validate, createSubscription)
router.get('/:id',           idRule, validate, getSubscriptionById)
router.put('/:id',           [...idRule, ...subRules], validate, updateSubscription)
router.delete('/:id',        idRule, validate, deleteSubscription)
router.patch('/:id/toggle',  idRule, validate, toggleStatus)

module.exports = router
