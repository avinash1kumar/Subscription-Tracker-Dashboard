const User = require('../models/User')
const { verifyAccessToken, sendError } = require('../utils/jwt')

/**
 * Protect routes — verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    let token

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return sendError(res, 'Not authorized. No token provided.', 401)
    }

    // Verify token
    const decoded = verifyAccessToken(token)

    // Find user
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (!user) {
      return sendError(res, 'User no longer exists.', 401)
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403)
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401)
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please log in again.', 401)
    }
    return sendError(res, 'Authentication failed.', 401)
  }
}

module.exports = { protect }
