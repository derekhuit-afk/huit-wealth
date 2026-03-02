'use client'

import { useState } from 'react'
import { AGENTS, AssessmentData, calculateEquityMetrics } from '@/lib/agents'

const STEPS = [
  { id: 1, label: 'Property', description: 'Your current mortgage details' },
  { id: 2, label: 'Profile', description: 'Your financial overview' },
  { id: 3, label: 'Goals', description: 'What you want to achieve' },
  { id: 4, label: 'Contact', description: 'Get your personalized report' },
]

const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo']
const EMPLOYMENT_TYPES = ['W-2 Employee', 'Self-Employed', 'Retired', 'Other']
const GOALS = [
  'Lower my monthly payment',
  'Access equity for home improvements',
  'Consolidate debt',
  'Invest the equity',
  'Pay off mortgage faster',
  'Fund education or major expense',
]
const TIME_HORIZONS = ['1-3 months', '3-6 months', '6-12 months', '1-2 years', '2+ years']
const RISK_LEVELS = ['Conservative', 'Moderate', 'Aggressive']

function AgentCard({ agent, result }: { agent: typeof AGENTS[0], result?: any }) {
  const isRunning = result?.status === 'running'
  const isComplete = result?.status === 'complete'
  const score = result?.score || 0

  const categoryColors: Record<string, string> = {
    APEX: '#C9A84C',
    INTEL: '#6366F1',
    PSY: '#10B981',
  }
  const color = categoryColors[agent.category] || '#C9A84C'

  return (
    <div className={`card-glass rounded-xl p-4 transition-all duration-500 ${isComplete ? 'agent-glow' : ''}`}
         style={{ borderColor: isComplete ? color + '40' : 'rgba(201,168,76,0.1)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.icon}</span>
          <div>
            <div className="text-xs font-bold" style={{ color }}>{agent.id}</div>
            <div className="text-white text-sm font-medium">{agent.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="typing-indicator flex gap-1">
              <span></span><span></span><span></span>
            </div>
          )}
          {isComplete && (
            <div className="text-right">
              <div className="text-xs text-gray-400">Score</div>
              <div className="font-bold text-lg" style={{ color }}>{score}</div>
            </div>
          )}
          {!result && (
            <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center">
              <span className="text-gray-600 text-xs">—</span>
            </div>
          )}
        </div>
      </div>
      {isComplete && result?.insights && result.insights.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            {result.insights.slice(0, 2).map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-1">
                <span style={{ color }}>›</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {isRunning && (
        <div className="mt-2">
          <div className="shimmer h-2 rounded"></div>
        </div>
      )}
    </div>
  )
}

export default function AssessmentPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<AssessmentData>>({
    loanType: 'Conventional',
    employmentType: 'W-2 Employee',
    primaryGoal: '',
    timeHorizon: '3-6 months',
    riskTolerance: 'Moderate',
  })
  const [agentResults, setAgentResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [compositeScore, setCompositeScore] = useState<number | null>(null)
  const [briefing, setBriefing] = useState<string>('')
  const [showResults, setShowResults] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof AssessmentData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const metrics = calculateEquityMetrics(data)

  const runAgents = async () => {
    setIsRunning(true)
    setError('')
    
    // Set all agents to running state
    const initialResults = AGENTS.map(a => ({ agentId: a.id, agentName: a.name, status: 'running', score: 0, insights: [] }))
    setAgentResults(initialResults)
    setShowResults(true)

    try {
      // Fetch market data
      let marketData = null
      try {
        const fredRes = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US&vintage_date=2025-01-01&realtime_start=2025-01-01&realtime_end=9999-12-31&limit=1&sort_order=desc&output_type=file&file_type=json')
        // FRED API may not be directly accessible, use fallback
      } catch {
        marketData = { rate30yr: 6.875, rate15yr: 6.25, trend: 'Slightly declining from recent highs' }
      }

      // Run all 8 agents
      const agentRes = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentData: data, marketData }),
      })
      
      const agentData = await agentRes.json()
      
      if (agentData.success) {
        setAgentResults(agentData.results)
        setCompositeScore(agentData.compositeScore)

        // Generate briefing
        const briefRes = await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentData: data, agentResults: agentData.results }),
        })
        
        const briefData = await briefRes.json()
        if (briefData.briefing) {
          setBriefing(briefData.briefing)
        }

        // Capture lead
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentData: data,
            agentResults: agentData.results,
            compositeScore: agentData.compositeScore,
            briefing: briefData.briefing,
          }),
        })
        setLeadCaptured(true)
      } else {
        setError('Agent analysis failed. Please try again.')
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.')
      console.error(err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!data.email || !data.firstName || !data.lastName) {
      setError('Please complete all required contact fields.')
      return
    }
    await runAgents()
  }

  const inputClass = "w-full bg-navy-card border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
  const labelClass = "block text-gray-400 text-sm mb-2"

  if (showResults) {
    const scoreColor = compositeScore && compositeScore >= 75 ? '#10B981' : compositeScore && compositeScore >= 55 ? '#C9A84C' : '#EF4444'

    return (
      <div className="min-h-screen bg-navy">
        {/* Header */}
        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black text-sm">H</div>
            <div>
              <div className="text-white font-semibold">HuitWealth Advisor</div>
              <div className="text-gray-500 text-xs">8-Agent Intelligence Analysis</div>
            </div>
          </div>
          {compositeScore && (
            <div className="text-right">
              <div className="text-gray-400 text-xs">Composite Intelligence Score</div>
              <div className="text-3xl font-bold" style={{ color: scoreColor }}>{compositeScore}</div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Agent Results */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <h2 className="text-white font-semibold mb-1">Intelligence Network</h2>
                <p className="text-gray-500 text-sm">8 specialized agents analyzing your profile</p>
              </div>
              <div className="space-y-3">
                {AGENTS.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    result={agentResults.find(r => r.agentId === agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right: Briefing + Equity Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Equity Summary */}
              <div className="card-glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">◆</span> Your Equity Position
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Current Equity', value: `$${metrics.equity.toLocaleString()}`, color: '#C9A84C' },
                    { label: 'LTV Ratio', value: `${metrics.ltv.toFixed(1)}%`, color: metrics.ltv < 80 ? '#10B981' : '#EF4444' },
                    { label: 'Max Cash-Out', value: `$${metrics.maxCashOut.toLocaleString()}`, color: '#6366F1' },
                    { label: 'DTI Ratio', value: `${metrics.dti.toFixed(1)}%`, color: metrics.dti < 43 ? '#10B981' : '#EF4444' },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-900 rounded-xl p-4 text-center">
                      <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-gray-500 text-xs mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Briefing */}
              <div className="card-glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">◆</span> Your Intelligence Briefing
                  {isRunning && <span className="text-gray-500 text-sm font-normal ml-2">Generating...</span>}
                </h3>
                {briefing ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {briefing}
                  </div>
                ) : isRunning ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="shimmer h-4 rounded" style={{ width: i === 4 ? '60%' : '100%' }}></div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Briefing will appear after agent analysis completes.</div>
                )}
              </div>

              {/* CTA */}
              {!isRunning && briefing && (
                <div className="card-glass rounded-2xl p-6 border border-yellow-500/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500 text-xl">📞</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">Speak with Your Advisor</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Your analysis is complete. A HuitWealth advisor will reach out to {data.email} within 24 hours to walk through your personalized strategy.
                      </p>
                      <div className="flex gap-3">
                        <a href="tel:+19075551234"
                           className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition-colors">
                          Call Now
                        </a>
                        <button
                          onClick={() => { setShowResults(false); setStep(1); setAgentResults([]); setBriefing(''); setCompositeScore(null) }}
                          className="border border-gray-600 text-gray-300 px-6 py-2 rounded-lg text-sm hover:border-gray-400 transition-colors">
                          New Assessment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black text-sm">H</div>
            <div>
              <div className="text-white font-semibold">HuitWealth Advisor</div>
              <div className="text-gray-500 text-xs">Powered by 8 AI Intelligence Agents</div>
            </div>
          </div>
          <div className="text-gray-500 text-xs hidden sm:block">
            by <span className="text-yellow-500">Huit.AI</span>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.id ? 'step-complete' : step === s.id ? 'step-active' : 'step-inactive'
                  }`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <div className={`text-xs mt-1 font-medium hidden sm:block ${step >= s.id ? 'text-yellow-500' : 'text-gray-600'}`}>
                    {s.label}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? 'bg-yellow-500' : 'bg-gray-800'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">{STEPS[step-1].label}</h1>
              <p className="text-gray-500">{STEPS[step-1].description}</p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Property */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Current Home Value *</label>
                    <input type="number" className={inputClass} placeholder="450,000"
                           value={data.propertyValue || ''} onChange={e => update('propertyValue', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>Remaining Loan Balance *</label>
                    <input type="number" className={inputClass} placeholder="280,000"
                           value={data.currentBalance || ''} onChange={e => update('currentBalance', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Current Interest Rate (%)</label>
                    <input type="number" step="0.125" className={inputClass} placeholder="6.875"
                           value={data.interestRate || ''} onChange={e => update('interestRate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>Monthly Payment</label>
                    <input type="number" className={inputClass} placeholder="1,850"
                           value={data.monthlyPayment || ''} onChange={e => update('monthlyPayment', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Loan Type</label>
                    <select className={inputClass} value={data.loanType} onChange={e => update('loanType', e.target.value)}>
                      {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Years Remaining on Loan</label>
                    <input type="number" className={inputClass} placeholder="25"
                           value={data.yearsRemaining || ''} onChange={e => update('yearsRemaining', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Financial Profile */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Annual Household Income *</label>
                    <input type="number" className={inputClass} placeholder="120,000"
                           value={data.annualIncome || ''} onChange={e => update('annualIncome', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>Credit Score (estimate)</label>
                    <input type="number" className={inputClass} placeholder="720" min="300" max="850"
                           value={data.creditScore || ''} onChange={e => update('creditScore', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Monthly Debt Payments</label>
                    <input type="number" className={inputClass} placeholder="500"
                           value={data.monthlyDebts || ''} onChange={e => update('monthlyDebts', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>Years at Current Job</label>
                    <input type="number" className={inputClass} placeholder="5"
                           value={data.yearsEmployed || ''} onChange={e => update('yearsEmployed', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Employment Type</label>
                  <select className={inputClass} value={data.employmentType} onChange={e => update('employmentType', e.target.value)}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className={labelClass}>Primary Goal *</label>
                  <div className="grid grid-cols-1 gap-2">
                    {GOALS.map(g => (
                      <button key={g} onClick={() => update('primaryGoal', g)}
                              className={`text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                                data.primaryGoal === g
                                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                  : 'border-gray-700 text-gray-300 hover:border-gray-500'
                              }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Time Horizon</label>
                    <select className={inputClass} value={data.timeHorizon} onChange={e => update('timeHorizon', e.target.value)}>
                      {TIME_HORIZONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Risk Tolerance</label>
                    <select className={inputClass} value={data.riskTolerance} onChange={e => update('riskTolerance', e.target.value)}>
                      {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Cash or Funds Needed (if applicable)</label>
                  <input type="number" className={inputClass} placeholder="0"
                         value={data.cashNeeded || ''} onChange={e => update('cashNeeded', parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            )}

            {/* Step 4: Contact */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="card-glass rounded-xl p-4 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-lg">🤖</span>
                    <span className="text-white font-medium text-sm">Ready to deploy 8 AI agents</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Your personalized intelligence report will be generated immediately after you submit. Enter your contact info to receive your full briefing.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input type="text" className={inputClass} placeholder="Derek"
                           value={data.firstName || ''} onChange={e => update('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input type="text" className={inputClass} placeholder="Smith"
                           value={data.lastName || ''} onChange={e => update('lastName', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input type="email" className={inputClass} placeholder="you@email.com"
                         value={data.email || ''} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" className={inputClass} placeholder="(907) 555-0123"
                           value={data.phone || ''} onChange={e => update('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Best Time to Call</label>
                    <select className={inputClass} value={data.bestTimeToCall || ''} onChange={e => update('bestTimeToCall', e.target.value)}>
                      <option value="">Select...</option>
                      <option>Morning (8-12)</option>
                      <option>Afternoon (12-5)</option>
                      <option>Evening (5-8)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => { setStep(step - 1); setError('') }}
                        className="flex-1 border border-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium hover:border-gray-500 transition-colors">
                  Back
                </button>
              )}
              {step < 4 ? (
                <button onClick={() => { setError(''); setStep(step + 1) }}
                        className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isRunning}
                        className="flex-1 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isRunning ? 'Launching Agents...' : '⚡ Launch Intelligence Analysis'}
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="lg:col-span-2">
            {/* Equity Preview */}
            {(data.propertyValue || data.currentBalance) ? (
              <div className="card-glass rounded-2xl p-5 mb-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Live Equity Preview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Equity</span>
                    <span className="text-yellow-500 font-bold">${metrics.equity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">LTV</span>
                    <span className={`font-bold ${metrics.ltv < 80 ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics.ltv.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Max Cash-Out</span>
                    <span className="text-purple-400 font-bold">${metrics.maxCashOut.toLocaleString()}</span>
                  </div>
                  {metrics.dti > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">DTI</span>
                      <span className={`font-bold ${metrics.dti < 43 ? 'text-green-400' : 'text-red-400'}`}>
                        {metrics.dti.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Agent Preview */}
            <div className="card-glass rounded-2xl p-5">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Intelligence Network</h3>
              <div className="space-y-2">
                {AGENTS.map(agent => {
                  const categoryColors: Record<string, string> = { APEX: '#C9A84C', INTEL: '#6366F1', PSY: '#10B981' }
                  return (
                    <div key={agent.id} className="flex items-center gap-2 py-1">
                      <span className="text-base">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{agent.name}</div>
                        <div className="text-gray-600 text-xs">{agent.id}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ background: categoryColors[agent.category] }}></div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                <div className="text-gray-600 text-xs">All 8 agents deploy simultaneously upon submission</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
