'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { UserPlus, UserCheck, Trash2, Edit2, X, AlertCircle } from 'lucide-react'
import { useAppState } from '../../app-state/AppStateContext'
import { ArcaneButton } from '../../../components/ui/ArcaneButton'
import { springs } from '../../../lib/motion-tokens'
import { cn } from '../../../lib/utils'
import { useFocusTrap } from '../../../lib/use-focus-trap'

interface PlayerManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PlayerManagerModal({ isOpen, onClose }: PlayerManagerModalProps) {
  const {
    state,
    activeSession,
    activePlayer,
    createPlayer,
    renamePlayer,
    removePlayer,
    setActivePlayerId,
  } = useAppState()

  const [newName, setNewName] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [editingPlayerId, setEditingPlayerId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState('')

  const inputRef = React.useRef<HTMLInputElement>(null)
  const modalRef = React.useRef<HTMLDivElement>(null)

  useFocusTrap(modalRef, isOpen)

  React.useEffect(() => {
    if (isOpen) {
      setNewName('')
      setErrorMsg(null)
      setEditingPlayerId(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!activeSession) return null

  const sessionPlayers = state.players.filter(
    (p) => p.sessionId === activeSession.id
  )

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    // Case-insensitive duplicate check
    const isDuplicate = sessionPlayers.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (isDuplicate) {
      setErrorMsg(`An adventurer named "${trimmed}" is already in this party.`)
      return
    }

    const created = createPlayer(activeSession.id, trimmed)
    if (!created) {
      setErrorMsg('Failed to add adventurer. Limit reached.')
      return
    }

    setNewName('')
    setErrorMsg(null)
  }

  const handleSaveRename = (playerId: string) => {
    const trimmed = editingName.trim()
    if (!trimmed) {
      setEditingPlayerId(null)
      return
    }

    const isDuplicate = sessionPlayers.some(
      (p) => p.id !== playerId && p.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (isDuplicate) {
      setErrorMsg(`Name "${trimmed}" is already taken in this party.`)
      return
    }

    renamePlayer(playerId, trimmed)
    setEditingPlayerId(null)
    setEditingName('')
    setErrorMsg(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={springs.gentle}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-subtle-border bg-canvas-base p-5 sm:p-6 text-text-primary shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-subtle-border/40 pb-3">
              <div>
                <h2
                  id="player-modal-title"
                  className="font-serif text-xl font-bold text-text-primary"
                >
                  Party Roster
                </h2>
                <p className="font-mono text-xs text-text-secondary">
                  Campaign: <span className="text-parchment-gold">{activeSession.name}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inscribe New Hero Form */}
            <form onSubmit={handleAddPlayer} className="mt-4 border-b border-subtle-border/40 pb-4">
              <label
                htmlFor="new-player-input"
                className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase"
              >
                Enlist Adventurer
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  ref={inputRef}
                  id="new-player-input"
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    if (errorMsg) setErrorMsg(null)
                  }}
                  placeholder="Hero name (e.g. Geralt or Yennefer)"
                  autoComplete="off"
                  className="w-full rounded-xl border border-subtle-border/70 bg-inset-dark px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder-text-secondary/40 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta"
                />
                <ArcaneButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newName.trim()}
                  className="gap-1.5 px-4 flex-shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Enlist</span>
                </ArcaneButton>
              </div>

              {errorMsg && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#ff5a7e]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>

            {/* Roster List */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 py-1 pr-1">
              <div className="flex items-center justify-between text-xs text-text-secondary px-1 pb-1">
                <span className="font-mono uppercase tracking-wider text-[11px]">
                  Enrolled Heroes ({sessionPlayers.length})
                </span>
                <span className="text-[10px]">Click hero to set active turn</span>
              </div>

              {sessionPlayers.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-secondary">
                  No heroes currently enrolled in this party.
                </div>
              ) : (
                sessionPlayers.map((player) => {
                  const isActive = activePlayer?.id === player.id
                  const isEditing = editingPlayerId === player.id
                  const initial = player.name.charAt(0).toUpperCase() || '?'

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all',
                        isActive
                          ? 'border-parchment-gold bg-surface-elevated shadow-[0_0_14px_rgba(238,227,176,0.2)]'
                          : 'border-subtle-border/40 bg-inset-dark/80 hover:border-mystic-magenta'
                      )}
                    >
                      {/* Left: Avatar & Name */}
                      <div className="flex flex-1 items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
                            isActive
                              ? 'bg-parchment-gold text-inset-dark'
                              : 'bg-surface-muted text-text-secondary'
                          )}
                        >
                          {initial}
                        </div>

                        {isEditing ? (
                          <div className="flex flex-1 items-center gap-1.5">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(player.id)
                                if (e.key === 'Escape') setEditingPlayerId(null)
                              }}
                              className="w-full rounded-lg border border-mystic-magenta bg-inset-dark px-2 py-1 font-sans text-xs text-text-primary focus-visible:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(player.id)}
                              className="rounded bg-parchment-gold px-2 py-1 text-[11px] font-bold text-inset-dark cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActivePlayerId(activeSession.id, player.id)}
                            className="flex flex-1 items-center gap-2 text-left min-w-0 focus-visible:outline-none cursor-pointer"
                          >
                            <span
                              className={cn(
                                'truncate font-sans font-semibold text-sm',
                                isActive ? 'text-parchment-gold' : 'text-text-primary'
                              )}
                            >
                              {player.name}
                            </span>
                            {isActive && (
                              <span className="flex items-center gap-1 rounded bg-parchment-gold/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-parchment-gold uppercase tracking-wider">
                                <UserCheck className="h-3 w-3" />
                                Active
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Right: Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlayerId(player.id)
                              setEditingName(player.name)
                            }}
                            aria-label={`Rename ${player.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mystic-magenta cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePlayer(player.id)}
                            aria-label={`Remove ${player.name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#ffb4ab] hover:bg-fumble-crimson/60 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5a7e] cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end border-t border-subtle-border/30 pt-3">
              <ArcaneButton variant="ghost" size="sm" onClick={onClose}>
                Close Roster
              </ArcaneButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PlayerManagerModal
