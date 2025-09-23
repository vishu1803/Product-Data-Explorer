export interface CustomCache {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
}
