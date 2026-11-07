# Skycast

A weather dashboard for any city: current conditions, a 24-hour temperature chart, a multi-day forecast, air quality, wind, humidity, visibility and sunrise/sunset, with backgrounds that change with the weather and time of day.

**Live:** https://weather-webpage-alpha.vercel.app

## Features

- **City search with suggestions**, full keyboard support (↑ ↓ Enter Esc)
- **Use my location** (asks only when you press the button), named via reverse geocoding
- **Recent cities** you can jump back to or remove, plus a remembered last city and °C/°F choice
- **Instant °C/°F switching**: data is fetched once in metric and converted for display
- **Next 24 hours** chart with rain chance, and a **multi-day forecast** with range bars
- **Details:** feels like, humidity and dew point, wind with a compass, precipitation, pressure, visibility
- **Sun card** showing where the sun is between sunrise and sunset, in the city's local time
- **Air quality** index with PM2.5, PM10, O₃ and NO₂
- **Shareable links** (`?lat=&lon=&name=&country=`) and a Share button
- First visit defaults to a major city in your timezone, with no location prompt

All times and forecast days use the **city's** local time, not the visitor's.

## How it works

The frontend never holds the OpenWeatherMap API key. All requests go through a small serverless proxy (`../weather-proxy`, a separate Vercel project) that adds the key server-side. The proxy only forwards the five endpoints this app uses, validates every parameter, accepts browser requests only from this app's own origins, and caches responses at Vercel's edge.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run lint
npm run build     # type-check + production build
```

No environment variables are needed. `VITE_WEATHER_PROXY_URL` can point at a different proxy deployment (see `.env.example`).

Built with React 19, TypeScript, Vite, Tailwind CSS v4 and lucide-react icons.
