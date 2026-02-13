export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const json = await response.json()

    if (!json.success) {
      throw new Error(json.error || 'API request failed')
    }

    return json.data as T
  } catch (error) {
    console.error('API request error:', error)
    return null
  }
}
