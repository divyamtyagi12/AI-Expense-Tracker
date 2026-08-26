// backend/src/app.js
// Configures the Express application: global middleware, routes, and
// error handling. Routes are added incrementally in later phases.

const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Global middleware ─────────────────────────────────────────
app.use(
  cors({
    origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  })
);
app.use(express.json()); // parse JSON request bodies

// ── Health check route (useful for confirming the server is alive) ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Expense Tracker API is running' });
});

// ── Feature routes ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// ── 404 + error handling (must be last) ───────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
