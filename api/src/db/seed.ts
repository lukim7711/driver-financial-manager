export const SEED_SQL = `
-- ============================================================================
-- Money Manager — Seed Data (Pre-loaded Debts)
-- Data per 12 Feb 2026
-- ============================================================================

-- Insert 5 debts
INSERT INTO debts (id, platform, total_original, total_remaining, monthly_installment, due_day, late_fee_type, late_fee_rate, total_installments, paid_installments) VALUES
('shopee',    'Shopee Pinjam',  4359170, 4359170, 435917, 13, 'pct_monthly', 0.05, 10, 0),
('spaylater', 'SPayLater',       651389,  651389, 162845,  1, 'pct_monthly', 0.05,  5, 0),
('seabank',   'SeaBank Pinjam', 1627500, 1627500, 232500,  5, 'pct_daily',   0.0025, 7, 0),
('kredivo1',  'Kredivo 1',      1006050, 1006050, 335350, 28, 'pct_monthly', 0.04,  3, 0),
('kredivo2',  'Kredivo 2',       641010,  641010, 213670, 15, 'pct_monthly', 0.04,  3, 0);

-- Shopee Pinjam (10 cicilan)
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('shopee-01', 'shopee', '2026-03-13', 435917, 'unpaid', NULL, NULL),
('shopee-02', 'shopee', '2026-04-13', 435917, 'unpaid', NULL, NULL),
('shopee-03', 'shopee', '2026-05-13', 435917, 'unpaid', NULL, NULL),
('shopee-04', 'shopee', '2026-06-13', 435917, 'unpaid', NULL, NULL),
('shopee-05', 'shopee', '2026-07-13', 435917, 'unpaid', NULL, NULL),
('shopee-06', 'shopee', '2026-08-13', 435917, 'unpaid', NULL, NULL),
('shopee-07', 'shopee', '2026-09-13', 435917, 'unpaid', NULL, NULL),
('shopee-08', 'shopee', '2026-10-13', 435917, 'unpaid', NULL, NULL),
('shopee-09', 'shopee', '2026-11-13', 435917, 'unpaid', NULL, NULL),
('shopee-10', 'shopee', '2026-12-13', 435917, 'unpaid', NULL, NULL);

-- SPayLater (5 cicilan)
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('spaylater-01', 'spaylater', '2026-03-01', 162845, 'unpaid', NULL, NULL),
('spaylater-02', 'spaylater', '2026-04-01', 162845, 'unpaid', NULL, NULL),
('spaylater-03', 'spaylater', '2026-05-01', 162845, 'unpaid', NULL, NULL),
('spaylater-04', 'spaylater', '2026-06-01', 162845, 'unpaid', NULL, NULL),
('spaylater-05', 'spaylater', '2026-07-01', 9, 'unpaid', NULL, NULL);

-- SeaBank Pinjam (7 cicilan)
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('seabank-01', 'seabank', '2026-03-05', 232500, 'unpaid', NULL, NULL),
('seabank-02', 'seabank', '2026-04-05', 232500, 'unpaid', NULL, NULL),
('seabank-03', 'seabank', '2026-05-05', 232500, 'unpaid', NULL, NULL),
('seabank-04', 'seabank', '2026-06-05', 232500, 'unpaid', NULL, NULL),
('seabank-05', 'seabank', '2026-07-05', 232500, 'unpaid', NULL, NULL),
('seabank-06', 'seabank', '2026-08-05', 232500, 'unpaid', NULL, NULL),
('seabank-07', 'seabank', '2026-09-05', 232500, 'unpaid', NULL, NULL);

-- Kredivo 1 (3 cicilan tersisa)
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('kredivo1-01', 'kredivo1', '2026-02-28', 335350, 'unpaid', NULL, NULL),
('kredivo1-02', 'kredivo1', '2026-03-28', 335350, 'unpaid', NULL, NULL),
('kredivo1-03', 'kredivo1', '2026-04-28', 335350, 'unpaid', NULL, NULL);

-- Kredivo 2 (3 cicilan tersisa)
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('kredivo2-01', 'kredivo2', '2026-02-15', 213670, 'unpaid', NULL, NULL),
('kredivo2-02', 'kredivo2', '2026-03-15', 213670, 'unpaid', NULL, NULL),
('kredivo2-03', 'kredivo2', '2026-04-15', 213670, 'unpaid', NULL, NULL);

-- Default settings (daily budgets + target date)
INSERT INTO settings (key, value) VALUES
('budget_bbm', '40000'),
('budget_makan', '25000'),
('budget_rokok', '27000'),
('budget_pulsa', '5000'),
('debt_target_date', '2026-04-13');

-- Default monthly expenses (F013)
INSERT INTO monthly_expenses (id, name, emoji, amount, is_deleted, created_at) VALUES
('me-rt', 'RT/Rumah Tangga', '🏠', 75000, 0, '2026-02-12T00:00:00+07:00');
`
