const Expense = require('../models/Expense')
const { sendSuccess, sendError } = require('../utils/jwt')

// ─── Get All Expenses ─────────────────────────────────────────────────────────
const getExpenses = async (req, res, next) => {
  try {
    const {
      category, cycle, startDate, endDate,
      page = 1, limit = 50, sort = '-date',
      upcoming, // "true" → only upcoming bills in next N days
      days = 7,
    } = req.query

    const filter = { user: req.user._id, isActive: true, isCancelled: false }
    if (category) filter.category = category
    if (cycle) filter.cycle = cycle
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    if (upcoming === 'true') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + Number(days))
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filter.status = 'Planned'
      filter.date = { $gte: today, $lte: cutoff }
    }

    const total = await Expense.countDocuments(filter)
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    return sendSuccess(res, {
      expenses,
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

// ─── Get Single Expense ───────────────────────────────────────────────────────
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id })
    if (!expense) return sendError(res, 'Expense not found.', 404)
    return sendSuccess(res, { expense })
  } catch (error) {
    next(error)
  }
}

// ─── Create Expense ───────────────────────────────────────────────────────────
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id })
    return sendSuccess(res, { expense }, 'Expense added successfully.', 201)
  } catch (error) {
    next(error)
  }
}

// ─── Update Expense ───────────────────────────────────────────────────────────
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!expense) return sendError(res, 'Expense not found.', 404)
    return sendSuccess(res, { expense }, 'Expense updated successfully.')
  } catch (error) {
    next(error)
  }
}

// ─── Delete Expense ───────────────────────────────────────────────────────────
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!expense) return sendError(res, 'Expense not found.', 404)
    return sendSuccess(res, {}, 'Expense deleted.')
  } catch (error) {
    next(error)
  }
}

// ─── Cancel Subscription ──────────────────────────────────────────────────────
const cancelExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isCancelled: true, isActive: false, cancelledAt: new Date() },
      { new: true }
    )
    if (!expense) return sendError(res, 'Expense not found.', 404)
    return sendSuccess(res, { expense }, 'Subscription cancelled.')
  } catch (error) {
    next(error)
  }
}

// ─── Expense Analytics ────────────────────────────────────────────────────────
const getExpenseAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id
    const baseMatch = { user: userId, isActive: true, isCancelled: false, status: 'Paid' }
    const upcomingMatch = { user: userId, isActive: true, isCancelled: false, status: 'Planned' }
    // By category
    const byCategory = await Expense.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])

    // By cycle
    const byCycle = await Expense.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$cycle', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])

    // Monthly totals for last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)

    const monthlyTotals = await Expense.aggregate([
      { $match: { ...baseMatch, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Summary
    const summary = await Expense.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          monthlyTotal: {
            $sum: { $cond: [{ $eq: ['$cycle', 'monthly'] }, '$amount', 0] },
          },
          yearlyTotal: {
            $sum: { $cond: [{ $eq: ['$cycle', 'yearly'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ])

    // Upcoming in 7 days
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcomingCount = await Expense.countDocuments({
      ...upcomingMatch,
      date: { $gte: today, $lte: sevenDaysLater },
    })

    return sendSuccess(res, {
      analytics: {
        byCategory,
        byCycle,
        monthlyTotals,
        upcomingCount,
        summary: summary[0] || {
          totalExpenses: 0, monthlyTotal: 0, yearlyTotal: 0, count: 0,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// ─── Dashboard Summary (income + expense combined) ────────────────────────────
const getDashboardSummary = async (req, res, next) => {
  try {
    const Income = require('../models/Income')
    const userId = req.user._id
    const baseExpFilter = { user: userId, isActive: true, isCancelled: false, status: 'Paid' }
    const upcomingExpFilter = { user: userId, isActive: true, isCancelled: false, status: 'Planned' }
    const baseIncFilter = { user: userId, isActive: true }

    const [incSummary] = await Income.aggregate([
      { $match: baseIncFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ])

    const [expSummary] = await Expense.aggregate([
      { $match: baseExpFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ])

    const totalIncome = incSummary?.total || 0
    const totalExpenses = expSummary?.total || 0
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0

    // Upcoming bills (next 7 days)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 7)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcomingBills = await Expense.find({
      ...upcomingExpFilter,
      date: { $gte: today, $lte: cutoff },
    }).sort('date').limit(5)

    // Recent transactions (last 10)
    const recentIncome = await Income.find(baseIncFilter).sort('-date').limit(5)
    const recentExpenses = await Expense.find(baseExpFilter).sort('-date').limit(5)
    const recentTransactions = [
      ...recentIncome.map((i) => ({ ...i.toJSON(), type: 'income' })),
      ...recentExpenses.map((e) => ({ ...e.toJSON(), type: 'expense' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

    return sendSuccess(res, {
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate: Number(savingsRate),
        incomeCount: incSummary?.count || 0,
        expenseCount: expSummary?.count || 0,
      },
      upcomingBills,
      recentTransactions,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  cancelExpense,
  getExpenseAnalytics,
  getDashboardSummary,
}
