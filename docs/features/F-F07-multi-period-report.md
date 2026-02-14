# F-F07: Multi-period Report (Laporan Bulanan)

> Status: 🔧 IN PROGRESS
> Priority: Post-MVP (Future Feature)

## Overview

User bisa melihat laporan bulanan yang menampilkan ringkasan pemasukan, pengeluaran, profit, rata-rata harian, tren vs bulan lalu, breakdown per minggu, dan top pengeluaran per kategori. Juga bisa export ke CSV.

## User Flow

1. Buka halaman Laporan
2. Tap tab "Bulanan"
3. Navigasi bulan dengan tombol ← →
4. Lihat ringkasan bulanan, rata-rata harian, tren, breakdown per minggu, top pengeluaran
5. (Optional) Tap "📥 Export CSV" untuk download data bulanan

## API Endpoint

### GET /api/report/monthly?month=YYYY-MM

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
      "prev_income": 3800000,
      "prev_expense": 1500000,
      "prev_profit": 1800000,
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
      {
        "category": "bbm",
        "emoji": "⛽",
        "label": "BBM",
        "total": 600000,
        "percentage": 36
      }
    ],
    "income_breakdown": [
      {
        "category": "order",
        "emoji": "🛵",
        "label": "Order",
        "total": 3500000,
        "count": 45
      }
    ]
  }
}
```

## UI Sections

1. **Month Navigator** — ← Bulan Lalu | "Februari 2026" (X hari aktif) | Depan →
2. **Ringkasan Bulan Ini** — Total pemasukan, pengeluaran, bayar hutang, profit
3. **Rata-Rata Harian** — Grid 3 kolom: pemasukan, pengeluaran, profit
4. **Tren vs Bulan Lalu** — Persentase perubahan pemasukan, pengeluaran, profit
5. **Per Minggu** — Breakdown per minggu dengan income bar
6. **Top Pengeluaran** — Kategori pengeluaran terbesar
7. **Sumber Pemasukan** — Breakdown pemasukan per kategori

## Technical

- Backend: New route handler di `api/src/routes/report.ts`
- Frontend: New component `MonthlyReport.tsx`
- Tab ke-3 "📅 Bulanan" di Report.tsx
- CSV export extended di `csv-export.ts`
- Pattern sama dengan WeeklyReport (navigator + cards)

## Acceptance Criteria

- [ ] Tab Bulanan muncul di halaman Laporan
- [ ] Month navigator berfungsi (← →)
- [ ] Tidak bisa navigasi ke bulan depan jika belum terjadi
- [ ] Ringkasan bulanan tampil dengan benar
- [ ] Rata-rata harian dihitung dari active_days
- [ ] Tren vs bulan lalu tampil dengan warna + ikon
- [ ] Breakdown per minggu tampil
- [ ] Top pengeluaran per kategori tampil
- [ ] Export CSV bulanan berfungsi
