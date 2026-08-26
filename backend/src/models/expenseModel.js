// backend/src/models/expenseModel.js

const { pool } = require('../config/db');

// Builds a WHERE clause dynamically based on optional filters, but still
// uses parameterized placeholders — never string-concatenates values.
async function findAllForUser(userId, { month, year, categoryId } = {}) {
  let sql = `
    SELECT e.id, e.amount, e.note, e.expense_date, e.created_at,
           e.category_id, c.name AS category_name
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = $1
  `;
  const params = [userId];

  if (month && year) {
    params.push(month, year);
    sql += ` AND EXTRACT(MONTH FROM e.expense_date) = $${params.length - 1} AND EXTRACT(YEAR FROM e.expense_date) = $${params.length}`;
  } else if (year) {
    params.push(year);
    sql += ` AND EXTRACT(YEAR FROM e.expense_date) = $${params.length}`;
  }

  if (categoryId) {
    params.push(categoryId);
    sql += ` AND e.category_id = $${params.length}`;
  }

  sql += ' ORDER BY e.expense_date DESC, e.id DESC';

  const { rows } = await pool.query(sql, params);
  return rows;
}

async function findByIdForUser(id, userId) {
  const { rows } = await pool.query(
    `SELECT e.id, e.amount, e.note, e.expense_date, e.created_at,
            e.category_id, c.name AS category_name
     FROM expenses e
     JOIN categories c ON c.id = e.category_id
     WHERE e.id = $1 AND e.user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
}

async function create(userId, { categoryId, amount, note, expenseDate }) {
  const { rows } = await pool.query(
    `INSERT INTO expenses (user_id, category_id, amount, note, expense_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, categoryId, amount, note || null, expenseDate]
  );
  return findByIdForUser(rows[0].id, userId);
}

// Only updates rows owned by this user (BOLA protection).
async function updateOwnedByUser(id, userId, { categoryId, amount, note, expenseDate }) {
  const result = await pool.query(
    `UPDATE expenses
     SET category_id = $1, amount = $2, note = $3, expense_date = $4
     WHERE id = $5 AND user_id = $6`,
    [categoryId, amount, note || null, expenseDate, id, userId]
  );
  if (result.rowCount === 0) return null;
  return findByIdForUser(id, userId);
}

async function deleteOwnedByUser(id, userId) {
  const result = await pool.query(
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
}

module.exports = {
  findAllForUser,
  findByIdForUser,
  create,
  updateOwnedByUser,
  deleteOwnedByUser,
};
