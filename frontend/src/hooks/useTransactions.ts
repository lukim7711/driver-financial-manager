import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import type { Transaction } from '../types'
import { todayISO } from '../lib/format'

export function useTransactions(date?: string) {
  const { loading, error, execute } = useApi<Transaction[]>()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchTransactions = useCallback(async () => {
    const queryDate = date || todayISO()
    const result = await execute(`/api/transactions?date=${queryDate}`)
    if (result) setTransactions(result)
  }, [date, execute])

  useEffect(() => {
    void fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}
