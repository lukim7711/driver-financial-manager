import { formatRupiah } from '../lib/format'

interface Due {
  debt_id: string
  platform: string
  due_date: string
  amount: number
  days_until: number
  urgency: 'overdue' | 'critical' | 'warning' | 'normal'
}

interface DueAlertProps {
  due: Due
}

const URGENCY_STYLES: Record<Due['urgency'], { bg: string; border: string; dot: string; text: string }> = {
  overdue:  { bg: 'bg-red-50',    border: 'border-red-300',    dot: '🔴', text: 'text-red-700' },
  critical: { bg: 'bg-red-50',    border: 'border-red-200',    dot: '🔴', text: 'text-red-600' },
  warning:  { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: '🟡', text: 'text-yellow-700' },
  normal:   { bg: 'bg-gray-50',   border: 'border-gray-200',   dot: '⚪',  text: 'text-gray-600' },
}

function formatDueLabel(daysUntil: number): string {
  if (daysUntil < 0) return `${Math.abs(daysUntil)} HARI TERLAMBAT!`
  if (daysUntil === 0) return 'HARI INI!'
  if (daysUntil === 1) return 'BESOK!'
  return `${daysUntil} hari lagi`
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function DueAlert({ due }: DueAlertProps) {
  const style = URGENCY_STYLES[due.urgency]

  return (
    <div className={`rounded-xl ${style.bg} border ${style.border} p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{style.dot}</span>
          <span className={`text-sm font-semibold ${style.text}`}>
            {due.platform}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatShortDate(due.due_date)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">
          {formatRupiah(due.amount)}
        </span>
        <span className={`text-xs font-semibold ${style.text}`}>
          {formatDueLabel(due.days_until)}
        </span>
      </div>
    </div>
  )
}
