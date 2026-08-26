-- AI Expense Tracker — PostgreSQL Schema (Supabase)
-- Run this once against your Supabase database, e.g. via the Supabase SQL
-- Editor, or: psql "$DATABASE_URL" -f schema.sql
--
-- Note: Supabase already gives you a database (usually "postgres"), so
-- unlike the old MySQL script there's no CREATE DATABASE / USE step here.

-- ─────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- categories
-- user_id = NULL  -> global/default category (visible to everyone)
-- user_id = X     -> custom category created by user X
-- ─────────────────────────────────────────────
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(50) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uniq_user_category UNIQUE (user_id, name)
);

-- ─────────────────────────────────────────────
-- expenses
-- ─────────────────────────────────────────────
CREATE TABLE expenses (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   INTEGER NOT NULL REFERENCES categories(id),
  amount        DECIMAL(10,2) NOT NULL,
  note          VARCHAR(255) NULL,
  expense_date  DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON expenses (user_id, expense_date);

-- ─────────────────────────────────────────────
-- budgets (one row per user per month/year)
-- ─────────────────────────────────────────────
CREATE TABLE budgets (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month   SMALLINT NOT NULL,   -- 1–12
  year    SMALLINT NOT NULL,
  amount  DECIMAL(10,2) NOT NULL,
  CONSTRAINT uniq_user_month UNIQUE (user_id, month, year)
);

-- ─────────────────────────────────────────────
-- ai_insights (history/cache of AI responses)
-- Postgres has no MySQL-style inline ENUM, so we use TEXT + CHECK instead.
-- ─────────────────────────────────────────────
CREATE TABLE ai_insights (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('summary', 'question')),
  request_text  TEXT NULL,
  response_text TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Seed: default categories (global, user_id = NULL)
-- ─────────────────────────────────────────────
INSERT INTO categories (user_id, name, is_default) VALUES
  (NULL, 'Food', TRUE),
  (NULL, 'Transport', TRUE),
  (NULL, 'Shopping', TRUE),
  (NULL, 'Entertainment', TRUE),
  (NULL, 'Bills & Utilities', TRUE),
  (NULL, 'Health', TRUE),
  (NULL, 'Other', TRUE);
