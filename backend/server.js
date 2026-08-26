// backend/server.js
// Entry point: loads env vars, verifies the DB connection, then starts
// the HTTP server.

require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection(); // exits process if DB connection fails
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
