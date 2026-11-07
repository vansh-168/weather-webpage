import { Loader2, MapPin, Search } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useCitySearch } from '../hooks/useCitySearch'
import { placeLabel } from '../lib/places'
import { cn } from '../lib/utils'
import type { Place } from '../types/weather'

interface SearchBoxProps {
  onSelect: (place: Place) => void
}

/** City search with live suggestions (arrow keys, Enter and Esc supported). */
export function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const { suggestions, searching, error, noResults } = useCitySearch(query)

  const activeIndex = Math.min(active, suggestions.length - 1)
  const showList = open && query.trim().length >= 2

  function choose(place: Place | undefined) {
    if (!place) return
    onSelect(place)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    choose(suggestions[Math.max(activeIndex, 0)])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <form role="search" onSubmit={handleSubmit}>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city…"
          aria-label="Search for a city"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pr-10 pl-10 text-sm text-white placeholder-white/60 backdrop-blur-xl transition outline-none focus:border-white/50 focus:bg-white/15"
        />
        {searching && (
          <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-white/70" aria-hidden="true" />
        )}
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 py-1 shadow-2xl backdrop-blur-xl"
        >
          {suggestions.map((place, i) => (
            <li
              key={`${place.lat},${place.lon}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault()
                choose(place)
              }}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm', i === activeIndex && 'bg-white/10')}
            >
              <MapPin className="size-4 shrink-0 text-white/50" aria-hidden="true" />
              <span className="font-medium text-white">{place.name}</span>
              <span className="truncate text-white/55">{placeLabel(place)}</span>
            </li>
          ))}
          {searching && suggestions.length === 0 && <li className="px-4 py-3 text-sm text-white/60">Searching…</li>}
          {noResults && <li className="px-4 py-3 text-sm text-white/70">No cities found for “{query.trim()}”.</li>}
          {error && <li className="px-4 py-3 text-sm text-rose-200">{error}</li>}
        </ul>
      )}
    </div>
  )
}
