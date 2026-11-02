import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ArcaneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'inset' | 'muted'
  hasGlow?: boolean
  glowColor?: 'magenta' | 'gold' | 'crimson'
}

export const ArcaneCard = React.forwardRef<HTMLDivElement, ArcaneCardProps>(
  ({ className, variant = 'elevated', hasGlow = false, glowColor = 'magenta', children, ...props }, ref) => {
    const variantStyles = {
      elevated: 'bg-[#500071]/80 border border-[#70418a]/60 shadow-[0_4px_16px_-2px_rgba(16,0,28,0.7)] backdrop-blur-sm',
      inset: 'bg-[#200033]/90 border border-[#70418a]/40 shadow-inner',
      muted: 'bg-[#35104a]/70 border border-[#70418a]/30',
    }

    const glowStyles = {
      magenta: 'shadow-[0_0_24px_-2px_rgba(138,42,120,0.45)] border-[#8a2a78]',
      gold: 'shadow-[0_0_30px_2px_rgba(238,227,176,0.35)] border-[#eee3b0]',
      crimson: 'shadow-[0_0_24px_2px_rgba(142,25,52,0.45)] border-[#8e1934]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-4 sm:p-6 transition-all duration-300',
          variantStyles[variant],
          hasGlow && glowStyles[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ArcaneCard.displayName = 'ArcaneCard'
export default ArcaneCard
