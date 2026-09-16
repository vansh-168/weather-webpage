import { Loader2, LocateFixed, Search } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '../lib/utils'

interface SearchBarProps {
  onSearch: (city: string) => void
  onLocate: () => void
  locating: boolean
}

export function SearchBar({ onSearch, onLocate, locating }: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a city..."
          className="w-full rounded-full border border-white/30 bg-white/20 py-2 pr-4 pl-9 text-sm text-white placeholder-white/70 backdrop-blur-md outline-none focus:border-white/60"
        />
      </div>
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        title="Use my location"
        className={cn(
          'flex items-center justify-center rounded-full border border-white/30 bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/30',
          locating && 'opacity-60',
        )}
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
      </button>
    </form>
  )
}
