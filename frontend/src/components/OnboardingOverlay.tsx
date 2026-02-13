interface OnboardingStep {
  emoji: string
  title: string
  description: string
  tip: string
}

const STEPS: OnboardingStep[] = [
  {
    emoji: '\ud83d\udc4b',
    title: 'Selamat Datang!',
    description:
      'Ini dashboard keuangan harian kamu sebagai driver ojol.',
    tip: 'Pantau pemasukan, pengeluaran, dan hutang dalam satu layar.',
  },
  {
    emoji: '\u2795',
    title: 'Catat Transaksi',
    description:
      'Tap tombol + di bawah untuk catat pemasukan atau pengeluaran.',
    tip: 'Pilih kategori, ketik nominal, selesai dalam 4 tap!',
  },
  {
    emoji: '\ud83d\udcf7',
    title: 'Scan Struk',
    description:
      'Foto struk belanja, nominal & kategori otomatis terisi.',
    tip: 'Akses dari halaman Catat \u2192 tombol kamera.',
  },
  {
    emoji: '\ud83d\udcb3',
    title: 'Kelola Hutang',
    description:
      'Catat semua cicilan, pantau jadwal, bayar langsung dari sini.',
    tip: '3 mode: Cicilan, Sekali Bayar, atau Catat Saja.',
  },
  {
    emoji: '\ud83d\udcca',
    title: 'Lihat Laporan',
    description:
      'Ringkasan harian & mingguan lengkap dengan breakdown kategori.',
    tip: 'Geser tanggal untuk lihat hari lain.',
  },
]

interface OnboardingOverlayProps {
  isOpen: boolean
  step: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

export function OnboardingOverlay({
  isOpen,
  step,
  onNext,
  onPrev,
  onClose,
}: OnboardingOverlayProps) {
  if (!isOpen) return null

  const totalSteps = STEPS.length
  const isLast = step >= totalSteps - 1
  const current = STEPS[step]

  if (!current) {
    onClose()
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* Progress dots */}
        <div className="mb-4 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={`dot-${i}`}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-emerald-500'
                  : i < step
                    ? 'w-2 bg-emerald-300'
                    : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Emoji */}
        <div className="mb-3 text-center text-5xl">
          {current.emoji}
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          {current.title}
        </h2>

        {/* Description */}
        <p className="mb-3 text-center text-sm text-gray-600">
          {current.description}
        </p>

        {/* Tip box */}
        <div className="mb-5 rounded-lg bg-emerald-50 px-3 py-2">
          <p className="text-center text-xs text-emerald-700">
            {'\ud83d\udca1'} {current.tip}
          </p>
        </div>

        {/* Step counter */}
        <p className="mb-4 text-center text-xs text-gray-400">
          {step + 1} / {totalSteps}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={onPrev}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all active:scale-95"
            >
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-400 transition-all active:scale-95"
            >
              Lewati
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? onClose : onNext}
            className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white shadow transition-all active:scale-95"
          >
            {isLast ? 'Mulai!' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  )
}
