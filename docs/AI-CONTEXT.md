# 🧭 AI-CONTEXT
# Money Manager — AI Navigation Map

> **Version:** 4.0  
> **Last Updated:** 2026-02-14  

---

## 1. Project Summary

**Money Manager** adalah personal financial dashboard (Web PWA) untuk seorang driver ojol yang ingin melunasi hutang Rp 8.851.200 dalam 2 bulan. App mengutamakan kecepatan input (4 tap, 0 ketik, < 3 detik per transaksi) dan real-time tracking hutang.

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
   ├── /api/report            → Laporan harian/mingguan
   ├── /api/ocr               → Proxy ke ocr.space
   ├── /api/settings          → Budget preferences + target date
   ├── /api/monthly-expenses  → CRUD biaya bulanan
   └── /api/dashboard         → Aggregate home data + daily target
   │
   ▼
Durable Objects (SQLite)
   ├── debts            (pre-loaded + user-created)
   ├── debt_schedule    (pre-loaded + auto-generated)
   ├── transactions     (runtime: user input)
   ├── monthly_expenses (runtime: CRUD biaya bulanan)
   └── settings         (runtime: budget adjustable)
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
| `frontend/src/pages/Home.tsx` | Dashboard: summary + daily target + budget + alerts |
| `frontend/src/pages/QuickInput.tsx` | Tap-based input: type → category → amount → save. Also has OCR shortcut button. |
| `frontend/src/pages/OcrUpload.tsx` | Upload struk foto → OCR → auto-parse |
| `frontend/src/pages/Debts.tsx` | CRUD hutang + progress + bayar cicilan + FAB tambah |
| `frontend/src/pages/Report.tsx` | Laporan harian/mingguan + riwayat |
| `frontend/src/pages/Settings.tsx` | Adjust budget harian + bulanan + target date |
| `frontend/src/components/DailyTarget.tsx` | Target harian minimal: progress bar + gap + breakdown |
| `frontend/src/components/SummaryCard.tsx` | Ringkasan pemasukan/pengeluaran/profit hari ini |
| `frontend/src/components/BudgetBar.tsx` | Sisa budget harian (max pengeluaran) |
| `frontend/src/components/CategoryGrid.tsx` | Grid kategori income/expense |
| `frontend/src/components/AmountInput.tsx` | Input nominal dengan preset buttons |
| `frontend/src/components/BottomNav.tsx` | Navigation bar: Home, Catat, Hutang, Laporan, Setting |
| `frontend/src/components/DueAlert.tsx` | Alert jatuh tempo hutang |
| `frontend/src/components/DebtProgress.tsx` | Progress bar total hutang |
| `frontend/src/components/DebtCard.tsx` | Card hutang: detail + bayar + edit + hapus |
| `frontend/src/components/AddDebtForm.tsx` | Bottom sheet form tambah hutang baru |
| `frontend/src/components/EditDebtDialog.tsx` | Bottom sheet form edit hutang |
| `frontend/src/components/DeleteDebtDialog.tsx` | Dialog konfirmasi hapus hutang |
| `frontend/src/hooks/` | useApi, useTransactions, useDebts |
| `frontend/src/lib/api.ts` | API client base |
| `frontend/src/lib/format.ts` | Format Rupiah (Rp 50.000), tanggal |
| `frontend/src/types/index.ts` | Shared TypeScript interfaces |
| `frontend/public/manifest.json` | PWA config |
| `frontend/public/sw.js` | Service worker for caching |

### 4.3 Backend API (`api/`)

| File/Dir | Purpose |
|----------|---------|
| `api/src/index.ts` | Worker entry + Hono app init + DO export |
| `api/src/routes/transaction.ts` | CRUD /api/transactions |
| `api/src/routes/debt.ts` | CRUD /api/debts + POST pay |
| `api/src/routes/report.ts` | GET daily/weekly report |
| `api/src/routes/ocr.ts` | POST image → ocr.space → parsed result |
| `api/src/routes/settings.ts` | GET/PUT settings |
| `api/src/routes/dashboard.ts` | GET dashboard aggregate + daily target calculation |
| `api/src/routes/monthly-expense.ts` | CRUD /api/monthly-expenses |
| `api/src/db/durable-object.ts` | DO class: SQLite init, query methods, migrations |
| `api/src/db/schema.ts` | Table definitions (SQL string) |
| `api/src/db/seed.ts` | Pre-loaded hutang data (5 platform) |
| `api/wrangler.toml` | CF Worker config: DO bindings, vars, secrets |

---

## 5. Key Business Rules

### 5.1 Transaksi
- Semua `amount` dalam INTEGER Rupiah (no floating point)
- Tipe: `income`, `expense`, `debt_payment`
- Income categories: `order`, `tips`, `bonus`, `insentif`, `lainnya_masuk`
- Expense categories: `bbm`, `makan`, `rokok`, `pulsa`, `parkir`, `service`, `lainnya`
- `debt_payment` otomatis mengurangi `debts.total_remaining` dan update `debt_schedule.status`
- Soft delete: set `is_deleted = 1`, never hard delete

### 5.2 Hutang
- 5 hutang pre-loaded dari studi kasus (per 12 Feb 2026)
- User bisa tambah hutang baru via FAB (+) di halaman Hutang
- User bisa edit detail hutang (platform, total, cicilan, due_day, denda)
- User bisa hapus hutang (soft delete: `is_deleted = 1`)
- Saat tambah hutang, jadwal cicilan otomatis di-generate dari `due_day` + `total_installments`
- Saat edit `total_original`, `total_remaining` di-recalculate (preserve paid amount)
- "Tandai Lunas" = catat expense + update schedule status + update remaining
- Denda dihitung berdasarkan tipe: `pct_monthly` (4-5%/bulan) atau `pct_daily` (0.25%/hari)

### 5.3 Budget
- Budget harian: BBM, Makan, Rokok, Pulsa (adjustable via Settings)
- Budget bulanan: CRUD via Settings — nama, emoji, nominal (F013)
- BudgetBar = budget harian + (bulanan ÷ hari di bulan ini) - pengeluaran hari ini

### 5.4 Target Harian Minimal (DT001)
- **Formula:** `Target = Pengeluaran Harian + (Bulanan ÷ Hari di Bulan) + (Sisa Hutang ÷ Sisa Hari ke Target)`
- Semakin pendek target lunas → target harian semakin besar
- Semakin panjang target lunas → target harian semakin kecil
- Dashboard menampilkan: target amount, earned today, gap (surplus/kurang), breakdown
- Warna: hijau (on track) / orange-merah (kurang)
- RT prorate menggunakan jumlah hari di bulan berjalan (bukan konstan 30)
- Baris RT di breakdown disembunyikan jika nilainya 0

### 5.5 Target Lunas
- Total hutang awal: Rp 8.851.200
- Target: editable di Settings (default 13 April 2026)
- Progress = (total_original - total_remaining) / total_original × 100%

---

## 6. Current Status

| Fase | Status |
|------|--------|
| v1.0.0 MVP (8 features) | ✅ SHIPPED |
| v1.1.0 Daily Target + Hotfixes | ✅ SHIPPED |
| v1.2.0 Monthly Expenses + Target Date | ✅ SHIPPED |
| v1.3.0 Debt CRUD | ✅ SHIPPED |

See `docs/PROGRESS.md` for detailed session logs and known issues.

---

## 7. Future Features (Planned)

| ID | Nama | Detail |
|----|------|--------|
| F009 | Ringkasan Mingguan | Weekly summary report |
| F011 | Help/Onboarding | First-time user guide |

---

## 8. Development Workflow

### Per-Feature Branch Pattern

```
main ← feat/F009-ringkasan-mingguan ← ...
```

Setiap fitur: 1 branch → CI pass → 1 PR → squash merge ke main.

---

## 9. Naming Conventions

| Type | Convention | Example |
|------|-----------|----------|
| React components | PascalCase | `QuickInput.tsx`, `DailyTarget.tsx` |
| Hooks | camelCase with `use` prefix | `useApi.ts`, `useTransactions.ts` |
| API routes | kebab-case | `/api/transactions`, `/api/debts` |
| DB tables | snake_case | `debt_schedule`, `transactions` |
| DB columns | snake_case | `created_at`, `total_remaining` |
| TypeScript interfaces | PascalCase | `Transaction`, `Debt`, `ApiResponse` |
| CSS classes | Tailwind utilities | `bg-green-500 text-white p-4` |
| Files | kebab-case (backend), PascalCase (React) | `transaction.ts`, `Home.tsx` |
| Git branches | `type/description` | `feat/F001-quick-input` |
| Commits | `type(scope): description` | `feat(api): add transaction CRUD API` |

---

## 10. External Services

| Service | URL | Key Location | Free Tier |
|---------|-----|-------------|------------|
| ocr.space | `https://api.ocr.space/parse/image` | CF Worker Secret: `OCR_SPACE_API_KEY` | 500 req/hari |
| Workers AI | Via `env.AI.run()` binding | Built-in (wrangler.toml) | 10k neurons/hari |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial template |
| 2.0 | 2026-02-13 | Complete rewrite — dashboard PWA architecture |
| 3.0 | 2026-02-14 | Added Daily Target (5.4), future features (F012-F014), updated file map, known issues |
| 4.0 | 2026-02-14 | F012+F013+F014 shipped: updated architecture (monthly-expenses route), file map (3 new debt components), business rules (5.2 hutang CRUD), status v1.3.0, removed completed items from future features |
