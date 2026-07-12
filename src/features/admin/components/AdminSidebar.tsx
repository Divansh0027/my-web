import React from 'react'
import {
  LayoutDashboard,
  Building,
  Mail,
  MessageCircle,
  Users,
  BarChart3,
  Settings,
  Shield,
  CheckSquare,
} from 'lucide-react'
import { AdminTab } from '@/shared/types/types'
import { useAdmin } from '@/features/admin'
import { AdminHeader } from '@/features/admin/components/AdminHeader'

export const AdminSidebar: React.FC = React.memo(() => {
  const {
    activeTab,
    setActiveTab,
    pendingApprovalsCount,
    newEnquiriesCount,
    adminsList,
    controls,
  } = useAdmin()

  return (
    <aside
      aria-label="Admin Navigation"
      className="w-full md:w-64 shrink-0 bg-surface-container border-b md:border-b-0 md:border-r border-outline-variant/50 p-5 flex flex-col md:sticky md:top-24 md:h-[calc(100vh-140px)]"
    >
      <AdminHeader />

      <nav
        aria-label="Admin sidebar menu"
        className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none"
      >
        {[
          { id: 'overview', label: 'Dashboard', Icon: LayoutDashboard },
          { id: 'properties', label: 'Properties', Icon: Building },
          {
            id: 'pending_approvals',
            label: 'Pending Approvals',
            Icon: Shield,
            badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          },
          { id: 'enquiries', label: 'Enquiries', Icon: Mail, badge: newEnquiriesCount },
          { id: 'messages', label: 'Messages', Icon: MessageCircle },
          { id: 'users', label: 'Users', Icon: Users },
          { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
          { id: 'settings', label: 'Settings', Icon: Settings },
          { id: 'checklist', label: 'Readiness Audit', Icon: CheckSquare },
        ].map((tab) => {
          const isSelected = activeTab === tab.id
          const TabIcon = tab.Icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gold-accent/10 text-gold-accent border border-gold-accent/20 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent'
              }`}
            >
              <TabIcon
                className={`h-4 w-4 ${isSelected ? 'text-gold-accent' : 'text-on-surface-variant'}`}
              />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-on-surface font-bold text-[9px] min-w-4 text-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="hidden md:block mt-auto bg-surface/50 rounded-xl p-3.5 border border-outline-variant/50">
        <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wide">
          <span>Container Status</span>
          <span className="h-2 w-2 rounded-full bg-gold-accent animate-pulse"></span>
        </div>
        <p className="text-[10px] text-on-surface-variant font-mono leading-relaxed">
          API Sync: Active
          <br />
          SimLoader: {controls.slowOperations ? '1000ms' : '0ms'}
          <br />
          Admins: {adminsList.length} Accounts
        </p>
      </div>
    </aside>
  )
})
