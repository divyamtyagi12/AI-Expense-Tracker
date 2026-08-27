// api/index.js
// Vercel serverless entry point for AI Expense Tracker.
// Exports Express app with cold-start DB connection test.

require('dotenv').config();
const app = require('../backend/src/app');
const { testConnection } = require('../backend/src/config/db');

// Run once on cold start; subsequent warm invocations skip this.
testConnection().catch((err) => {
  console.error('DB connection failed on cold start:', err.message);
});

module.exports = app;
