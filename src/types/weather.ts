export type Units = 'metric' | 'imperial'

export interface Coordinates {
  lat: number
  lon: number
}

/** A named location. `state` is the region/province when OpenWeatherMap knows it. */
export interface Place extends Coordinates {
  name: string
  country: string
  state?: string
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  /** OpenWeatherMap icon code, e.g. "01d" (clear, day) or "10n" (rain, night). */
  icon: string
}

/** All values are metric (°C, m/s, metres, hPa, mm); convert for display only. */
export interface CurrentWeather {
  dt: number
  temp: number
  feelsLike: number
  humidity: number
  pressure: number
  visibility: number | null
  windSpeed: number
  windDeg: number
  windGust: number | null
  clouds: number
  rainLastHour: number | null
  snowLastHour: number | null
  sunrise: number
  sunset: number
  condition: WeatherCondition
}

export interface HourlyPoint {
  dt: number
  temp: number
  /** Probability of precipitation, 0–1. */
  pop: number
  condition: WeatherCondition
}

export interface DailyForecast {
  /** City-local date, YYYY-MM-DD. */
  date: string
  tempMin: number
  tempMax: number
  pop: number
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

export interface WeatherData {
  place: Place
  /** City's offset from UTC, in seconds. */
  timezoneOffset: number
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyForecast[]
  airQuality: AirQuality | null
}
