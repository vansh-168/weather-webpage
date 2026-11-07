import { useCallback, useState } from 'react'
import type { Coordinates } from '../types/weather'

interface GeolocationState {
  loading: boolean
  error: string | null
}

const MESSAGES: Record<number, string> = {
  1: 'Location access is blocked. Allow it in your browser settings, or search for a city instead.',
  2: "Your location couldn't be found. Try searching for a city instead.",
  3: 'Finding your location took too long. Please try again.',
}

/** Asks for the visitor's position only when they press the location button. */
export function useGeolocation(onLocated: (coords: Coordinates) => void) {
  const [state, setState] = useState<GeolocationState>({ loading: false, error: null })

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: 'Your browser does not support location. Search for a city instead.' })
      return
    }
    setState({ loading: true, error: null })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ loading: false, error: null })
        onLocated({ lat: position.coords.latitude, lon: position.coords.longitude })
      },
      (error) => setState({ loading: false, error: MESSAGES[error.code] ?? error.message }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  }, [onLocated])

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), [])

  return { ...state, locate, clearError }
}
