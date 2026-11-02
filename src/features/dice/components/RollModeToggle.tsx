import type { RollMode } from '../types/dice-types'
import { ShieldAlert, Sparkles, CircleDot } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface RollModeToggleProps {
  mode: RollMode
  onChange: (mode: RollMode) => void
  disabled?: boolean
}

export function RollModeToggle({ mode, onChange, disabled }: RollModeToggleProps) {
  const modes: { id: RollMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <CircleDot className="h-3.5 w-3.5" />,
      description: 'Standard single roll',
    },
    {
      id: 'advantage',
      label: 'Advantage',
      icon: <Sparkles className="h-3.5 w-3.5" />,
      description: 'Roll 2d20, take higher',
    },
    {
      id: 'disadvantage',
      label: 'Disadvantage',
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
      description: 'Roll 2d20, take lower',
    },
  ]

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Roll Stance (D20)
        </label>
        <span className="text-[11px] text-text-secondary/70">D&D 5e Rules</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {modes.map((item) => {
          const isActive = mode === item.id

          let activeStyles = 'border-mystic-magenta bg-surface-elevated text-text-primary'
          if (item.id === 'advantage' && isActive) {
            activeStyles =
              'border-parchment-gold bg-surface-elevated text-parchment-gold shadow-[0_0_16px_rgba(238,227,176,0.35)]'
          } else if (item.id === 'disadvantage' && isActive) {
            activeStyles =
              'border-[#ff5a7e] bg-surface-elevated text-[#ffb4ab] shadow-[0_0_16px_rgba(142,25,52,0.4)]'
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              disabled={disabled}
              title={item.description}
              aria-pressed={isActive}
              className={cn(
                'flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 font-mono text-xs font-bold tracking-wider uppercase transition-all select-none',
                'min-h-[46px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-inset-dark',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isActive
                  ? activeStyles
                  : 'border-subtle-border/50 bg-inset-dark/80 text-text-secondary hover:border-mystic-magenta/60 hover:bg-surface-muted/60 hover:text-text-primary'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RollModeToggle
