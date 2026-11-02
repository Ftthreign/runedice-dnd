"use client";

import * as React from "react";
import type {
  RuneDiceAppState,
  RuneDiceSession,
  RuneDicePlayer,
  DiceRoll,
} from "../../types/app-state";
import { INITIAL_APP_STATE } from "../../types/app-state";
import { defaultStorageAdapter } from "../../lib/storage/local-storage-adapter";
import type { StorageAdapter } from "../../lib/storage/storage-adapter";

interface AppStateContextValue {
  state: RuneDiceAppState;
  activeSession: RuneDiceSession | null;
  activePlayer: RuneDicePlayer | null;
  activeSessionRolls: DiceRoll[];
  isHydrated: boolean;
  setState: React.Dispatch<React.SetStateAction<RuneDiceAppState>>;
  setActiveSessionId: (id: string | null) => void;
  setActivePlayerId: (sessionId: string, playerId: string | null) => void;
  addRoll: (
    rollData: Omit<
      DiceRoll,
      "id" | "sessionId" | "playerId" | "playerNameSnapshot" | "createdAt"
    >,
  ) => DiceRoll | null;
  clearRollHistory: (sessionId?: string) => void;
  createSession: (name: string) => RuneDiceSession;
  renameSession: (sessionId: string, newName: string) => void;
  deleteSession: (sessionId: string) => void;
  createPlayer: (sessionId: string, name: string) => RuneDicePlayer | null;
  renamePlayer: (playerId: string, newName: string) => void;
  removePlayer: (playerId: string) => void;
}

const AppStateContext = React.createContext<AppStateContextValue | null>(null);

interface AppStateProviderProps {
  children: React.ReactNode;
  adapter?: StorageAdapter<RuneDiceAppState>;
}

export function AppStateProvider({
  children,
  adapter = defaultStorageAdapter,
}: AppStateProviderProps) {
  const [state, setState] = React.useState<RuneDiceAppState>(INITIAL_APP_STATE);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // 1. SSR Hydration Guard: Load from adapter only after mount in browser
  React.useEffect(() => {
    let isMounted = true;

    adapter
      .load()
      .then((persisted) => {
        if (isMounted) {
          if (
            persisted &&
            Array.isArray(persisted.sessions) &&
            persisted.sessions.length > 0
          ) {
            setState(persisted);
          } else {
            // First time seeding
            adapter.save(INITIAL_APP_STATE);
          }
          setIsHydrated(true);
        }
      })
      .catch((err) => {
        console.error("[AppStateProvider] Error loading persisted state:", err);
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, [adapter]);

  // 2. Persist state to adapter on every change once hydrated
  React.useEffect(() => {
    if (isHydrated) {
      adapter.save(state).catch((err) => {
        console.error("[AppStateProvider] Failed to save state:", err);
      });
    }
  }, [state, isHydrated, adapter]);

  // Derived values
  const activeSession = React.useMemo(() => {
    if (!state.activeSessionId) return null;
    return state.sessions.find((s) => s.id === state.activeSessionId) || null;
  }, [state.sessions, state.activeSessionId]);

  const activePlayer = React.useMemo(() => {
    if (!activeSession || !activeSession.activePlayerId) return null;
    return (
      state.players.find(
        (p) =>
          p.id === activeSession.activePlayerId &&
          p.sessionId === activeSession.id,
      ) || null
    );
  }, [state.players, activeSession]);

  const activeSessionRolls = React.useMemo(() => {
    if (!activeSession) return [];
    return state.rolls
      .filter((r) => r.sessionId === activeSession.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [state.rolls, activeSession]);

  // Session Actions
  const setActiveSessionId = React.useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      activeSessionId: id,
    }));
  }, []);

  const setActivePlayerId = React.useCallback(
    (sessionId: string, playerId: string | null) => {
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                activePlayerId: playerId,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      }));
    },
    [],
  );

  const createSession = React.useCallback((name: string): RuneDiceSession => {
    const trimmed = name.trim() || "New Campaign";
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const defaultPlayerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newPlayer: RuneDicePlayer = {
      id: defaultPlayerId,
      sessionId: newSessionId,
      name: "Adventurer",
      createdAt: new Date().toISOString(),
    };

    const newSession: RuneDiceSession = {
      id: newSessionId,
      name: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerIds: [defaultPlayerId],
      activePlayerId: defaultPlayerId,
    };

    setState((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
      players: [...prev.players, newPlayer],
      activeSessionId: newSessionId,
    }));

    return newSession;
  }, []);

  const renameSession = React.useCallback(
    (sessionId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, name: trimmed, updatedAt: new Date().toISOString() }
            : s,
        ),
      }));
    },
    [],
  );

  const deleteSession = React.useCallback((sessionId: string) => {
    setState((prev) => {
      const remainingSessions = prev.sessions.filter((s) => s.id !== sessionId);
      const remainingPlayers = prev.players.filter(
        (p) => p.sessionId !== sessionId,
      );
      const remainingRolls = prev.rolls.filter(
        (r) => r.sessionId !== sessionId,
      );

      const nextActiveId =
        prev.activeSessionId === sessionId
          ? remainingSessions.length > 0
            ? remainingSessions[0].id
            : null
          : prev.activeSessionId;

      return {
        ...prev,
        sessions: remainingSessions,
        players: remainingPlayers,
        rolls: remainingRolls,
        activeSessionId: nextActiveId,
      };
    });
  }, []);

  // Player Actions
  const createPlayer = React.useCallback(
    (sessionId: string, name: string): RuneDicePlayer | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      let createdPlayer: RuneDicePlayer | null = null;

      setState((prev) => {
        // Enforce case-insensitive uniqueness in same session
        const existing = prev.players.find(
          (p) =>
            p.sessionId === sessionId &&
            p.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existing) {
          return prev;
        }

        const newId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        createdPlayer = {
          id: newId,
          sessionId,
          name: trimmed,
          createdAt: new Date().toISOString(),
        };

        const updatedSessions = prev.sessions.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              playerIds: [...s.playerIds, newId],
              activePlayerId: s.activePlayerId || newId,
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        });

        return {
          ...prev,
          sessions: updatedSessions,
          players: [...prev.players, createdPlayer],
        };
      });

      return createdPlayer;
    },
    [],
  );

  const renamePlayer = React.useCallback(
    (playerId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      setState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === playerId ? { ...p, name: trimmed } : p,
        ),
      }));
    },
    [],
  );

  const removePlayer = React.useCallback((playerId: string) => {
    setState((prev) => {
      const playerToRemove = prev.players.find((p) => p.id === playerId);
      if (!playerToRemove) return prev;

      const remainingPlayers = prev.players.filter((p) => p.id !== playerId);

      const updatedSessions = prev.sessions.map((s) => {
        if (s.id === playerToRemove.sessionId) {
          const nextPlayerIds = s.playerIds.filter((id) => id !== playerId);
          let nextActive = s.activePlayerId;
          if (s.activePlayerId === playerId) {
            nextActive = nextPlayerIds.length > 0 ? nextPlayerIds[0] : null;
          }
          return {
            ...s,
            playerIds: nextPlayerIds,
            activePlayerId: nextActive,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });

      // NOTE: Historical rolls in prev.rolls are intentionally NOT deleted or modified!
      // They preserve playerNameSnapshot.
      return {
        ...prev,
        sessions: updatedSessions,
        players: remainingPlayers,
      };
    });
  }, []);

  // Roll Actions
  const addRoll = React.useCallback(
    (
      rollData: Omit<
        DiceRoll,
        "id" | "sessionId" | "playerId" | "playerNameSnapshot" | "createdAt"
      >,
    ): DiceRoll | null => {
      if (!activeSession) return null;

      const playerSnapshot = activePlayer ? activePlayer.name : "Adventurer";
      const playerId = activePlayer ? activePlayer.id : "unknown";

      const newRoll: DiceRoll = {
        ...rollData,
        id: `roll-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId: activeSession.id,
        playerId,
        playerNameSnapshot: playerSnapshot,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => {
        // Enforce FIFO cap at 100 rolls for this session
        const currentSessionRolls = prev.rolls.filter(
          (r) => r.sessionId === activeSession.id,
        );
        const otherRolls = prev.rolls.filter(
          (r) => r.sessionId !== activeSession.id,
        );

        // Keep newest 99, then add newRoll to get 100 max
        const pruned = [newRoll, ...currentSessionRolls].slice(0, 100);

        return {
          ...prev,
          rolls: [...otherRolls, ...pruned],
        };
      });

      return newRoll;
    },
    [activeSession, activePlayer],
  );

  const clearRollHistory = React.useCallback((sessionId?: string) => {
    setState((prev) => {
      const targetSessionId = sessionId || prev.activeSessionId;
      if (!targetSessionId) return prev;

      return {
        ...prev,
        rolls: prev.rolls.filter((r) => r.sessionId !== targetSessionId),
      };
    });
  }, []);

  const value: AppStateContextValue = {
    state,
    activeSession,
    activePlayer,
    activeSessionRolls,
    isHydrated,
    setState,
    setActiveSessionId,
    setActivePlayerId,
    addRoll,
    clearRollHistory,
    createSession,
    renameSession,
    deleteSession,
    createPlayer,
    renamePlayer,
    removePlayer,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
