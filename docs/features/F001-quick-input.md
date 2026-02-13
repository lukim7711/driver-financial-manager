# F001 — Quick-Tap Input Transaksi

> **Priority:** MUST  
> **Estimated Build:** 45 menit  
> **Dependencies:** API Transaction CRUD, PresetButton component  

---

## 1. Overview

Fitur input transaksi utama. User bisa mencatat pemasukan/pengeluaran dalam **4 tap, 0 ketik, < 3 detik**. Ini adalah fitur paling kritikal karena dipakai 10-20x sehari.

---

## 2. Acceptance Criteria

- [ ] User bisa memilih tipe: MASUK atau KELUAR (1 tap)
- [ ] User bisa memilih kategori dari grid (1 tap)
- [ ] User bisa memilih nominal dari preset buttons (1 tap)
- [ ] User bisa tap SIMPAN untuk save transaksi (1 tap)
- [ ] Total flow: 4 tap, 0 ketik, < 3 detik
- [ ] Setelah simpan, kembali ke Home dengan data terupdate
- [ ] User bisa input nominal custom via numpad jika preset tidak cocok
- [ ] Kategori menampilkan emoji + label
- [ ] Preset nominal berbeda per kategori
- [ ] Ada field catatan opsional (bisa di-skip)

---

## 3. UI Layout

### 3.1 Step 1 — Pilih Tipe

```
┌─────────────────────────────┐
│      ✏️ Catat Transaksi      │
│                             │
│  ┌───────────┐ ┌──────────┐ │
│  │  💰 MASUK  │ │ 💸 KELUAR │ │
│  │  (hijau)  │ │  (merah) │ │
│  └───────────┘ └──────────┘ │
│                             │
│         [← Batal]           │
└─────────────────────────────┘
```

### 3.2 Step 2 — Pilih Kategori

**Jika MASUK:**
```
┌─────────────────────────────┐
│     💰 Pemasukan — Kategori  │
│                             │
│  ┌─────────┐ ┌───────────┐  │
│  │ 🛵 Order │ │ 🎁 Bonus  │  │
│  └─────────┘ └───────────┘  │
│  ┌─────────────────────────┐│
│  │    📦 Lainnya            ││
│  └─────────────────────────┘│
│                             │
│    [← Kembali]              │
└─────────────────────────────┘
```

**Jika KELUAR:**
```
┌─────────────────────────────┐
│    💸 Pengeluaran — Kategori │
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │⛽ BBM │ │🍜Mkn │ │🚬Rkok││
│  └──────┘ └──────┘ └──────┘│
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │📱Plsa│ │🅿️Prkr│ │🏠 RT ││
│  └──────┘ └──────┘ └──────┘│
│  ┌──────┐ ┌──────────────┐ │
│  │🔧Srvc│ │📦 Lainnya    │ │
│  └──────┘ └──────────────┘ │
│                             │
│    [← Kembali]              │
└─────────────────────────────┘
```

### 3.3 Step 3 — Pilih Nominal

```
┌─────────────────────────────┐
│     ⛽ BBM — Berapa?         │
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 20k  │ │ 30k  │ │ 40k  ││
│  └──────┘ └──────┘ └──────┘│
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 50k  │ │ 60k  │ │ 80k  ││
│  └──────┘ └──────┘ └──────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ ⌨️ Ketik Nominal Lain    ││
│  └─────────────────────────┘│
│                             │
│  📝 Catatan: ______________ │
│  (opsional)                 │
│                             │
│  ┌─────────────────────────┐│
│  │      ✅ SIMPAN           ││
│  └─────────────────────────┘│
│    [← Kembali]              │
└─────────────────────────────┘
```

### 3.4 Preset Nominal Per Kategori

| Kategori | Preset Values |
|----------|---------------|
| ⛽ BBM | 20k, 30k, 40k, 50k, 60k, 80k |
| 🍜 Makan | 10k, 15k, 20k, 25k, 30k, 40k |
| 🚬 Rokok | 13.5k, 18k, 22k, 27k, 35k |
| 📱 Pulsa | 5k, 10k, 15k, 20k, 25k, 50k |
| 🅿️ Parkir | 2k, 3k, 5k, 10k |
| 🏠 RT | 20k, 30k, 50k, 60k, 85k, 100k |
| 🔧 Service | 20k, 50k, 100k, 150k, 200k |
| 📦 Lainnya | 10k, 20k, 50k, 100k |
| 🛵 Order | 10k, 15k, 20k, 25k, 30k, 50k |
| 🎁 Bonus | 20k, 50k, 100k, 150k, 200k |

---

## 4. API Endpoint

### POST `/api/transactions`

**Request:**
```json
{
  "type": "expense",
  "amount": 40000,
  "category": "bbm",
  "note": "",
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "created_at": "2026-02-13T09:30:00+07:00",
    "type": "expense",
    "amount": 40000,
    "category": "bbm",
    "note": "",
    "source": "manual"
  }
}
```

---

## 5. Data Flow

```
User taps → React state updates per step → 
User taps SIMPAN → POST /api/transactions → 
Worker → DO SQLite INSERT → Response → 
Redirect to Home → Home fetches fresh dashboard data
```

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Nominal 0 atau kosong | SIMPAN button disabled |
| Nominal negatif | Validate: harus > 0 |
| Nominal > 10.000.000 | Validate: cap at 10jt, konfirmasi jika > 1jt |
| Custom nominal bukan angka | Numpad only, non-numeric ignored |
| Double tap SIMPAN | Disable button setelah tap pertama, re-enable setelah response |
| Network error saat save | Tampilkan error toast, button re-enable, user bisa retry |
| Tap Kembali saat mid-flow | Kembali ke step sebelumnya, state preserved |
| User close app saat mid-input | Data hilang (not saved), acceptable trade-off |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Happy path: KELUAR → BBM → 40k → SIMPAN | Transaksi tersimpan, redirect ke Home |
| 2 | Happy path: MASUK → Order → 25k → SIMPAN | Transaksi tersimpan |
| 3 | Custom nominal: KELUAR → Makan → Ketik 17500 → SIMPAN | Amount = 17500 tersimpan |
| 4 | Dengan catatan: KELUAR → BBM → 40k → "Pertalite" → SIMPAN | Note = "Pertalite" |
| 5 | Cancel flow: KELUAR → BBM → ← Kembali → ← Kembali → ← Batal | Kembali ke Home, no save |
| 6 | Network error | Toast error, bisa retry |
| 7 | Double tap SIMPAN | Hanya 1 transaksi tersimpan |
