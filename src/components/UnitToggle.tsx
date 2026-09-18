import { cn } from '../lib/utils'
import type { Units } from '../types/weather'

interface UnitToggleProps {
  units: Units
  onChange: (units: Units) => void
}

export function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/20 text-sm backdrop-blur-md">
      {(['metric', 'imperial'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'px-3 py-1.5 font-medium text-white transition',
            units === option ? 'bg-white/30' : 'hover:bg-white/10',
          )}
        >
          {option === 'metric' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  )
}
