# F003 — Pre-loaded Data Hutang

> **Priority:** MUST  
> **Estimated Build:** 15 menit  
> **Dependencies:** Durable Objects schema + seed  

---

## 1. Overview

Saat app pertama kali dijalankan (atau DO pertama kali di-initialize), 5 hutang beserta jadwal cicilan otomatis di-INSERT ke database. User tidak perlu input data hutang manual.

---

## 2. Acceptance Criteria

- [ ] Saat DO pertama kali init, `debts` table terisi 5 record
- [ ] Saat DO pertama kali init, `debt_schedule` table terisi semua jadwal cicilan
- [ ] Data sesuai dengan studi kasus PRD (per 12 Feb 2026)
- [ ] Init hanya terjadi 1x (idempotent — cek apakah data sudah ada)
- [ ] Semua amount dalam INTEGER (Rupiah)
- [ ] Jadwal jatuh tempo akurat per platform

---

## 3. Seed Data

### 3.1 Tabel: `debts`

```sql
INSERT INTO debts (id, platform, total_original, total_remaining, monthly_installment, due_day, late_fee_type, late_fee_rate, total_installments, paid_installments) VALUES
('shopee',    'Shopee Pinjam',  4904446, 4904446, 435917, 13, 'pct_monthly', 0.05, 10, 0),
('spaylater', 'SPayLater',       672194,  672194, 162845,  1, 'pct_monthly', 0.05,  5, 0),
('seabank',   'SeaBank Pinjam', 1627500, 1627500, 232500,  5, 'pct_daily',   0.0025, 7, 0),
('kredivo1',  'Kredivo 1',      1006050, 1006050, 335350, 28, 'pct_monthly', 0.04,  3, 0),
('kredivo2',  'Kredivo 2',       641010,  641010, 213670, 15, 'pct_monthly', 0.04,  3, 0);
```

### 3.2 Tabel: `debt_schedule`

Contoh untuk Shopee Pinjam (10 cicilan):

```sql
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
```

SPayLater (5 cicilan):
```sql
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('spaylater-01', 'spaylater', '2026-03-01', 162845, 'unpaid', NULL, NULL),
('spaylater-02', 'spaylater', '2026-04-01', 162845, 'unpaid', NULL, NULL),
('spaylater-03', 'spaylater', '2026-05-01', 162845, 'unpaid', NULL, NULL),
('spaylater-04', 'spaylater', '2026-06-01', 162845, 'unpaid', NULL, NULL),
('spaylater-05', 'spaylater', '2026-07-01', 9, 'unpaid', NULL, NULL);
```

SeaBank (7 cicilan):
```sql
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('seabank-01', 'seabank', '2026-03-05', 232500, 'unpaid', NULL, NULL),
('seabank-02', 'seabank', '2026-04-05', 232500, 'unpaid', NULL, NULL),
('seabank-03', 'seabank', '2026-05-05', 232500, 'unpaid', NULL, NULL),
('seabank-04', 'seabank', '2026-06-05', 232500, 'unpaid', NULL, NULL),
('seabank-05', 'seabank', '2026-07-05', 232500, 'unpaid', NULL, NULL),
('seabank-06', 'seabank', '2026-08-05', 232500, 'unpaid', NULL, NULL),
('seabank-07', 'seabank', '2026-09-05', 232500, 'unpaid', NULL, NULL);
```

Kredivo 1 (3 cicilan tersisa):
```sql
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('kredivo1-01', 'kredivo1', '2026-02-28', 335350, 'unpaid', NULL, NULL),
('kredivo1-02', 'kredivo1', '2026-03-28', 335350, 'unpaid', NULL, NULL),
('kredivo1-03', 'kredivo1', '2026-04-28', 335350, 'unpaid', NULL, NULL);
```

Kredivo 2 (3 cicilan tersisa):
```sql
INSERT INTO debt_schedule (id, debt_id, due_date, amount, status, paid_date, paid_amount) VALUES
('kredivo2-01', 'kredivo2', '2026-02-15', 213670, 'unpaid', NULL, NULL),
('kredivo2-02', 'kredivo2', '2026-03-15', 213670, 'unpaid', NULL, NULL),
('kredivo2-03', 'kredivo2', '2026-04-15', 213670, 'unpaid', NULL, NULL);
```

---

## 4. Initialization Logic

```
DO constructor / first request:
1. CREATE TABLE IF NOT EXISTS debts (...)
2. CREATE TABLE IF NOT EXISTS debt_schedule (...)
3. SELECT COUNT(*) FROM debts
4. IF count == 0:
     → Run seed.sql (INSERT all debts + schedules)
5. ELSE:
     → Skip seed (already initialized)
```

---

## 5. Edge Cases

| Case | Handling |
|------|----------|
| DO sudah pernah di-init | Skip seed (idempotent check) |
| SPayLater cicilan terakhir bukan bulat | Rp 9 (sisa pembulatan), tetap masuk schedule |
| Kredivo 2 jatuh tempo 15 Feb (besok!) | Status 'unpaid', tampil sebagai urgent di dashboard |
| User ingin edit data hutang awal | Bisa via Settings atau langsung edit di Debts page (future) |

---

## 6. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | First app load | 5 debts + 28 schedules created |
| 2 | Second app load | No duplicate inserts |
| 3 | GET /api/debts | Returns 5 debts with correct data |
| 4 | Verify Shopee total | 10 × 435.917 = not exactly 4.904.446 (includes bunga) |
| 5 | Verify nearest due date | Kredivo 2: 15 Feb 2026 |
