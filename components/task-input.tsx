"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function TaskInput() {
  const [input, setInput] = useState("")
  const { addTask, setCurrentTask, setLoading, loading } = useAppStore()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const taskId = Date.now().toString()
    const newTask = {
      id: taskId,
      input: input.trim(),
      timestamp: new Date(),
      status: "processing" as const,
      output: null,
      error: null,
    }

    addTask(newTask)
    setCurrentTask(newTask)
    setLoading(true)

    try {
      const response = await apiService.processTask(input.trim())
      const completedTask = {
        ...newTask,
        status: "completed" as const,
        output: response,
      }
      addTask(completedTask)
      setCurrentTask(completedTask)
    } catch (error) {
      const errorTask = {
        ...newTask,
        status: "error" as const,
        error: error instanceof Error ? error.message : "Something went wrong",
      }
      addTask(errorTask)
      setCurrentTask(errorTask)
      toast({
        title: "Task failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setInput("")
    }
  }

  const quickActions = [
    "Summarize this PDF document",
    "Create a spreadsheet report",
    "Analyze quarterly data",
    "Draft a professional email",
  ]

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickActions.map((action, index) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            onClick={() => setInput(action)}
            disabled={loading}
            className="text-xs hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {action}
          </Button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <Textarea
            placeholder="Describe what you need... (e.g., 'Summarize this PDF', 'Create a report from this data')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] pr-12 resize-none text-base transition-all duration-200 focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 group-hover:border-accent"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="absolute bottom-3 right-3 h-8 w-8 bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-4 animate-in fade-in-0 duration-300">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-foreground rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <span className="text-sm">Processing your request...</span>
          </div>
        </div>
      )}
    </div>
  )
}
