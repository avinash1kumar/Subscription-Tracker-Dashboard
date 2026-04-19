const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    name: {
      type:      String,
      required:  [true, 'Subscription name is required'],
      trim:      true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    emoji: {
      type:    String,
      default: '💳',
    },
    price: {
      type:     Number,
      required: [true, 'Price is required'],
      min:      [0.01, 'Price must be greater than 0'],
    },
    cycle: {
      type:    String,
      required: true,
      enum:    ['monthly', 'yearly', 'quarterly', 'weekly'],
      default: 'monthly',
    },
    startDate: {
      type:    Date,
      default: Date.now,
    },
    nextBilling: {
      type:     Date,
      required: [true, 'Next billing date is required'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum: [
        'Entertainment', 'Music', 'Software', 'Social Media',
        'Professional',  'Health', 'Education', 'Finance', 'Gaming', 'Other',
      ],
    },
    status: {
      type:    String,
      enum:    ['active', 'cancelled'],
      default: 'active',
    },
    cancelledAt: {
      type:    Date,
      default: null,
    },
    notes: {
      type:      String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default:   '',
    },
    website: {
      type:    String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

// ── Virtuals ─────────────────────────────────────────────────────────────────

subscriptionSchema.virtual('monthlyPrice').get(function () {
  const map = { monthly: 1, yearly: 1 / 12, quarterly: 1 / 3, weekly: 52 / 12 }
  return Math.round(this.price * (map[this.cycle] || 1))
})

subscriptionSchema.virtual('yearlyPrice').get(function () {
  const map = { monthly: 12, yearly: 1, quarterly: 4, weekly: 52 }
  return Math.round(this.price * (map[this.cycle] || 12))
})

subscriptionSchema.virtual('daysUntilBilling').get(function () {
  if (!this.nextBilling) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const bill  = new Date(this.nextBilling); bill.setHours(0, 0, 0, 0)
  return Math.ceil((bill - today) / 86400000)
})

subscriptionSchema.virtual('urgency').get(function () {
  const days = this.daysUntilBilling
  if (days === null || this.status === 'cancelled') return 'none'
  if (days <= 0) return 'overdue'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  return 'ok'
})

// ── Auto-calculate nextBilling if missing ────────────────────────────────────
subscriptionSchema.pre('save', function (next) {
  if (!this.nextBilling && this.startDate) {
    const d = new Date(this.startDate)
    if (this.cycle === 'monthly')   d.setMonth(d.getMonth() + 1)
    if (this.cycle === 'yearly')    d.setFullYear(d.getFullYear() + 1)
    if (this.cycle === 'quarterly') d.setMonth(d.getMonth() + 3)
    if (this.cycle === 'weekly')    d.setDate(d.getDate() + 7)
    this.nextBilling = d
  }
  next()
})

// ── Indexes ──────────────────────────────────────────────────────────────────
subscriptionSchema.index({ user: 1, status: 1 })
subscriptionSchema.index({ user: 1, nextBilling: 1 })
subscriptionSchema.index({ user: 1, category: 1 })
subscriptionSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Subscription', subscriptionSchema)
