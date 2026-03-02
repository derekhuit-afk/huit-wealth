import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black">H</div>
            <div>
              <div className="text-white font-bold">HuitWealth</div>
              <div className="text-gray-500 text-xs">by Huit.AI</div>
            </div>
          </div>
          <Link href="/assessment"
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400 transition-colors">
            Start Analysis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 text-yellow-500 text-sm mb-8">
          <span>⚡</span>
          <span>8 Specialized AI Agents — Active Simultaneously</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Your Mortgage Equity
          <br />
          <span style={{ color: '#C9A84C' }}>Is a Financial Asset.</span>
          <br />
          Are You Using It?
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          HuitWealth deploys 8 specialized AI agents to analyze your equity position, market timing, behavioral readiness, and financial psychology — then delivers a personalized action plan in minutes.
        </p>
        
        <Link href="/assessment"
              className="inline-flex items-center gap-2 bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors">
          <span>Launch My Analysis</span>
          <span>→</span>
        </Link>
        
        <div className="mt-4 text-gray-600 text-sm">
          Free · No login required · Results in under 60 seconds
        </div>
      </section>

      {/* Agent Network */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">The Intelligence Network</h2>
          <p className="text-gray-500">8 agents. 3 categories. One unified analysis.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* APEX */}
          <div className="card-glass rounded-2xl p-6 border border-yellow-500/20">
            <div className="text-yellow-500 font-bold text-sm mb-4 flex items-center gap-2">
              <span>◆</span> APEX AGENTS
            </div>
            <div className="space-y-4">
              {[
                { icon: '📊', name: 'Market Intelligence', desc: 'Rate trends & timing' },
                { icon: '🏠', name: 'Equity Portfolio', desc: 'LTV & extraction options' },
                { icon: '⚖️', name: 'Risk Calibration', desc: 'Financial risk modeling' },
                { icon: '💡', name: 'Arbitrage Intelligence', desc: 'Rate & term optimization' },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{a.name}</div>
                    <div className="text-gray-500 text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTEL */}
          <div className="card-glass rounded-2xl p-6 border border-indigo-500/20">
            <div className="text-indigo-400 font-bold text-sm mb-4 flex items-center gap-2">
              <span>◆</span> INTEL AGENTS
            </div>
            <div className="space-y-4">
              {[
                { icon: '🧠', name: 'Behavioral Readiness', desc: 'Decision readiness signals' },
                { icon: '🎯', name: 'Intent Signal', desc: 'Goal alignment analysis' },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{a.name}</div>
                    <div className="text-gray-500 text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PSY */}
          <div className="card-glass rounded-2xl p-6 border border-green-500/20">
            <div className="text-green-400 font-bold text-sm mb-4 flex items-center gap-2">
              <span>◆</span> PSY AGENTS
            </div>
            <div className="space-y-4">
              {[
                { icon: '🔍', name: 'Cognitive Bias Neutralizer', desc: 'Decision quality assurance' },
                { icon: '🛡️', name: 'Financial Anxiety Regulation', desc: 'Confidence building' },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{a.name}</div>
                    <div className="text-gray-500 text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-20">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Most homeowners are sitting on
            <span className="text-yellow-500"> $150,000+ </span>
            in untapped equity.
          </h2>
          <p className="text-gray-500 mb-8">
            Find out what your equity can do for you. 8 agents. 4 minutes. A personalized strategy built for your specific situation.
          </p>
          <Link href="/assessment"
                className="inline-flex items-center gap-2 bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors">
            Start Free Analysis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-gray-600 text-xs">
          <div>© 2026 Huit.AI · HuitWealth Advisor</div>
          <div>NMLS #203980 · Equal Housing Lender</div>
        </div>
      </footer>
    </div>
  )
}
