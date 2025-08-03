export interface OrgoTaskResult {
  success: boolean
  output: string
  screenshots?: string[]
  error?: string
  projectId?: string
}

export interface OrgoStatus {
  isConnected: boolean
  isRunning: boolean
  projectId?: string
  error?: string
}

export interface OrgoOptions {
  model?: string
  thinkingEnabled?: boolean
  maxIterations?: number
}

class OrgoClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/orgo'
  }

  async connect(projectId?: string): Promise<OrgoStatus> {
    try {
      const requestBody = {
        action: 'connect',
        projectId
      }

      // Validate request body
      if (!requestBody.action) {
        throw new Error('Invalid request: missing action')
      }



      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP error! status: ${response.status}` }
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to connect')
      }

      return data.status
    } catch (error) {
      console.error('Orgo client connect error:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      const requestBody = {
        action: 'disconnect'
      }

      // Validate request body
      if (!requestBody.action) {
        throw new Error('Invalid request: missing action')
      }



      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP error! status: ${response.status}` }
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to disconnect')
      }
    } catch (error) {
      console.error('Orgo client disconnect error:', error)
      throw error
    }
  }

  async processRequest(input: string, options?: OrgoOptions): Promise<OrgoTaskResult> {
    try {
      const requestBody = {
        action: 'process',
        input,
        options
      }

      // Validate request body
      if (!requestBody.action) {
        throw new Error('Invalid request: missing action')
      }
      if (!requestBody.input) {
        throw new Error('Invalid request: missing input')
      }



      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP error! status: ${response.status}` }
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to process request')
      }

      return data.result
    } catch (error) {
      console.error('Orgo client process error:', error)
      throw error
    }
  }

  async getStatus(): Promise<OrgoStatus> {
    try {
      const requestBody = {
        action: 'status'
      }

      // Validate request body
      if (!requestBody.action) {
        throw new Error('Invalid request: missing action')
      }



      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP error! status: ${response.status}` }
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to get status')
      }

      return data.status
    } catch (error) {
      console.error('Orgo client status error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const orgoClient = new OrgoClient() 