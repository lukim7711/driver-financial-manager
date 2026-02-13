# F012 — CRUD Hutang (Tambah/Edit/Hapus)

> **Status:** IN PROGRESS  
> **Priority:** HIGH  
> **Depends on:** F005 (Status Hutang), F006 (Bayar Hutang)  

---

## User Story

Sebagai driver ojol, saya ingin bisa menambah hutang baru, mengedit detail hutang yang ada, dan menghapus hutang yang salah input, agar tracking hutang saya selalu akurat.

---

## Acceptance Criteria

### Tambah Hutang
- [x] User bisa tap FAB (+) di halaman Hutang
- [x] Form bottom sheet: platform, total hutang, cicilan/bulan, tgl jatuh tempo, jumlah cicilan, tipe denda, rate denda
- [x] Validasi: platform wajib (max 50 char), total > 0, cicilan > 0, due_day 1-31, installments 1-120
- [x] Backend auto-generate jadwal cicilan bulanan dari due_day + total_installments
- [x] Setelah simpan, list hutang refresh otomatis

### Edit Hutang
- [x] User bisa tap ✏️ di DebtCard (expanded view)
- [x] Form edit: semua field kecuali paid_installments
- [x] Jika total_original diubah, total_remaining di-recalculate (total_original - sudah_dibayar)
- [x] Setelah simpan, list refresh otomatis

### Hapus Hutang
- [x] User bisa tap 🗑️ di DebtCard (expanded view)
- [x] Konfirmasi dialog: tampilkan nama + sisa hutang
- [x] Soft delete (is_deleted = 1) + cascade delete schedules
- [x] Setelah hapus, list refresh otomatis

---

## DB Schema Changes

```sql
-- debts table: add 2 columns
is_deleted INTEGER NOT NULL DEFAULT 0
created_at TEXT
```

Migration di `durable-object.ts` via ALTER TABLE (safe: try/catch jika sudah ada).

---

## API Spec

### POST /api/debts

**Request:**
```json
{
  "platform": "Akulaku",
  "total_original": 2000000,
  "monthly_installment": 400000,
  "due_day": 15,
  "total_installments": 6,
  "late_fee_type": "pct_monthly",
  "late_fee_rate": 0.05
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "debt-xxx", "platform": "Akulaku" }
}
```

### PUT /api/debts/:id

**Request (partial update):**
```json
{
  "platform": "Akulaku Updated",
  "total_original": 2500000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "debt-xxx",
    "platform": "Akulaku Updated",
    "total_original": 2500000,
    "total_remaining": 2100000
  }
}
```

### DELETE /api/debts/:id

**Response:**
```json
{
  "success": true,
  "data": { "deleted": "debt-xxx" }
}
```

---

## Frontend Spec

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| AddDebtForm | `components/AddDebtForm.tsx` | Bottom sheet form tambah hutang |
| EditDebtDialog | `components/EditDebtDialog.tsx` | Bottom sheet form edit hutang |
| DeleteDebtDialog | `components/DeleteDebtDialog.tsx` | Konfirmasi hapus |

### Modified Components

| Component | Changes |
|-----------|---------|
| DebtCard | Add `onEdit` + `onDelete` props, add ✏️/🗑️ buttons in expanded view |
| Debts (page) | Add FAB, CRUD state/handlers, render dialogs, empty state |

### UI Flow

1. **Tambah:** FAB (+) → AddDebtForm → Simpan → Refresh list
2. **Edit:** Expand card → ✏️ → EditDebtDialog → Simpan → Refresh list
3. **Hapus:** Expand card → 🗑️ → DeleteDebtDialog → Konfirmasi → Refresh list

---

## Files Changed

| File | Action |
|------|--------|
| `api/src/db/schema.ts` | MODIFIED — add is_deleted + created_at to debts |
| `api/src/db/durable-object.ts` | MODIFIED — add migration for new columns |
| `api/src/routes/debt.ts` | MODIFIED — add POST, PUT, DELETE handlers |
| `frontend/src/components/AddDebtForm.tsx` | NEW |
| `frontend/src/components/EditDebtDialog.tsx` | NEW |
| `frontend/src/components/DeleteDebtDialog.tsx` | NEW |
| `frontend/src/components/DebtCard.tsx` | MODIFIED — add edit/delete buttons |
| `frontend/src/pages/Debts.tsx` | MODIFIED — FAB, handlers, dialogs |
