import type { Units } from '../types/weather'

// Data is always fetched in metric; these convert for display, so switching
// °C/°F is instant and never re-fetches (or loses the selected city).

export const toTemp = (c: number, units: Units) => (units === 'metric' ? c : (c * 9) / 5 + 32)

export const formatTemp = (c: number, units: Units) => `${Math.round(toTemp(c, units))}°`

export function formatSpeed(ms: number, units: Units): string {
  return units === 'metric' ? `${Math.round(ms * 3.6)} km/h` : `${Math.round(ms * 2.237)} mph`
}

export function formatDistance(metres: number, units: Units): string {
  if (units === 'imperial') {
    const miles = metres / 1609.34
    return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`
  }
  if (metres < 1000) return `${Math.round(metres)} m`
  const km = metres / 1000
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

export function formatPressure(hpa: number, units: Units): string {
  return units === 'metric' ? `${Math.round(hpa)} hPa` : `${(hpa * 0.02953).toFixed(2)} inHg`
}

export function formatPrecip(mm: number, units: Units): string {
  return units === 'metric' ? `${mm.toFixed(1)} mm` : `${(mm / 25.4).toFixed(2)} in`
}

/** Dew point in °C (Magnus formula). */
export function dewPoint(tempC: number, humidity: number): number {
  const a = 17.62
  const b = 243.12
  const gamma = Math.log(Math.max(humidity, 1) / 100) + (a * tempC) / (b + tempC)
  return (b * gamma) / (a - gamma)
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export const compassDirection = (deg: number) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]
