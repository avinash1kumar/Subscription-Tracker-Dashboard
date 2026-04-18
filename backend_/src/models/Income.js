const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema(
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
      enum: ['Salary', 'Freelance', 'Passive', 'Investment', 'Business', 'Other'],
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
    emoji: {
      type: String,
      default: '💰',
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

// Virtual: monthly equivalent
incomeSchema.virtual('monthlyAmount').get(function () {
  const map = { monthly: 1, yearly: 1 / 12, weekly: 52 / 12, quarterly: 1 / 3, 'one-time': 0 }
  return Math.round(this.amount * (map[this.cycle] || 1))
})

// Indexes for common queries
incomeSchema.index({ user: 1, date: -1 })
incomeSchema.index({ user: 1, category: 1 })

module.exports = mongoose.model('Income', incomeSchema)
