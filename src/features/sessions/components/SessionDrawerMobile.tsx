'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Edit2, Trash2, Check, Layers, X } from 'lucide-react'
import { useAppState } from '../../app-state/AppStateContext'
import { ArcaneButton } from '../../../components/ui/ArcaneButton'
import { springs } from '../../../lib/motion-tokens'
import { cn } from '../../../lib/utils'
import { useFocusTrap } from '../../../lib/use-focus-trap'

interface SessionDrawerMobileProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreateModal: () => void
  onOpenRenameModal: (sessionId: string, currentName: string) => void
  onOpenDeleteDialog: (sessionId: string, sessionName: string) => void
}

export function SessionDrawerMobile({
  isOpen,
  onClose,
  onOpenCreateModal,
  onOpenRenameModal,
  onOpenDeleteDialog,
}: SessionDrawerMobileProps) {
  const { state, activeSession, setActiveSessionId } = useAppState()
  const modalRef = React.useRef<HTMLDivElement>(null)

  useFocusTrap(modalRef, isOpen)

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer / Card Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-drawer-title"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={springs.gentle}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-[#70418a] bg-[#290044] p-5 text-[#fff8e8] shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#70418a]/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#70418a] bg-[#500071]">
                  <Layers className="h-5 w-5 text-[#eee3b0]" />
                </div>
                <div>
                  <h2
                    id="session-drawer-title"
                    className="font-serif text-lg font-bold text-[#fff8e8]"
                  >
                    Campaign Chambers
                  </h2>
                  <span className="font-mono text-[10px] text-[#c7b5d1]">
                    Manage active campaigns & roll histories
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close session menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#c7b5d1] transition-colors hover:bg-[#35104a] hover:text-[#fff8e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2a78] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Create Action */}
            <div className="my-3">
              <ArcaneButton
                variant="primary"
                size="md"
                onClick={() => {
                  onClose()
                  onOpenCreateModal()
                }}
                className="w-full gap-2 shadow-[0_0_16px_rgba(238,227,176,0.3)]"
              >
                <Plus className="h-4 w-4" />
                <span>Inscribe New Session</span>
              </ArcaneButton>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
              {state.sessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#c7b5d1]">
                  No sessions exist. Click above to inscribe one.
                </div>
              ) : (
                state.sessions.map((session) => {
                  const isActive = activeSession?.id === session.id
                  const playerCount = state.players.filter(
                    (p) => p.sessionId === session.id
                  ).length
                  const rollCount = state.rolls.filter(
                    (r) => r.sessionId === session.id
                  ).length

                  return (
                    <div
                      key={session.id}
                      className={cn(
                        'group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all',
                        isActive
                          ? 'border-[#eee3b0] bg-[#500071] shadow-[0_0_16px_rgba(238,227,176,0.25)]'
                          : 'border-[#70418a]/40 bg-[#200033]/80 hover:border-[#8a2a78] hover:bg-[#35104a]/60'
                      )}
                    >
                      {/* Left: Click to Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionId(session.id)
                          onClose()
                        }}
                        className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none cursor-pointer"
                      >
                        <div
                          className={cn(
                            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border',
                            isActive
                              ? 'border-[#eee3b0] bg-[#eee3b0] text-[#200033]'
                              : 'border-[#70418a] text-transparent'
                          )}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'truncate font-serif text-sm font-bold',
                              isActive ? 'text-[#eee3b0]' : 'text-[#fff8e8]'
                            )}
                          >
                            {session.name}
                          </p>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-[#c7b5d1]">
                            <span>{playerCount} Players</span>
                            <span>•</span>
                            <span>{rollCount} Rolls</span>
                          </div>
                        </div>
                      </button>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenRenameModal(session.id, session.name)
                          }}
                          aria-label={`Rename ${session.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#c7b5d1] hover:bg-[#35104a] hover:text-[#fff8e8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8a2a78] cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {(() => {
                          const isOnlySession = state.sessions.length <= 1
                          return (
                            <button
                              type="button"
                              disabled={isOnlySession}
                              onClick={() => {
                                if (isOnlySession) return
                                onClose()
                                onOpenDeleteDialog(session.id, session.name)
                              }}
                              aria-label={
                                isOnlySession
                                  ? 'At least one campaign chamber must remain'
                                  : `Delete ${session.name}`
                              }
                              title={
                                isOnlySession
                                  ? 'At least one campaign chamber must remain'
                                  : `Delete ${session.name}`
                              }
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                isOnlySession
                                  ? 'text-[#70418a]/40 cursor-not-allowed opacity-40'
                                  : 'text-[#ffb4ab] hover:bg-[#8e1934]/60 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5a7e] cursor-pointer'
                              )}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SessionDrawerMobile
