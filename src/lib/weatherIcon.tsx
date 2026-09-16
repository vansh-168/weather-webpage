import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  type LucideIcon,
} from 'lucide-react'

const ICONS_BY_CONDITION: Record<string, LucideIcon> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: CloudFog,
  Smoke: CloudFog,
  Haze: CloudFog,
  Dust: CloudFog,
  Fog: CloudFog,
  Sand: CloudFog,
  Ash: CloudFog,
}

export function getWeatherIcon(conditionMain: string): LucideIcon {
  return ICONS_BY_CONDITION[conditionMain] ?? Cloud
}
