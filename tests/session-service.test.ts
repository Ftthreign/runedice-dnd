import { describe, it, expect } from 'vitest'
import {
  createSessionHelper,
  renameSessionHelper,
  switchSessionHelper,
  deleteSessionHelper,
} from '../src/features/sessions/services/session-service'
import { INITIAL_APP_STATE } from '../src/types/app-state'
import type { RuneDiceAppState } from '../src/types/app-state'

describe('Session Service (session-service.ts)', () => {
  it('should create a new session with default adventurer and set as active', () => {
    const { updatedState, newSession } = createSessionHelper(
      INITIAL_APP_STATE,
      'Curse of Strahd'
    )

    expect(newSession.name).toBe('Curse of Strahd')
    expect(updatedState.sessions).toHaveLength(2)
    expect(updatedState.activeSessionId).toBe(newSession.id)
    expect(newSession.playerIds).toHaveLength(1)

    const createdPlayer = updatedState.players.find(
      (p) => p.sessionId === newSession.id
    )
    expect(createdPlayer).toBeDefined()
    expect(createdPlayer?.name).toBe('Adventurer')
  })

  it('should trim whitespace from new session name or fallback to default', () => {
    const { newSession: s1 } = createSessionHelper(INITIAL_APP_STATE, '  Baldurs Gate  ')
    expect(s1.name).toBe('Baldurs Gate')

    const { newSession: s2 } = createSessionHelper(INITIAL_APP_STATE, '   ')
    expect(s2.name).toBe('New Campaign')
  })

  it('should rename existing session', () => {
    const initialSession = INITIAL_APP_STATE.sessions[0]
    const updated = renameSessionHelper(
      INITIAL_APP_STATE,
      initialSession.id,
      'Icewind Dale'
    )

    const renamed = updated.sessions.find((s) => s.id === initialSession.id)
    expect(renamed?.name).toBe('Icewind Dale')
  })

  it('should ignore renaming with empty string', () => {
    const initialSession = INITIAL_APP_STATE.sessions[0]
    const updated = renameSessionHelper(
      INITIAL_APP_STATE,
      initialSession.id,
      '   '
    )
    const session = updated.sessions.find((s) => s.id === initialSession.id)
    expect(session?.name).toBe(initialSession.name)
  })

  it('should switch active session', () => {
    const { updatedState } = createSessionHelper(
      INITIAL_APP_STATE,
      'Campaign B'
    )
    const initialId = INITIAL_APP_STATE.sessions[0].id

    const switchedBack = switchSessionHelper(updatedState, initialId)
    expect(switchedBack.activeSessionId).toBe(initialId)
  })

  it('should delete session and cascade-delete its players and rolls', () => {
    // Setup state with 2 sessions and rolls
    const { updatedState: stateWithTwo, newSession } = createSessionHelper(
      INITIAL_APP_STATE,
      'To be deleted'
    )

    const stateWithRolls: RuneDiceAppState = {
      ...stateWithTwo,
      rolls: [
        {
          id: 'roll-1',
          sessionId: newSession.id,
          playerId: 'p-1',
          playerNameSnapshot: 'Adventurer',
          formula: '1d20',
          mode: 'normal',
          allRolls: [{ id: '1', sides: 20, value: 15, isDropped: false }],
          diceResults: [15],
          diceTotal: 15,
          modifier: 0,
          total: 15,
          isNatural20: false,
          isNatural1: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'roll-2',
          sessionId: INITIAL_APP_STATE.sessions[0].id,
          playerId: 'p-default',
          playerNameSnapshot: 'Adventurer',
          formula: '1d6',
          mode: 'normal',
          allRolls: [{ id: '2', sides: 6, value: 5, isDropped: false }],
          diceResults: [5],
          diceTotal: 5,
          modifier: 0,
          total: 5,
          isNatural20: false,
          isNatural1: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }

    const afterDelete = deleteSessionHelper(stateWithRolls, newSession.id)

    expect(afterDelete.sessions).toHaveLength(1)
    expect(afterDelete.sessions.some((s) => s.id === newSession.id)).toBe(false)
    expect(afterDelete.players.some((p) => p.sessionId === newSession.id)).toBe(false)
    expect(afterDelete.rolls.some((r) => r.sessionId === newSession.id)).toBe(false)
    expect(afterDelete.rolls).toHaveLength(1)
    expect(afterDelete.activeSessionId).toBe(INITIAL_APP_STATE.sessions[0].id)
  })

  it('should guard against zero sessions by respawning default campaign', () => {
    const onlySession = INITIAL_APP_STATE.sessions[0]
    const afterDelete = deleteSessionHelper(INITIAL_APP_STATE, onlySession.id)

    expect(afterDelete.sessions).toHaveLength(1)
    expect(afterDelete.sessions[0].name).toBe('Default Campaign')
    expect(afterDelete.players).toHaveLength(1)
    expect(afterDelete.activeSessionId).toBe(afterDelete.sessions[0].id)
  })
})
