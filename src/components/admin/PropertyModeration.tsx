// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Building, Mail, Users, BarChart3, Settings, Plus, Search, Trash2, Edit, Shield, Download, RefreshCw, Check, X, Phone, MailIcon, ExternalLink, Eye, EyeOff, CheckSquare, Sliders, AlertTriangle, ShieldCheck, Power, HelpCircle, AlertCircle, MapPin, Database } from "lucide-react";

export default function PropertyModeration(props: any) {
  const { 
    formatCurrency, estimatedRevenue, 
    propertySearch, setPropertySearch, propertyStatusFilter, setPropertyStatusFilter, 
    propertySort, setPropertySort, filteredProperties, selectedProperties, handleSelectProperty, 
    handleSelectAllProperties, handleExportCSV, handleExportPropertiesJSON, handleFactoryReset, handleBulkApprove, handleBulkHide, handleBulkDelete, setIsAddModalOpen, setEditingProperty, setIsEditModalOpen, 
    setConfirmDialog, executeOperation, onDeleteProperty, onToggleApproval, properties, 
    setRejectingProperty, enquirySearch, setEnquirySearch, enquiryFilter, setEnquiryFilter, 
    filteredEnquiries, handleUpdateEnquiryStatus, handleDeleteEnquiry, userSearch, setUserSearch, 
    filteredUsers, handleToggleBanUser, settings, setSettings, 
    handleSaveSettings, controls, handleToggleControl, adminsList, newAdminEmail, setNewAdminEmail, 
    handleAddAdmin, handleRemoveAdmin, handleClearTestData, isRunningDiagnostics, 
    auditPassed, isLoading, setAuditPassed, setIsRunningDiagnostics, onShowNotification, BUSINESS_CONFIG, 
    pendingApprovalsCount, newEnquiriesCount, activeTab, onUpdateProperty 
  } = props;

  const pendingProperties = properties.filter(
    (p: any) => p.moderationStatus === "pending" || p.status === "pending"
  );

  return (
<>
    <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl text-on-surface font-extrabold tracking-tight">Pending Approvals Queue</h2>
                    <p className="text-xs text-on-surface-variant font-medium">Explicit listing of all records lacking physical validation or compliance audit.</p>
                  </div>

                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface border-b border-outline-variant/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <th className="py-4 px-4 w-12 text-center">#</th>
                            <th className="py-4 px-4">Title & Locality</th>
                            <th className="py-4 px-4 w-32">Price Scale</th>
                            <th className="py-4 px-4 w-28 text-center">Audit Status</th>
                            <th className="py-4 px-4 w-48 text-center">Panel Actions</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-on-surface-variant">
                          {pendingProperties.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-outline font-medium">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <ShieldCheck className="h-10 w-10 text-on-surface" />
                                  <p className="text-xs text-on-surface-variant font-semibold">Queue Clear</p>
                                  <p className="text-[10px] text-outline">No properties are currently pending approval.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            pendingProperties.map((prop, idx) => (
                              <tr key={prop.id} className="hover:bg-surface/20 transition-all text-xs font-sans">
                                {/* Index column */}
                                <td className="py-4 px-4 text-center font-bold text-outline">{idx + 1}</td>

                                {/* Title & locality column */}
                                <td className="py-4 px-4 min-w-0">
                                  <h4 className="font-extrabold text-on-surface leading-normal truncate max-w-sm sm:max-w-md">{prop.title}</h4>
                                  <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gold-accent" /> {prop.location}
                                  </p>
                                </td>

                                {/* Price column */}
                                <td className="py-4 px-4 font-bold text-gold-accent">
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
                                      className="px-3 py-1.5 rounded-lg bg-gold-accent hover:bg-gold-hover text-[#0F172A] font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all focus:ring-2 ring-gold-accent/50"
                                      title="Audit Approve"
                                    >
                                      <Check className="h-3.5 w-3.5" /> Approve
                                    </button>
                                    <button
                                      onClick={() => handlePropertyHideToggle(prop)}
                                      className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-red-500/20 text-on-surface-variant hover:text-red-400 border border-outline-variant/50 hover:border-red-500/30 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
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
              
</>
  );
}