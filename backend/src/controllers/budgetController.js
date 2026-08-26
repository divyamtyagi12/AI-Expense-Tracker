// backend/src/controllers/budgetController.js

const { body, query, validationResult } = require('express-validator');
const budgetModel = require('../models/budgetModel');

// ── Validation chains ────────────────────────────────────────────
const upsertValidation = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('month must be 1–12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('year must be a valid 4-digit year'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('amount must be a positive number'),
];

// GET /api/budgets?month=&year=
async function getBudget(req, res, next) {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'month and year query params are required' });
    }

    const budget = await budgetModel.findForUser(req.userId, Number(month), Number(year));
    res.json({ success: true, data: { budget } }); // budget may be null
  } catch (err) {
    next(err);
  }
}

// PUT /api/budgets
async function upsertBudget(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { month, year, amount } = req.body;
    const budget = await budgetModel.upsert(req.userId, month, year, amount);
    res.json({ success: true, data: { budget } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/budgets?month=&year=
async function deleteBudget(req, res, next) {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'month and year query params are required' });
    }

    const deleted = await budgetModel.deleteForUser(req.userId, Number(month), Number(year));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'No budget found for that month/year' });
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBudget, upsertBudget, upsertValidation, deleteBudget };
