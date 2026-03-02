import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HuitWealth Advisor | AI-Powered Mortgage Intelligence',
  description: 'Eight specialized AI agents working in concert to analyze your mortgage equity opportunity and financial readiness.',
  openGraph: {
    title: 'HuitWealth Advisor',
    description: 'AI-powered mortgage wealth intelligence by Huit.AI',
    siteName: 'HuitWealth',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-navy min-h-screen antialiased">{children}</body>
    </html>
  )
}
