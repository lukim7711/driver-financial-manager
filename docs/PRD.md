# 📋 Product Requirements Document (PRD)
# Driver Financial Manager

> Versi: 1.0 | Tanggal: 2026-02-13 | Status: Draft

---

## 1. Visi Produk

**Driver Financial Manager** adalah [jenis aplikasi] yang membantu [driver transportasi online/taksi/truk] untuk [mengelola keuangan operasional harian] sehingga [memiliki kontrol finansial yang lebih baik dan dapat membuat keputusan bisnis yang tepat].

---

## 2. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama | Pain Point |
|---------|-----------|-----------------|------------|
| Driver Solo | Driver individu yang bekerja sendiri | Tracking pendapatan & pengeluaran harian | Kesulitan menghitung profit bersih |
| Driver Fleet | Driver yang bekerja dalam armada | Pelaporan ke pemilik kendaraan | Pencatatan manual rentan error |
| ... | ... | ... | ... |

---

## 3. Daftar Fitur (Prioritas MoSCoW)

| ID | Fitur | Deskripsi Singkat | Prioritas | Contoh Interaksi |
|----|-------|-------------------|-----------|------------------|
| F001 | Pencatatan Transaksi | Catat pemasukan & pengeluaran harian | MUST | User input "Pemasukan Rp 500.000" → Sistem simpan & tampilkan saldo |
| F002 | Kategori Pengeluaran | Pisahkan jenis pengeluaran (BBM, makan, service) | MUST | User pilih kategori "BBM" → Sistem group data |
| F003 | Laporan Harian | Ringkasan profit/loss per hari | MUST | User buka dashboard → Sistem tampilkan ringkasan hari ini |
| F004 | Grafik Bulanan | Visualisasi trend pendapatan | SHOULD | User pilih "Lihat Grafik" → Sistem tampilkan chart 30 hari |
| F005 | Export ke Excel | Download data dalam format spreadsheet | COULD | User klik "Export" → Sistem generate .xlsx |

---

## 4. NON-Goals (Yang TIDAK Akan Dibuat)

> ⚠️ Minimal 3 poin. Ini SANGAT penting agar AI tidak "kreatif" menambahkan hal yang tidak diminta.

1. Aplikasi ini TIDAK akan mengelola pembayaran pajak atau aspek legal
2. Aplikasi ini TIDAK mendukung multi-currency atau transaksi internasional
3. Tidak ada fitur social/sharing di versi ini
4. Tidak ada integrasi dengan bank/fintech untuk auto-tracking
5. Tidak ada fitur peminjaman/kredit/hutang antar driver

---

## 5. User Flow Utama

### Flow 1: Catat Transaksi Harian

1. User membuka aplikasi
2. Sistem menampilkan dashboard dengan saldo hari ini
3. User memilih "+ Tambah Transaksi"
4. User memilih jenis: Pemasukan / Pengeluaran
5. User input jumlah & kategori
6. Sistem memproses → hasil: Transaksi tersimpan
   - Jika gagal: "⚠️ Gagal menyimpan. Periksa koneksi."
   - Jika berhasil: Redirect ke dashboard dengan saldo terupdate

### Flow 2: Lihat Laporan Harian

1. User membuka dashboard
2. Sistem menampilkan:
   - Total pemasukan hari ini
   - Total pengeluaran hari ini
   - Profit bersih
   - Breakdown per kategori
3. User dapat scroll untuk lihat history transaksi

---

## 6. Contoh Interaksi (Happy Path + Error)

### F001: Pencatatan Transaksi

**Happy Path:**
- Input: "Pemasukan Rp 500.000 - Kategori: Penumpang"
- Output: "✅ Transaksi berhasil disimpan. Saldo hari ini: Rp 500.000"

**Error Case:**
- Input: "Pemasukan Rp ABC" (invalid)
- Output: "⚠️ Jumlah tidak valid. Masukkan angka."

---

## 7. Metrik Keberhasilan

- [ ] User bisa mencatat transaksi dalam maksimal 3 langkah
- [ ] Waktu loading dashboard < 2 detik
- [ ] Data transaksi tersimpan secara persistent (tidak hilang saat reload)
- [ ] Laporan harian akurat 100% dengan perhitungan manual

---

## 8. Batasan & Asumsi

**Asumsi:**
- User memiliki smartphone dengan browser modern
- User familiar dengan operasi dasar smartphone
- User bekerja di Indonesia (currency: IDR)

**Batasan:**
- Versi 1.0 hanya support single user (tidak ada multi-user)
- Data disimpan lokal atau cloud storage (TBD di CONSTITUTION)
- Tidak ada fitur offline-first di versi awal

---

## 💡 Tips Melengkapi PRD

Gunakan prompt iteratif dengan Perplexity:

1. *"Bantu saya lengkapi bagian Visi Produk untuk aplikasi Driver Financial Manager. Fokus pada value proposition yang jelas."*
2. *"Breakdown fitur-fitur utama dengan prioritas MoSCoW untuk aplikasi manajemen keuangan driver."*
3. *"Buatkan user flow lengkap untuk fitur pencatatan transaksi harian."*
4. *"Review PRD ini, cari kelemahan, ambiguitas, atau hal yang belum terdefinisi."*
5. *"Tambahkan NON-Goals yang relevan untuk menghindari scope creep."*

---

**Status:** 📝 Template - Perlu dilengkapi di Fase 1