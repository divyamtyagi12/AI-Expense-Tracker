// backend/src/models/categoryModel.js

const { pool } = require('../config/db');

// Returns default (global) categories + this user's custom categories.
async function findAllForUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, is_default
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY is_default DESC, name ASC`,
    [userId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByNameForUser(userId, name) {
  const { rows } = await pool.query(
    `SELECT * FROM categories WHERE name = $1 AND (user_id IS NULL OR user_id = $2)`,
    [name, userId]
  );
  return rows[0] || null;
}

async function create(userId, name) {
  const { rows } = await pool.query(
    'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, FALSE) RETURNING id, name, is_default',
    [userId, name]
  );
  return rows[0];
}

// Deletes a category only if it belongs to this user (never a default one).
async function deleteOwnedByUser(id, userId) {
  const result = await pool.query(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
}

// Renames a custom category owned by this user.
async function renameOwnedByUser(id, userId, newName) {
  const result = await pool.query(
    'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3',
    [newName, id, userId]
  );
  if (result.rowCount === 0) return null;
  const { rows } = await pool.query('SELECT id, name, is_default FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

// Checks a category is usable by this user (default OR their own) —
// used to validate category_id before attaching it to an expense.
async function isUsableByUser(categoryId, userId) {
  const { rows } = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
    [categoryId, userId]
  );
  return rows.length > 0;
}

module.exports = {
  findAllForUser,
  findById,
  findByNameForUser,
  create,
  deleteOwnedByUser,
  renameOwnedByUser,
  isUsableByUser,
};
