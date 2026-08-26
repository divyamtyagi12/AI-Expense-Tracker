// backend/api/index.js
// Vercel serverless entry point.
// Vercel handles HTTP — we just export the Express app.
// The DB connection is tested once at module load (cold start),
// then reused across warm invocations via the connection pool.

require('dotenv').config();
const app = require('../src/app');
const { testConnection } = require('../src/config/db');

// Run once on cold start; subsequent warm invocations skip this.
testConnection().catch((err) => {
  console.error('DB connection failed on cold start:', err.message);
});

module.exports = app;
