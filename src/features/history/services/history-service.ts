import type { RuneDiceAppState, DiceRoll } from '../../../types/app-state'

export const MAX_HISTORY_PER_SESSION = 100

/**
 * Pure functions for managing roll history scoped to campaigns.
 */

export function getScopedRollsHelper(
  state: RuneDiceAppState,
  sessionId: string | null
): DiceRoll[] {
  if (!sessionId) return []
  return state.rolls
    .filter((r) => r.sessionId === sessionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addRollToHistoryHelper(
  state: RuneDiceAppState,
  roll: DiceRoll
): RuneDiceAppState {
  const currentSessionRolls = state.rolls.filter((r) => r.sessionId === roll.sessionId)
  const otherRolls = state.rolls.filter((r) => r.sessionId !== roll.sessionId)

  // Enforce FIFO cap at MAX_HISTORY_PER_SESSION
  const prunedSessionRolls = [roll, ...currentSessionRolls].slice(0, MAX_HISTORY_PER_SESSION)

  return {
    ...state,
    rolls: [...otherRolls, ...prunedSessionRolls],
  }
}

export function clearSessionHistoryHelper(
  state: RuneDiceAppState,
  sessionId: string
): RuneDiceAppState {
  return {
    ...state,
    rolls: state.rolls.filter((r) => r.sessionId !== sessionId),
  }
}
