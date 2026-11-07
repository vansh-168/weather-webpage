import { History, X } from 'lucide-react'
import { placeKey } from '../lib/places'
import { cn } from '../lib/utils'
import type { Place } from '../types/weather'

interface RecentPlacesProps {
  places: Place[]
  current: Place
  onSelect: (place: Place) => void
  onRemove: (place: Place) => void
}

export function RecentPlaces({ places, current, onSelect, onRemove }: RecentPlacesProps) {
  if (places.length === 0) return null

  return (
    <nav aria-label="Recent cities" className="flex flex-wrap items-center gap-2">
      <History className="size-4 text-white/60" aria-hidden="true" />
      {places.map((place) => {
        const isCurrent = placeKey(place) === placeKey(current)
        return (
          <span
            key={placeKey(place)}
            className={cn(
              'inline-flex items-center rounded-full border text-sm transition',
              isCurrent ? 'border-white/60 bg-white/20' : 'border-white/15 bg-white/5 hover:bg-white/10',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(place)}
              aria-current={isCurrent ? 'true' : undefined}
              className="py-1 pr-1 pl-3"
            >
              {place.name}
            </button>
            <button
              type="button"
              onClick={() => onRemove(place)}
              aria-label={`Remove ${place.name} from recent cities`}
              className="rounded-full p-1.5 text-white/50 hover:text-white"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        )
      })}
    </nav>
  )
}
