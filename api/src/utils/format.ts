/**
 * Format number to Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

/**
 * Format date to ISO 8601 with Jakarta timezone
 */
export function formatDateISO(date: Date): string {
  const offset = 7 * 60 // UTC+7
  const localDate = new Date(date.getTime() + offset * 60 * 1000)
  return localDate.toISOString().slice(0, 19) + '+07:00'
}
