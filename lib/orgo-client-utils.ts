/**
 * Client-side utilities for Orgo project management
 * These functions don't import the orgo package and are safe for client-side use
 */

/**
 * Storage utilities for project ID persistence
 */
export const PROJECT_ID_STORAGE_KEY = 'orgo_project_id'

export const saveProjectId = (projectId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROJECT_ID_STORAGE_KEY, projectId)
  }
}

export const getStoredProjectId = (): string | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(PROJECT_ID_STORAGE_KEY)
    if (stored && isValidProjectId(stored)) {
      return stored
    } else if (stored) {
      localStorage.removeItem(PROJECT_ID_STORAGE_KEY)
    }
  }
  return null
}

export const clearStoredProjectId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROJECT_ID_STORAGE_KEY)
  }
}

/**
 * Validate project ID format (client-side only)
 */
export const isValidProjectId = (projectId?: string): boolean => {
  if (!projectId) return false
  
  // "new" should not be treated as a valid project ID for reuse
  if (projectId === 'new') return false
  
  // Check if it's a UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(projectId)
}

/**
 * Get project status with timestamp for staleness detection (client-side only)
 */
export const getProjectInfo = (projectId?: string) => {
  if (!projectId) {
    return { isValid: false, isStale: false, reason: 'No project ID' }
  }
  
  if (!isValidProjectId(projectId)) {
    return { isValid: false, isStale: true, reason: 'Invalid project ID format' }
  }
  
  // Check if it's an old format (computer-xxx)
  if (projectId.startsWith('computer-')) {
    return { isValid: false, isStale: true, reason: 'Old project ID format' }
  }
  
  return { isValid: true, isStale: false, reason: 'Valid project ID' }
} 