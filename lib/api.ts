"use client"

class ApiService {
  private baseUrl: string

  constructor() {
    // Use environment variable if available, otherwise fall back to relative path
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/orgo'
  }

  private async callOrgoAPI(action: string, data?: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }

    return response.json()
  }

  async processTask(input: string): Promise<any> {
    try {
      const result = await this.callOrgoAPI('process', {
        input,
        options: {
          thinkingEnabled: true,
          maxIterations: 15
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to process request')
      }

      // Return the result with screenshots if available
      return {
        output: result.result.output,
        screenshots: result.result.screenshots,
        projectId: result.result.projectId
      }

    } catch (error) {
      console.error('Orgo service error:', error)
      throw error
    }
  }

  async connectToOrgo(projectId?: string): Promise<void> {
    try {
      await this.callOrgoAPI('connect', { projectId })
    } catch (error) {
      console.error('Failed to connect to Orgo:', error)
      throw error
    }
  }

  async disconnectFromOrgo(): Promise<void> {
    try {
      await this.callOrgoAPI('disconnect')
    } catch (error) {
      console.error('Failed to disconnect from Orgo:', error)
      throw error
    }
  }

  async getOrgoStatus() {
    try {
      const result = await this.callOrgoAPI('status')
      return result.status
    } catch (error) {
      console.error('Failed to get Orgo status:', error)
      return {
        isConnected: false,
        isRunning: false
      }
    }
  }
}

export const apiService = new ApiService()
