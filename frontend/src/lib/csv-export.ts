interface CsvTransaction {
  created_at: string
  type: string
  category: string
  amount: number
  note: string
  source: string
}

const TYPE_LABELS: Record<string, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  debt_payment: 'Bayar Hutang',
}

const CATEGORY_LABELS: Record<string, string> = {
  order: 'Order',
  tips: 'Tips',
  bonus: 'Bonus',
  insentif: 'Insentif',
  bbm: 'BBM',
  makan: 'Makan',
  rokok: 'Rokok',
  pulsa: 'Pulsa',
  rt: 'Rumah Tangga',
  parkir: 'Parkir',
  service: 'Service',
  lainnya: 'Lainnya',
  lainnya_masuk: 'Lainnya (Masuk)',
  lainnya_keluar: 'Lainnya (Keluar)',
}

function escapeCell(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n')
  ) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return isoStr.slice(0, 10)
  }
}

export function generateCsv(
  transactions: CsvTransaction[]
): string {
  const header = [
    'Tanggal',
    'Waktu',
    'Tipe',
    'Kategori',
    'Nominal',
    'Catatan',
    'Sumber',
  ].join(',')

  const rows = transactions.map((tx) => {
    const cells = [
      escapeCell(formatDate(tx.created_at)),
      escapeCell(formatTime(tx.created_at)),
      escapeCell(
        TYPE_LABELS[tx.type] ?? tx.type
      ),
      escapeCell(
        CATEGORY_LABELS[tx.category] ?? tx.category
      ),
      String(tx.amount),
      escapeCell(tx.note || '-'),
      escapeCell(
        tx.source === 'ocr' ? 'OCR' : 'Manual'
      ),
    ]
    return cells.join(',')
  })

  return [header, ...rows].join('\n')
}

export function downloadCsv(
  csvContent: string,
  filename: string
): void {
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
