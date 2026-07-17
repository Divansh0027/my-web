import React from 'react'
import { ShieldAlert } from 'lucide-react'

export function DetailAssuranceBadge() {
  return (
    <div className="p-5.5 bg-gold-accent/5 border border-gold-accent/15 rounded-2xl flex gap-3.5">
      <ShieldAlert className="h-6 w-6 text-gold-accent shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-on-surface text-xs">Buyer Advisory Protection</h3>
        <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
          Every property on Shiv Saya undergoes multi-stage title searches, outstanding debt checks,
          and RERA approval audits before active publishing.
        </p>
      </div>
    </div>
  )
}
