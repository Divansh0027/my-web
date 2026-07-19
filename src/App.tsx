import React, { Suspense, useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useToast } from '@/shared/hooks/useToast'
import { useProperties } from '@/features/properties'
import { useFavorites } from '@/features/properties'
import { useSearchFilters } from '@/features/properties'
import { useAdminData } from '@/features/admin'
import { useMaintenanceMode } from '@/shared/hooks/useMaintenanceMode'
import { onMessageListener } from '@/firebase'
import Layout from '@/shared/components/common/Layout'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import LoginModal from '@/features/auth/LoginModal'
import HomeView from '@/features/home/HomeView'
import { LoadingState } from '@/shared/components/LoadingState'
import { MaintenanceState } from '@/shared/components/MaintenanceState'
import NotFound from '@/shared/components/NotFound'
import StatusPage from '@/features/status/StatusPage'

const ListingsView = React.lazy(() => import('@/features/properties/ListingsView'))
const DetailView = React.lazy(() => import('@/features/properties/DetailView'))
const SavedView = React.lazy(() => import('@/features/properties/SavedView'))
const ListPropertyView = React.lazy(() => import('@/features/properties/ListPropertyView'))
const ProfileView = React.lazy(() => import('@/features/auth/ProfileView'))
const AdminView = React.lazy(() => import('@/features/admin/AdminView'))
const AdvancedSearchView = React.lazy(() => import('@/features/properties/SearchView'))
const DevChecklist = import.meta.env.DEV
  ? React.lazy(() => import('@/shared/components/DevChecklist'))
  : () => null

function App() {
  const navigate = useNavigate()
  const { currentUser, isAdmin, isAppReady } = useAuth()
  const maintenanceMode = useMaintenanceMode()
  const location = useLocation()

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { toastMessage, toastType, triggerToast, closeToast } = useToast()

  // Handle deep linking from protocol handler (web+shivsaya://)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlParam = searchParams.get('url')
    if (urlParam) {
      try {
        // e.g. web+shivsaya://property/123
        const decoded = decodeURIComponent(urlParam)
        if (decoded.startsWith('web+shivsaya://')) {
          const path = decoded.replace('web+shivsaya://', '/')
          navigate(path, { replace: true })
        }
      } catch (e) {
        console.error('Failed to parse deep link', e)
      }
    }
  }, [location.search, navigate])

  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      console.log('Foreground Push Notification received.', payload)
      if (payload.notification) {
        triggerToast(
          `${payload.notification.title || 'New Notification'}: ${payload.notification.body || 'You have a new message'}`,
          'success'
        )
      }
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [triggerToast])

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
                    currentUser={currentUser}
                  />
                ) : (
                  <div className="flex-grow flex items-center justify-center p-6 text-center text-red-700 dark:text-red-500 font-bold">
                    Access Denied
                  </div>
                )}
              </ErrorBoundary>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/status"
            element={
              <ErrorBoundary>
                <StatusPage />
              </ErrorBoundary>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/listings" element={<Navigate to="/properties" replace />} />
          <Route path="/buy" element={<Navigate to="/properties" replace />} />
          <Route path="/rent" element={<Navigate to="/properties" replace />} />
          <Route
            path="/advanced-search"
            element={
              <ErrorBoundary>
                <AdvancedSearchView />
              </ErrorBoundary>
            }
          />
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
export default App
