'use client'

import { User, Plus } from 'lucide-react'
import { useAppState } from '../../app-state/AppStateContext'
import { cn } from '../../../lib/utils'

interface PlayerSelectorProps {
  onOpenPlayerManager: () => void
}

export function PlayerSelector({ onOpenPlayerManager }: PlayerSelectorProps) {
  const { state, activeSession, activePlayer, setActivePlayerId } = useAppState()

  if (!activeSession) return null

  const sessionPlayers = state.players.filter(
    (p) => p.sessionId === activeSession.id
  )

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Active Turn (Player)
        </label>
        <button
          type="button"
          onClick={onOpenPlayerManager}
          className="font-mono text-[11px] text-parchment-gold hover:text-text-primary underline-offset-2 hover:underline cursor-pointer"
        >
          Manage Party ({sessionPlayers.length})
        </button>
      </div>

      {/* Horizontal Chip Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {sessionPlayers.map((player) => {
          const isActive = activePlayer?.id === player.id
          const initial = player.name.charAt(0).toUpperCase() || '?'

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => setActivePlayerId(activeSession.id, player.id)}
              aria-pressed={isActive}
              className={cn(
                'group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all select-none flex-shrink-0 cursor-pointer',
                'min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta',
                isActive
                  ? 'border-parchment-gold bg-surface-elevated text-parchment-gold shadow-[0_0_16px_rgba(238,227,176,0.3)]'
                  : 'border-subtle-border/50 bg-inset-dark/80 text-text-secondary hover:border-mystic-magenta hover:bg-surface-muted/70 hover:text-text-primary'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold',
                  isActive
                    ? 'bg-parchment-gold text-inset-dark'
                    : 'bg-surface-muted text-text-secondary'
                )}
              >
                {initial}
              </div>
              <span className="font-sans font-semibold tracking-wide">
                {player.name}
              </span>
            </button>
          )
        })}

        {/* Quick Add Adventurer Button */}
        <button
          type="button"
          onClick={onOpenPlayerManager}
          aria-label="Add new adventurer"
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-subtle-border/70 bg-inset-dark/50 px-3 py-2 text-xs font-mono text-text-secondary transition-all hover:border-parchment-gold hover:text-parchment-gold hover:bg-surface-muted/50 flex-shrink-0 min-h-[42px] cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Hero</span>
        </button>
      </div>

      {sessionPlayers.length === 0 && (
        <div className="rounded-lg border border-subtle-border/30 bg-inset-dark/60 p-2.5 text-center text-xs text-text-secondary">
          <User className="inline h-3.5 w-3.5 mr-1 text-parchment-gold" />
          No party members enrolled yet. Click &quot;Add Hero&quot; to begin.
        </div>
      )}
    </div>
  )
}

export default PlayerSelector
