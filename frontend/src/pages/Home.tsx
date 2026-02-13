import { useState, useEffect } from 'react'
import { BottomNav } from '../components/BottomNav'
import { SummaryCard } from '../components/SummaryCard'
import { BudgetBar } from '../components/BudgetBar'
import { DailyTarget } from '../components/DailyTarget'
import { DueAlert } from '../components/DueAlert'
import { DebtProgress } from '../components/DebtProgress'
import { TransactionItem } from '../components/TransactionItem'
import { OnboardingOverlay } from '../components/OnboardingOverlay'
import { useOnboarding } from '../hooks/use-onboarding'
import { formatRupiah, todayISO } from '../lib/format'
import { api } from '../lib/api'

interface DashboardData {
  date: string
  today: {
    income: number
    expense: number
    debt_payment: number
    profit: number
    transaction_count: number
  }
  budget: {
    daily_total: number
    spent_today: number
    remaining: number
    percentage_used: number
  }
  daily_target: {
    target_amount: number
    earned_today: number
    gap: number
    is_on_track: boolean
    breakdown: {
      daily_expense: number
      prorated_monthly: number
      total_monthly: number
      daily_debt: number
      days_in_month: number
    }
    days_remaining: number
    target_date: string
  }
  upcoming_dues: {
    debt_id: string
    platform: string
    due_date: string
    amount: number
    days_until: number
    urgency: 'overdue' | 'critical' | 'warning' | 'normal'
  }[]
  debt_summary: {
    total_original: number
    total_remaining: number
    total_paid: number
    progress_percentage: number
    target_date: string
  }
}

interface RecentTx {
  id: string
  created_at: string
  type: string
  amount: number
  category: string
  note: string
}

export function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [recentTx, setRecentTx] = useState<RecentTx[]>([])
  const [loading, setLoading] = useState(true)
  const onboarding = useOnboarding()

  useEffect(() => {
    const date = todayISO()
    Promise.all([
      api<DashboardData>(`/api/dashboard?date=${date}`),
      api<RecentTx[]>('/api/transactions?limit=5'),
    ]).then(([dash, txs]) => {
      setData(dash)
      setRecentTx(txs || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Memuat...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-400">Gagal memuat data</p>
      </div>
    )
  }

  const { today, budget, daily_target, upcoming_dues, debt_summary } = data

  return (
    <div className="mx-auto max-w-md pb-20">
      {/* Header */}
      <div className="bg-emerald-500 px-4 pb-6 pt-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Pendapatan Hari Ini</p>
            <p className="text-2xl font-bold">{formatRupiah(today.income)}</p>
          </div>
          <button
            type="button"
            onClick={onboarding.reopen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white transition-all active:scale-90"
            title="Bantuan"
          >
            ?
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="-mt-3 grid grid-cols-3 gap-2 px-4">
        <SummaryCard
          label="Pengeluaran"
          amount={today.expense}
          color="red"
        />
        <SummaryCard
          label="Hutang"
          amount={today.debt_payment}
          color="orange"
        />
        <SummaryCard
          label="Profit"
          amount={today.profit}
          color={today.profit >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Daily Target */}
      <div className="mt-4 px-4">
        <DailyTarget target={daily_target} />
      </div>

      {/* Budget Bar */}
      <div className="mt-4 px-4">
        <BudgetBar budget={budget} />
      </div>

      {/* Due Alerts */}
      {upcoming_dues.length > 0 && (
        <div className="mt-4 px-4">
          <DueAlert dues={upcoming_dues} />
        </div>
      )}

      {/* Debt Progress */}
      {debt_summary.total_original > 0 && (
        <div className="mt-4 px-4">
          <DebtProgress summary={debt_summary} />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          Transaksi Terakhir
        </h2>
        {recentTx.length === 0 ? (
          <p className="text-center text-xs text-gray-400">
            Belum ada transaksi hari ini
          </p>
        ) : (
          <div className="space-y-1">
            {recentTx.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={onboarding.isOpen}
        step={onboarding.step}
        onNext={onboarding.next}
        onPrev={onboarding.prev}
        onClose={onboarding.close}
      />

      <BottomNav active="home" />
    </div>
  )
}
