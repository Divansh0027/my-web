import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Plus, X } from 'lucide-react'
import FocusLock from 'react-focus-lock'

export function AddPropertyModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock returnFocus={true}>
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-surface-container border border-outline-variant/50 w-full max-w-2xl rounded-2xl p-6 relative shadow-md font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-base font-extrabold text-gold-accent uppercase tracking-wide border-b border-outline-variant/50 pb-3.5 mb-5 flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Direct manual property addition
              </h2>
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-title"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Property Title
                  </label>
                  <input
                    id="add-prop-title"
                    type="text"
                    name="title"
                    placeholder="e.g. Luxury Penthouse duplex Rajnagar"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-price"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Price in Rupees (Raw Integer)
                  </label>
                  <input
                    id="add-prop-price"
                    type="number"
                    name="price"
                    placeholder="e.g. 7500000 (75 Lakhs)"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-locality"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Locality / Area Name
                  </label>
                  <input
                    id="add-prop-locality"
                    type="text"
                    name="location"
                    placeholder="e.g. Rajnagar Extension, Ghaziabad"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-type"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Asset Type
                  </label>
                  <select
                    id="add-prop-type"
                    name="type"
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer"
                  >
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial Plots">Commercial Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-bhk"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    BHK configuration
                  </label>
                  <select
                    id="add-prop-bhk"
                    name="bhk"
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer"
                  >
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="N/A Plots">N/A Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-area"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Area size (Number)
                  </label>
                  <input
                    id="add-prop-area"
                    type="number"
                    name="area"
                    placeholder="e.g. 1560 SQ FT"
                    defaultValue={1500}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-unit"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Area Unit
                  </label>
                  <input
                    id="add-prop-unit"
                    type="text"
                    name="areaUnit"
                    defaultValue="Sq.Ft."
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="add-prop-img"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Image URL
                  </label>
                  <input
                    id="add-prop-img"
                    type="url"
                    name="imageUrl"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface font-mono text-[10.5px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="add-prop-rera"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      RERA Approved Status
                    </label>
                    <select
                      id="add-prop-rera"
                      name="reraApproved"
                      className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer"
                    >
                      <option value="true">YES - Approved</option>
                      <option value="false">NO - Pending</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="add-prop-premium"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      Is Premium Badge
                    </label>
                    <select
                      id="add-prop-premium"
                      name="isPremium"
                      className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer"
                    >
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Listing Placement</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label
                    htmlFor="add-prop-desc"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Property Description
                  </label>
                  <textarea
                    id="add-prop-desc"
                    name="description"
                    rows={3.5}
                    placeholder="Enter exhaustive structural information, near RRTS landmarks, and direct price guarantees..."
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface resize-none"
                  ></textarea>
                </div>
                <div className="md:col-span-2 pt-4 border-t border-outline-variant/50 flex gap-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl bg-gold-accent text-[var(--on-gold)] font-black text-xs cursor-pointer shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4 text-[var(--on-gold)] stroke-[3]" /> Publish Audited
                    Asset Listing
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  )
}
