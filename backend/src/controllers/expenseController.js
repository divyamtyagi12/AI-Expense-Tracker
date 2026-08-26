// backend/src/controllers/expenseController.js

const expenseModel = require('../models/expenseModel');
const categoryModel = require('../models/categoryModel');

// GET /api/expenses?month=&year=&category=
async function getExpenses(req, res, next) {
  try {
    const { month, year, category } = req.query;

    const expenses = await expenseModel.findAllForUser(req.userId, {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      categoryId: category ? Number(category) : undefined,
    });

    res.json({ success: true, data: { expenses } });
  } catch (err) {
    next(err);
  }
}

// POST /api/expenses
async function createExpense(req, res, next) {
  try {
    const { categoryId, amount, note, expenseDate } = req.body;

    const usable = await categoryModel.isUsableByUser(categoryId, req.userId);
    if (!usable) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const expense = await expenseModel.create(req.userId, { categoryId, amount, note, expenseDate });
    res.status(201).json({ success: true, data: { expense } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res, next) {
  try {
    const { id } = req.params;
    const { categoryId, amount, note, expenseDate } = req.body;

    const usable = await categoryModel.isUsableByUser(categoryId, req.userId);
    if (!usable) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const updated = await expenseModel.updateOwnedByUser(id, req.userId, {
      categoryId,
      amount,
      note,
      expenseDate,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found or not owned by you' });
    }

    res.json({ success: true, data: { expense: updated } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await expenseModel.deleteOwnedByUser(id, req.userId);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found or not owned by you' });
    }

    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
