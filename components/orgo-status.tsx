"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Circle, Zap, RefreshCw } from "lucide-react"
import { orgoApiService } from "@/lib/api"

type OrgoStatus = "online" | "launching" | "offline" | "checking"

export function OrgoStatus() {
  const [status, setStatus] = useState<OrgoStatus>("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      setStatus("checking")
      
      // First validate if the current project still exists
      const isValid = await orgoApiService.validateCurrentProject()
      if (!isValid) {
        setStatus("offline")
        setLastChecked(new Date())
        return
      }

      const currentProject = orgoApiService.getCurrentProject()
      if (!currentProject) {
        setStatus("offline")
        setLastChecked(new Date())
        return
      }

      // Get the latest project status from Orgo API
      const project = await orgoApiService.getProject(currentProject.id)
      
      if (project.desktop?.status === "running") {
        setStatus("online")
      } else if (project.desktop?.status === "starting") {
        setStatus("launching")
      } else {
        setStatus("offline")
      }
      
      setLastChecked(new Date())
    } catch (error) {
      console.error("Failed to check Orgo status:", error)
      setStatus("offline")
      setLastChecked(new Date())
    }
  }

  const getStatusConfig = (status: OrgoStatus) => {
    switch (status) {
      case "online":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <Circle className="h-2 w-2 fill-green-500 text-green-500" />,
          text: "Online",
        }
      case "launching":
        return {
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500 animate-pulse" />,
          text: "Starting",
        }
      case "offline":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <Circle className="h-2 w-2 fill-red-500 text-red-500" />,
          text: "Offline",
        }
      case "checking":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <RefreshCw className="h-2 w-2 text-blue-500 animate-spin" />,
          text: "Checking",
        }
    }
  }

  const config = getStatusConfig(status)

  // Don't render timestamp until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-3 animate-in fade-in-0 duration-500">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Orgo Desktop</span>
        </div>

        <Badge className={`${config.color} transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center gap-1.5">
            {config.icon}
            {config.text}
          </div>
        </Badge>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {status === "online" && "🚀 Ready to process your tasks"}
          {status === "launching" && "⏳ Getting things ready..."}
          {status === "offline" && "💤 Desktop is sleeping"}
          {status === "checking" && "🔍 Checking status..."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Orgo Desktop</span>
        <button
          onClick={checkStatus}
          disabled={status === "checking"}
          className="ml-auto p-1 hover:bg-accent rounded transition-colors"
          title="Refresh status"
        >
          <RefreshCw className={`h-3 w-3 text-muted-foreground ${status === "checking" ? "animate-spin" : ""}`} />
        </button>
      </div>

      <Badge className={`${config.color} transition-all duration-300 hover:scale-105`}>
        <div className="flex items-center gap-1.5">
          {config.icon}
          {config.text}
        </div>
      </Badge>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {status === "online" && "🚀 Ready to process your tasks"}
        {status === "launching" && "⏳ Getting things ready..."}
        {status === "offline" && "💤 Desktop is sleeping"}
        {status === "checking" && "🔍 Checking status..."}
      </p>

      {lastChecked && (
        <p className="text-xs text-muted-foreground">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
