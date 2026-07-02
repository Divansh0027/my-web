import { motion } from "motion/react";
import { Mail, Check, X, ExternalLink, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import React, { Suspense } from "react";
const AnalyticsChart = React.lazy(() => import("./AnalyticsChart"));

import { useAdmin } from "../../context/AdminContext";

export default function AdminOverview() {
  const props = useAdmin();
  const { 
    formatCurrency, estimatedRevenue, 
    properties, 
    pendingApprovalsCount, enquiries, dbUsers, approvedListingsCount 
  } = props;

  const pendingProperties = properties.filter(
    (p) => p.moderationStatus === "pending" 
  );

  return (
<>
    <div className="space-y-8 animate-fadeIn">
                  {/* Top Welcome Title */}
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">Executive Dashboard</h1>
                      <p className="text-xs text-on-surface-variant">Shiv Saya Properties listing approvals, direct client requests, and operations.</p>
                    </div>
                    <div className="text-xs bg-surface-container border border-outline-variant/50 py-1.5 px-3 rounded-lg text-on-surface-variant font-medium">
                      Est. Commission: <span className="text-gold-accent font-bold">1% Scale</span>
                    </div>
                  </div>

                  {/* 6 Grid Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Total Properties", value: properties.length.toString(), desc: "Indexed real estate" },
                      { title: "Approved Listings", value: approvedListingsCount.toString(), desc: "Public direct active" },
                      { title: "Pending Approvals", value: pendingApprovalsCount.toString(), desc: "Awaiting physical check", warning: pendingApprovalsCount > 0 },
                      { title: "Client Enquiries", value: enquiries.length.toString(), desc: "Awaiting resolution callback" },
                      { title: "Registered Users", value: dbUsers.length.toString(), desc: "Simulated database logins" },
                      { title: "Est. Revenue (1%)", value: formatCurrency(estimatedRevenue), desc: "Scale value generated" }
                    ].map((metric, i) => (
                      <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="bg-surface-container border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-gold-accent transition-colors"
                      >
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">{metric.title}</span>
                        <div className="my-2.5 flex items-baseline gap-2">
                          <span className="text-lg sm:text-2xl font-black text-on-surface">{metric.value}</span>
                          {metric.warning && (
                            <span className="flex h-2 w-2 rounded-full bg-gold-accent animate-ping"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-outline font-medium leading-tight">{metric.desc}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Split sections: Left Pending items, Right Recent requests */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT PANEL: Pending Approvals Queue */}
                    <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <h3 className="font-extrabold text-on-surface text-sm">Pending Approvals</h3>
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-bold bg-surface px-2 py-0.5 rounded-md">
                          {pendingApprovalsCount} Queue
                        </span>
                      </div>

                      <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                        {pendingProperties.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <ShieldCheck className="h-10 w-10 text-on-surface" />
                            <p className="text-xs text-on-surface-variant font-semibold">All property records verified!</p>
                            <p className="text-[10px] text-outline">Every direct submit has been physically audited.</p>
                          </div>
                        ) : (
                          pendingProperties.map((prop) => (
                            <div 
                              key={prop.id}
                              className="p-3.5 bg-surface/40 rounded-xl border border-outline-variant/50 flex items-center justify-between gap-4 hover:border-outline-variant transition-all"
                            >
                              <div className="min-w-0">
                                <h4 className="font-bold text-on-surface text-xs truncate leading-snug">{prop.title}</h4>
                                <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1.5 font-semibold">
                                  <MapPin className="h-3 w-3 text-gold-accent shrink-0" /> {prop.location}
                                </p>
                                <p className="text-[10px] text-gold-accent font-black mt-0.5">{formatCurrency(prop.price)}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => props.handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                                  className="px-3 py-1.5 rounded-lg bg-gold-accent hover:bg-gold-hover text-[#0F172A] font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="Audit Approved & Publish"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => props.handlePropertyHideToggle(prop)}
                                  className="p-2 rounded-lg bg-surface-container-high hover:bg-red-500/10 border border-outline-variant/50 hover:border-red-500/20 text-on-surface-variant hover:text-red-400 cursor-pointer transition-all"
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
                    <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/50">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gold-accent" />
                          <h3 className="font-extrabold text-on-surface text-sm">Recent Client Inquiries</h3>
                        </div>
                        <button 
                          onClick={() => props.setActiveTab("enquiries")}
                          className="text-[10px] text-gold-accent font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          View All <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                        {enquiries.slice(0, 5).map((enq, idx) => (
                          <div 
                            key={enq.id || `enq-short-${idx}`}
                            className="p-3.5 bg-surface/40 rounded-xl border border-outline-variant/50 space-y-2 hover:border-gold-accent/20 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              <div>
                                <h4 className="font-extrabold text-on-surface text-xs">{enq.name}</h4>
                                <span className="text-[9px] text-outline font-medium">{new Date(enq.dateStr).toLocaleString()}</span>
                              </div>
                              
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                enq.status === "New" 
                                  ? "bg-red-500/15 text-red-400 border border-red-500/10 animate-pulse"
                                  : enq.status === "Contacted"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/10"
                                  : "bg-gold-accent/15 text-gold-accent border border-gold-accent/20"
                              }`}>
                                {enq.status}
                              </span>
                            </div>

                            <p className="text-[10px] text-gold-accent font-bold truncate">Prop: {enq.propertyName}</p>
                            <p className="text-[10px] text-on-surface-variant italic line-clamp-2">"{enq.message}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Activity Chart Reference */}
                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                    <h3 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">Indexed Actions (Overview)</h3>
                    <div className="h-44 w-full">
                      <Suspense fallback={<div className="h-full w-full bg-surface-container animate-pulse rounded-xl" />}><AnalyticsChart type="bar" approvedListingsCount={approvedListingsCount} pendingApprovalsCount={pendingApprovalsCount} enquiriesCount={enquiries.length} usersCount={dbUsers.length} /></Suspense>
                    </div>
                  </div>
                </div>
              
</>
  );
}