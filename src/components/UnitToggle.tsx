import { cn } from '../lib/utils'
import type { Units } from '../types/weather'

interface UnitToggleProps {
  units: Units
  onChange: (units: Units) => void
}

const OPTIONS: { value: Units; label: string; name: string }[] = [
  { value: 'metric', label: '°C', name: 'Celsius' },
  { value: 'imperial', label: '°F', name: 'Fahrenheit' },
]

export function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Temperature units"
      className="inline-flex shrink-0 gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-xl"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={units === option.value}
          aria-label={option.name}
          className={cn(
            'min-w-11 rounded-full px-3 py-1.5 text-sm font-semibold transition',
            units === option.value ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
