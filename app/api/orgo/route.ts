import { NextRequest, NextResponse } from 'next/server'
import { Computer } from 'orgo'
import { connectToProject, waitUntilReady } from '@/server/orgo-server'

interface OrgoTaskResult {
  success: boolean
  output: string
  screenshots?: string[]
  error?: string
  projectId?: string
}

interface OrgoStatus {
  isConnected: boolean
  isRunning: boolean
  projectId?: string
  error?: string
}

// Server-side Orgo service
class ServerOrgoService {
  private computer: Computer | null = null
  private status: OrgoStatus = {
    isConnected: false,
    isRunning: false
  }

  async connect(projectId?: string): Promise<OrgoStatus> {
    try {
      // If a computer is already connected, destroy it before creating a new one.
      if (this.computer) {
        await this.computer.destroy()
        this.computer = null
      }

      // Use the improved utility function that handles VM readiness and proper error handling
      const { computer, projectId: actualProjectId, isNewProject } = await connectToProject(
        process.env.ORGO_API_KEY!,
        projectId
      )
      
      this.computer = computer
      
      this.status = {
        isConnected: true,
        isRunning: true,
        projectId: actualProjectId
      }
      

      return this.status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Connection failed:', errorMessage)
      
      this.status = {
        isConnected: false,
        isRunning: false,
        error: errorMessage
      }
      throw new Error(errorMessage)
    }
  }

  async disconnect(): Promise<void> {
    if (this.computer) {
      await this.computer.destroy()
      this.computer = null
      this.status = {
        isConnected: false,
        isRunning: false
      }
    }
  }

  async processRequest(
    input: string, 
    options?: {
      model?: string
      thinkingEnabled?: boolean
      maxIterations?: number
    }
  ): Promise<OrgoTaskResult> {
    if (!this.computer) {
      throw new Error('Computer not connected. Please connect first.')
    }

    try {
      // Ensure VM is ready before processing - this is critical for stable operation
      await waitUntilReady(this.computer)
      
      // Use the correct prompt method for the JavaScript SDK
      const response = await this.computer.prompt({
        instruction: input,
        model: options?.model || "claude-3-7-sonnet-20250219",
        thinkingEnabled: options?.thinkingEnabled ?? true,
        maxIterations: options?.maxIterations || 20
      })

      let finalOutput = "Task completed successfully!"
      let screenshots: string[] = []

      // Handle the response - it should be an array of PromptMessage objects
      if (Array.isArray(response)) {
        const assistantMessages = response.filter(msg => msg.role === 'assistant')
        if (assistantMessages.length > 0) {
          const lastMessage = assistantMessages[assistantMessages.length - 1]
          if (typeof lastMessage.content === 'string') {
            finalOutput = lastMessage.content
          } else {
            finalOutput = JSON.stringify(lastMessage.content)
          }
        }
      } else if (typeof response === 'string') {
        finalOutput = response
      } else if (response && typeof response === 'object') {
        finalOutput = JSON.stringify(response)
      }

      // Take a screenshot
      try {
        const screenshot = await this.computer.screenshotBase64()
        if (screenshot) {
          screenshots.push(screenshot)
        }
      } catch (screenshotError) {
        // Screenshot failed, but continue with the response
      }

      return {
        success: true,
        output: finalOutput,
        screenshots,
        projectId: this.status.projectId
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      return {
        success: false,
        output: '',
        error: errorMessage,
        projectId: this.status.projectId
      }
    }
  }

  getStatus(): OrgoStatus {
    return { ...this.status }
  }

  isConnected(): boolean {
    return this.status.isConnected
  }
}

// Singleton instance for the server
const orgoService = new ServerOrgoService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, input, options, projectId } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required "action" field' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'connect':
        try {
          const status = await orgoService.connect(projectId)
          return NextResponse.json({ success: true, status })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
          )
        }

      case 'disconnect':
        try {
          await orgoService.disconnect()
          return NextResponse.json({ success: true })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
          )
        }

      case 'process':
        try {
          if (!orgoService.isConnected()) {
            await orgoService.connect()
          }
          const result = await orgoService.processRequest(input, options)
          return NextResponse.json({ success: true, result })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
          )
        }

      case 'status':
        try {
          const currentStatus = orgoService.getStatus()
          return NextResponse.json({ success: true, status: currentStatus })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
          )
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Orgo API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}