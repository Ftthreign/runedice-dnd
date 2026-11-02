import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  LocalStorageAdapter,
  LOCAL_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../src/lib/storage/local-storage-adapter'
import type { RuneDiceAppState } from '../src/types/app-state'

describe('LocalStorageAdapter (local-storage-adapter.ts)', () => {
  let mockStorage: Record<string, string> = {}
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    mockStorage = {}

    // Mock window.localStorage
    const storageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
      length: 0,
      key: vi.fn(() => null),
    }

    vi.stubGlobal('window', { localStorage: storageMock })
    adapter = new LocalStorageAdapter()
  })

  it('should return null when storage is empty', async () => {
    const loaded = await adapter.load()
    expect(loaded).toBeNull()
  })

  it('should save and load valid app state', async () => {
    const testState: RuneDiceAppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      sessions: [
        {
          id: 'test-session-1',
          name: 'Curse of Strahd',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          playerIds: ['p1'],
          activePlayerId: 'p1',
        },
      ],
      players: [
        {
          id: 'p1',
          sessionId: 'test-session-1',
          name: 'Geralt',
          createdAt: new Date().toISOString(),
        },
      ],
      rolls: [],
      activeSessionId: 'test-session-1',
    }

    await adapter.save(testState)
    expect(mockStorage[LOCAL_STORAGE_KEY]).toBeDefined()

    const loaded = await adapter.load()
    expect(loaded).toEqual(testState)
  })

  it('should recover gracefully when storage contains corrupted JSON', async () => {
    mockStorage[LOCAL_STORAGE_KEY] = '{{corrupted-json-syntax'

    const loaded = await adapter.load()
    expect(loaded).toBeNull()
  })

  it('should reject malformed state missing required arrays', async () => {
    mockStorage[LOCAL_STORAGE_KEY] = JSON.stringify({
      schemaVersion: 1,
      sessions: 'not-an-array',
    })

    const loaded = await adapter.load()
    expect(loaded).toBeNull()
  })

  it('should remove data when clear() is called', async () => {
    mockStorage[LOCAL_STORAGE_KEY] = JSON.stringify({ test: true })

    await adapter.clear()
    expect(mockStorage[LOCAL_STORAGE_KEY]).toBeUndefined()
  })
})
