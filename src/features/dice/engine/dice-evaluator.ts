import { rollDie } from './crypto-rng'
import { parseDiceFormula } from './dice-parser'
import type {
  DiceRollResult,
  DieRollDetail,
  ParsedFormula,
  RollMode,
} from '../types/dice-types'

/**
 * Evaluates a dice formula, rolling cryptosafe dice and calculating totals.
 * Applies D&D 5e Advantage and Disadvantage rules for D20 rolls.
 */
export function evaluateRoll(
  input: string | ParsedFormula,
  mode: RollMode = 'normal',
  standaloneModifier = 0
): DiceRollResult {
  const parsed: ParsedFormula =
    typeof input === 'string' ? parseDiceFormula(input) : input

  const allRolls: DieRollDetail[] = []
  const keptRolls: DieRollDetail[] = []
  let diceTotal = 0

  let natural20Detected = false
  let natural1Detected = false

  // Check if formula has any d20 term to apply Advantage/Disadvantage
  const hasD20 = parsed.terms.some(
    (t) => t.type === 'die' && t.sides === 20 && t.sign === 1
  )

  const effectiveMode: RollMode = hasD20 ? mode : 'normal'
  let d20AdvantageHandled = false

  let rollIdCounter = 0
  const nextId = () => `roll-${Date.now()}-${++rollIdCounter}`

  for (const term of parsed.terms) {
    if (term.type === 'die') {
      const { count, sides, sign } = term

      // Check if this is the d20 term under advantage/disadvantage
      if (
        sides === 20 &&
        sign === 1 &&
        (effectiveMode === 'advantage' || effectiveMode === 'disadvantage') &&
        !d20AdvantageHandled
      ) {
        // Roll two D20s
        const rollA = rollDie(20)
        const rollB = rollDie(20)

        const isAdv = effectiveMode === 'advantage'
        const keptValue = isAdv ? Math.max(rollA, rollB) : Math.min(rollA, rollB)
        const droppedValue = isAdv ? Math.min(rollA, rollB) : Math.max(rollA, rollB)

        const keptDetail: DieRollDetail = {
          id: nextId(),
          sides: 20,
          value: keptValue,
          isDropped: false,
          isAdvantageRoll: true,
        }

        const droppedDetail: DieRollDetail = {
          id: nextId(),
          sides: 20,
          value: droppedValue,
          isDropped: true,
          isAdvantageRoll: true,
        }

        allRolls.push(keptDetail, droppedDetail)
        keptRolls.push(keptDetail)
        diceTotal += keptValue

        if (keptValue === 20) natural20Detected = true
        if (keptValue === 1) natural1Detected = true

        d20AdvantageHandled = true

        // If count > 1 for this term, roll remaining normally
        for (let i = 1; i < count; i++) {
          const val = rollDie(20)
          const detail: DieRollDetail = {
            id: nextId(),
            sides: 20,
            value: val,
            isDropped: false,
          }
          allRolls.push(detail)
          keptRolls.push(detail)
          diceTotal += val
        }
      } else {
        // Standard normal rolling for each die in term
        for (let i = 0; i < count; i++) {
          const val = rollDie(sides)
          const detail: DieRollDetail = {
            id: nextId(),
            sides,
            value: val,
            isDropped: false,
          }

          allRolls.push(detail)
          keptRolls.push(detail)
          diceTotal += sign * val

          if (sides === 20 && sign === 1) {
            if (val === 20) natural20Detected = true
            if (val === 1) natural1Detected = true
          }
        }
      }
    }
  }

  // Combined modifiers
  const finalModifier = parsed.staticModifier + standaloneModifier
  const finalTotal = diceTotal + finalModifier

  return {
    id: `dice-result-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    formula: parsed.rawFormula,
    mode: effectiveMode,
    allRolls,
    keptRolls,
    diceResults: keptRolls.map((r) => r.value),
    diceTotal,
    modifier: finalModifier,
    total: finalTotal,
    isNatural20: natural20Detected,
    isNatural1: natural1Detected,
    timestamp: new Date().toISOString(),
  }
}
