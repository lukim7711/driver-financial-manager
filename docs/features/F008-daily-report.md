# F008 — Laporan Harian

> **Priority:** MUST  
> **Estimated Build:** 25 menit  
> **Dependencies:** API Report endpoint, F001 (transactions exist)  

---

## 1. Overview

Halaman laporan yang menampilkan breakdown keuangan per hari. Menunjukkan pemasukan dan pengeluaran per kategori, perbandingan dengan budget, dan riwayat transaksi lengkap. User bisa navigasi antar tanggal.

---

## 2. Acceptance Criteria

- [ ] Default menampilkan laporan hari ini
- [ ] Bisa navigasi ke tanggal lain (← kemarin | besok →)
- [ ] Menampilkan total pemasukan hari itu
- [ ] Menampilkan total pengeluaran hari itu (breakdown per kategori)
- [ ] Menampilkan total pembayaran hutang hari itu
- [ ] Menampilkan profit/rugi (pemasukan - pengeluaran - hutang)
- [ ] Breakdown pengeluaran per kategori vs budget
- [ ] List transaksi lengkap (tappable → F007 edit)
- [ ] Ringkasan mingguan (F009 SHOULD) bisa diakses dari sini

---

## 3. UI Layout

```
┌─────────────────────────────┐
│  📊 Laporan Harian           │
│  [←] 13 Feb 2026 [→]        │
├─────────────────────────────┤
│                             │
│  💰 Pemasukan   Rp 205.000   │
│  💸 Pengeluaran Rp  97.000   │
│  💳 Bayar Hutang Rp       0  │
│  ─────────────────────────  │
│  📈 Profit      Rp 108.000   │
│                             │
├─── Pengeluaran per Kategori ┤
│                             │
│  ⛽ BBM     Rp40.000 / 40k  │
│  ████████████████████ 100%  │
│                             │
│  🍜 Makan   Rp25.000 / 25k  │
│  ████████████████████ 100%  │
│                             │
│  🚬 Rokok   Rp27.000 / 27k  │
│  ████████████████████ 100%  │
│                             │
│  📱 Pulsa   Rp 5.000 /  5k  │
│  ████████████████████ 100%  │
│                             │
│  🅿️ Parkir  Rp     0 / -    │
│  ░░░░░░░░░░░░░░░░░░░  0%   │
│                             │
├─── Riwayat Transaksi ───────┤
│                             │
│  🛵 Order    +Rp 25.000     │
│  09:15 • manual             │
│                             │
│  ⛽ BBM      -Rp 40.000     │
│  09:30 • manual • Pertalite │
│                             │
│  🛵 Order    +Rp 20.000     │
│  10:45 • manual             │
│                             │
│  🍜 Makan    -Rp 15.000     │
│  12:00 • manual • Warteg    │
│                             │
│  🛵 Order    +Rp 30.000     │
│  13:30 • manual             │
│                             │
│  🍜 Makan    -Rp 10.000     │
│  15:00 • ocr • Es teh       │
│                             │
│  🛵 Order    +Rp 130.000    │
│  19:00 • manual • Insentif  │
│                             │
│         7 transaksi         │
├─────────────────────────────┤
│  [📅 Mingguan]  [← Home]    │
└─────────────────────────────┘
```

---

## 4. API Endpoint

### GET `/api/report/daily?date=2026-02-13`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-02-13",
    "summary": {
      "income": 205000,
      "expense": 97000,
      "debt_payment": 0,
      "profit": 108000,
      "transaction_count": 7
    },
    "expense_by_category": [
      {
        "category": "bbm",
        "emoji": "⛽",
        "label": "BBM",
        "spent": 40000,
        "budget": 40000,
        "percentage": 100
      },
      {
        "category": "makan",
        "emoji": "🍜",
        "label": "Makan",
        "spent": 25000,
        "budget": 25000,
        "percentage": 100
      },
      {
        "category": "rokok",
        "emoji": "🚬",
        "label": "Rokok",
        "spent": 27000,
        "budget": 27000,
        "percentage": 100
      },
      {
        "category": "pulsa",
        "emoji": "📱",
        "label": "Pulsa",
        "spent": 5000,
        "budget": 5000,
        "percentage": 100
      }
    ],
    "income_by_category": [
      {
        "category": "order",
        "emoji": "🛵",
        "label": "Order",
        "total": 205000,
        "count": 4
      }
    ],
    "transactions": [
      {
        "id": "uuid-1",
        "created_at": "2026-02-13T09:15:00+07:00",
        "type": "income",
        "amount": 25000,
        "category": "order",
        "note": "",
        "source": "manual"
      }
    ]
  }
}
```

---

## 5. Date Navigation

```
← (Previous day)  |  Current Date  |  → (Next day)
```

- Default: today
- Bisa navigate ke hari sebelumnya tanpa batas
- Tidak bisa navigate ke masa depan (beyond today)
- Tanggal ditampilkan: "13 Feb 2026" (format Indonesia)

---

## 6. Budget vs Spent Colors

| Percentage | Color | Meaning |
|-----------|-------|---------|
| 0-70% | 🟢 Hijau | Aman |
| 71-99% | 🟡 Kuning | Mendekati limit |
| 100% | 🟠 Orange | Tepat di budget |
| > 100% | 🔴 Merah | Over budget! |

---

## 7. Edge Cases

| Case | Handling |
|------|----------|
| No transactions on that date | "Belum ada transaksi pada tanggal ini" |
| Navigate to future date | Arrow → disabled if date = today |
| Kategori tanpa budget (parkir, service, lainnya) | Tampil spent only, no progress bar |
| Over budget (spent > budget) | Red bar, percentage > 100% |
| Tap transaksi | Open edit modal (F007) |
| Debt payment in list | Badge "💳" icon, non-tappable for edit |

---

## 8. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | View today with 7 transactions | Correct summary + breakdown + list |
| 2 | Navigate to yesterday | Different date data loads |
| 3 | Navigate to future | → button disabled |
| 4 | Day with no transactions | Empty state message |
| 5 | Over budget on BBM | Red progress bar, 120% |
| 6 | Tap transaction in list | Edit modal opens (F007) |
| 7 | Day with debt payment | Shows in list with 💳 badge |
