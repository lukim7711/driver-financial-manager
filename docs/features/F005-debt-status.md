# F005 — Status Hutang

> **Priority:** MUST  
> **Estimated Build:** 20 menit  
> **Dependencies:** F003 (pre-loaded debts), API Debts endpoint  

---

## 1. Overview

Halaman yang menampilkan semua hutang dalam bentuk card list. Setiap card menunjukkan platform, sisa hutang, progress bar, cicilan berikutnya, dan tanggal jatuh tempo. User bisa tap card untuk melihat detail jadwal cicilan.

---

## 2. Acceptance Criteria

- [ ] Menampilkan 5 hutang dalam bentuk card list
- [ ] Setiap card: nama platform, sisa hutang, progress bar, next due date
- [ ] Card diurutkan berdasarkan jatuh tempo terdekat (urgent first)
- [ ] Progress bar: visual persentase yang sudah dibayar
- [ ] Tap card → expand detail jadwal cicilan
- [ ] Badge status per cicilan: unpaid, paid, late
- [ ] Total sisa hutang di bagian atas
- [ ] Tombol "💳 Bayar" di setiap card (link ke F006)

---

## 3. UI Layout

### 3.1 Debt List

```
┌─────────────────────────────┐
│  💳 Status Hutang            │
│                             │
│  Total Sisa: Rp 8.851.200   │
│  ████░░░░░░░░░░░░  0%       │
│  Target: 13 April 2026      │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────────┐│
│  │ 🔴 Kredivo 2             ││
│  │ Sisa: Rp 641.010        ││
│  │ ████████████░░░  0%     ││
│  │ Next: 15 Feb — Rp213.670││
│  │ ⚠️ 2 HARI LAGI!          ││
│  │            [💳 Bayar]    ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 🟡 Kredivo 1             ││
│  │ Sisa: Rp 1.006.050      ││
│  │ ░░░░░░░░░░░░░░░  0%    ││
│  │ Next: 28 Feb — Rp335.350││
│  │ 15 hari lagi            ││
│  │            [💳 Bayar]    ││
│  └─────────────────────────┘│
│                             │
│  ... (3 more cards) ...     │
│                             │
│  [← Home]                   │
└─────────────────────────────┘
```

### 3.2 Expanded Card (Tap to Expand)

```
┌─────────────────────────────┐
│ 📋 Shopee Pinjam — Detail   │
│                             │
│ Total Awal: Rp 4.904.446    │
│ Sisa:       Rp 4.904.446    │
│ Cicilan:    Rp 435.917/bln  │
│ Denda:      5%/bulan        │
│                             │
│ Jadwal Cicilan:             │
│ ┌──────────┬────────┬─────┐│
│ │ 13 Mar 26│435.917 │ ⬜   ││
│ │ 13 Apr 26│435.917 │ ⬜   ││
│ │ 13 Mei 26│435.917 │ ⬜   ││
│ │ 13 Jun 26│435.917 │ ⬜   ││
│ │ ...      │        │     ││
│ └──────────┴────────┴─────┘│
│                             │
│ ⬜ = Belum  ✅ = Lunas  🔴 = Telat│
│                             │
│  [💳 Bayar Cicilan Berikut] │
│  [← Kembali]                │
└─────────────────────────────┘
```

---

## 4. API Endpoint

### GET `/api/debts`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_original": 8851200,
      "total_remaining": 8851200,
      "total_paid": 0,
      "progress_percentage": 0
    },
    "debts": [
      {
        "id": "kredivo2",
        "platform": "Kredivo 2",
        "total_original": 641010,
        "total_remaining": 641010,
        "monthly_installment": 213670,
        "due_day": 15,
        "late_fee_type": "pct_monthly",
        "late_fee_rate": 0.04,
        "progress_percentage": 0,
        "next_schedule": {
          "id": "kredivo2-01",
          "due_date": "2026-02-15",
          "amount": 213670,
          "status": "unpaid",
          "days_until": 2
        },
        "schedules": [
          {
            "id": "kredivo2-01",
            "due_date": "2026-02-15",
            "amount": 213670,
            "status": "unpaid"
          },
          {
            "id": "kredivo2-02",
            "due_date": "2026-03-15",
            "amount": 213670,
            "status": "unpaid"
          },
          {
            "id": "kredivo2-03",
            "due_date": "2026-04-15",
            "amount": 213670,
            "status": "unpaid"
          }
        ]
      }
    ]
  }
}
```

---

## 5. Sort Order

```
1. Overdue debts (due_date < today, unpaid) — paling atas
2. Critical (due in 1-3 days)
3. Warning (due in 4-7 days)
4. Normal (due > 7 days, by nearest date)
5. All paid this period — paling bawah
```

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Semua cicilan bulan ini sudah lunas | Card tampil tanpa badge urgent |
| Hutang sudah lunas semua | Card tampil dengan badge "✅ LUNAS" + strikethrough |
| Cicilan overdue | Badge merah "TERLAMBAT", info estimasi denda |
| Data hutang belum di-seed | Redirect ke loading / trigger seed |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | First load | 5 cards, sorted by nearest due date |
| 2 | Kredivo 2 due in 2 days | Red badge, appears first |
| 3 | Tap card | Expand showing schedule table |
| 4 | After paying 1 cicilan | Progress bar updates, schedule shows ✅ |
| 5 | All cicilan of 1 debt paid | Card shows "LUNAS" badge |
