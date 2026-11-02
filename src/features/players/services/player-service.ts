import type {
  RuneDiceAppState,
  RuneDicePlayer,
} from '../../../types/app-state'

export const MAX_PLAYERS_PER_SESSION = 16

export interface PlayerValidationResult {
  isValid: boolean
  error?: string
}

export function validatePlayerName(
  state: RuneDiceAppState,
  sessionId: string,
  name: string,
  excludePlayerId?: string
): PlayerValidationResult {
  const trimmed = name.trim()

  if (!trimmed) {
    return { isValid: false, error: 'Adventurer name cannot be empty.' }
  }

  if (trimmed.length > 32) {
    return { isValid: false, error: 'Adventurer name cannot exceed 32 characters.' }
  }

  // Check uniqueness within the same session (case-insensitive)
  const isDuplicate = state.players.some(
    (p) =>
      p.sessionId === sessionId &&
      p.id !== excludePlayerId &&
      p.name.toLowerCase() === trimmed.toLowerCase()
  )

  if (isDuplicate) {
    return {
      isValid: false,
      error: `An adventurer named "${trimmed}" already exists in this session.`,
    }
  }

  // Check capacity limit
  const currentCount = state.players.filter((p) => p.sessionId === sessionId).length
  if (!excludePlayerId && currentCount >= MAX_PLAYERS_PER_SESSION) {
    return {
      isValid: false,
      error: `Session has reached maximum limit of ${MAX_PLAYERS_PER_SESSION} adventurers.`,
    }
  }

  return { isValid: true }
}

export function createPlayerHelper(
  state: RuneDiceAppState,
  sessionId: string,
  name: string
): { updatedState: RuneDiceAppState; newPlayer: RuneDicePlayer | null; error?: string } {
  const validation = validatePlayerName(state, sessionId, name)
  if (!validation.isValid) {
    return { updatedState: state, newPlayer: null, error: validation.error }
  }

  const trimmed = name.trim()
  const newPlayerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

  const newPlayer: RuneDicePlayer = {
    id: newPlayerId,
    sessionId,
    name: trimmed,
    createdAt: new Date().toISOString(),
  }

  const updatedSessions = state.sessions.map((s) => {
    if (s.id === sessionId) {
      return {
        ...s,
        playerIds: [...s.playerIds, newPlayerId],
        activePlayerId: s.activePlayerId || newPlayerId,
        updatedAt: new Date().toISOString(),
      }
    }
    return s
  })

  const updatedState: RuneDiceAppState = {
    ...state,
    sessions: updatedSessions,
    players: [...state.players, newPlayer],
  }

  return { updatedState, newPlayer }
}

export function renamePlayerHelper(
  state: RuneDiceAppState,
  playerId: string,
  newName: string
): { updatedState: RuneDiceAppState; error?: string } {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return { updatedState: state, error: 'Player not found' }

  const validation = validatePlayerName(state, player.sessionId, newName, playerId)
  if (!validation.isValid) {
    return { updatedState: state, error: validation.error }
  }

  const trimmed = newName.trim()

  const updatedState: RuneDiceAppState = {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, name: trimmed } : p
    ),
  }

  return { updatedState }
}

export function removePlayerHelper(
  state: RuneDiceAppState,
  playerId: string
): RuneDiceAppState {
  const playerToRemove = state.players.find((p) => p.id === playerId)
  if (!playerToRemove) return state

  const remainingPlayers = state.players.filter((p) => p.id !== playerId)

  const updatedSessions = state.sessions.map((s) => {
    if (s.id === playerToRemove.sessionId) {
      const nextPlayerIds = s.playerIds.filter((id) => id !== playerId)
      let nextActiveId = s.activePlayerId
      if (s.activePlayerId === playerId) {
        nextActiveId = nextPlayerIds.length > 0 ? nextPlayerIds[0] : null
      }

      return {
        ...s,
        playerIds: nextPlayerIds,
        activePlayerId: nextActiveId,
        updatedAt: new Date().toISOString(),
      }
    }
    return s
  })

  // IMPORTANT: Previous roll records in state.rolls are preserved with their playerNameSnapshot!
  return {
    ...state,
    sessions: updatedSessions,
    players: remainingPlayers,
  }
}

export function setActivePlayerHelper(
  state: RuneDiceAppState,
  sessionId: string,
  playerId: string | null
): RuneDiceAppState {
  return {
    ...state,
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, activePlayerId: playerId, updatedAt: new Date().toISOString() }
        : s
    ),
  }
}
