# 👤 USER-GUIDE
# Panduan Membangun Aplikasi dengan AI

> **Untuk siapa:** Kamu — yang punya ide aplikasi tapi bukan programmer.  
> **Tujuan:** Memandu langkah demi langkah, dari ide → docs → aplikasi jadi.

---

## Cara Kerja Framework Ini

Kamu tidak akan menulis kode. Yang kamu lakukan:

1. **Jelaskan** ide aplikasimu ke AI melalui diskusi
2. **Validasi** dokumen yang AI hasilkan — pastikan sesuai keinginanmu
3. **Perintahkan** AI membangun berdasarkan dokumen tersebut

Kekuatan framework ini: **semakin matang dokumen, semakin akurat hasilnya.** Dokumen yang buruk → aplikasi yang tidak sesuai harapan.

---

## FASE 0: Membuat Dokumen (Sebelum Build)

### Aturan Penting

- Buat dokumen **satu per satu, berurutan** — jangan loncat
- **Jangan lanjut** ke dokumen berikutnya sebelum kamu PAHAM dokumen saat ini
- Jika ada yang tidak kamu mengerti, TANYA ke AI — itu bukan kelemahan, itu bagian dari proses
- Semua dokumen dibuat melalui **diskusi** — bukan AI langsung generate tanpa input kamu

---

### Step 1: Buat PRD.md (Rencana Produk)

**Apa ini:** Dokumen yang menjelaskan APA yang kamu bangun, UNTUK SIAPA, dan KENAPA.

**Cara diskusi dengan AI:**

Jelaskan ke AI hal-hal berikut (tidak harus formal, pakai bahasamu):

1. "Saya mau buat aplikasi untuk ___" (tujuan)
2. "Yang pakai aplikasi ini adalah ___" (siapa usernya)
3. "Masalah yang mau diselesaikan: ___" (problem)
4. "Fitur yang saya mau: ___" (list fitur, boleh kasar)
5. "Saya mau pakai di HP/laptop/keduanya" (platform)
6. "Budget saya: gratis / berbayar ___" (constraint)

**Contoh kalimat pembuka:**

> "Saya mau buat aplikasi catatan keuangan pribadi. Saya driver ojol, butuh yang cepat input pakai HP, bisa tracking hutang, dan lihat laporan harian. Harus gratis. Buatkan PRD-nya."

**Setelah AI generate PRD, periksa:**

- [ ] Apakah deskripsi aplikasi sesuai yang kamu bayangkan?
- [ ] Apakah daftar fitur sudah lengkap? Ada yang kurang/berlebih?
- [ ] Apakah prioritas fitur benar? (MUST = harus ada, SHOULD = bagus kalau ada, FUTURE = nanti saja)
- [ ] Apakah user flow masuk akal? (coba bayangkan kamu pakai aplikasinya)
- [ ] Apakah ada istilah yang tidak kamu mengerti? TANYA.

**Kapan Step 1 selesai:**

Kamu bisa menjelaskan ulang aplikasimu ke orang lain **tanpa melihat dokumen** — artinya kamu sudah paham.

---

### Step 2: Buat ARCHITECTURE.md (Arsitektur Teknis)

**Apa ini:** Dokumen teknis — teknologi apa yang dipakai, struktur folder, API, database. **Ini tugas AI**, kamu hanya validasi.

**Cara diskusi dengan AI:**

> "Berdasarkan PRD yang sudah kita buat, buatkan ARCHITECTURE.md. Pilihkan teknologi yang paling cocok. Jelaskan ke saya kenapa memilih teknologi itu."

**Yang PERLU kamu pahami (surface level):**

- [ ] Teknologi apa yang dipilih dan KENAPA (AI harus jelaskan dalam bahasa sederhana)
- [ ] Berapa biaya? (gratis atau bayar)
- [ ] Di mana aplikasi akan di-host?

**Yang TIDAK PERLU kamu pahami detail:**

- Struktur folder (AI yang atur saat build)
- API endpoint list (teknis, AI yang pakai)
- Database schema (teknis, AI yang pakai)

**Kapan Step 2 selesai:**

Kamu bisa jawab: "Aplikasi saya pakai teknologi X karena Y, di-host di Z, dan gratis/bayar ___."

---

### Step 3: Buat CONSTITUTION.md (Aturan Main)

**Apa ini:** Aturan yang HARUS diikuti AI selama membangun. Pendek dan tegas.

**Cara diskusi dengan AI:**

> "Buatkan CONSTITUTION.md — aturan kode dan workflow untuk proyek ini. Ikuti template framework."

**Yang PERLU kamu pahami:**

- [ ] Aturan branch & PR (bagaimana kode masuk ke produksi)
- [ ] Aturan commit message (format pesan perubahan)
- [ ] Ada aturan yang kamu mau tambah sendiri? Misal: "semua teks harus Bahasa Indonesia"

**Kapan Step 3 selesai:**

File pendek (~3-4 KB), berisi hanya ATURAN — bukan penjelasan teknologi atau arsitektur.

---

### Step 4: Buat Feature Specs (Satu per Satu!)

**Apa ini:** Dokumen detail untuk SETIAP fitur. 1 fitur = 1 file.

**Cara diskusi dengan AI:**

Mulai dari fitur prioritas MUST yang paling inti:

> "Buatkan spec untuk fitur F001 [nama fitur] berdasarkan PRD. Saya mau tahu: apa yang user lakukan, apa yang sistem lakukan, tampilan seperti apa, dan bagaimana cara mengujinya."

**Untuk SETIAP feature spec, periksa:**

- [ ] Apakah alur user sudah benar? (bayangkan kamu pakai)
- [ ] Apakah tampilan yang dijelaskan sesuai harapan?
- [ ] Apakah ada kasus khusus yang belum ditangani? (contoh: "kalau inputnya kosong, gimana?")
- [ ] Apakah acceptance criteria jelas? (bagaimana tahu fitur ini "berhasil")

> ⚠️ **PENTING:** Jangan buat semua spec sekaligus! Satu spec → pahami → validasi → baru lanjut spec berikutnya.

**Urutan yang disarankan:**

1. Fitur yang berdiri sendiri (tidak bergantung fitur lain)
2. Fitur inti yang jadi fondasi
3. Fitur tambahan yang bergantung pada fitur inti

**Kapan Step 4 selesai:**

Setiap fitur MUST sudah punya spec, dan kamu paham setiap spec. Fitur SHOULD/FUTURE boleh belum ada spec-nya.

---

### Step 5: Generate AI-BRIEFING.md

**Apa ini:** Peta navigasi untuk AI. File ini di-generate otomatis oleh AI berdasarkan semua dokumen sebelumnya.

**Cara minta ke AI:**

> "Semua docs sudah siap. Generate AI-BRIEFING.md — peta navigasi berdasarkan semua file docs yang sudah kita buat."

**Periksa:**

- [ ] Apakah semua file docs tercantum di peta dokumen?
- [ ] Apakah ringkasan proyek akurat?
- [ ] File ini HARUS pendek (< 4 KB) — jika lebih, ada yang salah

**Kapan Step 5 selesai:**

File sudah di-generate, ringkas, dan menjadi pointer ke file lain (bukan duplikasi isi file lain).

---

### Step 6: Siapkan PROGRESS.md

**Apa ini:** Tabel tracker yang akan diisi selama build.

**Cara minta ke AI:**

> "Buatkan PROGRESS.md dengan tabel semua fitur dari PRD, status awal ⏳, dan kolom PR kosong."

Hasilnya: tabel kosong yang siap diisi saat build dimulai.

---

### ✅ Checklist Sebelum Mulai Build

Sebelum masuk ke FASE 1 (build), pastikan:

- [ ] `docs/PRD.md` — ada, kamu pahami 100%
- [ ] `docs/ARCHITECTURE.md` — ada, kamu pahami surface level
- [ ] `docs/CONSTITUTION.md` — ada, pendek, berisi aturan saja
- [ ] `docs/features/*.md` — ada untuk setiap fitur MUST
- [ ] `docs/AI-BRIEFING.md` — ada, ringkas, pointer-based
- [ ] `docs/PROGRESS.md` — ada, tabel kosong siap diisi

Jika semua ✅ → siap build!

---

## FASE 1: Build (Membangun Aplikasi)

### Setup Awal

Masukkan instruksi ke SPACE/Custom Instructions Perplexity:

> "Kamu adalah AI developer. Sebelum mulai kerja, SELALU baca docs/AI-BRIEFING.md untuk orientasi. Ikuti aturan di docs/CONSTITUTION.md. Ikuti spec di docs/features/. Juga baca docs/AI-GUIDE.md sebagai panduan kerjamu."

### Per Sesi Build

Setiap sesi, katakan ke AI:

> "Kita akan build fitur [F001 nama fitur]. Baca spec-nya di docs/features/F001-xxx.md. Buat branch, koding, dan PR."

Setelah fitur selesai (CI/CD pass):

> "Fitur selesai. Update PROGRESS.md (status ✅ + link PR) dan tambahkan session log di SESSION-LOG.md."

### Jika Muncul Fitur Baru (Tidak Ada di Docs)

JANGAN langsung build. Ikuti mini-pipeline:

1. "Buatkan spec dulu di docs/features/Fxxx-nama.md"
2. Baca dan validasi spec
3. "OK, sekarang build fitur ini"

### Jika Ada Bug

> "Ada bug: [jelaskan]. Buat branch fix/, perbaiki, dan PR ke main. Catat di SESSION-LOG.md."

---

## Tips dari Pengalaman Nyata

1. **Jangan terburu-buru skip docs** — 1 jam di docs menghemat 5 jam debugging saat build
2. **Kalau AI generate sesuatu yang tidak kamu mengerti, TANYA** — jangan asal OK
3. **1 sesi = 1 fitur** — jangan campur banyak fitur dalam 1 sesi
4. **Validasi dengan membayangkan** — "kalau saya tekan tombol ini, apa yang terjadi?" — jika tidak bisa jawab, spec belum matang
5. **Fitur baru = spec dulu** — walau "fitur kecil", tetap buat spec minimal
