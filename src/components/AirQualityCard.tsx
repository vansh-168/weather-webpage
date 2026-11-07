import { Leaf } from 'lucide-react'
import { cn } from '../lib/utils'
import type { AirQuality } from '../types/weather'
import { Card } from './Card'

interface AirQualityCardProps {
  airQuality: AirQuality
}

// OpenWeatherMap's Air Pollution API reports a 1–5 index.
const LEVELS = [
  { label: 'Good', color: 'bg-emerald-400', advice: 'Air quality is great. A good time to be outdoors.' },
  { label: 'Fair', color: 'bg-lime-300', advice: 'Air quality is acceptable for most people.' },
  { label: 'Moderate', color: 'bg-amber-400', advice: 'Sensitive groups may want to limit long outdoor exertion.' },
  { label: 'Poor', color: 'bg-orange-500', advice: 'Consider spending less time outdoors, especially if sensitive.' },
  { label: 'Very poor', color: 'bg-rose-600', advice: 'Avoid prolonged outdoor activity if you can.' },
]

const POLLUTANTS: { key: keyof AirQuality['components']; name: string }[] = [
  { key: 'pm2_5', name: 'PM2.5' },
  { key: 'pm10', name: 'PM10' },
  { key: 'o3', name: 'O₃' },
  { key: 'no2', name: 'NO₂' },
]

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const index = Math.min(Math.max(airQuality.aqi, 1), 5) - 1
  const level = LEVELS[index]

  return (
    <Card title="Air quality" icon={<Leaf className="size-4" aria-hidden="true" />}>
      <p className="text-2xl font-semibold">
        {level.label} <span className="text-base font-normal text-white/60">· {index + 1} of 5</span>
      </p>
      <p className="mt-1 text-sm text-white/75">{level.advice}</p>

      <div className="mt-4 grid grid-cols-5 gap-1" aria-hidden="true">
        {LEVELS.map((l, i) => (
          <span key={l.label} className={cn('h-1.5 rounded-full', l.color, i === index ? 'opacity-100 ring-2 ring-white' : 'opacity-35')} />
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {POLLUTANTS.map((p) => (
          <div key={p.key} className="rounded-2xl bg-white/5 px-1 py-2">
            <dt className="text-xs text-white/60">{p.name}</dt>
            <dd className="font-semibold">{airQuality.components[p.key].toFixed(airQuality.components[p.key] < 10 ? 1 : 0)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-white/50">Concentrations in µg/m³.</p>
    </Card>
  )
}
