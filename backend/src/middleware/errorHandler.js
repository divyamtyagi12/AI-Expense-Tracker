// backend/src/middleware/errorHandler.js
// Centralized error handler. Any error passed to next(err) anywhere in the
// app ends up here, so we get consistent error responses across all routes.

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only include stack trace in development, never in production.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
