/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
