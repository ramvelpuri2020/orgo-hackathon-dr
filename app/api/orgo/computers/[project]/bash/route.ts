import { NextRequest, NextResponse } from 'next/server'

const ORGO_BASE_URL = 'https://www.orgo.ai/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    const orgoApiKey = process.env.NEXT_PUBLIC_ORGO_API_KEY
    
    if (!orgoApiKey) {
      return NextResponse.json(
        { error: 'Orgo API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { project } = await params

    console.log(`Making request to Orgo API: ${ORGO_BASE_URL}/computers/${project}/bash`)
    console.log('Request body:', body)
    console.log('Project name:', project)
    
    const response = await fetch(`${ORGO_BASE_URL}/computers/${project}/bash`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orgoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('Orgo API response status:', response.status)
    console.log('Orgo API response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('Orgo API error response:', error)
      
      // Provide more specific error messages
      let errorMessage = error.error || `HTTP ${response.status}: ${response.statusText}`
      
      if (response.status === 500) {
        errorMessage = `Command execution failed. The command may be invalid or the system may be busy. Try a simpler command like 'ls' or 'pwd'.`
      } else if (response.status === 404) {
        errorMessage = `Computer not found. The project may have expired. Please create a new project.`
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Orgo API error:', error)
    return NextResponse.json(
      { error: `Failed to execute bash command: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 