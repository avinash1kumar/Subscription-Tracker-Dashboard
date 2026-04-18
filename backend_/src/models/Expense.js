const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Entertainment', 'Music', 'Tech', 'Design',
        'Health', 'Professional', 'Food', 'Travel', 'Other',
      ],
    },
    cycle: {
      type: String,
      required: true,
      enum: ['monthly', 'yearly', 'weekly', 'quarterly', 'one-time'],
      default: 'monthly',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    nextBilling: {
      type: Date,
    },
    emoji: {
      type: String,
      default: '💳',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
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

// Virtual: days until next billing
expenseSchema.virtual('daysUntilBilling').get(function () {
  if (!this.nextBilling) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const billing = new Date(this.nextBilling)
  billing.setHours(0, 0, 0, 0)
  return Math.ceil((billing - today) / (1000 * 60 * 60 * 24))
})

// Virtual: monthly equivalent
expenseSchema.virtual('monthlyAmount').get(function () {
  const map = { monthly: 1, yearly: 1 / 12, weekly: 52 / 12, quarterly: 1 / 3, 'one-time': 0 }
  return Math.round(this.amount * (map[this.cycle] || 1))
})

// Auto-calculate nextBilling before saving if not provided
expenseSchema.pre('save', function (next) {
  if (!this.nextBilling && this.date) {
    const d = new Date(this.date)
    if (this.cycle === 'monthly') d.setMonth(d.getMonth() + 1)
    else if (this.cycle === 'yearly') d.setFullYear(d.getFullYear() + 1)
    else if (this.cycle === 'weekly') d.setDate(d.getDate() + 7)
    else if (this.cycle === 'quarterly') d.setMonth(d.getMonth() + 3)
    if (this.cycle !== 'one-time') this.nextBilling = d
  }
  next()
})

expenseSchema.index({ user: 1, date: -1 })
expenseSchema.index({ user: 1, nextBilling: 1 })
expenseSchema.index({ user: 1, category: 1 })

module.exports = mongoose.model('Expense', expenseSchema)
