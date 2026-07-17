import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Edit, X } from 'lucide-react'
import { Property } from '@/shared/types/types'
import FocusLock from 'react-focus-lock'

export function EditPropertyModal({
  isOpen,
  property,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  property: Property | null
  onClose: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <AnimatePresence>
      {isOpen && property && (
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
              <h2 className="text-base font-extrabold text-gold-accent uppercase tracking-wide border-b border-outline-variant/50 pb-3 mb-5 flex items-center gap-1.5">
                <Edit className="h-4 w-4" /> Edit Real Estate Credentials
              </h2>
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-title"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Property Title
                  </label>
                  <input
                    id="edit-prop-title"
                    type="text"
                    name="title"
                    defaultValue={property.title}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-price"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Price in Rupees
                  </label>
                  <input
                    id="edit-prop-price"
                    type="number"
                    name="price"
                    defaultValue={property.price}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-locality"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Locality Address
                  </label>
                  <input
                    id="edit-prop-locality"
                    type="text"
                    name="location"
                    defaultValue={property.location}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-type"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Category Type
                  </label>
                  <select
                    id="edit-prop-type"
                    name="type"
                    defaultValue={property.type}
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
                    htmlFor="edit-prop-bhk"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    BHK configuration
                  </label>
                  <select
                    id="edit-prop-bhk"
                    name="bhk"
                    defaultValue={property.bhk || ''}
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
                    htmlFor="edit-prop-area"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Area size (Number)
                  </label>
                  <input
                    id="edit-prop-area"
                    type="number"
                    name="area"
                    defaultValue={property.area}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-unit"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Area Unit
                  </label>
                  <input
                    id="edit-prop-unit"
                    type="text"
                    name="areaUnit"
                    defaultValue={property.areaUnit}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-prop-img"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Override Main Hero Image URL
                  </label>
                  <input
                    id="edit-prop-img"
                    type="url"
                    name="imageUrl"
                    placeholder="Keep empty to preserve existing unsplash imagery"
                    className="w-full bg-surface border border-gold-accent/20 rounded-xl px-3.5 py-2.5 text-on-surface font-mono text-[10px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-prop-rera"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      RERA Audit status
                    </label>
                    <select
                      id="edit-prop-rera"
                      name="reraApproved"
                      defaultValue={property.reraApproved ? 'true' : 'false'}
                      className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer"
                    >
                      <option value="true">Approved</option>
                      <option value="false">Pending Verification</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="edit-prop-premium"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      Is Premium Badge
                    </label>
                    <select
                      id="edit-prop-premium"
                      name="isPremium"
                      defaultValue={property.isPremium ? 'true' : 'false'}
                      className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer"
                    >
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Feature placement</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label
                    htmlFor="edit-prop-desc"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Listing Description
                  </label>
                  <textarea
                    id="edit-prop-desc"
                    name="description"
                    rows={4}
                    defaultValue={property.description}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface resize-none"
                  ></textarea>
                </div>
                <div className="md:col-span-2 pt-4 border-t border-outline-variant/50 flex gap-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl bg-gold-accent text-[var(--on-gold)] font-black text-xs cursor-pointer shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4 text-[var(--on-gold)] stroke-[3]" /> Commit audited
                    modifications
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
