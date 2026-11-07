import { Leaf } from 'lucide-react'
import { cn } from '../lib/utils'
import type { AirQuality } from '../types/weather'
import { Card } from './Card'

interface AirQualityCardProps {
  airQuality: AirQuality
}

// US EPA AQI categories (the scale Google and IQAir also show).
const LEVELS = [
  { max: 50, label: 'Good', color: 'bg-emerald-400', text: 'text-emerald-300', advice: 'Air quality is good. A great time to be outdoors.' },
  { max: 100, label: 'Moderate', color: 'bg-yellow-300', text: 'text-yellow-200', advice: 'Acceptable for most people. Unusually sensitive people should limit long outdoor exertion.' },
  { max: 150, label: 'Unhealthy for sensitive groups', color: 'bg-orange-400', text: 'text-orange-300', advice: 'Children, older adults and people with heart or lung conditions should reduce outdoor exertion.' },
  { max: 200, label: 'Unhealthy', color: 'bg-red-500', text: 'text-red-300', advice: 'Everyone may begin to feel effects. Limit time outdoors and consider a mask.' },
  { max: 300, label: 'Very unhealthy', color: 'bg-purple-500', text: 'text-purple-300', advice: 'Health alert. Avoid outdoor exertion and keep windows closed.' },
  { max: 500, label: 'Hazardous', color: 'bg-rose-900', text: 'text-rose-300', advice: 'Emergency conditions. Stay indoors and use an air purifier if you have one.' },
]

const POLLUTANTS: { key: keyof AirQuality['components']; name: string }[] = [
  { key: 'pm2_5', name: 'PM2.5' },
  { key: 'pm10', name: 'PM10' },
  { key: 'no2', name: 'NO₂' },
  { key: 'o3', name: 'O₃' },
]

/** Marker position on a bar of six equal-width segments, one per category. */
function markerPercent(aqi: number): number {
  const i = LEVELS.findIndex((l) => aqi <= l.max)
  const index = i === -1 ? LEVELS.length - 1 : i
  const min = index === 0 ? 0 : LEVELS[index - 1].max
  const within = Math.min(1, Math.max(0, (aqi - min) / (LEVELS[index].max - min)))
  return ((index + within) / LEVELS.length) * 100
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const aqi = airQuality.usAqi
  const level = LEVELS.find((l) => aqi <= l.max) ?? LEVELS[LEVELS.length - 1]

  return (
    <Card title="Air quality" icon={<Leaf className="size-4" aria-hidden="true" />}>
      <div className="flex items-baseline gap-3">
        <p className="text-5xl font-semibold tracking-tight">{aqi}</p>
        <div>
          <p className={cn('font-semibold', level.text)}>{level.label}</p>
          <p className="text-xs text-white/55">US AQI (0–500)</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-white/75">{level.advice}</p>

      <div className="relative mt-4" aria-hidden="true">
        <div className="grid grid-cols-6 gap-1">
          {LEVELS.map((l) => (
            <span key={l.label} className={cn('h-1.5 rounded-full', l.color, l === level ? 'opacity-100' : 'opacity-40')} />
          ))}
        </div>
        <span
          className="absolute top-1/2 size-3 -translate-1/2 rounded-full border-2 border-slate-900/50 bg-white shadow"
          style={{ left: `${markerPercent(aqi)}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {POLLUTANTS.map((p) => (
          <div key={p.key} className="rounded-2xl bg-white/5 px-1 py-2">
            <dt className="text-xs text-white/60">{p.name}</dt>
            <dd className="font-semibold">{Math.round(airQuality.components[p.key])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-white/50">
        Concentrations in µg/m³. Modelled data from{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
          Open-Meteo
        </a>{' '}
        (CAMS).
      </p>
    </Card>
  )
}
