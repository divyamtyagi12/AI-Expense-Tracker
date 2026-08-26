// backend/src/middleware/auth.js
// Protects routes by requiring a valid JWT in the Authorization header:
//   Authorization: Bearer <token>
// On success, attaches req.userId so downstream controllers know which
// user is making the request (used to scope every DB query).

const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
