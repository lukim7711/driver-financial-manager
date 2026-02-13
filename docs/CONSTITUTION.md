# ⚖️ CONSTITUTION
# Money Manager — Technical Rules & Stack

> **Version:** 2.2  
> **Status:** Active  
> **Last Updated:** 2026-02-14  

---

## 1. Tech Stack

### 1.1 Stack Overview

| Layer | Technology | Justifikasi |
|-------|-----------|-------------|
| **Frontend** | React 19 + Vite | Ekosistem terbesar, scalable untuk future features (Maps, Charts, AI dashboard) |
| **Styling** | Tailwind CSS | Utility-first, mobile-responsive cepat, minimal CSS custom |
| **Backend API** | Hono | Ultra-ringan, native Cloudflare Workers, TypeScript-first |
| **Runtime** | Cloudflare Workers | Edge computing, free tier 100k req/hari, global |
| **Database** | Durable Objects (SQLite) | Persistent, ACID, co-located with Worker, free tier 5GB |
| **OCR** | ocr.space API | Free 500 req/hari, akurat untuk struk Indonesia |
| **AI (Future)** | Workers AI — gpt-oss-20b | 20B MoE, reasoning capable, 10k neurons free/hari |
| **Hosting** | Cloudflare Pages | Static hosting, auto-deploy dari GitHub, free |
| **Language** | TypeScript | End-to-end type safety, frontend + backend |
| **PWA** | manifest.json + Service Worker | Install ke home screen, offline cache, app-like UX |

### 1.2 Justifikasi Keputusan Kunci

#### Kenapa React (bukan Vanilla JS / Svelte / Hono JSX)?
- Future features membutuhkan Google Maps SDK → `@vis.gl/react-google-maps`
- Future features membutuhkan charts → Recharts / Nivo
- Ekosistem library terbesar → fitur apapun yang ditambah, ada library-nya
- AI code generation paling akurat untuk React (training data terbanyak)
- Component system scalable untuk app yang akan berkembang

#### Kenapa Hono (bukan Express / Fastify)?
- Native Cloudflare Workers support
- Ultra-ringan (14KB), cocok untuk Workers CPU 10ms limit
- TypeScript-first, middleware ecosystem lengkap
- Satu bahasa (TS) untuk frontend + backend

#### Kenapa Durable Objects (bukan D1 / KV)?
- SQLite built-in → relational queries untuk laporan
- ACID transactions → data keuangan harus konsisten
- Co-located storage → latency minimal
- Free tier cukup untuk 1 user (5GB storage)

#### Kenapa ocr.space (bukan Workers AI Vision)?
- Hemat neuron budget Workers AI untuk future AI features
- Free 500/hari, cukup untuk personal use
- Proven accuracy untuk struk Indonesia
- Simple REST API, cepat diintegrasikan

#### Kenapa gpt-oss-20b (bukan Llama / Mistral)?
- OpenAI quality, open-weight, free di Workers AI
- Reasoning capability (adjustable effort: low/medium/high)
- 128K context window
- Akan dipakai untuk future AI learning features
- Saat ini belum dipakai di MVP (hemat neuron)

#### Kenapa CSV Export client-side (bukan API endpoint)?
- Data sudah tersedia dari `/api/report/daily` — tidak perlu endpoint baru
- Mengurangi beban Workers CPU (10ms limit)
- BOM header + Blob API cukup untuk generate CSV di browser
- Tidak ada data sensitif yang perlu server-side processing

---

## 2. Project Structure

```
driver-financial-manager/
├── frontend/                      # React app → Cloudflare Pages
│   ├── src/
│   │   ├── App.tsx                # Root component + routing
│   │   ├── main.tsx               # React entry point
│   │   ├── pages/                 # Page-level components (1 per layar)
│   │   │   ├── Home.tsx           # Dashboard utama
│   │   │   ├── QuickInput.tsx     # Input transaksi (tap-based)
│   │   │   ├── OcrUpload.tsx      # Upload struk OCR
│   │   │   ├── Debts.tsx          # Status hutang
│   │   │   ├── Report.tsx         # Laporan harian/mingguan + export CSV
│   │   │   └── Settings.tsx       # Budget & preferences
│   │   ├── components/            # Reusable UI components
│   │   │   ├── PresetButton.tsx   # Tombol preset nominal
│   │   │   ├── CategoryPicker.tsx # Grid pilih kategori
│   │   │   ├── ProgressBar.tsx    # Progress bar hutang
│   │   │   ├── TransactionList.tsx # List transaksi + tap to edit
│   │   │   ├── DebtCard.tsx       # Card per hutang
│   │   │   ├── OcrUpload.tsx      # Upload + preview struk
│   │   │   ├── Modal.tsx          # Edit/delete modal
│   │   │   ├── ExportCsvButton.tsx # Export CSV (daily & weekly)
│   │   │   └── OnboardingOverlay.tsx # Walkthrough modal
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useApi.ts          # Fetch wrapper ke Workers API
│   │   │   ├── useTransactions.ts # Transaction state management
│   │   │   ├── useDebts.ts        # Debt state management
│   │   │   └── use-onboarding.ts  # Onboarding localStorage hook
│   │   ├── lib/                   # Utility libraries
│   │   │   ├── api.ts             # API client (base URL, headers)
│   │   │   ├── format.ts          # Format Rupiah, tanggal
│   │   │   └── csv-export.ts      # CSV generation + download
│   │   └── types/                 # TypeScript type definitions
│   │       └── index.ts           # Shared types (Transaction, Debt, etc.)
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service worker (cache)
│   │   └── icons/                 # PWA icons (192x192, 512x512)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── api/                           # Cloudflare Workers (Hono)
│   ├── src/
│   │   ├── index.ts               # Worker entry point + Hono app
│   │   ├── routes/                # API route handlers
│   │   │   ├── transaction.ts     # CRUD /api/transactions
│   │   │   ├── debt.ts            # CRUD /api/debts + /api/debts/:id/pay
│   │   │   ├── daily-expense.ts   # CRUD /api/daily-expenses
│   │   │   ├── monthly-expense.ts # CRUD /api/monthly-expenses
│   │   │   ├── report.ts          # GET /api/report/daily, /weekly
│   │   │   ├── ocr.ts             # POST /api/ocr
│   │   │   ├── settings.ts        # GET/PUT /api/settings
│   │   │   └── dashboard.ts       # GET /api/dashboard
│   │   ├── db/                    # Database layer
│   │   │   ├── durable-object.ts  # DO class with SQLite schema init
│   │   │   ├── schema.ts          # CREATE TABLE statements
│   │   │   └── seed.ts            # INSERT pre-loaded hutang data
│   │   └── utils/                 # Shared utilities
│   │       ├── db.ts              # getDB, queryDB, Bindings type
│   │       ├── date.ts            # getNowISO
│   │       └── id.ts              # generateId
│   ├── wrangler.toml              # CF Worker config
│   └── package.json
│
├── shared/                        # Shared types (single source of truth)
│   └── types.ts                   # Transaction, Debt, Settings interfaces
│
├── docs/                          # Documentation (Spec-Driven)
│   ├── PRD.md                     # Product Requirements Document
│   ├── AI-CONTEXT.md              # AI Navigation Map (this file)
│   ├── CONSTITUTION.md            # Technical Rules & Stack
│   ├── PROGRESS.md                # Progress & session tracking
│   ├── features/                  # Per-feature specs
│   └── adr/                       # Architecture Decision Records
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # Auto-deploy to Cloudflare
│
├── package.json                   # Root workspace config
├── README.md
└── .gitignore
```

---

## 3. API Contract

### 3.1 Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/transactions?date=YYYY-MM-DD` | List transaksi per tanggal |
| POST | `/api/transactions` | Buat transaksi baru |
| PUT | `/api/transactions/:id` | Update transaksi |
| DELETE | `/api/transactions/:id` | Soft delete transaksi |
| GET | `/api/debts` | List semua hutang + schedule |
| POST | `/api/debts` | Buat hutang baru |
| PUT | `/api/debts/:id` | Update data hutang (platform, amounts, due_day, dll) |
| DELETE | `/api/debts/:id` | Hapus hutang (dan semua schedule-nya) |
| POST | `/api/debts/:id/pay` | Tandai cicilan bulan ini lunas |
| PUT | `/api/debts/:id/schedule/:schedule_id` | Update schedule cicilan (amount, due_date, status) |
| GET | `/api/report/daily?date=YYYY-MM-DD` | Laporan harian |
| GET | `/api/report/weekly?date=YYYY-MM-DD` | Laporan mingguan |
| POST | `/api/ocr` | Upload image → OCR → return parsed text |
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/dashboard` | Home dashboard aggregate data |
| GET | `/api/daily-expenses` | List budget harian |
| POST | `/api/daily-expenses` | Tambah budget harian |
| PUT | `/api/daily-expenses/:id` | Update budget harian |
| DELETE | `/api/daily-expenses/:id` | Hapus budget harian |
| GET | `/api/monthly-expenses` | List biaya bulanan |
| POST | `/api/monthly-expenses` | Tambah biaya bulanan |
| PUT | `/api/monthly-expenses/:id` | Update biaya bulanan |
| DELETE | `/api/monthly-expenses/:id` | Hapus biaya bulanan |

### 3.2 Request/Response Format

- Content-Type: `application/json`
- Image upload: `multipart/form-data`
- Currency: Integer (Rupiah, no decimals)
- Dates: ISO 8601 (`2026-02-13`)
- Timestamps: ISO 8601 with timezone (`2026-02-13T09:30:00+07:00`)

### 3.3 Standard Response

```typescript
interface ApiSuccessResponse<T> {
  success: true
  data: T
}

interface ApiErrorResponse {
  success: false
  error: string
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
```

**Important:** `ApiResponse<T>` is a discriminated union. Always narrow with `if (!res.success)` before accessing `.error`, and only access `.data` after confirming `res.success === true`.

### 3.4 Client-Side Features (No API Endpoint)

| Feature | Description |
|---------|-------------|
| Export CSV | CSV generated in browser from existing report data. Uses `csv-export.ts` utility. |

---

## 4. Code Rules

### 4.1 General

- **Language:** TypeScript strict mode (`strict: true`)
- **Formatting:** Prettier (default config)
- **Linting:** ESLint with recommended rules
- **No `any` type** — semua harus typed
- **No `console.log` in production** — gunakan structured logging jika perlu

### 4.2 Frontend Rules

- **Component pattern:** Functional components + hooks only (no class components)
- **State management:** React useState + useContext (no Redux — app kecil)
- **Routing:** React Router v7 atau TanStack Router
- **API calls:** Custom `useApi` hook dengan loading/error states
- **Styling:** Tailwind CSS utility classes, no inline styles, no CSS modules
- **Mobile-first:** Semua styling dimulai dari mobile viewport
- **Accessibility:** Semantic HTML, aria-labels pada interactive elements
- **Discriminated unions:** Always narrow `ApiResponse<T>` properly before accessing `.error` or `.data`

### 4.3 Backend Rules

- **Framework:** Hono (latest stable)
- **Route pattern:** 1 file per resource di `routes/`
- **Business logic:** Di `services/`, bukan di route handler
- **DB access:** Hanya melalui DO class methods
- **Error handling:** Try-catch di setiap route, return standard ApiResponse
- **Validation:** Validate semua input di route level sebelum service call
- **No hardcoded values:** Gunakan `settings` table atau constants file
- **Shared utils:** Import from `utils/db.ts`, `utils/date.ts`, `utils/id.ts`

### 4.4 Database Rules

- **Semua amount dalam INTEGER** (Rupiah, no floating point)
- **Soft delete** — set `is_deleted = 1`, jangan DELETE row
- **Timestamps dalam ISO 8601** string format
- **Foreign keys enforced** via SQL constraints
- **Seed data** — hutang pre-loaded via `seed.ts` saat DO pertama kali init

---

## 5. Git Workflow

### 5.1 Branch Strategy

- **`main`** — production-ready, auto-deploy ke Cloudflare
- **`feat/{feature-id}`** — per fitur (contoh: `feat/F001-quick-input`)
- **`fix/{description}`** — bug fixes
- **`docs/{description}`** — documentation updates

### 5.2 Commit Convention

```
type(scope): short description

Types:
- feat: Fitur baru
- fix: Bug fix
- docs: Documentation
- style: Formatting (no logic change)
- refactor: Code restructure (no feature change)
- chore: Build, config, dependencies
```

### 5.3 PR Rules

- Setiap fitur = 1 branch = 1 PR
- PR description harus reference feature ID (F001, F002, dll)
- Squash merge ke main

---

## 6. Deployment

### 6.1 Infrastructure

| Component | Platform | Config |
|-----------|----------|--------|
| Frontend | Cloudflare Pages | Auto-deploy dari `main` branch, build: `cd frontend && npm run build` |
| Backend API | Cloudflare Workers | Deploy via `wrangler deploy` dari `api/` |
| Database | Durable Objects | Binding di `wrangler.toml` |
| Secrets | CF Worker Secrets | `OCR_SPACE_API_KEY`, future: `TELEGRAM_BOT_TOKEN` |

### 6.2 Environment Variables / Secrets

| Name | Where | Purpose |
|------|-------|---------|
| `OCR_SPACE_API_KEY` | Worker Secret | API key untuk ocr.space |
| `ENVIRONMENT` | Worker Var | 'production' atau 'development' |

### 6.3 CORS

- Frontend domain (Cloudflare Pages URL) di-whitelist di Worker
- No wildcard `*` in production

---

## 7. Security

- **No authentication** — personal app, 1 user
- **CORS restricted** — hanya frontend domain yang bisa akses API
- **Input validation** — semua API input di-validate (type, range, length)
- **SQL injection prevention** — parameterized queries only (DO SQLite)
- **No sensitive data in frontend** — API keys hanya di Worker secrets
- **HTTPS only** — enforced by Cloudflare

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial template (empty) |
| 2.0 | 2026-02-13 | Complete tech stack, code rules, API contract, deployment config |
| 2.1 | 2026-02-13 | Add 4 debt CRUD endpoints: POST/PUT/DELETE /api/debts, PUT /api/debts/:id/schedule/:schedule_id |
| 2.2 | 2026-02-14 | v2.1.0: Add CSV export docs, complete endpoint list (22), shared utils, discriminated union note, ApiResponse type spec |
