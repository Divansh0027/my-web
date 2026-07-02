/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Building, Mail, Users, BarChart3, Settings,
  Shield, 
  RefreshCw, Mail as CheckSquare
} from "lucide-react";
import { AdminTabProps, Property, EnquiryRecord, AdminTab, AdminSettings, ClientUser } from "../types";
import { useConfig } from "../context/ConfigContext";
import { 
  ADMIN_EMAILS, 
  addRemoteAdmin, 
  removeRemoteAdmin, 
  updateRemoteControls, 
  updateRemoteSettings,
  dbInstance
} from "../firebase";
import { doc, Firestore, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import AdminOverview from "./admin/AdminOverview";
import PropertyManagement from "./admin/PropertyManagement";
import PropertyModeration from "./admin/PropertyModeration";
import EnquiriesManagement from "./admin/EnquiriesManagement";
import UserManagement from "./admin/UserManagement";
import AnalyticsPanel from "./admin/AnalyticsPanel";
import SystemSettings from "./admin/SystemSettings";
import DiagnosticsPanel from "./admin/DiagnosticsPanel";
import {
  AddPropertyModal,
  RejectPropertyModal,
  EditPropertyModal,
  ConfirmDialogModal,
} from "./admin/modals/AdminModals";

import { AdminProvider } from "../context/AdminContext";

interface AdminViewProps {
  currentUser?: ClientUser | null;
  isAdmin?: boolean;
      properties: Property[];
  onToggleApproval: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateProperty: (updated: Property) => void;
  onAddProperty: (newProp: Property) => void;
  onShowNotification: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AdminView({
  properties,
  onToggleApproval,
  onDeleteProperty,
  onUpdateProperty,
  onAddProperty,
  onShowNotification
}: AdminViewProps) {
  
  
  
  const BUSINESS_CONFIG = useConfig();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);

  // Users state
  const [dbUsers, setDbUsers] = useState<ClientUser[]>([]);

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

  // filter, sorting, and modal states
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
            email: "rahul.sharma@example.com",
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
            email: "amitkhari90@example.com",
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
            email: "rohit.d@example.com",
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
            email: "kabir.realty@example.com",
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
      const updated = enquiries.map((e: any) => e.id === id ? { ...e, status: newStatus } : e);
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
          const updated = enquiries.filter((e: any) => e.id !== id);
          setEnquiries(updated);
          localStorage.setItem("ssp_simulated_enquiries", JSON.stringify(updated));
        }, "Enquiry record successfully deleted");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportCSV = () => {
    try {
      // Create CSV structure
      const headers = ["ID", "Name", "Phone", "Email", "Property Title", "Message", "Date", "Status"];
      const rows = enquiries.map((e: any) => [
        e.id,
        `"${e.name.replace(/"/g, '""')}"`,
        e.phone,
        e.email,
        `"${e.propertyName.replace(/"/g, '""')}"`,
        `"${e.message.replace(/"/g, '""')}"`,
        e.dateStr,
        e.status
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // USER / BAN ACTIONS
  // ----------------------------------------------------
  const handleToggleBanUser = async (uid: string, currentBanState: boolean) => {
    const userObj = dbUsers.find((u: any) => u.uid === uid);
    if (!userObj) return;

    setConfirmDialog({
      isOpen: true,
      title: `${currentBanState ? "Lift Suspension" : "Suspend User Account"}`,
      message: currentBanState 
        ? `Are you sure you want to restore access for ${userObj.displayName}? Their direct listings will remain hidden until manually approved.`
        : `Are you sure you want to suspend ${userObj.displayName}? This will lock them out of the platform and automatically hide ALL their properties immediately list-wide.`,
      isDanger: !currentBanState,
      onConfirm: async () => {
        executeOperation(async () => {
          if (dbInstance) {
            try {
              const batch = writeBatch(dbInstance as Firestore);
              
              // 1. Update user document
              const userRef = doc(dbInstance as Firestore, "users", uid);
              batch.update(userRef, { banned: !currentBanState });
              
              // 2. Hide or restore user properties
              const propsQuery = query(collection(dbInstance as Firestore, "properties"), where("userId", "==", uid));
              const querySnapshot = await getDocs(propsQuery);
              querySnapshot.forEach((propertyDoc) => {
                batch.update(propertyDoc.ref, {
                  moderationStatus: !currentBanState ? "rejected" : "live",
                  rejectionReason: !currentBanState ? "Owner suspended" : ""
                });
              });
              
              await batch.commit();
              
              // Toggle user ban status locally
              const updatedUsers = dbUsers.map((u: any) => u.uid === uid ? { ...u, banned: !currentBanState } : u);
              setDbUsers(updatedUsers);
              localStorage.setItem("ssp_simulated_db_users", JSON.stringify(updatedUsers));

              // Local state update for properties
              if (!currentBanState && userObj.email) {
                properties.forEach((prop: Property) => {
                  if (prop.postedBy?.toLowerCase() === userObj.email.toLowerCase() || prop.userId === uid) {
                    if (prop.moderationStatus !== "rejected") {
                      onUpdateProperty({
                        ...prop,
                        moderationStatus: "rejected",
                        rejectionReason: "Owner suspended"
                      });
                    }
                  }
                });
              }
              onShowNotification(`User account suspension state toggled.`, "success");
            } catch (err: unknown) {
              onShowNotification(`Database write failed: ${(err as any).message}`, "error");
            }
          }
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
      onShowNotification("Core settings updated successfully!", "success");
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

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    if (adminsList.map((a: string) => a.toLowerCase()).includes(cleanEmail)) {
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

  const handleRemoveAdmin = (emailToRemove: string) => {
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
          const newList = adminsList.filter((e: any) => e.toLowerCase() !== emailToRemove.toLowerCase());
          setAdminsList(newList);
          await removeRemoteAdmin(emailToRemove);
        }, "Administrator access revoked successfully");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
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
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
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
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
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
    const matchedProp = properties.find((p: any) => p.id === id);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Real Estate Listing",
      message: `Are you absolutely sure you want to permanently delete "${matchedProp?.title || 'this property'}"? This clears all customer linkages and details.`,
      isDanger: true,
      onConfirm: () => {
        executeOperation(() => {
          onDeleteProperty(id);
          setSelectedProperties((prev) => prev.filter((pId) => pId !== id));
        }, "Property listing permanently erased from core");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // BULK MANIPULATIONS ON TABLE
  // ----------------------------------------------------
  const handleSelectAllProps = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredPropertiesings.map((p: any) => p.id);
      setSelectedProperties(visibleIds);
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProp = (id: string, checked?: boolean) => {
    if (checked) {
      setSelectedProperties((prev) => [...prev, id]);
    } else {
      setSelectedProperties((prev) => prev.filter((pId) => pId !== id));
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
          selectedProperties.forEach((id: string) => {
            const found = properties.find((p: any) => p.id === id);
            if (found && found.moderationStatus !== "live") {
              onToggleApproval(id);
            }
          });
          setSelectedProperties([]);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
          selectedProperties.forEach((id: string) => {
            const found = properties.find((p: any) => p.id === id);
            if (found && found.moderationStatus !== "rejected") {
              onUpdateProperty({ ...found, moderationStatus: "rejected" });
            }
          });
          setSelectedProperties([]);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
          selectedProperties.forEach((id: string) => {
            onDeleteProperty(id);
          });
          setSelectedProperties([]);
        }, `Batch purge complete for ${selectedProperties.length} items`);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
  const filteredPropertiesings = useMemo(() => properties.filter((p: any) => {
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

  const handleSelectProperty = (id: string) => {
    setSelectedProperties((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAllProperties = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProperties(sortedListings.map((p) => p.id));
    } else {
      setSelectedProperties([]);
    }
  };

  // 2. Enquiries filters
  const filteredEnquiries = useMemo(() => enquiries.filter((e: any) => {
    const matchesSearch = e.name.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                          e.email.toLowerCase().includes(enquirySearch.toLowerCase()) ||
                          e.propertyName.toLowerCase().includes(enquirySearch.toLowerCase());
    if (enquiryFilter !== "All") {
      return matchesSearch && e.status === enquiryFilter;
    }
    return matchesSearch;
  }), [enquiries, enquirySearch, enquiryFilter]);

  // 3. User filters
  const filteredUsers = useMemo(() => dbUsers.filter((u: any) => {
    return u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
           u.email.toLowerCase().includes(userSearch.toLowerCase());
  }), [dbUsers, userSearch]);

  // 4. Stat counting variables
  const pendingProperties = useMemo(() => properties.filter((p: any) => p.moderationStatus === "pending"), [properties]);
  const approvedListingsCount = useMemo(() => properties.filter((p: any) => p.moderationStatus === "live").length, [properties]);
  const pendingApprovalsCount = pendingProperties.length;
  
  // FLAT RATE of 1% commission on all approved "Buy" (sale) properties for "Estimated Revenue"
  const totalApprovedSalesValue = useMemo(() => properties
    .filter((p: any) => p.moderationStatus === "live" && (!p.transactionType || p.transactionType === "Buy"))
    .reduce((sum, p) => sum + p.price, 0), [properties]);
  const estimatedRevenue = Math.round(totalApprovedSalesValue * 0.01);

  // Derived metrics for analytics tab
  const threeBhkCount = useMemo(() => properties.filter((p: any) => String(p.bhk || "").includes("3 BHK") || String(p.bhk || "").includes("3")).length, [properties]);
  const villaCount = useMemo(() => properties.filter((p: any) => String(p.type || "").toLowerCase().includes("villa")).length, [properties]);
  const commercialCount = useMemo(() => properties.filter((p: any) => String(p.type || "").toLowerCase().includes("plot") || String(p.type || "").toLowerCase().includes("office") || String(p.type || "").toLowerCase().includes("commercial")).length, [properties]);
  const standardFlatsCount = useMemo(() => properties.filter((p: any) => String(p.bhk || "").includes("1 BHK") || String(p.bhk || "").includes("2 BHK") || String(p.bhk || "").includes("1") || String(p.bhk || "").includes("2")).length, [properties]);
  const newEnquiriesCount = useMemo(() => enquiries.filter((e: any) => e.status === "New").length, [enquiries]);
  const contactedEnquiriesCount = useMemo(() => enquiries.filter((e: any) => e.status === "Contacted").length, [enquiries]);
  const resolvedEnquiriesCount = useMemo(() => enquiries.filter((e: any) => e.status === "Resolved").length, [enquiries]);
  

  // Formatting currency in Rupee (Cr / Lakh) formats beautifully
  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };


    const adminTabProps: AdminTabProps = {
  settings, setSettings, setEnquirySearch, setEnquiryFilter, setUserSearch,
  handleUpdateEnquiryStatus, handleDeleteEnquiry, handleToggleBanUser,
  filteredEnquiries, filteredUsers, setRejectingProperty, enquirySearch, enquiryFilter, userSearch,
  formatCurrency, estimatedRevenue, 
  propertySearch, setPropertySearch, propertyStatusFilter, setPropertyStatusFilter, 
  propertySort, setPropertySort, filteredProperties: sortedListings, selectedProperties, handleSelectProperty, 
  handleSelectAllProperties, handleExportCSV, handleExportPropertiesJSON, handleFactoryReset, handleBulkApprove, handleBulkHide, handleBulkDelete, setIsAddModalOpen, setEditingProperty, setIsEditModalOpen, 
  setConfirmDialog, executeOperation, onDeleteProperty, onToggleApproval, properties, handlePropertyApprovalToggle, handlePropertyHideToggle, handlePropertyDelete, handleSelectAllProps, handleSelectProp,  handleSaveSettings, controls, handleToggleControl, adminsList, newAdminEmail, setNewAdminEmail, 
  handleAddAdmin, handleRemoveAdmin, handleClearTestData, isRunningDiagnostics, 
  auditPassed, isLoading, setAuditPassed, setIsRunningDiagnostics, onShowNotification, BUSINESS_CONFIG,
  pendingApprovalsCount, newEnquiriesCount, activeTab, setActiveTab, onUpdateProperty, enquiries, dbUsers, approvedListingsCount, threeBhkCount, villaCount, commercialCount, standardFlatsCount, contactedEnquiriesCount, resolvedEnquiriesCount
};

  return (
    <div className="font-sans text-on-surface bg-surface min-h-screen pt-24 pb-16 flex flex-col md:flex-row">
      
      {/* ----------------- SIDEBAR CONTAINER ----------------- */}
      <aside className="w-full md:w-64 shrink-0 bg-surface-container border-b md:border-b-0 md:border-r border-outline-variant/50 p-5 flex flex-col md:sticky md:top-24 md:h-[calc(100vh-140px)]">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Shield className="h-6 w-6 text-gold-accent" />
          <div>
            <h2 className="font-bold text-on-surface text-base">Control Hub</h2>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-wide">SHIV SAYA ADVISORY</p>
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
                    ? "bg-gold-accent/10 text-gold-accent border border-gold-accent/20 font-bold" 
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent"
                }`}
              >
                <TabIcon className={`h-4 w-4 ${isSelected ? "text-gold-accent" : "text-on-surface-variant"}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-on-surface font-bold text-[9px] min-w-4 text-center">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* System parameters indicator */}
        <div className="hidden md:block mt-auto bg-surface/50 rounded-xl p-3.5 border border-outline-variant/50">
          <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wide">
            <span>Container Status</span>
            <span className="h-2 w-2 rounded-full bg-gold-accent animate-pulse"></span>
          </div>
          <p className="text-[10px] text-outline font-mono leading-relaxed">
            API Sync: Active<br />
            SimLoader: {controls.slowOperations ? "1000ms" : "0ms"}<br />
            Admins: {adminsList.length} Accounts
          </p>
        </div>
      </aside>

      {/* ----------------- CORE PANELS HUB ----------------- */}
      <AdminProvider value={adminTabProps}>
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
                <RefreshCw className="h-10 w-10 text-gold-accent animate-spin" />
                <p className="text-xs text-on-surface-variant font-semibold tracking-wide">Syncing server variables...</p>
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
                {activeTab === "overview" && <AdminOverview />}
                {activeTab === "properties" && <PropertyManagement />}
                {activeTab === "pending_approvals" && <PropertyModeration />}
                {activeTab === "enquiries" && <EnquiriesManagement />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "analytics" && <AnalyticsPanel />}
                {activeTab === "settings" && <SystemSettings />}
                {activeTab === "checklist" && <DiagnosticsPanel />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </AdminProvider>

      {/* ========================================================
          MODALS
          ======================================================== */}
      <AddPropertyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddNewManualProperty} 
      />

      <RejectPropertyModal 
        property={rejectingProperty} 
        reason={rejectReason} 
        notes={rejectNotes} 
        onReasonChange={setRejectReason} 
        onNotesChange={setRejectNotes} 
        onClose={() => setRejectingProperty(null)} 
        onConfirm={handleConfirmReject} 
      />

      <EditPropertyModal 
        isOpen={isEditModalOpen} 
        property={editingProperty} 
        onClose={() => { setIsEditModalOpen(false); setEditingProperty(null); }} 
        onSubmit={handleUpdateEditProperty} 
      />

      <ConfirmDialogModal 
        isOpen={confirmDialog.isOpen} 
        title={confirmDialog.title} 
        message={confirmDialog.message} 
        isDanger={!!confirmDialog.isDanger} 
        onConfirm={confirmDialog.onConfirm} 
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
      />

    </div>
  );
}
