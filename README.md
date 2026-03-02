# HuitWealth Advisor

**8-Agent AI Mortgage Intelligence Platform by Huit.AI**

HuitWealth deploys 8 specialized AI agents simultaneously to analyze a homeowner's equity position, market timing, behavioral readiness, and financial psychology.

## Agent Network

### APEX Agents (Investment Intelligence)
- **APEX-MIA** — Market Intelligence Agent
- **APEX-EPA** — Equity Portfolio Agent  
- **APEX-RCA** — Risk Calibration Agent
- **APEX-AIA** — Arbitrage Intelligence Agent

### INTEL Agents (Consumer Intelligence)
- **INTEL-BRA** — Behavioral Readiness Agent
- **INTEL-ISA** — Intent Signal Agent

### PSY Agents (Financial Psychology)
- **PSY-CBNA** — Cognitive Bias Neutralizer Agent
- **PSY-FARA** — Financial Anxiety Regulation Agent

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude Sonnet
- Supabase (CRMEX lead capture)

## Environment Variables
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deploy
```bash
npm install
npm run build
vercel --prod
```

Deploy to: `wealth.huit.ai`
