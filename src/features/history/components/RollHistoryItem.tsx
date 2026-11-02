'use client'

import * as React from 'react'
import type { DiceRoll } from '../../../types/app-state'
import type { RollMode } from '../../dice/types/dice-types'
import { RotateCcw, Clock, Sparkles, Skull } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface RollHistoryItemProps {
  roll: DiceRoll
  onReroll: (formula: string, mode: RollMode) => void
}

export function RollHistoryItem({ roll, onReroll }: RollHistoryItemProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formattedTime = mounted
    ? new Date(roll.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : ''

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border p-3 transition-all',
        roll.isNatural20
          ? 'border-parchment-gold/70 bg-surface-elevated/90 shadow-[0_0_16px_rgba(238,227,176,0.25)]'
          : roll.isNatural1
            ? 'border-[#ff5a7e]/60 bg-[#350a14]/80 shadow-[0_0_14px_rgba(142,25,52,0.3)]'
            : 'border-subtle-border/40 bg-inset-dark/85 hover:border-mystic-magenta hover:bg-surface-muted/50'
      )}
    >
      {/* Top Row: Player Snapshot, Mode, Timestamp & Re-roll Action */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded bg-surface-elevated border border-subtle-border/60 px-2 py-0.5 text-[11px] font-bold text-parchment-gold">
            {roll.playerNameSnapshot}
          </span>

          {roll.mode !== 'normal' && (
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                roll.mode === 'advantage'
                  ? 'bg-parchment-gold text-inset-dark'
                  : 'bg-fumble-crimson text-text-primary'
              )}
            >
              {roll.mode}
            </span>
          )}

          {roll.isNatural20 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-parchment-gold">
              <Sparkles className="h-3 w-3" />
              <span>NAT 20</span>
            </span>
          )}

          {roll.isNatural1 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff5a7e]">
              <Skull className="h-3 w-3" />
              <span>NAT 1</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {formattedTime && (
            <span className="flex items-center gap-1 text-[10px] text-text-secondary/70">
              <Clock className="h-3 w-3" />
              {formattedTime}
            </span>
          )}

          {/* Quick Re-roll Trigger */}
          <button
            type="button"
            onClick={() => onReroll(roll.formula, roll.mode)}
            title={`Re-roll ${roll.formula}`}
            aria-label={`Re-roll ${roll.formula}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-subtle-border/40 bg-surface-muted/70 text-text-secondary transition-all hover:border-parchment-gold hover:bg-parchment-gold hover:text-inset-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mystic-magenta cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Middle Row: Formula & Prominent Total */}
      <div className="flex items-center justify-between border-t border-subtle-border/30 pt-2">
        <div className="font-mono text-xs text-text-secondary">
          <span>Formula: </span>
          <span className="font-bold text-text-primary">{roll.formula}</span>
        </div>

        <div
          className={cn(
            'font-mono text-2xl font-black select-none',
            roll.isNatural20
              ? 'text-parchment-gold drop-shadow-[0_0_10px_rgba(238,227,176,0.6)]'
              : roll.isNatural1
                ? 'text-[#ff5a7e]'
                : 'text-text-primary'
          )}
        >
          {roll.total}
        </div>
      </div>

      {/* Bottom Row: Individual Dice Breakdown Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {roll.allRolls.map((die) => (
          <span
            key={die.id}
            className={cn(
              'rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold',
              die.isDropped
                ? 'border-subtle-border/30 bg-inset-dark/50 text-text-secondary/40 line-through'
                : die.sides === 20 && die.value === 20
                  ? 'border-parchment-gold bg-parchment-gold/20 text-parchment-gold'
                  : die.sides === 20 && die.value === 1
                    ? 'border-fumble-crimson bg-fumble-crimson/20 text-[#ff5a7e]'
                    : 'border-subtle-border/60 bg-surface-elevated/60 text-text-primary'
            )}
          >
            d{die.sides}:{die.value}
          </span>
        ))}

        {roll.modifier !== 0 && (
          <span className="rounded border border-subtle-border/40 bg-surface-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-parchment-gold">
            Mod: {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
          </span>
        )}
      </div>
    </div>
  )
}

export default RollHistoryItem
