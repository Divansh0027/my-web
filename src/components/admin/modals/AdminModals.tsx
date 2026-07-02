import React from "react";
import FocusLock from "react-focus-lock";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, X, AlertTriangle, Edit, AlertCircle, Mail as CheckSquare } from "lucide-react";
import { Property } from "../../../types";

// Add Property Modal
export function AddPropertyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock>
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-surface-container border border-outline-variant/50 w-full max-w-2xl rounded-2xl p-6 relative shadow-md font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-base font-extrabold text-gold-accent uppercase tracking-wide border-b border-outline-variant/50 pb-3.5 mb-5 flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Direct manual property addition
              </h3>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant">
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-title" className="text-[10px] uppercase font-bold text-on-surface-variant">Property Title</label>
                  <input id="add-prop-title" type="text" name="title" placeholder="e.g. Luxury Penthouse duplex Rajnagar" required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-price" className="text-[10px] uppercase font-bold text-on-surface-variant">Price in Rupees (Raw Integer)</label>
                  <input id="add-prop-price" type="number" name="price" placeholder="e.g. 7500000 (75 Lakhs)" required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-locality" className="text-[10px] uppercase font-bold text-on-surface-variant">Locality / Area Name</label>
                  <input id="add-prop-locality" type="text" name="location" placeholder="e.g. Rajnagar Extension, Ghaziabad" required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-type" className="text-[10px] uppercase font-bold text-on-surface-variant">Asset Type</label>
                  <select id="add-prop-type" name="type" className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer">
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial Plots">Commercial Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-bhk" className="text-[10px] uppercase font-bold text-on-surface-variant">BHK configuration</label>
                  <select id="add-prop-bhk" name="bhk" className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer">
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="N/A Plots">N/A Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-area" className="text-[10px] uppercase font-bold text-on-surface-variant">Area size (Number)</label>
                  <input id="add-prop-area" type="number" name="area" placeholder="e.g. 1560 SQ FT" defaultValue={1500} className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-unit" className="text-[10px] uppercase font-bold text-on-surface-variant">Area Unit</label>
                  <input id="add-prop-unit" type="text" name="areaUnit" defaultValue="Sq.Ft." className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="add-prop-img" className="text-[10px] uppercase font-bold text-on-surface-variant">Image URL</label>
                  <input id="add-prop-img" type="url" name="imageUrl" placeholder="e.g. https://images.unsplash.com/photo-..." className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface font-mono text-[10.5px]" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label htmlFor="add-prop-rera" className="text-[10px] uppercase font-bold text-on-surface-variant">RERA Approved Status</label>
                    <select id="add-prop-rera" name="reraApproved" className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer">
                      <option value="true">YES - Approved</option>
                      <option value="false">NO - Pending</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="add-prop-premium" className="text-[10px] uppercase font-bold text-on-surface-variant">Is Premium Badge</label>
                    <select id="add-prop-premium" name="isPremium" className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer">
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Listing Placement</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="add-prop-desc" className="text-[10px] uppercase font-bold text-on-surface-variant">Property Description</label>
                  <textarea id="add-prop-desc" name="description" rows={3.5} placeholder="Enter exhaustive structural information, near RRTS landmarks, and direct price guarantees..." required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface resize-none"></textarea>
                </div>
                <div className="md:col-span-2 pt-4 border-t border-outline-variant/50 flex gap-4">
                  <button type="submit" className="flex-grow py-3 rounded-xl bg-gold-accent text-[#0F172A] font-black text-xs cursor-pointer shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5">
                    <Check className="h-4 w-4 text-[#0F172A] stroke-[3]" /> Publish Audited Asset Listing
                  </button>
                  <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-surface-container-high hover:bg-slate-750 text-slate-350 border border-outline-variant/50">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}

// Reject Property Modal
export function RejectPropertyModal({
  property,
  reason,
  notes,
  onReasonChange,
  onNotesChange,
  onClose,
  onConfirm
}: {
  property: Property | null;
  reason: string;
  notes: string;
  onReasonChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {property && (
        <FocusLock>
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-surface-container border border-outline-variant/50 w-full max-w-md rounded-2xl p-6 relative shadow-md font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wide border-b border-outline-variant/50 pb-3 mb-5 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="h-4 w-4 text-red-550" /> Reject Property Listing
              </h3>
              <div className="space-y-4 text-xs text-on-surface-variant font-sans">
                <div className="space-y-1.5">
                  <label htmlFor="reject-reason" className="text-[10px] uppercase font-bold text-on-surface-variant">Reason for rejection (Required)</label>
                  <select id="reject-reason" value={reason} onChange={(e) => onReasonChange(e.target.value)} className="w-full bg-surface border border-outline-variant/50 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none cursor-pointer">
                    <option value="Incomplete information">Incomplete information</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Images missing">Images missing</option>
                    <option value="Other - specify below">Other - specify below</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="reject-notes" className="text-[10px] uppercase font-bold text-on-surface-variant">Additional notes for submitter (Optional)</label>
                  <textarea id="reject-notes" rows={4} value={notes} onChange={(e) => onNotesChange(e.target.value)} placeholder="Enter message for the property owner..." className="w-full bg-surface border border-outline-variant/50 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-on-surface placeholder-slate-600 outline-none resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={onClose} className="flex-grow py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container-high text-on-surface-variant font-bold text-xs select-none cursor-pointer transition-colors">
                    Cancel
                  </button>
                  <button onClick={onConfirm} className="flex-grow py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-on-surface font-black text-xs cursor-pointer transition-colors font-sans">
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}

// Edit Property Modal
export function EditPropertyModal({
  isOpen,
  property,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && property && (
        <FocusLock>
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-surface-container border border-outline-variant/50 w-full max-w-2xl rounded-2xl p-6 relative shadow-md font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-base font-extrabold text-gold-accent uppercase tracking-wide border-b border-outline-variant/50 pb-3 mb-5 flex items-center gap-1.5">
                <Edit className="h-4 w-4" /> Edit Real Estate Credentials
              </h3>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant">
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-title" className="text-[10px] uppercase font-bold text-on-surface-variant">Property Title</label>
                  <input id="edit-prop-title" type="text" name="title" defaultValue={property.title} required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-price" className="text-[10px] uppercase font-bold text-on-surface-variant">Price in Rupees</label>
                  <input id="edit-prop-price" type="number" name="price" defaultValue={property.price} required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-locality" className="text-[10px] uppercase font-bold text-on-surface-variant">Locality Address</label>
                  <input id="edit-prop-locality" type="text" name="location" defaultValue={property.location} required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-type" className="text-[10px] uppercase font-bold text-on-surface-variant">Category Type</label>
                  <select id="edit-prop-type" name="type" defaultValue={property.type} className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer">
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villas">Villas</option>
                    <option value="Commercial Plots">Commercial Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-bhk" className="text-[10px] uppercase font-bold text-on-surface-variant">BHK configuration</label>
                  <select id="edit-prop-bhk" name="bhk" defaultValue={property.bhk || ""} className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface cursor-pointer">
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="N/A Plots">N/A Plots</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-area" className="text-[10px] uppercase font-bold text-on-surface-variant">Area size (Number)</label>
                  <input id="edit-prop-area" type="number" name="area" defaultValue={property.area} className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-unit" className="text-[10px] uppercase font-bold text-on-surface-variant">Area Unit</label>
                  <input id="edit-prop-unit" type="text" name="areaUnit" defaultValue={property.areaUnit} className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="edit-prop-img" className="text-[10px] uppercase font-bold text-on-surface-variant">Override Main Hero Image URL</label>
                  <input id="edit-prop-img" type="url" name="imageUrl" placeholder="Keep empty to preserve existing unsplash imagery" className="w-full bg-surface border border-gold-accent/20 rounded-xl px-3.5 py-2.5 text-on-surface font-mono text-[10px]" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div className="space-y-1.5">
                    <label htmlFor="edit-prop-rera" className="text-[10px] uppercase font-bold text-on-surface-variant">RERA Audit status</label>
                    <select id="edit-prop-rera" name="reraApproved" defaultValue={property.reraApproved ? "true" : "false"} className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer">
                      <option value="true">Approved</option>
                      <option value="false">Pending Verification</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="edit-prop-premium" className="text-[10px] uppercase font-bold text-on-surface-variant">Is Premium Badge</label>
                    <select id="edit-prop-premium" name="isPremium" defaultValue={property.isPremium ? "true" : "false"} className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-on-surface cursor-pointer">
                      <option value="false">Standard Listing</option>
                      <option value="true">Premium Feature placement</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="edit-prop-desc" className="text-[10px] uppercase font-bold text-on-surface-variant">Listing Description</label>
                  <textarea id="edit-prop-desc" name="description" rows={4} defaultValue={property.description} required className="w-full bg-surface border border-outline-variant rounded-xl px-3.5 py-2.5 text-on-surface resize-none"></textarea>
                </div>
                <div className="md:col-span-2 pt-4 border-t border-outline-variant/50 flex gap-4">
                  <button type="submit" className="flex-grow py-3 rounded-xl bg-gold-accent text-[#0F172A] font-black text-xs cursor-pointer shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5">
                    <Check className="h-4 w-4 text-[#0F172A] stroke-[3]" /> Commit audited modifications
                  </button>
                  <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-surface-container-high hover:bg-slate-750 text-slate-350 border border-outline-variant/50">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}

// Confirm Dialog Modal
export function ConfirmDialogModal({
  isOpen,
  title,
  message,
  isDanger,
  onConfirm,
  onClose
}: {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock>
          <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-md flex items-center justify-center px-4">
            <motion.div
              className={`border w-full max-w-sm rounded-2xl p-5 shadow-md relative font-sans ${
                isDanger ? "bg-red-950/20 border-red-500/30" : "bg-surface-container border-outline-variant/50"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-2 mb-3">
                {isDanger ? <AlertCircle className="h-5 w-5 text-red-400" /> : <CheckSquare className="h-5 w-5 text-gold-accent" />}
                <h4 className="font-extrabold text-gold-accent text-xs uppercase tracking-wider">{title}</h4>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-6 font-medium">
                {message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  className={`flex-grow py-2.5 rounded-xl text-[#0F172A] font-black text-xs cursor-pointer transition-all ${
                    isDanger ? "bg-red-500 hover:bg-red-650 hover:text-on-surface text-[#0F172A]" : "bg-gold-accent hover:bg-gold-hover hover:scale-105 shadow-md"
                  }`}
                >
                  Confirm Execution
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-slate-750 text-on-surface-variant font-bold text-xs select-none cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}
