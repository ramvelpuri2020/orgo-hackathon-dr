"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Moon, Sun, Bot, Send, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { TaskOutput } from "@/components/task-output"
import { OrgoStatus } from "@/components/orgo-status"

export function MainInterface() {
  const [input, setInput] = useState("")
  const { setTheme } = useTheme()
  const { addTask, setCurrentTask, setLoading, loading, currentTask } = useAppStore()
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

  const quickActions = ["Summarize this document", "Create a report", "Analyze data", "Draft an email"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-semibold">OrgoGPT</span>
          </div>

          <div className="flex items-center gap-2">
            <OrgoStatus />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          {!currentTask && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">What can I help you with?</h1>
                <p className="text-muted-foreground text-lg">Just describe what you need in plain English</p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action) => (
                  <Button key={action} variant="outline" size="sm" onClick={() => setInput(action)} className="text-sm">
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Task Output */}
          {currentTask && <TaskOutput task={currentTask} />}

          {/* Input Section */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Type your request here... (e.g., 'Summarize this PDF', 'Create a spreadsheet from this data')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] pr-12 resize-none text-base"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || loading}
                  className="absolute bottom-3 right-3 h-8 w-8"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing your request...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
