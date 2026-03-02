import { AssessmentData, calculateEquityMetrics } from './agents'

export function buildAgentPrompt(agentId: string, data: Partial<AssessmentData>, marketData?: any): string {
  const metrics = calculateEquityMetrics(data)
  
  const baseContext = `
HOMEOWNER PROFILE:
- Property Value: $${(data.propertyValue || 0).toLocaleString()}
- Current Loan Balance: $${(data.currentBalance || 0).toLocaleString()}
- Current Rate: ${data.interestRate || 0}%
- Monthly Payment: $${(data.monthlyPayment || 0).toLocaleString()}
- Years Remaining: ${data.yearsRemaining || 0}
- Loan Type: ${data.loanType || 'Unknown'}

FINANCIAL PROFILE:
- Annual Income: $${(data.annualIncome || 0).toLocaleString()}
- Credit Score: ${data.creditScore || 'Unknown'}
- Monthly Debts: $${(data.monthlyDebts || 0).toLocaleString()}
- Employment: ${data.employmentType || 'Unknown'} (${data.yearsEmployed || 0} years)

EQUITY METRICS:
- Current Equity: $${metrics.equity.toLocaleString()}
- LTV Ratio: ${metrics.ltv.toFixed(1)}%
- Max Cash-Out Available: $${metrics.maxCashOut.toLocaleString()}
- DTI Ratio: ${metrics.dti.toFixed(1)}%

GOALS:
- Primary Goal: ${data.primaryGoal || 'Not specified'}
- Time Horizon: ${data.timeHorizon || 'Not specified'}
- Risk Tolerance: ${data.riskTolerance || 'Not specified'}
- Cash Needed: $${(data.cashNeeded || 0).toLocaleString()}

${marketData ? `CURRENT MARKET DATA:
- 30yr Fixed Rate: ${marketData.rate30yr || 'N/A'}%
- 15yr Fixed Rate: ${marketData.rate15yr || 'N/A'}%
- Market Trend: ${marketData.trend || 'N/A'}` : ''}
`

  const prompts: Record<string, string> = {
    'APEX-MIA': `You are APEX-MIA, a Market Intelligence Agent for HuitWealth by Huit.AI. You analyze mortgage market conditions with precision and authority.

${baseContext}

Analyze the current market conditions for this homeowner. Provide:
1. Current rate environment assessment (favorable/neutral/unfavorable for their goal)
2. Regional market equity trends based on their loan profile
3. Optimal window timing for action (immediate/3-6 months/wait)
4. 3 specific market insights relevant to their situation

Respond in JSON format:
{
  "marketAssessment": "favorable|neutral|unfavorable",
  "rateEnvironment": "string description",
  "optimalTiming": "immediate|3-6months|wait",
  "insights": ["insight1", "insight2", "insight3"],
  "score": 0-100,
  "summary": "2-3 sentence executive summary"
}`,

    'APEX-EPA': `You are APEX-EPA, an Equity Portfolio Agent for HuitWealth by Huit.AI. You calculate and optimize equity positions.

${baseContext}

Analyze this homeowner's equity portfolio. Provide:
1. Equity utilization score (how efficiently they're using their equity)
2. Recommended equity strategy (keep/tap/restructure)
3. Projected equity in 1, 3, and 5 years at current trajectory
4. Alternative scenarios if they act now

Respond in JSON format:
{
  "equityScore": 0-100,
  "strategy": "keep|tap|restructure",
  "projections": {"year1": number, "year3": number, "year5": number},
  "recommendedAction": "string",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'APEX-RCA': `You are APEX-RCA, a Risk Calibration Agent for HuitWealth by Huit.AI. You model financial risk with surgical precision.

${baseContext}

Assess the risk profile for this homeowner's financial situation. Provide:
1. Overall risk score for taking action (low/medium/high)
2. Top 3 risk factors present in their profile
3. Risk mitigation strategies
4. Go/no-go recommendation with reasoning

Respond in JSON format:
{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high",
  "riskFactors": ["factor1", "factor2", "factor3"],
  "mitigations": ["mitigation1", "mitigation2"],
  "recommendation": "go|caution|no-go",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'APEX-AIA': `You are APEX-AIA, an Arbitrage Intelligence Agent for HuitWealth by Huit.AI. You identify financial optimization opportunities.

${baseContext}

Identify arbitrage and optimization opportunities for this homeowner. Provide:
1. Rate arbitrage opportunity score
2. Best strategy type (rate/term refi, cash-out, HELOC, keep)
3. Estimated monthly savings or cost
4. Net benefit over 5 years

Respond in JSON format:
{
  "arbitrageScore": 0-100,
  "bestStrategy": "rate-refi|term-refi|cash-out|heloc|keep",
  "monthlyImpact": number,
  "fiveYearBenefit": number,
  "breakEvenMonths": number,
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'INTEL-BRA': `You are INTEL-BRA, a Behavioral Readiness Agent for HuitWealth by Huit.AI. You evaluate financial behavior and decision readiness.

${baseContext}

Assess this homeowner's behavioral readiness for a major financial decision. Provide:
1. Decision readiness score
2. Key behavioral strengths in their profile
3. Potential behavioral barriers to watch
4. Readiness timeline assessment

Respond in JSON format:
{
  "readinessScore": 0-100,
  "readinessLevel": "high|medium|developing",
  "strengths": ["strength1", "strength2"],
  "barriers": ["barrier1", "barrier2"],
  "timeline": "ready-now|1-3months|needs-prep",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'INTEL-ISA': `You are INTEL-ISA, an Intent Signal Agent for HuitWealth by Huit.AI. You decode financial intent and align strategies.

${baseContext}

Decode this homeowner's financial intent signals. Provide:
1. Primary intent classification
2. Alignment between stated goals and financial profile
3. Hidden needs that their data suggests
4. Recommended conversation approach for their loan officer

Respond in JSON format:
{
  "intentScore": 0-100,
  "primaryIntent": "string",
  "goalAlignment": "high|medium|low",
  "hiddenNeeds": ["need1", "need2"],
  "conversationApproach": "string",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'PSY-CBNA': `You are PSY-CBNA, a Cognitive Bias Neutralizer for HuitWealth by Huit.AI. You identify and address cognitive biases in financial decisions.

${baseContext}

Identify cognitive biases that may affect this homeowner's decision. Provide:
1. Top 2 cognitive biases present in their profile
2. How these biases may be affecting their financial choices
3. Evidence-based reframes for each bias
4. Decision quality score

Respond in JSON format:
{
  "biasScore": 0-100,
  "primaryBiases": ["bias1", "bias2"],
  "biasImpacts": ["impact1", "impact2"],
  "reframes": ["reframe1", "reframe2"],
  "decisionQuality": "high|medium|low",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,

    'PSY-FARA': `You are PSY-FARA, a Financial Anxiety Regulation Agent for HuitWealth by Huit.AI. You address financial anxiety and build decision confidence.

${baseContext}

Assess this homeowner's financial anxiety profile. Provide:
1. Financial confidence score
2. Primary anxiety triggers in their situation
3. Confidence-building recommendations
4. Empowerment messaging for their specific situation

Respond in JSON format:
{
  "confidenceScore": 0-100,
  "anxietyLevel": "low|moderate|elevated",
  "triggers": ["trigger1", "trigger2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "empowermentMessage": "string",
  "insights": ["insight1", "insight2", "insight3"],
  "summary": "2-3 sentence executive summary"
}`,
  }

  return prompts[agentId] || prompts['APEX-MIA']
}

export function buildBriefingPrompt(data: Partial<AssessmentData>, agentResults: any[]): string {
  const metrics = calculateEquityMetrics(data)
  
  return `You are the HuitWealth Chief Intelligence Officer, synthesizing analysis from 8 specialized AI agents into a personalized executive briefing.

HOMEOWNER: ${data.firstName} ${data.lastName}
EQUITY POSITION: $${metrics.equity.toLocaleString()} (${metrics.ltv.toFixed(1)}% LTV)
GOAL: ${data.primaryGoal}
CASH NEEDED: $${(data.cashNeeded || 0).toLocaleString()}

AGENT ANALYSIS SUMMARY:
${agentResults.map(r => `${r.agentId}: ${r.output ? JSON.parse(r.output || '{}').summary || '' : ''}`).join('\n')}

Write a personalized 4-paragraph executive briefing for ${data.firstName}:
1. Opening: Acknowledge their specific equity position and goal with confidence
2. Market opportunity: What the agents found about their market timing
3. Recommended action: The specific path forward based on all 8 agent analyses  
4. Next step: A warm, specific call to action to speak with their advisor

Tone: Confident, professional, warm. Write as if you're their trusted wealth advisor. No generic language. Use their real numbers.`
}
