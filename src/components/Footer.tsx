export function Footer() {
  return (
    <footer className="mt-auto pt-10 text-center text-xs text-white/60">
      <p>
        Weather data from{' '}
        <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
          OpenWeatherMap
        </a>
        . Built by{' '}
        <a href="https://vansh-168.github.io/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
          Vansh Tyagi
        </a>
        .
      </p>
    </footer>
  )
}
