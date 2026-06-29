// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Building, Mail, Users, BarChart3, Settings, Plus, Search, Trash2, Edit, Shield, Download, RefreshCw, Check, X, Phone, MailIcon, ExternalLink, Eye, EyeOff, CheckSquare, Sliders, AlertTriangle, ShieldCheck, Power, HelpCircle, AlertCircle, MapPin, Database } from "lucide-react";

export default function EnquiriesManagement(props: any) {
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
    pendingApprovalsCount, newEnquiriesCount, activeTab, onUpdateProperty, enquiries
  } = props;

  return (
<>
    <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top bar description */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Client Contact Hub ({filteredEnquiries.length} records)</h1>
                      <p className="text-xs text-on-surface-variant">Direct callbacks from interested buyers. Complete tasks, change statuses, or chat on WhatsApp.</p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-gold-accent/30 text-on-surface font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                    >
                      <Download className="h-4 w-4 text-gold-accent" /> Export CSV Sheet
                    </button>
                  </div>

                  {/* Search bar inside enquiries */}
                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-3.5 shadow-md">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-outline" />
                      <label htmlFor="search-enquiries-input" className="sr-only">Search Enquiries</label>
                      <input id="search-enquiries-input"
                        type="text"
                        placeholder="Search enquiries by name, email, or property title..."
                        value={enquirySearch}
                        onChange={(e) => setEnquirySearch(e.target.value)}
                        className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/40 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder-slate-650 outline-none transition-all"
                      />
                    </div>

                    <div className="flex bg-surface p-1 rounded-xl border border-outline-variant/50">
                      {["All", "New", "Contacted", "Resolved"].map((enqFilterOpt) => (
                        <button
                          key={enqFilterOpt}
                          onClick={() => setEnquiryFilter(enqFilterOpt)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            enquiryFilter === enqFilterOpt
                              ? "bg-surface-container-high text-gold-accent"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {enqFilterOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enquiries Grid table list */}
                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface border-b border-outline-variant/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <th className="py-4 px-4 w-48">Client Details</th>
                            <th className="py-4 px-4">Subject Property</th>
                            <th className="py-4 px-4 w-48">Client Request</th>
                            <th className="py-4 px-4 w-32 text-center">Status</th>
                            <th className="py-4 px-4 w-40 text-center">Advisory Tools</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-on-surface-variant">
                          {filteredEnquiries.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-outline font-medium">
                                No client enquiries found matching keywords!
                              </td>
                            </tr>
                          ) : (
                            filteredEnquiries.map((enq, index) => (
                              <tr key={enq.id || `enq-${index}`} className="hover:bg-surface/20 transition-all font-sans">
                                
                                {/* Client stats */}
                                <td className="py-4 px-4 space-y-1">
                                  <h4 className="font-extrabold text-on-surface leading-tight">{enq.name}</h4>
                                  <p className="text-[10px] text-gold-accent font-semibold">{enq.phone}</p>
                                  <p className="text-[10px] text-outline select-all font-medium break-all">{enq.email}</p>
                                  <p className="text-[9px] text-outline-variant">Recd: {new Date(enq.dateStr).toLocaleDateString()}</p>
                                </td>

                                {/* Property connection */}
                                <td className="py-4 px-4 font-bold text-on-surface">
                                  {enq.propertyName}
                                  <p className="text-[10px] text-outline font-medium">ID: {enq.propertyId}</p>
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
                                        : "bg-gold-accent/10 text-success-green border-emerald-500/25 focus:ring-emerald-500"
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
                                      className="p-2 rounded-lg bg-gold-accent/10 hover:bg-gold-accent/20 text-success-green border border-success-green/25 cursor-pointer"
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
                                      className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/10 border border-outline-variant/50 hover:border-red-500/20 text-on-surface-variant hover:text-red-400 cursor-pointer"
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
              
</>
  );
}