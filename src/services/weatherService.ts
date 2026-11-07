import { localDateKey, localHour } from '../lib/time'
import type {
  AirQuality,
  Coordinates,
  DailyForecast,
  HourlyPoint,
  Place,
  WeatherCondition,
  WeatherData,
} from '../types/weather'

// A small serverless proxy (see ../../weather-proxy) holds the real
// OpenWeatherMap API key server-side, so it never ships in this client bundle.
const PROXY_URL =
  import.meta.env.VITE_WEATHER_PROXY_URL ?? 'https://weather-webpage-proxy.vercel.app/api/proxy'

const TIMEOUT_MS = 12000

async function request<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const url = new URL(PROXY_URL)
  url.searchParams.set('path', path)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  let res: Response
  try {
    res = await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new Error(
      err instanceof DOMException && err.name === 'AbortError'
        ? 'The weather service is taking too long to respond. Please try again.'
        : 'Network error. Check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new Error(`The weather service returned an error (${res.status}). Please try again.`)
  return (await res.json()) as T
}

const coordParams = (c: Coordinates) => ({ lat: c.lat.toFixed(4), lon: c.lon.toFixed(4) })

// ---- OpenWeatherMap response shapes (only the fields we use) ----

interface OwmCurrent {
  dt: number
  name: string
  timezone: number
  sys: { country: string; sunrise: number; sunset: number }
  main: { temp: number; feels_like: number; humidity: number; pressure: number }
  visibility?: number
  wind: { speed: number; deg?: number; gust?: number }
  clouds: { all: number }
  rain?: { '1h'?: number }
  snow?: { '1h'?: number }
  weather: WeatherCondition[]
}

interface OwmForecastEntry {
  dt: number
  main: { temp: number; temp_min: number; temp_max: number }
  pop?: number
  weather: WeatherCondition[]
}

interface OwmForecast {
  list: OwmForecastEntry[]
  city: { timezone: number }
}

interface OpenMeteoAirQuality {
  current?: {
    us_aqi: number | null
    pm2_5: number | null
    pm10: number | null
    ozone: number | null
    nitrogen_dioxide: number | null
  }
}

interface OwmGeoResult {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  local_names?: Record<string, string>
}

// ---- Forecast shaping ----

/**
 * Groups 3-hourly entries into days using the *city's* local date (not the
 * browser's or UTC), so e.g. Tokyo's days start at Tokyo midnight.
 */
function groupByDay(entries: OwmForecastEntry[], tz: number): DailyForecast[] {
  const byDay = new Map<string, OwmForecastEntry[]>()
  for (const entry of entries) {
    const key = localDateKey(entry.dt, tz)
    byDay.set(key, [...(byDay.get(key) ?? []), entry])
  }

  return Array.from(byDay, ([date, day]) => {
    // Use the entry closest to local midday as the day's representative condition.
    const representative = day.reduce((best, e) =>
      Math.abs(localHour(e.dt, tz) - 13) < Math.abs(localHour(best.dt, tz) - 13) ? e : best,
    )
    return {
      date,
      tempMin: Math.min(...day.map((e) => e.main.temp_min)),
      tempMax: Math.max(...day.map((e) => e.main.temp_max)),
      pop: Math.max(...day.map((e) => e.pop ?? 0)),
      condition: representative.weather[0],
    }
  })
}

function toHourly(entries: OwmForecastEntry[]): HourlyPoint[] {
  return entries.slice(0, 8).map((e) => ({
    dt: e.dt,
    temp: e.main.temp,
    pop: e.pop ?? 0,
    condition: e.weather[0],
  }))
}

// Air quality comes from Open-Meteo (CAMS atmospheric model), not
// OpenWeatherMap: OWM's Air Pollution API badly understates polluted cities
// (e.g. New Delhi PM2.5 ~45 µg/m³ when Open-Meteo and ground reports show
// ~115+), and its 1–5 index is unfamiliar. Open-Meteo returns the standard US
// AQI, needs no API key and allows browser requests, so no proxy is involved.
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

async function fetchAirQuality(coords: Coordinates): Promise<AirQuality | null> {
  const url = new URL(AIR_QUALITY_URL)
  url.searchParams.set('latitude', coords.lat.toFixed(4))
  url.searchParams.set('longitude', coords.lon.toFixed(4))
  url.searchParams.set('current', 'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide')
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return null
    const c = ((await res.json()) as OpenMeteoAirQuality).current
    if (!c || c.us_aqi === null || c.us_aqi === undefined) return null
    return {
      usAqi: Math.round(c.us_aqi),
      components: { pm2_5: c.pm2_5 ?? 0, pm10: c.pm10 ?? 0, o3: c.ozone ?? 0, no2: c.nitrogen_dioxide ?? 0 },
    }
  } catch {
    // Air quality is supplementary; failures here must never break the dashboard.
    return null
  }
}

function toPlace(r: OwmGeoResult): Place {
  return { lat: r.lat, lon: r.lon, name: r.local_names?.en ?? r.name, country: r.country, state: r.state }
}

// ---- Public API ----

/** Up to 5 matching cities for the search box. Duplicate name/region/country rows are removed. */
export async function searchCities(query: string, signal?: AbortSignal): Promise<Place[]> {
  const results = await request<OwmGeoResult[]>('geo/1.0/direct', { q: query, limit: '5' }, signal)
  const seen = new Set<string>()
  return results.map(toPlace).filter((p) => {
    const key = `${p.name}|${p.state ?? ''}|${p.country}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Best-effort city name for coordinates (e.g. from geolocation). Never throws. */
export async function reverseGeocode(coords: Coordinates): Promise<Place | null> {
  try {
    const [first] = await request<OwmGeoResult[]>('geo/1.0/reverse', { ...coordParams(coords), limit: '1' })
    return first ? { ...toPlace(first), lat: coords.lat, lon: coords.lon } : null
  } catch {
    return null
  }
}

/** Everything the dashboard shows, always fetched in metric units. */
export async function fetchWeatherData(place: Place, signal?: AbortSignal): Promise<WeatherData> {
  const params = { ...coordParams(place), units: 'metric' }
  const [current, forecast, airQuality] = await Promise.all([
    request<OwmCurrent>('data/2.5/weather', params, signal),
    request<OwmForecast>('data/2.5/forecast', params, signal),
    fetchAirQuality(place),
  ])

  const tz = forecast.city?.timezone ?? current.timezone
  const daily = groupByDay(forecast.list, tz)
  // Make today's range include the temperature right now.
  if (daily[0] && daily[0].date === localDateKey(current.dt, tz)) {
    daily[0].tempMin = Math.min(daily[0].tempMin, current.main.temp)
    daily[0].tempMax = Math.max(daily[0].tempMax, current.main.temp)
  }

  return {
    place,
    timezoneOffset: tz,
    current: {
      dt: current.dt,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      visibility: current.visibility ?? null,
      windSpeed: current.wind.speed,
      windDeg: current.wind.deg ?? 0,
      windGust: current.wind.gust ?? null,
      clouds: current.clouds.all,
      rainLastHour: current.rain?.['1h'] ?? null,
      snowLastHour: current.snow?.['1h'] ?? null,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      condition: current.weather[0],
    },
    hourly: toHourly(forecast.list),
    daily,
    airQuality,
  }
}
