/**
 * Format number to Rupiah currency
 * @param amount - Amount in integer Rupiah
 * @returns Formatted string like "Rp 50.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

/**
 * Format ISO date string to readable Indonesian format
 * @param isoDate - ISO 8601 date string
 * @returns Formatted string like "13 Feb 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Format ISO date string to short format
 * @param isoDate - ISO 8601 date string
 * @returns Formatted string like "13/02"
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}
