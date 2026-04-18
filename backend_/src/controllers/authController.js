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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
}
