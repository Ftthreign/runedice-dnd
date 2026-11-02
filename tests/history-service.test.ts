import { describe, it, expect } from 'vitest'
import {
  getScopedRollsHelper,
  addRollToHistoryHelper,
  clearSessionHistoryHelper,
  MAX_HISTORY_PER_SESSION,
} from '../src/features/history/services/history-service'
import { INITIAL_APP_STATE } from '../src/types/app-state'
import type { DiceRoll, RuneDiceAppState } from '../src/types/app-state'

describe('History Service (history-service.ts)', () => {
  const sessionId = INITIAL_APP_STATE.sessions[0].id

  const createDummyRoll = (id: string, sId: string, createdAt: string): DiceRoll => ({
    id,
    sessionId: sId,
    playerId: 'p-1',
    playerNameSnapshot: 'Hero',
    formula: '1d20',
    mode: 'normal',
    allRolls: [{ id: `r-${id}`, sides: 20, value: 10, isDropped: false }],
    diceResults: [10],
    diceTotal: 10,
    modifier: 0,
    total: 10,
    isNatural20: false,
    isNatural1: false,
    createdAt,
  })

  it('should return empty list if sessionId is null', () => {
    expect(getScopedRollsHelper(INITIAL_APP_STATE, null)).toEqual([])
  })

  it('should filter rolls strictly by session and order reverse-chronologically', () => {
    const roll1 = createDummyRoll('1', sessionId, '2026-01-01T10:00:00.000Z')
    const roll2 = createDummyRoll('2', sessionId, '2026-01-01T12:00:00.000Z')
    const otherRoll = createDummyRoll('3', 'other-session', '2026-01-01T11:00:00.000Z')

    const state: RuneDiceAppState = {
      ...INITIAL_APP_STATE,
      rolls: [roll1, otherRoll, roll2],
    }

    const scoped = getScopedRollsHelper(state, sessionId)
    expect(scoped).toHaveLength(2)
    expect(scoped[0].id).toBe('2') // Newer first
    expect(scoped[1].id).toBe('1')
  })

  it('should enforce FIFO cap of 100 rolls per session', () => {
    let state: RuneDiceAppState = INITIAL_APP_STATE

    // Add 105 rolls
    for (let i = 1; i <= 105; i++) {
      const roll = createDummyRoll(
        `roll-${i}`,
        sessionId,
        new Date(2026, 0, 1, 0, 0, i).toISOString()
      )
      state = addRollToHistoryHelper(state, roll)
    }

    const scoped = getScopedRollsHelper(state, sessionId)
    expect(scoped).toHaveLength(MAX_HISTORY_PER_SESSION)
    // Most recent is roll-105
    expect(scoped[0].id).toBe('roll-105')
    // Oldest preserved is roll-6 (roll-1 to roll-5 were pruned)
    expect(scoped[scoped.length - 1].id).toBe('roll-6')
  })

  it('should clear rolls only for the specified session', () => {
    const roll1 = createDummyRoll('1', sessionId, '2026-01-01T10:00:00.000Z')
    const otherRoll = createDummyRoll('2', 'other-session', '2026-01-01T10:00:00.000Z')

    const state: RuneDiceAppState = {
      ...INITIAL_APP_STATE,
      rolls: [roll1, otherRoll],
    }

    const cleared = clearSessionHistoryHelper(state, sessionId)
    expect(cleared.rolls).toHaveLength(1)
    expect(cleared.rolls[0].id).toBe('2')
  })
})
