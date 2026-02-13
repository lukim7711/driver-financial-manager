# 🧭 AI-CONTEXT
# Money Manager — AI Navigation Map

> **Version:** 2.0  
> **Last Updated:** 2026-02-13  

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
   ├── /api/transactions    → CRUD transaksi
   ├── /api/debts           → Status hutang + bayar
   ├── /api/report          → Laporan harian/mingguan
   ├── /api/ocr             → Proxy ke ocr.space
   ├── /api/settings        → Budget preferences
   └── /api/dashboard       → Aggregate home data
   │
   ▼
Durable Objects (SQLite)
   ├── debts            (pre-loaded 5 hutang)
   ├── debt_schedule    (pre-loaded jadwal cicilan)
   ├── transactions     (runtime: user input)
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
| `docs/PROGRESS.md` | Session log, current phase, decisions | Status terkini proyek |
| `docs/features/*.md` | Per-feature detailed spec | Saat implement fitur spesifik |
| `docs/adr/*.md` | Architecture Decision Records | Sejarah keputusan teknis |

### 4.2 Frontend (`frontend/`)

| File/Dir | Purpose |
|----------|---------|
| `frontend/src/App.tsx` | Root component + routing setup |
| `frontend/src/main.tsx` | React entry point |
| `frontend/src/pages/Home.tsx` | Dashboard utama: summary + alert |
| `frontend/src/pages/QuickInput.tsx` | Tap-based input: type → category → amount → save |
| `frontend/src/pages/Debts.tsx` | Status hutang + progress + tandai lunas |
| `frontend/src/pages/Report.tsx` | Laporan harian/mingguan + riwayat |
| `frontend/src/pages/Settings.tsx` | Adjust budget + preferences |
| `frontend/src/components/` | Reusable: PresetButton, CategoryPicker, ProgressBar, etc. |
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
| `api/src/routes/debt.ts` | GET debts, POST pay |
| `api/src/routes/report.ts` | GET daily/weekly report |
| `api/src/routes/ocr.ts` | POST image → ocr.space → parsed result |
| `api/src/routes/settings.ts` | GET/PUT settings |
| `api/src/db/durable-object.ts` | DO class: SQLite init, query methods |
| `api/src/db/schema.sql` | Table definitions |
| `api/src/db/seed.sql` | Pre-loaded hutang data (5 platform) |
| `api/src/services/transaction.ts` | Transaction business logic |
| `api/src/services/debt.ts` | Debt payment + progress calculation |
| `api/src/services/report.ts` | SQL aggregation for reports |
| `api/src/services/budget.ts` | Budget checking, remaining calc |
| `api/src/utils/format.ts` | Currency/date formatting |
| `api/src/utils/response.ts` | Standard ApiResponse helper |
| `api/wrangler.toml` | CF Worker config: DO bindings, vars, secrets |

---

## 5. Key Business Rules

### 5.1 Transaksi
- Semua `amount` dalam INTEGER Rupiah (no floating point)
- Tipe: `income`, `expense`, `debt_payment`
- `debt_payment` otomatis mengurangi `debts.total_remaining` dan update `debt_schedule.status`
- Soft delete: set `is_deleted = 1`, never hard delete

### 5.2 Hutang
- 5 hutang pre-loaded dari studi kasus (per 12 Feb 2026)
- Setiap hutang punya jadwal cicilan detail per bulan
- "Tandai Lunas" = catat expense + update schedule status + update remaining
- Denda dihitung berdasarkan tipe: `pct_monthly` (4-5%/bulan) atau `pct_daily` (0.25%/hari)

### 5.3 Budget
- Default dari studi kasus (BBM 40k, Makan 25k, dll)
- User bisa adjust via Settings
- Dashboard menampilkan sisa budget harian = budget - pengeluaran hari ini

### 5.4 Target Lunas
- Total hutang: Rp 8.851.200
- Target: 13 April 2026 (2 bulan)
- Butuh ~Rp 147.520/hari
- Progress = (total_original - total_remaining) / total_original × 100%

---

## 6. Current Status

| Fase | Status |
|------|--------|
| Fase 0: Setup Repository | ✅ Done |
| Fase 1: PRD | ✅ Done |
| Fase 2: Constitution (Tech Stack) | ✅ Done |
| Fase 3: AI-Context | ✅ Done |
| Fase 4: Feature Specs | ⬜ TODO |
| Fase 5: Space Instruction | ⬜ TODO |
| Fase 6: Build Loop | ⬜ TODO |

---

## 7. Development Workflow

### Build Order (Recommended)

1. **Setup project** — Vite React + Hono Workers + wrangler.toml + DO schema + seed
2. **API: Transaction CRUD** — POST/GET/PUT/DELETE /api/transactions
3. **API: Debts + Report** — GET /api/debts, GET /api/report/daily
4. **Frontend: Home + QuickInput** — Dashboard + tap-based input
5. **Frontend: Debts + Report** — Status hutang + laporan
6. **OCR Integration** — POST /api/ocr → ocr.space
7. **Settings + PWA** — Budget adjust + manifest.json + service worker
8. **Deploy + Test** — Cloudflare Pages + Workers live

### Per-Feature Branch Pattern

```
main ← feat/F001-quick-input ← feat/F002-ocr-upload ← ...
```

Setiap fitur: 1 branch → 1 PR → squash merge ke main.

---

## 8. Naming Conventions

| Type | Convention | Example |
|------|-----------|----------|
| React components | PascalCase | `QuickInput.tsx`, `PresetButton.tsx` |
| Hooks | camelCase with `use` prefix | `useApi.ts`, `useTransactions.ts` |
| API routes | kebab-case | `/api/transactions`, `/api/debts` |
| DB tables | snake_case | `debt_schedule`, `transactions` |
| DB columns | snake_case | `created_at`, `total_remaining` |
| TypeScript interfaces | PascalCase | `Transaction`, `Debt`, `ApiResponse` |
| CSS classes | Tailwind utilities | `bg-green-500 text-white p-4` |
| Files | kebab-case (backend), PascalCase (React) | `transaction.ts`, `Home.tsx` |
| Git branches | `type/description` | `feat/F001-quick-input` |
| Commits | `type: description` | `feat: add transaction CRUD API` |

---

## 9. External Services

| Service | URL | Key Location | Free Tier |
|---------|-----|-------------|------------|
| ocr.space | `https://api.ocr.space/parse/image` | CF Worker Secret: `OCR_SPACE_API_KEY` | 500 req/hari |
| Workers AI | Via `env.AI.run()` binding | Built-in (wrangler.toml) | 10k neurons/hari |
| Telegram Bot API | `https://api.telegram.org` | Not used in MVP | N/A |
| Google Maps API | `https://maps.googleapis.com` | Not used in MVP (future) | N/A |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial template |
| 2.0 | 2026-02-13 | Complete rewrite — dashboard PWA architecture |