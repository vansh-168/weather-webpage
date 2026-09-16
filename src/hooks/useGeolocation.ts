import { useCallback, useState } from 'react'
import type { Coordinates } from '../types/weather'

interface GeolocationState {
  coords: Coordinates | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  })

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState({ coords: null, error: error.message, loading: false })
      },
    )
  }, [])

  return { ...state, locate }
}
