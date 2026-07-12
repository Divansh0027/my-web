import { useState, useMemo } from 'react'
import { Property, EnquiryRecord, AdminTab, AdminSettings, ClientUser } from '@/shared/types/types'
import { useConfig } from '@/shared/context/ConfigContext'
import {
  addRemoteAdmin,
  removeRemoteAdmin,
  updateRemoteControls,
  updateRemoteSettings,
  updateEnquiryStatusInDb,
  deleteEnquiryFromDb,
  toggleUserBan,
  dbInstance,
} from '@/firebase'
import { formatCurrency } from '@/features/admin/components/utils'

export interface AdminStateProps {
  currentUser?: ClientUser | null
  properties: Property[]
  dbUsers: ClientUser[]
  enquiries: EnquiryRecord[]
  onToggleApproval: (id: string) => void
  onDeleteProperty: (id: string) => void
  onUpdateProperty: (updated: Property) => void
  onAddProperty: (newProp: Property) => void
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void
}

export function useAdminState({
  properties,
  dbUsers,
  enquiries,
  onToggleApproval,
  onDeleteProperty,
  onUpdateProperty,
  onAddProperty,
  onShowNotification,
  currentUser,
}: AdminStateProps) {
  const BUSINESS_CONFIG = useConfig()

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  // Config/Settings state
  const [settings, setSettings] = useState<AdminSettings>({
    businessName: BUSINESS_CONFIG.businessName,
    whatsappNumber: BUSINESS_CONFIG.whatsappNumber,
    businessEmail: BUSINESS_CONFIG.businessEmail,
    reraNumber: BUSINESS_CONFIG.reraNumber,
    businessAddress: BUSINESS_CONFIG.businessAddress,
    consultantName: BUSINESS_CONFIG.consultantName,
    businessPhone: BUSINESS_CONFIG.businessPhone,
  })

  // Toggles state
  const [controls, setControls] = useState({
    offlineMaintenance: false,
    slowOperations: false,
    showWhatsappFloating: true,
    autoApproveListings: false,
  })

  // Admin emails state
  const [adminsList, setAdminsList] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')

  // filter, sorting, and modal states
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>('All')
  const [propertySort, setPropertySort] = useState<string>('default')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  // Add/Edit Property modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  // Reject Property modals
  const [rejectingProperty, setRejectingProperty] = useState<Property | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('Incomplete information')
  const [rejectNotes, setRejectNotes] = useState<string>('')

  // Enquiry states
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquiryFilter, setEnquiryFilter] = useState<string>('All')

  // User states
  const [userSearch, setUserSearch] = useState('')

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    isDanger?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Loading spinner simulation
  const [isLoading, setIsLoading] = useState(false)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [auditPassed, setAuditPassed] = useState<boolean | null>(null)

  // Execute a delayed operation if simulated slow mode is on
  const executeOperation = (callback: () => void, successMsg?: string) => {
    if (controls.slowOperations) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        callback()
        if (successMsg) {
          onShowNotification(successMsg, 'success')
        }
      }, 1000)
    } else {
      callback()
      if (successMsg) {
        onShowNotification(successMsg, 'success')
      }
    }
  }

  // ----------------------------------------------------
  // ENQUIRY ACTIONS
  // ----------------------------------------------------
  const handleUpdateEnquiryStatus = async (
    id: string,
    newStatus: 'New' | 'Contacted' | 'Resolved',
  ) => {
    try {
      await updateEnquiryStatusInDb(id, newStatus)
      onShowNotification(`Enquiry status changed to ${newStatus}`, 'success')
    } catch (_err: unknown) {
      onShowNotification('Failed to update enquiry status', 'error')
    }
  }

  const handleDeleteEnquiry = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Enquiry Record',
      message:
        'Are you sure you want to permanently erase this client enquiry? This action cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteEnquiryFromDb(id)
          onShowNotification('Enquiry record successfully deleted', 'success')
        } catch (_err: unknown) {
          onShowNotification('Failed to delete enquiry', 'error')
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleConfirmReject = () => {
    if (!rejectingProperty) return
    const finalReason = rejectReason + (rejectNotes ? `: ${rejectNotes}` : '')
    const updated = {
      ...rejectingProperty,
      moderationStatus: 'rejected' as const,
      rejectionReason: finalReason,
    }
    executeOperation(() => {
      onUpdateProperty(updated)
      setRejectingProperty(null)
      setRejectReason('Incomplete information')
      setRejectNotes('')
    }, 'Property rejected.')
  }

  const handleExportPropertiesJSON = () => {
    try {
      const dataStr = JSON.stringify(properties, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `ssp-properties-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      onShowNotification('Properties exported as JSON successfully!', 'success')
    } catch (e) {
      console.error('Properties export failure', e)
      onShowNotification('Failed to export properties.', 'info')
    }
  }

  const handleClearTestData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Test Data',
      message:
        'This will remove all simulated test users and enquiries. Real Firebase data is unaffected. Proceed?',
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          // simulated data removed
        }, 'Test data cleared successfully.')
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ----------------------------------------------------
  // USER / BAN ACTIONS
  // ----------------------------------------------------
  const handleToggleBanUser = async (uid: string, currentBanState: boolean) => {
    const userObj = dbUsers.find((u: unknown) => u.uid === uid)
    if (!userObj) return

    setConfirmDialog({
      isOpen: true,
      title: `${currentBanState ? 'Lift Suspension' : 'Suspend User Account'}`,
      message: currentBanState
        ? `Are you sure you want to restore access for ${userObj.displayName}? Their direct listings will remain hidden until manually approved.`
        : `Are you sure you want to suspend ${userObj.displayName}? This will lock them out of the platform and automatically hide ALL their properties immediately list-wide.`,
      isDanger: !currentBanState,
      onConfirm: async () => {
        executeOperation(async () => {
          if (dbInstance) {
            try {
              await toggleUserBan(uid, currentBanState)

              // We let Firestore listener handle the user update

              // Firestore listener handles property updates via batch commit in toggleUserBan
              onShowNotification(`User account suspension state toggled.`, 'success')
            } catch (err: unknown) {
              onShowNotification(`Database write failed: ${(err as unknown).message}`, 'error')
            }
          }
        })
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ----------------------------------------------------
  // SETTINGS ACTIONS
  // ----------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    executeOperation(async () => {
      await updateRemoteSettings(settings)
      onShowNotification('Core settings updated successfully!', 'success')
    })
  }

  const handleToggleControl = async (controlKey: keyof typeof controls) => {
    const newCont = {
      ...controls,
      [controlKey]: !controls[controlKey],
    }
    setControls(newCont)
    await updateRemoteControls(newCont)
    onShowNotification(`${String(controlKey).replace(/([A-Z])/g, ' $1')} updated!`, 'success')
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = newAdminEmail.trim().toLowerCase()
    if (!cleanEmail) return

    if (adminsList.map((a: string) => a.toLowerCase()).includes(cleanEmail)) {
      onShowNotification('Admin email already exists in system listings!', 'info')
      return
    }

    executeOperation(async () => {
      const success = await addRemoteAdmin(cleanEmail)
      if (success) {
        const newList = [...adminsList, cleanEmail]
        setAdminsList(newList)
        setNewAdminEmail('')
        onShowNotification('Admin access granted! Access activates on first login.', 'success')
      } else {
        onShowNotification('Failed to add admin.', 'info')
      }
    }, 'Administrator processing...')
  }

  const handleRemoveAdmin = (emailToRemove: string) => {
    if (currentUser?.email?.toLowerCase() === emailToRemove.toLowerCase()) {
      onShowNotification('You cannot remove your own admin rights here.', 'info')
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Remove Admin Rights',
      message: `Are you sure you want to strip admin privileges from ${emailToRemove}? They will be demoted to standard user state instantly.`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(async () => {
          const newList = adminsList.filter(
            (e: unknown) => e.toLowerCase() !== emailToRemove.toLowerCase(),
          )
          setAdminsList(newList)
          await removeRemoteAdmin(emailToRemove)
        }, 'Administrator access revoked successfully')
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleFactoryReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: '🚨 SYSTEM COLD HARDFIX RESTORATION',
      message:
        'WARNING: This compiles a clean full purge wipe on simulated records. Removes all manual properties, local custom enquiries, suspension overrides, and resets business config defaults. DO YOU AUTHORIZE THIS TOTAL PURGE?',
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          localStorage.removeItem('ssp_settings')
          localStorage.removeItem('ssp_controls')
          localStorage.removeItem('ssp_admin_emails')
          localStorage.removeItem('ssp_properties') // If custom property addition used it
          onShowNotification('System storage cold purged. Reloading container...', 'success')
          setTimeout(() => {
            window.location.reload()
          }, 1200)
        })
      },
    })
  }

  // ----------------------------------------------------
  // PROPERTY DISMISS / APPROVAL CONSTRAINTS
  // ----------------------------------------------------
  const handlePropertyApprovalToggle = (id: string, currentStatus: string | undefined) => {
    if (currentStatus === 'pending') {
      setConfirmDialog({
        isOpen: true,
        title: 'Approve Property',
        message:
          'Are you sure you want to approve this property? It will be visible to the public.',
        onConfirm: () => {
          setConfirmDialog((prev: unknown) => ({ ...prev, isOpen: false }))
          executeOperation(() => {
            onToggleApproval(id)
          }, `Listing approved and published successfully`)
        },
      })
    } else if (currentStatus === 'live') {
      setConfirmDialog({
        isOpen: true,
        title: 'Revoke Approval',
        message:
          'Are you sure you want to revoke approval? This will hide the property from the public.',
        isDanger: true,
        onConfirm: () => {
          setConfirmDialog((prev: unknown) => ({ ...prev, isOpen: false }))
          executeOperation(() => {
            onToggleApproval(id)
          }, `Listing approval revoked`)
        },
      })
    } else {
      executeOperation(() => {
        onToggleApproval(id)
      }, `Listing status toggled for property successfully`)
    }
  }

  const handlePropertyHideToggle = (prop: Property) => {
    if (prop.moderationStatus === 'rejected') {
      setConfirmDialog({
        isOpen: true,
        title: 'Restore Property',
        message: 'Are you sure you want to restore this rejected property back to pending?',
        onConfirm: () => {
          setConfirmDialog((prev: unknown) => ({ ...prev, isOpen: false }))
          executeOperation(() => {
            onUpdateProperty({
              ...prop,
              moderationStatus: 'pending',
            })
          }, 'Listing is now pending review')
        },
      })
    } else {
      setRejectingProperty(prop)
      setRejectReason('Incomplete information')
      setRejectNotes('')
    }
  }

  const handlePropertyDelete = (id: string) => {
    const matchedProp = properties.find((p: unknown) => p.id === id)
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Real Estate Listing',
      message: `Are you absolutely sure you want to permanently delete "${matchedProp?.title || 'this property'}"? This clears all customer linkages and details.`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          onDeleteProperty(id)
          setSelectedProperties((prev) => prev.filter((pId) => pId !== id))
        }, 'Property listing permanently erased from core')
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ----------------------------------------------------
  // BULK MANIPULATIONS ON TABLE

  const handleBulkApprove = () => {
    if (selectedProperties.length === 0) return
    setConfirmDialog({
      isOpen: true,
      title: `Bulk Approve ${selectedProperties.length} Listings`,
      message: `You are about to approve ${selectedProperties.length} selected listings. They will become immediately visible to the public. Proceed?`,
      isDanger: false,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach((id: string) => {
            const found = properties.find((p: unknown) => p.id === id)
            if (found && found.moderationStatus !== 'live') {
              onToggleApproval(id)
            }
          })
          setSelectedProperties([])
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }, `Bulk approved ${selectedProperties.length} listings successfully`)
      },
    })
  }

  const handleBulkHide = () => {
    if (selectedProperties.length === 0) return
    setConfirmDialog({
      isOpen: true,
      title: `Bulk Reject ${selectedProperties.length} Listings`,
      message: `You are about to reject/hide ${selectedProperties.length} selected listings. They will no longer be visible to the public. Proceed?`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach((id: string) => {
            const found = properties.find((p: unknown) => p.id === id)
            if (found && found.moderationStatus !== 'rejected') {
              onUpdateProperty({ ...found, moderationStatus: 'rejected' })
            }
          })
          setSelectedProperties([])
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }, `Successfully rejected ${selectedProperties.length} selected listings`)
      },
    })
  }

  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Erase ${selectedProperties.length} Listings`,
      message: `WARNING: You are compiling a batch delete query on ${selectedProperties.length} properties. This clears them permanently from server index. Proceed?`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach((id: string) => {
            onDeleteProperty(id)
          })
          setSelectedProperties([])
        }, `Batch purge complete for ${selectedProperties.length} items`)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // ----------------------------------------------------
  // ADD & EDIT PROPERTY ACTIONS
  // ----------------------------------------------------
  const handleAddNewManualProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const title = sanitizeText((data.get('title') as string) || '')
    const price = Number(data.get('price'))
    const location = sanitizeText((data.get('location') as string) || '')
    const type = sanitizeText((data.get('type') as string) || '')
    const bhkStr = sanitizeText((data.get('bhk') as string) || '')
    const description = sanitizeText((data.get('description') as string) || '')
    const area = Number(data.get('area'))
    const areaUnit = sanitizeText((data.get('areaUnit') as string) || '')
    const transactionType = sanitizeText((data.get('transactionType') as string) || '') as
      'Buy' | 'Rent'
    const imageUrl =
      (data.get('imageUrl') as string) ||
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'

    if (!title || !price || !location) {
      onShowNotification('Required fields cannot be left empty!', 'info')
      return
    }
    if (!isPositiveNumber(price) || price > 1000000000) {
      onShowNotification('Invalid property price', 'error')
      return
    }
    if (!isPositiveNumber(area)) {
      onShowNotification('Invalid property area', 'error')
      return
    }
    if (!maxLength(title, 200) || !maxLength(description, 5000)) {
      onShowNotification('Title or description is too long', 'error')
      return
    }

    const newProp: Property = {
      id: `manual-p-${Date.now()}`,
      title,
      description,
      price,
      locality: location,
      city: 'Noida',
      category:
        type === 'Commercial'
          ? 'Commercial'
          : type === 'Plot'
            ? 'Plots'
            : transactionType === 'Rent'
              ? 'Rent'
              : 'Buy',
      featured: false,
      newLaunch: true,
      verified: true,
      postedDate: new Date().toISOString().split('T')[0],
      location,
      bhk: bhkStr ? Number(bhkStr) : null,
      type,
      area,
      areaUnit: areaUnit || 'Sq.Ft.',
      bathrooms: Number(data.get('bathrooms')) || 2,
      floor: Number(data.get('floor')) || 0,
      totalFloors: Number(data.get('totalFloors')) || 4,
      possession: sanitizeText((data.get('possession') as string) || '') || 'Ready to Move',
      postedBy: 'Agent',
      customPostedBy: settings.businessEmail,
      postedByUid: 'admin-system',
      createdAt: new Date().toISOString(),
      moderationStatus: controls.autoApproveListings ? 'live' : 'pending',
      images: [imageUrl],
      amenities: ['Water Storage', 'Security Ward', 'Spacious Balcony'],
      isPremium: data.get('isPremium') === 'true',
      reraApproved: data.get('reraApproved') === 'true',
    }

    executeOperation(() => {
      onAddProperty(newProp)
      setIsAddModalOpen(false)
    }, `New direct listing added! status: ${newProp.moderationStatus}`)
  }

  const handleUpdateEditProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingProperty) return

    const data = new FormData(e.currentTarget)
    const title = sanitizeText((data.get('title') as string) || '')
    const price = Number(data.get('price'))
    const location = sanitizeText((data.get('location') as string) || '')
    const type = sanitizeText((data.get('type') as string) || '')
    const bhkStr = sanitizeText((data.get('bhk') as string) || '')
    const description = sanitizeText((data.get('description') as string) || '')
    const area = Number(data.get('area'))
    const areaUnit = sanitizeText((data.get('areaUnit') as string) || '')
    const imageUrl = data.get('imageUrl') as string

    if (!isPositiveNumber(price) || price > 1000000000) {
      onShowNotification('Invalid property price', 'error')
      return
    }
    if (!isPositiveNumber(area)) {
      onShowNotification('Invalid property area', 'error')
      return
    }
    if (!maxLength(title, 200) || !maxLength(description, 5000)) {
      onShowNotification('Title or description is too long', 'error')
      return
    }

    const updated: Property = {
      ...editingProperty,
      title,
      description,
      price,
      location,
      bhk: bhkStr ? Number(bhkStr) : null,
      type,
      area,
      areaUnit,
      bathrooms: Number(data.get('bathrooms')) || editingProperty.bathrooms || 0,
      floor: Number(data.get('floor')) || editingProperty.floor || 0,
      totalFloors: Number(data.get('totalFloors')) || editingProperty.totalFloors || 0,
      possession:
        sanitizeText((data.get('possession') as string) || '') ||
        editingProperty.possession ||
        'Ready to Move',
      images: imageUrl ? [imageUrl] : editingProperty.images,
      isPremium: data.get('isPremium') === 'true',
      reraApproved: data.get('reraApproved') === 'true',
    }

    executeOperation(() => {
      onUpdateProperty(updated)
      setIsEditModalOpen(false)
      setEditingProperty(null)
    }, 'Property details modified successfully')
  }

  // ----------------------------------------------------
  // COMPUTED METRICS AND FILTERS
  // ----------------------------------------------------
  // 1. Properties filters
  const filteredProperties = useMemo(
    () =>
      properties.filter((p: unknown) => {
        const matchesSearch =
          p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
          p.location.toLowerCase().includes(propertySearch.toLowerCase())

        if (propertyStatusFilter !== 'All') {
          let targetStatus = propertyStatusFilter.toLowerCase()
          if (targetStatus === 'featured') {
            return matchesSearch && p.featured === true
          }
          if (targetStatus === 'approved') {
            targetStatus = 'live'
          } else if (targetStatus === 'hidden') {
            targetStatus = 'rejected'
          }
          return matchesSearch && p.moderationStatus === targetStatus
        }
        return matchesSearch
      }),
    [properties, propertySearch, propertyStatusFilter],
  )

  const sortedListings = useMemo(
    () =>
      [...filteredProperties].sort((a, b) => {
        if (propertySort === 'price-asc') return a.price - b.price
        if (propertySort === 'price-desc') return b.price - a.price
        if (propertySort === 'newest')
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        return 0 // Default
      }),
    [filteredProperties, propertySort],
  )

  // 2. Enquiries filters
  const filteredEnquiries = useMemo(
    () =>
      enquiries.filter((e: unknown) => {
        const matchesSearch =
          e.name.toLowerCase().includes(enquirySearch.toLowerCase()) ||
          e.email.toLowerCase().includes(enquirySearch.toLowerCase()) ||
          e.propertyName.toLowerCase().includes(enquirySearch.toLowerCase())
        if (enquiryFilter !== 'All') {
          return matchesSearch && e.status === enquiryFilter
        }
        return matchesSearch
      }),
    [enquiries, enquirySearch, enquiryFilter],
  )

  // 3. User filters
  const filteredUsers = useMemo(
    () =>
      dbUsers.filter((u: unknown) => {
        return (
          u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase())
        )
      }),
    [dbUsers, userSearch],
  )

  // 4. Stat counting variables
  const pendingProperties = useMemo(
    () => properties.filter((p: unknown) => p.moderationStatus === 'pending'),
    [properties],
  )
  const approvedListingsCount = useMemo(
    () => properties.filter((p: unknown) => p.moderationStatus === 'live').length,
    [properties],
  )
  const pendingApprovalsCount = pendingProperties.length

  // FLAT RATE of 1% commission on all approved "Buy" (sale) properties for "Estimated Revenue"
  const totalApprovedSalesValue = useMemo(
    () =>
      properties
        .filter(
          (p: unknown) =>
            p.moderationStatus === 'live' && (!p.transactionType || p.transactionType === 'Buy'),
        )
        .reduce((sum, p) => sum + p.price, 0),
    [properties],
  )
  const estimatedRevenue = Math.round(totalApprovedSalesValue * 0.01)

  // Derived metrics for analytics tab
  const threeBhkCount = useMemo(
    () =>
      properties.filter(
        (p: unknown) => String(p.bhk || '').includes('3 BHK') || String(p.bhk || '').includes('3'),
      ).length,
    [properties],
  )
  const villaCount = useMemo(
    () =>
      properties.filter((p: unknown) =>
        String(p.type || '')
          .toLowerCase()
          .includes('villa'),
      ).length,
    [properties],
  )
  const commercialCount = useMemo(
    () =>
      properties.filter(
        (p: unknown) =>
          String(p.type || '')
            .toLowerCase()
            .includes('plot') ||
          String(p.type || '')
            .toLowerCase()
            .includes('office') ||
          String(p.type || '')
            .toLowerCase()
            .includes('commercial'),
      ).length,
    [properties],
  )
  const standardFlatsCount = useMemo(
    () =>
      properties.filter(
        (p: unknown) =>
          String(p.bhk || '').includes('1 BHK') ||
          String(p.bhk || '').includes('2 BHK') ||
          String(p.bhk || '').includes('1') ||
          String(p.bhk || '').includes('2'),
      ).length,
    [properties],
  )
  const newEnquiriesCount = useMemo(
    () => enquiries.filter((e: unknown) => e.status === 'New').length,
    [enquiries],
  )
  const contactedEnquiriesCount = useMemo(
    () => enquiries.filter((e: unknown) => e.status === 'Contacted').length,
    [enquiries],
  )
  const resolvedEnquiriesCount = useMemo(
    () => enquiries.filter((e: unknown) => e.status === 'Resolved').length,
    [enquiries],
  )

  const adminTabProps = {
    setActiveTab,
    handlePropertyApprovalToggle,
    handlePropertyHideToggle,
    handlePropertyDelete,

    formatCurrency,
    estimatedRevenue,
    propertySearch,
    setPropertySearch,
    propertyStatusFilter,
    setPropertyStatusFilter,
    propertySort,
    setPropertySort,
    filteredProperties: sortedListings,
    selectedProperties,
    handleSelectAllProperties,
    handleExportCSV: () => {},
    handleExportPropertiesJSON,
    handleFactoryReset,
    handleBulkApprove,
    handleBulkHide,
    handleBulkDelete,
    enquiries: filteredEnquiries,
    enquirySearch,
    setEnquirySearch,
    enquiryFilter,
    setEnquiryFilter,
    handleUpdateEnquiryStatus,
    handleDeleteEnquiry,
    users: filteredUsers,
    userSearch,
    setUserSearch,
    handleToggleBanUser,
    settings,
    setSettings,
    handleSaveSettings,
    controls,
    handleToggleControl,
    adminsList,
    newAdminEmail,
    setNewAdminEmail,
    handleAddAdmin,
    handleRemoveAdmin,
    handleClearTestData,
    approvedListingsCount,
    threeBhkCount,
    standardFlatsCount,
    villaCount,
    commercialCount,
    pendingApprovalsCount,
    newEnquiriesCount,
    contactedEnquiriesCount,
    resolvedEnquiriesCount,
    activeTab,
    isLoading,
    auditPassed,
    setAuditPassed,
    isRunningDiagnostics,
    setIsRunningDiagnostics,
  }

  return {
    ...adminTabProps,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingProperty,
    setEditingProperty,
    rejectingProperty,
    setRejectingProperty,
    rejectReason,
    setRejectReason,
    rejectNotes,
    setRejectNotes,
    confirmDialog,
    setConfirmDialog,
    handleAddNewManualProperty,
    handleUpdateEditProperty,
    handleConfirmReject,
    isLoading,
    activeTab,
  }
}
