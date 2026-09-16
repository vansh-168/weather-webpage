export type WeatherTheme = {
  gradient: string
  textClass: string
}

const THEMES: Record<string, WeatherTheme> = {
  Clear: {
    gradient: 'from-sky-400 via-sky-300 to-amber-200',
    textClass: 'text-slate-900',
  },
  Clouds: {
    gradient: 'from-slate-500 via-slate-400 to-slate-300',
    textClass: 'text-white',
  },
  Rain: {
    gradient: 'from-slate-700 via-slate-600 to-sky-700',
    textClass: 'text-white',
  },
  Drizzle: {
    gradient: 'from-slate-600 via-sky-600 to-sky-500',
    textClass: 'text-white',
  },
  Thunderstorm: {
    gradient: 'from-slate-900 via-slate-800 to-indigo-900',
    textClass: 'text-white',
  },
  Snow: {
    gradient: 'from-slate-200 via-sky-100 to-white',
    textClass: 'text-slate-900',
  },
  Mist: {
    gradient: 'from-slate-400 via-slate-300 to-slate-200',
    textClass: 'text-slate-900',
  },
}

const FOG_LIKE = new Set(['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash'])

const DEFAULT_THEME: WeatherTheme = {
  gradient: 'from-sky-500 via-sky-400 to-sky-300',
  textClass: 'text-white',
}

export function getWeatherTheme(conditionMain: string): WeatherTheme {
  if (FOG_LIKE.has(conditionMain)) return THEMES.Mist
  return THEMES[conditionMain] ?? DEFAULT_THEME
}
