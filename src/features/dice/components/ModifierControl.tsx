import { Plus, Minus } from 'lucide-react'

interface ModifierControlProps {
  value: number
  onChange: (val: number) => void
  disabled?: boolean
}

export function ModifierControl({ value, onChange, disabled }: ModifierControlProps) {
  const handleStep = (delta: number) => {
    onChange(value + delta)
  }

  const presets = [-2, 0, 2, 3, 5]

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Static Modifier
        </label>
        <span className="font-mono text-xs font-bold text-parchment-gold">
          {value >= 0 ? `+${value}` : value}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={disabled}
          aria-label="Decrease modifier by 1"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle-border/60 bg-inset-dark text-text-secondary transition-colors hover:border-mystic-magenta hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta disabled:opacity-40 cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Numeric Input */}
        <div className="relative flex-1">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10)
              onChange(isNaN(num) ? 0 : num)
            }}
            disabled={disabled}
            aria-label="Modifier value"
            className="w-full rounded-xl border border-subtle-border/60 bg-inset-dark/90 py-2.5 text-center font-mono text-base font-bold text-text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta"
          />
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={disabled}
          aria-label="Increase modifier by 1"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle-border/60 bg-inset-dark text-text-secondary transition-colors hover:border-mystic-magenta hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Modifier Presets */}
      <div className="mt-2 flex items-center justify-between gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            disabled={disabled}
            className={`flex-1 rounded-lg border py-1 font-mono text-[11px] font-semibold transition-all ${
              value === preset
                ? 'border-mystic-magenta bg-surface-elevated text-parchment-gold'
                : 'border-subtle-border/40 bg-inset-dark/70 text-text-secondary hover:border-mystic-magenta hover:text-text-primary'
            }`}
          >
            {preset > 0 ? `+${preset}` : preset}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModifierControl
