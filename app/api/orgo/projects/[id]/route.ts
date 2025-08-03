import { NextRequest, NextResponse } from 'next/server'

const ORGO_BASE_URL = 'https://www.orgo.ai/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgoApiKey = process.env.NEXT_PUBLIC_ORGO_API_KEY
    
    if (!orgoApiKey) {
      return NextResponse.json(
        { error: 'Orgo API key not configured' },
        { status: 500 }
      )
    }

    const { id } = await params

    const response = await fetch(`${ORGO_BASE_URL}/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${orgoApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.error || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Orgo API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orgoApiKey = process.env.NEXT_PUBLIC_ORGO_API_KEY
    
    if (!orgoApiKey) {
      return NextResponse.json(
        { error: 'Orgo API key not configured' },
        { status: 500 }
      )
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'start'
    const { id } = await params

    const response = await fetch(`${ORGO_BASE_URL}/projects/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${orgoApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.error || `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Orgo API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform project action' },
      { status: 500 }
    )
  }
} 