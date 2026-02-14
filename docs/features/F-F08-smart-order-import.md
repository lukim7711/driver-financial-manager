# F-F08: Smart Order Import (OCR Rekap Orderan Shopee)

> Status: 🔧 IN PROGRESS (Phase 1)
> Priority: Post-MVP
> Dependencies: F002 (OCR Upload infrastructure)

## Overview

User upload screenshot "Riwayat Pesanan" dari Shopee di akhir kerja.
App parse semua order dalam gambar via OCR, extract data terstruktur
(tanggal, waktu, platform, argo, tipe order), simpan ke database
sebagai batch pemasukan + data detail order untuk future AI analysis.

Mendukung **multiple screenshot** jika orderan lebih dari 1 layar.

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | OCR → parse → batch income + orders table | 🔧 NOW |
| Phase 2 | Order analytics dashboard (statistik, chart) | ⏳ Backlog |
| Phase 3 | AI insights — pola, prediksi, saran (Workers AI) | ⏳ Backlog |

---

## Phase 1: OCR → Structured Order Data

### Data Fields (per order)

| Field | Contoh | Parse Method |
|-------|--------|--------------|
| order_date | 2026-02-02 | Header "02 Feb 2026" di atas group |
| order_time | 21:22 | Angka jam di kiri atas tiap card |
| platform | spx_instant | Label "SPX Instant (Marketplace)" |
| fare_amount | 19200 | "Rp19.200" di kanan atas |
| order_type | combined | Badge "Pesanan Gabungan" (else single) |

Field yang TIDAK di-parse (untuk nanti):
- pickup_name, pickup_area → skip
- dropoff_area → selalu "disembunyikan"

### Database: New Table `orders`

```sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  order_date TEXT NOT NULL,
  order_time TEXT NOT NULL,
  platform TEXT NOT NULL,
  fare_amount INTEGER NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'single',
  raw_ocr_line TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_date
  ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_platform
  ON orders(platform);
```

### API Endpoints

#### POST /api/ocr/orders

Upload screenshot → parse → return list of detected orders.

Request: `multipart/form-data` with `file` field

Response:
```json
{
  "success": true,
  "data": {
    "raw_text": "...",
    "detected_date": "2026-02-02",
    "orders": [
      {
        "order_time": "21:22",
        "platform": "spx_instant",
        "platform_label": "SPX Instant",
        "fare_amount": 19200,
        "order_type": "single"
      },
      {
        "order_time": "20:37",
        "platform": "spx_instant",
        "platform_label": "SPX Instant",
        "fare_amount": 23200,
        "order_type": "single"
      },
      {
        "order_time": "19:56",
        "platform": "shopeefood",
        "platform_label": "ShopeeFood",
        "fare_amount": 12800,
        "order_type": "combined"
      }
    ],
    "total_fare": 192000,
    "order_count": 8
  }
}
```

#### POST /api/orders/batch

Confirm & save parsed orders → insert to `orders` table + create
income transactions.

Request:
```json
{
  "date": "2026-02-02",
  "orders": [
    {
      "order_time": "21:22",
      "platform": "spx_instant",
      "fare_amount": 19200,
      "order_type": "single"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "orders_saved": 8,
    "total_income": 192000,
    "transaction_id": "txn_abc123"
  }
}
```

Behavior:
- Creates 1 income transaction: type=income, category=order,
  amount=total_fare, source=ocr_order, note="8 order Shopee (02 Feb 2026)"
- Creates N rows in `orders` table, each linked to that transaction_id
- If orders already exist for that date+time combo, skip duplicates

### User Flow

1. Buka halaman "📷 Catat" (existing OcrUpload page)
2. Tab baru: "🛵 Rekap Order" (di samping "📷 Upload Struk")
3. Upload 1+ screenshot Riwayat Pesanan Shopee
4. App parse via OCR → tampilkan preview:
   - Tanggal terdeteksi: "02 Feb 2026"
   - List order: waktu, platform, argo
   - Total: Rp192.000 (8 order)
5. User bisa:
   - Edit tanggal (jika salah detect)
   - Hapus order individual (jika double/salah)
   - Edit argo individual (jika salah baca)
   - Tambah screenshot lagi (append more orders)
6. Tap "✅ Simpan Semua" → batch save
7. Redirect ke Home, pemasukan hari itu terupdate

### UI Components

1. **OrderImport page** (or tab in OcrUpload)
   - Upload area (camera + gallery)
   - "Tambah Screenshot" button (untuk multiple)

2. **OrderPreview component**
   - Date header (editable)
   - Order list (card per order: waktu, platform badge, argo)
   - Individual delete/edit
   - Total summary bar
   - "✅ Simpan Semua" button

### OCR Parsing Strategy

Shopee "Riwayat Pesanan" format (from screenshot analysis):
```
02 Feb 2026 v              ← date header
┌─────────────────────────┐
│ 21:22  SPX Instant  Rp19.200 │ ← order card
│ 🏠 Alamat Pengirim...        │
│ 👤 Alamat Pelanggan...       │
└─────────────────────────┘
┌─────────────────────────┐
│ 19:56  ShopeeFood  Pesanan Gabungan  Rp12.800 │
│ 🏠 Sate Padang...            │
│ 👤 Alamat Pelanggan...       │
│ 🏠 Sate Padang...            │
│ 👤 Alamat Pelanggan...       │
└─────────────────────────┘
```

Parsing rules:
1. Detect date: regex `/\d{1,2}\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des)\s+\d{4}/i`
2. Detect order lines: regex for time + amount pattern
   - Time: `/\b(\d{1,2}[:.:]\d{2})\b/`
   - Amount: `/Rp([\d.,]+)/`
3. Detect platform: keywords "SPX", "ShopeeFood"
4. Detect combined: keyword "Pesanan Gabungan" or "Gabungan"
5. Group: each time+amount pair = 1 order

### Platform Constants

```typescript
const PLATFORMS = {
  spx_instant: { label: 'SPX Instant', emoji: '📦', color: 'orange' },
  spx_sameday: { label: 'SPX Sameday', emoji: '📦', color: 'orange' },
  spx_standard: { label: 'SPX Standard', emoji: '📦', color: 'orange' },
  shopeefood: { label: 'ShopeeFood', emoji: '🍔', color: 'green' },
} as const
```

## Acceptance Criteria (Phase 1)

- [ ] Tab "🛵 Rekap Order" muncul di halaman Catat/OCR
- [ ] Upload screenshot Shopee → parse tanggal + list order
- [ ] Preview tampil: tanggal, list order (waktu, platform, argo)
- [ ] Total argo dihitung otomatis
- [ ] User bisa edit tanggal, hapus order, edit argo
- [ ] User bisa upload screenshot tambahan (append)
- [ ] Simpan → batch insert orders + 1 income transaction
- [ ] Duplikat terdeteksi (same date+time+amount = skip)
- [ ] Tabel `orders` baru di schema + migration
- [ ] API: POST /api/ocr/orders (parse)
- [ ] API: POST /api/orders/batch (save)

## Technical Notes

- Reuse existing OCR infrastructure (ocr.space proxy)
- OCR language: `eng` (Shopee UI is mixed Indonesian/English)
- Max file size: 1MB (ocr.space free tier limit)
- Multiple screenshots: parse each → merge orders → dedup
- Transaction source: `ocr_order` (beda dari `ocr` biasa)
- Future: pickup_name, dropoff_area fields bisa ditambah nanti
