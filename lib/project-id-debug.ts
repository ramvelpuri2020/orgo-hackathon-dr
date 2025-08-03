// Utility for debugging project ID issues

// Set to false to disable debug logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development'

export function logProjectIdInfo(action: string, projectId?: string, details?: any) {
  if (!DEBUG_ENABLED) return
  
  // Debug logging disabled in production
}

export function isStaleProjectId(projectId?: string): boolean {
  if (!projectId) return false
  
  // Check if it's an old format (computer-xxx)
  if (projectId.startsWith('computer-')) {
    return true
  }
  
  // "new" should not be treated as a valid project ID for reuse
  if (projectId === 'new') {
    return true
  }
  
  // Check if it's a UUID format (should be the new format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(projectId)) {
    return false
  }
  
  // For any other format, we'll assume it's valid unless it's clearly old
  // This prevents false positives for valid project IDs that don't match UUID format
  return false
}

export function getProjectIdStatus(projectId?: string): {
  isValid: boolean
  format: 'uuid' | 'old' | 'new' | 'other' | 'none'
  needsUpdate: boolean
} {
  if (!projectId) {
    return { isValid: false, format: 'none', needsUpdate: false }
  }
  
  if (projectId.startsWith('computer-')) {
    return { isValid: false, format: 'old', needsUpdate: true }
  }
  
  if (projectId === 'new') {
    return { isValid: false, format: 'new', needsUpdate: true }
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(projectId)) {
    return { isValid: true, format: 'uuid', needsUpdate: false }
  }
  
  // For any other format, assume it's valid unless it's clearly old
  return { isValid: true, format: 'other', needsUpdate: false }
} 