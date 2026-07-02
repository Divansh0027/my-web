import { Search } from "lucide-react";

import { useAdmin } from "../../context/AdminContext";

export default function UserManagement() {
  const props = useAdmin();
  const { 
    userSearch, setUserSearch, 
    filteredUsers, handleToggleBanUser
  } = props;

  return (
<>
    <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top info and searching */}
                  <div>
                    <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Simulated User Base ({filteredUsers.length} files)</h1>
                    <p className="text-xs text-on-surface-variant">Suspend offending client accounts or override custom registration privileges instantly.</p>
                  </div>

                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-4 shadow-md relative">
                    <Search className="absolute left-7 top-7 h-4 w-4 text-outline" />
                    <label htmlFor="search-accounts-input" className="sr-only">Search Accounts</label>
                    <input id="search-accounts-input"
                      type="text"
                      placeholder="Search accounts catalog by first/last display name or registration email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder-slate-650 outline-none transition-all"
                    />
                  </div>

                  {/* Users grid table */}
                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto font-sans">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface border-b border-outline-variant/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                            <th className="py-4 px-4">Account User Name</th>
                            <th className="py-4 px-4 w-48">Verified Email</th>
                            <th className="py-4 px-4 w-44">Contact Record</th>
                            <th className="py-4 px-4 w-28 text-center">Platform Status</th>
                            <th className="py-4 px-4 w-36 text-center">Status Action</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-xs text-on-surface-variant">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-outline">
                                No registered user accounts match search filter.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((usr) => (
                              <tr key={usr.uid} className="hover:bg-surface/20 transition-all">
                                
                                <td className="py-4 px-4 font-extrabold text-on-surface flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-surface-container-high text-gold-accent font-black text-xs flex items-center justify-center uppercase border border-outline-variant/50">
                                    {(usr.displayName || "?").charAt(0)}
                                  </div>
                                  <div>
                                    {usr.displayName}
                                    <span className="block text-[8px] text-outline font-mono">UID: {usr.uid}</span>
                                  </div>
                                </td>

                                <td className="py-4 px-4 select-all text-on-surface-variant font-medium">
                                  {usr.email}
                                </td>

                                <td className="py-4 px-4 text-on-surface-variant">
                                  {usr.phoneNumber || "---"}
                                </td>

                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase leading-none border ${
                                    usr.banned === true
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-gold-accent/10 text-success-green border-emerald-500/20 animate-none"
                                  }`}>
                                    {usr.banned === true ? "Suspended" : "Active"}
                                  </span>
                                </td>

                                {/* Suspend/Ban button */}
                                <td className="py-4 px-4 text-center">
                                  {usr.banned === true ? (
                                    <button
                                      onClick={() => handleToggleBanUser(usr.uid, true)}
                                      className="px-3 py-1.5 rounded-lg bg-gold-accent/10 hover:bg-gold-accent/25 hover:text-on-surface text-success-green border border-emerald-500/25 cursor-pointer font-bold text-[10px]"
                                    >
                                      Reactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleBanUser(usr.uid, false)}
                                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 hover:text-on-surface text-red-450 border border-red-500/25 cursor-pointer font-bold text-[10px]"
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
              
</>
  );
}