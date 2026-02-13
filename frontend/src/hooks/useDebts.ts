import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import type { Debt } from '../types'

export function useDebts() {
  const { execute } = useApi<Debt[]>()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const result = await execute('/api/debts')
      if (result) {
        setDebts(result)
      } else {
        setError('Failed to fetch debts')
      }
      setLoading(false)
    }
    void fetchData()
  }, [execute])

  return { debts, loading, error }
}
