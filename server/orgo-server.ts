import { Computer } from 'orgo'

export interface OrgoVMStatus {
  state: 'starting' | 'ready' | 'error' | 'stopped'
  isRunning: boolean
  projectId?: string
}

/**
 * Wait for the Orgo VM to be ready before allowing operations
 */
export const waitUntilReady = async (computer: Computer, timeout = 180000): Promise<void> => {
  const start = Date.now()
  
  while (true) {
    try {
      const status = await computer.status()
      
      if (status.state === 'ready') {
        return
      }
      
      if (status.state === 'error') {
        throw new Error('Orgo VM failed to start')
      }
      
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for Orgo VM to be ready (${timeout}ms)`)
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for Orgo VM to be ready (${timeout}ms)`)
      }
      // If status check fails, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

/**
 * Validate project ID format
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
 * Get project status with timestamp for staleness detection
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

/**
 * Create a new project with proper error handling
 */
export const createNewProject = async (apiKey: string): Promise<{ computer: Computer; projectId: string }> => {
  
  try {
    const computer = await Computer.create({
      apiKey,
      // Don't pass projectId to create a fresh project
    })
    
    // Wait for the VM to be ready
    await waitUntilReady(computer)
    
    const projectId = computer.info.projectId || 'new'
    
    return { computer, projectId }
  } catch (error) {
    console.error('❌ Failed to create new project:', error)
    throw new Error(`Failed to create new Orgo project: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Connect to existing project with fallback to new project
 */
export const connectToProject = async (
  apiKey: string, 
  projectId?: string
): Promise<{ computer: Computer; projectId: string; isNewProject: boolean }> => {
  
  // If no project ID provided, create a new one
  if (!projectId) {
    const result = await createNewProject(apiKey)
    return { ...result, isNewProject: true }
  }
  
  // Validate the project ID
  const projectInfo = getProjectInfo(projectId)
  if (!projectInfo.isValid) {
    const result = await createNewProject(apiKey)
    return { ...result, isNewProject: true }
  }
  
  try {
    const computer = await Computer.create({
      apiKey,
      projectId
    })
    
    // Wait for the VM to be ready
    await waitUntilReady(computer)
    
    const actualProjectId = computer.info.projectId || projectId
    
    return { computer, projectId: actualProjectId, isNewProject: false }
  } catch (error) {
    
    // Check for proper API error with status code
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as { statusCode: number }
      if (apiError.statusCode === 404) {
        const result = await createNewProject(apiKey)
        return { ...result, isNewProject: true }
      }
    }
    
    // Fallback: check error message for 404 (for backward compatibility)
    if (error instanceof Error && error.message.includes('404')) {
      const result = await createNewProject(apiKey)
      return { ...result, isNewProject: true }
    }
    
    // For other errors, re-throw
    throw error
  }
} 