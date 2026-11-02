import * as React from 'react'
import { DiceSelector } from './DiceSelector'
import { FormulaBar } from './FormulaBar'
import { RollModeToggle } from './RollModeToggle'
import { ModifierControl } from './ModifierControl'
import { RollResultPanel } from './RollResultPanel'
import { ArcaneButton } from '../../../components/ui/ArcaneButton'
import { evaluateRoll } from '../engine/dice-evaluator'
import { parseDiceFormula, validateDiceFormula } from '../engine/dice-parser'
import type { DieType, DiceRollResult, RollMode } from '../types/dice-types'
import { Dices, RotateCcw } from 'lucide-react'

interface DiceWorkspaceProps {
  activeSessionName?: string
  activePlayerName?: string
  onRollComplete?: (result: DiceRollResult) => void
}

export function DiceWorkspace({
  activeSessionName = 'The Lost Temple',
  activePlayerName = 'Fadhil',
  onRollComplete,
}: DiceWorkspaceProps) {
  const [formula, setFormula] = React.useState<string>('1d20')
  const [mode, setMode] = React.useState<RollMode>('normal')
  const [standaloneModifier, setStandaloneModifier] = React.useState<number>(0)
  const [lastResult, setLastResult] = React.useState<DiceRollResult | null>(null)
  const [isRolling, setIsRolling] = React.useState<boolean>(false)

  // Compute dice counts from current formula to highlight in DiceSelector
  const diceCounts = React.useMemo(() => {
    try {
      const parsed = parseDiceFormula(formula)
      const counts: Partial<Record<DieType, number>> = {}
      for (const term of parsed.terms) {
        if (term.type === 'die' && term.sign === 1) {
          const key = `d${term.sides}` as DieType
          counts[key] = (counts[key] || 0) + term.count
        }
      }
      return counts
    } catch {
      return {}
    }
  }, [formula])

  // Handle clicking a die button
  const handleAddDie = (die: DieType) => {
    try {
      const parsed = parseDiceFormula(formula)
      const sides = parseInt(die.replace('d', ''), 10)
      let found = false

      // Check if this die type already exists with positive sign
      for (const term of parsed.terms) {
        if (term.type === 'die' && term.sides === sides && term.sign === 1) {
          term.count += 1
          found = true
          break
        }
      }

      if (!found) {
        // Append new die term
        parsed.terms.push({
          type: 'die',
          count: 1,
          sides,
          sign: 1,
        })
      }

      // Reconstruct formula string
      const reconstructed = parsed.terms
        .map((t, idx) => {
          const signStr = idx === 0 ? (t.sign === -1 ? '-' : '') : t.sign === 1 ? ' + ' : ' - '
          if (t.type === 'die') {
            return `${signStr}${t.count}d${t.sides}`
          } else {
            return `${signStr}${t.value}`
          }
        })
        .join('')

      setFormula(reconstructed)
    } catch {
      // If formula was empty or invalid, replace with 1die
      setFormula(`1${die}`)
    }
  }

  // Handle right-click/remove a die
  const handleRemoveDie = (die: DieType) => {
    try {
      const parsed = parseDiceFormula(formula)
      const sides = parseInt(die.replace('d', ''), 10)

      for (let i = 0; i < parsed.terms.length; i++) {
        const term = parsed.terms[i]
        if (term.type === 'die' && term.sides === sides && term.sign === 1) {
          term.count -= 1
          if (term.count <= 0) {
            parsed.terms.splice(i, 1)
          }
          break
        }
      }

      if (parsed.terms.length === 0) {
        setFormula('')
        return
      }

      const reconstructed = parsed.terms
        .map((t, idx) => {
          const signStr = idx === 0 ? (t.sign === -1 ? '-' : '') : t.sign === 1 ? ' + ' : ' - '
          if (t.type === 'die') {
            return `${signStr}${t.count}d${t.sides}`
          } else {
            return `${signStr}${t.value}`
          }
        })
        .join('')

      setFormula(reconstructed)
    } catch {
      // Ignore
    }
  }

  // Execute the roll
  const handleRoll = () => {
    if (!formula.trim()) return
    const validation = validateDiceFormula(formula)
    if (!validation.isValid) return

    setIsRolling(true)

    // Brief satisfying rolling micro-animation
    setTimeout(() => {
      try {
        const result = evaluateRoll(formula, mode, standaloneModifier)
        setLastResult(result)
        setIsRolling(false)
        if (onRollComplete) {
          onRollComplete(result)
        }
      } catch (err) {
        setIsRolling(false)
      }
    }, 200)
  }

  const isValid = validateDiceFormula(formula).isValid && !!formula.trim()

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6">
      {/* Workspace Grid: 2 Columns on Desktop, Single Column on Mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* Left Column: Interactive Controls Stage (7 cols on Desktop) */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          {/* Formula Inscription Bar */}
          <FormulaBar
            value={formula}
            onChange={setFormula}
            onRoll={handleRoll}
            disabled={isRolling}
          />

          {/* Polyhedral Dice Selector */}
          <DiceSelector
            diceCounts={diceCounts}
            onAddDie={handleAddDie}
            onRemoveDie={handleRemoveDie}
            disabled={isRolling}
          />

          {/* Modifier & Advantage Stance */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModifierControl
              value={standaloneModifier}
              onChange={setStandaloneModifier}
              disabled={isRolling}
            />
            <RollModeToggle
              mode={mode}
              onChange={setMode}
              disabled={isRolling}
            />
          </div>

          {/* Primary Action Button (Roll / Cast) */}
          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
            <ArcaneButton
              variant="primary"
              size="lg"
              onClick={handleRoll}
              disabled={!isValid || isRolling}
              className="flex-1 gap-2 shadow-[0_0_24px_rgba(238,227,176,0.35)]"
            >
              <Dices className="h-5 w-5" />
              <span>{isRolling ? 'Casting...' : 'Roll The Runes'}</span>
            </ArcaneButton>

            <ArcaneButton
              variant="secondary"
              size="lg"
              onClick={() => {
                setFormula('1d20')
                setMode('normal')
                setStandaloneModifier(0)
              }}
              disabled={isRolling}
              title="Reset to 1d20"
              className="sm:w-auto px-4"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden ml-2">Reset</span>
            </ArcaneButton>
          </div>
        </div>

        {/* Right Column: Grand Roll Result Panel (5 cols on Desktop) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold tracking-wider text-[#fff8e8]">
              Roll Outcome
            </h2>
            <span className="font-mono text-xs text-[#c7b5d1]">
              Live Audit Log
            </span>
          </div>

          <RollResultPanel
            result={lastResult}
            isRolling={isRolling}
            playerName={activePlayerName}
            sessionName={activeSessionName}
          />
        </div>
      </div>
    </div>
  )
}

export default DiceWorkspace
