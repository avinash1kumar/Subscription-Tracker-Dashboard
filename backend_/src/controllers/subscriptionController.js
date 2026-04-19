const Subscription = require('../models/Subscription')
const { sendSuccess, sendError } = require('../utils/jwt')

// ── Get All ──────────────────────────────────────────────────────────────────
const getSubscriptions = async (req, res, next) => {
  try {
    const {
      status, category, cycle, search,
      upcoming, days = 7,
      sortBy = 'nextBilling', order = 'asc',
      page = 1, limit = 100,
    } = req.query

    const filter = { user: req.user._id }
    if (status)            filter.status   = status
    if (category)          filter.category = category
    if (cycle)             filter.cycle    = cycle
    if (search)            filter.name     = { $regex: search, $options: 'i' }
    if (upcoming === 'true') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + Number(days))
      filter.nextBilling = { $gte: new Date(), $lte: cutoff }
      filter.status      = 'active'
    }

    const sortOrder = order === 'desc' ? -1 : 1
    const sortMap   = {
      nextBilling: { nextBilling: sortOrder },
      name:        { name: sortOrder },
      price:       { price: sortOrder },
      createdAt:   { createdAt: sortOrder },
    }

    const total         = await Subscription.countDocuments(filter)
    const subscriptions = await Subscription.find(filter)
      .sort(sortMap[sortBy] || { nextBilling: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    return sendSuccess(res, {
      subscriptions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    })
  } catch (err) { next(err) }
}

// ── Get Single ───────────────────────────────────────────────────────────────
const getSubscriptionById = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
    if (!sub) return sendError(res, 'Subscription not found.', 404)
    return sendSuccess(res, { subscription: sub })
  } catch (err) { next(err) }
}

// ── Create ───────────────────────────────────────────────────────────────────
const createSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.create({ ...req.body, user: req.user._id })
    return sendSuccess(res, { subscription: sub }, 'Subscription added successfully.', 201)
  } catch (err) { next(err) }
}

// ── Update ───────────────────────────────────────────────────────────────────
const updateSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!sub) return sendError(res, 'Subscription not found.', 404)
    return sendSuccess(res, { subscription: sub }, 'Subscription updated.')
  } catch (err) { next(err) }
}

// ── Delete ───────────────────────────────────────────────────────────────────
const deleteSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!sub) return sendError(res, 'Subscription not found.', 404)
    return sendSuccess(res, {}, 'Subscription deleted.')
  } catch (err) { next(err) }
}

// ── Toggle Status ─────────────────────────────────────────────────────────────
const toggleStatus = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
    if (!sub) return sendError(res, 'Subscription not found.', 404)
    const cancelling  = sub.status === 'active'
    sub.status        = cancelling ? 'cancelled' : 'active'
    sub.cancelledAt   = cancelling ? new Date() : null
    await sub.save()
    return sendSuccess(res, { subscription: sub }, cancelling ? 'Subscription cancelled.' : 'Subscription reactivated.')
  } catch (err) { next(err) }
}

// ── Bulk Delete ───────────────────────────────────────────────────────────────
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0)
      return sendError(res, 'Provide an array of IDs to delete.', 400)
    const result = await Subscription.deleteMany({ _id: { $in: ids }, user: req.user._id })
    return sendSuccess(res, { deleted: result.deletedCount }, `${result.deletedCount} subscription(s) deleted.`)
  } catch (err) { next(err) }
}

// ── Analytics ─────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const userId      = req.user._id
    const activeMatch = { user: userId, status: 'active' }

    const allSubs    = await Subscription.find({ user: userId })
    const activeSubs = allSubs.filter(s => s.status === 'active')

    const totalMonthly = activeSubs.reduce((sum, s) => sum + s.monthlyPrice, 0)
    const totalYearly  = activeSubs.reduce((sum, s) => sum + s.yearlyPrice,  0)

    const byCategory = await Subscription.aggregate([
      { $match: activeMatch },
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$price' } } },
      { $sort: { total: -1 } },
    ])

    const byCycle = await Subscription.aggregate([
      { $match: activeMatch },
      { $group: { _id: '$cycle', count: { $sum: 1 }, total: { $sum: '$price' } } },
      { $sort: { total: -1 } },
    ])

    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
    const upcomingBills = await Subscription.find({
      ...activeMatch,
      nextBilling: { $gte: new Date(), $lte: sevenDaysLater },
    }).sort('nextBilling')

    return sendSuccess(res, {
      analytics: {
        summary: {
          totalSubscriptions:     allSubs.length,
          activeSubscriptions:    activeSubs.length,
          cancelledSubscriptions: allSubs.length - activeSubs.length,
          totalMonthlySpend:      Math.round(totalMonthly),
          totalYearlySpend:       Math.round(totalYearly),
          dailyAverage:           Math.round(totalMonthly / 30),
          upcomingBillsCount:     upcomingBills.length,
        },
        byCategory,
        byCycle,
        upcomingBills,
      },
    })
  } catch (err) { next(err) }
}

// ── Upcoming Bills ────────────────────────────────────────────────────────────
const getUpcoming = async (req, res, next) => {
  try {
    const { days = 7 } = req.query
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + Number(days))
    const subscriptions = await Subscription.find({
      user: req.user._id, status: 'active',
      nextBilling: { $gte: new Date(), $lte: cutoff },
    }).sort('nextBilling')
    return sendSuccess(res, { subscriptions, count: subscriptions.length })
  } catch (err) { next(err) }
}

module.exports = {
  getSubscriptions, getSubscriptionById, createSubscription,
  updateSubscription, deleteSubscription, toggleStatus,
  bulkDelete, getAnalytics, getUpcoming,
}
