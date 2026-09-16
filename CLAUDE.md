# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Objective
Build a responsive, modern weather dashboard fetching real-time weather and air quality data using the OpenWeatherMap API. Key capabilities include browser geolocation auto-detection, metric/imperial unit toggling, 7-day visual forecasts, and dynamic CSS themes/backgrounds that dynamically react to current weather conditions (e.g., sunny, rainy, stormy, snowy).

Air quality originally targeted the OpenAQ API, but OpenAQ v3 requires an `X-API-Key` header on every request, including the browser's CORS preflight (`OPTIONS`) — which browsers never attach custom headers to. Their gateway rejects the preflight with 401 before the real request can fire, so OpenAQ v3 cannot be called from a pure static frontend without a backend proxy. Air quality now uses OpenWeatherMap's own Air Pollution API instead (same key, already proven CORS-friendly, and it returns a ready-made 1-5 AQI index).

## Deployment

This frontend is a pure static SPA with no server of its own — it never holds the OpenWeatherMap API key. All OpenWeatherMap calls go through a separate serverless proxy in the sibling `../weather-proxy` project, deployed independently on Vercel, which injects the real key server-side from its own `OWM_API_KEY` environment variable. This exists because Vite bakes any `VITE_*` env var straight into the client bundle — there is no way to keep an API key secret in a client-only app without a proxy like this.

- Frontend: deployed as its own Vercel project (`vansh1905/weather-webpage`), currently via `vercel deploy --prod` from this directory (no git integration configured yet — pushing to GitHub does not auto-deploy).
- Proxy: `vansh1905/weather-webpage-proxy`, a single serverless function at `weather-proxy/api/proxy.js` that forwards `?path=<openweathermap path>&...` to `https://api.openweathermap.org/<path>?...&appid=<real key>`. Deployed the same way from `../weather-proxy`.
- `VITE_WEATHER_PROXY_URL` (optional, see `.env.example`) overrides the proxy base URL the frontend calls; defaults to the deployed `https://weather-webpage-proxy.vercel.app/api/proxy` if unset, so a fresh clone works with zero configuration.
- GitHub Pages was considered but rejected: the GitHub repo is private, and GitHub Pages on the Free plan only works on public repos.
- A previous attempt at the proxy used a Vercel catch-all function (`api/[...path].js`) to preserve OpenWeatherMap's path structure. This didn't work — Vercel's bracket catch-all routing isn't reliably supported for plain (frameworkless) API functions, and it 404'd in production. The current `api/proxy.js` (fixed route, upstream path passed as a `path` query param) is deliberate — don't reintroduce the catch-all pattern without re-verifying it actually routes.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via `tsc -b` then production build via `vite build`
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally

There is no test runner configured in this project.

## Environment variables

No environment variables are required to run this frontend — see the Deployment section above for why. `VITE_WEATHER_PROXY_URL` (optional, in `.env.example`) only needs setting if you're pointing at a different proxy deployment.

`fetchAirQuality` must never throw — on any failure it resolves to `null` and the air quality card is simply omitted, rather than breaking the rest of the dashboard.


## Code Style
- **TypeScript & React:** Use functional components with explicit TypeScript interfaces/types for all props, states, and API responses. Avoid `any`.
- **CSS / Styling:** Use Tailwind CSS utility classes. Avoid arbitrary values; prefer standard theme scale tokens.
- **Naming Conventions:** 
  - Components: `PascalCase` (e.g., `ForecastCard.tsx`)
  - Utilities/Hooks: `camelCase` starting with `use` for custom hooks (e.g., `useGeolocation.ts`)
  - File exports: Prefer named exports over default exports for consistent imports.
- **Clean Code:** Keep components single-purpose and smaller than 150 lines where possible.

## Preferred Libraries
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + `clsx` / `tailwind-merge` for conditional class combinations
- **Icons:** `lucide-react` for UI icons and weather indicators
- **HTTP Client:** Native `fetch` API wrapped in reusable service modules (avoid importing Axios unless strictly required)

## Architecture

- Entry point: `src/main.tsx` mounts `<App />` from `src/App.tsx` into `#root` (defined in `index.html`).
- `src/App.tsx` is the orchestrator: owns `units` state, wires `useGeolocation` + `useWeather` together, drives the `geocodeCity` search flow, and picks the gradient theme from the current condition.
- `src/services/weatherService.ts` is the only module that talks to the network. It calls the weather proxy (see Deployment) with `?path=data/2.5/weather` / `forecast` / `air_pollution` / `geo/1.0/direct` (not One Call 3.0, which needs a separate paid-tier signup) and groups the 3-hourly forecast into daily min/max buckets client-side (`groupForecastByDay`). `fetchAirQuality` degrades to `null` on any failure — never throw out of it.
- `geocodeCity` returns the matched city's `name`/`country` alongside coordinates; the search flow in `App.tsx` passes these through to `fetchWeatherData` as a `locationOverride` rather than trusting `/data/2.5/weather`'s own reverse-geocoded name, which OpenWeatherMap sometimes gets wrong (e.g. it labels some Tokyo-area stations "Japan").
- `src/hooks/useGeolocation.ts` and `src/hooks/useWeather.ts` each own one `{ data/coords, error, loading }` slice; components only render, they don't fetch.
- `src/lib/weatherTheme.ts` maps an OpenWeatherMap condition `main` string (Clear/Clouds/Rain/...) to a Tailwind gradient + text color pair; `src/lib/weatherIcon.tsx` maps the same condition to a `lucide-react` icon. Add new conditions to both in lockstep.
- `src/components/WeatherIcon.tsx` centralizes the "look up an icon component and render it" pattern — oxlint's `react/static-components` rule flags this pattern wherever it's inlined, so keep all dynamic icon rendering behind this one component rather than re-inlining `getWeatherIcon` elsewhere.
- Styling is Tailwind CSS v4 via the `@tailwindcss/vite` plugin (`vite.config.ts`) with a single `@import "tailwindcss";` in `src/index.css` — no `tailwind.config.js`/content globs needed (v4 auto-detects). `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge) is the standard way to compose conditional class names.
- `src/vite-env.d.ts` augments `ImportMetaEnv` with the `VITE_*` keys — extend it there when adding new env vars, or `import.meta.env.X` won't type-check.
- Static assets served as-is go in `public/` (referenced by absolute path, e.g. `/icons.svg`).
- TypeScript config is split three ways: `tsconfig.json` is a references-only root, `tsconfig.app.json` covers `src/`, and `tsconfig.node.json` covers Vite config files (`vite.config.ts`).
- Linting uses oxlint (not ESLint), configured in `.oxlintrc.json` with the `react`, `typescript`, and `oxc` plugin sets. Type-aware lint rules are not enabled.
