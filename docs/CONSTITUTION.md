# ⚖️ CONSTITUTION (Aturan Teknis)
# Driver Financial Manager

> Versi: 1.0 | CONTEXT_VERSION: "CONST-v1.0-20260213"

---

> ⚖️ **Dokumen ini adalah hukum tertinggi proyek. AI WAJIB mematuhi setiap aturan di sini. Tidak ada pengecualian.**

---

## 1. Tech Stack (TIDAK BOLEH DIUBAH tanpa ADR baru)

> 🚧 **Status:** Belum ditentukan - Akan diisi di Fase 2

**Perlu ditentukan:**
- **Runtime:** [contoh: Cloudflare Workers / Node.js / Deno]
- **Bahasa:** [contoh: TypeScript / JavaScript]
- **Database:** [contoh: Durable Objects / PostgreSQL / SQLite]
- **Framework:** [contoh: Hono / Express / Next.js]
- **Frontend:** [contoh: React / Vue / Vanilla JS]
- **Deployment:** [contoh: Cloudflare / Vercel / Railway]
- **Authentication:** [contoh: Clerk / Auth0 / Custom]

**Tips memilih tech stack:**

Tanyakan ke Perplexity:
> *"Saya ingin membuat aplikasi web untuk driver mengelola keuangan harian dengan fitur pencatatan transaksi, kategori pengeluaran, dan laporan. Rekomendasikan tech stack yang paling sederhana untuk deployment. Saya non-programmer, jadi pilih yang paling minim konfigurasi."*

---

## 2. Aturan Kode

1. **Bahasa kode:** [TypeScript/JavaScript] (akan ditentukan)
2. **Komentar kode:** Bahasa Inggris
3. **Respons user-facing:** Bahasa Indonesia
4. **Type safety:** Gunakan proper interfaces/types. **Dilarang `any`** kecuali absolutely necessary.
5. **Error handling:** Setiap fungsi HARUS punya error handling yang proper
6. **Single Responsibility:** Satu file = satu tanggung jawab
7. **Naming convention:** 
   - Variabel/fungsi: `camelCase`, deskriptif, tidak disingkat
   - Komponen: `PascalCase`
   - File: `kebab-case.ts`
   - Konstanta: `UPPER_SNAKE_CASE`

---

## 3. Struktur Folder (WAJIB diikuti)

```
src/
├── handlers/       ← Handler per fitur (request handling)
├── services/       ← Business logic
├── models/         ← Type definitions & interfaces
├── utils/          ← Helper functions
├── config/         ← Configuration files
└── index.ts        ← Entry point
```

**Aturan:**
- Setiap fitur baru buat file di `handlers/` dan `services/`
- Model/types harus didefinisikan di `models/`
- Utility yang reusable masuk ke `utils/`

---

## 4. Pattern yang WAJIB Diikuti

> 🚧 Akan diisi saat tech stack sudah ditentukan

Contoh pattern (sesuaikan dengan tech stack):
- [Contoh: Setiap endpoint → handler di `src/handlers/`]
- [Contoh: Akses DB selalu melalui service layer, bukan langsung]
- [Contoh: Error → return user-friendly message, JANGAN throw ke user]
- [Contoh: Validation input menggunakan schema validator]

---

## 5. Pattern yang DILARANG

- ❌ **Jangan install library baru** tanpa izin eksplisit dari owner
- ❌ **Jangan ubah schema database** tanpa update dokumentasi di `docs/features/`
- ❌ **Jangan hardcode secrets/API keys** dalam kode (gunakan environment variables)
- ❌ **Jangan buat file** di luar struktur folder yang sudah ditentukan
- ❌ **Jangan skip error handling** dengan alasan "nanti aja"
- ❌ **Jangan gunakan `any` type** tanpa komentar justifikasi yang kuat

---

## 6. Git & Workflow

1. **TIDAK BOLEH push ke `main` langsung** (kecuali setup awal)
2. **Branch naming:**
   - Feature: `feat/f{ID}-{name}` (contoh: `feat/f001-pencatatan-transaksi`)
   - Bugfix: `fix/{desc}` (contoh: `fix/calculation-error`)
   - Docs: `docs/{desc}` (contoh: `docs/update-readme`)
3. **Satu fitur per branch. Satu fitur per sesi.**
4. **Commit message:** English, conventional format
   - `feat: add transaction recording feature`
   - `fix: correct calculation in daily report`
   - `docs: update PRD with new requirements`
5. **Pull Request:** Buat PR ke `main` setelah fitur selesai
6. **Review:** Owner akan review sebelum merge

---

## 7. Database Schema Rules

> 🚧 Akan diisi saat database dipilih

**Aturan umum:**
- Setiap tabel harus punya primary key
- Gunakan timestamps (`created_at`, `updated_at`) untuk semua tabel
- Foreign key harus eksplisit
- Nama tabel: `snake_case`, plural (contoh: `transactions`, `categories`)

---

## 8. Testing Rules

> 🚧 Akan diisi saat tech stack sudah ditentukan

**Target:**
- [ ] Unit tests untuk business logic kritis
- [ ] Integration tests untuk API endpoints
- [ ] Manual testing checklist per fitur

---

## 9. Security Rules

1. **Input validation:** Semua input dari user HARUS divalidasi
2. **SQL Injection:** Gunakan parameterized queries SELALU
3. **XSS Protection:** Sanitize output yang ditampilkan ke user
4. **Authentication:** [Akan ditentukan sesuai tech stack]
5. **Secrets:** Simpan di environment variables, JANGAN commit ke Git

---

## 10. Performance Rules

- Database query harus efficient (gunakan index)
- Pagination untuk list data yang banyak
- Lazy loading untuk assets berat
- Caching untuk data yang jarang berubah

---

## 💡 Cara Melengkapi Constitution

Jika belum tahu tech stack yang cocok, diskusikan dengan Perplexity di Fase 2:

> *"Saya ingin membuat aplikasi web Driver Financial Manager dengan fitur [sebutkan fitur MUST dari PRD]. Rekomendasikan tech stack yang:*
> 1. *Sederhana untuk non-programmer*
> 2. *Minim konfigurasi deployment*
> 3. *Free tier yang cukup untuk MVP*
> 4. *Ada GitHub integration untuk CI/CD*
> *Jelaskan reasoning untuk setiap pilihan."*

---

## Update History

| Tanggal | Versi | Perubahan |
|---------|-------|----------|
| 2026-02-13 | CONST-v1.0 | Initial template - Fase 0 |

---

**Status:** 📝 Template ready - Akan dilengkapi di Fase 2