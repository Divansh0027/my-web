import React from 'react'
import { Shield } from 'lucide-react'

export const AdminHeader: React.FC = React.memo(() => {
  return (
    <div className="flex items-center gap-2 mb-8 px-2">
      <Shield className="h-6 w-6 text-gold-accent" />
      <div>
        <h2 className="font-bold text-on-surface text-base">Control Hub</h2>
        <p className="text-[10px] text-on-surface-variant font-medium tracking-wide">
          SHIV SAYA ADVISORY
        </p>
      </div>
    </div>
  )
})
