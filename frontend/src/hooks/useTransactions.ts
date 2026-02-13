import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import type { Transaction } from '../types'

export function useTransactions(date?: string) {
  const { execute } = useApi<Transaction[]>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const queryDate = date || new Date().toISOString().split('T')[0]
      const result = await execute(`/api/transactions?date=${queryDate}`)
      if (result) {
        setTransactions(result)
      } else {
        setError('Failed to fetch transactions')
      }
      setLoading(false)
    }
    void fetchData()
  }, [date, execute])

  return { transactions, loading, error }
}
