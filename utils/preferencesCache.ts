import { UserPreferences } from '@/types/database'

const CACHE_KEY = 'user_preferences_cache'
const CACHE_EXPIRY_KEY = 'user_preferences_cache_expiry'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CachedPreferences {
  data: UserPreferences
  timestamp: number
  userId: string
}

export class PreferencesCache {
  /**
   * Get cached preferences if they exist and are not expired
   */
  static get(userId: string): UserPreferences | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
      
      if (!cached || !expiry) {
        return null
      }

      const cachedData: CachedPreferences = JSON.parse(cached)
      const expiryTime = parseInt(expiry)
      
      // Check if cache is expired or for different user
      if (Date.now() > expiryTime || cachedData.userId !== userId) {
        this.clear()
        return null
      }

      return cachedData.data
    } catch (error) {
      console.warn('Error reading preferences cache:', error)
      this.clear()
      return null
    }
  }

  /**
   * Set preferences in cache
   */
  static set(userId: string, preferences: UserPreferences): void {
    try {
      const cachedData: CachedPreferences = {
        data: preferences,
        timestamp: Date.now(),
        userId
      }
      
      const expiryTime = Date.now() + CACHE_DURATION
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData))
      localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    } catch (error) {
      console.warn('Error setting preferences cache:', error)
    }
  }

  /**
   * Update specific preference in cache
   */
  static update(userId: string, key: keyof UserPreferences, value: any): void {
    try {
      const cached = this.get(userId)
      if (cached) {
        const updated = { ...cached, [key]: value }
        this.set(userId, updated)
      }
    } catch (error) {
      console.warn('Error updating preferences cache:', error)
    }
  }

  /**
   * Clear preferences cache
   */
  static clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRY_KEY)
    } catch (error) {
      console.warn('Error clearing preferences cache:', error)
    }
  }

  /**
   * Check if cache exists and is valid for user
   */
  static isValid(userId: string): boolean {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
      
      if (!cached || !expiry) {
        return false
      }

      const cachedData: CachedPreferences = JSON.parse(cached)
      const expiryTime = parseInt(expiry)
      
      return Date.now() <= expiryTime && cachedData.userId === userId
    } catch (error) {
      return false
    }
  }

  /**
   * Get cache info for debugging
   */
  static getInfo(): { exists: boolean; expired: boolean; userId?: string; age?: number } {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
      
      if (!cached || !expiry) {
        return { exists: false, expired: false }
      }

      const cachedData: CachedPreferences = JSON.parse(cached)
      const expiryTime = parseInt(expiry)
      const now = Date.now()
      
      return {
        exists: true,
        expired: now > expiryTime,
        userId: cachedData.userId,
        age: now - cachedData.timestamp
      }
    } catch (error) {
      return { exists: false, expired: false }
    }
  }
}

// Theme-specific caching for immediate application
export class ThemeCache {
  private static readonly THEME_KEY = 'app_theme'
  
  static get(): 'light' | 'dark' | 'system' | null {
    try {
      return localStorage.getItem(this.THEME_KEY) as 'light' | 'dark' | 'system' | null
    } catch {
      return null
    }
  }
  
  static set(theme: 'light' | 'dark' | 'system'): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme)
    } catch (error) {
      console.warn('Error setting theme cache:', error)
    }
  }
  
  static clear(): void {
    try {
      localStorage.removeItem(this.THEME_KEY)
    } catch (error) {
      console.warn('Error clearing theme cache:', error)
    }
  }
}