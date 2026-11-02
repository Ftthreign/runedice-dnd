import { describe, it, expect } from 'vitest'
import {
  rollDie,
  rollDice,
  parseDiceFormula,
  validateDiceFormula,
  evaluateRoll,
  MAX_DICE_COUNT,
  DiceParserError,
} from '../src/features/dice'

describe('Crypto RNG (crypto-rng.ts)', () => {
  it('should generate numbers strictly within range for all supported dice', () => {
    const diceSides = [4, 6, 8, 10, 12, 20, 100]

    for (const sides of diceSides) {
      for (let i = 0; i < 20; i++) {
        const result = rollDie(sides)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(sides)
        expect(Number.isInteger(result)).toBe(true)
      }
    }
  })

  it('should handle single sided die', () => {
    expect(rollDie(1)).toBe(1)
  })

  it('should throw error for non-positive sides', () => {
    expect(() => rollDie(0)).toThrow()
    expect(() => rollDie(-6)).toThrow()
  })

  it('should roll multiple dice correctly', () => {
    const results = rollDice(5, 6)
    expect(results).toHaveLength(5)
    results.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(6)
    })
  })
})

describe('Dice Formula Parser (dice-parser.ts)', () => {
  it('should parse simple single die term', () => {
    const parsed = parseDiceFormula('1d20')
    expect(parsed.terms).toHaveLength(1)
    expect(parsed.terms[0]).toEqual({
      type: 'die',
      count: 1,
      sides: 20,
      sign: 1,
    })
    expect(parsed.totalDiceCount).toBe(1)
    expect(parsed.staticModifier).toBe(0)
  })

  it('should default "d20" to 1d20', () => {
    const parsed = parseDiceFormula('d20')
    expect(parsed.terms[0]).toEqual({
      type: 'die',
      count: 1,
      sides: 20,
      sign: 1,
    })
  })

  it('should parse formulas with positive modifiers', () => {
    const parsed = parseDiceFormula('1d20 + 5')
    expect(parsed.terms).toHaveLength(2)
    expect(parsed.terms[0]).toEqual({ type: 'die', count: 1, sides: 20, sign: 1 })
    expect(parsed.terms[1]).toEqual({ type: 'modifier', value: 5, sign: 1 })
    expect(parsed.staticModifier).toBe(5)
  })

  it('should parse formulas with negative modifiers', () => {
    const parsed = parseDiceFormula('4d8 - 2')
    expect(parsed.terms).toHaveLength(2)
    expect(parsed.terms[0]).toEqual({ type: 'die', count: 4, sides: 8, sign: 1 })
    expect(parsed.terms[1]).toEqual({ type: 'modifier', value: 2, sign: -1 })
    expect(parsed.staticModifier).toBe(-2)
  })

  it('should parse compound multi-dice formulas', () => {
    const parsed = parseDiceFormula('2d6 + 1d4 + 3')
    expect(parsed.terms).toHaveLength(3)
    expect(parsed.terms[0]).toEqual({ type: 'die', count: 2, sides: 6, sign: 1 })
    expect(parsed.terms[1]).toEqual({ type: 'die', count: 1, sides: 4, sign: 1 })
    expect(parsed.terms[2]).toEqual({ type: 'modifier', value: 3, sign: 1 })
    expect(parsed.totalDiceCount).toBe(3)
    expect(parsed.staticModifier).toBe(3)
  })

  it('should reject empty or whitespace-only formulas', () => {
    expect(() => parseDiceFormula('')).toThrow(DiceParserError)
    expect(() => parseDiceFormula('   ')).toThrow(DiceParserError)
  })

  it('should reject invalid characters', () => {
    expect(() => parseDiceFormula('1d20 * 2')).toThrow(/invalid characters/)
    expect(() => parseDiceFormula('eval("1d20")')).toThrow(/invalid characters/)
    expect(() => parseDiceFormula('1d20; drop table')).toThrow(/invalid characters/)
  })

  it('should reject malformed syntax', () => {
    expect(() => parseDiceFormula('1d20+')).toThrow(/cannot end with an operator/)
    expect(() => parseDiceFormula('1d20++5')).toThrow(/consecutive operators/)
    expect(() => parseDiceFormula('+')).toThrow()
  })

  it('should enforce the maximum dice limit', () => {
    expect(() => parseDiceFormula(`${MAX_DICE_COUNT + 1}d6`)).toThrow(
      /exceeds the maximum allowed dice limit/
    )
    expect(() => parseDiceFormula('60d6 + 50d6')).toThrow(
      /exceeds the maximum allowed dice limit/
    )
  })

  it('should validate without throwing via validateDiceFormula', () => {
    expect(validateDiceFormula('2d6 + 3').isValid).toBe(true)
    expect(validateDiceFormula('invalid').isValid).toBe(false)
    expect(validateDiceFormula('invalid').error).toBeDefined()
  })
})

describe('Dice Evaluator (dice-evaluator.ts)', () => {
  it('should evaluate a standard normal roll', () => {
    const result = evaluateRoll('2d6 + 3', 'normal')

    expect(result.formula).toBe('2d6 + 3')
    expect(result.mode).toBe('normal')
    expect(result.diceResults).toHaveLength(2)
    expect(result.modifier).toBe(3)
    expect(result.total).toBe(result.diceTotal + 3)
    expect(result.total).toBeGreaterThanOrEqual(2 + 3)
    expect(result.total).toBeLessThanOrEqual(12 + 3)
  })

  it('should evaluate Advantage on d20 rolls (keep higher)', () => {
    for (let i = 0; i < 10; i++) {
      const result = evaluateRoll('1d20', 'advantage')

      expect(result.mode).toBe('advantage')
      expect(result.allRolls).toHaveLength(2)
      expect(result.keptRolls).toHaveLength(1)

      const kept = result.keptRolls[0].value
      const dropped = result.allRolls.find((r) => r.isDropped)?.value

      expect(dropped).toBeDefined()
      expect(kept).toBeGreaterThanOrEqual(dropped!)
    }
  })

  it('should evaluate Disadvantage on d20 rolls (keep lower)', () => {
    for (let i = 0; i < 10; i++) {
      const result = evaluateRoll('1d20', 'disadvantage')

      expect(result.mode).toBe('disadvantage')
      expect(result.allRolls).toHaveLength(2)
      expect(result.keptRolls).toHaveLength(1)

      const kept = result.keptRolls[0].value
      const dropped = result.allRolls.find((r) => r.isDropped)?.value

      expect(dropped).toBeDefined()
      expect(kept).toBeLessThanOrEqual(dropped!)
    }
  })

  it('should combine standalone modifier with formula modifier', () => {
    const result = evaluateRoll('1d20 + 2', 'normal', 3)
    expect(result.modifier).toBe(5)
    expect(result.total).toBe(result.diceTotal + 5)
  })

  it('should accurately tag Natural 20 and Natural 1 based on kept D20', () => {
    // Run multiple rolls to verify flag consistency
    for (let i = 0; i < 50; i++) {
      const result = evaluateRoll('1d20 + 5', 'normal')
      const d20Val = result.keptRolls[0].value

      if (d20Val === 20) {
        expect(result.isNatural20).toBe(true)
        expect(result.isNatural1).toBe(false)
      } else if (d20Val === 1) {
        expect(result.isNatural1).toBe(true)
        expect(result.isNatural20).toBe(false)
      } else {
        expect(result.isNatural20).toBe(false)
        expect(result.isNatural1).toBe(false)
      }
    }
  })
})
