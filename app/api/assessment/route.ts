export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildBriefingPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { assessmentData, agentResults } = await request.json()

    const prompt = buildBriefingPrompt(assessmentData, agentResults)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const briefing = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ success: true, briefing })
  } catch (error) {
    console.error('Briefing error:', error)
    return NextResponse.json({ error: 'Briefing generation failed' }, { status: 500 })
  }
}
