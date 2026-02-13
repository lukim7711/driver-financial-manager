# 📋 Product Requirements Document (PRD)
# Driver Financial Manager

> Versi: 1.1 | Tanggal: 2026-02-13 | Status: Active

---

## 1. Visi Produk

**Driver Financial Manager** adalah aplikasi web manajemen keuangan yang membantu driver transportasi online (Gojek, Grab, taxi, dll) untuk mencatat dan mengelola keuangan operasional harian mereka sehingga memiliki visibilitas penuh terhadap profit bersih, dapat mengidentifikasi pola pengeluaran, dan membuat keputusan bisnis yang lebih baik untuk meningkatkan pendapatan.

**Value Proposition:**
- Pencatatan transaksi yang cepat dan sederhana (< 30 detik per transaksi)
- Visibilitas real-time terhadap profit bersih harian
- Analisis pengeluaran per kategori untuk identifikasi pemborosan
- Data terstruktur untuk perencanaan keuangan jangka panjang

**Problem Statement:**
Driver transportasi online menghadapi kesulitan melacak profit bersih harian karena pencatatan manual yang tidak konsisten, pencampuran uang pribadi dengan operasional, dan ketidakmampuan menganalisis pola pengeluaran untuk optimasi.

---

## 2. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama | Pain Point |
|---------|-----------|-----------------|------------|
| **Driver Solo Online** | Driver Gojek/Grab yang bekerja mandiri, usia 25-45 tahun, pendapatan Rp 3-7 juta/bulan | - Tracking profit bersih harian<br>- Monitoring efisiensi BBM<br>- Perencanaan target pendapatan | - Tidak tahu berapa profit sebenarnya setelah potong bensin & makan<br>- Uang operasional tercampur dengan uang pribadi<br>- Lupa mencatat pengeluaran kecil yang akumulatif besar |
| **Driver Sewa Kendaraan** | Driver yang menyewa mobil/motor untuk ojol, harus bayar sewa harian/mingguan | - Tracking apakah profit > biaya sewa<br>- Monitoring konsistensi pendapatan<br>- Perhitungan ROI per hari kerja | - Tidak yakin apakah masih untung setelah bayar sewa<br>- Kesulitan memutuskan apakah lanjut sewa atau berhenti<br>- Tidak ada data untuk negosiasi harga sewa |
| **Driver Koordinator Tim** | Driver yang koordinasi 2-5 driver lain dalam armada kecil | - Tracking pendapatan tim<br>- Perbandingan performa antar driver<br>- Pelaporan ke pemilik kendaraan | - Manual consolidate data dari banyak driver<br>- Tidak ada standar format pencatatan<br>- Kesulitan buat laporan mingguan/bulanan |

**Primary Persona:** Driver Solo Online (70% target user)

---

## 3. Daftar Fitur (Prioritas MoSCoW)

### MUST (MVP - Wajib ada di v1.0)

| ID | Fitur | Deskripsi Lengkap | Acceptance Criteria |
|----|-------|-------------------|---------------------|
| **F001** | **Pencatatan Transaksi** | User dapat mencatat transaksi pemasukan (dari penumpang, bonus, insentif) dan pengeluaran (BBM, makan, parkir, dll) dengan jumlah, kategori, dan catatan opsional. Sistem menyimpan timestamp otomatis. | - Form input dengan field: jenis (pemasukan/pengeluaran), jumlah (numeric), kategori (dropdown), catatan (optional)<br>- Validasi: jumlah harus angka > 0<br>- Auto-save timestamp<br>- Feedback konfirmasi setelah save<br>- Data persisten setelah refresh |
| **F002** | **Kategori Pengeluaran** | Sistem menyediakan kategori pengeluaran predefined: BBM, Makan/Minum, Parkir, Service/Maintenance, Cuci, Lain-lain. Setiap transaksi harus memilih kategori. Data dapat difilter dan dikelompokkan per kategori. | - Dropdown kategori saat input transaksi<br>- Kategori tidak bisa kosong untuk pengeluaran<br>- Sistem bisa group dan sum per kategori<br>- Tampilan breakdown per kategori di dashboard |
| **F003** | **Laporan Harian** | Dashboard menampilkan ringkasan harian: total pemasukan, total pengeluaran, profit bersih, dan breakdown pengeluaran per kategori. User dapat switch tanggal untuk lihat history. | - Dashboard default tampilkan data hari ini<br>- Tampilkan: total pemasukan (hijau), total pengeluaran (merah), profit bersih (biru)<br>- Chart/bar sederhana untuk breakdown kategori<br>- Date picker untuk lihat tanggal lain<br>- Loading state < 2 detik |

### SHOULD (Nice to have - v1.1 atau v1.2)

| ID | Fitur | Deskripsi Lengkap | Acceptance Criteria |
|----|-------|-------------------|---------------------|
| **F004** | **Grafik Trend Bulanan** | Visualisasi line chart untuk trend pendapatan, pengeluaran, dan profit dalam 30 hari terakhir. User dapat zoom in/out periode. | - Line chart dengan 3 lines: pemasukan, pengeluaran, profit<br>- X-axis: tanggal, Y-axis: rupiah<br>- Hover untuk detail per hari<br>- Export chart sebagai image |
| **F006** | **Target Harian** | User dapat set target pendapatan harian (misal: Rp 300.000/hari). Dashboard menampilkan progress bar terhadap target. | - Setting untuk input target<br>- Progress bar visual (0-100%)<br>- Notifikasi jika target tercapai<br>- Historical: berapa hari target tercapai vs tidak |
| **F007** | **Ringkasan Mingguan** | Summary otomatis untuk 7 hari terakhir: rata-rata profit/hari, total profit/minggu, kategori pengeluaran terbesar. | - Auto-generate setiap Minggu malam<br>- Tampilkan insight: "BBM kamu minggu ini 15% lebih tinggi dari minggu lalu"<br>- Archive ringkasan mingguan |

### COULD (Future considerations - v2.0+)

| ID | Fitur | Deskripsi Lengkap | Acceptance Criteria |
|----|-------|-------------------|---------------------|
| **F005** | **Export ke Excel** | User dapat download data transaksi dalam format .xlsx atau .csv untuk periode tertentu. | - Button "Export" dengan pilihan range tanggal<br>- Generate file dengan kolom: tanggal, jenis, kategori, jumlah, catatan<br>- Format currency untuk kolom jumlah |
| **F008** | **Multi-User (Koordinator)** | Koordinator dapat manage data untuk 2-5 driver, switch view antar driver, dan lihat consolidated report. | - Role: Owner vs Driver<br>- Owner dapat add/remove driver<br>- Switch dropdown untuk pilih driver<br>- Consolidated view untuk semua driver |
| **F009** | **Notifikasi Pengeluaran Tinggi** | Alert otomatis jika pengeluaran kategori tertentu melebihi threshold (misal: BBM > Rp 150k/hari). | - Setting threshold per kategori<br>- Push notification atau in-app banner<br>- History alert |

### WON'T (Explicitly excluded)

| ID | Fitur | Reason |
|----|-------|--------|
| **F-X01** | Integrasi Bank/E-wallet | Kompleksitas tinggi, perlu API partnership, privacy concern |
| **F-X02** | Pembayaran/Top-up dalam App | Memerlukan payment gateway, licensing, compliance |
| **F-X03** | Social/Community Features | Bukan focus utama, bisa distract dari core value |
| **F-X04** | Pajak/Accounting Compliance | Butuh expertise legal/accounting yang di luar scope |

---

## 4. NON-Goals (Batasan Scope)

1. **Aplikasi ini TIDAK akan mengelola pembayaran pajak atau aspek legal/compliance**
   - Rationale: Memerlukan expertise hukum dan akan membuat aplikasi terlalu kompleks untuk MVP

2. **Aplikasi ini TIDAK mendukung multi-currency atau transaksi internasional**
   - Rationale: Target user adalah driver lokal Indonesia (IDR only)

3. **Tidak ada fitur social/sharing/community di versi ini**
   - Rationale: Focus pada utility tools, bukan social platform

4. **Tidak ada integrasi dengan bank/fintech untuk auto-tracking**
   - Rationale: Kompleksitas API integration, privacy/security concern, tidak feasible untuk MVP

5. **Tidak ada fitur peminjaman/kredit/hutang antar driver**
   - Rationale: Financial service memerlukan licensing dan regulatory compliance

6. **Tidak ada fitur offline-first atau sync di v1.0**
   - Rationale: Menambah kompleksitas teknis, bisa di v2.0

7. **Tidak ada mobile native app (iOS/Android) di v1.0**
   - Rationale: Web responsive sudah cukup untuk MVP, native app untuk future

8. **Tidak ada fitur reminder/notification otomatis untuk catat transaksi**
   - Rationale: Butuh permission management, bisa annoying, untuk future consideration

---

## 5. User Flow Utama

### Flow 1: Onboarding Pertama Kali (First-time User)

1. User buka aplikasi pertama kali
2. Sistem tampilkan landing page dengan:
   - Penjelasan singkat: "Catat transaksi, lihat profit bersih"
   - Button "Mulai Gratis"
3. User klik "Mulai Gratis"
4. Sistem redirect ke dashboard (untuk MVP: no auth, single user local storage)
5. Sistem tampilkan tutorial overlay (skippable):
   - "Klik + untuk tambah transaksi"
   - "Lihat ringkasan harian di sini"
6. User dapat langsung mulai input transaksi

**Exit criteria:** User berhasil masuk dashboard

---

### Flow 2: Catat Transaksi Pemasukan

**Pre-condition:** User sudah di dashboard

1. User klik button "+ Tambah Transaksi" (floating action button)
2. Sistem tampilkan modal/form dengan field:
   - Radio button: ⚪ Pemasukan | ⚪ Pengeluaran (default: Pemasukan)
   - Input jumlah: [Rp ______] (numeric keyboard on mobile)
   - Dropdown kategori: [Penumpang | Bonus | Insentif | Lain-lain]
   - Text area catatan: [Optional, max 100 char]
   - Button: [Batal] [Simpan]
3. User pilih "Pemasukan", input "500000", pilih kategori "Penumpang"
4. User klik "Simpan"
5. Sistem validasi:
   - Jumlah harus numeric dan > 0 ✓
   - Kategori tidak boleh kosong ✓
6. Sistem simpan transaksi dengan timestamp otomatis
7. Sistem tutup modal
8. Sistem update dashboard:
   - Total pemasukan hari ini +Rp 500.000
   - Profit bersih +Rp 500.000
   - Transaksi baru muncul di list
9. Sistem tampilkan toast notification: "✅ Transaksi berhasil disimpan"

**Success criteria:** Transaksi tersimpan dan dashboard terupdate

**Error handling:**
- Jika jumlah kosong atau 0: "⚠️ Jumlah harus diisi"
- Jika jumlah bukan angka: "⚠️ Jumlah tidak valid. Masukkan angka."
- Jika kategori kosong: "⚠️ Pilih kategori"
- Jika gagal save (network/storage): "⚠️ Gagal menyimpan. Coba lagi."

---

### Flow 3: Catat Transaksi Pengeluaran

**Pre-condition:** User sudah di dashboard

1. User klik "+ Tambah Transaksi"
2. Sistem tampilkan form
3. User pilih "Pengeluaran", input "50000", pilih kategori "BBM", catatan "Shell Sudirman"
4. User klik "Simpan"
5. Sistem validasi (sama seperti Flow 2)
6. Sistem simpan dengan timestamp
7. Sistem update dashboard:
   - Total pengeluaran hari ini +Rp 50.000
   - Profit bersih -Rp 50.000 (jika sebelumnya ada pemasukan)
   - Breakdown kategori: BBM +Rp 50.000
8. Toast notification: "✅ Pengeluaran tercatat"

**Success criteria:** Pengeluaran tersimpan dan dashboard terupdate

---

### Flow 4: Lihat Laporan Harian

**Pre-condition:** User sudah punya minimal 1 transaksi

1. User buka dashboard (default view: hari ini)
2. Sistem tampilkan ringkasan:
   - **Pemasukan Hari Ini:** Rp 500.000 (hijau)
   - **Pengeluaran Hari Ini:** Rp 150.000 (merah)
   - **Profit Bersih:** Rp 350.000 (biru, bold)
3. Sistem tampilkan breakdown pengeluaran per kategori:
   - BBM: Rp 100.000 (67%)
   - Makan: Rp 30.000 (20%)
   - Parkir: Rp 20.000 (13%)
4. Sistem tampilkan list transaksi (latest first):
   - 18:30 | Pengeluaran | Parkir | -Rp 20.000
   - 14:15 | Pengeluaran | Makan | -Rp 30.000
   - 12:00 | Pemasukan | Penumpang | +Rp 200.000
   - ...
5. User dapat scroll untuk lihat semua transaksi hari ini

**Success criteria:** User dapat melihat summary dan detail transaksi

---

### Flow 5: Lihat History Tanggal Lain

**Pre-condition:** User di dashboard

1. User klik icon calendar atau tanggal di header
2. Sistem tampilkan date picker (kalender)
3. User pilih tanggal kemarin (misal: 12 Feb 2026)
4. Sistem fetch data untuk tanggal yang dipilih
5. Sistem update dashboard dengan data tanggal tersebut:
   - Pemasukan: Rp 450.000
   - Pengeluaran: Rp 180.000
   - Profit: Rp 270.000
   - List transaksi untuk tanggal tersebut
6. User dapat klik "Hari Ini" untuk kembali ke tanggal sekarang

**Success criteria:** User dapat navigate history dan lihat data tanggal lain

---

## 6. Contoh Interaksi Detail

### F001: Pencatatan Transaksi - Happy Paths

**Scenario 1: Catat pemasukan dari penumpang**
- **Input:** Jenis=Pemasukan, Jumlah=500000, Kategori=Penumpang, Catatan="3 penumpang pagi"
- **Output:** 
  - ✅ "Transaksi berhasil disimpan"
  - Dashboard update: Pemasukan +Rp 500.000, Profit +Rp 500.000
  - List transaksi: Entry baru di paling atas dengan timestamp

**Scenario 2: Catat pengeluaran BBM**
- **Input:** Jenis=Pengeluaran, Jumlah=100000, Kategori=BBM, Catatan="Pertamax 10L"
- **Output:**
  - ✅ "Pengeluaran tercatat"
  - Dashboard update: Pengeluaran +Rp 100.000, Profit -Rp 100.000
  - Breakdown kategori: BBM +Rp 100.000

**Scenario 3: Catat pengeluaran tanpa catatan**
- **Input:** Jenis=Pengeluaran, Jumlah=20000, Kategori=Parkir, Catatan="" (kosong)
- **Output:** ✅ Berhasil tersimpan (catatan optional)

### F001: Pencatatan Transaksi - Error Cases

**Error 1: Jumlah kosong**
- **Input:** Jenis=Pemasukan, Jumlah="" (kosong), Kategori=Penumpang
- **Output:** ⚠️ "Jumlah harus diisi" (field jumlah highlight merah)

**Error 2: Jumlah invalid (huruf)**
- **Input:** Jenis=Pemasukan, Jumlah="ABC", Kategori=Penumpang
- **Output:** ⚠️ "Jumlah tidak valid. Masukkan angka."

**Error 3: Jumlah negatif atau 0**
- **Input:** Jenis=Pemasukan, Jumlah=-50000 atau 0
- **Output:** ⚠️ "Jumlah harus lebih dari 0"

**Error 4: Kategori tidak dipilih**
- **Input:** Jenis=Pengeluaran, Jumlah=50000, Kategori="" (tidak pilih)
- **Output:** ⚠️ "Pilih kategori pengeluaran"

**Error 5: Gagal menyimpan (storage full/network error)**
- **Input:** Valid input tapi storage penuh atau network error
- **Output:** ⚠️ "Gagal menyimpan transaksi. Coba lagi."
- **Action:** Data tidak tersimpan, user bisa retry

### F003: Laporan Harian - Edge Cases

**Edge Case 1: Hari ini belum ada transaksi**
- **State:** User buka dashboard, tanggal hari ini, belum ada transaksi
- **Output:**
  - Pemasukan: Rp 0
  - Pengeluaran: Rp 0
  - Profit: Rp 0
  - Empty state: "Belum ada transaksi hari ini. Klik + untuk mulai."

**Edge Case 2: Tanggal history yang tidak ada data**
- **State:** User pilih tanggal 1 minggu lalu yang tidak ada transaksi
- **Output:** 
  - Summary: semua Rp 0
  - Empty state: "Tidak ada transaksi pada tanggal ini"

**Edge Case 3: Pengeluaran lebih besar dari pemasukan (loss)**
- **State:** Pemasukan=Rp 200.000, Pengeluaran=Rp 250.000
- **Output:**
  - Profit: -Rp 50.000 (merah, dengan icon warning)
  - Optional: Hint "Pengeluaran kamu melebihi pemasukan hari ini"

---

## 7. Metrik Keberhasilan (Success Metrics)

### Technical Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Page Load Time | < 2 detik | Google Lighthouse, Real User Monitoring |
| Transaction Save Time | < 500ms | Performance API, backend logging |
| Data Persistence | 100% | No data loss after refresh/reload |
| Mobile Responsive | 100% compatibility | Test on iOS Safari, Android Chrome |
| Input Validation Accuracy | 100% | All invalid inputs rejected, all valid inputs accepted |

### User Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Steps to Record Transaction | ≤ 3 clicks | User flow analysis |
| Time to Record Transaction | < 30 seconds | User testing |
| Dashboard Info Clarity | User dapat menjawab "Berapa profit hari ini?" dalam < 5 detik | User testing |

### Business Metrics (Future, when have analytics)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Daily Active Users | TBD | Analytics |
| Transactions per User per Day | Average 10-20 | Database query |
| User Retention (7-day) | > 40% | Cohort analysis |
| Feature Usage (F001 vs F002 vs F003) | F001 100%, F002 80%, F003 60% | Event tracking |

---

## 8. Batasan & Asumsi

### Asumsi

1. **Device & Browser:**
   - User memiliki smartphone dengan browser modern (Chrome 90+, Safari 14+)
   - Screen size minimum: 360px width (common Android size)
   - Internet connection tersedia (no offline mode di v1.0)

2. **User Behavior:**
   - User familiar dengan operasi dasar smartphone (tap, scroll, input text)
   - User bersedia manual input transaksi (tidak expect auto-capture)
   - User bekerja di Indonesia (currency: IDR, timezone: WIB)

3. **Usage Pattern:**
   - User rata-rata catat 10-20 transaksi per hari
   - User akses aplikasi 2-5 kali per hari
   - User butuh lihat summary harian, bukan real-time monitoring setiap menit

4. **Data Volume:**
   - Maksimal 1000 transaksi per user per bulan (avg 33/hari)
   - Data retention: minimal 3 bulan history
   - Storage per user: < 5MB

### Batasan

1. **Technical Constraints:**
   - Versi 1.0 hanya support single user (tidak ada multi-user/multi-device sync)
   - Data disimpan lokal (localStorage atau cloud storage, TBD di CONSTITUTION)
   - Tidak ada fitur offline-first di versi awal (butuh internet connection)
   - Tidak ada real-time sync antar devices

2. **Feature Constraints:**
   - Kategori pengeluaran predefined (tidak bisa custom di v1.0)
   - Tidak bisa edit/delete transaksi di v1.0 (hanya add)
   - Laporan terbatas pada harian (tidak ada weekly/monthly view di MVP)
   - Tidak ada fitur export/backup di v1.0

3. **Security Constraints:**
   - No authentication di v1.0 (public access, data di device)
   - No encryption untuk data at rest
   - No audit log untuk changes

4. **Scalability Constraints:**
   - MVP didesain untuk support max 100 concurrent users (jika deploy public)
   - No CDN di v1.0
   - No load balancing

5. **Legal/Compliance Constraints:**
   - Tidak ada privacy policy atau terms of service di v1.0 (karena no user data collection)
   - Tidak ada GDPR compliance (karena no personal data stored in backend)
   - Tidak ada financial advice atau tax guidance

---

## 9. Dependencies & Risks

### Technical Dependencies

1. **Browser API:**
   - localStorage untuk data persistence (fallback: sessionStorage)
   - Date API untuk timestamp dan date picker
   - Fetch API untuk future backend integration

2. **External Libraries (TBD di CONSTITUTION):**
   - Chart library untuk F004 (contoh: Chart.js, Recharts)
   - Date picker library (contoh: react-datepicker)
   - UI component library (optional)

### Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **User tidak konsisten input transaksi** | High | High | - Buat UI se-simple mungkin (< 3 clicks)<br>- Future: reminder notification<br>- Edukasi value dari konsistensi tracking |
| **Data loss karena clear browser** | Medium | High | - Warning saat first use: "Data disimpan di device"<br>- Future: cloud backup/export feature<br>- Provide export button sedini mungkin |
| **User expect lebih banyak fitur dari MVP** | Medium | Medium | - Clear communication di landing: "Simple tool untuk tracking harian"<br>- Roadmap transparency |
| **Performance issue dengan banyak data** | Low | Medium | - Pagination untuk list transaksi<br>- Lazy load untuk history<br>- Index untuk date-based query |
| **Browser compatibility issue** | Low | High | - Test di top 3 browsers (Chrome, Safari, Firefox)<br>- Graceful degradation untuk old browsers |
| **User privacy concern** | Low | Medium | - Transparansi: "Data disimpan di device kamu, tidak dikirim ke server"<br>- Future: option untuk cloud with encryption |

---

## 10. Out of Scope (Deferred to Future Versions)

### Deferred to v1.1-1.2
- Edit/delete transaksi yang sudah ada
- Custom kategori pengeluaran
- Weekly/monthly summary view
- Target setting dan progress tracking
- Export ke Excel/CSV

### Deferred to v2.0+
- Multi-user support (koordinator + drivers)
- Cloud sync multi-device
- Authentication (email/phone login)
- Notifikasi otomatis
- Analisis prediktif ("Kamu biasanya habis Rp X untuk BBM per minggu")
- Integration dengan app lain (Gojek API, dll)

### Explicitly Not Planned
- Mobile native app (iOS/Android native)
- Desktop app (Electron)
- Hardware integration (barcode scanner, receipt scanner)
- Blockchain/cryptocurrency tracking
- Social/community features
- Gamification (badges, leaderboard)
- AI-powered recommendation

---

**Document Control:**
- **Created:** 2026-02-13
- **Last Updated:** 2026-02-13
- **Version:** 1.1
- **Status:** Active - Ready for Fase 2 (Tech Stack Selection)
- **Next Review:** After Fase 3 (before development starts)