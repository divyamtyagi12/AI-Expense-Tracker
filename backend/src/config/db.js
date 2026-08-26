const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Postgres (Supabase) connected successfully");
    client.release();
  } catch (err) {
console.error('❌ Postgres connection failed:');
console.error(err);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };