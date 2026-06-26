/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface NotificationProps {
  message: string | null;
  type: "success" | "info" | "error";
  onClose: () => void;
}

export default React.memo(function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90vw] md:w-auto font-sans"
          role={type === 'error' ? 'alert' : 'status'}
          aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
          <div className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-md border backdrop-blur-md ${
            type === "success" 
              ? "bg-[#10B981]/15 border-[#10B981]/30 text-emerald-300 shadow-emerald-950/10" 
              : type === "error"
              ? "bg-[#EF4444] border-[#EF4444]/30 text-on-surface shadow-red-950/20"
              : "bg-surface-container/95 border-outline-variant text-on-surface shadow-black/30"
          }`}>
            
            {type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : type === "error" ? (
              <XCircle className="h-5 w-5 text-on-surface shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gold-accent shrink-0" />
            )}
            
            <p className="text-xs font-bold leading-relaxed pr-2 select-none">
              {message}
            </p>

            <button 
              onClick={onClose} 
              className="text-on-surface-variant hover:text-on-surface transition-colors text-xs font-bold font-mono pl-2 border-l border-outline-variant"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
