import { NextRequest, NextResponse } from 'next/server'

// This route allows the frontend to securely get the current project ID
// without exposing any sensitive information
export async function GET(request: NextRequest) {
  try {
    // Get the project ID from the request headers (set by the frontend)
    const projectId = request.headers.get('x-orgo-project-id')
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'No project ID provided' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      projectId
    })
  } catch (error) {
    console.error('Project ID API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 