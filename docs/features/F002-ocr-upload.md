# F002 — Upload Struk OCR

> **Priority:** MUST  
> **Estimated Build:** 30 menit  
> **Dependencies:** ocr.space API key, F001 (Quick Input)  

---

## 1. Overview

User bisa foto struk/nota belanja, app kirim ke ocr.space untuk extract teks, lalu tampilkan hasil yang bisa user konfirmasi atau koreksi sebelum disimpan sebagai transaksi.

---

## 2. Acceptance Criteria

- [ ] User bisa upload gambar dari kamera atau galeri
- [ ] App mengirim gambar ke API `/api/ocr`
- [ ] Backend proxy ke ocr.space, return parsed text
- [ ] App menampilkan hasil parsing: toko, item, total
- [ ] User bisa konfirmasi (✅ Benar) atau koreksi (✏️ Edit)
- [ ] Jika konfirmasi, otomatis buat transaksi (source: 'ocr')
- [ ] Jika koreksi, buka form edit sebelum save
- [ ] Loading indicator saat OCR processing
- [ ] Error handling jika OCR gagal

---

## 3. UI Layout

### 3.1 Upload Screen

```
┌─────────────────────────────┐
│       📷 Upload Struk        │
│                             │
│  ┌─────────────────────────┐│
│  │                         ││
│  │     📸 Tap untuk Foto    ││
│  │     atau pilih dari     ││
│  │        Galeri            ││
│  │                         ││
│  └─────────────────────────┘│
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ 📷 Kamera │ │ 🖼️ Galeri ││
│  └───────────┘ └──────────┘│
│                             │
│    [← Kembali]              │
└─────────────────────────────┘
```

### 3.2 Processing

```
┌─────────────────────────────┐
│       🔄 Memproses Struk...  │
│                             │
│  ┌─────────────────────────┐│
│  │  [preview gambar struk]  ││
│  └─────────────────────────┘│
│                             │
│       ⏳ Membaca teks...     │
│       Biasanya < 5 detik    │
│                             │
└─────────────────────────────┘
```

### 3.3 Result & Confirm

```
┌─────────────────────────────┐
│     ✅ Hasil OCR             │
│                             │
│  Toko: SPBU Pertamina       │
│  Item: Pertalite            │
│                             │
│  Tipe:     [💸 KELUAR]      │
│  Kategori: [⛽ BBM]         │
│  Nominal:  [Rp 40.000]     │
│  Catatan:  Pertalite SPBU   │
│                             │
│  ┌───────────┐ ┌──────────┐│
│  │ ✅ Simpan  │ │ ✏️ Edit  ││
│  └───────────┘ └──────────┘│
│                             │
│    [🗑️ Buang]               │
└─────────────────────────────┘
```

---

## 4. API Endpoint

### POST `/api/ocr`

**Request:** `multipart/form-data`
```
file: <image file>
```

**Backend Logic:**
1. Receive image from frontend
2. Forward to `https://api.ocr.space/parse/image` with:
   - `apikey`: from Worker secret
   - `language`: `ind` (Indonesian)
   - `isOverlayRequired`: false
   - `filetype`: auto-detect
   - `OCREngine`: 2 (more accurate)
3. Parse response, extract text lines
4. Attempt smart parsing:
   - Cari pattern harga: Rp xxx.xxx atau angka besar
   - Cari nama toko (baris pertama biasanya)
   - Cari keyword: bensin, pertalite, pertamax → kategori BBM
   - Cari keyword: nasi, makan, minum → kategori makan
5. Return parsed suggestion

**Response:**
```json
{
  "success": true,
  "data": {
    "raw_text": "SPBU PERTAMINA 34.401\nPertalite\n3.200 Liter\nRp 40.000",
    "suggestion": {
      "type": "expense",
      "category": "bbm",
      "amount": 40000,
      "note": "Pertalite SPBU"
    }
  }
}
```

---

## 5. Smart Parsing Rules

| Keyword Pattern | Suggested Category |
|----------------|--------------------|
| pertalite, pertamax, bensin, solar, spbu | ⛽ bbm |
| nasi, makan, minum, warung, resto, kopi, teh | 🍜 makan |
| rokok, sampoerna, surya, djarum | 🚬 rokok |
| pulsa, data, telkomsel, indosat | 📱 pulsa |
| parkir | 🅿️ parkir |
| oli, ban, bengkel, service | 🔧 service |

Jika tidak match keyword, default: `📦 lainnya_keluar`

---

## 6. Edge Cases

| Case | Handling |
|------|----------|
| Struk blur/tidak terbaca | Tampilkan raw text, user input manual |
| OCR return empty | "Struk tidak terbaca. Silakan input manual." + link ke F001 |
| Harga tidak terdeteksi | Field nominal kosong, user harus isi |
| Gambar > 1MB | Compress di frontend sebelum upload |
| Network timeout | Retry button + fallback ke manual input |
| ocr.space rate limit (500/hari) | Tampilkan "Batas OCR harian tercapai. Input manual." |
| Multiple harga di struk | Ambil angka terbesar (biasanya total) |
| Struk non-Indonesia | Tetap parse, mungkin kategori salah, user bisa edit |

---

## 7. Test Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Upload struk SPBU jelas | Kategori: BBM, nominal: benar |
| 2 | Upload struk warung makan | Kategori: Makan, nominal: benar |
| 3 | Upload struk blur | Raw text tampil, user edit manual |
| 4 | Upload file non-image | Error: "Format tidak didukung" |
| 5 | OCR gagal (network error) | Error toast + retry button |
| 6 | User edit suggestion lalu simpan | Transaksi tersimpan dengan data yang diedit |
| 7 | User buang hasil OCR | Kembali ke upload screen, no save |
