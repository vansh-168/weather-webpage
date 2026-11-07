// OpenWeatherMap gives each city's offset from UTC in seconds. Shifting a
// timestamp by that offset and formatting it *as UTC* shows the city's own
// local time, whatever timezone the visitor's browser is in.

const shift = (dt: number, tz: number) => new Date((dt + tz) * 1000)

const clockFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
const hourFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone: 'UTC' })
const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' })
const longFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
})

export const formatClock = (dt: number, tz: number) => clockFmt.format(shift(dt, tz))
export const formatHour = (dt: number, tz: number) => hourFmt.format(shift(dt, tz))
export const formatLocalDateTime = (dt: number, tz: number) => longFmt.format(shift(dt, tz))

/** City-local date as YYYY-MM-DD. */
export const localDateKey = (dt: number, tz: number) => shift(dt, tz).toISOString().slice(0, 10)

/** City-local hour, 0–23. */
export const localHour = (dt: number, tz: number) => shift(dt, tz).getUTCHours()

export function formatWeekday(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Today'
  return weekdayFmt.format(new Date(`${dateKey}T12:00:00Z`))
}

/** "in 3 h 20 min" / "in 45 min" */
export function formatDuration(seconds: number): string {
  const mins = Math.max(0, Math.round(seconds / 60))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}
