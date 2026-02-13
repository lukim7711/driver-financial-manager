import type { ApiResponse } from '../types'

export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function error(message: string): ApiResponse<never> {
  return { success: false, error: message }
}
