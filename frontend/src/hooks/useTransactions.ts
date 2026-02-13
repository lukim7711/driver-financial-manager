import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import type { Transaction } from '../types'

export function useTransactions(date?: string) {
  const { data, loading, error, execute } = useApi<Transaction[]>()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const queryDate = date || new Date().toISOString().split('T')[0]
      const result = await execute(`/api/transactions?date=${queryDate}`)
      if (result) setTransactions(result)
    }
    void fetchData()
  }, [date, execute])

  return { transactions, loading, error }
}
