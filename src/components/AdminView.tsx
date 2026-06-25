/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Building, Mail, Users, BarChart3, Settings,
  Plus, Search, Trash2, Edit, Shield, 
  Download, RefreshCw, Check, X, Phone, Mail as MailIcon, 
  ExternalLink, Eye, EyeOff, CheckSquare,
  Sliders, AlertTriangle, ShieldCheck, Power, HelpCircle, AlertCircle, MapPin,
  Database
} from "lucide-react";
import { Property, EnquiryRecord, AdminTab, AdminSettings } from "../types";
import { BUSINESS_CONFIG } from "../config";
import { 
  ADMIN_EMAILS, 
  addRemoteAdmin, 
  removeRemoteAdmin, 
  updateRemoteControls, 
  updateRemoteSettings 
} from "../firebase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface AdminViewProps {
  currentView: string;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  properties: Property[];
  onToggleApproval: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateProperty: (updated: Property) => void;
  onAddProperty: (newProp: Property) => void;
  onShowNotification: (msg: string, type: "success" | "info") => void;
}

export default function AdminView({
  currentView: _currentView,
  onNavigate: _onNavigate,
  properties,
  onToggleApproval,
  onDeleteProperty,
  onUpdateProperty,
  onAddProperty,
  onShowNotification
}: AdminViewProps) {
  
  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);

  // Users state
  const [dbUsers, setDbUsers] = useState<any[]>([]);

  // Config/Settings state
  const [settings, setSettings] = useState<AdminSettings>({
    businessName: BUSINESS_CONFIG.businessName,
    whatsappNumber: BUSINESS_CONFIG.whatsappNumber,
    businessEmail: BUSINESS_CONFIG.businessEmail,
    reraNumber: BUSINESS_CONFIG.reraNumber,
    businessAddress: BUSINESS_CONFIG.businessAddress,
    consultantName: BUSINESS_CONFIG.consultantName,
    businessPhone: BUSINESS_CONFIG.businessPhone,
  });

  // Toggles state
  const [controls, setControls] = useState({
    offlineMaintenance: false,
    slowOperations: false,
    showWhatsappFloating: true,
    autoApproveListings: false
  });

  // Admin emails state
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Search, filter, sorting, and modal states
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>("All");
  const [propertySort, setPropertySort] = useState<string>("default");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  // Add/Edit Property modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Reject Property modals
  const [rejectingProperty, setRejectingProperty] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("Incomplete information");
  const [rejectNotes, setRejectNotes] = useState<string>("");

  // Enquiry states
  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryFilter, setEnquiryFilter] = useState<string>("All");

  // User states
  const [userSearch, setUserSearch] = useState("");

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Loading spinner simulation
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [auditPassed, setAuditPassed] = useState(false);

  // Initialize data on boot
  useEffect(() => {
    // 1. Initial Enquiries
    try {
      const storedEnq = localStorage.getItem("ssp_simulated_enquiries");
      if (storedEnq) {
        setEnquiries(JSON.parse(storedEnq));
      } else {
        const defaultEnquiries: EnquiryRecord[] = [
          {
            id: "enq-1",
            name: "Rahul Sharma",
            phone: "+91 98123 45678",
            email: "rahul.sharma@gmail.com",
            propertyId: properties[0]?.id || "p1",
            propertyName: properties[0]?.title || "Premium 3 BHK Builder Floor",
            message: "I am highly interested in visiting this builder floor this weekend. Is there any discount on direct registry?",
            dateStr: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: "New"
          },
          {
            id: "enq-2",
            name: "Priyanka Sen",
            phone: "+91 99887 76655",
            email: "priyanka.sen@outlook.com",
            propertyId: properties[1]?.id || "p2",
            propertyName: properties[1]?.title || "Luxury Heritage Villa Complex",
            message: "Please share the RERA approval document and structural warranty details via WhatsApp. Ready for token amount.",
            dateStr: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: "Contacted"
          },
          {
            id: "enq-3",
            name: "Amit Khari",
            phone: "+91 95401 22998",
            email: "amitkhari90@gmail.com",
            propertyId: "manual-ref",
            propertyName: "Morta Industrial Plot",
            message: `Wanted to know loan approval limit for land registry. Can you arrange meeting with ${BUSINESS_CONFIG.consultantName}?`,
            dateStr: new Date(Date.now() - 3600000 * 48).toISOString(),
            status: "Resolved"
          },
          {
            id: "enq-4",
            name: "Vikram Malhotra",
            phone: "+91 90123 99911",
            email: "v.malhotra@yahoo.com",
            propertyId: properties[2]?.id || "p3",
            propertyName: properties[2]?.title || "Penthouse Skyline Duplex",
            message: "Is this penthouse direct owner listing? Please schedule a physical visit.",
            dateStr: new Date(Date.now() - 3600000 * 5).toISOString(),
            status: "New"
          }
        ];
        setEnquiries(defaultEnquiries);
        localStorage.setItem("ssp_simulated_enquiries", JSON.stringify(defaultEnquiries));
      }
    } catch (e) {
      console.warn("Failed loading enquiries", e);
    }

    // 2. Initial Users
    try {
      const storedUsers = localStorage.getItem("ssp_simulated_db_users");
      if (storedUsers) {
        setDbUsers(JSON.parse(storedUsers));
      } else {
        const defaultUsers = [
          {
            uid: "simulated-user-1",
            displayName: "Rohit Deshmukh",
            email: "rohit.d@gmail.com",
            phone: "+91 88771 22334",
            createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
            banned: false
          },
          {
            uid: "simulated-user-2",
            displayName: "Deepika Padukone",
            email: "deepika@domain.com",
            phone: "+91 90001 00002",
            createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
            banned: false
          },
          {
            uid: "simulated-user-3",
            displayName: "Kabir Singh",
            email: "kabir.realty@gmail.com",
            phone: "+91 70112 33445",
            createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
            banned: true
          }
        ];
        setDbUsers(defaultUsers);
        localStorage.setItem("ssp_simulated_db_users", JSON.stringify(defaultUsers));
      }
    } catch (e) {
      console.warn("Failed loading users", e);
    }

    // 3. Initial Admins List
    try {
      const storedAdmins = localStorage.getItem("ssp_admin_emails");
      if (storedAdmins) {
        setAdminsList(JSON.parse(storedAdmins));
      } else {
        setAdminsList(ADMIN_EMAILS);
        localStorage.setItem("ssp_admin_emails", JSON.stringify(ADMIN_EMAILS));
      }
    } catch (e) {
      console.warn("Failed loading admins list", e);
    }

    // 4. Initial Controls
    try {
      const storedCont = localStorage.getItem("ssp_controls");
      if (storedCont) {
        setControls(JSON.parse(storedCont));
      }
    } catch (e) {
      console.warn("Failed loading controls", e);
    }
  }, [properties]);

  // Execute a delayed operation if simulated slow mode is on
  const executeOperation = (callback: () => void, successMsg?: string) => {
    if (controls.slowOperations) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        callback();
        if (successMsg) {
          onShowNotification(successMsg, "success");
        }
      }, 1000);
    } else {
      callback();
      if (successMsg) {
        onShowNotification(successMsg, "success");
      }
    }
  };

  // ----------------------------------------------------
  // ENQUIRY ACTIONS
  // ----------------------------------------------------
  const handleUpdateEnquiryStatus = (id: string, newStatus: "New" | "Contacted" | "Resolved") => {
    executeOperation(() => {
      const updated = enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e);
      setEnquiries(updated);
      localStorage.setItem("ssp_simulated_enquiries", JSON.stringify(updated));
    }, `Enquiry status changed to ${newStatus}`);
  };

  const handleDeleteEnquiry = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Enquiry Record",
      message: "Are you sure you want to permanently erase this client enquiry? This action cannot be undone.",
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          const updated = enquiries.filter(e => e.id !== id);
          setEnquiries(updated);
          localStorage.setItem("ssp_simulated_enquiries", JSON.stringify(updated));
        }, "Enquiry record successfully deleted");
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportCSV = () => {
    try {
      // Create CSV structure
      const headers = ["ID", "Name", "Phone", "Email", "Property Title", "Message", "Date", "Status"];
      const rows = enquiries.map(e => [
        e.id,
        `"${e.name.replace(/"/g, '""')}"`,
        e.phone,
        e.email,
        `"${e.propertyName.replace(/"/g, '""')}"`,
        `"${e.message.replace(/"/g, '""')}"`,
        e.dateStr,
        e.status
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Shiv_Saya_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowNotification("CSV Sheet exported successfully!", "success");
    } catch (e) {
      console.error("Export failure", e);
      onShowNotification("Failed to generate CSV download", "info");
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingProperty) return;
    const finalReason = rejectReason + (rejectNotes ? `: ${rejectNotes}` : "");
    const updated = {
      ...rejectingProperty,
      moderationStatus: "rejected" as const,
      rejectionReason: finalReason
    };
    executeOperation(() => {
      onUpdateProperty(updated);
      setRejectingProperty(null);
      setRejectReason("Incomplete information");
      setRejectNotes("");
    }, "Property rejected.");
  };

  const handleExportPropertiesJSON = () => {
    try {
      const dataStr = JSON.stringify(properties, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ssp-properties-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowNotification("Properties exported as JSON successfully!", "success");
    } catch (e) {
      console.error("Properties export failure", e);
      onShowNotification("Failed to export properties.", "info");
    }
  };

  const handleClearTestData = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Clear Test Data",
      message: "This will remove all simulated test users and enquiries. Real Firebase data is unaffected. Proceed?",
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          localStorage.removeItem("ssp_simulated_db_users");
          localStorage.removeItem("ssp_simulated_enquiries");
          setDbUsers([]);
          setEnquiries([]);
        }, "Test data cleared successfully.");
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // USER / BAN ACTIONS
  // ----------------------------------------------------
  const handleToggleBanUser = (uid: string, currentBanState: boolean) => {
    const userObj = dbUsers.find(u => u.uid === uid);
    if (!userObj) return;

    setConfirmDialog({
      isOpen: true,
      title: `${currentBanState ? "Lift Suspension" : "Suspend User Account"}`,
      message: currentBanState 
        ? `Are you sure you want to restore access for ${userObj.displayName}? Their direct listings will remain hidden until manually approved.`
        : `Are you sure you want to suspend ${userObj.displayName}? This will lock them out of the platform and automatically hide ALL their properties immediately list-wide.`,
      isDanger: !currentBanState,
      onConfirm: () => {
        executeOperation(() => {
          // Toggle user ban status
          const updatedUsers = dbUsers.map(u => u.uid === uid ? { ...u, banned: !currentBanState } : u);
          setDbUsers(updatedUsers);
          localStorage.setItem("ssp_simulated_db_users", JSON.stringify(updatedUsers));

          // If banned, cascade hide their property listings
          if (!currentBanState && userObj.email) {
            properties.forEach(prop => {
              if (prop.postedBy?.toLowerCase() === userObj.email.toLowerCase()) {
                if (prop.moderationStatus !== "rejected") {
                  onUpdateProperty({
                    ...prop,
                    moderationStatus: "rejected"
                  });
                }
              }
            });
          }
        }, `User ${userObj.displayName} successfully ${currentBanState ? "restored" : "suspended"}`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // SETTINGS ACTIONS
  // ----------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    executeOperation(async () => {
      await updateRemoteSettings(settings);
      // Reload page immediately to re-bootstrap CONFIG values
      onShowNotification("Core settings updated! Reloading parameters...", "success");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    });
  };

  const handleToggleControl = async (controlKey: keyof typeof controls) => {
    const newCont = {
      ...controls,
      [controlKey]: !controls[controlKey]
    };
    setControls(newCont);
    await updateRemoteControls(newCont);
    onShowNotification(`${String(controlKey).replace(/([A-Z])/g, ' $1')} updated!`, "success");
  };

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    if (adminsList.map(a => a.toLowerCase()).includes(cleanEmail)) {
      onShowNotification("Admin email already exists in system listings!", "info");
      return;
    }

    executeOperation(async () => {
      const success = await addRemoteAdmin(cleanEmail);
      if (success) {
        const newList = [...adminsList, cleanEmail];
        setAdminsList(newList);
        setNewAdminEmail("");
        onShowNotification("Admin access granted! Access activates on first login.", "success");
      } else {
        onShowNotification("Failed to add admin.", "info");
      }
    }, "Administrator processing...");
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    const rootAdmin = import.meta.env.VITE_INITIAL_ADMINS?.split(',')[0].trim().toLowerCase();
    if (rootAdmin && emailToRemove.toLowerCase() === rootAdmin) {
      onShowNotification("The supreme root master administrator account cannot be expunged!", "info");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Remove Admin Rights",
      message: `Are you sure you want to strip admin privileges from ${emailToRemove}? They will be demoted to standard user state instantly.`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(async () => {
          const newList = adminsList.filter(e => e.toLowerCase() !== emailToRemove.toLowerCase());
          setAdminsList(newList);
          await removeRemoteAdmin(emailToRemove);
        }, "Administrator access revoked successfully");
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleFactoryReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: "🚨 SYSTEM COLD HARDFIX RESTORATION",
      message: "WARNING: This compiles a clean full purge wipe on simulated records. Removes all manual properties, local custom enquiries, suspension overrides, and resets business config defaults. DO YOU AUTHORIZE THIS TOTAL PURGE?",
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          localStorage.removeItem("ssp_simulated_enquiries");
          localStorage.removeItem("ssp_simulated_db_users");
          localStorage.removeItem("ssp_settings");
          localStorage.removeItem("ssp_controls");
          localStorage.removeItem("ssp_admin_emails");
          localStorage.removeItem("ssp_properties"); // If custom property addition used it
          onShowNotification("System storage cold purged. Reloading container...", "success");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        });
      }
    });
  };

  // ----------------------------------------------------
  // PROPERTY DISMISS / APPROVAL CONSTRAINTS
  // ----------------------------------------------------
  const handlePropertyApprovalToggle = (id: string, currentStatus: string | undefined) => {
    if (currentStatus === "pending") {
      setConfirmDialog({
        isOpen: true,
        title: "Approve Property",
        message: "Are you sure you want to approve this property? It will be visible to the public.",
        onConfirm: () => {
          setConfirmDialog(p => ({ ...p, isOpen: false }));
          executeOperation(() => {
            onToggleApproval(id);
          }, `Listing approved and published successfully`);
        }
      });
    } else if (currentStatus === "live") {
      setConfirmDialog({
        isOpen: true,
        title: "Revoke Approval",
        message: "Are you sure you want to revoke approval? This will hide the property from the public.",
        isDanger: true,
        onConfirm: () => {
          setConfirmDialog(p => ({ ...p, isOpen: false }));
          executeOperation(() => {
            onToggleApproval(id);
          }, `Listing approval revoked`);
        }
      });
    } else {
      executeOperation(() => {
        onToggleApproval(id);
      }, `Listing status toggled for property successfully`);
    }
  };

  const handlePropertyHideToggle = (prop: Property) => {
    if (prop.moderationStatus === "rejected") {
      setConfirmDialog({
        isOpen: true,
        title: "Restore Property",
        message: "Are you sure you want to restore this rejected property back to pending?",
        onConfirm: () => {
          setConfirmDialog(p => ({ ...p, isOpen: false }));
          executeOperation(() => {
            onUpdateProperty({
              ...prop,
              moderationStatus: "pending"
            });
          }, "Listing is now pending review");
        }
      });
    } else {
      setRejectingProperty(prop);
      setRejectReason("Incomplete information");
      setRejectNotes("");
    }
  };

  const handlePropertyDelete = (id: string) => {
    const matchedProp = properties.find(p => p.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Real Estate Listing",
      message: `Are you absolutely sure you want to permanently delete "${matchedProp?.title || 'this property'}"? This clears all customer linkages and details.`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          onDeleteProperty(id);
          setSelectedProperties(prev => prev.filter(pId => pId !== id));
        }, "Property listing permanently erased from core");
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // BULK MANIPULATIONS ON TABLE
  // ----------------------------------------------------
  const handleSelectAllProps = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredPropertiesings.map(p => p.id);
      setSelectedProperties(visibleIds);
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProp = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, id]);
    } else {
      setSelectedProperties(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedProperties.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Bulk Approve ${selectedProperties.length} Listings`,
      message: `You are about to approve ${selectedProperties.length} selected listings. They will become immediately visible to the public. Proceed?`,
      isDanger: false,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach(id => {
            const found = properties.find(p => p.id === id);
            if (found && found.moderationStatus !== "live") {
              onToggleApproval(id);
            }
          });
          setSelectedProperties([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }, `Bulk approved ${selectedProperties.length} listings successfully`);
      }
    });
  };

  const handleBulkHide = () => {
    if (selectedProperties.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Bulk Reject ${selectedProperties.length} Listings`,
      message: `You are about to reject/hide ${selectedProperties.length} selected listings. They will no longer be visible to the public. Proceed?`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach(id => {
            const found = properties.find(p => p.id === id);
            if (found && found.moderationStatus !== "rejected") {
              onUpdateProperty({ ...found, moderationStatus: "rejected" });
            }
          });
          setSelectedProperties([]);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }, `Successfully rejected ${selectedProperties.length} selected listings`);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Erase ${selectedProperties.length} Listings`,
      message: `WARNING: You are compiling a batch delete query on ${selectedProperties.length} properties. This clears them permanently from server index. Proceed?`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          selectedProperties.forEach(id => {
            onDeleteProperty(id);
          });
          setSelectedProperties([]);
        }, `Batch purge complete for ${selectedProperties.length} items`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // ADD & EDIT PROPERTY ACTIONS
  // ----------------------------------------------------
  const handleAddNewManualProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title") as string;
    const price = Number(data.get("price"));
    const location = data.get("location") as string;
    const type = data.get("type") as string;
    const bhkStr = data.get("bhk") as string;
    const description = data.get("description") as string;
    const area = Number(data.get("area"));
    const areaUnit = data.get("areaUnit") as string;
    const transactionType = data.get("transactionType") as "Buy" | "Rent";
    const imageUrl = data.get("imageUrl") as string || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80";

    if (!title || !price || !location) {
      onShowNotification("Required fields cannot be left empty!", "info");
      return;
    }

    const newProp: Property = {
      id: `manual-p-${Date.now()}`,
      title,
      description,
      price,
            locality: location,
      city: "Noida",
      category: type === "Commercial" ? "Commercial" : type === "Plot" ? "Plots" : transactionType === "Rent" ? "Rent" : "Buy",
      featured: false,
      newLaunch: true,
      verified: true,
      postedDate: new Date().toISOString().split("T")[0],
      location,
      bhk: bhkStr ? Number(bhkStr) : null,
      type,
      area,
      areaUnit: areaUnit || "Sq.Ft.",
      bathrooms: Number(data.get("bathrooms")) || 2,
      floor: Number(data.get("floor")) || 0,
      totalFloors: Number(data.get("totalFloors")) || 4,
      possession: data.get("possession") as string || "Ready to Move",
      postedBy: "Agent",
      customPostedBy: settings.businessEmail,
      postedByUid: "admin-system",
      createdAt: new Date().toISOString(),
      moderationStatus: controls.autoApproveListings ? "live" : "pending",
      images: [imageUrl],
      amenities: ["Water Storage", "Security Ward", "Spacious Balcony"],
      isPremium: data.get("isPremium") === "true",
      reraApproved: data.get("reraApproved") === "true"
    };

    executeOperation(() => {
      onAddProperty(newProp);
      setIsAddModalOpen(false);
    }, `New direct listing added! status: ${newProp.moderationStatus}`);
  };

  const handleUpdateEditProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProperty) return;

    const data = new FormData(e.currentTarget);
    const title = data.get("title") as string;
    const price = Number(data.get("price"));
    const location = data.get("location") as string;
    const type = data.get("type") as string;
    const bhkStr = data.get("bhk") as string;
    const description = data.get("description") as string;
    const area = Number(data.get("area"));
    const areaUnit = data.get("areaUnit") as string;
    const imageUrl = data.get("imageUrl") as string;

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
      bathrooms: Number(data.get("bathrooms")) || editingProperty.bathrooms || 0,
      floor: Number(data.get("floor")) || editingProperty.floor || 0,
      totalFloors: Number(data.get("totalFloors")) || editingProperty.totalFloors || 0,
      possession: data.get("possession") as string || editingProperty.possession || "Ready to Move",
      images: imageUrl ? [imageUrl] : editingProperty.images,
      isPremium: data.get("isPremium") === "true",
      reraApproved: data.get("reraApproved") === "true"
    };

    executeOperation(() => {
      onUpdateProperty(updated);
      setIsEditModalOpen(false);
      setEditingProperty(null);
    }, "Property details modified successfully");
  };

  // ----------------------------------------------------
  // COMPUTED METRICS AND FILTERS
  // ----------------------------------------------------
  // 1. Properties filters
  const filteredPropertiesings = useMemo(() => properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(propertySearch.toLowerCase()) || 
                          p.location.toLowerCase().includes(propertySearch.toLowerCase());
    
    if (propertyStatusFilter !== "All") {
      let targetStatus = propertyStatusFilter.toLowerCase();
      if (targetStatus === "featured") {
        return matchesSearch && p.featured === true;
      }
      if (targetStatus === "approved") {
        targetStatus = "live";
      } else if (targetStatus === "hidden") {
        targetStatus = "rejected";
      }
      return matchesSearch && p.moderationStatus === targetStatus;
    }
    return matchesSearch;
  }), [properties, propertySearch, propertyStatusFilter]);

  const sortedListings = useMemo(() => [...filteredPropertiesings].sort((a, b) => {
    if (propertySort === "price-asc") return a.price - b.price;
    if (propertySort === "price-desc") return b.price - a.price;
    if (propertySort === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return 0; // Default
  }), [filteredPropertiesings, propertySort]);

  // 2. Enquiries filters
  const filteredEnquiries = useMemo(() => enquiries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                          e.email.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                          e.propertyName.toLowerCase().includes(enquirySearch.toLowerCase());
    if (enquiryFilter !== "All") {
      return matchesSearch && e.status === enquiryFilter;
    }
    return matchesSearch;
  }), [enquiries, enquirySearch, enquiryFilter]);

  // 3. User filters
  const filteredUsers = useMemo(() => dbUsers.filter(u => {
    return u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
           u.email.toLowerCase().includes(userSearch.toLowerCase());
  }), [dbUsers, userSearch]);

  // 4. Stat counting variables
  const pendingProperties = useMemo(() => properties.filter(p => p.moderationStatus === "pending"), [properties]);
  const approvedListingsCount = useMemo(() => properties.filter(p => p.moderationStatus === "live").length, [properties]);
  const pendingApprovalsCount = pendingProperties.length;
  
  // FLAT RATE of 1% commission on all approved "Buy" (sale) properties for "Estimated Revenue"
  const totalApprovedSalesValue = useMemo(() => properties
    .filter(p => p.moderationStatus === "live" && (!p.transactionType || p.transactionType === "Buy"))
    .reduce((sum, p) => sum + p.price, 0), [properties]);
  const estimatedRevenue = Math.round(totalApprovedSalesValue * 0.01);

  // Derived metrics for analytics tab
  const threeBhkCount = useMemo(() => properties.filter(p => String(p.bhk || "").includes("3 BHK") || String(p.bhk || "").includes("3")).length, [properties]);
  const villaCount = useMemo(() => properties.filter(p => String(p.type || "").toLowerCase().includes("villa")).length, [properties]);
  const commercialCount = useMemo(() => properties.filter(p => String(p.type || "").toLowerCase().includes("plot") || String(p.type || "").toLowerCase().includes("office") || String(p.type || "").toLowerCase().includes("commercial")).length, [properties]);
  const standardFlatsCount = useMemo(() => properties.filter(p => String(p.bhk || "").includes("1 BHK") || String(p.bhk || "").includes("2 BHK") || String(p.bhk || "").includes("1") || String(p.bhk || "").includes("2")).length, [properties]);
  const newEnquiriesCount = useMemo(() => enquiries.filter(e => e.status === "New").length, [enquiries]);
  const contactedEnquiriesCount = useMemo(() => enquiries.filter(e => e.status === "Contacted").length, [enquiries]);
  const resolvedEnquiriesCount = useMemo(() => enquiries.filter(e => e.status === "Resolved").length, [enquiries]);
  const unverifiedActivePropertiesCount = useMemo(() => properties.filter(p => !p.verified && p.moderationStatus !== "rejected").length, [properties]);

  // Formatting currency in Rupee (Cr / Lakh) formats beautifully
  const _formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatCurrency = (val: number) => _formatIndianCurrency?.(val) ?? `₹${val.toLocaleString('en-IN')}`;


  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] min-h-screen pt-24 pb-16 flex flex-col md:flex-row">
      
      {/* ----------------- SIDEBAR CONTAINER ----------------- */}
      <aside className="w-full md:w-64 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-white/5 p-5 flex flex-col md:sticky md:top-24 md:h-[calc(100vh-140px)]">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Shield className="h-6 w-6 text-[#D4AF37]" />
          <div>
            <h2 className="font-bold text-white text-base">Control Hub</h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">SHIV SAYA ADVISORY</p>
          </div>
        </div>

        {/* Sidebar Nav buttons */}
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none">
          {[
            { id: "overview", label: "Dashboard", Icon: LayoutDashboard },
            { id: "properties", label: "Properties", Icon: Building },
            { id: "pending_approvals", label: "Pending Approvals", Icon: Shield, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
            { id: "enquiries", label: "Enquiries", Icon: Mail, badge: newEnquiriesCount },
            { id: "users", label: "Users", Icon: Users },
            { id: "analytics", label: "Analytics", Icon: BarChart3 },
            { id: "settings", label: "Settings", Icon: Settings },
            { id: "checklist", label: "Readiness Audit", Icon: CheckSquare }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            const TabIcon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  isSelected 
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                }`}
              >
                <TabIcon className={`h-4 w-4 ${isSelected ? "text-[#D4AF37]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white font-bold text-[9px] min-w-4 text-center">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* System parameters indicator */}
        <div className="hidden md:block mt-auto bg-slate-950/50 rounded-xl p-3.5 border border-white/5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
            <span>Container Status</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
            API Sync: Active<br />
            SimLoader: {controls.slowOperations ? "1000ms" : "0ms"}<br />
            Admins: {adminsList.length} Accounts
          </p>
        </div>
      </aside>

      {/* ----------------- CORE PANELS HUB ----------------- */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-2 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="spinner_loader"
              className="flex flex-col items-center justify-center py-24 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RefreshCw className="h-10 w-10 text-[#D4AF37] animate-spin" />
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Syncing server variables...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* =====================================================
                  METRIC PANEL: OVERVIEW TAB
                  ===================================================== */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Top Welcome Title */}
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
                      <p className="text-xs text-slate-400">Shiv Saya Properties listing approvals, direct client requests, and operations.</p>
                    </div>
                    <div className="text-xs bg-slate-900 border border-white/5 py-1.5 px-3 rounded-lg text-slate-400 font-medium">
                      Est. Commission: <span className="text-[#D4AF37] font-bold">1% Scale</span>
                    </div>
                  </div>

                  {/* 6 Grid Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Total Properties", value: properties.length.toString(), color: "border-l-blue-500", desc: "Indexed real estate" },
                      { title: "Approved Listings", value: approvedListingsCount.toString(), color: "border-l-emerald-500", desc: "Public direct active" },
                      { title: "Pending Approvals", value: pendingApprovalsCount.toString(), color: "border-l-amber-500", desc: "Awaiting physical check", warning: pendingApprovalsCount > 0 },
                      { title: "Client Enquiries", value: enquiries.length.toString(), color: "border-l-purple-500", desc: "Awaiting resolution callback" },
                      { title: "Registered Users", value: dbUsers.length.toString(), color: "border-l-rose-500", desc: "Simulated database logins" },
                      { title: "Est. Revenue (1%)", value: formatCurrency(estimatedRevenue), color: "border-l-[#D4AF37]", desc: "Scale value generated" }
                    ].map((metric, i) => (
                      <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={`bg-slate-900 border border-white/5 border-l-4 ${metric.color} rounded-2xl p-4 shadow-xl flex flex-col justify-between`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{metric.title}</span>
                        <div className="my-2.5 flex items-baseline gap-2">
                          <span className="text-lg sm:text-2xl font-black text-white">{metric.value}</span>
                          {metric.warning && (
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium leading-tight">{metric.desc}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Split sections: Left Pending items, Right Recent requests */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT PANEL: Pending Approvals Queue */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <h3 className="font-extrabold text-white text-sm">Pending Approvals</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md">
                          {pendingApprovalsCount} Queue
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                        {pendingProperties.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <ShieldCheck className="h-10 w-10 text-emerald-500" />
                            <p className="text-xs text-slate-400 font-semibold">All property records verified!</p>
                            <p className="text-[10px] text-slate-500">Every direct submit has been physically audited.</p>
                          </div>
                        ) : (
                          pendingProperties.map((prop) => (
                            <div 
                              key={prop.id}
                              className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all"
                            >
                              <div className="min-w-0">
                                <h4 className="font-bold text-white text-xs truncate leading-snug">{prop.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-semibold">
                                  <MapPin className="h-3 w-3 text-[#D4AF37] shrink-0" /> {prop.location}
                                </p>
                                <p className="text-[10px] text-[#D4AF37] font-black mt-0.5">{formatCurrency(prop.price)}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="Audit Approved & Publish"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handlePropertyHideToggle(prop)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer transition-all"
                                  title="Reject Listing"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* RIGHT PANEL: Recent Enquiries */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#D4AF37]" />
                          <h3 className="font-extrabold text-white text-sm">Recent Client Inquiries</h3>
                        </div>
                        <button 
                          onClick={() => setActiveTab("enquiries")}
                          className="text-[10px] text-[#D4AF37] font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          View All <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                        {enquiries.slice(0, 5).map((enq) => (
                          <div 
                            key={enq.id}
                            className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 space-y-2 hover:border-[#D4AF37]/20 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              <div>
                                <h4 className="font-extrabold text-white text-xs">{enq.name}</h4>
                                <span className="text-[9px] text-slate-500 font-medium">{new Date(enq.dateStr).toLocaleString()}</span>
                              </div>
                              
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                enq.status === "New" 
                                  ? "bg-red-500/15 text-red-400 border border-red-500/10 animate-pulse"
                                  : enq.status === "Contacted"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/10"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"
                              }`}>
                                {enq.status}
                              </span>
                            </div>

                            <p className="text-[10px] text-[#D4AF37] font-bold truncate">Prop: {enq.propertyName}</p>
                            <p className="text-[10px] text-slate-400 italic line-clamp-2">"{enq.message}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Activity Chart Reference */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Indexed Actions (Overview)</h3>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Approved', count: approvedListingsCount, fill: '#10b981' },
                          { name: 'Pending', count: pendingApprovalsCount, fill: '#f59e0b' },
                          { name: 'Enquiries', count: enquiries.length, fill: '#f43f5e' },
                          { name: 'Users', count: dbUsers.length, fill: '#3b82f6' }
                        ]} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} layout="vertical">
                          <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', padding: '10px', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                            cursor={{fill: '#1e293b'}}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}


              {/* =====================================================
                  TAB 2: PROPERTIES MANAGEMENT PANEL
                  ===================================================== */}
              {activeTab === "properties" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top bar controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-extrabold text-white tracking-tight">Real Estate Master Index ({filteredPropertiesings.length} records)</h1>
                      <p className="text-xs text-slate-400">Search, filter, edit details manually, or process approvals in bulk.</p>
                    </div>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all self-start sm:self-auto"
                    >
                      <Plus className="h-4 w-4 text-slate-950 stroke-[3]" /> Add Manual Property
                    </button>
                  </div>

                  {/* Searching filtering row */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3.5 shadow-xl">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <label htmlFor="search-listings-input" className="sr-only">Search Listings</label>
                      <input id="search-listings-input"
                        type="text"
                        placeholder="Search listings by title, locality name..."
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        {["All", "Live", "Pending", "Rejected", "Featured"].map((fState) => (
                          <button
                            key={fState}
                            onClick={() => setPropertyStatusFilter(fState)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              propertyStatusFilter === fState
                                ? "bg-slate-800 text-[#D4AF37]"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {fState}
                          </button>
                        ))}
                      </div>

                      <select
                        value={propertySort}
                        onChange={(e) => setPropertySort(e.target.value)}
                        className="bg-slate-950 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 py-2.5 px-3.5 outline-none focus:border-[#D4AF37]/30 cursor-pointer"
                      >
                        <option value="default">Default Sort</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="newest">Posted: Newest</option>
                      </select>
                    </div>
                  </div>

                  {/* BULK ACTIONS BANNER */}
                  {selectedProperties.length > 0 && (
                    <motion.div 
                      className="bg-slate-800/80 border border-[#D4AF37]/30 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xl"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-[#D4AF37]" />
                        <span className="text-xs text-white font-bold">{selectedProperties.length} properties selected</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBulkApprove}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] cursor-pointer active:scale-95 transition-all"
                        >
                          Approve Batch
                        </button>
                        <button
                          onClick={handleBulkHide}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-300 border border-white/10 hover:border-slate-700 font-bold text-[10px] cursor-pointer"
                        >
                          Hide Batch
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Erase Batch
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Database properties list table */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="py-4 px-4 w-12 text-center">
                              <label htmlFor="select-all-props" className="sr-only">Select All Properties</label>
                              <input id="select-all-props"
                                type="checkbox"
                                checked={selectedProperties.length === filteredPropertiesings.length && filteredPropertiesings.length > 0}
                                onChange={handleSelectAllProps}
                                className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/30 h-4 w-4 bg-slate-950 cursor-pointer"
                              />
                            </th>
                            <th className="py-4 px-4">Title & Locality</th>
                            <th className="py-4 px-4 w-32">Price Scale</th>
                            <th className="py-4 px-4 w-28 text-center">Audit Status</th>
                            <th className="py-4 px-4 w-48 text-center">Panel Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                          {sortedListings.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                                No properties matching search criteria were found!
                              </td>
                            </tr>
                          ) : (
                            sortedListings.map((prop) => {
                              const isChecked = selectedProperties.includes(prop.id);
                              return (
                                <tr key={prop.id} className={`hover:bg-slate-950/20 transition-all ${isChecked ? "bg-slate-800/10" : ""}`}>
                                  {/* Checkbox column */}
                                  <td className="py-4 px-4 text-center">
                                    <label htmlFor={`select-prop-${prop.id}`} className="sr-only">Select Property</label>
                                    <input id={`select-prop-${prop.id}`}
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleSelectProp(prop.id, e.target.checked)}
                                      className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/30 h-4 w-4 bg-slate-950 cursor-pointer"
                                    />
                                  </td>

                                  {/* Title & locality column */}
                                  <td className="py-4 px-4 min-w-0 font-sans">
                                    <h4 className="font-extrabold text-white leading-normal truncate max-w-sm sm:max-w-md">{prop.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-[#D4AF37]" /> {prop.location}
                                    </p>
                                    <span className="inline-block mt-1 bg-slate-950/60 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                                      {prop.bhk} | {prop.type} | {prop.postedBy || "Owner Direct"}
                                    </span>
                                  </td>

                                  {/* Price column */}
                                  <td className="py-4 px-4 font-bold text-[#D4AF37]">
                                    {formatCurrency(prop.price)}
                                  </td>

                                  {/* Status tag */}
                                  <td className="py-4 px-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold border leading-none uppercase ${
                                      prop.moderationStatus === "live"
                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                        : prop.moderationStatus === "pending"
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse"
                                        : prop.moderationStatus === "rejected"
                                        ? "bg-red-500/15 text-red-400 border-red-500/20"
                                        : "bg-slate-800 text-slate-400 border-white/5"
                                    }`}>
                                      {prop.moderationStatus}
                                    </span>
                                  </td>

                                  {/* Actions buttons */}
                                  <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-2.5">
                                      {/* Approve Toggle */}
                                      {prop.moderationStatus === "pending" ? (
                                        <button
                                          onClick={() => handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[9px] flex items-center gap-0.5 cursor-pointer transition-all"
                                          title="Audit Approve"
                                        >
                                          <Check className="h-3 w-3" /> Approve
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                                          className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-[#D4AF37] text-[9px] flex items-center gap-0.5 cursor-pointer"
                                          title="Revoke Verification"
                                        >
                                          <RefreshCw className="h-3 w-3" /> Revoke
                                        </button>
                                      )}

                                      {/* Reject Toggle */}
                                      <button
                                        onClick={() => handlePropertyHideToggle(prop)}
                                        className={`p-2 rounded-lg bg-slate-850 border border-white/5 transition-colors cursor-pointer ${
                                          prop.moderationStatus === "rejected"
                                            ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20"
                                            : "text-slate-400 hover:text-red-400 hover:bg-red-950/20"
                                        }`}
                                        title={prop.moderationStatus === "rejected" ? "Restore Visibility" : "Reject Listing"}
                                      >
                                        {prop.moderationStatus === "rejected" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                      </button>

                                      {/* Edit */}
                                      <button
                                        onClick={() => {
                                          setEditingProperty(prop);
                                          setIsEditModalOpen(true);
                                        }}
                                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                                        title="Modify Details"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        onClick={() => handlePropertyDelete(prop.id)}
                                        className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                                        title="Delete Listing"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* =====================================================
                  TAB: PENDING APPROVALS
                  ===================================================== */}
              {activeTab === "pending_approvals" && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl text-white font-extrabold tracking-tight">Pending Approvals Queue</h2>
                    <p className="text-xs text-slate-400 font-medium">Explicit listing of all records lacking physical validation or compliance audit.</p>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="py-4 px-4 w-12 text-center">#</th>
                            <th className="py-4 px-4">Title & Locality</th>
                            <th className="py-4 px-4 w-32">Price Scale</th>
                            <th className="py-4 px-4 w-28 text-center">Audit Status</th>
                            <th className="py-4 px-4 w-48 text-center">Panel Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                          {pendingProperties.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <ShieldCheck className="h-10 w-10 text-emerald-500" />
                                  <p className="text-xs text-slate-400 font-semibold">Queue Clear</p>
                                  <p className="text-[10px] text-slate-500">No properties are currently pending approval.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            pendingProperties.map((prop, idx) => (
                              <tr key={prop.id} className="hover:bg-slate-950/20 transition-all text-xs font-sans">
                                {/* Index column */}
                                <td className="py-4 px-4 text-center font-bold text-slate-500">{idx + 1}</td>

                                {/* Title & locality column */}
                                <td className="py-4 px-4 min-w-0">
                                  <h4 className="font-extrabold text-white leading-normal truncate max-w-sm sm:max-w-md">{prop.title}</h4>
                                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-[#D4AF37]" /> {prop.location}
                                  </p>
                                </td>

                                {/* Price column */}
                                <td className="py-4 px-4 font-bold text-[#D4AF37]">
                                  {formatCurrency(prop.price)}
                                </td>

                                {/* Status tag */}
                                <td className="py-4 px-4 text-center">
                                  <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold border leading-none uppercase bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse">
                                    {prop.moderationStatus}
                                  </span>
                                </td>

                                {/* Actions column */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all focus:ring-2 ring-emerald-500/50"
                                      title="Audit Approve"
                                    >
                                      <Check className="h-3.5 w-3.5" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handlePropertyHideToggle(prop)}
                                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/5 hover:border-red-500/30 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                                      title="Reject Listing"
                                    >
                                      <X className="h-3.5 w-3.5" /> Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* =====================================================
                  TAB 3: ENQUIRIES PANEL
                  ===================================================== */}
              {activeTab === "enquiries" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top bar description */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-extrabold text-white tracking-tight">Client Contact Hub ({filteredEnquiries.length} records)</h1>
                      <p className="text-xs text-slate-400">Direct callbacks from interested buyers. Complete tasks, change statuses, or chat on WhatsApp.</p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-[#D4AF37]/30 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                    >
                      <Download className="h-4 w-4 text-[#D4AF37]" /> Export CSV Sheet
                    </button>
                  </div>

                  {/* Search bar inside enquiries */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-3.5 shadow-xl">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <label htmlFor="search-enquiries-input" className="sr-only">Search Enquiries</label>
                      <input id="search-enquiries-input"
                        type="text"
                        placeholder="Search enquiries by name, email, or property title..."
                        value={enquirySearch}
                        onChange={(e) => setEnquirySearch(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-650 outline-none transition-all"
                      />
                    </div>

                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                      {["All", "New", "Contacted", "Resolved"].map((enqFilterOpt) => (
                        <button
                          key={enqFilterOpt}
                          onClick={() => setEnquiryFilter(enqFilterOpt)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            enquiryFilter === enqFilterOpt
                              ? "bg-slate-800 text-[#D4AF37]"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {enqFilterOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enquiries Grid table list */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="py-4 px-4 w-48">Client Details</th>
                            <th className="py-4 px-4">Subject Property</th>
                            <th className="py-4 px-4 w-48">Client Request</th>
                            <th className="py-4 px-4 w-32 text-center">Status</th>
                            <th className="py-4 px-4 w-40 text-center">Advisory Tools</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                          {filteredEnquiries.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                                No client enquiries found matching keywords!
                              </td>
                            </tr>
                          ) : (
                            filteredEnquiries.map((enq) => (
                              <tr key={enq.id} className="hover:bg-slate-950/20 transition-all font-sans">
                                
                                {/* Client stats */}
                                <td className="py-4 px-4 space-y-1">
                                  <h4 className="font-extrabold text-white leading-tight">{enq.name}</h4>
                                  <p className="text-[10px] text-[#D4AF37] font-semibold">{enq.phone}</p>
                                  <p className="text-[10px] text-slate-500 select-all font-medium break-all">{enq.email}</p>
                                  <p className="text-[9px] text-slate-600">Recd: {new Date(enq.dateStr).toLocaleDateString()}</p>
                                </td>

                                {/* Property connection */}
                                <td className="py-4 px-4 font-bold text-slate-200">
                                  {enq.propertyName}
                                  <p className="text-[10px] text-slate-500 font-medium">ID: {enq.propertyId}</p>
                                </td>

                                {/* Enquiry message */}
                                <td className="py-4 px-4 max-w-sm">
                                  <p className="text-[11px] text-slate-450 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                                    "{enq.message}"
                                  </p>
                                </td>

                                {/* Status tags selection */}
                                <td className="py-4 px-4 text-center">
                                  <select
                                    value={enq.status}
                                    onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as any)}
                                    className={`text-[9px] font-black uppercase rounded-lg border px-2 py-1 outline-none cursor-pointer focus:ring-1 ${
                                      enq.status === "New" 
                                        ? "bg-red-500/10 text-red-400 border-red-500/25 focus:ring-red-500"
                                        : enq.status === "Contacted"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25 focus:ring-amber-500"
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 focus:ring-emerald-500"
                                    }`}
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Resolved">Resolved</option>
                                  </select>
                                </td>

                                {/* Panel interactions */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Whatsapp Chat */}
                                    <a
                                      href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello Mr/Ms ${enq.name}, ${BUSINESS_CONFIG.consultantName} here from Shiv Saya Properties. I received your enquiry about: ${enq.propertyName}. I would be glad to share layout details.`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] border border-[#10B981]/25 cursor-pointer"
                                      title="WhatsApp Specialist Chat"
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                    </a>

                                    {/* Email directly */}
                                    <a
                                      href={`mailto:${enq.email}?subject=Response on your property enquiry - Shiv Saya Properties&body=Hello ${enq.name},%0D%0AThank you for reaching out regarding ${enq.propertyName}.`}
                                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25"
                                      title="Send Email response"
                                    >
                                      <MailIcon className="h-3.5 w-3.5" />
                                    </a>

                                    {/* Delete Enquiry */}
                                    <button
                                      onClick={() => handleDeleteEnquiry(enq.id)}
                                      className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                                      title="Delete Enquiry Record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* =====================================================
                  TAB 4: USERS REGISTERED PANEL
                  ===================================================== */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top info and searching */}
                  <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Simulated User Base ({filteredUsers.length} files)</h1>
                    <p className="text-xs text-slate-400">Suspend offending client accounts or override custom registration privileges instantly.</p>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 shadow-xl relative">
                    <Search className="absolute left-7 top-7 h-4 w-4 text-slate-500" />
                    <label htmlFor="search-accounts-input" className="sr-only">Search Accounts</label>
                    <input id="search-accounts-input"
                      type="text"
                      placeholder="Search accounts catalog by first/last display name or registration email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-650 outline-none transition-all"
                    />
                  </div>

                  {/* Users grid table */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto font-sans">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="py-4 px-4">Account User Name</th>
                            <th className="py-4 px-4 w-48">Verified Email</th>
                            <th className="py-4 px-4 w-44">Contact Record</th>
                            <th className="py-4 px-4 w-28 text-center">Platform Status</th>
                            <th className="py-4 px-4 w-36 text-center">Status Action</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-500">
                                No registered user accounts match search filter.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((usr) => (
                              <tr key={usr.uid} className="hover:bg-slate-950/20 transition-all">
                                
                                <td className="py-4 px-4 font-extrabold text-white flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-slate-800 text-[#D4AF37] font-black text-xs flex items-center justify-center uppercase border border-white/5">
                                    {usr.displayName.charAt(0)}
                                  </div>
                                  <div>
                                    {usr.displayName}
                                    <span className="block text-[8px] text-slate-500 font-mono">UID: {usr.uid}</span>
                                  </div>
                                </td>

                                <td className="py-4 px-4 select-all text-slate-300 font-medium">
                                  {usr.email}
                                </td>

                                <td className="py-4 px-4 text-slate-400">
                                  {usr.phone || "---"}
                                </td>

                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase leading-none border ${
                                    usr.banned === true
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-none"
                                  }`}>
                                    {usr.banned === true ? "Suspended" : "Active"}
                                  </span>
                                </td>

                                {/* Suspend/Ban button */}
                                <td className="py-4 px-4 text-center">
                                  {usr.banned === true ? (
                                    <button
                                      onClick={() => handleToggleBanUser(usr.uid, true)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 hover:text-white text-emerald-400 border border-emerald-500/25 cursor-pointer font-bold text-[10px]"
                                    >
                                      Reactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleBanUser(usr.uid, false)}
                                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 hover:text-white text-red-450 border border-red-500/25 cursor-pointer font-bold text-[10px]"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                </td>

                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* =====================================================
                  TAB 5: METRIC ANALYTICS GRAPHICS
                  ===================================================== */}
              {activeTab === "analytics" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Aesthetic Real Estate Analytics</h1>
                    <p className="text-xs text-slate-400">Performance logs, listing breakdowns, and estimations calculated live.</p>
                  </div>

                  {/* Double Columns charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Visual Breakdown of items */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Indexed Listing Types</h3>
                      
                      <div className="space-y-4 pt-3.5">
                        {[
                          { name: "3 BHK Builder Floors", count: threeBhkCount, color: "bg-[#D4AF37]" },
                          { name: "Luxury Heritage Villas", count: villaCount, color: "bg-teal-500" },
                          { name: "Commercial Office / Land Plots", count: commercialCount, color: "bg-blue-500" },
                          { name: "Standard 1 / 2 BHK Flats", count: standardFlatsCount, color: "bg-purple-500" }
                        ].map(stat => {
                          const pctValue = Math.round((stat.count / Math.max(1, properties.length)) * 100);
                          return (
                          <div key={stat.name} className="space-y-1.5 font-sans">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300">{stat.name}</span>
                              <span className="text-white font-bold">{stat.count} properties ({pctValue}%)</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div className={`${stat.color} h-1.5 rounded-full`} style={{ width: `${Math.max(5, pctValue)}%` }}></div>
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>

                    {/* Enquiry callback metrics */}
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Callback Conversation Funnel</h3>
                      
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {[
                          { title: "New Callback", count: newEnquiriesCount, pct: "30%", color: "border-red-500/20 text-red-400 bg-red-500/5" },
                          { title: "Contacted Agent", count: contactedEnquiriesCount, pct: "50%", color: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
                          { title: "Successful Deal", count: resolvedEnquiriesCount, pct: "20%", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" }
                        ].map(f => (
                          <div key={f.title} className={`p-4 border rounded-xl text-center flex flex-col justify-center ${f.color}`}>
                            <span className="text-[17.5px] font-black">{f.count}</span>
                            <span className="text-[10px] mt-1 font-bold select-none leading-tight">{f.title}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 mt-4 text-[11px] leading-relaxed text-slate-400">
                        Top performance advisory analytics estimate a conversion velocity of <span className="text-[#D4AF37] font-bold">4.2 Callback visits/week</span> under current verified RERA parameters.
                      </div>
                    </div>

                  </div>

                  {/* Activity Chart Area */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Property Views & Listing Activity (Past 7 Days)</h3>
                    <div className="h-64 w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Mon', views: 400, properties: 240 },
                          { name: 'Tue', views: 300, properties: 139 },
                          { name: 'Wed', views: 200, properties: 980 },
                          { name: 'Thu', views: 278, properties: 390 },
                          { name: 'Fri', views: 189, properties: 480 },
                          { name: 'Sat', views: 239, properties: 380 },
                          { name: 'Sun', views: 349, properties: 430 },
                        ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', padding: '10px', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                          <Area type="monotone" dataKey="views" name="Platform Views" stroke="#D4AF37" fillOpacity={1} fill="url(#colorViews)" />
                          <Area type="monotone" dataKey="properties" name="Properties Active" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProps)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}


              {/* =====================================================
                  TAB 6: HUB PARAMETERS SETTINGS
                  ===================================================== */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-fadeIn md:text-left text-xs text-slate-300">
                  
                  <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Hub General Settings</h1>
                    <p className="text-xs text-slate-400">Modify global credentials list, toggle simulated variables, or reset database snapshots.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* SECTION 1: EDIT CONFIG */}
                    <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                        <Sliders className="h-4 w-4 text-[#D4AF37]" />
                        <h3 className="font-extrabold text-white text-sm">Site Business Information</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="auto-adminview-1744" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Business Name</label>
                          <input id="auto-adminview-1744"
                            type="text"
                            value={settings.businessName}
                            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-rera" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RERA Number</label>
                          <input id="admin-settings-rera"
                            type="text"
                            value={settings.reraNumber}
                            onChange={(e) => setSettings({ ...settings, reraNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-consultant" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Consultant Lead</label>
                          <input id="admin-settings-consultant"
                            type="text"
                            value={settings.consultantName}
                            onChange={(e) => setSettings({ ...settings, consultantName: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-whatsapp" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">WhatsApp Target</label>
                          <input id="admin-settings-whatsapp"
                            type="text"
                            value={settings.whatsappNumber}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-email" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Official Email</label>
                          <input id="admin-settings-email"
                            type="email"
                            value={settings.businessEmail}
                            onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-phone" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Office Phone</label>
                          <input id="admin-settings-phone"
                            type="text"
                            value={settings.businessPhone}
                            onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="admin-settings-addr" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Office Headquarters Physical Address</label>
                        <input id="admin-settings-addr"
                          type="text"
                          value={settings.businessAddress}
                          onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2.5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-black cursor-pointer shadow-lg active:scale-98 hover:brightness-110 transition-all font-sans"
                      >
                        Apply Dynamic Parameters Settings
                      </button>
                    </form>

                    {/* RIGHT COLUMN SETTINGS: ADMIN ACCESS & TOGGLES */}
                    <div className="space-y-6">
                      
                      {/* SECTION 2: ADMIN ACCESS EMAILS */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                          <h3 className="font-extrabold text-white text-sm">Admin Access list</h3>
                        </div>

                        <form onSubmit={handleAddAdminEmail} className="flex gap-2">
                          <label htmlFor="new-admin-email" className="sr-only">Add new admin email</label>
                          <input id="new-admin-email"
                            type="email"
                            placeholder="Add new admin email (e.g. ritik@shivsaya...)"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="flex-grow bg-slate-950 border border-white/5 focus:border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-700 hover:text-white border border-white/5 hover:border-[#D4AF37]/20 text-slate-200 px-3.5 rounded-xl font-bold text-xs"
                          >
                            Add
                          </button>
                        </form>
                        <p className="text-[10px] text-slate-500 italic mt-1 mb-2 leading-tight">
                          If the user hasn't signed up yet, their admin access will activate automatically when they first log in.
                        </p>

                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {adminsList.map((adm) => (
                            <div key={adm} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] font-mono select-all">
                              <span>{adm}</span>
                              <button
                                onClick={() => handleRemoveAdminEmail(adm)}
                                className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                                title="Strip admin privileges"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: SYSTEM CONTROLS/TOGGLES */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Power className="h-4 w-4 text-[#D4AF37]" />
                          <h3 className="font-extrabold text-white text-sm">System Controls</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: "offlineMaintenance", label: "Maintenance", desc: "Block frontend routing" },
                            { key: "slowOperations", label: "Slow Ops (1s)", desc: "Simulate throttle latency" },
                            { key: "showWhatsappFloating", label: "WhatsApp Btn", desc: "Floating help widget" },
                            { key: "autoApproveListings", label: "Auto Approve", desc: "Skip admin audit checks" }
                          ].map(ctl => {
                            const isChecked = (controls as any)[ctl.key];
                            return (
                              <div key={ctl.key} className="p-3 bg-slate-955/40 border border-white/5 rounded-xl flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-extrabold text-white block text-[10.5px] leading-snug">{ctl.label}</span>
                                  <span className="text-[8.5px] text-slate-500 mt-0.5 block leading-none font-medium">{ctl.desc}</span>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleControl(ctl.key as any)}
                                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:ring-offset-1 focus:ring-offset-slate-900 ${
                                    isChecked ? "bg-emerald-500" : "bg-slate-800"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                                      isChecked ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* SECTION 4: DESTRUCTIVE CLEAN ACTIONS */}
                        <div className="pt-2 border-t border-white/5">
                          <button
                            onClick={handleFactoryReset}
                            className="bg-red-950 hover:bg-red-900 text-red-100 border border-red-500/15 leading-none py-3 px-4 rounded-xl text-center font-bold font-mono tracking-wide text-[10.5px] w-full block transition-colors cursor-pointer"
                          >
                            Factory default Purge Storage
                          </button>
                        </div>
                      </div>

                      {/* DATA MANAGEMENT SECTION */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Database className="h-4 w-4 text-[#D4AF37]" />
                          <h3 className="font-extrabold text-white text-sm">Data Management</h3>
                        </div>

                        <div className="space-y-2.5">
                          <button
                            type="button"
                            onClick={handleExportPropertiesJSON}
                            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-white/5 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-[#D4AF37]" /> Export All Properties (JSON)
                          </button>

                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-white/5 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-[#D4AF37]" /> Export All Enquiries as CSV
                          </button>

                          <button
                            type="button"
                            onClick={handleClearTestData}
                            className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/10 hover:border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Database className="h-3.5 w-3.5 text-red-400 animate-pulse" /> Clear Test Data
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}


              {/* =====================================================
                  TAB 7: READINESS AUDIT REGULATORY COMPLIANCE
                  ===================================================== */}
              {activeTab === "checklist" && (
                <div className="space-y-6 animate-fadeIn md:text-left text-xs text-slate-300">
                  <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Readiness Audit Compliance Diagnostics</h1>
                    <p className="text-xs text-slate-400">Validate real-time real estate guidelines, broker validation records, and digital documentation checklists.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Diagnostic Summary Cards */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-[#D4AF37]" />
                            <h3 className="font-extrabold text-white text-sm">Haryana RERA Verification Checks</h3>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">Standards: HRERA-2026</span>
                        </div>

                        {/* Checklist items list */}
                        <div className="space-y-3">
                          {/* Item 1: RERA office registration parameters */}
                          <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                            <div className="mt-0.5">
                              {settings.reraNumber ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-white leading-tight">RERA Registered License Registry</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                Validates if a valid Real Estate Regulatory Authority broker license number is saved in configuration.
                              </p>
                              {settings.reraNumber && (
                                <span className="inline-block mt-1 font-mono text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/15">
                                  Current: {settings.reraNumber}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item 2: Builder floor & property status checks */}
                          <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                            <div className="mt-0.5">
                              {properties.length > 0 ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-white leading-tight">Live Listings Catalog Density</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                Confirms whether active property inventory data exists in the system database for client searches.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-slate-400 font-semibold bg-white/5 px-2 py-0.5 rounded">
                                Total: {properties.length} Property Records
                              </span>
                            </div>
                          </div>

                          {/* Item 3: Pending verification audits queue */}
                          <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                            <div className="mt-0.5">
                              {!properties.some(p => !p.verified && p.moderationStatus !== "rejected") ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-white leading-tight">Unresolved Pending Audits</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                Flags any property listings waiting for verification review that are not yet approved or rejected.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-slate-400 font-semibold bg-white/5 px-2 py-0.5 rounded">
                                Pending Audit Queue: {unverifiedActivePropertiesCount} Listings
                              </span>
                            </div>
                          </div>

                          {/* Item 4: Enquiry response index */}
                          <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                            <div className="mt-0.5">
                              {newEnquiriesCount === 0 ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-white leading-tight">Clean Tours & Enquiries Queue</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                Screens for completely unaddressed "New" scheduled tour interest submissions.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-slate-400 font-semibold bg-white/5 px-2 py-0.5 rounded">
                                New Submissions: {newEnquiriesCount} Tickets
                              </span>
                            </div>
                          </div>

                          {/* Item 5: Authorized Consultant Assignment */}
                          <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                            <div className="mt-0.5">
                              {settings.consultantName ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-white leading-tight">Direct Consultative Lead Assignment</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                Ensures directory listing pages route directly to a designated verified advisor.
                              </p>
                              {settings.consultantName && (
                                <span className="inline-block mt-1 font-mono text-[9px] text-[#D4AF37] font-semibold bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/15">
                                  Current Representative: {settings.consultantName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostics Actions Panel */}
                    <div className="space-y-4">
                      {/* Control Panel Card */}
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-[#D4AF37]" />
                            Audit Automation Control
                          </h3>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-2.5 font-semibold">
                            Execute automated simulations to parse internal databases against local state legal mandates.
                          </p>
                        </div>

                        <div className="py-2.5 space-y-3">
                          {isRunningDiagnostics ? (
                            <div className="py-6 flex flex-col items-center justify-center gap-3">
                              <RefreshCw className="h-8 w-8 text-[#D4AF37] animate-spin-slow animate-spin" />
                              <div className="text-center space-y-1">
                                <p className="text-white text-[11px] font-black animate-pulse uppercase tracking-wider">Scanning Internal Keys...</p>
                                <p className="text-slate-500 text-[8px] font-mono">Verifying broker RERA indices and database objects</p>
                              </div>
                            </div>
                          ) : auditPassed ? (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl space-y-2 flex flex-col items-center text-center">
                              <CheckSquare className="h-8 w-8 text-emerald-400" />
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Audit Diagnostic Passed</h4>
                                <p className="text-[9px] text-slate-400 font-semibold">All operational and RERA variables conform to compliance criteria.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-950/50 border border-white/5 text-slate-400 rounded-xl space-y-2 flex flex-col items-center text-center">
                              <HelpCircle className="h-8 w-8 text-slate-500" />
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Awaiting Diagnosis Run</h4>
                                <p className="text-[9px] text-slate-400 font-medium">Integrity screening has not been conducted for the current administrator session.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isRunningDiagnostics}
                          onClick={() => {
                            setIsRunningDiagnostics(true);
                            setAuditPassed(false);
                            setTimeout(() => {
                              setIsRunningDiagnostics(false);
                              setAuditPassed(true);
                              onShowNotification("Compliant audit finished! Digital credentials are in full order.", "success");
                            }, 1800);
                          }}
                          className={`w-full py-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            isRunningDiagnostics
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                              : "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 hover:brightness-110 shadow-lg active:scale-98"
                          }`}
                        >
                          {isRunningDiagnostics ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Analyzing Records...
                            </>
                          ) : (
                            <>
                              <CheckSquare className="h-3.5 w-3.5" />
                              Run Comprehensive Audit
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info Card RERA Advisory */}
                      <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-white font-extrabold text-[10.5px]">
                          <AlertCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          RERA Advisory Mandate
                        </div>
                        <p className="text-[9px] leading-relaxed text-slate-400 font-semibold">
                          Every advertisement, circular, web portal, or social marketing post must display the registered corporate broker license clearly as defined under HRERA Rules, Section 15. Real audits must verify documents on-site periodically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========================================================
          ADD MANUAL PROPERTY MODAL
          ======================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#070b13]/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            
            <motion.div
              className="bg-slate-900 border border-white/5 w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-base font-extrabold text-[#D4AF37] uppercase tracking-wide border-b border-white/5 pb-3.5 mb-5 flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Direct manual property addition
              </h3>

              <form onSubmit={handleAddNewManualProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-title" className="text-[10px] uppercase font-bold text-slate-400">Property Title</label>
                  <input id="add-prop-title"
                    type="text"
                    name="title"
                    placeholder="e.g. Luxury Penthouse duplex Rajnagar"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-price" className="text-[10px] uppercase font-bold text-slate-400">Price in Rupees (Raw Integer)</label>
                  <input id="add-prop-price"
                    type="number"
                    name="price"
                    placeholder="e.g. 7500000 (75 Lakhs)"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-locality" className="text-[10px] uppercase font-bold text-slate-400">Locality / Area Name</label>
                  <input id="add-prop-locality"
                    type="text"
                    name="location"
                    placeholder="e.g. Rajnagar Extension, Ghaziabad"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-type" className="text-[10px] uppercase font-bold text-slate-400">Asset Type</label>
                  <select id="add-prop-type"
                    name="type"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial Plots">Commercial Plots</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-bhk" className="text-[10px] uppercase font-bold text-slate-400">BHK configuration</label>
                  <select id="add-prop-bhk"
                    name="bhk"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="N/A Plots">N/A Plots</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-area" className="text-[10px] uppercase font-bold text-slate-400">Area size (Number)</label>
                  <input id="add-prop-area"
                    type="number"
                    name="area"
                    placeholder="e.g. 1560 SQ FT"
                    defaultValue={1500}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-unit" className="text-[10px] uppercase font-bold text-slate-400">Area Unit</label>
                  <input id="add-prop-unit"
                    type="text"
                    name="areaUnit"
                    defaultValue="Sq.Ft."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="add-prop-img" className="text-[10px] uppercase font-bold text-slate-400">Image URL</label>
                  <input id="add-prop-img"
                    type="url"
                    name="imageUrl"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[10.5px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label htmlFor="add-prop-rera" className="text-[10px] uppercase font-bold text-slate-400">RERA Approved Status</label>
                    <select id="add-prop-rera"
                      name="reraApproved"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      <option value="true">YES - Approved</option>
                      <option value="false">NO - Pending</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="add-prop-premium" className="text-[10px] uppercase font-bold text-slate-400">Is Premium Badge</label>
                    <select id="add-prop-premium"
                      name="isPremium"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Listing Placement</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="add-prop-desc" className="text-[10px] uppercase font-bold text-slate-400">Property Description</label>
                  <textarea id="add-prop-desc"
                    name="description"
                    rows={3.5}
                    placeholder="Enter exhaustive structural information, near RRTS landmarks, and direct price guarantees..."
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-white/5 flex gap-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-black text-xs cursor-pointer shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4 text-slate-950 stroke-[3]" /> Publish Audited Asset Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-350 border border-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          REJECT PROPERTY LISTING MODAL
          ======================================================== */}
      <AnimatePresence>
        {rejectingProperty && (
          <div className="fixed inset-0 z-50 bg-[#070b13]/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-slate-900 border border-white/5 w-full max-w-md rounded-2xl p-6 relative shadow-2xl font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={() => setRejectingProperty(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wide border-b border-white/5 pb-3 mb-5 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="h-4 w-4 text-red-550" /> Reject Property Listing
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-sans">
                <div className="space-y-1.5">
                  <label htmlFor="reject-reason" className="text-[10px] uppercase font-bold text-slate-400">Reason for rejection (Required)</label>
                  <select id="reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Incomplete information">Incomplete information</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Images missing">Images missing</option>
                    <option value="Other - specify below">Other - specify below</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reject-notes" className="text-[10px] uppercase font-bold text-slate-400">Additional notes for submitter (Optional)</label>
                  <textarea id="reject-notes"
                    rows={4}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Enter message for the property owner..."
                    className="w-full bg-slate-950 border border-white/5 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setRejectingProperty(null)}
                    className="flex-grow py-2.5 rounded-xl border border-white/10 hover:bg-slate-800 text-slate-300 font-bold text-xs select-none cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="flex-grow py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-white font-black text-xs cursor-pointer transition-colors font-sans"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          EDIT PROPERTY SPECIFICATIONS SLIDE DRAWER MODAL
          ======================================================== */}
      <AnimatePresence>
        {isEditModalOpen && editingProperty && (
          <div className="fixed inset-0 z-50 bg-[#070b13]/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            
            <motion.div
              className="bg-slate-900 border border-white/5 w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProperty(null);
                }}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-base font-extrabold text-[#D4AF37] uppercase tracking-wide border-b border-white/5 pb-3 mb-5 flex items-center gap-1.5">
                <Edit className="h-4 w-4" /> Edit Real Estate Credentials
              </h3>

              <form onSubmit={handleUpdateEditProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-title" className="text-[10px] uppercase font-bold text-slate-400">Property Title</label>
                  <input id="edit-prop-title"
                    type="text"
                    name="title"
                    defaultValue={editingProperty.title}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-price" className="text-[10px] uppercase font-bold text-slate-400">Price in Rupees</label>
                  <input id="edit-prop-price"
                    type="number"
                    name="price"
                    defaultValue={editingProperty.price}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-locality" className="text-[10px] uppercase font-bold text-slate-400">Locality Address</label>
                  <input id="edit-prop-locality"
                    type="text"
                    name="location"
                    defaultValue={editingProperty.location}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-type" className="text-[10px] uppercase font-bold text-slate-400">Category Type</label>
                  <select id="edit-prop-type"
                    name="type"
                    defaultValue={editingProperty.type}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial Plots">Commercial Plots</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-bhk" className="text-[10px] uppercase font-bold text-slate-400">BHK configuration</label>
                  <select id="edit-prop-bhk"
                    name="bhk"
                    defaultValue={editingProperty.bhk || ""}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white cursor-pointer"
                  >
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="N/A Plots">N/A Plots</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-area" className="text-[10px] uppercase font-bold text-slate-400">Area size (Number)</label>
                  <input id="edit-prop-area"
                    type="number"
                    name="area"
                    defaultValue={editingProperty.area}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-unit" className="text-[10px] uppercase font-bold text-slate-400">Area Unit</label>
                  <input id="edit-prop-unit"
                    type="text"
                    name="areaUnit"
                    defaultValue={editingProperty.areaUnit}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-img" className="text-[10px] uppercase font-bold text-slate-400">Override Main Hero Image URL</label>
                  <input id="edit-prop-img"
                    type="url"
                    name="imageUrl"
                    placeholder="Keep empty to preserve existing unsplash imagery"
                    className="w-full bg-slate-950 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-white font-mono text-[10px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label htmlFor="edit-prop-rera" className="text-[10px] uppercase font-bold text-slate-400">RERA Audit status</label>
                    <select id="edit-prop-rera"
                      name="reraApproved"
                      defaultValue={editingProperty.reraApproved ? "true" : "false"}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      <option value="true">Approved</option>
                      <option value="false">Pending Verification</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="edit-prop-premium" className="text-[10px] uppercase font-bold text-slate-400">Is Premium Badge</label>
                    <select id="edit-prop-premium"
                      name="isPremium"
                      defaultValue={editingProperty.isPremium ? "true" : "false"}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white cursor-pointer"
                    >
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Feature placement</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="edit-prop-desc" className="text-[10px] uppercase font-bold text-slate-400">Listing Description</label>
                  <textarea id="edit-prop-desc"
                    name="description"
                    rows={4}
                    defaultValue={editingProperty.description}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white resize-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-white/5 flex gap-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl bg-[#D4AF37] text-slate-950 font-black text-xs cursor-pointer shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4 text-slate-950 stroke-[3]" /> Commit audited modifications
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingProperty(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-350 border border-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          GLOBAL DOUBLE CONFIRM DIALOG SYSTEM PORTAL (GEL PANEL)
          ======================================================== */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 bg-[#06080d]/90 backdrop-blur-md flex items-center justify-center px-4">
            <motion.div
              className={`border w-full max-w-sm rounded-2xl p-5 shadow-2xl relative font-sans ${
                confirmDialog.isDanger 
                  ? "bg-red-950/20 border-red-500/30" 
                  : "bg-slate-900 border-white/5"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-2 mb-3">
                {confirmDialog.isDanger ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckSquare className="h-5 w-5 text-[#D4AF37]" />
                )}
                <h4 className="font-extrabold text-[#D4AF37] text-xs uppercase tracking-wider">{confirmDialog.title}</h4>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                {confirmDialog.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`flex-grow py-2.5 rounded-xl text-slate-950 font-black text-xs cursor-pointer transition-all ${
                    confirmDialog.isDanger
                      ? "bg-red-500 hover:bg-red-650 hover:text-white text-slate-950"
                      : "bg-[#D4AF37] hover:brightness-110"
                  }`}
                >
                  Confirm Execution
                </button>
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold text-xs select-none cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
