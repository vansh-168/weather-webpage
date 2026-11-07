import { useEffect, useState } from 'react'
import { searchCities } from '../services/weatherService'
import type { Place } from '../types/weather'

interface SearchResult {
  query: string
  places: Place[]
  error: string | null
}

const MIN_CHARS = 2
const DEBOUNCE_MS = 300

/** Debounced city suggestions for the search box. */
export function useCitySearch(query: string) {
  const trimmed = query.trim()
  const [result, setResult] = useState<SearchResult>({ query: '', places: [], error: null })

  useEffect(() => {
    if (trimmed.length < MIN_CHARS) return undefined
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchCities(trimmed, controller.signal)
        .then((places) => setResult({ query: trimmed, places, error: null }))
        .catch((err: unknown) => {
          if (!controller.signal.aborted) {
            setResult({ query: trimmed, places: [], error: err instanceof Error ? err.message : 'Search failed.' })
          }
        })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  const active = trimmed.length >= MIN_CHARS
  const fresh = result.query === trimmed
  return {
    suggestions: active && fresh ? result.places : [],
    searching: active && !fresh,
    error: active && fresh ? result.error : null,
    noResults: active && fresh && !result.error && result.places.length === 0,
  }
}
