import { Sunrise, Sunset } from 'lucide-react'
import { formatClock, formatDuration } from '../lib/time'
import type { WeatherData } from '../types/weather'
import { Card } from './Card'

const R = 50
const pointOnArc = (t: number) => ({ x: 60 - R * Math.cos(Math.PI * t), y: 60 - R * Math.sin(Math.PI * t) })

/** Sunrise, sunset and where the sun is on its arc right now (city-local times). */
export function SunCard({ data }: { data: WeatherData }) {
  const { sunrise, sunset, dt: now } = data.current
  const tz = data.timezoneOffset
  const daylight = sunset - sunrise
  const isDay = now >= sunrise && now <= sunset
  const t = Math.min(1, Math.max(0, (now - sunrise) / daylight))
  const sun = pointOnArc(t)

  let status: string
  if (isDay) status = `Sunset in ${formatDuration(sunset - now)}`
  else if (now < sunrise) status = `Sunrise in ${formatDuration(sunrise - now)}`
  else status = `Sunrise in about ${formatDuration(sunrise + 86400 - now)}`

  return (
    <Card title="Sun" icon={<Sunrise className="size-4" aria-hidden="true" />}>
      <svg viewBox="0 0 120 68" className="mx-auto w-full max-w-xs" aria-hidden="true">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 4" />
        {isDay && <path d={`M10 60 A50 50 0 0 1 ${sun.x.toFixed(2)} ${sun.y.toFixed(2)}`} fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" />}
        <line x1="2" y1="60" x2="118" y2="60" stroke="white" strokeOpacity="0.3" />
        <circle cx={sun.x} cy={sun.y} r="5.5" fill={isDay ? '#fcd34d' : 'white'} fillOpacity={isDay ? 1 : 0.35} />
      </svg>
      <p className="mt-2 text-center font-medium">{status}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <p className="flex items-center gap-2">
          <Sunrise className="size-4 text-amber-200" aria-hidden="true" />
          <span>
            <span className="block text-white/60">Sunrise</span>
            <span className="font-semibold">{formatClock(sunrise, tz)}</span>
          </span>
        </p>
        <p className="flex items-center justify-end gap-2 text-right">
          <span>
            <span className="block text-white/60">Sunset</span>
            <span className="font-semibold">{formatClock(sunset, tz)}</span>
          </span>
          <Sunset className="size-4 text-orange-200" aria-hidden="true" />
        </p>
      </div>
      <p className="mt-3 text-center text-sm text-white/60">{formatDuration(daylight)} of daylight</p>
    </Card>
  )
}
