import React, { Suspense, useState, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/hooks/useToast'
import { useProperties } from '@/features/properties'
import { useFavorites } from '@/features/properties'
import { useSearchFilters } from '@/features/properties'
import { useAdminData } from '@/features/admin'
import { useMaintenanceMode } from '@/shared/hooks/useMaintenanceMode'
import Layout from '@/shared/components/common/Layout'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import LoginModal from '@/features/auth/LoginModal'
import HomeView from '@/features/home/HomeView'
import { LoadingState } from '@/shared/components/LoadingState'
import { MaintenanceState } from '@/shared/components/MaintenanceState'

const ListingsView = React.lazy(() => import('@/features/properties/ListingsView'))
const DetailView = React.lazy(() => import('@/features/properties/DetailView'))
const SavedView = React.lazy(() => import('@/features/properties/SavedView'))
const ListPropertyView = React.lazy(() => import('@/features/properties/ListPropertyView'))
const ProfileView = React.lazy(() => import('@/features/auth/ProfileView'))
const AdminView = React.lazy(() => import('@/features/admin/AdminView'))
const NotFound = React.lazy(() => import('@/shared/components/NotFound'))
const DevChecklist = import.meta.env.DEV
  ? React.lazy(() => import('@/shared/components/DevChecklist'))
  : () => null

export default function App() {
  const { currentUser, isAdmin, isAppReady } = useAuth()
  const maintenanceMode = useMaintenanceMode()
  const location = useLocation()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { toastMessage, toastType, triggerToast, closeToast } = useToast()
  const { activeSearchFilters, handleSearchTrigger } = useSearchFilters()
  const {
    properties,
    isLoadingProperties,
    userProperties,
    visibleProperties,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleAddProperty,
    handleUpdatePropertyInApp,
    handleDeletePropertyInApp,
    handleToggleApprovalInApp,
  } = useProperties(currentUser, triggerToast, activeSearchFilters)

  const { savedPropertyIds, handleToggleSaved } = useFavorites(
    currentUser,
    triggerToast,
    setIsLoginModalOpen,
  )

  const { dbUsers, dbEnquiries } = useAdminData(isAdmin)

  const selectedProperty = useMemo(() => {
    const id = location.pathname.startsWith('/property/')
      ? location.pathname.split('/property/')[1]
      : null
    return properties.find((p) => p.id === id) || null
  }, [properties, location.pathname])

  if (!isAppReady) return <LoadingState />
  if (maintenanceMode && !isAdmin) return <MaintenanceState />

  return (
    <Layout
      isAppReady={isAppReady}
      maintenanceMode={maintenanceMode}
      toastMessage={toastMessage}
      toastType={toastType}
      closeToast={closeToast}
      savedPropertyIds={savedPropertyIds}
      isAdmin={isAdmin}
      currentUser={currentUser}
      onOpenLogin={() => setIsLoginModalOpen(true)}
    >
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <HomeView
                  properties={visibleProperties}
                  isLoading={isLoadingProperties}
                  onSearch={handleSearchTrigger}
                  savedProperties={savedPropertyIds}
                  onToggleSaved={handleToggleSaved}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/properties"
            element={
              <ErrorBoundary>
                <ListingsView
                  properties={visibleProperties}
                  isLoadingData={isLoadingProperties}
                  initialFilters={activeSearchFilters}
                  savedProperties={savedPropertyIds}
                  onToggleSaved={handleToggleSaved}
                  fetchNextPage={fetchNextPage}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ErrorBoundary>
                <DetailView
                  property={selectedProperty}
                  isLoadingData={isLoadingProperties}
                  allProperties={visibleProperties}
                  savedProperties={savedPropertyIds}
                  onToggleSaved={handleToggleSaved}
                  onShowNotification={triggerToast}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/saved"
            element={
              <ErrorBoundary>
                <SavedView
                  properties={visibleProperties}
                  savedProperties={savedPropertyIds}
                  isLoadingData={isLoadingProperties}
                  onToggleSaved={handleToggleSaved}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/list-property"
            element={
              <ErrorBoundary>
                <ListPropertyView
                  onAddProperty={handleAddProperty}
                  onShowNotification={triggerToast}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <ProfileView
                  userProperties={userProperties}
                  onShowNotification={triggerToast}
                  allProperties={properties}
                  savedPropertyIds={savedPropertyIds}
                  onToggleSaved={handleToggleSaved}
                  onDeleteProperty={handleDeletePropertyInApp}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                {isAdmin ? (
                  <AdminView
                    properties={properties}
                    dbUsers={dbUsers}
                    enquiries={dbEnquiries}
                    onToggleApproval={handleToggleApprovalInApp}
                    onDeleteProperty={handleDeletePropertyInApp}
                    onUpdateProperty={handleUpdatePropertyInApp}
                    onAddProperty={handleAddProperty}
                    onShowNotification={triggerToast}
                    currentUser={currentUser as unknown}
                  />
                ) : (
                  <div className="flex-grow flex items-center justify-center p-6 text-center text-red-500 font-bold">
                    Access Denied
                  </div>
                )}
              </ErrorBoundary>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/listings" element={<Navigate to="/properties" replace />} />
          <Route path="/buy" element={<Navigate to="/properties" replace />} />
          <Route path="/rent" element={<Navigate to="/properties" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <DevChecklist />
        </React.Suspense>
      )}
    </Layout>
  )
}
