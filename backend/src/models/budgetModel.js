// backend/src/models/budgetModel.js

const { pool } = require('../config/db');

/**
 * Insert or update the monthly budget for a user.
 * Uses Postgres's INSERT … ON CONFLICT DO UPDATE (upsert) pattern, matched
 * to the uniq_user_month constraint on (user_id, month, year).
 */
async function upsert(userId, month, year, amount) {
  await pool.query(
    `INSERT INTO budgets (user_id, month, year, amount)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, month, year) DO UPDATE SET amount = EXCLUDED.amount`,
    [userId, month, year, amount]
  );
  return findForUser(userId, month, year);
}

/**
 * Return the budget row for a given user/month/year, or null if none set.
 */
async function findForUser(userId, month, year) {
  const { rows } = await pool.query(
    'SELECT id, user_id, month, year, amount FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
    [userId, month, year]
  );
  return rows[0] || null;
}

/**
 * Delete the budget for a given user/month/year.
 * Returns true if a row was deleted.
 */
async function deleteForUser(userId, month, year) {
  const result = await pool.query(
    'DELETE FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
    [userId, month, year]
  );
  return result.rowCount > 0;
}

module.exports = { upsert, findForUser, deleteForUser };
