// backend/src/models/userModel.js
// All DB access for the "users" table lives here. Controllers never write
// raw SQL directly — they call these functions instead. Every query uses
// parameterized placeholders ($1, $2, ...) to prevent SQL injection.

const { pool } = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, passwordHash]
  );
  return rows[0];
}

module.exports = { findByEmail, findById, createUser };
