"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Circle, Zap, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useOrgo } from "@/hooks/use-orgo"
import { useAppStore } from "@/lib/store"
import { logProjectIdInfo, getProjectIdStatus } from "@/lib/project-id-debug"
import { getStoredProjectId, clearStoredProjectId } from "@/lib/orgo-client-utils"

type OrgoStatus = "online" | "launching" | "offline" | "connecting" | "restoring" | "creating"

export function OrgoStatus() {
  const [status, setStatus] = useState<OrgoStatus>("offline")
  const [projectId, setProjectId] = useState<string | undefined>()
  const [userMessage, setUserMessage] = useState<string>("")
  const { 
    orgoConnected, 
    orgoProjectId: savedProjectId, 
    setOrgoConnected,
    clearStaleProjectId 
  } = useAppStore()
  
  const { 
    isConnected, 
    projectId: orgoProjectId, 
    error, 
    connect, 
    getStatus,
    disconnect 
  } = useOrgo()

  // Use refs to store the latest values to avoid dependency issues
  const setOrgoConnectedRef = useRef(setOrgoConnected)
  const clearStaleProjectIdRef = useRef(clearStaleProjectId)
  
  // Track previous state to prevent unnecessary updates
  const prevStateRef = useRef({ isConnected: false, orgoProjectId: undefined as string | undefined })
  
  // Connection guard to prevent multiple simultaneous connections
  const isConnectingRef = useRef(false)
  
  // Initialization guard to prevent multiple initializations
  const hasInitializedRef = useRef(false)
  
  // Update refs when functions change
  setOrgoConnectedRef.current = setOrgoConnected
  clearStaleProjectIdRef.current = clearStaleProjectId

  // Clear stale project IDs on mount
  useEffect(() => {
    clearStaleProjectIdRef.current()
  }, []) // Empty dependency array since we use ref

  // Initialize connection on mount if we have a saved project ID
  useEffect(() => {
    const initializeConnection = async () => {
      // Use the new storage utility to get saved project ID
      const savedProjectIdFromStorage = getStoredProjectId()
      
      if (savedProjectIdFromStorage && !isConnected && !isConnectingRef.current) {
        
        // Validate the saved project ID
        const projectStatus = getProjectIdStatus(savedProjectIdFromStorage)
        if (projectStatus.isValid) {
          setStatus("restoring")
          setUserMessage("Restoring previous session...")
          isConnectingRef.current = true
          try {
            await connect(savedProjectIdFromStorage)
            setUserMessage("Session restored successfully!")
          } catch (error) {
            setUserMessage("Could not restore previous session, creating new VM...")
            // Clear the invalid project ID and create a new one
            clearStoredProjectId()
            setOrgoConnectedRef.current(false, undefined)
            setStatus("offline")
            setUserMessage("")
          } finally {
            isConnectingRef.current = false
          }
        } else {
          clearStoredProjectId()
          setOrgoConnectedRef.current(false, undefined)
        }
      }
    }

    // Only initialize if we're not already connected and haven't initialized yet
    if (!isConnected && !isConnectingRef.current && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      initializeConnection()
    }
  }, [isConnected]) // Add isConnected to dependencies

  // Handle connection status changes - FIXED LOGIC
  useEffect(() => {
    const currentState = { isConnected, orgoProjectId }
    const prevState = prevStateRef.current
    
    // Only update if the state has actually changed
    if (currentState.isConnected !== prevState.isConnected || 
        currentState.orgoProjectId !== prevState.orgoProjectId) {
      
      if (isConnected && orgoProjectId) {
        setStatus("online")
        setProjectId(orgoProjectId)
        setUserMessage("")
        setOrgoConnectedRef.current(true, orgoProjectId)
        logProjectIdInfo('connection_success', orgoProjectId, { 
          previousId: savedProjectId,
          isNewProject: savedProjectId !== orgoProjectId 
        })
      } else if (!isConnected) {
        setStatus("offline")
        setUserMessage("")
        setOrgoConnectedRef.current(false, undefined)
      }
      
      // Update the previous state
      prevStateRef.current = currentState
    }
  }, [isConnected, orgoProjectId, savedProjectId]) // Removed circular dependencies

  // Initialize with saved project ID on mount
  useEffect(() => {
    if (savedProjectId && !isConnected) {
      setProjectId(savedProjectId)
    }
  }, [savedProjectId, isConnected])

  const handleConnect = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || status === "connecting" || status === "online") {
      return
    }

    setStatus("creating")
    setUserMessage("Creating new virtual machine...")
    isConnectingRef.current = true
    
    // Log project ID status before connecting
    const projectStatus = getProjectIdStatus(savedProjectId)
    logProjectIdInfo('connect_attempt', savedProjectId, { status: projectStatus })
    
    try {
      // Always request a new project when connecting - pass undefined, not "new"
      await connect(undefined) // Pass undefined to create fresh computer
      setUserMessage("Virtual machine ready!")
      // Don't set status here - let the useEffect handle it
    } catch (error) {
      setStatus("offline")
      setUserMessage("Failed to create virtual machine")
      setOrgoConnectedRef.current(false, undefined)
      console.error('Failed to connect:', error)
      
      // If the error is about project not found, clear the stored project ID
      if (error instanceof Error && error.message.includes('Project not found')) {
        clearStaleProjectIdRef.current()
        clearStoredProjectId()
      }
      
      // Show error toast or handle gracefully
      // You could add a toast notification here
    } finally {
      isConnectingRef.current = false
    }
  }, [status, connect, savedProjectId]) // Added savedProjectId back for proper logging

  const handleRetry = useCallback(async () => {
    setUserMessage("Retrying connection...")
    // Clear any existing state and try again
    setOrgoConnectedRef.current(false, undefined)
    clearStaleProjectIdRef.current()
    clearStoredProjectId()
    setStatus("offline")
    setProjectId(undefined)
    
    // Wait a moment then retry
    setTimeout(async () => {
      await handleConnect()
    }, 500)
  }, [handleConnect])

  const handleNewSession = useCallback(async () => {
    setUserMessage("Starting new session...")
    
    // First, disconnect from current session
    try {
      await disconnect()
    } catch (error) {
      // Disconnect errors are expected when not connected
    }
    
    // Clear the stored project ID and start fresh
    setOrgoConnectedRef.current(false, undefined)
    clearStaleProjectIdRef.current()
    setStatus("offline")
    setProjectId(undefined)
    clearStoredProjectId()
    
    // Wait a moment then create new session
    setTimeout(async () => {
      await handleConnect()
    }, 500)
  }, [handleConnect, disconnect])

  // Get status configuration based on current status
  const getStatusConfig = (status: OrgoStatus) => {
    switch (status) {
      case "online":
        return {
          icon: <Circle className="h-2 w-2 fill-green-500 text-green-500" />,
          label: "Online",
          color: "bg-green-500/10 text-green-500 border-green-500/20"
        }
      case "launching":
        return {
          icon: <Loader2 className="h-2 w-2 animate-spin text-yellow-500" />,
          label: "Launching",
          color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        }
      case "connecting":
      case "restoring":
      case "creating":
        return {
          icon: <Loader2 className="h-2 w-2 animate-spin text-blue-500" />,
          label: status === "restoring" ? "Restoring" : status === "creating" ? "Creating" : "Connecting",
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
        }
      case "offline":
      default:
        return {
          icon: <Circle className="h-2 w-2 text-gray-400" />,
          label: "Offline",
          color: "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${statusConfig.color}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
          
          {projectId && (
            <span className="text-xs text-muted-foreground">
              {projectId.slice(0, 8)}...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {status === "online" && (
            <button
              onClick={handleNewSession}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              New Session
            </button>
          )}
          
          {status === "offline" && (
            <button
              onClick={handleConnect}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Connect
            </button>
          )}
          
          {(status === "connecting" || status === "creating" || status === "restoring") && (
            <button
              onClick={handleRetry}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
      
      {/* User message */}
      {userMessage && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          {userMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
