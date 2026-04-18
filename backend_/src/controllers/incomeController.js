const Income = require('../models/Income')
const { sendSuccess, sendError } = require('../utils/jwt')

// ─── Get All Income ───────────────────────────────────────────────────────────
const getIncome = async (req, res, next) => {
  try {
    const { category, cycle, startDate, endDate, page = 1, limit = 50, sort = '-date' } = req.query

    const filter = { user: req.user._id, isActive: true }
    if (category) filter.category = category
    if (cycle) filter.cycle = cycle
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const total = await Income.countDocuments(filter)
    const income = await Income.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    return sendSuccess(res, {
      income,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── Get Single Income ────────────────────────────────────────────────────────
const getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id })
    if (!income) return sendError(res, 'Income entry not found.', 404)
    return sendSuccess(res, { income })
  } catch (error) {
    next(error)
  }
}

// ─── Create Income ────────────────────────────────────────────────────────────
const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user._id })
    return sendSuccess(res, { income }, 'Income added successfully.', 201)
  } catch (error) {
    next(error)
  }
}

// ─── Update Income ────────────────────────────────────────────────────────────
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!income) return sendError(res, 'Income entry not found.', 404)
    return sendSuccess(res, { income }, 'Income updated successfully.')
  } catch (error) {
    next(error)
  }
}

// ─── Delete Income ────────────────────────────────────────────────────────────
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!income) return sendError(res, 'Income entry not found.', 404)
    return sendSuccess(res, {}, 'Income deleted.')
  } catch (error) {
    next(error)
  }
}

// ─── Income Analytics ─────────────────────────────────────────────────────────
const getIncomeAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Total by category
    const byCategory = await Income.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])

    // Monthly totals for last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)

    const monthlyTotals = await Income.aggregate([
      { $match: { user: userId, isActive: true, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Summary totals
    const summary = await Income.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$amount' },
          monthlyRecurring: {
            $sum: { $cond: [{ $eq: ['$cycle', 'monthly'] }, '$amount', 0] },
          },
          yearlyRecurring: {
            $sum: { $cond: [{ $eq: ['$cycle', 'yearly'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ])

    return sendSuccess(res, {
      analytics: {
        byCategory,
        monthlyTotals,
        summary: summary[0] || { totalIncome: 0, monthlyRecurring: 0, yearlyRecurring: 0, count: 0 },
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getIncome,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeAnalytics,
}
