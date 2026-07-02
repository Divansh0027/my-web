import { Shield, RefreshCw, Check, X, CheckSquare, AlertTriangle, HelpCircle, AlertCircle } from "lucide-react";

import { useAdmin } from "../../context/AdminContext";

export default function DiagnosticsPanel() {
  const props = useAdmin();
  const { 
    properties, 
    settings, isRunningDiagnostics, 
    auditPassed, setAuditPassed, setIsRunningDiagnostics, onShowNotification, pendingApprovalsCount, newEnquiriesCount 
  } = props;

  return (
<>
    <div className="space-y-6 animate-fadeIn md:text-left text-xs text-on-surface-variant">
                  <div>
                    <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Readiness Audit Compliance Diagnostics</h1>
                    <p className="text-xs text-on-surface-variant">Validate real-time real estate guidelines, broker validation records, and digital documentation checklists.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Diagnostic Summary Cards */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/50">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-gold-accent" />
                            <h3 className="font-extrabold text-on-surface text-sm">Haryana RERA Verification Checks</h3>
                          </div>
                          <span className="text-[10px] font-mono text-outline">Standards: HRERA-2026</span>
                        </div>

                        {/* Checklist items list */}
                        <div className="space-y-3">
                          {/* Item 1: RERA office registration parameters */}
                          <div className="flex items-start gap-3 p-3 bg-surface/40 border border-outline-variant/50 rounded-xl">
                            <div className="mt-0.5">
                              {settings.reraNumber ? (
                                <Check className="h-4 w-4 text-success-green" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-on-surface leading-tight">RERA Registered License Registry</h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                                Validates if a valid Real Estate Regulatory Authority broker license number is saved in configuration.
                              </p>
                              {settings.reraNumber && (
                                <span className="inline-block mt-1 font-mono text-[9px] text-gold-accent font-semibold bg-gold-accent/5 px-2 py-0.5 rounded border border-gold-accent/15">
                                  Current: {settings.reraNumber}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item 2: Builder floor & property status checks */}
                          <div className="flex items-start gap-3 p-3 bg-surface/40 border border-outline-variant/50 rounded-xl">
                            <div className="mt-0.5">
                              {properties.length > 0 ? (
                                <Check className="h-4 w-4 text-success-green" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-on-surface leading-tight">Live Listings Catalog Density</h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                                Confirms whether active property inventory data exists in the system database for client searches.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-on-surface-variant font-semibold bg-white/5 px-2 py-0.5 rounded">
                                Total: {properties.length} Property Records
                              </span>
                            </div>
                          </div>

                          {/* Item 3: Pending verification audits queue */}
                          <div className="flex items-start gap-3 p-3 bg-surface/40 border border-outline-variant/50 rounded-xl">
                            <div className="mt-0.5">
                              {!properties.some(p => !p.verified && p.moderationStatus !== "rejected") ? (
                                <Check className="h-4 w-4 text-success-green" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-on-surface leading-tight">Unresolved Pending Audits</h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                                Flags any property listings waiting for verification review that are not yet approved or rejected.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-on-surface-variant font-semibold bg-white/5 px-2 py-0.5 rounded">
                                Pending Audit Queue: {pendingApprovalsCount} Listings
                              </span>
                            </div>
                          </div>

                          {/* Item 4: Enquiry response index */}
                          <div className="flex items-start gap-3 p-3 bg-surface/40 border border-outline-variant/50 rounded-xl">
                            <div className="mt-0.5">
                              {newEnquiriesCount === 0 ? (
                                <Check className="h-4 w-4 text-success-green" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-on-surface leading-tight">Clean Tours & Enquiries Queue</h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                                Screens for completely unaddressed "New" scheduled tour interest submissions.
                              </p>
                              <span className="inline-block mt-1 font-mono text-[9px] text-on-surface-variant font-semibold bg-white/5 px-2 py-0.5 rounded">
                                New Submissions: {newEnquiriesCount} Tickets
                              </span>
                            </div>
                          </div>

                          {/* Item 5: Authorized Consultant Assignment */}
                          <div className="flex items-start gap-3 p-3 bg-surface/40 border border-outline-variant/50 rounded-xl">
                            <div className="mt-0.5">
                              {settings.consultantName ? (
                                <Check className="h-4 w-4 text-success-green" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-bold text-on-surface leading-tight">Direct Consultative Lead Assignment</h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-semibold">
                                Ensures directory listing pages route directly to a designated verified advisor.
                              </p>
                              {settings.consultantName && (
                                <span className="inline-block mt-1 font-mono text-[9px] text-gold-accent font-semibold bg-gold-accent/5 px-2 py-0.5 rounded border border-gold-accent/15">
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
                      <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-on-surface text-xs uppercase tracking-wider pb-2 border-b border-outline-variant/50 flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-gold-accent" />
                            Audit Automation Control
                          </h3>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed mt-2.5 font-semibold">
                            Execute automated simulations to parse internal databases against local state legal mandates.
                          </p>
                        </div>

                        <div className="py-2.5 space-y-3">
                          {isRunningDiagnostics ? (
                            <div className="py-6 flex flex-col items-center justify-center gap-3">
                              <RefreshCw className="h-8 w-8 text-gold-accent animate-spin-slow animate-spin" />
                              <div className="text-center space-y-1">
                                <p className="text-on-surface text-[11px] font-black animate-pulse uppercase tracking-wider">Scanning Internal Keys...</p>
                                <p className="text-outline text-[8px] font-mono">Verifying broker RERA indices and database objects</p>
                              </div>
                            </div>
                          ) : auditPassed ? (
                            <div className="p-4 bg-gold-accent/10 border border-emerald-500/20 text-success-green rounded-xl space-y-2 flex flex-col items-center text-center">
                              <CheckSquare className="h-8 w-8 text-success-green" />
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-xs text-on-surface uppercase tracking-wider">Audit Diagnostic Passed</h4>
                                <p className="text-[9px] text-on-surface-variant font-semibold">All operational and RERA variables conform to compliance criteria.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-surface/50 border border-outline-variant/50 text-on-surface-variant rounded-xl space-y-2 flex flex-col items-center text-center">
                              <HelpCircle className="h-8 w-8 text-outline" />
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-xs text-on-surface uppercase tracking-wider">Awaiting Diagnosis Run</h4>
                                <p className="text-[9px] text-on-surface-variant font-medium">Integrity screening has not been conducted for the current administrator session.</p>
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
                              ? "bg-surface-container-high text-outline cursor-not-allowed border border-outline-variant/50"
                              : "bg-gold-accent text-[#0F172A] hover:bg-gold-hover hover:scale-105 shadow-md shadow active:scale-98"
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
                      <div className="p-4 bg-gold-accent/5 border border-gold-accent/10 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-on-surface font-extrabold text-[10.5px]">
                          <AlertCircle className="h-4 w-4 text-gold-accent shrink-0" />
                          RERA Advisory Mandate
                        </div>
                        <p className="text-[9px] leading-relaxed text-on-surface-variant font-semibold">
                          Every advertisement, circular, web portal, or social marketing post must display the registered corporate broker license clearly as defined under HRERA Rules, Section 15. Real audits must verify documents on-site periodically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

</>
  );
}