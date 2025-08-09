import { ReactNode } from 'react'

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass rounded-2xl p-6 w-full max-w-lg">
        <button className="absolute top-4 right-4" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}