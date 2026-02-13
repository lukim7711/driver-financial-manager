import { useState, useCallback } from 'react'
import { apiClient } from '../lib/api'

export function useApi<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    path: string,
    init?: RequestInit,
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient<T>(path, init)
      if (res.success) {
        return res.data ?? null
      }
      setError(res.error || 'Unknown error')
      return null
    } catch {
      setError('Koneksi gagal')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}
