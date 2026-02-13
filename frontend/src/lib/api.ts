const API_BASE = import.meta.env.VITE_API_URL || ''

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

interface ApiErrorResponse {
  success: false
  error: string
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    return await res.json() as ApiResponse<T>
  } catch {
    return { success: false, error: 'Koneksi gagal' }
  }
}
