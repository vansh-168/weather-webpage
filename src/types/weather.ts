export type Units = 'metric' | 'imperial'

export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  dt: number
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: WeatherCondition
}

export interface DailyForecast {
  dt: number
  tempMin: number
  tempMax: number
  condition: WeatherCondition
}

export interface AirQuality {
  aqi: number
  components: {
    pm2_5: number
    pm10: number
    o3: number
    no2: number
  }
}

export interface LocationInfo {
  name: string
  country: string
}

export interface WeatherData {
  location: LocationInfo
  current: CurrentWeather
  daily: DailyForecast[]
  airQuality: AirQuality | null
}
