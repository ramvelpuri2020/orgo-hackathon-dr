"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Copy, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

export function OutputDisplay() {
  const { currentTask, clearCurrentTask } = useAppStore()
  const { toast } = useToast()

  if (!currentTask) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard!" })
  }

  const formatOutput = (output: any) => {
    if (typeof output === "string") return output
    if (output?.content) return output.content
    return JSON.stringify(output, null, 2)
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Task Result</h2>
          {currentTask.status === "completed" && (
            <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-300" />
          )}
          {currentTask.status === "error" && (
            <XCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-300" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="animate-in fade-in-0 duration-300">
            {currentTask.timestamp.toLocaleTimeString()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentTask}
            className="hover:bg-accent transition-all duration-200 hover:scale-105"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {/* Input Echo */}
      <div className="space-y-3 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-100">
        <h3 className="text-sm font-medium text-muted-foreground">Your Request:</h3>
        <Card className="p-4 bg-muted/30 border-dashed transition-all duration-200 hover:bg-muted/50">
          <p className="text-sm leading-relaxed">{currentTask.input}</p>
        </Card>
      </div>

      {/* Output */}
      <div className="space-y-3 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Response:</h3>
          {currentTask.output && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatOutput(currentTask.output))}
              className="hover:bg-accent transition-all duration-200 hover:scale-105"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          )}
        </div>

        <Card className="p-6 transition-all duration-200 hover:shadow-md">
          {currentTask.status === "error" ? (
            <div className="text-red-600 dark:text-red-400 animate-in fade-in-0 duration-300">
              <p className="font-medium">Oops! Something went wrong</p>
              <p className="text-sm mt-2 opacity-80">{currentTask.error}</p>
            </div>
          ) : currentTask.output ? (
            <div className="prose prose-sm max-w-none dark:prose-invert animate-in fade-in-0 duration-500">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {formatOutput(currentTask.output)}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="flex justify-center space-x-1">
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="text-muted-foreground">Working on your request...</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
