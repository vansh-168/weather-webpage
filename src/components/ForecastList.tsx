import type { DailyForecast } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface ForecastListProps {
  daily: DailyForecast[]
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

export function ForecastList({ daily }: ForecastListProps) {
  return (
    <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-7">
      {daily.map((day) => (
        <div
          key={day.dt}
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md"
        >
          <span className="text-xs font-medium opacity-80">
            {DAY_FORMATTER.format(new Date(day.dt * 1000))}
          </span>
          <WeatherIcon condition={day.condition.main} className="h-8 w-8" strokeWidth={1.5} />
          <span className="text-sm">
            {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
          </span>
        </div>
      ))}
    </div>
  )
}
