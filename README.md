# 💰 Money Manager — Driver Ojol Financial Dashboard

> Personal financial dashboard PWA untuk driver ojol yang ingin melunasi hutang Rp 8.285.119 dalam 2 bulan.

[![Tech Stack](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Hono](https://img.shields.io/badge/Hono-4.7-E36002?logo=hono)](https://hono.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 Fitur Utama

- ⚡ **Quick-Tap Input** — Catat transaksi dalam 4 tap, 0 ketik, < 3 detik
- 📷 **OCR Struk** — Foto struk → auto-extract nominal & kategori
- 💳 **Tracking Hutang Real-time** — 5 platform pinjaman, jadwal cicilan detail
- 📊 **Dashboard Harian** — Pemasukan, pengeluaran, profit, sisa budget
- 🚨 **Alert Jatuh Tempo** — Notifikasi H-3 sebelum bayar cicilan
- 📱 **PWA** — Install ke home screen, kerja offline

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + Tailwind CSS 4 |
| **Backend** | Hono on Cloudflare Workers |
| **Database** | Durable Objects (SQLite) |
| **OCR** | ocr.space API |
| **Hosting** | Cloudflare Pages + Workers |
| **Language** | TypeScript (strict mode) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (recommended: use [fnm](https://github.com/Schniz/fnm))
- pnpm 9+ (recommended package manager)
- Cloudflare account (free tier)

### 1. Clone Repository

```bash
git clone https://github.com/lukim7711/driver-financial-manager.git
cd driver-financial-manager
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
pnpm install

# Backend API
cd ../api
pnpm install
```

### 3. Development

**Terminal 1 — Frontend:**
```bash
cd frontend
pnpm dev
# Opens at http://localhost:3000
```

**Terminal 2 — Backend:**
```bash
cd api
pnpm dev
# Runs at http://localhost:8787
```

Frontend will proxy `/api/*` requests to backend automatically.

### 4. Build & Deploy

**Frontend (Cloudflare Pages):**
```bash
cd frontend
pnpm build
# Deploy via Cloudflare Pages dashboard or wrangler pages
```

**Backend (Cloudflare Workers):**
```bash
cd api
pnpm deploy
# or for production:
pnpm deploy:prod
```

---

## 📂 Project Structure

```
.
├── docs/              # Documentation (PRD, specs, ADRs)
├── frontend/          # React PWA
│   ├── src/
│   │   ├── pages/     # Route pages
│   │   ├── components/ # Reusable UI
│   │   ├── hooks/     # Custom hooks
│   │   ├── lib/       # Utils & API client
│   │   └── types/     # TypeScript types
│   └── public/        # PWA manifest & assets
├── api/               # Hono backend
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── db/        # Durable Objects
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helpers
│   └── wrangler.jsonc # Worker config
└── README.md          # This file
```

---

## 📚 Documentation

- [📋 PRD (Product Requirements)](./docs/PRD.md) — Features, user flows, data model
- [⚖️ CONSTITUTION](./docs/CONSTITUTION.md) — Tech stack, code rules, API contract
- [🧭 AI-CONTEXT](./docs/AI-CONTEXT.md) — Architecture, file map, conventions
- [📊 PROGRESS](./docs/PROGRESS.md) — Build status, decisions, session log
- [📁 Features](./docs/features/) — Detailed specs per feature

---

## 🛠️ Development Guidelines

### Code Rules

- **TypeScript strict mode** — No `any` type
- **File naming:** kebab-case (backend), PascalCase (React components)
- **No console.log in production**
- **All amounts in INTEGER Rupiah** (no decimals)
- **Dates in ISO 8601 with timezone** (`2026-02-13T10:30:00+07:00`)

### Git Workflow

- Branch: `feat/{feature-id}` or `fix/{description}`
- Commit: `type: description` (e.g., `feat: add transaction CRUD API`)
- PR: Squash merge to `main`

### Features Build Order

1. ✅ Setup Project (this branch)
2. ⬜ F001 — Quick-Tap Input
3. ⬜ F002 — OCR Upload
4. ⬜ F003 — Pre-loaded Debts (seed already done)
5. ⬜ F004 — Home Dashboard
6. ⬜ F005 — Status Hutang
7. ⬜ F006 — Bayar Hutang
8. ⬜ F007 — Edit/Delete Transaction
9. ⬜ F008 — Laporan Harian

---

## 🧪 Testing

Manual testing only in MVP phase. Automated tests will be added post-launch.

**Test Checklist:**
- [ ] Input transaksi < 3 detik
- [ ] OCR struk akurasi > 80%
- [ ] Dashboard terupdate real-time
- [ ] Bayar hutang → update progress
- [ ] PWA install & offline mode

---

## 📊 Target Metrics

- **Total Hutang:** Rp 8.285.119
- **Target Lunas:** 13 April 2026 (2 bulan)
- **Butuh:** ~Rp 138.085/hari untuk cicilan
- **Transaksi/hari:** > 5 tercatat
- **Waktu input:** < 3 detik/transaksi

---

## 🔧 Environment Variables

### Backend (Cloudflare Worker Secrets)

```bash
# OCR API key (get from ocr.space)
wrangler secret put OCR_SPACE_API_KEY
```

---

## 🤝 Contributing

This is a personal project for learning and real use case. Feel free to fork and adapt for your own needs.

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Driver Ojol Jakarta** via AI-Assisted Development (Perplexity)

- GitHub: [@lukim7711](https://github.com/lukim7711)
- Built with: React 19, Hono, Cloudflare Workers, Durable Objects
- Year: 2026

---

**Status:** 🚧 In Development (Setup Phase Completed)
