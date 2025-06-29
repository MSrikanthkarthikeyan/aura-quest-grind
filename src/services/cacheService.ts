
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    };
    
    this.cache.set(key, item);
    
    // Also cache to localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    // Try memory cache first
    let item = this.cache.get(key);
    
    // Fallback to localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          if (item) {
            this.cache.set(key, item); // Restore to memory
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage cache:', error);
      }
    }

    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage cache:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    // Clear localStorage cache items
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  // Check if we have cached data (even if potentially stale)
  hasCache(key: string): boolean {
    return this.cache.has(key) || localStorage.getItem(`cache_${key}`) !== null;
  }
}

export const cacheService = new CacheService();
