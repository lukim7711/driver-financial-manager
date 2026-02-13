# 🚀 Panduan Deploy — Driver Financial Manager

> Deploy otomatis via GitHub Actions CD setiap push ke `main`.

---

## Prasyarat

1. Akun Cloudflare (gratis)
2. Repository ini di GitHub
3. `wrangler` CLI (opsional, untuk setup awal)

---

## Langkah 1: Setup Cloudflare Account

### 1.1 Buat API Token

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Klik **Create Token**
3. Pilih template **Edit Cloudflare Workers**
4. Tambahkan permission:
   - `Account > Cloudflare Pages > Edit`
   - `Account > Workers Scripts > Edit`
   - `Account > Workers KV Storage > Edit`
   - `Account > Workers R2 Storage > Edit` (opsional)
5. Klik **Continue to Summary** → **Create Token**
6. **Salin token** (hanya ditampilkan sekali!)

### 1.2 Catat Account ID

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Klik domain apapun atau Workers & Pages
3. Account ID ada di sidebar kanan bawah
4. **Salin Account ID**

---

## Langkah 2: Setup GitHub Secrets

Buka repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Nilai | Keterangan |
|-------------|-------|------------|
| `CLOUDFLARE_API_TOKEN` | (dari langkah 1.1) | API token untuk deploy |
| `CLOUDFLARE_ACCOUNT_ID` | (dari langkah 1.2) | Account ID Cloudflare |
| `VITE_API_URL` | `https://driver-financial-manager-api.{username}.workers.dev` | URL API Workers |

---

## Langkah 3: Setup Cloudflare Workers (Backend)

### 3.1 Deploy Pertama Kali (Manual)

```bash
cd api
npm install
npx wrangler login
npx wrangler deploy
```

Ini akan membuat Worker + Durable Object binding otomatis sesuai `wrangler.toml`.

### 3.2 Set Worker Secrets

```bash
# OCR API key (daftar gratis di https://ocr.space/ocrapi)
npx wrangler secret put OCR_SPACE_API_KEY
# Masukkan API key saat diminta

# Set environment
npx wrangler secret put ENVIRONMENT
# Masukkan: production
```

### 3.3 Verifikasi

```bash
curl https://driver-financial-manager-api.{username}.workers.dev/
# Harus return: { success: true, data: { service: "Driver Financial Manager API", version: "1.0.0" } }
```

---

## Langkah 4: Setup Cloudflare Pages (Frontend)

### 4.1 Buat Project Pages

```bash
cd frontend
npm install
npm run build
npx wrangler pages project create driver-financial-manager
npx wrangler pages deploy dist --project-name=driver-financial-manager
```

### 4.2 Verifikasi

Buka URL yang ditampilkan (contoh: `https://driver-financial-manager.pages.dev`)

---

## Langkah 5: Verifikasi CD

Setelah semua secret di-set:

1. Push commit ke `main`
2. Buka tab **Actions** di GitHub
3. Lihat workflow **CD — Deploy to Cloudflare** berjalan
4. Kedua job (API + Frontend) harus ✅ hijau

---

## Langkah 6: Test End-to-End

Buka app di browser HP:

1. ✅ **Home** — Dashboard muncul, saldo Rp 0
2. ✅ **Catat** — Quick input 3 tap: type → category → amount → saved
3. ✅ **OCR** — Foto struk → processing → suggestion → save
4. ✅ **Hutang** — List cicilan muncul, bisa bayar
5. ✅ **Laporan** — Breakdown harian per kategori
6. ✅ **Setting** — Edit budget → save → reflected in report
7. ✅ **PWA** — "Add to Home Screen" prompt muncul
8. ✅ **Offline** — App loads dari cache (static pages)

---

## Troubleshooting

### API returns 500
- Cek Worker logs: `npx wrangler tail`
- Pastikan DO binding `DB` ada di `wrangler.toml`
- Pastikan `OCR_SPACE_API_KEY` sudah di-set

### Frontend blank / 404
- Pastikan `VITE_API_URL` di-set sebelum build
- Pastikan `_redirects` ada di `dist/` (SPA fallback)
- Cek browser console untuk CORS errors

### CORS Error
- Pastikan Workers CORS origin match Pages URL
- Origin harus `.pages.dev` atau `localhost:3000`

### OCR Tidak Jalan
- Daftar API key di https://ocr.space/ocrapi (gratis 500 calls/day)
- Set via `wrangler secret put OCR_SPACE_API_KEY`

### Durable Object Error
- Pastikan `wrangler.toml` punya `[[durable_objects.bindings]]`
- Deploy ulang: `npx wrangler deploy` (DO auto-migrate)

---

## Arsitektur Production

```
User (HP)
  │
  ├─→ Cloudflare Pages (frontend)
  │    └─→ Static files + SW cache
  │
  └─→ Cloudflare Workers (API)
       ├─→ Hono routes
       ├─→ Durable Object (SQLite)
       └─→ ocr.space API (external)
```

---

## Biaya

| Service | Free Tier | Estimasi Pemakaian |
|---------|-----------|--------------------|
| Workers | 100K req/hari | < 1K req/hari |
| Durable Objects | 1M req/bulan | < 10K req/bulan |
| Pages | Unlimited sites | 1 site |
| ocr.space | 500 calls/hari | < 10 calls/hari |

**Total: Rp 0 / bulan** (dalam free tier)

---

**Document Control:**
- Created: 2026-02-13
- Last Updated: 2026-02-13
