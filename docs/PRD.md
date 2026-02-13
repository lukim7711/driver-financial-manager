# 📋 Product Requirements Document (PRD)
# Money Manager — Driver Ojol Financial Dashboard

> **Version:** 2.0  
> **Status:** Active  
> **Last Updated:** 2026-02-13  
> **Author:** AI-Assisted (Perplexity)  

---

## 1. Product Vision

### 1.1 Ringkasan

Money Manager adalah **personal financial dashboard** berbasis web (PWA) untuk seorang driver ojol yang ingin melunasi hutang multi-platform dalam waktu 2 bulan. Aplikasi ini mengutamakan **kecepatan input** (tap > ketik), **tracking hutang real-time**, dan **laporan harian otomatis**.

### 1.2 Problem Statement

- Driver ojol dengan multi-hutang dari 5 platform pinjaman online (total Rp 8.851.200)
- Penghasilan harian tidak tetap (Rp 120k - Rp 350k+)
- Tidak punya tracking keuangan → tidak tahu posisi keuangan real-time
- Jatuh tempo berbeda-beda (tgl 1, 5, 13, 15, 28) → sering telat bayar → kena denda
- Butuh tool yang **cepat, tidak ribet, bisa dipakai sambil kerja**

### 1.3 Value Proposition

- Input transaksi **< 3 detik** (4 tap, 0 ketik)
- Dashboard real-time: profit hari ini, sisa budget, progress hutang
- Alert jatuh tempo otomatis
- Upload struk/nota → OCR auto-extract
- Semua gratis (Cloudflare free tier)

### 1.4 Target Lunas

- **Total hutang:** Rp 8.851.200
- **Target lunas:** 13 April 2026 (2 bulan dari 13 Feb)
- **Butuh:** ~Rp 147.520/hari dialokasikan untuk hutang

---

## 2. Studi Kasus (Data Nyata)

### 2.1 Profil User

| Data | Nilai |
|------|-------|
| Pekerjaan | Driver ojol (ShopeeFood / SPX Express) |
| Lokasi | Jakarta, Indonesia |
| Status | Belum menikah |
| Jam kerja | 8-12 jam/hari, ~26 hari/bulan |
| Kendaraan | Motor (cicilan terpisah) |

### 2.2 Profil Penghasilan

| Metric | Nilai |
|--------|-------|
| Tipe | Harian, tidak tetap (variabel) |
| Range harian | Rp 120.000 - Rp 350.000+ |
| Rata-rata kotor | Rp 205.000/hari |
| Rata-rata bersih | Rp 108.000/hari |
| Sumber | Ongkir order + insentif/bonus |
| Jumlah order | Rata-rata 13-14 order/hari |

### 2.3 Pengeluaran Tetap Harian — Operasional

| Kategori | Default | Min | Max |
|----------|---------|-----|-----|
| ⛽ BBM | 40.000 | 25.000 | 60.000 |
| 🍜 Makan & Minum | 25.000 | 10.000 | 40.000 |
| 🚬 Rokok | 27.000 | 13.500 | 35.000 |
| 📱 Data/Pulsa | 5.000 | 3.000 | 10.000 |
| **TOTAL** | **97.000** | **51.500** | **145.000** |

### 2.4 Pengeluaran Tetap Harian — Rumah Tangga

| Kategori | Default/hari |
|----------|--------------|
| 🏠 Kebutuhan pokok rumah | 60.000 |
| 💡 Listrik & air | 5.000 |
| 🔧 Darurat/tak terduga | 10.000 |
| **TOTAL** | **85.000** |

### 2.5 Daftar Hutang (Per 12 Feb 2026)

#### Hutang 1: Shopee Pinjam
- Sisa total: Rp 4.904.446 (termasuk bunga)
- Cicilan/bulan: Rp 435.917
- Jumlah cicilan: 10 kali (semua belum dibayar)
- Jatuh tempo: Tanggal 13 setiap bulan
- Denda keterlambatan: 5% per bulan dari cicilan
- Jadwal: 13 Mar - 13 Des 2026

#### Hutang 2: SPayLater
- Sisa total: Rp 672.194
- Cicilan/bulan: ~Rp 162.845
- Jumlah cicilan: 5 kali
- Jatuh tempo: Tanggal 1 setiap bulan
- Denda keterlambatan: 5% per bulan dari cicilan
- Jadwal: 01 Mar - 01 Jul 2026

#### Hutang 3: SeaBank Pinjam
- Sisa total: Rp 1.627.500
- Cicilan/bulan: Rp 232.500 (tetap)
- Jumlah cicilan: 7 kali
- Jatuh tempo: Tanggal 5 setiap bulan
- Denda keterlambatan: 0.25% per hari
- Jadwal: 05 Mar - 05 Sep 2026

#### Hutang 4: Kredivo 1
- Sisa total: Rp 1.006.050
- Cicilan/bulan: Rp 335.350
- Jumlah cicilan: 3 kali (6 sudah lunas)
- Jatuh tempo: Tanggal 28 setiap bulan
- Denda keterlambatan: 4% per bulan dari cicilan
- Jadwal: 28 Feb - 28 Apr 2026

#### Hutang 5: Kredivo 2
- Sisa total: Rp 641.010
- Cicilan/bulan: Rp 213.670
- Jumlah cicilan: 3 kali (3 sudah lunas)
- Jatuh tempo: Tanggal 15 setiap bulan
- Denda keterlambatan: 4% per bulan dari cicilan
- Jadwal: 15 Feb - 15 Apr 2026

#### Ringkasan Total Hutang

| Platform | Sisa Hutang | Cicilan/bulan | Jatuh Tempo |
|----------|-------------|---------------|-------------|
| Shopee Pinjam | Rp 4.904.446 | Rp 435.917 | Tgl 13 |
| SPayLater | Rp 672.194 | ~Rp 162.845 | Tgl 1 |
| SeaBank Pinjam | Rp 1.627.500 | Rp 232.500 | Tgl 5 |
| Kredivo 1 | Rp 1.006.050 | Rp 335.350 | Tgl 28 |
| Kredivo 2 | Rp 641.010 | Rp 213.670 | Tgl 15 |
| **GRAND TOTAL** | **Rp 8.851.200** | | |

---

## 3. User Persona

### Primary Persona: Driver Ojol Solo

- **Nama:** Driver ShopeeFood Jakarta
- **Usia:** 20-35 tahun
- **Device:** Smartphone Android (mid-range)
- **Koneksi:** 4G, kadang tidak stabil
- **Waktu pakai app:** Saat istirahat, sambil nunggu order, malam hari
- **Tech literacy:** Bisa pakai HP, familiar Telegram/WA/Shopee, bukan programmer
- **Pain point utama:** Tidak tahu uang pergi ke mana, hutang menumpuk, bayar telat kena denda
- **Kebutuhan:** Tool cepat, minim ketik, bisa dipakai 1 tangan sambil pegang HP

---

## 4. Fitur

### 4.1 MVP (Build 4 Jam)

#### MUST — Core Features

| ID | Fitur | Deskripsi | AI? |
|----|-------|-----------|-----|
| F001 | Quick-Tap Input Transaksi | Tap MASUK/KELUAR → Tap kategori → Tap preset nominal → SIMPAN. 4 tap, 0 ketik, < 3 detik | Tidak |
| F002 | Upload Struk OCR | Foto struk/nota → ocr.space extract text → tampilkan hasil → user konfirmasi | ocr.space |
| F003 | Pre-loaded Data Hutang | 5 hutang + jadwal cicilan dari studi kasus, sudah tersedia saat app pertama kali dibuka | Tidak |
| F004 | Home Dashboard | Ringkasan hari ini: pemasukan, pengeluaran, profit, sisa budget, alert jatuh tempo | Tidak |
| F005 | Status Hutang | Daftar hutang + progress bar + jatuh tempo terdekat + tombol "Tandai Lunas" | Tidak |
| F006 | Bayar Hutang (Tandai Lunas) | 1 tap → catat pengeluaran + update sisa hutang + update progress | Tidak |
| F007 | Edit/Hapus Transaksi | Tap transaksi di riwayat → modal popup → ubah jumlah/kategori atau hapus | Tidak |
| F008 | Laporan Harian | Breakdown pemasukan/pengeluaran per kategori + riwayat transaksi hari ini | Tidak |

#### SHOULD — Polish Features

| ID | Fitur | Deskripsi | AI? |
|----|-------|-----------|-----|
| F009 | Ringkasan Mingguan | Total minggu ini: pemasukan, pengeluaran, profit, pembayaran hutang | Tidak |
| F010 | Adjust Budget | Setting budget per kategori (BBM, makan, rokok, dll) via tombol +/- | Tidak |
| F011 | Help/Onboarding | Panduan singkat saat pertama kali buka app | Tidak |

### 4.2 Future Features (Post-MVP)

| ID | Fitur | Deskripsi |
|----|-------|----------|
| F-F01 | Google Maps Integration | Pin alamat pengirim-penerima per order |
| F-F02 | Trip Tracking | Setiap input = data tracking lokasi, waktu, jarak, rute |
| F-F03 | AI Learning | Analisis pola penghasilan, prediksi, optimasi rute, saran penghematan |
| F-F04 | Grafik/Chart Visual | Chart pengeluaran per kategori, trend mingguan/bulanan |
| F-F05 | Export CSV | Export data transaksi ke file CSV |
| F-F06 | Notifikasi Proaktif | Push notification H-3 jatuh tempo via service worker |
| F-F07 | Multi-period Report | Laporan bulanan, custom date range |

### 4.3 NON-Goals (Explicitly Excluded)

1. **Bukan multi-user** — ini personal app untuk 1 orang
2. **Bukan SaaS** — tidak ada login, registrasi, atau user management
3. **Bukan chat bot** — interface adalah dashboard visual, bukan conversational AI
4. **Bukan integrasi API ojol** — tidak connect ke Grab/Gojek/Shopee API
5. **Bukan payment gateway** — app tidak memproses pembayaran, hanya mencatat
6. **Bukan budgeting advisor AI** — di MVP tidak ada saran AI otomatis
7. **Bukan accounting software** — tidak ada neraca, jurnal, atau laporan pajak
8. **Bukan mobile native app** — web PWA only, tidak publish ke Play Store

---

## 5. User Interface

### 5.1 Prinsip Desain

- **Tap > Ketik** — hampir semua input pakai tombol, preset, dan tap
- **Mobile-first** — optimasi untuk HP Android mid-range, 1 tangan
- **4 tap max** — setiap transaksi bisa dicatat dalam 4 tap atau kurang
- **Informasi penting di atas** — dashboard summary selalu visible di home
- **Emoji sebagai icon** — cepat dibaca, universal, zero asset

### 5.2 Layar Utama

| # | Layar | Fungsi |
|---|-------|--------|
| 1 | **Home** | Dashboard ringkasan hari ini + alert jatuh tempo + navigasi |
| 2 | **Quick Input** | Tap-based input transaksi (MASUK/KELUAR → kategori → nominal) |
| 3 | **Upload Struk** | Foto/upload struk → OCR → konfirmasi |
| 4 | **Status Hutang** | Daftar hutang + progress + tandai lunas |
| 5 | **Laporan** | Harian/mingguan breakdown + riwayat transaksi |
| 6 | **Settings** | Adjust budget, preset nominal, target tanggal lunas |

### 5.3 User Flow — Catat Pengeluaran (Happy Path)

1. Buka app (tap icon PWA di home screen) → **Home** tampil
2. Tap tombol **➕ Catat**
3. Tap **💸 KELUAR**
4. Tap kategori: **⛽ BBM**
5. Tap preset nominal: **40k**
6. Tap **✅ SIMPAN**
7. Kembali ke **Home** → dashboard terupdate

Total: **6 tap, 0 ketik, < 3 detik**

### 5.4 User Flow — Upload Struk

1. Dari layar Quick Input, tap **📷 Foto Struk**
2. Ambil foto atau pilih dari galeri
3. App kirim ke ocr.space → extract teks
4. Tampilkan hasil: "⛽ Pertalite — Rp 40.000"
5. User tap **✅ Benar** atau **✏️ Koreksi**
6. Tersimpan

### 5.5 User Flow — Bayar Cicilan

1. Buka **💳 Hutang**
2. Lihat hutang terdekat: "Kredivo 2 — Rp 213.670 (15 Feb)"
3. Tap **💳 Tandai Lunas**
4. App otomatis: catat sebagai pengeluaran + update sisa hutang + update progress bar
5. Konfirmasi: "✅ Kredivo 2 bulan ini LUNAS. Sisa: Rp 427.340"

### 5.6 User Flow — Cek Laporan Harian

1. Tap **📊 Laporan** di Home
2. Default: tampil laporan hari ini
3. Lihat: pemasukan, pengeluaran per kategori, profit, sisa untuk hutang
4. Scroll ke bawah: riwayat transaksi hari ini
5. Tap transaksi → modal edit/hapus

---

## 6. Data Model

### 6.1 Tabel: debts (Pre-loaded)

| Field | Type | Deskripsi |
|-------|------|-----------|
| id | TEXT PK | ID unik (shopee, spaylater, seabank, kredivo1, kredivo2) |
| platform | TEXT | Nama platform |
| total_original | INTEGER | Sisa hutang per 12 Feb 2026 |
| total_remaining | INTEGER | Sisa hutang real-time |
| monthly_installment | INTEGER | Cicilan per bulan |
| due_day | INTEGER | Tanggal jatuh tempo (1-28) |
| late_fee_type | TEXT | 'pct_monthly' atau 'pct_daily' |
| late_fee_rate | REAL | Persentase denda |

### 6.2 Tabel: debt_schedule (Pre-loaded)

| Field | Type | Deskripsi |
|-------|------|-----------|
| id | TEXT PK | ID unik |
| debt_id | TEXT FK | Reference ke debts |
| due_date | TEXT | Tanggal jatuh tempo (ISO 8601) |
| amount | INTEGER | Jumlah yang harus dibayar |
| status | TEXT | 'unpaid', 'paid', 'late' |
| paid_date | TEXT | Tanggal dibayar (nullable) |
| paid_amount | INTEGER | Jumlah yang dibayar (nullable) |

### 6.3 Tabel: transactions (Runtime)

| Field | Type | Deskripsi |
|-------|------|-----------|
| id | TEXT PK | UUID |
| created_at | TEXT | Timestamp ISO 8601 |
| type | TEXT | 'income', 'expense', 'debt_payment' |
| amount | INTEGER | Nominal dalam Rupiah |
| category | TEXT | Kode kategori |
| note | TEXT | Catatan opsional |
| source | TEXT | 'manual', 'ocr' |
| debt_id | TEXT FK | Link ke debt jika debt_payment (nullable) |
| is_deleted | INTEGER | Soft delete flag (0/1) |

### 6.4 Tabel: settings (Runtime, adjustable)

| Key | Default Value | Deskripsi |
|-----|---------------|-----------|
| budget_bbm | 40000 | Budget harian BBM |
| budget_makan | 25000 | Budget harian makan |
| budget_rokok | 27000 | Budget harian rokok |
| budget_pulsa | 5000 | Budget harian pulsa |
| budget_rt | 85000 | Budget harian rumah tangga |
| debt_target_date | 2026-04-13 | Target tanggal lunas semua hutang |

### 6.5 Kategori

**Pemasukan:**
- `order` — Pendapatan dari order
- `bonus` — Bonus/insentif
- `lainnya_masuk` — Pemasukan lain

**Pengeluaran:**
- `bbm` — Bensin/BBM
- `makan` — Makan & minum
- `rokok` — Rokok
- `pulsa` — Data/pulsa
- `parkir` — Parkir
- `rt` — Kebutuhan rumah tangga
- `service` — Service/maintenance motor
- `lainnya_keluar` — Pengeluaran lain

---

## 7. Technical Constraints

### 7.1 Cloudflare Free Tier Limits

| Resource | Limit | Impact |
|----------|-------|--------|
| Workers requests | 100.000/hari | Sangat cukup untuk 1 user |
| Workers CPU | 10ms/request | Business logic harus lean |
| Workers AI neurons | 10.000/hari | Hemat, hanya untuk future AI features |
| Durable Objects storage | 5GB | Sangat cukup untuk 1 user |
| ocr.space API | 500 request/hari | Cukup untuk ~5-10 struk/hari |

### 7.2 Performance Targets

| Metric | Target |
|--------|--------|
| App load time (PWA cached) | < 1 detik |
| Input transaksi (tap-to-save) | < 3 detik |
| Dashboard refresh | < 500ms |
| OCR processing | < 5 detik |
| Bundle size (frontend) | < 200 KB gzipped |

### 7.3 Build Constraint

- **Total build time:** 4 jam
- **Deploy target:** Cloudflare Pages (frontend) + Workers (API)
- **Zero cost:** Semua dalam free tier

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Transaksi per hari tercatat | > 5 transaksi |
| Waktu input per transaksi | < 3 detik |
| Akurasi OCR struk | > 80% (dengan koreksi manual) |
| Hutang lunas sesuai target | 13 April 2026 |
| Budget harian terpantau | Setiap hari ada ringkasan |
| Jatuh tempo tidak terlewat | 0 denda baru setelah app aktif |

---

## 9. Assumptions & Risks

### Assumptions

1. User akan konsisten mencatat transaksi setiap hari
2. User punya koneksi internet saat input (app butuh API call)
3. Struk yang difoto cukup jelas untuk OCR
4. Data hutang dari studi kasus akurat per 12 Feb 2026
5. User mengakses app dari 1 device (HP utama)

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| User lupa catat transaksi | Data tidak akurat | Alert di home jika belum ada input hari ini |
| OCR gagal baca struk thermal pudar | Harus input manual | Fallback ke manual input, OCR opsional |
| Cloudflare free tier berubah | App bisa down | Monitor CF changelog, data bisa di-export |
| Workers CPU 10ms tidak cukup | Request timeout | Workers AI subrequest tidak hitung CPU, logic harus lean |
| Target lunas 2 bulan tidak realistis secara matematis | User frustasi | Dashboard tetap tracking meskipun target meleset |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-13 | Initial template (incorrect — web app generic) |
| 1.1 | 2026-02-13 | Attempted completion (still incorrect) |
| 2.0 | 2026-02-13 | Complete rewrite — dashboard PWA, studi kasus nyata, quick-tap UI |