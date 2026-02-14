# 🧭 AI-CONTEXT
# Money Manager — AI Navigation Map

> **Version:** 7.0  
> **Last Updated:** 2026-02-14  

---

## 1. Project Summary

**Money Manager** adalah personal financial dashboard (Web PWA) untuk seorang driver ojol yang ingin melunasi hutang Rp 8.285.119 dalam 2 bulan. App mengutamakan kecepatan input (4 tap, 0 ketik, < 3 detik per transaksi) dan real-time tracking hutang.

---

## 2. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Hono on Cloudflare Workers |
| Database | Durable Objects (SQLite) |
| OCR | ocr.space API |
| AI (future) | Workers AI — @cf/openai/gpt-oss-20b |
| Hosting | Cloudflare Pages + Workers |
| Language | TypeScript (strict) |
| PWA | manifest.json + Service Worker |

---

## 3. Architecture

```
User (Browser HP - PWA)
   │
   ▼
Cloudflare Pages (React SPA)
   │ REST API calls
   ▼
Cloudflare Workers (Hono API)
   ├── /api/transactions      → CRUD transaksi
   ├── /api/debts             → CRUD hutang + bayar cicilan
   ├── /api/daily-expenses    → CRUD budget harian
   ├── /api/monthly-expenses  → CRUD biaya bulanan
   ├── /api/report            → Laporan harian/mingguan/bulanan/custom
   ├── /api/ocr               → Proxy ke ocr.space (struk)
   ├── /api/ocr/orders        → Parse screenshot Shopee → order list
   ├── /api/orders/batch      → Batch save orders + income transaction
   ├── /api/settings          → Target date + rest days preferences
   └── /api/dashboard         → Aggregate home data + daily target + rest day
   │
   ▼
Durable Objects (SQLite)
   ├── debts            (pre-loaded + user-created)
   ├── debt_schedule    (pre-loaded + auto-generated)
   ├── transactions     (runtime: user input)
   ├── orders           (runtime: parsed from Shopee screenshots)
   ├── daily_expenses   (runtime: CRUD budget harian)
   ├── monthly_expenses (runtime: CRUD biaya bulanan)
   └── settings         (runtime: target date, rest_days)
```

---

## 4. File Map

### 4.1 Documentation (`docs/`)

| File | Purpose | When to Read |
|------|---------|--------------|
| `docs/PRD.md` | Product requirements, studi kasus, features, UI flows | Memahami APA yang dibangun |
| `docs/CONSTITUTION.md` | Tech stack, code rules, API contract, deployment | Memahami BAGAIMANA membangun |
| `docs/AI-CONTEXT.md` | This file — navigation map | Orientasi awal sebelum kerja |
| `docs/PROGRESS.md` | Session log, current phase, decisions, known issues | Status terkini proyek |
| `docs/features/*.md` | Per-feature detailed spec | Saat implement fitur spesifik |
| `docs/adr/*.md` | Architecture Decision Records | Sejarah keputusan teknis |

### 4.2 Frontend (`frontend/`)

| File/Dir | Purpose |
|----------|---------|
| `frontend/src/App.tsx` | Root component + routing setup |
| `frontend/src/main.tsx` | React entry point |
| `frontend/src/pages/Home.tsx` | Dashboard: summary + daily target + budget bar + alerts |
| `frontend/src/pages/QuickInput.tsx` | Tap-based input: type → category → amount → save |
| `frontend/src/pages/OcrUpload.tsx` | Upload struk foto → OCR → auto-parse (2-tab: Struk \| Rekap Order) |
| `frontend/src/pages/OrderImport.tsx` | Upload screenshot Shopee → parse → preview → batch save |
| `frontend/src/pages/Debts.tsx` | CRUD hutang + progress + bayar cicilan + FAB tambah |
| `frontend/src/pages/Report.tsx` | Laporan harian/mingguan/bulanan/custom + riwayat + export CSV |
| `frontend/src/pages/Settings.tsx` | Target date + rest days + CRUD budget harian + CRUD biaya bulanan |
| `frontend/src/components/DailyTarget.tsx` | Target harian: working day (progress bar) vs rest day (🌙 banner + bonus) |
| `frontend/src/components/SummaryCard.tsx` | Ringkasan pemasukan/pengeluaran/profit hari ini |
| `frontend/src/components/BudgetBar.tsx` | Sisa budget harian (daily only, no prorate) |
| `frontend/src/components/CategoryGrid.tsx` | Grid kategori income/expense |
| `frontend/src/components/AmountInput.tsx` | Input nominal dengan preset buttons |
| `frontend/src/components/BottomNav.tsx` | Navigation bar: Home, Catat, Hutang, Laporan, Setting |
| `frontend/src/components/DueAlert.tsx` | Alert jatuh tempo hutang |
| `frontend/src/components/DebtProgress.tsx` | Progress bar total hutang |
| `frontend/src/components/DebtCard.tsx` | Card hutang: detail + bayar + edit + hapus |
| `frontend/src/components/AddDebtForm.tsx` | Bottom sheet form tambah hutang baru |
| `frontend/src/components/EditDebtDialog.tsx` | Bottom sheet form edit hutang |
| `frontend/src/components/DeleteDebtDialog.tsx` | Dialog konfirmasi hapus hutang |
| `frontend/src/components/ExportCsvButton.tsx` | Tombol export CSV (harian & mingguan & bulanan) |
| `frontend/src/components/OnboardingOverlay.tsx` | 5-step walkthrough modal |
| `frontend/src/components/OrderPreview.tsx` | Preview order list (editable): date, time, platform, fare |
| `frontend/src/hooks/use-onboarding.ts` | localStorage hook for onboarding state |
| `frontend/src/hooks/` | useApi, useTransactions, useDebts |
| `frontend/src/lib/api.ts` | API client base |
| `frontend/src/lib/format.ts` | Format Rupiah (Rp 50.000), tanggal |
| `frontend/src/lib/csv-export.ts` | CSV generation + browser download utility |
| `frontend/src/lib/compress-image.ts` | Quality-first image compression for OCR upload |
| `frontend/src/types/index.ts` | Shared TypeScript interfaces |
| `frontend/public/manifest.json` | PWA config |
| `frontend/public/sw.js` | Service worker for caching |

### 4.3 Backend API (`api/`)

| File/Dir | Purpose |
|----------|---------|
| `api/src/index.ts` | Worker entry + Hono app init + DO export |
| `api/src/routes/transaction.ts` | CRUD /api/transactions |
| `api/src/routes/debt.ts` | CRUD /api/debts + POST pay |
| `api/src/routes/daily-expense.ts` | CRUD /api/daily-expenses |
| `api/src/routes/monthly-expense.ts` | CRUD /api/monthly-expenses |
| `api/src/routes/report.ts` | GET daily/weekly report |
| `api/src/routes/report-monthly.ts` | GET monthly report |
| `api/src/routes/report-custom.ts` | GET custom date range report |
| `api/src/routes/ocr.ts` | POST image → ocr.space → parsed receipt |
| `api/src/routes/ocr-orders.ts` | POST screenshot → ocr.space → parsed Shopee orders |
| `api/src/routes/orders-batch.ts` | POST batch save orders + income transaction |
| `api/src/routes/settings.ts` | GET/PUT settings (target date, rest_days) |
| `api/src/routes/dashboard.ts` | GET dashboard aggregate + daily target + rest day detection |
| `api/src/db/durable-object.ts` | DO class: SQLite init, migrations |
| `api/src/db/schema.ts` | Table definitions (SQL string) |
| `api/src/db/seed.ts` | Pre-loaded hutang data (5 platform) |
| `api/src/utils/db.ts` | Shared DB utilities (getDB, queryDB) |
| `api/src/utils/date.ts` | Shared date utilities (getNowISO) |
| `api/src/utils/id.ts` | Shared ID generator (generateId) |
| `api/wrangler.toml` | CF Worker config: DO bindings |

---

## 5. Key Business Rules

### 5.1 Transaksi
- Semua `amount` dalam INTEGER Rupiah (no floating point)
- Tipe: `income`, `expense`, `debt_payment`
- Soft delete: set `is_deleted = 1`, never hard delete
- Source: `manual`, `ocr` (receipt), `ocr_order` (Shopee batch)

### 5.2 Hutang
- 5 hutang pre-loaded + user bisa tambah/edit/hapus
- Jadwal cicilan auto-generated dari `due_day` + `total_installments`
- Soft delete: `is_deleted = 1`

### 5.3 Budget Harian
- Disimpan di tabel `daily_expenses` (bukan `settings`)
- CRUD dinamis: user bisa tambah/edit/hapus kategori
- Default: BBM, Makan, Rokok, Pulsa (migrasi dari settings)
- **BudgetBar = SUM(daily_expenses) - pengeluaran hari ini**
- **TIDAK termasuk prorate bulanan** (itu di DailyTarget)

### 5.4 Biaya Bulanan
- Disimpan di tabel `monthly_expenses`
- CRUD dinamis di Settings
- Digunakan di DailyTarget sebagai prorate (÷ hari di bulan)

### 5.5 Target Harian Minimal (DT001 + F016)
- **Hari Kerja:** `Target = Budget Harian + (Bulanan ÷ Hari di Bulan) + (Sisa Hutang ÷ Hari Kerja Tersisa)`
- **Hari Libur:** `Target = 0` (pemasukan ditampilkan sebagai "Bonus")
- Prorate bulanan dibagi SEMUA hari di bulan (tidak hanya hari kerja)
- `workingDaysRemaining` = loop dari besok→targetDate, skip rest days
- Pemasukan di hari libur mengurangi sisa hutang → target hari kerja berikutnya turun otomatis

### 5.6 Hari Libur / Rest Days (F016)
- Disimpan di `settings` table: key=`rest_days`, value=comma-separated day numbers
- Day numbering: 0=Minggu, 1=Senin, ..., 6=Sabtu (JS `getDay()`)
- Default: `"0"` (Minggu libur)
- User bisa toggle di Settings (7-day toggle buttons)
- Dashboard API returns: `is_rest_day`, `rest_days[]`, `working_days_remaining`

### 5.7 Target Lunas
- Editable di Settings (default 13 April 2026)
- Progress = (total_original - total_remaining) / total_original × 100%

### 5.8 Export CSV
- CSV generated client-side (no backend endpoint)
- Reuses data from `/api/report/daily`
- BOM header for Excel compatibility
- Filename: `laporan-harian-YYYY-MM-DD.csv` atau `laporan-mingguan-YYYY-MM-DD.csv`

### 5.9 Smart Order Import (F-F08)
- Upload screenshot Shopee "Riwayat Pesanan" → OCR parse → batch save
- Per order: tanggal, waktu, platform (SPX/ShopeeFood), argo, tipe (single/combined)
- 1 screenshot = ~8-10 order, multiple screenshots supported (append + dedup)
- Creates 1 income transaction (total argo) + N rows in `orders` table
- Duplicate detection: same date + time + fare_amount = skip
- Image compression: quality-first (no resize if width ≤ 1080px), min width 500px

---

## 6. Current Status

| Fase | Status |
|------|--------|
| v1.0.0 MVP (8 features) | ✅ SHIPPED |
| v1.1.0 Daily Target + Hotfixes | ✅ SHIPPED |
| v1.2.0 Monthly Expenses + Target Date | ✅ SHIPPED |
| v1.3.0 Debt CRUD | ✅ SHIPPED |
| v1.3.1 Budget Harian CRUD + Fix | ✅ SHIPPED |
| v2.0.0 Onboarding + Refactor DRY | ✅ SHIPPED |
| v2.1.0 Export CSV | ✅ SHIPPED |
| v2.3.0 Multi-period Report + Custom Range | ✅ SHIPPED |
| v2.4.0 Smart Order Import (Phase 1) | ✅ SHIPPED |
| v2.5.0 Rest Days (Hari Libur) | ✅ SHIPPED |

---

## 7. Future Features (Backlog)

| ID | Nama | Detail |
|----|------|--------|
| F-F01 | Google Maps Integration | Pin alamat pengirim-penerima per order |
| F-F02 | Trip Tracking | Data tracking lokasi, waktu, jarak, rute |
| F-F03 | AI Learning | Analisis pola penghasilan, prediksi, saran penghematan |
| F-F04 | Grafik/Chart Visual | Chart pengeluaran per kategori, trend mingguan/bulanan |
| F-F06 | Notifikasi Proaktif | Push notification H-3 jatuh tempo via service worker |
| F-F08-P2 | Order Analytics Dashboard | Statistik order: jam tersibuk, platform, area, rata-rata argo |
| F-F08-P3 | AI Order Insights | Prediksi pendapatan, saran optimasi, pola kerja |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial template |
| 2.0 | 2026-02-13 | Complete rewrite |
| 3.0 | 2026-02-14 | Added Daily Target, future features |
| 4.0 | 2026-02-14 | F012+F013+F014 shipped |
| 4.1 | 2026-02-14 | Budget harian CRUD: daily_expenses table, separated BudgetBar from prorate |
| 5.0 | 2026-02-14 | v2.1.0: Export CSV, Onboarding, DRY refactor, updated file map + business rules |
| 6.0 | 2026-02-14 | v2.4.0: Smart Order Import (F-F08), orders table, OCR order parsing, batch save |
| 7.0 | 2026-02-14 | v2.5.0: F016 Rest Days — hari libur toggle, working days calculation, rest day UI |
