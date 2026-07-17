import { SEO } from '@/shared/components/SEO'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw } from 'lucide-react'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { Property, EnquiryRecord, ClientUser } from '@/shared/types/types'
import { AdminProvider } from '@/features/admin'
import { useAdminState } from '@/features/admin'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { useConfig } from '@/shared/context/ConfigContext'

import AdminOverview from '@/features/admin/components/AdminOverview'
import AdminProperties from '@/features/admin/components/AdminProperties'
import AdminPendingApprovals from '@/features/admin/components/AdminPendingApprovals'
import AdminEnquiries from '@/features/admin/components/AdminEnquiries'
import AdminUsers from '@/features/admin/components/AdminUsers'
import AdminAnalytics from '@/features/admin/components/AdminAnalytics'
import AdminSettings from '@/features/admin/components/AdminSettings'
import AdminChecklist from '@/features/admin/components/AdminChecklist'
import { AdminChatDashboard } from '@/features/chat/AdminChatDashboard'

import {
  AddPropertyModal,
  RejectPropertyModal,
  EditPropertyModal,
  ConfirmDialog,
} from '@/features/admin/components/modals'

interface AdminViewProps {
  currentUser?: ClientUser | null
  isAdmin?: boolean
  properties: Property[]
  dbUsers: ClientUser[]
  enquiries: EnquiryRecord[]
  onToggleApproval: (id: string) => void
  onDeleteProperty: (id: string) => void
  onUpdateProperty: (updated: Property) => void
  onAddProperty: (newProp: Property) => void
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void
}

export default function AdminView(props: AdminViewProps) {
  const adminState = useAdminState(props)
  const config = useConfig()

  return (
    <>
      <SEO title={`Admin Dashboard | ${config.businessName}`} noindex={true} />
      <div className="font-sans text-on-surface bg-surface min-h-screen pt-24 pb-16 flex flex-col md:flex-row">
        <AdminProvider value={adminState}>
          <AdminSidebar />

          <div
            aria-label="Admin Dashboard Content"
            className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-2 overflow-x-hidden"
          >
            <AnimatePresence mode="wait">
              {adminState.isLoading ? (
                <motion.div
                  key="spinner_loader"
                  className="py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TableSkeleton columns={6} rows={8} />
                </motion.div>
              ) : (
                <motion.div
                  key={adminState.activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {adminState.activeTab === 'overview' && <AdminOverview />}
                  {adminState.activeTab === 'properties' && <AdminProperties />}
                  {adminState.activeTab === 'pending_approvals' && <AdminPendingApprovals />}
                  {adminState.activeTab === 'enquiries' && <AdminEnquiries />}
                  {adminState.activeTab === 'messages' && <AdminChatDashboard />}
                  {adminState.activeTab === 'users' && <AdminUsers />}
                  {adminState.activeTab === 'analytics' && <AdminAnalytics />}
                  {adminState.activeTab === 'settings' && <AdminSettings />}
                  {adminState.activeTab === 'checklist' && <AdminChecklist />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AdminProvider>

        <AddPropertyModal
          isOpen={adminState.isAddModalOpen}
          onClose={() => adminState.setIsAddModalOpen(false)}
          onSubmit={adminState.handleAddNewManualProperty}
        />
        <RejectPropertyModal
          property={adminState.rejectingProperty}
          reason={adminState.rejectReason}
          notes={adminState.rejectNotes}
          onReasonChange={adminState.setRejectReason}
          onNotesChange={adminState.setRejectNotes}
          onClose={() => adminState.setRejectingProperty(null)}
          onConfirm={adminState.handleConfirmReject}
        />
        <EditPropertyModal
          isOpen={adminState.isEditModalOpen}
          property={adminState.editingProperty}
          onClose={() => {
            adminState.setIsEditModalOpen(false)
            adminState.setEditingProperty(null)
          }}
          onSubmit={adminState.handleUpdateEditProperty}
        />
        <ConfirmDialog
          isOpen={adminState.confirmDialog.isOpen}
          title={adminState.confirmDialog.title}
          message={adminState.confirmDialog.message}
          isDanger={!!adminState.confirmDialog.isDanger}
          onConfirm={adminState.confirmDialog.onConfirm}
          onClose={() =>
            adminState.setConfirmDialog({ ...adminState.confirmDialog, isOpen: false })
          }
        />
      </div>
    </>
  )
}
