import { useCallback, useState } from 'react'
import { fetchWeatherData } from '../services/weatherService'
import type { Coordinates, LocationInfo, Units, WeatherData } from '../types/weather'

interface WeatherState {
  data: WeatherData | null
  error: string | null
  loading: boolean
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    error: null,
    loading: false,
  })

  const load = useCallback(
    async (coords: Coordinates, units: Units, locationOverride?: LocationInfo) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const data = await fetchWeatherData(coords, units, locationOverride)
        setState({ data, error: null, loading: false })
      } catch (err) {
        setState({
          data: null,
          error: err instanceof Error ? err.message : 'Failed to load weather.',
          loading: false,
        })
      }
    },
    [],
  )

  return { ...state, load }
}
