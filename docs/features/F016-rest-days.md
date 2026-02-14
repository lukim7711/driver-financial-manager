# F016 — Hari Libur (Rest Days)

## Objective

User bisa set hari libur mingguan. Target harian hutang dihitung berdasarkan hari kerja saja, bukan semua hari kalender.

## Business Rules

1. **Rest days** = hari dalam seminggu dimana user biasanya tidak kerja
2. Default: Minggu (day 0)
3. User bisa toggle hari mana saja di Settings
4. Disimpan sebagai comma-separated day numbers: `"0"` = Minggu, `"0,6"` = Minggu + Sabtu
5. Day numbering: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu

## Impact on Calculations

### Target Harian (hari kerja)
```
workingDaysRemaining = countWorkingDays(today+1, targetDate, restDays)
dailyDebt = sisaHutang / workingDaysRemaining
target = budgetHarian + prorateBulanan + dailyDebt
```

### Target Harian (hari libur)
```
target = 0
```
Budget harian & prorate bulanan tetap dihitung (pengeluaran tetap ada).
Tapi target penghasilan = 0.

### Prorate Bulanan
Tetap dibagi SEMUA hari di bulan (tidak berubah). Tagihan tidak peduli hari kerja.

### Surplus
Kalau kerja di hari libur, pemasukan mengurangi sisa hutang → target hari kerja berikutnya turun otomatis. Tidak perlu logika surplus terpisah.

## API Changes

### GET /api/settings
Response tambahan:
```json
{ "rest_days": "0" }
```

### PUT /api/settings
Body:
```json
{ "rest_days": "0,6" }
```

### GET /api/dashboard
Response tambahan di daily_target:
```json
{
  "is_rest_day": true,
  "working_days_remaining": 42,
  "rest_days": [0]
}
```

## UI Changes

### Settings
- Baris baru: "Hari Libur" dengan 7 toggle buttons (Sen-Min)
- Di bawah Target Lunas Hutang

### Home — DailyTarget (hari libur)
- Banner: "🌙 Hari Libur — Istirahat yang cukup!"
- Jika ada pemasukan: "🎉 Bonus +Rp XX.XXX hari ini!"
- Tidak ada progress bar target
- Budget harian tetap tampil

### Home — DailyTarget (hari kerja)
- Label berubah: "💳 Hutang ÷ 42 hari kerja" (bukan "42 hari")

## Acceptance Criteria

- [ ] Settings: toggle 7 hari, default Minggu aktif
- [ ] Dashboard API: is_rest_day flag benar
- [ ] Dashboard API: working_days_remaining exclude rest days
- [ ] DailyTarget: tampilan beda di hari libur vs hari kerja
- [ ] Bonus display jika ada pemasukan di hari libur
