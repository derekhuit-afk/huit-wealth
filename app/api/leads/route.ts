export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { assessmentData, agentResults, compositeScore, briefing } = await request.json()

    // Save lead to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      const leadData = {
        first_name: assessmentData.firstName,
        last_name: assessmentData.lastName,
        email: assessmentData.email,
        phone: assessmentData.phone,
        source: 'HuitWealth',
        status: 'new',
        score: compositeScore,
        notes: `HuitWealth Assessment | Goal: ${assessmentData.primaryGoal} | Equity: $${((assessmentData.propertyValue || 0) - (assessmentData.currentBalance || 0)).toLocaleString()} | Cash Needed: $${(assessmentData.cashNeeded || 0).toLocaleString()}`,
        metadata: {
          assessmentData,
          agentResults: agentResults?.map((r: any) => ({ agentId: r.agentId, score: r.score })),
          compositeScore,
          briefing: briefing?.slice(0, 500),
          capturedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('leads').insert([leadData])
      if (error) {
        console.error('Supabase lead capture error:', error)
      }
    }

    return NextResponse.json({ success: true, message: 'Lead captured successfully' })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Lead capture failed' }, { status: 500 })
  }
}
