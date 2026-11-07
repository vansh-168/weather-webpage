import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudSun,
  CloudSunRain,
  Cloudy,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import type { WeatherCondition } from '../types/weather'

// Keyed by OpenWeatherMap icon code ("01d", "10n", …), which already encodes
// both the condition group and day/night.
const BY_CODE: Record<string, LucideIcon> = {
  '01d': Sun,
  '01n': Moon,
  '02d': CloudSun,
  '02n': CloudMoon,
  '03d': Cloud,
  '03n': Cloud,
  '04d': Cloudy,
  '04n': Cloudy,
  '09d': CloudDrizzle,
  '09n': CloudDrizzle,
  '10d': CloudSunRain,
  '10n': CloudMoonRain,
  '11d': CloudLightning,
  '11n': CloudLightning,
  '13d': Snowflake,
  '13n': Snowflake,
  '50d': CloudFog,
  '50n': CloudFog,
}

const BY_MAIN: Record<string, LucideIcon> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: Snowflake,
}

export function getWeatherIcon(condition: WeatherCondition): LucideIcon {
  return BY_CODE[condition.icon] ?? BY_MAIN[condition.main] ?? CloudFog
}
