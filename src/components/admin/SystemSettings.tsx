import { Trash2, Download, Sliders, ShieldCheck, Power, Database } from "lucide-react";

import { useAdmin } from "../../context/AdminContext";

export default function SystemSettings() {
  const props = useAdmin();
  const { 
    handleExportCSV, handleExportPropertiesJSON, handleFactoryReset, settings, setSettings, 
    handleSaveSettings, controls, handleToggleControl, adminsList, newAdminEmail, setNewAdminEmail, 
    handleAddAdmin, handleRemoveAdmin, handleClearTestData 
  } = props;

  return (
<>
    <div className="space-y-6 animate-fadeIn md:text-left text-xs text-on-surface-variant">
                  
                  <div>
                    <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Hub General Settings</h1>
                    <p className="text-xs text-on-surface-variant">Modify global credentials list, toggle simulated variables, or reset database snapshots.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* SECTION 1: EDIT CONFIG */}
                    <form onSubmit={handleSaveSettings} className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-outline-variant/50">
                        <Sliders className="h-4 w-4 text-gold-accent" />
                        <h3 className="font-extrabold text-on-surface text-sm">Site Business Information</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="auto-adminview-1744" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Business Name</label>
                          <input id="auto-adminview-1744"
                            type="text"
                            value={settings.businessName}
                            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-rera" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">RERA Number</label>
                          <input id="admin-settings-rera"
                            type="text"
                            value={settings.reraNumber}
                            onChange={(e) => setSettings({ ...settings, reraNumber: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-consultant" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Consultant Lead</label>
                          <input id="admin-settings-consultant"
                            type="text"
                            value={settings.consultantName}
                            onChange={(e) => setSettings({ ...settings, consultantName: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-whatsapp" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">WhatsApp Target</label>
                          <input id="admin-settings-whatsapp"
                            type="text"
                            value={settings.whatsappNumber}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-email" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Official Email</label>
                          <input id="admin-settings-email"
                            type="email"
                            value={settings.businessEmail}
                            onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="admin-settings-phone" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Office Phone</label>
                          <input id="admin-settings-phone"
                            type="text"
                            value={settings.businessPhone}
                            onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                            className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="admin-settings-addr" className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Office Headquarters Physical Address</label>
                        <input id="admin-settings-addr"
                          type="text"
                          value={settings.businessAddress}
                          onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                          className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/50 rounded-xl px-3 py-2 text-xs text-on-surface"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2.5 py-3 rounded-xl bg-gold-accent text-[#0F172A] font-black cursor-pointer shadow active:scale-98 hover:bg-gold-hover hover:scale-105 shadow-md transition-all font-sans"
                      >
                        Apply Dynamic Parameters Settings
                      </button>
                    </form>

                    {/* RIGHT COLUMN SETTINGS: ADMIN ACCESS & TOGGLES */}
                    <div className="space-y-6">
                      
                      {/* SECTION 2: ADMIN ACCESS EMAILS */}
                      <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/50">
                          <ShieldCheck className="h-4 w-4 text-gold-accent" />
                          <h3 className="font-extrabold text-on-surface text-sm">Admin Access list</h3>
                        </div>

                        <form onSubmit={handleAddAdmin} className="flex gap-2">
                          <label htmlFor="new-admin-email" className="sr-only">Add new admin email</label>
                          <input id="new-admin-email"
                            type="email"
                            placeholder="Add new admin email (e.g. ritik@shivsaya...)"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="flex-grow bg-surface border border-outline-variant/50 focus:border-gold-accent/30 rounded-xl px-3 py-2 text-xs text-on-surface placeholder-slate-600 outline-none"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-surface-container-high hover:bg-outline-variant hover:text-on-surface border border-outline-variant/50 hover:border-gold-accent/20 text-on-surface px-3.5 rounded-xl font-bold text-xs"
                          >
                            Add
                          </button>
                        </form>
                        <p className="text-[10px] text-outline italic mt-1 mb-2 leading-tight">
                          If the user hasn't signed up yet, their admin access will activate automatically when they first log in.
                        </p>

                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {adminsList.map((adm) => (
                            <div key={adm} className="flex items-center justify-between p-2 rounded-xl bg-surface/40 border border-outline-variant/50 text-[11px] font-mono select-all">
                              <span>{adm}</span>
                              <button
                                onClick={() => handleRemoveAdmin(adm)}
                                className="text-outline hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                                title="Strip admin privileges"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: SYSTEM CONTROLS/TOGGLES */}
                      <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/50">
                          <Power className="h-4 w-4 text-gold-accent" />
                          <h3 className="font-extrabold text-on-surface text-sm">System Controls</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: "offlineMaintenance", label: "Maintenance", desc: "Block frontend routing" },
                            { key: "slowOperations", label: "Slow Ops (1s)", desc: "Simulate throttle latency" },
                            { key: "showWhatsappFloating", label: "WhatsApp Btn", desc: "Floating help widget" },
                            { key: "autoApproveListings", label: "Auto Approve", desc: "Skip admin audit checks" }
                          ].map(ctl => {
                            const isChecked = controls[ctl.key];
                            return (
                              <div key={ctl.key} className="p-3 bg-slate-955/40 border border-outline-variant/50 rounded-xl flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-extrabold text-on-surface block text-[10.5px] leading-snug">{ctl.label}</span>
                                  <span className="text-[8.5px] text-outline mt-0.5 block leading-none font-medium">{ctl.desc}</span>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleControl(ctl.key)}
                                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-gold-accent focus:ring-offset-1 focus:ring-offset-slate-900 ${
                                    isChecked ? "bg-gold-accent" : "bg-surface-container-high"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow ring-0 transition duration-200 ease-in-out ${
                                      isChecked ? "translate-x-5" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* SECTION 4: DESTRUCTIVE CLEAN ACTIONS */}
                        <div className="pt-2 border-t border-outline-variant/50">
                          <button
                            onClick={handleFactoryReset}
                            className="bg-red-950 hover:bg-red-900 text-red-100 border border-red-500/15 leading-none py-3 px-4 rounded-xl text-center font-bold font-mono tracking-wide text-[10.5px] w-full block transition-colors cursor-pointer"
                          >
                            Factory default Purge Storage
                          </button>
                        </div>
                      </div>

                      {/* DATA MANAGEMENT SECTION */}
                      <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/50">
                          <Database className="h-4 w-4 text-gold-accent" />
                          <h3 className="font-extrabold text-on-surface text-sm">Data Management</h3>
                        </div>

                        <div className="space-y-2.5">
                          <button
                            type="button"
                            onClick={handleExportPropertiesJSON}
                            className="w-full py-2.5 rounded-xl bg-surface hover:bg-slate-850 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-gold-accent" /> Export All Properties (JSON)
                          </button>

                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="w-full py-2.5 rounded-xl bg-surface hover:bg-slate-850 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-gold-accent" /> Export All Enquiries as CSV
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
              
</>
  );
}