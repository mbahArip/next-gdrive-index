type PathValidationData = { id: string; path: string; mimeType: string };
type PathData = { id: string; name: string };

class CacheService<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number;

  constructor(ttlInSeconds = 60) {
    this.cache = new Map();
    this.ttl = ttlInSeconds * 1000;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;

    return Date.now() - item.timestamp > this.ttl;
  }
}

/**
 * Currently not used since it will throw error when validating the paths for password
 * TODO: Figure out why cached paths arguments are not being passed correctly to the server actions
 *
 * LOG:
 * (page.tsx) [Params] ['Protected Folder - pass loremipsum']
 * (page.tsx) [ValidatePaths] From cache: true
 * (page.tsx) [ValidatePaths] Paths: [{ id: "***", mimeType: "application/vnd.google-apps.folder", path: "Protected Folder - pass loremipsum" }]
 * (Password.tsx) [CheckPagePassword] Paths: [] // This should be the same as the one above
 * (Password.tsx) [CheckPagePassword] FolderIds: []
 * (Password.tsx) [CheckPagePassword] Unlocked: { success: true, message: "All folders on current path are public (/)" }
 */
export const PathValidationCache = new CacheService<PathValidationData[]>();
export const PathCache = new CacheService<PathData>();
