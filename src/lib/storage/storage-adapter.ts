export interface StorageAdapter<T> {
  load(): Promise<T | null>;
  save(data: T): Promise<void>;
  clear(): Promise<void>;
}
