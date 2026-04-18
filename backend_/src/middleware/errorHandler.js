const { validationResult } = require('express-validator')
const { sendError } = require('../utils/jwt')

/**
 * Validate express-validator results and return 422 on failure
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }))
    return sendError(res, 'Validation failed', 422, formatted)
  }
  next()
}

/**
 * Global error handler — attach after all routes
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack || err.message}`)

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return sendError(res, `${field} already exists.`, 409)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
    return sendError(res, 'Validation error', 422, messages)
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401)
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401)
  }

  const statusCode = err.statusCode || 500
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error'

  return sendError(res, message, statusCode)
}

/**
 * 404 handler — attach before errorHandler
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

module.exports = { validate, errorHandler, notFound }
