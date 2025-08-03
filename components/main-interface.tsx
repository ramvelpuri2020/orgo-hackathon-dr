"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Moon, Sun, Bot, Send, Loader2, Monitor, FileText, Globe, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { orgoApiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { TaskOutput } from "@/components/task-output"
import { ApiSetup } from "@/components/api-setup"

export function MainInterface() {
  const [input, setInput] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const { setTheme, theme } = useTheme()
  const { addTask, setCurrentTask, setLoading, loading, currentTask } = useAppStore()
  const { toast } = useToast()

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = () => {
    const config = orgoApiService.isConfigured()
    setIsConfigured(config.orgo && config.claude)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const taskId = Date.now().toString()
    const newTask = {
      id: taskId,
      input: input.trim(),
      timestamp: new Date(),
      status: "processing" as const,
      output: undefined,
      error: undefined,
    }

    addTask(newTask)
    setCurrentTask(newTask)
    setLoading(true)

    try {
      // Check if we have an active project, if not create one
      let currentProject = orgoApiService.getCurrentProject()
      if (!currentProject) {
        toast({
          title: "Creating Orgo project",
          description: "Setting up your virtual desktop...",
        })
        currentProject = await orgoApiService.createProject()
      } else {
        // Validate that the stored project still exists
        const isValid = await orgoApiService.validateCurrentProject()
        if (!isValid) {
          toast({
            title: "Creating new Orgo project",
            description: "Previous project expired, setting up new desktop...",
          })
          currentProject = await orgoApiService.createProject()
        }
      }

      const response = await orgoApiService.processTask(input.trim())
      const completedTask = {
        ...newTask,
        status: "completed" as const,
        output: response,
        error: undefined,
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
    {
      text: "firefox https://www.google.com",
      icon: <Globe className="h-3 w-3" />,
      category: "web"
    },
    {
      text: "echo 'Hello from OrgoGPT!' > ~/Desktop/test.txt",
      icon: <FileText className="h-3 w-3" />,
      category: "file"
    },
    {
      text: "ls -la ~/Desktop",
      icon: <Monitor className="h-3 w-3" />,
      category: "system"
    },
    {
      text: "uname -a && df -h",
      icon: <Settings className="h-3 w-3" />,
      category: "system"
    }
  ]

  // Show API setup if not configured
  if (!isConfigured) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">OrgoGPT</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Setup Content */}
        <main className="flex-1 container max-w-4xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to OrgoGPT</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Configure your API keys to start using AI computer control with Orgo and Claude.
              </p>
            </div>
            <ApiSetup />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-semibold">OrgoGPT</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

             {/* Main Content */}
       <main className="flex-1 container max-w-4xl mx-auto p-6 space-y-4">
        {/* Task Output */}
        {currentTask && <TaskOutput task={currentTask} />}

        {/* Input Section */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action, index) => (
              <Button
                key={action.text}
                variant="outline"
                size="sm"
                onClick={() => setInput(action.text)}
                disabled={loading}
                className="text-xs hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {action.icon}
                <span className="ml-1">{action.text}</span>
              </Button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
                                                           <Textarea
                  placeholder="Enter any bash command to execute on the virtual desktop... (e.g., 'firefox https://google.com', 'echo hello > ~/Desktop/test.txt', 'ls -la', 'uname -a')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] pr-12 resize-none text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 group-hover:border-accent"
                  disabled={loading}
                />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="absolute bottom-3 right-3 h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>

          {loading && (
            <div className="flex items-center justify-center py-4 animate-in fade-in-0 duration-300">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
