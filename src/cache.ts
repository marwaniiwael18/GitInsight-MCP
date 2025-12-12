/**
 * Caching service for GitInsight MCP Server
 * Implements in-memory caching to reduce GitHub API calls and avoid rate limits
 */

import NodeCache from 'node-cache';
import { config } from './config.js';

/**
 * Cache instance with TTL and periodic cleanup
 */
class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache_ttl,
      checkperiod: config.cache_check_period,
      useClones: false // Better performance, but be careful with object mutations
    });

    console.error('[Cache] Initialized with TTL:', config.cache_ttl, 'seconds');
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      console.error(`[Cache] HIT: ${key}`);
    } else {
      console.error(`[Cache] MISS: ${key}`);
    }
    return value;
  }

  /**
   * Set a value in cache with optional custom TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const result = this.cache.set(key, value, ttl || config.cache_ttl);
    console.error(`[Cache] SET: ${key} (TTL: ${ttl || config.cache_ttl}s)`);
    return result;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    console.error('[Cache] Cleared all entries');
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return this.cache.keys();
  }
}

/**
 * Singleton cache instance
 */
export const cache = new CacheService();
