# F004 — Home Dashboard

> **Priority:** MUST  
> **Estimated Build:** 30 menit  
> **Dependencies:** API Dashboard endpoint, F003 (pre-loaded debts)  

---

## 1. Overview

Layar utama yang muncul saat app dibuka. Menampilkan ringkasan keuangan hari ini, alert jatuh tempo terdekat, dan navigasi ke semua fitur. Dirancang agar user bisa cek status dalam 1 pandangan tanpa scroll.

---

## 2. Acceptance Criteria

- [ ] Tampil langsung saat app dibuka (default route `/`)
- [ ] Menampilkan tanggal hari ini
- [ ] Menampilkan total pemasukan hari ini
- [ ] Menampilkan total pengeluaran hari ini (termasuk debt payment)
- [ ] Menampilkan profit/sisa hari ini (pemasukan - pengeluaran)
- [ ] Warna profit: hijau jika positif, merah jika negatif
- [ ] Menampilkan sisa budget harian (budget total - pengeluaran non-hutang)
- [ ] Alert jatuh tempo: hutang terdekat yang belum dibayar dalam 7 hari ke depan
- [ ] Alert warna merah jika jatuh tempo ≤ 3 hari
- [ ] Navigasi ke: Catat (+), Hutang, Laporan, Settings
- [ ] Menampilkan jumlah transaksi hari ini
- [ ] Pull-to-refresh untuk update data

---

## 3. UI Layout

```
┌─────────────────────────────┐
│  💰 Money Manager            │
│  📅 Kamis, 13 Feb 2026       │
├─────────────────────────────┤
│                             │
│  Pemasukan    Rp 205.000 ▲  │
│  Pengeluaran  Rp  97.000 ▼  │
│  ─────────────────────────  │
│  Profit       Rp 108.000 ✅ │
│                             │
│  Sisa Budget: Rp 85.000     │
│  ████████████░░░  78%       │
│                             │
├─────────────────────────────┤
│  ⚠️ JATUH TEMPO              │
│  ┌─────────────────────────┐│
│  │ 🔴 Kredivo 2  │ 15 Feb  ││
│  │ Rp 213.670    │ 2 HARI! ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🟡 Kredivo 1  │ 28 Feb  ││
│  │ Rp 335.350    │ 15 hari ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│                             │
│  Total Hutang: Rp 8.851.200 │
│  Target Lunas: 13 Apr 2026  │
│  ████░░░░░░░░░░░░  5%      │
│                             │
├─────────────────────────────┤
│                             │
│  ┌──┐  ┌──┐  ┌──┐  ┌──┐   │
│  │➕│  │💳│  │📊│  │⚙️│   │
│  │   │  │   │  │   │  │   │   │
│  │Ctt│  │Htg│  │Lap│  │Set│   │
│  └──┘  └──┘  └──┘  └──┘   │
│                             │
└─────────────────────────────┘
```

---

## 4. API Endpoint

### GET `/api/dashboard?date=2026-02-13`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-13",
    "today": {
      "income": 205000,
      "expense": 97000,
      "debt_payment": 0,
      "profit": 108000,
      "transaction_count": 7
    },
    "budget": {
      "total_daily": 182000,
      "spent_today": 97000,
      "remaining": 85000,
      "percentage_used": 53
    },
    "upcoming_dues": [
      {
        "debt_id": "kredivo2",
        "platform": "Kredivo 2",
        "due_date": "2026-02-15",
        "amount": 213670,
        "days_until": 2,
        "urgency": "critical"
      },
      {
        "debt_id": "kredivo1",
        "platform": "Kredivo 1",
        "due_date": "2026-02-28",
        "amount": 335350,
        "days_until": 15,
        "urgency": "normal"
      }
    ],
    "debt_summary": {
      "total_original": 8851200,
      "total_remaining": 8851200,
      "total_paid": 0,
      "progress_percentage": 0,
      "target_date": "2026-04-13"
    }
  }
}
```

---

## 5. Business Rules

### 5.1 Budget Calculation
```
budget_total = budget_bbm + budget_makan + budget_rokok + budget_pulsa + budget_rt
spent_today = SUM(amount) WHERE type='expense' AND date=today AND category NOT IN debt categories
remaining = budget_total - spent_today
percentage = (spent_today / budget_total) × 100
```

### 5.2 Upcoming Dues
```
SELECT from debt_schedule WHERE status='unpaid' AND due_date BETWEEN today AND today+7
ORDER BY due_date ASC
```

### 5.3 Urgency Levels
| Days Until Due | Urgency | Color |
|----------------|---------|-------|
| ≤ 0 (overdue) | `overdue` | 🔴 Merah gelap |
| 1-3 days | `critical` | 🔴 Merah |
| 4-7 days | `warning` | 🟡 Kuning |
| > 7 days | `normal` | ⚪ Default |

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Belum ada transaksi hari ini | Tampilkan semua 0, "Belum ada transaksi hari ini" |
| Tidak ada jatuh tempo 7 hari ke depan | Section upcoming_dues hidden |
| Hutang overdue (lewat jatuh tempo) | Tampil paling atas dengan badge "TERLAMBAT" |
| Budget exceeded (spent > budget) | Progress bar merah, remaining negatif |
| Semua hutang lunas | Tampilkan "🎉 Semua Hutang LUNAS!" banner |
| App offline (PWA cached) | Tampilkan data terakhir dengan badge "Offline" |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | First open (no transactions) | All zeros, 5 debts loaded, alert Kredivo 2 |
| 2 | After recording 3 transactions | Dashboard totals update correctly |
| 3 | Overdue debt exists | Red alert at top |
| 4 | All debts paid this month | No upcoming dues section |
| 5 | Budget exceeded | Red progress bar, negative remaining |
| 6 | Pull to refresh | Fresh data fetched |
