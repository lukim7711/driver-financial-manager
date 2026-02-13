# F006 — Bayar Hutang (Tandai Lunas)

> **Priority:** MUST  
> **Estimated Build:** 20 menit  
> **Dependencies:** F005 (Debt Status), API pay endpoint  

---

## 1. Overview

User bisa menandai cicilan bulan ini sebagai "lunas" dengan 1 tap. Aksi ini otomatis: (1) catat sebagai transaksi pengeluaran tipe `debt_payment`, (2) update `debt_schedule` status menjadi `paid`, (3) kurangi `debts.total_remaining`.

---

## 2. Acceptance Criteria

- [ ] Tombol "💳 Bayar" di setiap debt card (F005)
- [ ] Tap Bayar → konfirmasi dialog
- [ ] Setelah konfirmasi:
  - Buat transaksi baru (type: debt_payment)
  - Update debt_schedule.status = 'paid'
  - Update debt_schedule.paid_date = today
  - Update debts.total_remaining -= amount
  - Update debts.paid_installments += 1
- [ ] Tampilkan konfirmasi: "✅ [Platform] bulan ini LUNAS"
- [ ] Dashboard dan debt status terupdate
- [ ] Bisa bayar sebagian (partial payment) → input nominal custom

---

## 3. UI Flow

### 3.1 Konfirmasi Dialog

```
┌─────────────────────────────┐
│     💳 Bayar Cicilan         │
│                             │
│  Kredivo 2                  │
│  Cicilan: Rp 213.670        │
│  Jatuh tempo: 15 Feb 2026   │
│                             │
│  Bayar penuh?               │
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ ✅ Ya,     │ │ 💰 Bayar ││
│  │ Rp213.670 │ │ Sebagian ││
│  └───────────┘ └──────────┘│
│                             │
│  [← Batal]                  │
└─────────────────────────────┘
```

### 3.2 Partial Payment

```
┌─────────────────────────────┐
│     💰 Bayar Sebagian        │
│                             │
│  Kredivo 2                  │
│  Cicilan: Rp 213.670        │
│                             │
│  Nominal bayar:             │
│  ┌─────────────────────────┐│
│  │ Rp 100.000              ││
│  └─────────────────────────┘│
│                             │
│  Sisa cicilan: Rp 113.670   │
│                             │
│  ┌─────────────────────────┐│
│  │      ✅ SIMPAN           ││
│  └─────────────────────────┘│
│  [← Batal]                  │
└─────────────────────────────┘
```

### 3.3 Success

```
┌─────────────────────────────┐
│          ✅                  │
│                             │
│   Kredivo 2 bulan ini       │
│        LUNAS!               │
│                             │
│   Dibayar: Rp 213.670       │
│   Sisa hutang: Rp 427.340   │
│                             │
│  ┌─────────────────────────┐│
│  │     [Kembali ke Home]    ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

## 4. API Endpoint

### POST `/api/debts/:id/pay`

**Request:**
```json
{
  "schedule_id": "kredivo2-01",
  "amount": 213670,
  "is_full_payment": true
}
```

**Backend Logic:**
```
1. BEGIN TRANSACTION
2. INSERT INTO transactions (
     type='debt_payment', amount=213670, 
     category='debt', debt_id='kredivo2',
     source='manual'
   )
3. UPDATE debt_schedule 
   SET status='paid', paid_date=today, paid_amount=213670
   WHERE id='kredivo2-01'
4. UPDATE debts 
   SET total_remaining = total_remaining - 213670,
       paid_installments = paid_installments + 1
   WHERE id='kredivo2'
5. COMMIT
```

**Response:**
```json
{
  "success": true,
  "data": {
    "debt_id": "kredivo2",
    "platform": "Kredivo 2",
    "paid_amount": 213670,
    "remaining": 427340,
    "schedule_status": "paid",
    "is_fully_paid": false
  }
}
```

---

## 5. Partial Payment Rules

| Scenario | Behavior |
|----------|----------|
| Bayar penuh (amount = cicilan) | schedule status = 'paid' |
| Bayar sebagian (amount < cicilan) | schedule status tetap 'unpaid', paid_amount tercatat, sisa = cicilan - paid_amount |
| Bayar lebih dari cicilan | Tidak diizinkan, max = cicilan amount |
| Bayar sebagian 2x | paid_amount di-akumulasi, jika total ≥ cicilan → status = 'paid' |

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Schedule sudah 'paid' | Tombol bayar disabled, badge ✅ |
| Amount = 0 | Tombol SIMPAN disabled |
| Network error saat bayar | Rollback transaction, tampilkan error, retry |
| Bayar cicilan yang overdue | Tetap bisa bayar, status jadi 'paid' (bukan 'late') |
| Semua cicilan 1 hutang lunas | total_remaining = 0, card shows "LUNAS" badge |
| Semua hutang lunas | Celebration screen 🎉 |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Full payment Kredivo 2 | Transaction created, schedule paid, remaining updated |
| 2 | Partial payment 100k | Transaction 100k, schedule still unpaid, partial noted |
| 3 | Second partial to complete | Accumulated = full, schedule becomes paid |
| 4 | Try pay already paid | Button disabled |
| 5 | Network error | No data changed, error shown |
| 6 | Pay last cicilan of a debt | Debt card shows LUNAS |
| 7 | Pay all debts | Celebration screen |
