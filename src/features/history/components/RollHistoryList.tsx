'use client'

import * as React from 'react'
import { History, Trash2, Dices } from 'lucide-react'
import { useAppState } from '../../app-state/AppStateContext'
import { RollHistoryItem } from './RollHistoryItem'
import { ClearHistoryDialog } from './ClearHistoryDialog'
import type { RollMode } from '../../dice/types/dice-types'
import { MAX_HISTORY_PER_SESSION } from '../services/history-service'

interface RollHistoryListProps {
  onReroll: (formula: string, mode: RollMode) => void
}

export function RollHistoryList({ onReroll }: RollHistoryListProps) {
  const { activeSession, activeSessionRolls, clearRollHistory } = useAppState()
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false)

  if (!activeSession) return null

  const hasRolls = activeSessionRolls.length > 0

  return (
    <div className="flex flex-col rounded-2xl border border-[#70418a]/60 bg-[#290044]/90 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(16,0,28,0.7)] backdrop-blur-sm">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-[#70418a]/40 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#eee3b0]" />
          <h3 className="font-serif text-base font-bold text-[#fff8e8]">
            Roll Audit Trail
          </h3>
          <span className="rounded-full bg-[#500071] px-2 py-0.5 font-mono text-[10px] font-bold text-[#eee3b0]">
            {activeSessionRolls.length}/{MAX_HISTORY_PER_SESSION}
          </span>
        </div>

        {hasRolls && (
          <button
            type="button"
            onClick={() => setIsClearDialogOpen(true)}
            title="Clear roll history"
            aria-label="Clear session roll history"
            className="flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[11px] text-[#ffb4ab] transition-colors hover:bg-[#8e1934]/40 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5a7e] cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Purge</span>
          </button>
        )}
      </div>

      {/* Feed Body */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1 scrollbar-thin">
        {!hasRolls ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#70418a]/40 bg-[#200033]/80 text-[#c7b5d1]">
              <Dices className="h-6 w-6 opacity-40" />
            </div>
            <p className="mt-3 font-serif text-sm font-semibold text-[#fff8e8]">
              No Rolls Inscribed
            </p>
            <p className="mt-1 max-w-xs font-sans text-xs text-[#c7b5d1]/70 leading-relaxed">
              Every roll made in <span className="text-[#eee3b0] font-mono">{activeSession.name}</span> will be audited here in real-time.
            </p>
          </div>
        ) : (
          activeSessionRolls.map((roll) => (
            <RollHistoryItem key={roll.id} roll={roll} onReroll={onReroll} />
          ))
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearHistoryDialog
        isOpen={isClearDialogOpen}
        sessionName={activeSession.name}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={() => clearRollHistory(activeSession.id)}
      />
    </div>
  )
}

export default RollHistoryList
