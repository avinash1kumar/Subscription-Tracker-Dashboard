const User = require('../models/User')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendSuccess,
  sendError,
} = require('../utils/jwt')

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return sendError(res, 'Email is already registered.', 409)
    }

    const user = await User.create({ name, email, password, currency })

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Save refresh token hash
    user.refreshToken = refreshToken
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      'Account created successfully.',
      201
    )
  } catch (error) {
    next(error)
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Include password explicitly since select: false
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401)
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    user.refreshToken = refreshToken
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    // Remove password from response
    user.password = undefined

    return sendSuccess(res, { user, accessToken, refreshToken }, 'Login successful.')
  } catch (error) {
    next(error)
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return sendError(res, 'Refresh token required.', 400)
    }

    const decoded = verifyRefreshToken(token)
    const user = await User.findById(decoded.id).select('+refreshToken')

    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Invalid or expired refresh token.', 401)
    }

    const newAccessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)

    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })

    return sendSuccess(
      res,
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Tokens refreshed.'
    )
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Refresh token expired. Please log in again.', 401)
    }
    next(error)
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
    return sendSuccess(res, {}, 'Logged out successfully.')
  } catch (error) {
    next(error)
  }
}

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    return sendSuccess(res, { user }, 'Profile fetched.')
  } catch (error) {
    next(error)
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, avatar },
      { new: true, runValidators: true }
    )

    return sendSuccess(res, { user }, 'Profile updated.')
  } catch (error) {
    next(error)
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400)
    }

    user.password = newPassword
    await user.save()

    return sendSuccess(res, {}, 'Password changed successfully.')
  } catch (error) {
    next(error)
  }
}

// ─── Update Preferences (appearance / UI settings) ────────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const { compact, animations, showBalance, dateFormat } = req.body

    // Build update object — only update fields that were sent
    const update = {}
    if (compact     !== undefined) update['preferences.compact']     = compact
    if (animations  !== undefined) update['preferences.animations']  = animations
    if (showBalance !== undefined) update['preferences.showBalance'] = showBalance
    if (dateFormat  !== undefined) update['preferences.dateFormat']  = dateFormat

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    )

    return sendSuccess(res, { preferences: user.preferences }, 'Preferences updated.')
  } catch (error) {
    next(error)
  }
}

// ─── Get Notification Settings ────────────────────────────────────────────────
const getNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings')
    return sendSuccess(res, { notificationSettings: user.notificationSettings }, 'Notification settings fetched.')
  } catch (error) {
    next(error)
  }
}

// ─── Update Notification Settings ────────────────────────────────────────────
const updateNotificationSettings = async (req, res, next) => {
  try {
    const { billing, sevenDay, threeDay, overdue, insights, milestones } = req.body

    const update = {}
    if (billing    !== undefined) update['notificationSettings.billing']    = billing
    if (sevenDay   !== undefined) update['notificationSettings.sevenDay']   = sevenDay
    if (threeDay   !== undefined) update['notificationSettings.threeDay']   = threeDay
    if (overdue    !== undefined) update['notificationSettings.overdue']    = overdue
    if (insights   !== undefined) update['notificationSettings.insights']   = insights
    if (milestones !== undefined) update['notificationSettings.milestones'] = milestones

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    )

    return sendSuccess(
      res,
      { notificationSettings: user.notificationSettings },
      'Notification settings updated.'
    )
  } catch (error) {
    next(error)
  }
}

// ─── Delete Account ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password) return sendError(res, 'Password is required to delete account.', 400)

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return sendError(res, 'Incorrect password.', 401)

    // Delete all user data from all collections
    const Income       = require('../models/Income')
    const Expense      = require('../models/Expense')
    const Subscription = require('../models/Subscription')

    await Promise.all([
      Income.deleteMany({ user: req.user._id }),
      Expense.deleteMany({ user: req.user._id }),
      Subscription.deleteMany({ user: req.user._id }),
      User.findByIdAndDelete(req.user._id),
    ])

    return sendSuccess(res, {}, 'Account and all data deleted successfully.')
  } catch (error) {
    next(error)
  }
}

module.exports = {
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
}
