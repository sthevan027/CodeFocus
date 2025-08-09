import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AutoDash.ia',
  description: 'Dashboards automáticos com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="min-h-screen bg-black/20 backdrop-blur-md">
          {children}
        </div>
      </body>
    </html>
  )
}