# F013 — Biaya Bulanan Dinamis

> **Status:** ✅ DONE 
> **PR:** [#9](https://github.com/lukim7711/driver-financial-manager/pull/9) 
> **Merged:** 2026-02-14

---

## Ringkasan

User bisa menambah, mengedit, dan menghapus item biaya bulanan di halaman Settings. Semua item biaya bulanan otomatis masuk ke kalkulasi **Target Harian** (di-prorate per hari di bulan berjalan).

Sebelumnya hanya ada 1 item hardcode `budget_rt` di tabel `settings`. Sekarang diganti dengan tabel dedicated `monthly_expenses` yang mendukung unlimited items.

---

## User Story

Sebagai driver ojol, saya ingin **mencatat semua biaya bulanan** (RT, Listrik, Air, WiFi, dll) agar **Target Harian** saya akurat dan mencakup semua pengeluaran tetap.

---

## Acceptance Criteria

- [x] User bisa **melihat** daftar biaya bulanan di Settings
- [x] User bisa **menambah** item baru (nama, ikon, nominal)
- [x] User bisa **mengedit** nominal item secara inline
- [x] User bisa **menghapus** item (soft delete)
- [x] **Total bulanan** ditampilkan di bawah list
- [x] **Target Harian** di Home otomatis memperhitungkan semua biaya bulanan
- [x] Seed default: 🏠 RT/Rumah Tangga Rp 75.000
- [x] Migrasi otomatis dari `budget_rt` di tabel `settings`

---

## Database

### Tabel: `monthly_expenses`

| Column | Type | Default | Note |
|--------|------|---------|------|
| `id` | TEXT | PK | Format: `me-{timestamp}-{random}` |
| `name` | TEXT | required | Nama item, max 30 char |
| `emoji` | TEXT | '📦' | Dari pre-defined list |
| `amount` | INTEGER | required | Nominal dalam Rupiah |
| `is_deleted` | INTEGER | 0 | Soft delete flag |
| `created_at` | TEXT | ISO 8601 | Dengan timezone +07:00 |

### Migration Logic

Pada init Durable Object:
1. Buat tabel `monthly_expenses` jika belum ada
2. Cek apakah `budget_rt` ada di `settings`
3. Jika ada & > 0, insert ke `monthly_expenses` sebagai "🏠 RT/Rumah Tangga"
4. Hapus `budget_rt` dari `settings`

---

## API Endpoints

### `GET /api/monthly-expenses`

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "me-1707868800000-abc12",
        "name": "RT/Rumah Tangga",
        "emoji": "🏠",
        "amount": 75000,
        "is_deleted": 0,
        "created_at": "2026-02-14T02:00:00.000+07:00"
      }
    ],
    "total": 75000
  }
}
```

### `POST /api/monthly-expenses`

Body:
```json
{
  "name": "Listrik",
  "emoji": "💡",
  "amount": 100000
}
```

Validasi:
- `name`: required, 1–30 karakter
- `amount`: required, integer >= 0
- `emoji`: opsional, harus dari list valid (fallback: 📦)

### `PUT /api/monthly-expenses/:id`

Body (partial update):
```json
{
  "amount": 120000
}
```

### `DELETE /api/monthly-expenses/:id`

Soft delete (set `is_deleted = 1`).

---

## Frontend

### Settings Page — Section "Biaya Bulanan"

**List Items:**
- Tampilkan emoji + nama + input nominal (editable inline)
- Tombol 🗑️ untuk hapus (dengan konfirmasi)
- Auto-save on blur (ketika user pindah dari input field)

**Tambah Item:**
- Tombol "+ Tambah Biaya Bulanan" → expand form
- Form: emoji picker (grid 14 opsi), input nama, input nominal
- Tombol Batal / Tambah

**Total:**
- Bar biru di bawah list: "Total Bulanan: Rp XXX.XXX"

### Home Dashboard — DailyTarget

- Label breakdown: `🏠 Bulanan/bln` (sebelumnya `RT/bln`)
- Baca `prorated_monthly` dari dashboard API
- Hide row jika `prorated_monthly === 0`

---

## Emoji Options (Pre-defined)

| Emoji | Intended Use |
|-------|--------------|
| 🏠 | Rumah / RT |
| 💡 | Listrik |
| 💧 | Air / PDAM |
| 📶 | Internet / WiFi |
| 🔌 | Utility lain |
| 🏥 | Kesehatan / BPJS |
| 🎓 | Pendidikan |
| 📺 | TV / Streaming |
| 🚗 | Kendaraan / Cicilan |
| 🛡️ | Asuransi |
| 📦 | Lainnya (default) |
| 🧹 | Kebersihan |
| 👶 | Anak |
| 🐾 | Hewan peliharaan |

---

## Files Changed

### Backend
| File | Action |
|------|--------|
| `api/src/routes/monthly-expense.ts` | NEW — CRUD handlers |
| `api/src/db/schema.ts` | Add `monthly_expenses` table |
| `api/src/db/seed.ts` | Seed RT + migrate `budget_rt` |
| `api/src/db/durable-object.ts` | Migration logic on init |
| `api/src/routes/dashboard.ts` | Query `monthly_expenses` SUM |
| `api/src/routes/settings.ts` | Remove `budget_rt` key |
| `api/src/types/index.ts` | Add `MonthlyExpense` interface |
| `api/src/index.ts` | Mount `/api/monthly-expenses` route |

### Frontend
| File | Action |
|------|--------|
| `frontend/src/pages/Settings.tsx` | Overhaul monthly section |
| `frontend/src/components/DailyTarget.tsx` | `prorated_rt` → `prorated_monthly` |
| `frontend/src/pages/Home.tsx` | Update dashboard interfaces |
| `frontend/src/types/index.ts` | Add `MonthlyExpense` type |

---

## Before vs After

| Aspek | Before | After |
|-------|--------|-------|
| Biaya bulanan | Hardcode `budget_rt` (1 item) | Dinamis — unlimited items |
| Storage | `settings` table | `monthly_expenses` table |
| Dashboard API | Baca 1 key `budget_rt` | Query `SUM(amount)` |
| Settings UI | 1 field statis | List dinamis + CRUD |
| Target Harian | Prorate `budget_rt` saja | Prorate semua biaya bulanan |
