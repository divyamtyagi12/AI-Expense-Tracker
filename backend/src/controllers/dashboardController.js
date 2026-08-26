// backend/src/controllers/dashboardController.js
// Returns a single aggregated payload that powers the entire Dashboard page.
// One round-trip instead of multiple fetches.

const { pool } = require('../config/db');
const budgetModel = require('../models/budgetModel');

// GET /api/dashboard?month=&year=
async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const userId = req.userId;

    // ── 1. Total spent this month ────────────────────────────────
    const totalSpentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS "totalSpent"
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM expense_date) = $2
         AND EXTRACT(YEAR FROM expense_date) = $3`,
      [userId, month, year]
    );
    const totalSpent = totalSpentResult.rows[0].totalSpent;

    // ── 2. Number of expenses this month ─────────────────────────
    const expenseCountResult = await pool.query(
      `SELECT COUNT(*) AS "expenseCount"
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM expense_date) = $2
         AND EXTRACT(YEAR FROM expense_date) = $3`,
      [userId, month, year]
    );
    const expenseCount = expenseCountResult.rows[0].expenseCount;

    // ── 3. Budget (may be null) ──────────────────────────────────
    const budget = await budgetModel.findForUser(userId, month, year);
    const budgetAmount = budget ? parseFloat(budget.amount) : null;
    const remaining = budgetAmount !== null ? budgetAmount - parseFloat(totalSpent) : null;

    // ── 4. Spending by category (for pie/bar chart) ──────────────
    const { rows: byCategory } = await pool.query(
      `SELECT c.name AS category_name,
              COALESCE(SUM(e.amount), 0) AS total
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = $1
         AND EXTRACT(MONTH FROM e.expense_date) = $2
         AND EXTRACT(YEAR FROM e.expense_date) = $3
       GROUP BY e.category_id, c.name
       ORDER BY total DESC`,
      [userId, month, year]
    );

    // ── 5. Daily spending totals (for line chart) ─────────────────
    const { rows: dailyTotals } = await pool.query(
      `SELECT expense_date AS date,
              SUM(amount) AS total
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM expense_date) = $2
         AND EXTRACT(YEAR FROM expense_date) = $3
       GROUP BY expense_date
       ORDER BY expense_date ASC`,
      [userId, month, year]
    );

    // ── 6. Recent 5 expenses ─────────────────────────────────────
    const { rows: recentExpenses } = await pool.query(
      `SELECT e.id, e.amount, e.note, e.expense_date, c.name AS category_name
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = $1
         AND EXTRACT(MONTH FROM e.expense_date) = $2
         AND EXTRACT(YEAR FROM e.expense_date) = $3
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT 5`,
      [userId, month, year]
    );

    // ── 7. Top category ──────────────────────────────────────────
    const topCategory = byCategory.length > 0 ? byCategory[0].category_name : null;

    res.json({
      success: true,
      data: {
        month,
        year,
        totalSpent: parseFloat(totalSpent),
        expenseCount: parseInt(expenseCount, 10),
        budget: budgetAmount,
        remaining,
        topCategory,
        byCategory: byCategory.map((r) => ({
          name: r.category_name,
          value: parseFloat(r.total),
        })),
        dailyTotals: dailyTotals.map((r) => ({
          date: r.date instanceof Date
            ? r.date.toISOString().slice(0, 10)
            : String(r.date).slice(0, 10),
          total: parseFloat(r.total),
        })),
        recentExpenses,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
