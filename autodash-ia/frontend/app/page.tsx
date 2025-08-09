"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <main className="flex items-center justify-center py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center p-10 rounded-3xl bg-white/10 border border-white/10 shadow-xl"
      >
        <h1 className="text-4xl font-bold mb-4">AutoDash.ia</h1>
        <p className="text-white/80 mb-8">Faça upload de dados e gere dashboards automaticamente com IA.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-600 transition">Entrar</Link>
          <Link href="/upload" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition">Começar agora</Link>
        </div>
      </motion.div>
    </main>
  )
}