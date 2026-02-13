import { useState, useCallback } from 'react'
import type { ApiResponse } from '../types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setState({ data: null, loading: true, error: null })

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      const json = (await response.json()) as ApiResponse<T>

      if (!json.success) {
        setState({ data: null, loading: false, error: json.error || 'Unknown error' })
        return null
      }

      setState({ data: json.data || null, loading: false, error: null })
      return json.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      setState({ data: null, loading: false, error: errorMessage })
      return null
    }
  }, [])

  return { ...state, execute }
}
