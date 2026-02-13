import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { apiClient } from '../lib/api'
import { todayISO, formatDateLong } from '../lib/format'
import { SummaryCard } from '../components/SummaryCard'
import { BudgetBar } from '../components/BudgetBar'
import { DueAlert } from '../components/DueAlert'
import { DebtProgress } from '../components/DebtProgress'
import { BottomNav } from '../components/BottomNav'

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
    total_daily: number
    spent_today: number
    remaining: number
    percentage_used: number
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

export function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = useCallback(async () => {
    const date = todayISO()
    const res = await apiClient<DashboardData>(`/api/dashboard?date=${date}`)
    if (res.success && res.data) {
      setData(res.data)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  const handleRefresh = () => {
    setRefreshing(true)
    void fetchDashboard()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">Memuat dashboard...</p>
      </div>
    )
  }

  const today = data?.today ?? { income: 0, expense: 0, debt_payment: 0, profit: 0, transaction_count: 0 }
  const budget = data?.budget ?? { total_daily: 0, spent_today: 0, remaining: 0, percentage_used: 0 }
  const dues = data?.upcoming_dues ?? []
  const debt = data?.debt_summary ?? { total_original: 0, total_remaining: 0, total_paid: 0, progress_percentage: 0, target_date: '' }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 px-4 pt-6 pb-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">💰 Money Manager</h1>
            <p className="text-sm text-emerald-100">📅 {formatDateLong(todayISO())}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className={`tap-highlight-none rounded-full p-2 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            🔄
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Today summary */}
        <SummaryCard
          income={today.income}
          expense={today.expense}
          debtPayment={today.debt_payment}
          profit={today.profit}
          transactionCount={today.transaction_count}
        />

        {/* Budget bar */}
        <BudgetBar
          totalDaily={budget.total_daily}
          spentToday={budget.spent_today}
          remaining={budget.remaining}
          percentageUsed={budget.percentage_used}
        />

        {/* CTA */}
        <button
          type="button"
          onClick={() => void navigate('/input')}
          className="tap-highlight-none w-full rounded-2xl bg-emerald-500 py-4 text-center text-lg font-bold text-white shadow-lg transition-all active:scale-95"
        >
          ➕ Catat Transaksi
        </button>

        {/* Due alerts */}
        {dues.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">⚠️ JATUH TEMPO</h2>
            {dues.map((due) => (
              <DueAlert key={`${due.debt_id}-${due.due_date}`} due={due} />
            ))}
          </div>
        )}

        {/* Debt progress */}
        <DebtProgress
          totalOriginal={debt.total_original}
          totalRemaining={debt.total_remaining}
          totalPaid={debt.total_paid}
          progressPercentage={debt.progress_percentage}
          targetDate={debt.target_date}
        />

        {/* Transaction count */}
        {today.transaction_count > 0 && (
          <p className="text-center text-xs text-gray-400">
            {today.transaction_count} transaksi hari ini
          </p>
        )}
        {today.transaction_count === 0 && (
          <p className="text-center text-xs text-gray-400">
            Belum ada transaksi hari ini
          </p>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  )
}
