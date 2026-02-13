# F-F05: Export CSV

> Status: ✅ DONE
> Priority: Post-MVP (Future Feature #1)

## Overview

User bisa export data transaksi ke file CSV dari halaman Laporan.
CSV bisa dibuka di Excel, Google Sheets, atau app spreadsheet lainnya.

## User Flow

1. Buka halaman Laporan
2. Pilih tab Harian atau Mingguan
3. Tap tombol "📥 Export CSV"
4. Browser download file `.csv`
5. Buka di Excel/Google Sheets

## CSV Format

### Harian
- Filename: `laporan-harian-YYYY-MM-DD.csv`
- Columns: Tanggal, Waktu, Tipe, Kategori, Nominal, Catatan, Sumber

### Mingguan
- Filename: `laporan-mingguan-YYYY-MM-DD.csv`
- Columns: Tanggal, Waktu, Tipe, Kategori, Nominal, Catatan, Sumber
- Includes all transactions from Monday to Sunday

## Technical

- CSV generated client-side (no new API endpoint needed)
- Uses existing `/api/report/daily` and `/api/report/weekly` data
- For weekly, fetches 7 days of daily reports to get full transaction list
- Uses Blob + URL.createObjectURL for download
- BOM header for Excel compatibility with Indonesian characters

## Acceptance Criteria

- [ ] Tombol Export CSV muncul di tab Harian
- [ ] Tombol Export CSV muncul di tab Mingguan
- [ ] File CSV ter-download dengan nama yang benar
- [ ] CSV bisa dibuka di Excel/Google Sheets tanpa error encoding
- [ ] Semua transaksi tercakup dalam CSV
