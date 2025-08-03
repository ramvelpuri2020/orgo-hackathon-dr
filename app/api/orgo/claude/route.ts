import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()
    const claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY
    
    if (!claudeApiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Convert this natural language request into a single bash command that can be executed on a Linux desktop:

Request: "${input}"

Rules:
- Return ONLY the bash command, nothing else
- Use firefox for web browsing
- Use xdotool for typing if needed
- Keep it simple and direct
- If it's a web search, use: firefox "https://www.google.com/search?q=SEARCH_TERMS"
- If it's opening an app, use: firefox URL or appropriate command

Bash command:`
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('Claude API error:', error)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const bashCommand = data.content[0].text.trim()
    
    return NextResponse.json({ bashCommand })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json(
      { error: `Failed to convert natural language: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 