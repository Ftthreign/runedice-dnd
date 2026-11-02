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
        <label className="font-mono text-xs font-semibold tracking-wider text-[#c7b5d1] uppercase">
          Active Turn (Player)
        </label>
        <button
          type="button"
          onClick={onOpenPlayerManager}
          className="font-mono text-[11px] text-[#eee3b0] hover:text-[#fff8e8] underline-offset-2 hover:underline cursor-pointer"
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
                'min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2a78]',
                isActive
                  ? 'border-[#eee3b0] bg-[#500071] text-[#eee3b0] shadow-[0_0_16px_rgba(238,227,176,0.3)]'
                  : 'border-[#70418a]/50 bg-[#200033]/80 text-[#c7b5d1] hover:border-[#8a2a78] hover:bg-[#35104a]/70 hover:text-[#fff8e8]'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold',
                  isActive
                    ? 'bg-[#eee3b0] text-[#200033]'
                    : 'bg-[#35104a] text-[#c7b5d1]'
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
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#70418a]/70 bg-[#200033]/50 px-3 py-2 text-xs font-mono text-[#c7b5d1] transition-all hover:border-[#eee3b0] hover:text-[#eee3b0] hover:bg-[#35104a]/50 flex-shrink-0 min-h-[42px] cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Hero</span>
        </button>
      </div>

      {sessionPlayers.length === 0 && (
        <div className="rounded-lg border border-[#70418a]/30 bg-[#200033]/60 p-2.5 text-center text-xs text-[#c7b5d1]">
          <User className="inline h-3.5 w-3.5 mr-1 text-[#eee3b0]" />
          No party members enrolled yet. Click &quot;Add Hero&quot; to begin.
        </div>
      )}
    </div>
  )
}

export default PlayerSelector
