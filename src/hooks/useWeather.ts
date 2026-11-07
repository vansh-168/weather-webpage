import { useCallback, useEffect, useState } from 'react'
import { placeKey } from '../lib/places'
import { fetchWeatherData } from '../services/weatherService'
import type { Place, WeatherData } from '../types/weather'

interface Result {
  key: string | null
  data: WeatherData | null
  error: string | null
}

/**
 * Loads weather for `place`. While a new place loads, the previous data stays
 * on screen (`loading` is true) so the page doesn't flash empty. Loading is
 * derived from whether the stored result belongs to the current request.
 */
export function useWeather(place: Place) {
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<Result>({ key: null, data: null, error: null })
  const key = `${placeKey(place)}#${retry}`

  useEffect(() => {
    const controller = new AbortController()
    fetchWeatherData(place, controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({ key, data: null, error: err instanceof Error ? err.message : 'Failed to load weather.' })
      })
    return () => controller.abort()
  }, [place, key])

  const refetch = useCallback(() => setRetry((n) => n + 1), [])
  const loading = result.key !== key

  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    refetch,
  }
}
