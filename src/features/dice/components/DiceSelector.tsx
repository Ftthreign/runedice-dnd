'use client'

import { motion } from "motion/react";
import { SUPPORTED_DICE, type DieType } from "../types/dice-types";
import { springs } from "../../../lib/motion-tokens";
import { cn } from "../../../lib/utils";

interface DiceSelectorProps {
  /**
   * Current counts of dice in formula (e.g. { d20: 1, d6: 2 })
   */
  diceCounts?: Partial<Record<DieType, number>>;
  onAddDie: (die: DieType) => void;
  onRemoveDie?: (die: DieType) => void;
  disabled?: boolean;
}

// Geometric Arcane SVG icons for each polyhedral die
function DieIcon({ die, className }: { die: DieType; className?: string }) {
  switch (die) {
    case "d4":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,3 2,20 22,20" />
          <line
            x1="12"
            y1="3"
            x2="12"
            y2="20"
            strokeDasharray="1 1"
            opacity="0.6"
          />
        </svg>
      );
    case "d6":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "d8":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,2 21,12 12,22 3,12" />
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="22"
            strokeDasharray="1 1"
            opacity="0.6"
          />
          <line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
            strokeDasharray="1 1"
            opacity="0.6"
          />
        </svg>
      );
    case "d10":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,2 21,9 12,22 3,9" />
          <line x1="12" y1="2" x2="12" y2="22" opacity="0.5" />
          <line x1="3" y1="9" x2="21" y2="9" opacity="0.5" />
        </svg>
      );
    case "d12":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,2 21,8 18,19 6,19 3,8" />
          <circle cx="12" cy="12" r="3" strokeWidth="1.2" opacity="0.6" />
        </svg>
      );
    case "d20":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
          <polygon points="12,6 18,16 6,16" strokeWidth="1.2" opacity="0.7" />
        </svg>
      );
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={className}
        >
          <polygon points="12,2 20,8 18,20 6,20 4,8" />
          <text
            x="12"
            y="14"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="currentColor"
            stroke="none"
            fontFamily="monospace"
          >
            %
          </text>
        </svg>
      );
  }
}

export function DiceSelector({
  diceCounts = {},
  onAddDie,
  onRemoveDie,
  disabled = false,
}: DiceSelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="font-mono text-xs font-semibold tracking-wider text-text-secondary uppercase">
          Arcane Polyhedrals
        </label>
        <span className="text-[11px] text-text-secondary/70">
          Click to add • Right-click to remove
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-2.5">
        {SUPPORTED_DICE.map((die) => {
          const count = diceCounts[die] || 0;
          const hasCount = count > 0;

          return (
            <motion.button
              key={die}
              type="button"
              whileTap={{ scale: disabled ? 1 : 0.94 }}
              transition={springs.snappy}
              onClick={() => onAddDie(die)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (onRemoveDie && hasCount) {
                  onRemoveDie(die);
                }
              }}
              disabled={disabled}
              aria-label={`Add ${die} (currently ${count})`}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-xl border p-2 sm:p-2.5 transition-all select-none",
                "min-h-[58px] sm:min-h-[64px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-inset-dark",
                "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                hasCount
                  ? "border-mystic-magenta bg-surface-elevated text-text-primary shadow-[0_0_18px_rgba(138,42,120,0.4)]"
                  : "border-subtle-border/50 bg-inset-dark/90 text-text-secondary hover:border-mystic-magenta/80 hover:bg-surface-muted/70 hover:text-text-primary",
              )}
            >
              {/* Badge for count */}
              {hasCount && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-parchment-gold px-1 font-mono text-[11px] font-bold text-inset-dark shadow-md">
                  {count}
                </span>
              )}

              {/* Die Icon */}
              <DieIcon
                die={die}
                className={cn(
                  "h-6 w-6 transition-transform duration-200 group-hover:scale-110 sm:h-7 sm:w-7",
                  hasCount
                    ? "text-parchment-gold"
                    : "text-text-secondary group-hover:text-parchment-gold",
                )}
              />

              {/* Die Label */}
              <span className="mt-1 font-mono text-[11px] font-bold tracking-wider uppercase sm:text-xs">
                {die.toUpperCase()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default DiceSelector;
