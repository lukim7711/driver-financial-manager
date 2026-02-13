# 📊 PROGRESS LOG
# Money Manager — Driver Ojol Financial Dashboard

> Last Updated: 2026-02-14 03:17 WIB

---

## Sesi Terakhir

- **Tanggal:** 2026-02-14
- **Fase:** Budget Harian CRUD + Fix Prorate
- **Status:** ✅ MERGED
- **PR:** [#11](https://github.com/lukim7711/driver-financial-manager/pull/11)
- **Catatan:** Budget harian jadi CRUD dinamis, pisahkan dari prorate bulanan di BudgetBar.

---

## 🏆 STATUS: v1.3.1 — Budget Harian CRUD

### Infrastructure

| ID | Nama | Status | PR |
|----|------|--------|----|
| SETUP | Project Setup | ✅ DONE | [#2](https://github.com/lukim7711/driver-financial-manager/pull/2) |
| CD | GitHub Actions Deploy | ✅ DONE | main |
| CI/CD-FIX | CD waits for CI pass | ✅ DONE | main (workflow_run trigger) |

### MVP Features (8/8 MUST — ALL DONE)

| ID | Nama | Status | PR |
|----|------|--------|----|
| F001 | Quick-Tap Input Transaksi | ✅ DONE | [#3](https://github.com/lukim7711/driver-financial-manager/pull/3) |
| F002 | Upload Struk OCR | ✅ DONE | [#7](https://github.com/lukim7711/driver-financial-manager/pull/7) |
| F003 | Pre-loaded Data Hutang | ✅ DONE | [#2](https://github.com/lukim7711/driver-financial-manager/pull/2) |
| F004 | Home Dashboard | ✅ DONE | [#4](https://github.com/lukim7711/driver-financial-manager/pull/4) |
| F005 | Status Hutang | ✅ DONE | [#5](https://github.com/lukim7711/driver-financial-manager/pull/5) |
| F006 | Bayar Hutang (Tandai Lunas) | ✅ DONE | [#5](https://github.com/lukim7711/driver-financial-manager/pull/5) |
| F007 | Edit/Hapus Transaksi | ✅ DONE | [#6](https://github.com/lukim7711/driver-financial-manager/pull/6) |
| F008 | Laporan Harian | ✅ DONE | [#6](https://github.com/lukim7711/driver-financial-manager/pull/6) |

### Post-Launch Features

| ID | Nama | Status | Commit/PR |
|----|------|--------|--------|
| DT001 | Daily Target (Target Harian Minimal) | ✅ DONE | main |
| F014 | Edit Target Tanggal Lunas | ✅ DONE | main |
| F013 | Biaya Bulanan Dinamis | ✅ DONE | [#9](https://github.com/lukim7711/driver-financial-manager/pull/9) |
| F012 | CRUD Hutang (Tambah/Edit/Hapus) | ✅ DONE | [#10](https://github.com/lukim7711/driver-financial-manager/pull/10) |
| BDG-FIX | Budget Harian CRUD + Fix Prorate | ✅ DONE | [#11](https://github.com/lukim7711/driver-financial-manager/pull/11) |
| OCR-FIX | OCR entry point + language fix | ✅ DONE | main |
| CI-FIX | CD pipeline cache fix | ✅ DONE | main |
| CI/CD-FIX | CD waits for CI pass (workflow_run) | ✅ DONE | main |
| EMOJI-FIX | Emoji escape bug di DailyTarget | ✅ DONE | main |

### Bonus

| ID | Nama | Status | PR |
|----|------|--------|----|
| Settings | Budget per Kategori | ✅ DONE | [#8](https://github.com/lukim7711/driver-financial-manager/pull/8) |
| PWA | Manifest + SW + Cache | ✅ DONE | [#8](https://github.com/lukim7711/driver-financial-manager/pull/8) |
| Deploy | CD via GitHub Actions | ✅ DONE | main |

### Future Features

| ID | Nama | Status | Catatan |
|----|------|--------|--------|
| F009 | Ringkasan Mingguan | ⬜ TODO | |
| F011 | Help/Onboarding | ⬜ TODO | |

---

## API v1.3.1 — 20 Endpoints

| Endpoint | Method | Feature |
|----------|--------|---------|
| `/api/transactions` | POST, GET | F001 |
| `/api/transactions/:id` | PUT, DELETE | F007 |
| `/api/dashboard` | GET | F004 + DT001 |
| `/api/debts` | GET, POST | F005 + F012 |
| `/api/debts/:id` | PUT, DELETE | F012 |
| `/api/debts/:id/pay` | POST | F006 |
| `/api/report/daily` | GET | F008 |
| `/api/ocr` | POST | F002 |
| `/api/settings` | GET, PUT | Settings + F014 |
| `/api/monthly-expenses` | GET, POST | F013 |
| `/api/monthly-expenses/:id` | PUT, DELETE | F013 |
| `/api/daily-expenses` | GET, POST | BDG-FIX |
| `/api/daily-expenses/:id` | PUT, DELETE | BDG-FIX |

---

## ⚠️ Known Issues / Decisions

| Issue | Status | Detail |
|-------|--------|--------|
| Budget RT campur harian | ✅ FIXED | RT sekarang di-prorate ÷ hari di bulan berjalan |
| OCR language `ind` invalid | ✅ FIXED | Changed to `eng` (free tier compat) |
| OCR tidak ada entry point | ✅ FIXED | Added button di QuickInput step 1 |
| CD cache error | ✅ FIXED | Removed npm cache config, npm ci → npm install |
| Emoji escape bug di Settings | ✅ FIXED | Replaced \\uXXXX with actual emoji chars |
| Emoji escape bug di DailyTarget | ✅ FIXED | Same fix applied to DailyTarget.tsx |
| Missing income categories | ✅ FIXED | Added Tips + Insentif |
| CD deploy tanpa tunggu CI | ✅ FIXED | workflow_run trigger, deploy hanya jika CI success |
| Target date hardcode | ✅ FIXED | F014 — editable di Settings |
| Biaya bulanan hardcode | ✅ FIXED | F013 — CRUD biaya bulanan di Settings |
| Hutang tidak bisa CRUD | ✅ FIXED | F012 — POST/PUT/DELETE /api/debts |
| Budget harian beda Home vs Settings | ✅ FIXED | Prorate dihapus dari BudgetBar, budget harian jadi CRUD |
| Budget harian hardcode 4 item | ✅ FIXED | Tabel daily_expenses + CRUD /api/daily-expenses |

---

## Session Log

### Session 16 — 2026-02-14 03:07–03:17 WIB

**Fase:** Budget Harian CRUD + Fix Prorate

**Problem:** Budget harian di Home (Sisa Budget: dari Rp 115.571) berbeda dengan Settings (Total Harian: Rp 87.000) karena prorate biaya bulanan ditambahkan ke budget harian di BudgetBar.

**Backend:**
- ✅ New table: `daily_expenses` (id, name, emoji, amount, is_deleted, created_at)
- ✅ Migration: `budget_bbm/makan/rokok/pulsa` dari `settings` → `daily_expenses` rows
- ✅ New route: CRUD `/api/daily-expenses` (GET, POST, PUT, DELETE)
- ✅ Dashboard: `budget.daily_total` = SUM(daily_expenses) saja (NO prorate)
- ✅ Dashboard: field renamed `daily_expense` → `daily_total`
- ✅ Debt query: added `WHERE is_deleted = 0` filter

**Frontend:**
- ✅ Settings.tsx: Complete rewrite — Budget Harian jadi CRUD dinamis
- ✅ Settings.tsx: Shared `renderExpenseItem` + `renderAddForm` helpers (DRY)
- ✅ Settings.tsx: Target date save terpisah (inline button)
- ✅ Home.tsx: BudgetBar pakai `budget.daily_total` langsung (tanpa prorate)
- ✅ BudgetBar.tsx: Label "Sisa Budget" → "Sisa Budget Harian"
- ✅ Types: `DailyExpense` interface

**Design Decision:**
- BudgetBar = batas max pengeluaran harian (user control)
- DailyTarget = target income minimum (include prorate + hutang)
- Keduanya punya fungsi berbeda, tidak boleh dicampur

**Result:** CI ✅ PASS → Squash-merged ([#11](https://github.com/lukim7711/driver-financial-manager/pull/11))

### Session 15 — 2026-02-14 02:48–02:56 WIB

**Fase:** F012 (CRUD Hutang)

**Backend:**
- ✅ POST `/api/debts` — create new debt + auto-generate monthly schedules
- ✅ PUT `/api/debts/:id` — edit platform, total, installment, due_day, late fee
- ✅ DELETE `/api/debts/:id` — soft delete + cascade delete schedules
- ✅ Schema migration: `is_deleted` + `created_at` columns on debts table
- ✅ Durable Object: `migrateDebtsColumns()` — ALTER TABLE with try/catch
- ✅ GET filter: `WHERE is_deleted = 0 OR is_deleted IS NULL`
- ✅ Validasi: platform max 50 char, integer > 0, due_day 1-31, installments 1-120
- ✅ Schedule generation: from due_day + total_installments, starting current month

**Frontend:**
- ✅ `AddDebtForm.tsx` (NEW) — Bottom sheet: platform, total, cicilan, tgl jatuh tempo, jumlah cicilan, tipe denda, rate denda
- ✅ `EditDebtDialog.tsx` (NEW) — Partial edit with smart diff, only sends changed fields
- ✅ `DeleteDebtDialog.tsx` (NEW) — Konfirmasi hapus + info sisa hutang
- ✅ `DebtCard.tsx` — Added ✏️ edit + 🗑️ delete buttons in expanded view
- ✅ `Debts.tsx` — FAB (+) button, empty state, CRUD state/handlers, render dialogs

**Result:** CI ✅ PASS → Squash-merged ([#10](https://github.com/lukim7711/driver-financial-manager/pull/10))

### Session 14 — 2026-02-14 02:13–02:35 WIB

**Fase:** F013 (Biaya Bulanan Dinamis)

**Result:** CI ✅ PASS → Squash-merged ([#9](https://github.com/lukim7711/driver-financial-manager/pull/9))

### Session 13 — 2026-02-14 01:32–01:47 WIB

**Fase:** F014 (Edit Target Tanggal) + CI/CD fix

### Session 12 — 2026-02-14 00:23–01:26 WIB

**Fase:** Post-launch hotfixes + Daily Target

### Session 11 — 2026-02-13 23:27 WIB

**Fase:** Settings + PWA + Deploy → Merged ([#8](https://github.com/lukim7711/driver-financial-manager/pull/8))

### Session 10 — 2026-02-13 23:17 WIB

**Fase:** F002 (Upload Struk OCR) → Merged ([#7](https://github.com/lukim7711/driver-financial-manager/pull/7))

### Session 9 — 2026-02-13 23:11 WIB

**Fase:** F007+F008 → Merged ([#6](https://github.com/lukim7711/driver-financial-manager/pull/6))

### Session 8 — 2026-02-13 23:03 WIB

**Fase:** F005+F006 → Merged ([#5](https://github.com/lukim7711/driver-financial-manager/pull/5))

### Session 7 — 2026-02-13 22:57 WIB

**Fase:** F004 → Merged ([#4](https://github.com/lukim7711/driver-financial-manager/pull/4))

### Session 6 — 2026-02-13 22:48 WIB

**Fase:** F001 → Merged ([#3](https://github.com/lukim7711/driver-financial-manager/pull/3))

---

**Document Control:**
- **Created:** 2026-02-13
- **Last Updated:** 2026-02-14 03:17 WIB
- **Total Sessions:** 16
- **Current Phase:** v1.3.1 — Budget Harian CRUD (SHIPPED)
