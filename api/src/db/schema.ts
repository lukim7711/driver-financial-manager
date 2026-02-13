export const SCHEMA_SQL = `
-- ============================================================================
-- Money Manager — Database Schema
-- ============================================================================

-- Table: debts
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  total_original INTEGER NOT NULL,
  total_remaining INTEGER NOT NULL,
  monthly_installment INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  late_fee_type TEXT NOT NULL,
  late_fee_rate REAL NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0
);

-- Table: debt_schedule
CREATE TABLE IF NOT EXISTS debt_schedule (
  id TEXT PRIMARY KEY,
  debt_id TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  paid_date TEXT,
  paid_amount INTEGER,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  debt_id TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE SET NULL
);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Table: monthly_expenses (F013)
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  amount INTEGER NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_debt_schedule_status ON debt_schedule(status);
CREATE INDEX IF NOT EXISTS idx_debt_schedule_due_date ON debt_schedule(due_date);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_active ON monthly_expenses(is_deleted);
`
