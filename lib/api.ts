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
      baseUrl: "/api/orgo", // Use local Next.js API routes
    }
    
    // API keys configured
    
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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
    
    // Project created successfully
    
    // CRITICAL: Start the project immediately after creation
    try {
      await this.startProject(project.id)
      
      // Wait for the project to fully initialize
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Verify the project is still active
      const updatedProject = await this.getProject(project.id)
      
    } catch (error) {
      console.error('❌ Failed to start project:', error)
      // Don't throw here, the project might already be running
    }
    
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
    return this.request(`/computers/${projectName}/bash`, {
      method: "POST",
      body: JSON.stringify({ command })
    })
  }

  async executePythonCode(projectId: string, code: string, timeout?: number): Promise<{ output: string; error?: string }> {
    return this.request(`/computers/${projectId}/python`, {
      method: "POST",
      body: JSON.stringify({ code, timeout })
    })
  }

  async wait(projectId: string, duration: number): Promise<void> {
    await this.request(`/computers/${projectId}/wait`, {
      method: "POST",
      body: JSON.stringify({ duration })
    })
  }

  // Universal task processing - accepts ANY command and executes it
  async processTask(input: string): Promise<string> {
    if (!this.currentProject) {
      throw new Error("No active Orgo project. Please create a project first.")
    }

    const computerName = this.currentProject.name
    
    // First, test if the project is still active
    try {
      await this.validateCurrentProject()
    } catch (error) {
      console.warn('❌ Project validation failed, but continuing...')
    }
    
    // Check if this looks like natural language (not a bash command)
    const isNaturalLanguage = !input.includes(' ') || 
                             input.toLowerCase().includes('open') ||
                             input.toLowerCase().includes('search') ||
                             input.toLowerCase().includes('find') ||
                             input.toLowerCase().includes('click') ||
                             input.toLowerCase().includes('type') ||
                             input.toLowerCase().includes('go to') ||
                             input.toLowerCase().includes('navigate');
    
    if (isNaturalLanguage) {
      // Use Claude to convert natural language to bash commands
      return await this.processWithClaude(input, computerName)
    } else {
      // Execute as a direct bash command
      try {
        const result = await this.executeBashCommand(computerName, input)
        
        return `✅ **Command Executed Successfully**

**Your Command:** "${input}"

**Command Output:**
\`\`\`
${result.output || 'Command completed successfully'}
${result.error ? `\nError: ${result.error}` : ''}
\`\`\`

**Desktop:** ${computerName}
**Status:** Ready for more commands! 🚀

**Note:** You can run any bash command, open applications, create files, or perform any desktop operation.`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return `❌ **Command Failed**

**Your Command:** "${input}"
**Error:** ${errorMessage}

**Try these valid commands instead:**
- \`ls -la\` - List files
- \`pwd\` - Show current directory  
- \`echo "hello"\` - Print text
- \`firefox https://google.com\` - Open browser
- \`uname -a\` - System info
- \`find /home -name "*.txt"\` - Find files

**Desktop:** ${computerName}
**Status:** Ready for more commands! 🚀`
      }
    }
  }

  // Process natural language with Claude
  async processWithClaude(input: string, computerName: string): Promise<string> {
    try {
      // Call Claude API to convert natural language to bash commands
      const claudeResponse = await this.callClaudeAPI(input)
      
      // Execute the converted bash command
      const result = await this.executeBashCommand(computerName, claudeResponse)
      
      return `✅ **Natural Language Command Executed**

**Your Request:** "${input}"
**Claude Converted To:** "${claudeResponse}"

**Command Output:**
\`\`\`
${result.output || 'Command completed successfully'}
${result.error ? `\nError: ${result.error}` : ''}
\`\`\`

**Desktop:** ${computerName}
**Status:** Ready for more commands! 🚀

**Note:** Claude interpreted your natural language request and converted it to a bash command.`
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return `❌ **Natural Language Processing Failed**

**Your Request:** "${input}"
**Error:** ${errorMessage}

**Try these instead:**
- Use direct bash commands like \`ls\`, \`pwd\`, \`firefox https://google.com\`
- Or make sure your Claude API key is configured

**Desktop:** ${computerName}
**Status:** Ready for more commands! 🚀`
    }
  }

  // Call Claude API to convert natural language to bash commands
  async callClaudeAPI(input: string): Promise<string> {
    const response = await fetch('/api/orgo/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const bashCommand = data.bashCommand
    
    return bashCommand
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
      const project = await this.getProject(this.currentProject.id)
      
      // Update the current project with fresh data
      this.currentProject = project
      this.saveCurrentProject()
      
      return true
    } catch (error) {
      console.warn('❌ Project validation failed:', error)
      // Only clear if it's a 404 (project doesn't exist)
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('Project no longer exists, clearing from storage')
        this.clearCurrentProject()
        return false
      }
      // For other errors (network, etc.), don't clear the project
      // Just return true to continue with the current project
      return true
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
