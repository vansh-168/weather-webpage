import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AirQualityCard } from './components/AirQualityCard'
import { CurrentWeather } from './components/CurrentWeather'
import { ForecastList } from './components/ForecastList'
import { SearchBar } from './components/SearchBar'
import { UnitToggle } from './components/UnitToggle'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { cn } from './lib/utils'
import { getWeatherTheme } from './lib/weatherTheme'
import { geocodeCity } from './services/weatherService'
import type { Coordinates, Units } from './types/weather'

const FALLBACK_COORDS: Coordinates = { lat: 51.5072, lon: -0.1276 } // London

function App() {
  const [units, setUnits] = useState<Units>('metric')
  const [searchError, setSearchError] = useState<string | null>(null)
  const { coords, error: geoError, loading: locating, locate } = useGeolocation()
  const { data, error, loading, load } = useWeather()

  useEffect(() => {
    load(coords ?? FALLBACK_COORDS, units)
    // Only re-run when coords or units change, not when `load` is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, units])

  async function handleSearch(city: string) {
    setSearchError(null)
    try {
      const match = await geocodeCity(city)
      if (!match) {
        setSearchError(`No results found for "${city}".`)
        return
      }
      load(match, units, { name: match.name, country: match.country })
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed.')
    }
  }

  const theme = getWeatherTheme(data?.current.condition.main ?? 'Clear')

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br transition-colors duration-700',
        theme.gradient,
        theme.textClass,
      )}
    >
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 px-4 py-10">
        <div className="flex w-full max-w-md items-center justify-between gap-3">
          <SearchBar onSearch={handleSearch} onLocate={locate} locating={locating} />
          <UnitToggle units={units} onChange={setUnits} />
        </div>

        {(searchError || geoError) && (
          <p className="rounded-full bg-black/20 px-4 py-1.5 text-sm">
            {searchError ?? geoError}
          </p>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 max-w-sm rounded-2xl bg-black/20 p-4 text-center text-sm">
            {error}
          </div>
        )}

        {data && !loading && !error && (
          <>
            <CurrentWeather location={data.location} current={data.current} units={units} />
            <ForecastList daily={data.daily} />
            {data.airQuality && <AirQualityCard airQuality={data.airQuality} />}
          </>
        )}
      </main>
    </div>
  )
}

export default App
