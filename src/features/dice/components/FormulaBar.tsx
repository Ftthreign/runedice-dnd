import * as React from 'react'
import { X, AlertCircle } from 'lucide-react'
import { validateDiceFormula } from '../engine/dice-parser'
import { cn } from '../../../lib/utils'

interface FormulaBarProps {
  value: string
  onChange: (val: string) => void
  onRoll: () => void
  disabled?: boolean
}

export function FormulaBar({ value, onChange, onRoll, disabled }: FormulaBarProps) {
  const validation = React.useMemo(() => {
    if (!value.trim()) return { isValid: true }
    return validateDiceFormula(value)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && validation.isValid && value.trim()) {
      e.preventDefault()
      onRoll()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor="dice-formula-input"
          className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase"
        >
          Formula Inscription
        </label>
        {value && (
          <span className="font-mono text-[10px] text-text-secondary/70">
            Press [Enter] to roll
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          id="dice-formula-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="e.g. 1d20 + 5 or 2d6 + 1d4 + 3"
          aria-invalid={!validation.isValid}
          aria-describedby={!validation.isValid ? 'formula-error-msg' : undefined}
          autoComplete="off"
          spellCheck="false"
          className={cn(
            'w-full rounded-xl border bg-inset-dark/90 px-4 py-3.5 pr-11 font-mono text-base font-semibold text-text-primary placeholder-text-secondary/40 transition-all shadow-inner',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-inset-dark',
            !validation.isValid && value.trim()
              ? 'border-[#ff5a7e] ring-1 ring-[#ff5a7e]'
              : 'border-subtle-border/60 focus-visible:border-mystic-magenta'
          )}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear formula"
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mystic-magenta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation error display */}
      {!validation.isValid && value.trim() && (
        <div
          id="formula-error-msg"
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-[#ff5a7e]"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}
    </div>
  )
}

export default FormulaBar
