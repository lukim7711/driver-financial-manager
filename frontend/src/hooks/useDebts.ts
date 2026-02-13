import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import type { Debt } from '../types'

export function useDebts() {
  const { data, loading, error, execute } = useApi<Debt[]>()
  const [debts, setDebts] = useState<Debt[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const result = await execute('/api/debts')
      if (result) setDebts(result)
    }
    void fetchData()
  }, [execute])

  return { debts, loading, error }
}
