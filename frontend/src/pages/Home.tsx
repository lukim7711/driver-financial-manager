import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { todayISO, formatDateLong } from '../lib/format'
import { useToast } from '../components/Toast'
import { SummaryCard } from '../components/SummaryCard'
import { DailyTarget } from '../components/DailyTarget'
import { BudgetBar } from '../components/BudgetBar'
import { DueAlert } from '../components/DueAlert'
import { DebtProgress } from '../components/DebtProgress'
import { BottomNav } from '../components/BottomNav'
import { OnboardingOverlay } from '../components/OnboardingOverlay'
import { useOnboarding } from '../hooks/use-onboarding'

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
    total_monthly: number
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

export function Home() {
  const toast = useToast()
  const [data, setData] = useState<DashboardData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const onboarding = useOnboarding()

  const fetchDashboard = useCallback(async () => {
    const date = todayISO()
    const res = await apiClient<DashboardData>(
      `/api/dashboard?date=${date}`
    )
    if (res.success && res.data) {
      setData(res.data)
    } else if (!res.success) {
      toast.error(res.error)
    }
    setLoading(false)
    setRefreshing(false)
  }, [toast])

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

  const today = data?.today ?? {
    income: 0,
    expense: 0,
    debt_payment: 0,
    profit: 0,
    transaction_count: 0,
  }
  const budget = data?.budget ?? {
    daily_total: 0,
    total_monthly: 0,
    spent_today: 0,
    remaining: 0,
    percentage_used: 0,
  }
  const target = data?.daily_target ?? {
    target_amount: 0,
    earned_today: 0,
    gap: 0,
    is_on_track: false,
    breakdown: {
      daily_expense: 0,
      prorated_monthly: 0,
      total_monthly: 0,
      daily_debt: 0,
      days_in_month: 30,
    },
    days_remaining: 0,
    target_date: '',
  }
  const dues = data?.upcoming_dues ?? []
  const debt = data?.debt_summary ?? {
    total_original: 0,
    total_remaining: 0,
    total_paid: 0,
    progress_percentage: 0,
    target_date: '',
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 px-4 pt-6 pb-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              {'\ud83d\udcb0'} Money Manager
            </h1>
            <p className="text-sm text-emerald-100">
              {'\ud83d\udcc5'} {formatDateLong(todayISO())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onboarding.reopen}
              className="tap-highlight-none flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white transition-all active:scale-90"
              title="Bantuan"
            >
              ?
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={`tap-highlight-none flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm text-white transition-all active:scale-90 ${
                refreshing ? 'animate-spin' : ''
              }`}
              title="Refresh data"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-10.624-2.85a5.5 5.5 0 019.201-2.465l.312.31H11.77a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V3.535a.75.75 0 00-1.5 0v2.033l-.312-.311A7 7 0 002.63 8.396a.75.75 0 001.45.39z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
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

        {/* Daily target */}
        <DailyTarget
          targetAmount={target.target_amount}
          earnedToday={target.earned_today}
          gap={target.gap}
          isOnTrack={target.is_on_track}
          breakdown={{
            dailyExpense: target.breakdown.daily_expense,
            proratedMonthly:
              target.breakdown.prorated_monthly,
            dailyDebt: target.breakdown.daily_debt,
            daysInMonth: target.breakdown.days_in_month,
          }}
          daysRemaining={target.days_remaining}
        />

        {/* Budget bar */}
        <BudgetBar
          totalDaily={budget.daily_total}
          spentToday={budget.spent_today}
          remaining={budget.remaining}
          percentageUsed={budget.percentage_used}
        />

        {/* Due alerts */}
        {dues.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              {'\u26a0\ufe0f'} JATUH TEMPO
            </h2>
            {dues.map((due) => (
              <DueAlert
                key={`${due.debt_id}-${due.due_date}`}
                due={due}
              />
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
