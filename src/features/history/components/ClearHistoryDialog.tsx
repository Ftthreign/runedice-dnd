'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertCircle, X } from 'lucide-react'
import { ArcaneButton } from '../../../components/ui/ArcaneButton'
import { springs } from '../../../lib/motion-tokens'
import { useFocusTrap } from '../../../lib/use-focus-trap'

interface ClearHistoryDialogProps {
  isOpen: boolean
  sessionName: string
  onClose: () => void
  onConfirm: () => void
}

export function ClearHistoryDialog({
  isOpen,
  sessionName,
  onClose,
  onConfirm,
}: ClearHistoryDialogProps) {
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

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
            aria-describedby="clear-history-desc"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={springs.gentle}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#ff5a7e]/60 bg-[#2d0812] p-6 text-text-primary shadow-[0_12px_36px_-4px_rgba(142,25,52,0.8)]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel clear log"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#ffb4ab] transition-colors hover:bg-fumble-crimson/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a7e] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ff5a7e] bg-fumble-crimson/80 shadow-[0_0_16px_rgba(142,25,52,0.5)]">
                <AlertCircle className="h-6 w-6 text-[#ffdad6]" />
              </div>
              <div>
                <h2
                  id="clear-history-title"
                  className="font-serif text-lg font-bold text-[#ffdad6]"
                >
                  Purge Roll History?
                </h2>
                <span className="font-mono text-xs text-[#ffb4ab]">
                  Session: {sessionName}
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              id="clear-history-desc"
              className="mt-4 font-sans text-xs text-[#ffdad6]/90 leading-relaxed"
            >
              Are you sure you want to purge all recorded roll logs for{' '}
              <strong className="font-mono text-parchment-gold">"{sessionName}"</strong>?
              Enrolled party members and campaign settings will remain untouched.
            </p>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <ArcaneButton
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
              >
                Keep Log
              </ArcaneButton>
              <ArcaneButton
                type="button"
                variant="danger"
                size="md"
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
              >
                Purge Rolls
              </ArcaneButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ClearHistoryDialog
