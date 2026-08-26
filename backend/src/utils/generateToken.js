// backend/src/utils/generateToken.js
// Signs a JWT containing the user's id. We deliberately keep the payload
// minimal (just the id) — anything else needed (name, email) is fetched
// fresh from the DB via /api/auth/me, so the token never goes stale.

const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
