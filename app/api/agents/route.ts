export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildAgentPrompt } from '@/lib/prompts'
import { AGENTS } from '@/lib/agents'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { assessmentData, marketData } = await request.json()

    // Run all 8 agents in parallel (Wave 1)
    const agentPromises = AGENTS.map(async (agent) => {
      const startTime = Date.now()
      try {
        const prompt = buildAgentPrompt(agent.id, assessmentData, marketData)
        
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        })

        const rawOutput = response.content[0].type === 'text' ? response.content[0].text : '{}'
        
        // Parse JSON output
        let parsed: any = {}
        try {
          const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0])
          }
        } catch {
          parsed = { summary: rawOutput.slice(0, 200), score: 75 }
        }

        return {
          agentId: agent.id,
          agentName: agent.name,
          status: 'complete',
          output: JSON.stringify(parsed),
          score: parsed.score || parsed.readinessScore || parsed.arbitrageScore || parsed.biasScore || parsed.confidenceScore || parsed.intentScore || parsed.equityScore || parsed.riskScore || 75,
          insights: parsed.insights || [],
          processingTime: Date.now() - startTime,
        }
      } catch (error) {
        return {
          agentId: agent.id,
          agentName: agent.name,
          status: 'error',
          output: JSON.stringify({ summary: 'Analysis temporarily unavailable', score: 70 }),
          score: 70,
          insights: [],
          processingTime: Date.now() - startTime,
        }
      }
    })

    const results = await Promise.all(agentPromises)
    
    // Calculate composite score
    const avgScore = Math.round(results.reduce((sum, r) => sum + (r.score || 70), 0) / results.length)

    return NextResponse.json({
      success: true,
      results,
      compositeScore: avgScore,
      agentsCompleted: results.filter(r => r.status === 'complete').length,
    })
  } catch (error) {
    console.error('Agent orchestration error:', error)
    return NextResponse.json({ error: 'Agent orchestration failed' }, { status: 500 })
  }
}
