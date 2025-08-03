"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Circle, Zap } from "lucide-react"

type OrgoStatus = "online" | "launching" | "offline"

export function OrgoStatus() {
  const [status, setStatus] = useState<OrgoStatus>("online")

  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: OrgoStatus[] = ["online", "online", "online", "offline"]
      setStatus(statuses[Math.floor(Math.random() * statuses.length)])
    }, 20000)
    return () => clearInterval(interval)
  }, [])

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
    }
  }

  const config = getStatusConfig(status)

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
      </p>
    </div>
  )
}
