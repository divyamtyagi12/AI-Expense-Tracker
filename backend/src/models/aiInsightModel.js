// backend/src/models/aiInsightModel.js
// Persists and retrieves AI-generated insight history for each user.
// Table `ai_insights` is defined in database/schema.sql.

const { pool } = require('../config/db');

/**
 * Save a new insight (summary or question/answer).
 * @param {number} userId
 * @param {'summary'|'question'} type
 * @param {string|null} requestText  — the user's question (null for summary)
 * @param {string}      responseText — the AI's answer
 */
async function create(userId, type, requestText, responseText) {
  const { rows } = await pool.query(
    `INSERT INTO ai_insights (user_id, type, request_text, response_text)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, type, requestText || null, responseText]
  );
  return findById(rows[0].id);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM ai_insights WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Return the most recent N insights for a user.
 */
async function findRecentForUser(userId, limit = 10) {
  const { rows } = await pool.query(
    `SELECT id, type, request_text, response_text, created_at
     FROM ai_insights
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

/**
 * Delete all insights for a user (for "clear history" feature).
 */
async function deleteAllForUser(userId) {
  await pool.query('DELETE FROM ai_insights WHERE user_id = $1', [userId]);
}

module.exports = { create, findById, findRecentForUser, deleteAllForUser };
