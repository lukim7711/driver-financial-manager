import { useState } from 'react'
import { apiClient } from '../lib/api'
import { generateCsv, downloadCsv } from '../lib/csv-export'
import { useToast } from './Toast'

interface Transaction {
  created_at: string
  type: string
  category: string
  amount: number
  note: string
  source: string
}

interface DailyReportData {
  transactions: Transaction[]
}

interface ExportCsvButtonProps {
  mode: 'daily' | 'weekly'
  date: string
  weekStart?: string
  weekEnd?: string
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function ExportCsvButton({
  mode,
  date,
  weekStart,
  weekEnd,
}: ExportCsvButtonProps) {
  const toast = useToast()
  const [exporting, setExporting] = useState(false)

  const handleExportDaily = async () => {
    const res = await apiClient<DailyReportData>(
      `/api/report/daily?date=${date}`
    )
    if (!res.success || !res.data) {
      toast.error(res.error ?? 'Gagal export')
      return
    }
    const txs = res.data.transactions
    if (txs.length === 0) {
      toast.error('Tidak ada transaksi untuk diexport')
      return
    }
    const csv = generateCsv(txs)
    downloadCsv(csv, `laporan-harian-${date}.csv`)
    toast.success(`${txs.length} transaksi diexport`)
  }

  const handleExportWeekly = async () => {
    const start = weekStart ?? date
    const end = weekEnd ?? addDays(start, 6)
    const allTxs: Transaction[] = []

    let current = start
    while (current <= end) {
      const res = await apiClient<DailyReportData>(
        `/api/report/daily?date=${current}`
      )
      if (res.success && res.data) {
        allTxs.push(...res.data.transactions)
      }
      current = addDays(current, 1)
    }

    if (allTxs.length === 0) {
      toast.error('Tidak ada transaksi untuk diexport')
      return
    }
    const csv = generateCsv(allTxs)
    downloadCsv(csv, `laporan-mingguan-${start}.csv`)
    toast.success(`${allTxs.length} transaksi diexport`)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      if (mode === 'daily') {
        await handleExportDaily()
      } else {
        await handleExportWeekly()
      }
    } catch {
      toast.error('Gagal export CSV')
    }
    setExporting(false)
  }

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={exporting}
      className="tap-highlight-none flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-medium text-white transition-all active:scale-95 disabled:opacity-50"
    >
      {exporting ? (
        <>{' \u23f3 Mengexport...'}</>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Export CSV
        </>
      )}
    </button>
  )
}
