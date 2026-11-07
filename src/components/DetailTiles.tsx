import { Cloud, Droplets, Eye, Gauge, Thermometer, Umbrella, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import { compassDirection, dewPoint, formatDistance, formatPrecip, formatPressure, formatSpeed, formatTemp } from '../lib/units'
import type { Units, WeatherData } from '../types/weather'

interface TileProps {
  icon: ReactNode
  label: string
  value: string
  note?: string
  children?: ReactNode
}

function Tile({ icon, label, value, note, children }: TileProps) {
  return (
    <div className="flex flex-col rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/65 uppercase">
        {icon}
        {label}
      </p>
      <div className="mt-2 flex flex-1 items-center justify-between gap-2">
        <p className="text-2xl font-semibold">{value}</p>
        {children}
      </div>
      {note && <p className="mt-2 text-sm text-white/70">{note}</p>}
    </div>
  )
}

function WindCompass({ deg }: { deg: number }) {
  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <text x="24" y="9" textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity="0.7">N</text>
      {/* Wind direction is where it comes FROM; the arrow points where it blows. */}
      <g transform={`rotate(${deg + 180} 24 24)`}>
        <path d="M24 11 L29 25 L24 22 L19 25 Z" fill="currentColor" />
        <line x1="24" y1="22" x2="24" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

const icon = (Icon: typeof Wind) => <Icon className="size-4" aria-hidden="true" />

function feelsNote(diff: number): string {
  if (Math.abs(diff) < 1.5) return 'Similar to the actual temperature.'
  return diff > 0 ? 'Humidity makes it feel warmer.' : 'Wind makes it feel colder.'
}

function visibilityNote(m: number): string {
  if (m >= 10000) return 'Perfectly clear view.'
  if (m >= 5000) return 'Good visibility.'
  if (m >= 2000) return 'Hazy conditions.'
  return 'Poor visibility. Take care if travelling.'
}

export function DetailTiles({ data, units }: { data: WeatherData; units: Units }) {
  const { current, daily } = data
  const precip = current.rainLastHour ?? current.snowLastHour

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Tile icon={icon(Thermometer)} label="Feels like" value={formatTemp(current.feelsLike, units)} note={feelsNote(current.feelsLike - current.temp)} />
      <Tile icon={icon(Droplets)} label="Humidity" value={`${current.humidity}%`} note={`Dew point ${formatTemp(dewPoint(current.temp, current.humidity), units)}`} />
      <Tile
        icon={icon(Wind)}
        label="Wind"
        value={formatSpeed(current.windSpeed, units)}
        note={`From ${compassDirection(current.windDeg)}${current.windGust ? ` · gusts ${formatSpeed(current.windGust, units)}` : ''}`}
      >
        <WindCompass deg={current.windDeg} />
      </Tile>
      <Tile icon={icon(Umbrella)} label="Precipitation" value={precip ? formatPrecip(precip, units) : `${Math.round((daily[0]?.pop ?? 0) * 100)}%`} note={precip ? 'In the last hour.' : 'Chance of rain today.'} />
      <Tile icon={icon(Gauge)} label="Pressure" value={formatPressure(current.pressure, units)} />
      {current.visibility !== null ? (
        <Tile icon={icon(Eye)} label="Visibility" value={formatDistance(current.visibility, units)} note={visibilityNote(current.visibility)} />
      ) : (
        <Tile icon={icon(Cloud)} label="Cloud cover" value={`${current.clouds}%`} />
      )}
    </div>
  )
}
