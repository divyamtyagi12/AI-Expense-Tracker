// backend/src/controllers/aiController.js
// Endpoints:
//   POST /api/ai/analyze   — generate a spending summary for a month
//   POST /api/ai/ask       — answer a user question about their expenses
//   GET  /api/ai/history   — return saved insight history
//   DELETE /api/ai/history — clear all saved insights

const aiService = require('../services/aiService');
const aiInsightModel = require('../models/aiInsightModel');

// Helper: fetch dashboard-style spending data for the given user/month/year
async function fetchSpendingData(userId, month, year) {
  const { pool } = require('../config/db');
  const budgetModel = require('../models/budgetModel');

  const totalSpentResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS "totalSpent"
     FROM expenses WHERE user_id = $1 AND EXTRACT(MONTH FROM expense_date) = $2 AND EXTRACT(YEAR FROM expense_date) = $3`,
    [userId, month, year]
  );
  const totalSpent = totalSpentResult.rows[0].totalSpent;

  const expenseCountResult = await pool.query(
    `SELECT COUNT(*) AS "expenseCount"
     FROM expenses WHERE user_id = $1 AND EXTRACT(MONTH FROM expense_date) = $2 AND EXTRACT(YEAR FROM expense_date) = $3`,
    [userId, month, year]
  );
  const expenseCount = expenseCountResult.rows[0].expenseCount;

  const budget = await budgetModel.findForUser(userId, month, year);
  const budgetAmount = budget ? parseFloat(budget.amount) : null;

  const { rows: byCategory } = await pool.query(
    `SELECT c.name AS name, COALESCE(SUM(e.amount), 0) AS value
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = $1 AND EXTRACT(MONTH FROM e.expense_date) = $2 AND EXTRACT(YEAR FROM e.expense_date) = $3
     GROUP BY e.category_id, c.name ORDER BY value DESC`,
    [userId, month, year]
  );
  const { rows: recentExpenses } = await pool.query(
    `SELECT e.id, e.amount, e.note, e.expense_date, c.name AS category_name
     FROM expenses e JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = $1 AND EXTRACT(MONTH FROM e.expense_date) = $2 AND EXTRACT(YEAR FROM e.expense_date) = $3
     ORDER BY e.expense_date DESC, e.id DESC LIMIT 5`,
    [userId, month, year]
  );

  return {
    month, year,
    totalSpent: parseFloat(totalSpent),
    expenseCount: parseInt(expenseCount, 10),
    budget: budgetAmount,
    topCategory: byCategory.length > 0 ? byCategory[0].name : null,
    byCategory: byCategory.map(r => ({ name: r.name, value: parseFloat(r.value) })),
    recentExpenses,
  };
}

// POST /api/ai/analyze
// Body: { month, year }
async function analyze(req, res, next) {
  try {
    const now = new Date();
    const month = req.body.month ? Number(req.body.month) : now.getMonth() + 1;
    const year = req.body.year ? Number(req.body.year) : now.getFullYear();

    if (!process.env.AI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add AI_API_KEY to your .env file.',
      });
    }

    const spendingData = await fetchSpendingData(req.userId, month, year);

    if (spendingData.expenseCount === 0) {
      return res.status(422).json({
        success: false,
        message: 'No expense data found for the selected period. Add some expenses first.',
      });
    }

    const responseText = await aiService.generateSummary(spendingData);

    // Persist to history
    const insight = await aiInsightModel.create(req.userId, 'summary', null, responseText);

    res.json({ success: true, data: { insight, responseText } });
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/ask
// Body: { month, year, question }
async function ask(req, res, next) {
  try {
    const { question, month, year } = req.body;

    if (!question || !question.trim()) {
      return res.status(422).json({ success: false, message: 'question is required' });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add AI_API_KEY to your .env file.',
      });
    }

    const now = new Date();
    const m = month ? Number(month) : now.getMonth() + 1;
    const y = year ? Number(year) : now.getFullYear();

    const spendingData = await fetchSpendingData(req.userId, m, y);
    const responseText = await aiService.answerQuestion(spendingData, question.trim());

    // Persist to history
    const insight = await aiInsightModel.create(req.userId, 'question', question.trim(), responseText);

    res.json({ success: true, data: { insight, responseText } });
  } catch (err) {
    next(err);
  }
}

// GET /api/ai/history
async function getHistory(req, res, next) {
  try {
    const limit = req.query.limit ? Math.min(Number(req.query.limit), 50) : 20;
    const history = await aiInsightModel.findRecentForUser(req.userId, limit);
    res.json({ success: true, data: { history } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/ai/history
async function clearHistory(req, res, next) {
  try {
    await aiInsightModel.deleteAllForUser(req.userId);
    res.json({ success: true, message: 'AI insight history cleared' });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze, ask, getHistory, clearHistory };
