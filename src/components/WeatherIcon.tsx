import { getWeatherIcon } from '../lib/weatherIcon'
import type { WeatherCondition } from '../types/weather'

interface WeatherIconProps {
  condition: WeatherCondition
  className?: string
  strokeWidth?: number
}

export function WeatherIcon({ condition, className, strokeWidth }: WeatherIconProps) {
  const Icon = getWeatherIcon(condition)
  // oxlint-disable-next-line react/static-components -- looked up from a static map, not created here
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}
