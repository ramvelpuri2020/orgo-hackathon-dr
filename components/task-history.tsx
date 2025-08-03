"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function TaskHistory() {
  const { tasks, setCurrentTask, currentTask } = useAppStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "processing":
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: any) => {
    try {
      // Ensure timestamp is a Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      return date.toLocaleTimeString()
    } catch (error) {
      return "Unknown time"
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp)
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp)
    return dateB.getTime() - dateA.getTime()
  })

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 animate-in fade-in-0 duration-500">
        <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No tasks yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Your recent tasks will appear here</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1">
        {sortedTasks.map((task, index) => (
          <Button
            key={task.id}
            variant={currentTask?.id === task.id ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3 text-left transition-all duration-200 hover:bg-accent hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-4"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setCurrentTask(task)}
          >
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="text-xs text-muted-foreground">{formatTimestamp(task.timestamp)}</span>
              </div>
              <p className="text-sm truncate leading-relaxed">{task.input}</p>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
