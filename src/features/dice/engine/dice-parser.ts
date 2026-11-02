import type { ParsedFormula, ParsedTerm } from '../types/dice-types'

export const MAX_DICE_COUNT = 100

export class DiceParserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DiceParserError'
  }
}

/**
 * Validates a dice formula string without throwing.
 */
export function validateDiceFormula(input: string): { isValid: boolean; error?: string } {
  try {
    parseDiceFormula(input)
    return { isValid: true }
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid dice formula',
    }
  }
}

/**
 * Parses a dice formula string into structured mathematical terms.
 * Prohibits eval(), verifies syntax, and enforces safe dice limits.
 */
export function parseDiceFormula(input: string): ParsedFormula {
  const trimmed = input.trim()
  if (!trimmed) {
    throw new DiceParserError('Dice formula cannot be empty.')
  }

  // Reject unsupported characters
  if (!/^[0-9dD+\-\s]+$/.test(trimmed)) {
    throw new DiceParserError(
      'Formula contains invalid characters. Only numbers, "d", "+", and "-" are allowed.'
    )
  }

  // Normalize spaces around operators
  const sanitized = trimmed.replace(/\s+/g, '')

  // Disallow trailing or double operators
  if (/[+\-]$/.test(sanitized)) {
    throw new DiceParserError('Formula cannot end with an operator.')
  }
  if (/[+\-]{2,}/.test(sanitized)) {
    throw new DiceParserError('Formula contains consecutive operators.')
  }

  // Regex to match terms with an optional leading sign
  // Matches either a die term (e.g. (+|-)?\d*d\d+) or a modifier term (e.g. (+|-)?\d+)
  const termRegex = /([+\-])?(\d*d\d+|\d+)/gi
  const matches = [...sanitized.matchAll(termRegex)]

  if (matches.length === 0) {
    throw new DiceParserError('No valid dice or numbers found in formula.')
  }

  // Ensure full coverage (no unparsed trailing debris)
  const reconstructed = matches.map((m) => m[0]).join('')
  if (reconstructed.replace(/^\+/, '') !== sanitized.replace(/^\+/, '')) {
    throw new DiceParserError('Formula syntax could not be parsed properly.')
  }

  const terms: ParsedTerm[] = []
  let totalDiceCount = 0
  let staticModifier = 0

  for (const match of matches) {
    const signChar = match[1]
    const body = match[2].toLowerCase()
    const sign: 1 | -1 = signChar === '-' ? -1 : 1

    if (body.includes('d')) {
      // Die term: [count]d[sides]
      const parts = body.split('d')
      const countStr = parts[0]
      const sidesStr = parts[1]

      const count = countStr === '' ? 1 : parseInt(countStr, 10)
      const sides = parseInt(sidesStr, 10)

      if (isNaN(count) || count <= 0) {
        throw new DiceParserError(`Invalid dice count in term "${body}".`)
      }
      if (isNaN(sides) || sides <= 0) {
        throw new DiceParserError(`Invalid dice sides in term "${body}".`)
      }

      totalDiceCount += count

      if (totalDiceCount > MAX_DICE_COUNT) {
        throw new DiceParserError(
          `Formula exceeds the maximum allowed dice limit of ${MAX_DICE_COUNT} dice.`
        )
      }

      terms.push({
        type: 'die',
        count,
        sides,
        sign,
      })
    } else {
      // Static modifier term
      const val = parseInt(body, 10)
      if (isNaN(val)) {
        throw new DiceParserError(`Invalid number "${body}".`)
      }

      staticModifier += sign * val

      terms.push({
        type: 'modifier',
        value: val,
        sign,
      })
    }
  }

  // Ensure formula has at least one die term
  const hasDice = terms.some((t) => t.type === 'die')
  if (!hasDice) {
    throw new DiceParserError('Formula must contain at least one die (e.g. 1d20).')
  }

  return {
    rawFormula: trimmed,
    terms,
    totalDiceCount,
    staticModifier,
  }
}
