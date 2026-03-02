export interface AgentResult {
  agentId: string
  agentName: string
  status: 'idle' | 'running' | 'complete' | 'error'
  output?: string
  score?: number
  insights?: string[]
  processingTime?: number
}

export interface AssessmentData {
  // Step 1 - Property Info
  propertyValue: number
  currentBalance: number
  monthlyPayment: number
  interestRate: number
  loanType: string
  yearsRemaining: number
  // Step 2 - Financial Profile
  annualIncome: number
  creditScore: number
  monthlyDebts: number
  employmentType: string
  yearsEmployed: number
  // Step 3 - Goals
  primaryGoal: string
  timeHorizon: string
  riskTolerance: string
  cashNeeded: number
  // Step 4 - Contact
  firstName: string
  lastName: string
  email: string
  phone: string
  bestTimeToCall: string
}

export const AGENTS = [
  {
    id: 'APEX-MIA',
    name: 'Market Intelligence',
    category: 'APEX',
    icon: '📊',
    description: 'Analyzes current mortgage market conditions, rate trends, and regional equity data',
    color: '#C9A84C',
  },
  {
    id: 'APEX-EPA',
    name: 'Equity Portfolio',
    icon: '🏠',
    category: 'APEX',
    description: 'Calculates precise equity position, LTV ratios, and available wealth extraction options',
    color: '#C9A84C',
  },
  {
    id: 'APEX-RCA',
    name: 'Risk Calibration',
    icon: '⚖️',
    category: 'APEX',
    description: 'Models financial risk across refinance scenarios and equity deployment strategies',
    color: '#C9A84C',
  },
  {
    id: 'APEX-AIA',
    name: 'Arbitrage Intelligence',
    icon: '💡',
    category: 'APEX',
    description: 'Identifies rate arbitrage opportunities and optimal timing for mortgage actions',
    color: '#C9A84C',
  },
  {
    id: 'INTEL-BRA',
    name: 'Behavioral Readiness',
    icon: '🧠',
    category: 'INTEL',
    description: 'Evaluates financial behavior patterns and readiness signals for major mortgage decisions',
    color: '#6366F1',
  },
  {
    id: 'INTEL-ISA',
    name: 'Intent Signal',
    icon: '🎯',
    category: 'INTEL',
    description: 'Decodes underlying financial goals and aligns them with optimal mortgage strategies',
    color: '#6366F1',
  },
  {
    id: 'PSY-CBNA',
    name: 'Cognitive Bias Neutralizer',
    icon: '🔍',
    category: 'PSY',
    description: 'Identifies and neutralizes cognitive biases that could affect financial decision-making',
    color: '#10B981',
  },
  {
    id: 'PSY-FARA',
    name: 'Financial Anxiety Regulation',
    icon: '🛡️',
    category: 'PSY',
    description: 'Addresses financial anxiety patterns and builds confidence in mortgage decisions',
    color: '#10B981',
  },
]

export function calculateEquityMetrics(data: Partial<AssessmentData>) {
  const equity = (data.propertyValue || 0) - (data.currentBalance || 0)
  const ltv = data.propertyValue ? ((data.currentBalance || 0) / data.propertyValue) * 100 : 0
  const maxCashOut = Math.max(0, (data.propertyValue || 0) * 0.8 - (data.currentBalance || 0))
  const dti = data.annualIncome ? (((data.monthlyDebts || 0) + (data.monthlyPayment || 0)) / (data.annualIncome / 12)) * 100 : 0
  
  return { equity, ltv, maxCashOut, dti }
}
