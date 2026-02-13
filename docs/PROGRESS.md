# 📊 PROGRESS LOG
# Money Manager — Driver Ojol Financial Dashboard

> Last Updated: 2026-02-14 02:28 WIB

---

## Sesi Terakhir

- **Tanggal:** 2026-02-14
- **Fase:** F013 (Biaya Bulanan Dinamis)
- **Status:** ✅ DONE
- **Branch:** `feat/F013-biaya-bulanan`
- **PR:** [#9](https://github.com/lukim7711/driver-financial-manager/pull/9)
- **Catatan:** CRUD biaya bulanan + integrasi Target Harian

---

## 🏆 STATUS: v1.2.0 — Monthly Expenses CRUD

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
| OCR-FIX | OCR entry point + language fix | ✅ DONE | main |
| CI-FIX | CD pipeline cache fix | ✅ DONE | main |
| CI/CD-FIX | CD waits for CI pass (workflow_run) | ✅ DONE | main |

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
| F012 | CRUD Hutang (Tambah/Edit/Hapus) | ⬜ TODO | Backend hanya GET + PAY, belum bisa create/edit/delete hutang |

---

## API v1.2.0 — 13 Endpoints

| Endpoint | Method | Feature |
|----------|--------|---------|
| `/api/transactions` | POST, GET | F001 |
| `/api/transactions/:id` | PUT, DELETE | F007 |
| `/api/dashboard` | GET | F004 + DT001 |
| `/api/debts` | GET | F005 |
| `/api/debts/:id/pay` | POST | F006 |
| `/api/report/daily` | GET | F008 |
| `/api/ocr` | POST | F002 |
| `/api/settings` | GET, PUT | Settings + F014 (debt_target_date) |
| `/api/monthly-expenses` | GET, POST | F013 |
| `/api/monthly-expenses/:id` | PUT, DELETE | F013 |

---

## ⚠️ Known Issues / Decisions

| Issue | Status | Detail |
|-------|--------|--------|
| Budget RT campur harian | ✅ FIXED | RT sekarang di-prorate ÷ hari di bulan berjalan |
| OCR language `ind` invalid | ✅ FIXED | Changed to `eng` (free tier compat) |
| OCR tidak ada entry point | ✅ FIXED | Added button di QuickInput step 1 |
| CD cache error | ✅ FIXED | Removed npm cache config, npm ci → npm install |
| Emoji escape bug di Settings | ✅ FIXED | Replaced \\uXXXX with actual emoji chars |
| Missing income categories | ✅ FIXED | Added Tips + Insentif |
| CD deploy tanpa tunggu CI | ✅ FIXED | workflow_run trigger, deploy hanya jika CI success |
| Target date hardcode | ✅ FIXED | F014 — editable di Settings |
| Biaya bulanan hardcode | ✅ FIXED | F013 — CRUD biaya bulanan di Settings |
| Hutang tidak bisa CRUD | ⬜ TODO | Butuh F012 (CRUD Hutang) |

---

## Session Log

### Session 14 — 2026-02-14 02:13–02:28 WIB

**Fase:** F013 (Biaya Bulanan Dinamis)

**Backend:**
- ✅ Tabel `monthly_expenses` — id, name, emoji, amount, is_deleted, created_at
- ✅ Seed default: 🏠 RT/Rumah Tangga Rp 75.000
- ✅ Migration: `budget_rt` dari `settings` otomatis dipindah ke tabel baru
- ✅ CRUD endpoints: GET, POST, PUT, DELETE `/api/monthly-expenses`
- ✅ Dashboard: Query `monthly_expenses` → `SUM(amount)` → `prorated_monthly`
- ✅ Settings: **Hapus** `budget_rt` dari budget keys

**Frontend:**
- ✅ Settings: Section Budget Bulanan jadi dinamis — list + CRUD
- ✅ Tambah item: Modal form dengan nama, emoji picker (pre-defined list), nominal
- ✅ Edit inline: Tiap field bisa di-edit langsung
- ✅ Hapus item: Tombol 🗑️ → confirm → soft delete
- ✅ Total bulanan: Sum semua item, tampil di bawah list
- ✅ DailyTarget: `prorated_rt` → `prorated_monthly`
- ✅ Home: Update dashboard interfaces

**Files Changed:**
- Backend: schema.ts, seed.ts, durable-object.ts, monthly-expense.ts (NEW), dashboard.ts, settings.ts, types/index.ts, index.ts
- Frontend: Settings.tsx, DailyTarget.tsx, Home.tsx, types/index.ts

**PR:** [#9](https://github.com/lukim7711/driver-financial-manager/pull/9) — menunggu CI pass

### Session 13 — 2026-02-14 01:32–01:47 WIB

**Fase:** F014 (Edit Target Tanggal) + CI/CD fix

**F014 — Edit Target Tanggal Lunas:**
- ✅ Backend: `settings.ts` — GET/PUT sekarang support `debt_target_date` field
- ✅ Validasi: format YYYY-MM-DD + cek tanggal valid
- ✅ Frontend: `Settings.tsx` — Section "Target Lunas Hutang" dengan date picker
- ✅ Tampilkan hari tersisa + format tanggal Bahasa Indonesia
- ✅ Dashboard otomatis baca dari DB (sudah support dari DT001)

**CI/CD Pipeline Fix:**
- ✅ `deploy.yml` — Changed trigger dari `on: push` ke `on: workflow_run`
- ✅ CD hanya jalan jika CI conclusion == 'success'
- ✅ `workflow_dispatch` tetap tersedia untuk manual deploy

**CI Fix:**
- ✅ TS6133: Removed unused `navigate` import di Home.tsx
- ✅ TS2339: Narrowed discriminated union sebelum akses `.error` di Settings.tsx

### Session 12 — 2026-02-14 00:23–01:26 WIB

**Fase:** Post-launch hotfixes + Daily Target

**Bug fixes:**
- ✅ Missing income categories (Tips, Insentif)
- ✅ Emoji escape bug di Settings.tsx
- ✅ CD pipeline cache error (package-lock.json not in repo)
- ✅ OCR `E201: language invalid` — `ind` → `eng`
- ✅ OCR no entry point — added button in QuickInput

**New feature: Daily Target (DT001)**
- ✅ Backend: `dashboard.ts` — `daily_target` field with formula
- ✅ Frontend: `DailyTarget.tsx` component
- ✅ Home.tsx — integrated DailyTarget
- ✅ Removed CTA button (redundant with BottomNav)
- ✅ RT prorate: ÷ 30 → ÷ actual days in current month
- ✅ Hide RT breakdown row when value is 0

### Session 11 — 2026-02-13 23:27 WIB

**Fase:** Fase 11 — Settings + PWA + Deploy
- ✅ Settings page, PWA, CD pipeline
- **CI:** ✅ PASS → Merged ([#8](https://github.com/lukim7711/driver-financial-manager/pull/8))

### Session 10 — 2026-02-13 23:17 WIB

**Fase:** Build F002 (Upload Struk OCR)
- **CI:** ✅ PASS → Merged ([#7](https://github.com/lukim7711/driver-financial-manager/pull/7))

### Session 9 — 2026-02-13 23:11 WIB

**Fase:** Build F007+F008 (Laporan Harian + Edit/Delete)
- **CI:** ✅ PASS → Merged ([#6](https://github.com/lukim7711/driver-financial-manager/pull/6))

### Session 8 — 2026-02-13 23:03 WIB

**Fase:** Build F005+F006 (Status Hutang + Bayar Cicilan)
- **CI:** ✅ PASS → Merged ([#5](https://github.com/lukim7711/driver-financial-manager/pull/5))

### Session 7 — 2026-02-13 22:57 WIB

**Fase:** Build F004 Home Dashboard
- **CI:** ✅ PASS → Merged ([#4](https://github.com/lukim7711/driver-financial-manager/pull/4))

### Session 6 — 2026-02-13 22:48 WIB

**Fase:** Build F001 Quick-Tap Input
- **CI:** ✅ PASS → Merged ([#3](https://github.com/lukim7711/driver-financial-manager/pull/3))

---

**Document Control:**
- **Created:** 2026-02-13
- **Last Updated:** 2026-02-14 02:28 WIB
- **Total Sessions:** 14
- **Current Phase:** v1.2.0 — F013 Biaya Bulanan Dinamis
