import type { Place, Units } from '../types/weather'

// ---- Default city: guessed from the browser's timezone (no permission prompt) ----

const CITY_BY_TIMEZONE: Record<string, Place> = {
  'Asia/Kolkata': { name: 'New Delhi', country: 'IN', lat: 28.6139, lon: 77.209 },
  'Asia/Calcutta': { name: 'New Delhi', country: 'IN', lat: 28.6139, lon: 77.209 },
  'America/New_York': { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  'America/Chicago': { name: 'Chicago', country: 'US', lat: 41.8781, lon: -87.6298 },
  'America/Denver': { name: 'Denver', country: 'US', lat: 39.7392, lon: -104.9903 },
  'America/Los_Angeles': { name: 'Los Angeles', country: 'US', lat: 34.0522, lon: -118.2437 },
  'America/Toronto': { name: 'Toronto', country: 'CA', lat: 43.6532, lon: -79.3832 },
  'America/Sao_Paulo': { name: 'São Paulo', country: 'BR', lat: -23.5505, lon: -46.6333 },
  'Europe/London': { name: 'London', country: 'GB', lat: 51.5072, lon: -0.1276 },
  'Europe/Paris': { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  'Europe/Berlin': { name: 'Berlin', country: 'DE', lat: 52.52, lon: 13.405 },
  'Europe/Madrid': { name: 'Madrid', country: 'ES', lat: 40.4168, lon: -3.7038 },
  'Europe/Rome': { name: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964 },
  'Asia/Dubai': { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  'Asia/Karachi': { name: 'Karachi', country: 'PK', lat: 24.8607, lon: 67.0011 },
  'Asia/Dhaka': { name: 'Dhaka', country: 'BD', lat: 23.8103, lon: 90.4125 },
  'Asia/Singapore': { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
  'Asia/Shanghai': { name: 'Shanghai', country: 'CN', lat: 31.2304, lon: 121.4737 },
  'Asia/Tokyo': { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  'Australia/Sydney': { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  'Africa/Lagos': { name: 'Lagos', country: 'NG', lat: 6.5244, lon: 3.3792 },
  'Africa/Johannesburg': { name: 'Johannesburg', country: 'ZA', lat: -26.2041, lon: 28.0473 },
}

export function defaultPlace(): Place {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return CITY_BY_TIMEZONE[tz] ?? CITY_BY_TIMEZONE['Europe/London']
}

export const placeKey = (p: Place) => `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`

export const placeLabel = (p: Place) => [p.state, p.country].filter(Boolean).join(', ')

function isPlace(value: unknown): value is Place {
  const p = value as Place
  return (
    !!p &&
    typeof p.name === 'string' &&
    typeof p.country === 'string' &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lon) <= 180
  )
}

// ---- Shareable URL: ?lat=..&lon=..&name=..&country=.. ----

export function placeFromUrl(): Place | null {
  const q = new URLSearchParams(window.location.search)
  const candidate = {
    lat: Number(q.get('lat')),
    lon: Number(q.get('lon')),
    name: q.get('name') ?? '',
    country: q.get('country') ?? '',
    state: q.get('state') ?? undefined,
  }
  return q.has('lat') && q.has('lon') && candidate.name && isPlace(candidate) ? candidate : null
}

export function placeToUrl(p: Place): string {
  const q = new URLSearchParams({ lat: p.lat.toFixed(4), lon: p.lon.toFixed(4), name: p.name, country: p.country })
  if (p.state) q.set('state', p.state)
  return `${window.location.pathname}?${q}`
}

// ---- Browser storage (wrapped: private mode or blocked storage just means nothing is remembered) ----

const KEYS = { units: 'weather.units', place: 'weather.place', recent: 'weather.recent' }
const MAX_RECENT = 6

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable; settings simply won't persist.
  }
}

export const loadUnits = (): Units => (read<string>(KEYS.units) === 'imperial' ? 'imperial' : 'metric')
export const saveUnits = (u: Units) => write(KEYS.units, u)

export function loadLastPlace(): Place | null {
  const p = read<unknown>(KEYS.place)
  return isPlace(p) ? p : null
}
export const saveLastPlace = (p: Place) => write(KEYS.place, p)

export function loadRecent(): Place[] {
  const list = read<unknown[]>(KEYS.recent)
  return Array.isArray(list) ? list.filter(isPlace).slice(0, MAX_RECENT) : []
}
export const saveRecent = (list: Place[]) => write(KEYS.recent, list.slice(0, MAX_RECENT))

export function withRecent(list: Place[], p: Place): Place[] {
  return [p, ...list.filter((x) => placeKey(x) !== placeKey(p))].slice(0, MAX_RECENT)
}

export function initialPlace(): Place {
  return placeFromUrl() ?? loadLastPlace() ?? defaultPlace()
}
