import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Plus, Search, Trash2, CheckSquare, Edit, X, Check, MapPin, Building } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function PropertyManagement() {
  const props = useAdmin();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { 
    propertySearch, setPropertySearch, propertyStatusFilter, setPropertyStatusFilter, 
    propertySort, setPropertySort, filteredProperties, selectedProperties, handleSelectProperty, handleBulkApprove, handleBulkHide, handleBulkDelete, setIsAddModalOpen, handlePropertyApprovalToggle, handlePropertyHideToggle, handlePropertyDelete, setEditingProperty, setIsEditModalOpen, formatCurrency
  } = props;

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage]);

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Top bar controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Real Estate Master Index ({filteredProperties.length} records)</h1>
            <p className="text-xs text-on-surface-variant">Search, filter, edit details manually, or process approvals in bulk.</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-accent text-[#0F172A] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-[#0F172A] stroke-[3]" /> Add Manual Property
          </button>
        </div>

        {/* Searching filtering row */}
        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3.5 shadow-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-outline" />
            <label htmlFor="search-listings-input" className="sr-only">Search Listings</label>
            <input id="search-listings-input"
              type="text"
              placeholder="Search listings by title, locality name..."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 focus:border-gold-accent/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-surface p-1 rounded-xl border border-outline-variant/50">
              {["All", "Live", "Pending", "Rejected", "Featured"].map((fState) => (
                <button
                  key={fState}
                  onClick={() => setPropertyStatusFilter(fState)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    propertyStatusFilter === fState
                      ? "bg-surface-container-high text-gold-accent"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {fState}
                </button>
              ))}
            </div>

            <select
              value={propertySort}
              onChange={(e) => setPropertySort(e.target.value)}
              className="bg-surface border border-outline-variant/50 rounded-xl text-[10px] font-bold text-on-surface-variant py-2.5 px-3.5 outline-none focus:border-gold-accent/30 cursor-pointer"
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
            className="bg-surface-container-high/80 border border-gold-accent/30 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-md"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-gold-accent" />
              <span className="text-xs text-on-surface font-bold">{selectedProperties.length} properties selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg bg-gold-accent hover:bg-gold-hover text-[#0F172A] font-black text-[10px] cursor-pointer active:scale-95 transition-all"
              >
                Approve Batch
              </button>
              <button
                onClick={handleBulkHide}
                className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant border border-outline-variant hover:border-outline-variant font-bold text-[10px] cursor-pointer"
              >
                Hide Batch
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-on-surface font-bold text-[10px] cursor-pointer active:scale-95 transition-all flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Erase Batch
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <th className="py-4 px-4 w-12 text-center">
                    <CheckSquare className="h-4 w-4 text-outline inline-block opacity-50" />
                  </th>
                  <th className="py-4 px-4">Title & Locality</th>
                  <th className="py-4 px-4 w-28">Price Scale</th>
                  <th className="py-4 px-4 w-24 text-center">Status</th>
                  <th className="py-4 px-4 w-48 text-center">Panel Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-on-surface-variant">
                {paginatedProperties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-outline font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building className="h-10 w-10 text-on-surface" />
                        <p className="text-xs text-on-surface-variant font-semibold">No properties found</p>
                        <p className="text-[10px] text-outline">Try adjusting your filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProperties.map((prop) => (
                    <tr key={prop.id} className={`transition-all text-xs font-sans ${selectedProperties.includes(prop.id) ? 'bg-gold-accent/5' : 'hover:bg-surface/20'}`}>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(prop.id)}
                          onChange={() => handleSelectProperty(prop.id)}
                          className="rounded border-outline-variant text-gold-accent focus:ring-gold-accent bg-surface cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 min-w-0">
                        <div className="flex items-center gap-3">
                          {prop.imageUrls?.[0] && (
                            <img src={prop.imageUrls?.[0]} alt={prop.title} className="w-12 h-12 rounded-lg object-cover border border-outline-variant/50" />
                          )}
                          <div>
                            <h4 className="font-extrabold text-on-surface leading-normal truncate max-w-[200px] sm:max-w-xs">{prop.title}</h4>
                            <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gold-accent" /> {prop.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-gold-accent">
                        {formatCurrency(prop.price)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold border leading-none uppercase ${
                          prop.moderationStatus === "live"
                            ? "bg-success-green/10 text-success-green border-success-green/20"
                            : prop.moderationStatus === "rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse"
                        }`}>
                          {prop.moderationStatus}
                        </span>
                        {prop.featured && (
                          <span className="block mt-1 text-[8px] text-gold-accent font-bold uppercase">Featured</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePropertyApprovalToggle(prop.id, prop.moderationStatus)}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              prop.moderationStatus === "live"
                                ? "bg-surface text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-high hover:text-on-surface"
                                : "bg-gold-accent hover:bg-gold-hover text-[#0F172A] border-transparent"
                            }`}
                            title={prop.moderationStatus === "live" ? "Revoke Approval" : "Approve Listing"}
                          >
                            {prop.moderationStatus === "live" ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => handlePropertyHideToggle(prop)}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              prop.moderationStatus === "rejected"
                                ? "bg-surface-container-high text-on-surface-variant border-outline-variant/50 hover:bg-surface hover:text-on-surface"
                                : "bg-surface hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 border-outline-variant/50 hover:border-red-500/30"
                            }`}
                            title={prop.moderationStatus === "rejected" ? "Remove Rejection" : "Reject Listing"}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>

                          <div className="w-px h-4 bg-outline-variant/50 mx-0.5"></div>

                          <button
                            onClick={() => { setEditingProperty(prop); setIsEditModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-surface hover:bg-surface-container-high text-gold-accent border border-outline-variant/50 hover:border-gold-accent/30 transition-all cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handlePropertyDelete(prop.id)}
                            className="p-1.5 rounded-lg bg-surface hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 border border-outline-variant/50 hover:border-red-500/30 transition-all cursor-pointer"
                            title="Delete Permanently"
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
          {/* Pagination Controls */}
          {filteredProperties.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-outline-variant/50 p-4 text-xs">
              <span className="text-on-surface-variant">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-surface border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50 text-on-surface cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage * itemsPerPage >= filteredProperties.length}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 bg-surface border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50 text-on-surface cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
