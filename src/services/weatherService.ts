import type {
  AirQuality,
  Coordinates,
  DailyForecast,
  LocationInfo,
  Units,
  WeatherData,
} from '../types/weather'

// A small serverless proxy (see ../../weather-proxy) holds the real
// OpenWeatherMap API key server-side, so it never ships in this client bundle.
const PROXY_URL =
  import.meta.env.VITE_WEATHER_PROXY_URL ?? 'https://weather-webpage-proxy.vercel.app/api/proxy'

function buildProxyUrl(path: string, params: Record<string, string>): string {
  const url = new URL(PROXY_URL)
  url.searchParams.set('path', path)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

interface OwmCondition {
  id: number
  main: string
  description: string
  icon: string
}

interface OwmCurrentResponse {
  name: string
  sys: { country: string }
  main: { temp: number; feels_like: number; humidity: number }
  wind: { speed: number }
  weather: OwmCondition[]
}

interface OwmForecastEntry {
  dt: number
  main: { temp_min: number; temp_max: number }
  weather: OwmCondition[]
}

interface OwmForecastResponse {
  list: OwmForecastEntry[]
}

async function fetchCurrentWeather(coords: Coordinates, units: Units) {
  const url = buildProxyUrl('data/2.5/weather', {
    lat: String(coords.lat),
    lon: String(coords.lon),
    units,
  })
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch current weather (${res.status})`)
  }
  return (await res.json()) as OwmCurrentResponse
}

async function fetchForecast(coords: Coordinates, units: Units) {
  const url = buildProxyUrl('data/2.5/forecast', {
    lat: String(coords.lat),
    lon: String(coords.lon),
    units,
  })
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast (${res.status})`)
  }
  return (await res.json()) as OwmForecastResponse
}

/** Collapses 3-hourly forecast entries into one min/max summary per day, using the midday entry's condition. */
function groupForecastByDay(entries: OwmForecastEntry[]): DailyForecast[] {
  const byDay = new Map<string, OwmForecastEntry[]>()

  for (const entry of entries) {
    const day = new Date(entry.dt * 1000).toISOString().slice(0, 10)
    const existing = byDay.get(day)
    if (existing) {
      existing.push(entry)
    } else {
      byDay.set(day, [entry])
    }
  }

  return Array.from(byDay.values())
    .slice(0, 7)
    .map((dayEntries) => {
      const tempMin = Math.min(...dayEntries.map((e) => e.main.temp_min))
      const tempMax = Math.max(...dayEntries.map((e) => e.main.temp_max))
      const middayEntry =
        dayEntries.find((e) => new Date(e.dt * 1000).getHours() >= 12) ??
        dayEntries[0]

      return {
        dt: middayEntry.dt,
        tempMin,
        tempMax,
        condition: middayEntry.weather[0],
      }
    })
}

interface OwmAirPollutionResponse {
  list: {
    main: { aqi: number }
    components: { pm2_5: number; pm10: number; o3: number; no2: number }
  }[]
}

async function fetchAirQuality(coords: Coordinates): Promise<AirQuality | null> {
  try {
    const url = buildProxyUrl('data/2.5/air_pollution', {
      lat: String(coords.lat),
      lon: String(coords.lon),
    })
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as OwmAirPollutionResponse
    const reading = data.list[0]
    if (!reading) return null

    return { aqi: reading.main.aqi, components: reading.components }
  } catch {
    // Air quality is a supplementary feature; failures here shouldn't break the dashboard.
    return null
  }
}

interface OwmGeocodingResult {
  name: string
  lat: number
  lon: number
  country: string
}

export interface GeocodedCity extends Coordinates {
  name: string
  country: string
}

export async function geocodeCity(query: string): Promise<GeocodedCity | null> {
  const url = buildProxyUrl('geo/1.0/direct', { q: query, limit: '1' })
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to look up city (${res.status})`)
  }
  const results = (await res.json()) as OwmGeocodingResult[]
  const match = results[0]
  return match
    ? { lat: match.lat, lon: match.lon, name: match.name, country: match.country }
    : null
}

export async function fetchWeatherData(
  coords: Coordinates,
  units: Units,
  // The /weather endpoint's reverse-geocoded name can be inaccurate (e.g. OWM
  // labels some Tokyo-area stations "Japan"); prefer a name we already trust,
  // such as the one returned by geocodeCity for a search result.
  locationOverride?: LocationInfo,
): Promise<WeatherData> {
  const [current, forecast, airQuality] = await Promise.all([
    fetchCurrentWeather(coords, units),
    fetchForecast(coords, units),
    fetchAirQuality(coords),
  ])

  return {
    location: locationOverride ?? { name: current.name, country: current.sys.country },
    current: {
      dt: Date.now() / 1000,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      condition: current.weather[0],
    },
    daily: groupForecastByDay(forecast.list),
    airQuality,
  }
}
