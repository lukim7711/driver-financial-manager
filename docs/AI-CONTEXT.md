# 🗺️ AI-CONTEXT (Peta Navigasi AI)
# Driver Financial Manager

> CONTEXT_VERSION: "CTX-v1.0-20260213"
> CONTEXT_TRIGGER: "DRIVER-FM-7711"

---

> 🚨 **WAJIB: Sebelum menjawab apapun, AI HARUS:**
> 1. Baca file ini sepenuhnya
> 2. Baca `docs/CONSTITUTION.md`
> 3. Baca `docs/PROGRESS.md`
> 4. Kutip CONTEXT_TRIGGER di awal respons sebagai bukti

---

## Deskripsi Aplikasi

**Driver Financial Manager** adalah aplikasi manajemen keuangan yang membantu driver transportasi mengelola pendapatan dan pengeluaran operasional harian untuk membuat keputusan bisnis yang lebih baik.

---

## Status Saat Ini

> *Update setiap sesi*

- **Fase:** Fase 0 - Setup Repository ✅
- **Fitur selesai:** -
- **Fitur sedang dikerjakan:** -
- **Fitur belum dimulai:** F001, F002, F003, F004, F005
- **Branch aktif:** `main`

---

## 📍 DOCS MAP (Peta Navigasi)

| Jika task adalah... | Baca file ini |
|---------------------|---------------|
| Memahami keseluruhan produk | `docs/PRD.md` |
| Memahami aturan teknis | `docs/CONSTITUTION.md` |
| Mengerjakan fitur F001 | `docs/features/F001-pencatatan-transaksi.md` |
| Mengerjakan fitur F002 | `docs/features/F002-kategori-pengeluaran.md` |
| Mengerjakan fitur F003 | `docs/features/F003-laporan-harian.md` |
| Mengerjakan fitur F004 | `docs/features/F004-grafik-bulanan.md` |
| Mengerjakan fitur F005 | `docs/features/F005-export-excel.md` |
| Melihat keputusan arsitektur | `docs/adr/ADR-001-xxx.md` |
| Melihat progress | `docs/PROGRESS.md` |

---

## Tech Stack Summary

> *Akan diisi setelah CONSTITUTION.md dilengkapi*

[Ringkasan 1 paragraf tentang tech stack pilihan: runtime, bahasa, database, framework, deployment]

---

## File Map (Struktur Kode Saat Ini)

> *Update berkala saat development*

```
src/
├── index.ts          ← Entry point (belum ada)
├── handlers/         ← Handler per fitur (belum ada)
├── services/         ← Business logic (belum ada)
└── models/           ← Type definitions (belum ada)
```

**Status:** Struktur folder belum dibuat, masih dalam fase planning.

---

## Aturan Komunikasi

1. **Selalu kutip CONTEXT_TRIGGER** (`DRIVER-FM-7711`) di awal respons sebagai bukti sudah membaca file ini
2. **Rujuk nomor fitur** (F001, F002, dst) saat diskusi fitur spesifik
3. **Gunakan bahasa Indonesia** untuk komunikasi dengan user
4. **Gunakan bahasa Inggris** untuk kode, commit message, dan dokumentasi teknis
5. **Jangan asumsikan** - jika ada ambiguitas, tanya user
6. **Konfirmasi pemahaman** sebelum eksekusi (Pre-flight Check)

---

## Workflow Standar (Build Loop)

1. **BRIEF** - User jelaskan task
2. **PRE-FLIGHT** - AI restate pemahaman
3. **CONFIRM** - User bilang "GO" / "Lanjut"
4. **BUILD** - AI tulis kode
5. **TEST** - User coba
6. **DOCUMENT** - AI update docs

**Penting:** Jangan skip langkah PRE-FLIGHT. 80% kesalahan bisa dicegah di tahap ini.

---

## 💡 Tentang CONTEXT_TRIGGER

**CONTEXT_TRIGGER** adalah inovasi kunci: string unik (`DRIVER-FM-7711`) yang harus dikutip AI di awal setiap respons, membuktikan bahwa AI benar-benar membaca file ini dan bukan "mengarang".

**Cara verifikasi:**
- ✅ AI mengutip `DRIVER-FM-7711` → AI sudah baca context
- ❌ AI tidak mengutip → AI belum baca, minta baca ulang

---

## Update History

| Tanggal | Versi | Perubahan |
|---------|-------|----------|
| 2026-02-13 | CTX-v1.0 | Initial setup - Fase 0 |

---

**Status:** ✅ Template ready - Akan diupdate di setiap fase development