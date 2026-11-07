const block = 'animate-pulse rounded-3xl bg-white/10'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Loading weather…</span>
      <div className="flex flex-col gap-3">
        <div className={`${block} h-4 w-32`} />
        <div className={`${block} h-12 w-64`} />
        <div className={`${block} h-28 w-48`} />
        <div className={`${block} h-5 w-72`} />
      </div>
      <div className={`${block} h-56`} />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className={`${block} h-80 lg:col-span-3`} />
        <div className={`${block} h-80 lg:col-span-2`} />
      </div>
    </div>
  )
}
