# F-F07: Multi-period Report (Laporan Bulanan + Custom Range)

> Status: ✅ DONE
> Priority: Post-MVP (Future Feature)
> PRs: [#20](https://github.com/lukim7711/driver-financial-manager/pull/20), [#21](https://github.com/lukim7711/driver-financial-manager/pull/21)

## Overview

User bisa melihat laporan dalam berbagai periode:
1. **Bulanan** — Ringkasan per bulan dengan tren vs bulan lalu
2. **Custom Range** — Pilih rentang tanggal bebas (dari–sampai)

---

## Part 1: Laporan Bulanan (PR #20)

### User Flow

1. Buka halaman Laporan
2. Tap tab "Bulanan"
3. Navigasi bulan dengan tombol ← →
4. Lihat ringkasan bulanan, rata-rata harian, tren, breakdown per minggu, top pengeluaran
5. (Optional) Tap "📲 Export CSV" untuk download data bulanan

### API Endpoint

#### GET /api/report/monthly?month=YYYY-MM

Response:
```json
{
  "success": true,
  "data": {
    "month": "2026-02",
    "month_label": "Februari 2026",
    "days_in_month": 28,
    "active_days": 14,
    "summary": {
      "income": 4200000,
      "expense": 1680000,
      "debt_payment": 500000,
      "profit": 2020000,
      "transaction_count": 87
    },
    "averages": {
      "daily_income": 300000,
      "daily_expense": 120000,
      "daily_profit": 144286
    },
    "comparison": {
      "prev_month": "2026-01",
      "prev_month_label": "Januari 2026",
      "income_trend": 10,
      "expense_trend": 12,
      "profit_trend": 12
    },
    "weekly": [
      {
        "week_start": "2026-02-02",
        "week_end": "2026-02-08",
        "week_label": "Minggu 1",
        "income": 1050000,
        "expense": 420000,
        "profit": 630000,
        "transaction_count": 22
      }
    ],
    "top_expenses": [
      { "category": "bbm", "emoji": "⛽", "label": "BBM", "total": 600000, "percentage": 36 }
    ],
    "income_breakdown": [
      { "category": "order", "emoji": "🛵", "label": "Order", "total": 3500000, "count": 45 }
    ]
  }
}
```

### UI Sections

1. **Month Navigator** — ← Bulan Lalu | "Februari 2026" (X hari aktif) | Depan →
2. **Ringkasan Bulan Ini** — Total pemasukan, pengeluaran, bayar hutang, profit
3. **Rata-Rata Harian** — Grid 3 kolom: pemasukan, pengeluaran, profit
4. **Tren vs Bulan Lalu** — Persentase perubahan dengan warna + ikon
5. **Per Minggu** — Breakdown per minggu dengan income bar
6. **Top Pengeluaran** — 5 kategori pengeluaran terbesar
7. **Sumber Pemasukan** — Breakdown pemasukan per kategori

---

## Part 2: Custom Date Range (PR #21)

### User Flow

1. Buka halaman Laporan
2. Tap tab "Custom"
3. Pilih tanggal Dari & Sampai via date picker, ATAU tap preset (7/14/30 hari, Bulan Ini)
4. Tap "🔍 Tampilkan Laporan"
5. Lihat ringkasan, rata-rata, top pengeluaran, sumber pemasukan

### API Endpoint

#### GET /api/report/custom?start=YYYY-MM-DD&end=YYYY-MM-DD

Response:
```json
{
  "success": true,
  "data": {
    "start": "2026-02-01",
    "end": "2026-02-14",
    "total_days": 14,
    "active_days": 10,
    "summary": {
      "income": 2100000,
      "expense": 840000,
      "debt_payment": 250000,
      "profit": 1010000,
      "transaction_count": 43
    },
    "averages": {
      "daily_income": 210000,
      "daily_expense": 84000,
      "daily_profit": 101000
    },
    "top_expenses": [
      { "category": "bbm", "emoji": "⛽", "label": "BBM", "total": 300000, "percentage": 36 }
    ],
    "income_breakdown": [
      { "category": "order", "emoji": "🛵", "label": "Order", "total": 1750000, "count": 22 }
    ]
  }
}
```

### UI Sections

1. **Date Picker** — Input Dari & Sampai (native date input, max = hari ini)
2. **Quick Presets** — Tombol pill: 7 Hari, 14 Hari, 30 Hari, Bulan Ini
3. **Tombol Tampilkan** — Full-width button, disabled saat loading
4. **Range Label** — "1 Feb 2026 – 14 Feb 2026" + hari aktif
5. **Ringkasan** — Card summary (pemasukan, pengeluaran, hutang, profit)
6. **Rata-Rata Harian** — Grid 3 kolom
7. **Top Pengeluaran** — Kategori pengeluaran terbesar
8. **Sumber Pemasukan** — Breakdown per kategori + count

### Validation

- start & end wajib, format YYYY-MM-DD
- start harus ≤ end
- end tidak boleh melewati hari ini (frontend guard)

---

## Technical

- Backend: `api/src/routes/report-monthly.ts` + `report-custom.ts`
- Frontend: `MonthlyReport.tsx` + `CustomRangeReport.tsx`
- Tab switcher: 4 tabs di `Report.tsx` (Harian | Mingguan | Bulanan | Custom)
- CSV export: Monthly via ExportCsvButton, Custom via inline (future)
- Pattern: Navigator/picker + summary cards

## Acceptance Criteria

### Bulanan
- [x] Tab Bulanan muncul di halaman Laporan
- [x] Month navigator berfungsi (← →)
- [x] Tidak bisa navigasi ke bulan depan
- [x] Ringkasan bulanan tampil
- [x] Rata-rata harian dari active_days
- [x] Tren vs bulan lalu dengan warna + ikon
- [x] Breakdown per minggu
- [x] Top pengeluaran & sumber pemasukan
- [x] Export CSV bulanan berfungsi

### Custom Range
- [x] Tab Custom muncul sebagai tab ke-4
- [x] Date picker Dari & Sampai berfungsi
- [x] Quick preset buttons (7, 14, 30, Bulan Ini)
- [x] Tombol Tampilkan memuat data
- [x] Ringkasan, rata-rata, top expenses, income breakdown tampil
- [x] Validasi start ≤ end
- [x] Tidak bisa pilih tanggal masa depan
