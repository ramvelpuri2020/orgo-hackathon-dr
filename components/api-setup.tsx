"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Key, Bot, Sparkles } from "lucide-react"
import { orgoApiService } from "@/lib/api"

export function ApiSetup() {
  const [config, setConfig] = useState({ orgo: false, claude: false })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = () => {
    setIsChecking(true)
    const status = orgoApiService.isConfigured()
    setConfig(status)
    setIsChecking(false)
  }

  const allConfigured = config.orgo && config.claude

  if (isChecking) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Checking Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Verifying API keys...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Configure your API keys to start using OrgoGPT with AI computer control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Orgo API Key Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Orgo API Key</p>
              <p className="text-sm text-muted-foreground">For virtual desktop control</p>
            </div>
          </div>
          <Badge variant={config.orgo ? "default" : "destructive"}>
            {config.orgo ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {config.orgo ? "Configured" : "Missing"}
          </Badge>
        </div>

        {/* Claude API Key Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium">Claude API Key</p>
              <p className="text-sm text-muted-foreground">For AI computer control</p>
            </div>
          </div>
          <Badge variant={config.claude ? "default" : "destructive"}>
            {config.claude ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {config.claude ? "Configured" : "Missing"}
          </Badge>
        </div>

        {/* Status Alert */}
        {allConfigured ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              All API keys are configured! You're ready to use OrgoGPT.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Please configure your API keys to start using OrgoGPT.
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Instructions */}
        <div className="space-y-3">
          <h4 className="font-medium">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a <code className="bg-muted px-1 rounded">.env.local</code> file in the project root</li>
            <li>Add your API keys to the file:
              <pre className="bg-muted p-2 rounded mt-1 text-xs">
{`NEXT_PUBLIC_ORGO_API_KEY=your_orgo_api_key_here
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here`}
              </pre>
            </li>
            <li>Get your Orgo API key from <a href="https://www.orgo.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">orgo.ai</a></li>
            <li>Get your Claude API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
            <li>Restart the development server</li>
          </ol>
        </div>

        <Button onClick={checkConfiguration} variant="outline" className="w-full">
          Refresh Configuration
        </Button>
      </CardContent>
    </Card>
  )
} 