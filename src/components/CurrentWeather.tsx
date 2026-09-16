import { Droplets, Wind } from 'lucide-react'
import type { CurrentWeather as CurrentWeatherData, LocationInfo, Units } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface CurrentWeatherProps {
  location: LocationInfo
  current: CurrentWeatherData
  units: Units
}

export function CurrentWeather({ location, current, units }: CurrentWeatherProps) {
  const speedUnit = units === 'metric' ? 'm/s' : 'mph'

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">
        {location.name}, {location.country}
      </h1>
      <WeatherIcon
        condition={current.condition.main}
        className="h-24 w-24 drop-shadow-sm"
        strokeWidth={1.5}
      />
      <p className="text-6xl font-light">{Math.round(current.temp)}°</p>
      <p className="capitalize opacity-90">{current.condition.description}</p>
      <p className="text-sm opacity-80">
        Feels like {Math.round(current.feelsLike)}°
      </p>
      <div className="mt-4 flex gap-6 text-sm opacity-90">
        <span className="flex items-center gap-1.5">
          <Droplets className="h-4 w-4" /> {current.humidity}%
        </span>
        <span className="flex items-center gap-1.5">
          <Wind className="h-4 w-4" /> {Math.round(current.windSpeed)} {speedUnit}
        </span>
      </div>
    </div>
  )
}
