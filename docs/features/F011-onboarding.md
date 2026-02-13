# F011 — Help / Onboarding

## Objective
Bantu user baru memahami fitur-fitur utama app dalam <30 detik.

## Behavior
1. **Auto-show** saat pertama kali buka app (cek `localStorage`)
2. **5 langkah** walkthrough: Home, Catat, OCR, Hutang, Laporan
3. **Skip** kapan saja
4. **Re-trigger** via tombol “?” di BottomNav atau di halaman Settings
5. Tidak memblokir app — overlay transparan, tap untuk next

## Steps
| # | Judul | Deskripsi |
|---|-------|-----------|
| 1 | Selamat Datang! | Ini dashboard keuangan harian kamu |
| 2 | Catat Transaksi | Tap + untuk catat pemasukan/pengeluaran |
| 3 | Scan Struk | Foto struk, otomatis diisi oleh OCR |
| 4 | Kelola Hutang | Pantau cicilan & bayar langsung dari sini |
| 5 | Lihat Laporan | Ringkasan harian & mingguan ada di sini |

## Technical
- Component: `OnboardingOverlay.tsx`
- Hook: `useOnboarding.ts`
- Storage key: `onboarding_completed`
- No backend needed
- No new dependencies

## Acceptance Criteria
- [ ] Overlay muncul otomatis saat pertama kali
- [ ] 5 langkah bisa di-next/prev/skip
- [ ] Setelah selesai, tidak muncul lagi
- [ ] Bisa di-trigger ulang dari Settings atau tombol ?
- [ ] Mobile-first, responsive 360px+
- [ ] Semua teks Bahasa Indonesia
