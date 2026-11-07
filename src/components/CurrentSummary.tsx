import { MapPin, Share2 } from 'lucide-react'
import { placeLabel } from '../lib/places'
import { formatLocalDateTime } from '../lib/time'
import { formatTemp, toTemp } from '../lib/units'
import type { Units, WeatherData } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface CurrentSummaryProps {
  data: WeatherData
  units: Units
  onShare: () => void
}

export function CurrentSummary({ data, units, onShare }: CurrentSummaryProps) {
  const { place, current, daily, timezoneOffset } = data
  const today = daily[0]
  const region = placeLabel(place)

  return (
    <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" aria-label="Current weather">
      <div>
        {region && (
          <p className="flex items-center gap-1.5 text-sm text-white/75">
            <MapPin className="size-4" aria-hidden="true" />
            {region}
          </p>
        )}
        <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">{place.name}</h1>
        <p className="mt-1 text-sm text-white/65">
          Updated {formatLocalDateTime(current.dt, timezoneOffset)} local time
        </p>

        <p className="mt-5 flex items-start leading-none font-extralight tracking-tighter">
          <span className="text-8xl sm:text-9xl">{Math.round(toTemp(current.temp, units))}</span>
          <span className="mt-2 text-4xl sm:text-5xl">°{units === 'metric' ? 'C' : 'F'}</span>
        </p>
        <p className="mt-3 text-xl font-medium capitalize">{current.condition.description}</p>
        <p className="mt-1 text-white/75">
          {today && (
            <>
              H {formatTemp(today.tempMax, units)} · L {formatTemp(today.tempMin, units)} ·{' '}
            </>
          )}
          Feels like {formatTemp(current.feelsLike, units)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <WeatherIcon condition={current.condition} className="size-24 drop-shadow-lg sm:size-36" strokeWidth={1.25} />
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-xl transition hover:bg-white/20"
        >
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </button>
      </div>
    </section>
  )
}
