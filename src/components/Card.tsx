import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface CardProps {
  title?: string
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function Card({ title, icon, className, children }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/10 backdrop-blur-xl',
        className,
      )}
    >
      {title && (
        <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
          {icon}
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
