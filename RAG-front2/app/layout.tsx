import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAG System Dashboard',
  description: 'Retrieval-Augmented Generation System Interface',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text`}>
        <div className="min-h-screen">
          <nav className="glass-card fixed top-4 left-4 right-4 z-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cta rounded-lg flex items-center justify-center">
                  <span className="font-fira-code font-bold text-background">R</span>
                </div>
                <h1 className="font-fira-code text-xl font-bold">RAG System</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text/70">API: http://localhost:8000</span>
                <div className="w-3 h-3 bg-cta rounded-full animate-pulse"></div>
              </div>
            </div>
          </nav>
          <main className="pt-24 px-4 pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}