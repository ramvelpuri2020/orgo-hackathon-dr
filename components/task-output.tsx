"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/store"

interface TaskOutputProps {
  task: Task
}

export function TaskOutput({ task }: TaskOutputProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  const formatOutput = (output: any) => {
    if (typeof output === "string") return output
    if (output?.content) return output.content
    return JSON.stringify(output, null, 2)
  }

  return (
    <div className="space-y-4">
      {/* Input Echo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Your request:</span>
          <Badge variant="secondary" className="text-xs">
            {task.timestamp.toLocaleTimeString()}
          </Badge>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm">{task.input}</p>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Response:</span>
            {task.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {task.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
          </div>

          {task.output && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(formatOutput(task.output))}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <Card className="p-6">
          {task.status === "error" ? (
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm mt-1 opacity-80">{task.error}</p>
            </div>
          ) : task.output ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{formatOutput(task.output)}</pre>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p>Processing your request...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
