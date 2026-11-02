import type { StorageAdapter } from "./storage-adapter";
import type { RuneDiceAppState } from "../../types/app-state";

export const LOCAL_STORAGE_KEY = "runedice:v1:app-state";
export const CURRENT_SCHEMA_VERSION = 1;

export class LocalStorageAdapter implements StorageAdapter<RuneDiceAppState> {
  private readonly storageKey: string;

  constructor(key: string = LOCAL_STORAGE_KEY) {
    this.storageKey = key;
  }

  async load(): Promise<RuneDiceAppState | null> {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<RuneDiceAppState>;

      // Validate basic schema structure
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        typeof parsed.schemaVersion !== "number" ||
        !Array.isArray(parsed.sessions) ||
        !Array.isArray(parsed.players) ||
        !Array.isArray(parsed.rolls)
      ) {
        console.warn(
          `[LocalStorageAdapter] Malformed storage structure for key "${this.storageKey}". Falling back to defaults.`,
        );
        return null;
      }

      // Check schema version migration if needed in future
      if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        console.warn(
          `[LocalStorageAdapter] Schema version mismatch (got ${parsed.schemaVersion}, expected ${CURRENT_SCHEMA_VERSION}).`,
        );
      }

      return parsed as RuneDiceAppState;
    } catch (err) {
      console.error(
        `[LocalStorageAdapter] Failed to parse stored state from "${this.storageKey}":`,
        err,
      );
      return null;
    }
  }

  async save(data: RuneDiceAppState): Promise<void> {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      const serialized = JSON.stringify(data);
      window.localStorage.setItem(this.storageKey, serialized);
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.code === 22)
      ) {
        console.error(
          "[LocalStorageAdapter] Browser LocalStorage quota exceeded. Unable to persist state.",
          err,
        );
      } else {
        console.error(
          `[LocalStorageAdapter] Failed to write state to "${this.storageKey}":`,
          err,
        );
      }
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.removeItem(this.storageKey);
    } catch (err) {
      console.error(
        `[LocalStorageAdapter] Failed to clear key "${this.storageKey}":`,
        err,
      );
    }
  }
}

export const defaultStorageAdapter = new LocalStorageAdapter();
