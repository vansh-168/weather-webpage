import { RefreshCw } from 'lucide-react'

interface StatusMessageProps {
  message: string
  onRetry?: () => void
}

export function StatusMessage({ message, onRetry }: StatusMessageProps) {
  return (
    <div role="alert" className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xl">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
