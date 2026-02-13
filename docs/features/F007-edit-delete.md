# F007 — Edit/Hapus Transaksi

> **Priority:** MUST  
> **Estimated Build:** 20 menit  
> **Dependencies:** F001 (Quick Input), F008 (Daily Report for list view)  

---

## 1. Overview

User bisa tap transaksi di riwayat untuk mengedit (ubah nominal, kategori, catatan) atau menghapus (soft delete). Ini penting untuk koreksi kesalahan input.

---

## 2. Acceptance Criteria

- [ ] Tap transaksi di riwayat → buka modal edit
- [ ] Modal menampilkan: tipe, kategori, nominal, catatan, waktu
- [ ] User bisa ubah: nominal, kategori, catatan
- [ ] User TIDAK bisa ubah: tipe (masuk/keluar), waktu
- [ ] Tombol "💾 Simpan Perubahan" untuk save edit
- [ ] Tombol "🗑️ Hapus" untuk soft delete
- [ ] Konfirmasi sebelum hapus: "Yakin hapus transaksi ini?"
- [ ] Setelah edit/hapus, list dan dashboard terupdate
- [ ] Transaksi tipe `debt_payment` TIDAK bisa diedit/dihapus (proteksi data hutang)

---

## 3. UI Layout

### 3.1 Transaction Item in List

```
┌─────────────────────────────┐
│ ⛽ BBM           -Rp 40.000  │
│ 09:30 • manual              │
│ Pertalite                   │
└─────────────────────────────┘
  ↓ (tap)
```

### 3.2 Edit Modal

```
┌─────────────────────────────┐
│     ✏️ Edit Transaksi        │
│                             │
│  Tipe: 💸 Pengeluaran (🔒)   │
│  Waktu: 09:30 (🔒)           │
│                             │
│  Kategori:                  │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │⛽BBM ✓│ │🍜Mkn │ │🚬Rkok││
│  └──────┘ └──────┘ └──────┘│
│  (... more categories)      │
│                             │
│  Nominal:                   │
│  ┌─────────────────────────┐│
│  │ 40.000                  ││
│  └─────────────────────────┘│
│                             │
│  Catatan:                   │
│  ┌─────────────────────────┐│
│  │ Pertalite               ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │    💾 Simpan Perubahan   ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │    🗑️ Hapus Transaksi    ││
│  └─────────────────────────┘│
│                             │
│  [← Batal]                  │
└─────────────────────────────┘
```

### 3.3 Delete Confirmation

```
┌─────────────────────────────┐
│     ⚠️ Hapus Transaksi?      │
│                             │
│  ⛽ BBM — Rp 40.000          │
│  09:30 • Pertalite           │
│                             │
│  Transaksi yang dihapus     │
│  tidak bisa dikembalikan.   │
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ ❌ Batal   │ │ 🗑️ Hapus ││
│  └───────────┘ └──────────┘│
└─────────────────────────────┘
```

---

## 4. API Endpoints

### PUT `/api/transactions/:id`

**Request:**
```json
{
  "amount": 50000,
  "category": "bbm",
  "note": "Pertamax"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "amount": 50000,
    "category": "bbm",
    "note": "Pertamax",
    "updated_at": "2026-02-13T10:00:00+07:00"
  }
}
```

### DELETE `/api/transactions/:id`

**Backend:** Soft delete → `UPDATE transactions SET is_deleted = 1 WHERE id = :id`

**Response:**
```json
{
  "success": true,
  "data": { "id": "uuid-xxx", "deleted": true }
}
```

---

## 5. Protection Rules

| Transaction Type | Can Edit? | Can Delete? |
|-----------------|-----------|-------------|
| income | ✅ Yes | ✅ Yes |
| expense | ✅ Yes | ✅ Yes |
| debt_payment | ❌ No (protected) | ❌ No (protected) |

Debt payments harus di-manage melalui F005/F006 (debt management) untuk menjaga konsistensi data hutang.

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Edit nominal ke 0 | Validate: harus > 0 |
| Edit nominal ke > 10jt | Konfirmasi dialog |
| Tap debt_payment transaction | Modal tampil read-only, no edit/delete buttons |
| Delete last transaction of the day | Dashboard shows all zeros |
| Network error on save | Show error, revert UI, retry |
| Edit saat modal sudah stale | Fetch latest data saat modal open |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Edit nominal 40k → 50k | Amount updated, dashboard recalculated |
| 2 | Edit kategori BBM → Makan | Category changed |
| 3 | Delete expense | Soft deleted, removed from list, dashboard updated |
| 4 | Tap debt_payment | Read-only modal, no edit buttons |
| 5 | Cancel edit | No changes saved |
| 6 | Delete confirmation → Batal | No deletion |
