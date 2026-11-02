import type {
  RuneDiceAppState,
  RuneDiceSession,
  RuneDicePlayer,
} from '../../../types/app-state'

/**
 * Pure functions for managing game sessions.
 */

export function createSessionHelper(
  state: RuneDiceAppState,
  name: string
): { updatedState: RuneDiceAppState; newSession: RuneDiceSession } {
  const trimmed = name.trim() || 'New Campaign'
  const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  const defaultPlayerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

  const newPlayer: RuneDicePlayer = {
    id: defaultPlayerId,
    sessionId: newSessionId,
    name: 'Adventurer',
    createdAt: new Date().toISOString(),
  }

  const newSession: RuneDiceSession = {
    id: newSessionId,
    name: trimmed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    playerIds: [defaultPlayerId],
    activePlayerId: defaultPlayerId,
  }

  const updatedState: RuneDiceAppState = {
    ...state,
    sessions: [...state.sessions, newSession],
    players: [...state.players, newPlayer],
    activeSessionId: newSessionId,
  }

  return { updatedState, newSession }
}

export function renameSessionHelper(
  state: RuneDiceAppState,
  sessionId: string,
  newName: string
): RuneDiceAppState {
  const trimmed = newName.trim()
  if (!trimmed) return state

  return {
    ...state,
    sessions: state.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, name: trimmed, updatedAt: new Date().toISOString() }
        : s
    ),
  }
}

export function switchSessionHelper(
  state: RuneDiceAppState,
  sessionId: string
): RuneDiceAppState {
  const target = state.sessions.find((s) => s.id === sessionId)
  if (!target) return state

  return {
    ...state,
    activeSessionId: sessionId,
  }
}

export function deleteSessionHelper(
  state: RuneDiceAppState,
  sessionId: string
): RuneDiceAppState {
  const remainingSessions = state.sessions.filter((s) => s.id !== sessionId)
  const remainingPlayers = state.players.filter((p) => p.sessionId !== sessionId)
  const remainingRolls = state.rolls.filter((r) => r.sessionId !== sessionId)

  // Guard against zero-session stranded state: if all sessions deleted, spawn a default session
  if (remainingSessions.length === 0) {
    const fallbackSessionId = `session-${Date.now()}`
    const fallbackPlayerId = `player-${Date.now()}`
    const defaultPlayer: RuneDicePlayer = {
      id: fallbackPlayerId,
      sessionId: fallbackSessionId,
      name: 'Adventurer',
      createdAt: new Date().toISOString(),
    }
    const defaultSession: RuneDiceSession = {
      id: fallbackSessionId,
      name: 'Default Campaign',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerIds: [fallbackPlayerId],
      activePlayerId: fallbackPlayerId,
    }

    return {
      ...state,
      sessions: [defaultSession],
      players: [defaultPlayer],
      rolls: [],
      activeSessionId: fallbackSessionId,
    }
  }

  const nextActiveId =
    state.activeSessionId === sessionId
      ? remainingSessions[0].id
      : state.activeSessionId

  return {
    ...state,
    sessions: remainingSessions,
    players: remainingPlayers,
    rolls: remainingRolls,
    activeSessionId: nextActiveId,
  }
}
