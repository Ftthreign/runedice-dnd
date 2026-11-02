import type { RollMode, DieRollDetail } from '../features/dice/types/dice-types'

export interface RuneDicePlayer {
  id: string
  sessionId: string
  name: string
  createdAt: string
}

export interface RuneDiceSession {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  playerIds: string[]
  activePlayerId: string | null
}

export interface DiceRoll {
  id: string
  sessionId: string
  playerId: string
  playerNameSnapshot: string
  formula: string
  mode: RollMode
  allRolls: DieRollDetail[]
  diceResults: number[]
  diceTotal: number
  modifier: number
  total: number
  isNatural20: boolean
  isNatural1: boolean
  createdAt: string
}

export interface RuneDiceAppState {
  schemaVersion: number
  sessions: RuneDiceSession[]
  players: RuneDicePlayer[]
  rolls: DiceRoll[]
  activeSessionId: string | null
}

export const INITIAL_APP_STATE: RuneDiceAppState = {
  schemaVersion: 1,
  sessions: [
    {
      id: 'session-default',
      name: 'The Lost Temple',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerIds: ['player-default'],
      activePlayerId: 'player-default',
    },
  ],
  players: [
    {
      id: 'player-default',
      sessionId: 'session-default',
      name: 'Fadhil',
      createdAt: new Date().toISOString(),
    },
  ],
  rolls: [],
  activeSessionId: 'session-default',
}
