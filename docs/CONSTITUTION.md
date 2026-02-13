# ⚖️ CONSTITUTION
# Money Manager — Technical Rules & Stack

> **Version:** 2.0  
> **Status:** Active  
> **Last Updated:** 2026-02-13  

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
│   │   │   ├── Debts.tsx          # Status hutang
│   │   │   ├── Report.tsx         # Laporan harian/mingguan
│   │   │   └── Settings.tsx       # Budget & preferences
│   │   ├── components/            # Reusable UI components
│   │   │   ├── PresetButton.tsx   # Tombol preset nominal
│   │   │   ├── CategoryPicker.tsx # Grid pilih kategori
│   │   │   ├── ProgressBar.tsx    # Progress bar hutang
│   │   │   ├── TransactionList.tsx # List transaksi + tap to edit
│   │   │   ├── DebtCard.tsx       # Card per hutang
│   │   │   ├── OcrUpload.tsx      # Upload + preview struk
│   │   │   └── Modal.tsx          # Edit/delete modal
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useApi.ts          # Fetch wrapper ke Workers API
│   │   │   ├── useTransactions.ts # Transaction state management
│   │   │   └── useDebts.ts        # Debt state management
│   │   ├── lib/                   # Utility libraries
│   │   │   ├── api.ts             # API client (base URL, headers)
│   │   │   └── format.ts          # Format Rupiah, tanggal
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
│   │   │   ├── debt.ts            # GET /api/debts, POST /api/debts/:id/pay
│   │   │   ├── report.ts          # GET /api/report/daily, /weekly
│   │   │   ├── ocr.ts             # POST /api/ocr (proxy to ocr.space)
│   │   │   └── settings.ts        # GET/PUT /api/settings
│   │   ├── db/                    # Database layer
│   │   │   ├── durable-object.ts  # DO class with SQLite schema init
│   │   │   ├── schema.sql         # CREATE TABLE statements
│   │   │   └── seed.sql           # INSERT pre-loaded hutang data
│   │   ├── services/              # Business logic
│   │   │   ├── transaction.ts     # Transaction CRUD logic
│   │   │   ├── debt.ts            # Debt payment + progress calculation
│   │   │   ├── report.ts          # Aggregation queries for reports
│   │   │   └── budget.ts          # Budget checking logic
│   │   └── utils/                 # Shared utilities
│   │       ├── format.ts          # Format currency, date
│   │       └── response.ts        # Standard API response helpers
│   ├── wrangler.toml              # CF Worker config
│   └── package.json
│
├── docs/                          # Documentation (Spec-Driven)
│   ├── PRD.md                     # Product Requirements Document
│   ├── AI-CONTEXT.md              # AI Navigation Map
│   ├── CONSTITUTION.md            # This file — Technical Rules
│   ├── PROGRESS.md                # Progress & session tracking
│   ├── features/                  # Per-feature specs (Fase 4)
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
| POST | `/api/debts/:id/pay` | Tandai cicilan bulan ini lunas |
| GET | `/api/report/daily?date=YYYY-MM-DD` | Laporan harian |
| GET | `/api/report/weekly?date=YYYY-MM-DD` | Laporan mingguan |
| POST | `/api/ocr` | Upload image → OCR → return parsed text |
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/dashboard` | Home dashboard aggregate data |

### 3.2 Request/Response Format

- Content-Type: `application/json`
- Image upload: `multipart/form-data`
- Currency: Integer (Rupiah, no decimals)
- Dates: ISO 8601 (`2026-02-13`)
- Timestamps: ISO 8601 with timezone (`2026-02-13T09:30:00+07:00`)

### 3.3 Standard Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

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

### 4.3 Backend Rules

- **Framework:** Hono (latest stable)
- **Route pattern:** 1 file per resource di `routes/`
- **Business logic:** Di `services/`, bukan di route handler
- **DB access:** Hanya melalui DO class methods
- **Error handling:** Try-catch di setiap route, return standard ApiResponse
- **Validation:** Validate semua input di route level sebelum service call
- **No hardcoded values:** Gunakan `settings` table atau constants file

### 4.4 Database Rules

- **Semua amount dalam INTEGER** (Rupiah, no floating point)
- **Soft delete** — set `is_deleted = 1`, jangan DELETE row
- **Timestamps dalam ISO 8601** string format
- **Foreign keys enforced** via SQL constraints
- **Seed data** — hutang pre-loaded via `seed.sql` saat DO pertama kali init

---

## 5. Git Workflow

### 5.1 Branch Strategy

- **`main`** — production-ready, auto-deploy ke Cloudflare
- **`feat/{feature-id}`** — per fitur (contoh: `feat/F001-quick-input`)
- **`fix/{description}`** — bug fixes
- **`docs/{description}`** — documentation updates

### 5.2 Commit Convention

```
type: short description

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