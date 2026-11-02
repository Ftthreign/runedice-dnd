'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles } from 'lucide-react'
import { ArcaneButton } from '../../../components/ui/ArcaneButton'
import { springs } from '../../../lib/motion-tokens'
import { useFocusTrap } from '../../../lib/use-focus-trap'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  initialName?: string
  mode?: 'create' | 'rename'
}

export function SessionModal({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  mode = 'create',
}: SessionModalProps) {
  const [name, setName] = React.useState(initialName)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const modalRef = React.useRef<HTMLDivElement>(null)

  useFocusTrap(modalRef, isOpen)

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, initialName])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
    onClose()
  }

  const isCreate = mode === 'create'
  const title = isCreate ? 'Inscribe New Session' : 'Rename Session'
  const description = isCreate
    ? 'Create a campaign chamber to organize party rolls, players, and adventures.'
    : 'Bestow a new title upon this campaign chamber.'

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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={springs.gentle}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-subtle-border bg-surface-elevated p-6 text-text-primary shadow-[0_12px_36px_-4px_rgba(12,0,20,0.9)]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-parchment-gold" />
              <h2
                id="session-modal-title"
                className="font-serif text-xl font-bold tracking-wide text-text-primary"
              >
                {title}
              </h2>
            </div>
            <p className="mt-1 font-sans text-xs text-text-secondary leading-relaxed">
              {description}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="session-name-input"
                  className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase"
                >
                  Session Title
                </label>
                <input
                  ref={inputRef}
                  id="session-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Curse of Strahd or Friday D&D"
                  required
                  autoComplete="off"
                  className="mt-1.5 w-full rounded-xl border border-subtle-border/70 bg-inset-dark px-4 py-3 font-mono text-sm text-text-primary placeholder-text-secondary/40 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta focus-visible:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="mt-2 flex items-center justify-end gap-2.5">
                <ArcaneButton
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                >
                  Cancel
                </ArcaneButton>
                <ArcaneButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!name.trim()}
                >
                  {isCreate ? 'Create Session' : 'Save Title'}
                </ArcaneButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SessionModal
