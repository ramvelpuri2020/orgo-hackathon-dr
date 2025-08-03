"use client"

interface OrgoConfig {
  apiKey: string
  claudeApiKey: string
  baseUrl: string
}

interface OrgoProject {
  id: string
  name: string
  status: string
  desktop?: {
    id: string
    status: string
    url: string
  }
}

interface OrgoTask {
  id: string
  input: string
  timestamp: Date
  status: "processing" | "completed" | "error"
  output?: any
  error?: string
}

class OrgoApiService {
  private config: OrgoConfig
  private currentProject: OrgoProject | null = null

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_ORGO_API_KEY || "",
      claudeApiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || "",
      baseUrl: "https://www.orgo.ai/api", // Call Orgo API directly
    }
    
    // Debug: Check if API key is configured
    console.log('Orgo API Key configured:', !!this.config.apiKey)
    console.log('Claude API Key configured:', !!this.config.claudeApiKey)
    
    // Try to restore current project from localStorage
    this.restoreCurrentProject()
  }

  private restoreCurrentProject() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('orgo-current-project')
        if (stored) {
          this.currentProject = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Failed to restore current project from localStorage:', error)
        this.currentProject = null
      }
    }
  }

  private saveCurrentProject() {
    if (typeof window !== 'undefined' && this.currentProject) {
      try {
        localStorage.setItem('orgo-current-project', JSON.stringify(this.currentProject))
      } catch (error) {
        console.warn('Failed to save current project to localStorage:', error)
      }
    }
  }

  private clearCurrentProject() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('orgo-current-project')
      } catch (error) {
        console.warn('Failed to clear current project from localStorage:', error)
      }
    }
    this.currentProject = null
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    console.log(`Making request to: ${url}`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error(`API Error for ${url}:`, response.status, response.statusText, error)
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async createProject(config: { ram?: number; cpu?: number } = {}): Promise<OrgoProject> {
    const project = await this.request("/projects", {
      method: "POST",
      body: JSON.stringify({
        config: {
          ram: config.ram || 2,
          cpu: config.cpu || 2
        }
      })
    })
    
    this.currentProject = project
    this.saveCurrentProject() // Save the new project
    return project
  }

  async getProjects(): Promise<OrgoProject[]> {
    return this.request("/projects")
  }

  async getProject(projectId: string): Promise<OrgoProject> {
    try {
      return await this.request(`/projects/${projectId}`)
    } catch (error) {
      // If the project doesn't exist, clear it from storage
      if (error instanceof Error && error.message.includes('404')) {
        console.warn(`Project ${projectId} no longer exists, clearing from storage`)
        this.clearCurrentProject()
      }
      throw error
    }
  }

  async startProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}?action=start`, { method: "POST" })
  }

  async stopProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}?action=stop`, { method: "POST" })
  }

  async restartProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}?action=restart`, { method: "POST" })
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/projects/${projectId}?action=delete`, { method: "POST" })
  }

  async takeScreenshot(projectName: string): Promise<{ image: string; metadata: any }> {
    return this.request(`/computers/${projectName}/screenshot`)
  }

  async clickMouse(projectName: string, x: number, y: number, options: { button?: string; double?: boolean } = {}): Promise<void> {
    await this.request(`/computers/${projectName}/click`, {
      method: "POST",
      body: JSON.stringify({ x, y, ...options })
    })
  }

  async typeText(projectName: string, text: string): Promise<void> {
    await this.request(`/computers/${projectName}/type`, {
      method: "POST",
      body: JSON.stringify({ text })
    })
  }

  async pressKey(projectName: string, key: string): Promise<void> {
    await this.request(`/computers/${projectName}/key`, {
      method: "POST",
      body: JSON.stringify({ key })
    })
  }

  async scrollPage(projectName: string, x: number, y: number, direction: "up" | "down", amount?: number): Promise<void> {
    await this.request(`/computers/${projectName}/scroll`, {
      method: "POST",
      body: JSON.stringify({ x, y, direction, amount })
    })
  }

  async executeBashCommand(projectName: string, command: string): Promise<{ output: string; error?: string }> {
    console.log(`Executing bash command on ${projectName}:`, command)
    return this.request(`/computers/${projectName}/bash`, {
      method: "POST",
      body: JSON.stringify({ command })
    })
  }

  async executePythonCode(projectName: string, code: string, timeout?: number): Promise<{ output: string; error?: string }> {
    return this.request(`/computers/${projectName}/python`, {
      method: "POST",
      body: JSON.stringify({ code, timeout })
    })
  }

  async wait(projectName: string, duration: number): Promise<void> {
    await this.request(`/computers/${projectName}/wait`, {
      method: "POST",
      body: JSON.stringify({ duration })
    })
  }

  // Universal task processing - accepts ANY command and executes it
  async processTask(input: string): Promise<string> {
    if (!this.currentProject) {
      throw new Error("No active Orgo project. Please create a project first.")
    }

    const projectName = this.currentProject.name
    
    try {
      // Execute the user's input as a bash command
      const result = await this.executeBashCommand(projectName, input)
      
      return `✅ **Command Executed Successfully**

**Your Command:** "${input}"

**Command Output:**
\`\`\`
${result.output || 'Command completed successfully'}
${result.error ? `\nError: ${result.error}` : ''}
\`\`\`

**Desktop:** ${projectName}
**Status:** Ready for more commands! 🚀

**Note:** You can run any bash command, open applications, create files, or perform any desktop operation.`
    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Legacy method for backward compatibility
  async processTaskWithClaude(input: string): Promise<string> {
    return this.processTask(input)
  }

  getCurrentProject(): OrgoProject | null {
    return this.currentProject
  }

  setCurrentProject(project: OrgoProject): void {
    this.currentProject = project
    this.saveCurrentProject() // Save the new project
  }

  async validateCurrentProject(): Promise<boolean> {
    if (!this.currentProject) {
      return false
    }

    try {
      await this.getProject(this.currentProject.id)
      return true
    } catch (error) {
      // Project doesn't exist, clear it
      this.clearCurrentProject()
      return false
    }
  }

  // Check if both API keys are configured
  isConfigured(): { orgo: boolean; claude: boolean } {
    return {
      orgo: !!this.config.apiKey,
      claude: !!this.config.claudeApiKey
    }
  }
}

export const orgoApiService = new OrgoApiService()
export const apiService = orgoApiService // For backward compatibility
