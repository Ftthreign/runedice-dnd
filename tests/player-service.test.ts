import { describe, it, expect } from 'vitest'
import {
  validatePlayerName,
  createPlayerHelper,
  renamePlayerHelper,
  removePlayerHelper,
  setActivePlayerHelper,
  MAX_PLAYERS_PER_SESSION,
} from '../src/features/players/services/player-service'
import { INITIAL_APP_STATE } from '../src/types/app-state'

describe('Player Service (player-service.ts)', () => {
  const defaultSessionId = INITIAL_APP_STATE.sessions[0].id

  it('should validate player name length and emptiness', () => {
    expect(validatePlayerName(INITIAL_APP_STATE, defaultSessionId, '').isValid).toBe(false)
    expect(validatePlayerName(INITIAL_APP_STATE, defaultSessionId, '   ').isValid).toBe(false)
    expect(validatePlayerName(INITIAL_APP_STATE, defaultSessionId, 'a'.repeat(33)).isValid).toBe(false)
    expect(validatePlayerName(INITIAL_APP_STATE, defaultSessionId, 'Gandalf').isValid).toBe(true)
  })

  it('should prevent case-insensitive duplicate player names in the same session', () => {
    const existingName = INITIAL_APP_STATE.players[0].name
    const result1 = validatePlayerName(INITIAL_APP_STATE, defaultSessionId, existingName.toLowerCase())
    expect(result1.isValid).toBe(false)
    expect(result1.error).toContain('already exists')

    const result2 = validatePlayerName(INITIAL_APP_STATE, defaultSessionId, existingName.toUpperCase())
    expect(result2.isValid).toBe(false)
  })

  it('should allow identical names across DIFFERENT sessions', () => {
    const result = validatePlayerName(INITIAL_APP_STATE, 'other-session-id', 'Adventurer')
    expect(result.isValid).toBe(true)
  })

  it('should allow renaming a player to their own existing name without false duplicate error', () => {
    const currentPlayer = INITIAL_APP_STATE.players[0]
    const result = validatePlayerName(
      INITIAL_APP_STATE,
      defaultSessionId,
      'Adventurer',
      currentPlayer.id
    )
    expect(result.isValid).toBe(true)
  })

  it('should enforce MAX_PLAYERS_PER_SESSION capacity limit', () => {
    let state = INITIAL_APP_STATE
    // Add up to 16 players
    for (let i = 2; i <= MAX_PLAYERS_PER_SESSION; i++) {
      const res = createPlayerHelper(state, defaultSessionId, `Hero ${i}`)
      expect(res.newPlayer).toBeDefined()
      state = res.updatedState
    }

    // 17th player should fail
    const overflowRes = createPlayerHelper(state, defaultSessionId, 'Hero 17')
    expect(overflowRes.newPlayer).toBeNull()
    expect(overflowRes.error).toContain('maximum limit')
  })

  it('should create new player and append to session playerIds', () => {
    const { updatedState, newPlayer } = createPlayerHelper(
      INITIAL_APP_STATE,
      defaultSessionId,
      'Legolas'
    )

    expect(newPlayer).toBeDefined()
    expect(newPlayer?.name).toBe('Legolas')
    expect(updatedState.players).toHaveLength(2)

    const session = updatedState.sessions.find((s) => s.id === defaultSessionId)
    expect(session?.playerIds).toContain(newPlayer!.id)
  })

  it('should rename existing player', () => {
    const player = INITIAL_APP_STATE.players[0]
    const { updatedState } = renamePlayerHelper(
      INITIAL_APP_STATE,
      player.id,
      'Gimli'
    )

    const renamed = updatedState.players.find((p) => p.id === player.id)
    expect(renamed?.name).toBe('Gimli')
  })

  it('should remove player and reassign activePlayerId if active player was deleted', () => {
    // Add second player
    const { updatedState: stateWithTwo, newPlayer } = createPlayerHelper(
      INITIAL_APP_STATE,
      defaultSessionId,
      'Aragorn'
    )

    // Set Aragorn as active
    const stateActiveAragorn = setActivePlayerHelper(
      stateWithTwo,
      defaultSessionId,
      newPlayer!.id
    )

    // Remove Aragorn
    const stateAfterRemoval = removePlayerHelper(stateActiveAragorn, newPlayer!.id)

    expect(stateAfterRemoval.players).toHaveLength(1)
    const session = stateAfterRemoval.sessions.find((s) => s.id === defaultSessionId)
    expect(session?.playerIds).not.toContain(newPlayer!.id)
    expect(session?.activePlayerId).toBe(INITIAL_APP_STATE.players[0].id)
  })
})
