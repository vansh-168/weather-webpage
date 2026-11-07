import type { WeatherCondition } from '../types/weather'

// Background gradients by condition and time of day. All are dark enough
// for white text. Class names are full literals so Tailwind can find them.
const THEMES = {
  clearDay: 'from-sky-500 via-blue-600 to-indigo-700',
  clearNight: 'from-slate-950 via-indigo-950 to-blue-950',
  cloudsDay: 'from-slate-500 via-slate-600 to-slate-700',
  cloudsNight: 'from-slate-900 via-slate-800 to-slate-950',
  rain: 'from-slate-700 via-slate-800 to-blue-950',
  drizzle: 'from-slate-600 via-sky-800 to-slate-800',
  thunder: 'from-slate-950 via-violet-950 to-slate-900',
  snowDay: 'from-sky-600 via-slate-500 to-slate-700',
  snowNight: 'from-slate-800 via-slate-900 to-sky-950',
  fogDay: 'from-stone-500 via-slate-500 to-slate-600',
  fogNight: 'from-stone-900 via-slate-900 to-slate-950',
} as const

const FOG_LIKE = new Set(['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado'])

export const isNightIcon = (condition?: WeatherCondition) => condition?.icon.endsWith('n') ?? false

const NEUTRAL = 'from-slate-800 via-slate-900 to-slate-950'

export function getWeatherGradient(condition?: WeatherCondition): string {
  if (!condition) return NEUTRAL
  const night = isNightIcon(condition)
  switch (condition?.main) {
    case 'Clear':
      return night ? THEMES.clearNight : THEMES.clearDay
    case 'Clouds':
      return night ? THEMES.cloudsNight : THEMES.cloudsDay
    case 'Rain':
      return THEMES.rain
    case 'Drizzle':
      return THEMES.drizzle
    case 'Thunderstorm':
      return THEMES.thunder
    case 'Snow':
      return night ? THEMES.snowNight : THEMES.snowDay
    default:
      if (condition && FOG_LIKE.has(condition.main)) return night ? THEMES.fogNight : THEMES.fogDay
      return night ? THEMES.clearNight : THEMES.clearDay
  }
}
