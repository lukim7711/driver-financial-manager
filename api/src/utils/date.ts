/**
 * Current datetime as ISO 8601 with +07:00 timezone.
 * Example: "2026-02-14T05:38:00+07:00"
 */
export function getNowISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  const iso = local.toISOString().slice(0, 19)
  return `${iso}+07:00`
}

/**
 * Today's date in YYYY-MM-DD format (Jakarta timezone).
 * Example: "2026-02-14"
 */
export function getTodayISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}
