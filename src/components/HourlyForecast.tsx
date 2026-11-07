import { Clock, Droplets } from 'lucide-react'
import { formatHour } from '../lib/time'
import { toTemp } from '../lib/units'
import type { Units, WeatherData } from '../types/weather'
import { Card } from './Card'
import { WeatherIcon } from './WeatherIcon'

interface HourlyForecastProps {
  data: WeatherData
  units: Units
}

/** Next 24 hours in 3-hour steps, with a temperature line and rain chance. */
export function HourlyForecast({ data, units }: HourlyForecastProps) {
  const { current, hourly, timezoneOffset } = data
  const points = [
    { dt: current.dt, label: 'Now', temp: current.temp, pop: hourly[0]?.pop ?? 0, condition: current.condition },
    ...hourly.map((h) => ({ ...h, label: formatHour(h.dt, timezoneOffset) })),
  ].map((p) => ({ ...p, value: Math.round(toTemp(p.temp, units)) }))

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  // Keep the line between 25% and 85% of the chart height, leaving room for labels.
  const y = (v: number) => 85 - ((v - min) / range) * 60
  const cols = { gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }
  const line = points.map((p, i) => `${i * 100 + 50},${y(p.value)}`).join(' ')
  const area = `M50,100 L${line.replaceAll(' ', ' L')} L${(points.length - 1) * 100 + 50},100 Z`

  return (
    <Card title="Next 24 hours" icon={<Clock className="size-4" aria-hidden="true" />}>
      <div className="-mx-2 overflow-x-auto px-2 pb-1">
        <div className="min-w-xl">
          <div className="grid text-center text-xs font-medium text-white/70" style={cols}>
            {points.map((p) => (
              <span key={p.dt}>{p.label}</span>
            ))}
          </div>

          <div className="relative mt-2 h-24">
            <svg className="absolute inset-0 size-full" viewBox={`0 0 ${points.length * 100} 100`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="hourly-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="white" stopOpacity="0.28" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#hourly-fill)" />
              <polyline points={line} fill="none" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 grid" style={cols}>
              {points.map((p) => (
                <div key={p.dt} className="relative">
                  <span className="absolute left-1/2 -translate-x-1/2 -translate-y-7 text-sm font-semibold" style={{ top: `${y(p.value)}%` }}>
                    {p.value}°
                  </span>
                  <span className="absolute left-1/2 size-2 -translate-1/2 rounded-full bg-white ring-4 ring-white/20" style={{ top: `${y(p.value)}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid justify-items-center" style={cols}>
            {points.map((p) => (
              <WeatherIcon key={p.dt} condition={p.condition} className="size-6" />
            ))}
          </div>
          <div className="mt-2 grid text-center text-xs text-sky-200" style={cols}>
            {points.map((p) => (
              <span key={p.dt} className="inline-flex items-center justify-center gap-0.5">
                {p.pop >= 0.1 && (
                  <>
                    <Droplets className="size-3" aria-hidden="true" />
                    {Math.round(p.pop * 100)}%
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
