import { cn } from '../lib/utils'
import type { AirQuality } from '../types/weather'

interface AirQualityCardProps {
  airQuality: AirQuality
}

const AQI_LABELS: Record<number, { label: string; colorClass: string }> = {
  1: { label: 'Good', colorClass: 'bg-emerald-400' },
  2: { label: 'Fair', colorClass: 'bg-yellow-400' },
  3: { label: 'Moderate', colorClass: 'bg-orange-400' },
  4: { label: 'Poor', colorClass: 'bg-red-500' },
  5: { label: 'Very Poor', colorClass: 'bg-purple-600' },
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const info = AQI_LABELS[airQuality.aqi] ?? AQI_LABELS[3]

  return (
    <div className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
      <div>
        <p className="text-xs font-medium opacity-80">Air Quality</p>
        <p className="text-lg font-semibold">{info.label}</p>
      </div>
      <div className="flex items-center gap-2 text-xs opacity-90">
        <span className={cn('h-2.5 w-2.5 rounded-full', info.colorClass)} />
        PM2.5: {airQuality.components.pm2_5.toFixed(1)} µg/m³
      </div>
    </div>
  )
}
