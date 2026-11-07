import { CalendarDays, Droplets } from 'lucide-react'
import { formatWeekday, localDateKey } from '../lib/time'
import { toTemp } from '../lib/units'
import type { Units, WeatherData } from '../types/weather'
import { Card } from './Card'
import { WeatherIcon } from './WeatherIcon'

interface DailyForecastProps {
  data: WeatherData
  units: Units
}

/** One row per day with a bar showing that day's range against the whole week. */
export function DailyForecast({ data, units }: DailyForecastProps) {
  const { daily, current, timezoneOffset } = data
  const todayKey = localDateKey(current.dt, timezoneOffset)
  const weekMin = Math.min(...daily.map((d) => d.tempMin))
  const weekMax = Math.max(...daily.map((d) => d.tempMax))
  const span = weekMax - weekMin || 1
  const pct = (t: number) => ((t - weekMin) / span) * 100

  return (
    <Card title={`${daily.length}-day forecast`} icon={<CalendarDays className="size-4" aria-hidden="true" />}>
      <ul>
        {daily.map((day) => (
          <li key={day.date} className="flex items-center gap-3 border-b border-white/10 py-2.5 last:border-0">
            <span className="w-12 shrink-0 font-medium">{formatWeekday(day.date, todayKey)}</span>
            <WeatherIcon condition={day.condition} className="size-6 shrink-0" />
            <span className="inline-flex w-11 shrink-0 items-center gap-0.5 text-xs text-sky-200">
              {day.pop >= 0.2 && (
                <>
                  <Droplets className="size-3" aria-hidden="true" />
                  {Math.round(day.pop * 100)}%
                </>
              )}
            </span>
            <span className="w-9 shrink-0 text-right text-white/65">{Math.round(toTemp(day.tempMin, units))}°</span>
            <div className="relative h-1.5 min-w-12 flex-1 rounded-full bg-white/15" aria-hidden="true">
              <div
                className="absolute inset-y-0 rounded-full bg-linear-to-r from-sky-300 via-amber-200 to-orange-400"
                style={{ left: `${pct(day.tempMin)}%`, right: `${100 - pct(day.tempMax)}%` }}
              />
              {day.date === todayKey && (
                <span
                  className="absolute top-1/2 size-2.5 -translate-1/2 rounded-full border-2 border-slate-900/40 bg-white"
                  style={{ left: `${pct(current.temp)}%` }}
                  title="Now"
                />
              )}
            </div>
            <span className="w-9 shrink-0 font-semibold">{Math.round(toTemp(day.tempMax, units))}°</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
