import { useState, useCallback, useEffect, useRef } from 'react'
import { orgoClient, type OrgoStatus, type OrgoTaskResult, type OrgoOptions } from '@/lib/orgo-client'

interface UseOrgoReturn {
  status: OrgoStatus
  isConnected: boolean
  isRunning: boolean
  projectId?: string
  error?: string
  connect: (projectId?: string) => Promise<void>
  disconnect: () => Promise<void>
  processRequest: (input: string, options?: OrgoOptions) => Promise<OrgoTaskResult>
  getStatus: () => Promise<void>
}

export function useOrgo(): UseOrgoReturn {
  const [status, setStatus] = useState<OrgoStatus>({
    isConnected: false,
    isRunning: false
  })

  // Use ref to track if we're connected to avoid stale closures
  const isConnectedRef = useRef(false)
  isConnectedRef.current = status.isConnected

  // Use ref to prevent multiple simultaneous connections
  const isConnectingRef = useRef(false)

  const connect = useCallback(async (projectId?: string) => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current) {
      return
    }

    try {
      isConnectingRef.current = true
      
      // Clear any previous errors
      setStatus(prev => ({ ...prev, error: undefined }))
      
      const newStatus = await orgoClient.connect(projectId)
      setStatus(newStatus)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isRunning: false,
        error: errorMessage
      }))
      throw error
    } finally {
      isConnectingRef.current = false
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await orgoClient.disconnect()
      setStatus({
        isConnected: false,
        isRunning: false,
        error: undefined
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setStatus(prev => ({
        ...prev,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const processRequest = useCallback(async (input: string, options?: OrgoOptions): Promise<OrgoTaskResult> => {
    try {
      // Clear any previous errors
      setStatus(prev => ({ ...prev, error: undefined }))
      
      // Ensure we're connected before processing
      if (!isConnectedRef.current) {
        await connect()
      }
      
      const result = await orgoClient.processRequest(input, options)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setStatus(prev => ({
        ...prev,
        error: errorMessage
      }))
      throw error
    }
  }, [connect])

  const getStatus = useCallback(async () => {
    try {
      const currentStatus = await orgoClient.getStatus()
      setStatus(currentStatus)
    } catch (error) {
      console.error('Failed to get status:', error)
      // Don't reset status on error, just log it
    }
  }, [])

  // Use ref to store the latest getStatus function
  const getStatusRef = useRef(getStatus)
  getStatusRef.current = getStatus

  // Guard to prevent too frequent status checks
  const lastStatusCheckRef = useRef(0)
  const STATUS_CHECK_INTERVAL = 2000 // Minimum 2 seconds between checks

  // Auto-refresh status periodically - but only if we're actually connected
  useEffect(() => {
    // Only poll if we're actually connected
    if (!status.isConnected) {
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastStatusCheckRef.current > STATUS_CHECK_INTERVAL) {
        lastStatusCheckRef.current = now
        getStatusRef.current()
      }
    }, 5000) // Refresh every 5 seconds when connected

    return () => clearInterval(interval)
  }, [status.isConnected]) // Only depend on status.isConnected

  return {
    status,
    isConnected: status.isConnected,
    isRunning: status.isRunning,
    projectId: status.projectId,
    error: status.error,
    connect,
    disconnect,
    processRequest,
    getStatus
  }
} 