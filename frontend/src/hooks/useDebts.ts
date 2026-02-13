import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import type { Debt } from '../types'

export function useDebts() {
  const { loading, error, execute } = useApi<Debt[]>()
  const [debts, setDebts] = useState<Debt[]>([])

  const fetchDebts = useCallback(async () => {
    const result = await execute('/api/debts')
    if (result) setDebts(result)
  }, [execute])

  useEffect(() => {
    void fetchDebts()
  }, [fetchDebts])

  return { debts, loading, error, refetch: fetchDebts }
}
