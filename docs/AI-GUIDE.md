# 🤖 AI-GUIDE
# Panduan untuk AI dalam Membuat Dokumen & Membangun Aplikasi

> **Untuk siapa:** AI assistant yang membantu user membangun aplikasi.  
> **Konteks:** User kemungkinan bukan programmer. Komunikasi harus jelas, sabar, dan step-by-step.

---

## Prinsip Utama

1. **Spec-Driven** — Tidak ada kode tanpa dokumen. Jika belum ada spec, buat spec dulu.
2. **User harus paham** — Jangan generate dokumen tanpa diskusi. Tanya dulu, tulis kemudian.
3. **Setiap file punya batas** — Jangan mencampur isi antar file docs. Setiap file punya peran spesifik.
4. **Update minimal** — Saat update docs, ubah HANYA bagian yang berubah. Jangan tulis ulang seluruh file.
5. **Jangan asumsi** — Jika user belum menjelaskan sesuatu, TANYA. Jangan isi dengan asumsi.

---

## FASE 0: Membuat Dokumen

### Urutan Wajib

```
Step 1: PRD.md
Step 2: ARCHITECTURE.md  (butuh input dari PRD)
Step 3: CONSTITUTION.md  (butuh input dari ARCHITECTURE)
Step 4: features/*.md    (butuh input dari PRD + ARCHITECTURE)
Step 5: AI-BRIEFING.md   (generated dari semua file di atas)
Step 6: PROGRESS.md      (generated dari PRD fitur list)
```

JANGAN loncat urutan. JANGAN buat 2 file sekaligus.

---

### Step 1: Membuat PRD.md

**Sebelum menulis, TANYAKAN ke user:**

1. "Aplikasi ini untuk apa? Ceritakan masalah yang mau diselesaikan."
2. "Siapa yang akan pakai? Jelaskan kebiasaan usernya."
3. "Fitur apa saja yang kamu bayangkan? List semua, nanti kita prioritaskan."
4. "Di platform apa? HP saja, laptop, atau keduanya?"
5. "Ada batasan budget? Harus gratis, atau boleh bayar?"
6. "Ada data nyata yang bisa jadi studi kasus?" (opsional tapi sangat membantu)

**Format PRD.md:**

```
1. Product Vision (ringkasan, problem, value proposition)
2. Studi Kasus (jika ada data nyata — sangat memperkuat spec)
3. User Persona (siapa user, kebiasaan, pain points)
4. Fitur
   4.1 MUST — fitur inti, harus ada di versi pertama
   4.2 SHOULD — penting tapi bisa ditunda
   4.3 FUTURE — ide untuk pengembangan ke depan
   4.4 NON-Goals — apa yang BUKAN tujuan aplikasi ini
5. User Interface
   5.1 Prinsip desain
   5.2 Daftar layar
   5.3 User flow per fitur utama
6. Technical Constraints (budget, platform, performa)
7. Success Metrics (bagaimana mengukur keberhasilan)
8. Assumptions & Risks
```

**Aturan:**

- JANGAN masukkan nama teknologi (itu di ARCHITECTURE)
- JANGAN masukkan database schema (itu di ARCHITECTURE)
- JANGAN masukkan API endpoints (itu di ARCHITECTURE)
- Gunakan bahasa yang user pahami — hindari jargon teknis
- Fitur MUST idealnya 5-10 item (lebih dari itu, scope terlalu besar)

**Setelah generate, TANYAKAN:**

> "Apakah deskripsi ini sesuai bayangan kamu? Ada fitur yang kurang atau berlebihan? Ada bagian yang tidak kamu mengerti?"

**Kriteria selesai:** User bisa menjelaskan ulang aplikasinya tanpa melihat dokumen.

---

### Step 2: Membuat ARCHITECTURE.md

**Sebelum menulis, JELASKAN ke user:**

> "Sekarang saya akan pilihkan teknologi terbaik berdasarkan kebutuhan di PRD. Saya akan jelaskan kenapa memilih setiap teknologi dalam bahasa sederhana."

**Format ARCHITECTURE.md:**

```
1. Tech Stack
   - Tabel: Layer | Teknologi | Kenapa Dipilih (bahasa simple)
   - Justifikasi keputusan kunci (tiap teknologi utama)
2. Project Structure
   - Folder tree lengkap
   - Penjelasan setiap folder/file utama
3. API Contract
   - Tabel: Method | Path | Deskripsi
   - Request/Response format standar
4. Data Model
   - Tabel database + field + tipe + deskripsi
   - Relasi antar tabel
5. Deployment Architecture
   - Di mana frontend di-host
   - Di mana backend di-host
   - Environment variables yang dibutuhkan
```

**Aturan:**

- JANGAN masukkan code rules (itu di CONSTITUTION)
- JANGAN masukkan git workflow (itu di CONSTITUTION)
- Justifikasi teknologi harus dalam bahasa yang user pahami
- Jika ada alternatif, jelaskan kenapa TIDAK memilih alternatif tersebut

**Setelah generate, TANYAKAN:**

> "Saya pilih [teknologi X] karena [alasan]. Apakah ini masuk akal? Ada preferensi tertentu yang kamu punya?"

**Kriteria selesai:** User bisa jawab "aplikasi saya pakai X karena Y."

---

### Step 3: Membuat CONSTITUTION.md

**Format CONSTITUTION.md:**

```
1. Code Rules
   - Bahasa pemrograman + mode (strict/lenient)
   - Formatting & linting
   - Larangan (no any, no console.log, dll)
2. Frontend Rules (jika ada frontend)
   - Pattern komponen
   - State management approach
   - Styling approach
3. Backend Rules (jika ada backend)
   - Route pattern
   - Error handling standard
   - Validation approach
4. Database Rules
   - Konvensi tipe data
   - Soft delete vs hard delete
   - Timestamp format
5. Git Workflow
   - Branch strategy (main, feat/, fix/, docs/)
   - Commit convention
   - PR rules
6. Security Rules
   - Authentication approach
   - Input validation
   - Secret management
```

**Aturan:**

- JANGAN masukkan tech stack (itu di ARCHITECTURE)
- JANGAN masukkan folder structure (itu di ARCHITECTURE)
- JANGAN masukkan API endpoints (itu di ARCHITECTURE)
- File ini harus PENDEK (target < 4 KB)
- Setiap item adalah ATURAN, bukan deskripsi

**Kriteria selesai:** Setiap item bisa diawali dengan "HARUS" atau "TIDAK BOLEH".

---

### Step 4: Membuat Feature Specs

Untuk SETIAP fitur MUST di PRD, buat file terpisah.

**Sebelum menulis SETIAP spec, TANYAKAN:**

> "Untuk fitur [nama], ceritakan: apa yang user lakukan step-by-step? Ada kasus khusus yang perlu ditangani?"

**Format `features/Fxxx-nama-fitur.md`:**

```
1. Overview (1-2 kalimat)
2. User Story ("Sebagai [user], saya ingin [aksi], agar [manfaat]")
3. User Flow (step-by-step apa yang user lakukan)
4. UI Description (tampilan layar, komponen, layout)
5. Technical Implementation
   5.1 API endpoints yang dibutuhkan
   5.2 Database changes (jika ada)
   5.3 Business logic
6. Acceptance Criteria (checklist: kapan fitur dianggap selesai)
7. Edge Cases (kasus khusus + bagaimana menanganinya)
8. Dependencies (fitur lain yang harus selesai dulu)
```

**Aturan:**

- SATU fitur per file — JANGAN gabung
- Merujuk ke PRD (fitur APA) dan ARCHITECTURE (pakai APA)
- Acceptance criteria harus testable (bisa dibuktikan benar/salah)
- TANYAKAN ke user setelah setiap spec selesai

**Urutan pembuatan:**

1. Fitur tanpa dependency (berdiri sendiri)
2. Fitur fondasi (yang jadi dasar fitur lain)
3. Fitur yang bergantung pada fitur di atas

**Kriteria selesai:** User bisa membayangkan menggunakan fitur ini secara detail.

---

### Step 5: Generate AI-BRIEFING.md

Generate otomatis — JANGAN tanya user banyak pertanyaan.

**Format AI-BRIEFING.md:**

```
1. Ringkasan Proyek (2-3 kalimat dari PRD)
2. Peta Dokumen (tabel: kebutuhan → file mana yang harus dibaca)
3. Peta File Proyek (setiap file/folder + purpose)
4. Aturan yang Sering Dilanggar (5-10 rules kritis, bukan semua rules)
5. Update Protocol (aturan update docs saat build)
```

**Aturan KETAT:**

- JANGAN duplikasi tech stack (pointer ke ARCHITECTURE)
- JANGAN duplikasi architecture diagram (pointer ke ARCHITECTURE)
- JANGAN duplikasi business rules lengkap (hanya "gotcha" list)
- JANGAN duplikasi status/progress (pointer ke PROGRESS)
- JANGAN duplikasi future features (pointer ke PRD)
- Target ukuran: **< 4 KB**
- Jika file > 4 KB, ada section yang harusnya pointer, bukan copy

---

### Step 6: Generate PROGRESS.md

Generate dari daftar fitur PRD.

**Format PROGRESS.md:**

```markdown
## Sesi Terakhir
- Tanggal: [kosong]
- Fase: [kosong]
- Status: ⏳

## Feature Status

### Infrastructure
| ID | Nama | Status | PR |
|----|------|--------|----|
| SETUP | Project Setup | ⏳ | — |

### MVP Features
| ID | Nama | Status | PR |
|----|------|--------|----|
| F001 | [dari PRD] | ⏳ | — |
| F002 | [dari PRD] | ⏳ | — |

### Backlog (SHOULD + FUTURE)
| ID | Nama | Status |
|----|------|--------|
| F0xx | [dari PRD] | ⏳ Backlog |
```

**Aturan:**

- JANGAN masukkan session log (itu di SESSION-LOG.md)
- JANGAN masukkan API registry (itu di ARCHITECTURE.md)
- File ini harus tetap < 4 KB bahkan setelah semua fitur selesai

---

## FASE 1: Build — Aturan Selama Membangun

### Sebelum Setiap Sesi

1. Baca `docs/AI-BRIEFING.md` untuk orientasi
2. Baca spec fitur yang akan di-build: `docs/features/Fxxx.md`
3. Baca `docs/CONSTITUTION.md` untuk aturan

### Saat Build

- Ikuti spec — jika perlu deviasi, JELASKAN ke user dulu
- 1 branch per fitur: `feat/Fxxx-nama-fitur`
- Commit message sesuai convention di CONSTITUTION

### Setelah Fitur Selesai (CI/CD Pass)

Update HANYA file-file berikut:

| File | Apa yang Di-update |
|------|--------------------|
| `PROGRESS.md` | Ubah status ⏳ → ✅, tambah link PR |
| `SESSION-LOG.md` | Append 1 entry baru (di paling atas) |
| `AI-BRIEFING.md` | Tambah baris di File Map HANYA jika ada file baru |

**JANGAN:**

- ❌ Tulis ulang seluruh section di AI-BRIEFING
- ❌ Update ARCHITECTURE.md kecuali ada endpoint/tabel baru
- ❌ Update PRD.md (frozen setelah build dimulai)
- ❌ Update feature spec yang sudah di-build
- ❌ Menambahkan tech stack/architecture ke AI-BRIEFING

### Session Log Format (SESSION-LOG.md)

```markdown
### Session [N] — [tanggal] [waktu] WIB

**Fitur:** [ID + nama]
**Apa yang dikerjakan:** [2-3 kalimat]
**Keputusan teknis:** [jika ada keputusan penting]
**Bug ditemukan:** [jika ada]
**Result:** [PR link atau "pushed to main"]
```

### Fitur Baru yang Muncul Saat Build

Jika user minta fitur yang TIDAK ADA di docs:

1. JANGAN langsung build
2. Buat `docs/features/Fxxx-nama.md` dulu
3. Tunjukkan spec ke user, minta validasi
4. Tambah baris baru di PROGRESS.md
5. Setelah user OK, baru build

### Hotfix / Bug Kecil

Untuk bug kecil yang butuh fix cepat:

1. Buat branch `fix/nama-bug`
2. Fix dan PR ke main
3. Update PROGRESS.md (tambah di section Bugfixes)
4. Append ke SESSION-LOG.md
5. JANGAN update file docs lain

---

## Larangan Keras

1. ❌ JANGAN buat kode tanpa spec (kecuali bugfix)
2. ❌ JANGAN gabung banyak fitur dalam 1 PR (kecuali fitur yang tightly coupled — jelaskan ke user)
3. ❌ JANGAN push langsung ke main (kecuali hotfix kritis — catat alasan di SESSION-LOG)
4. ❌ JANGAN duplikasi informasi antar file docs
5. ❌ JANGAN tulis ulang seluruh file saat update — ubah HANYA bagian yang berubah
6. ❌ JANGAN skip validasi user untuk feature spec baru
7. ❌ JANGAN tambahkan tech stack/architecture/business rules ke AI-BRIEFING — gunakan pointer
