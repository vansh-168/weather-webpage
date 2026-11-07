import { CloudSun, Loader2, LocateFixed } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AirQualityCard } from './components/AirQualityCard'
import { CurrentSummary } from './components/CurrentSummary'
import { DailyForecast } from './components/DailyForecast'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { DetailTiles } from './components/DetailTiles'
import { Footer } from './components/Footer'
import { HourlyForecast } from './components/HourlyForecast'
import { RecentPlaces } from './components/RecentPlaces'
import { SearchBox } from './components/SearchBox'
import { StatusMessage } from './components/StatusMessage'
import { SunCard } from './components/SunCard'
import { UnitToggle } from './components/UnitToggle'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { initialPlace, loadRecent, loadUnits, placeKey, placeToUrl, saveLastPlace, saveRecent, saveUnits, withRecent } from './lib/places'
import { formatTemp } from './lib/units'
import { cn } from './lib/utils'
import { getWeatherGradient } from './lib/weatherTheme'
import { reverseGeocode } from './services/weatherService'
import type { Coordinates, Place, Units } from './types/weather'

const DEFAULT_TITLE = 'Skycast — Weather forecast, air quality & sunrise times'

function App() {
  const [place, setPlace] = useState<Place>(initialPlace)
  const [units, setUnits] = useState<Units>(loadUnits)
  const [recent, setRecent] = useState<Place[]>(loadRecent)
  const [notice, setNotice] = useState<string | null>(null)
  const { data, error, loading, refetch } = useWeather(place)

  const selectPlace = useCallback((next: Place) => {
    setPlace(next)
    setRecent((list) => withRecent(list, next))
  }, [])

  const handleLocated = useCallback(
    async (coords: Coordinates) => {
      const named = await reverseGeocode(coords)
      selectPlace(named ?? { ...coords, name: 'My location', country: '' })
    },
    [selectPlace],
  )
  const geo = useGeolocation(handleLocated)

  // Remember settings, and keep the address bar shareable.
  useEffect(() => saveUnits(units), [units])
  useEffect(() => saveRecent(recent), [recent])
  useEffect(() => {
    saveLastPlace(place)
    window.history.replaceState(null, '', placeToUrl(place))
  }, [place])

  useEffect(() => {
    document.title = data ? `${formatTemp(data.current.temp, units)} ${data.place.name} · Skycast` : DEFAULT_TITLE
  }, [data, units])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  async function share() {
    const url = `${window.location.origin}${placeToUrl(place)}`
    const text = data ? `${place.name}: ${formatTemp(data.current.temp, units)}, ${data.current.condition.description}` : place.name
    if (navigator.share) {
      try {
        await navigator.share({ title: `Weather in ${place.name}`, text, url })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Link copied to clipboard.')
    } catch {
      setNotice(url)
    }
  }

  const message = notice ?? geo.error
  const showingOld = loading && data !== null && placeKey(data.place) !== placeKey(place)

  return (
    <div className={cn('min-h-screen bg-linear-to-br text-white transition-colors duration-700', getWeatherGradient(data?.current.condition))}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex flex-wrap items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight" aria-label="Skycast home">
            <CloudSun className="size-7" aria-hidden="true" />
            Skycast
          </a>
          <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:ml-6 sm:w-auto sm:max-w-xl sm:flex-1">
            <SearchBox onSelect={selectPlace} />
            <button
              type="button"
              onClick={geo.locate}
              disabled={geo.loading}
              aria-label="Use my location"
              title="Use my location"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl transition hover:bg-white/20 disabled:opacity-60"
            >
              {geo.loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="size-4" aria-hidden="true" />}
            </button>
          </div>
          <div className="ml-auto">
            <UnitToggle units={units} onChange={setUnits} />
          </div>
        </header>

        <RecentPlaces
          places={recent}
          current={place}
          onSelect={selectPlace}
          onRemove={(p) => setRecent((list) => list.filter((x) => placeKey(x) !== placeKey(p)))}
        />

        {message && (
          <p role="status" className="self-start rounded-full bg-black/25 px-4 py-2 text-sm backdrop-blur-xl">
            {message}
          </p>
        )}

        <main className={cn('flex flex-col gap-6 transition-opacity', showingOld && 'opacity-60')} aria-busy={loading}>
          {!data && loading && <DashboardSkeleton />}
          {error && <StatusMessage message={`Couldn't load the weather for ${place.name}. ${error}`} onRetry={refetch} />}
          {data && !error && (
            <>
              <CurrentSummary data={data} units={units} onShare={share} />
              <HourlyForecast data={data} units={units} />
              <div className="grid items-start gap-4 lg:grid-cols-5">
                <div className="flex flex-col gap-4 lg:col-span-3">
                  <DailyForecast data={data} units={units} />
                  <DetailTiles data={data} units={units} />
                </div>
                <div className="flex flex-col gap-4 lg:col-span-2">
                  <SunCard data={data} />
                  {data.airQuality && <AirQualityCard airQuality={data.airQuality} />}
                </div>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
