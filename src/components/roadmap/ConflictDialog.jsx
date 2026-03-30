/**
 * @fileoverview Discotive Roadmap — Cloud vs Local Conflict Resolution Dialog
 *
 * Shown when the IDB local cache is newer than the last cloud sync.
 * This handles the scenario the original completely missed:
 *   User edits on mobile → IDB updated → edits on desktop → cloud updated
 *   → back on mobile: which version wins?
 *
 * The user sees a clear comparison and chooses.
 */

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, Clock, Check, X } from "lucide-react";

const fmt = (ms) => {
  if (!ms) return "Unknown time";
  const d = new Date(ms);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {{ nodes: object[], localTs: number, cloudTs: number }} props.conflict
 * @param {Function} props.onUseCloud  — restore cloud version
 * @param {Function} props.onUseLocal  — keep local IDB version
 */
export const ConflictDialog = ({
  isOpen,
  conflict,
  onUseCloud,
  onUseLocal,
}) => {
  const cloudBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => cloudBtnRef.current?.focus(), 50);
  }, [isOpen]);

  const localCount = conflict?.localNodes ?? 0;
  const cloudCount = conflict?.cloudNodes ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Data conflict — choose which version to keep"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            className="relative w-full max-w-md bg-[#060606] border border-amber-900/30 rounded-[2rem] p-7 shadow-[0_0_80px_rgba(245,158,11,0.1)]"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <CloudOff className="w-7 h-7 text-amber-500" />
            </div>

            <h2 className="text-lg font-black text-white text-center mb-2">
              Version Conflict Detected
            </h2>
            <p className="text-xs text-[#666] text-center leading-relaxed mb-7">
              Your local device has unsaved changes that differ from the cloud
              version. Choose which version to restore.
            </p>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              {/* Cloud */}
              <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                    Cloud
                  </span>
                </div>
                <p className="text-xl font-black text-white font-mono mb-1">
                  {cloudCount}
                </p>
                <p className="text-[8px] text-[#555] uppercase tracking-widest mb-2">
                  nodes
                </p>
                <div className="flex items-center gap-1 text-[8px] text-[#444]">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  {fmt(conflict?.cloudTs)}
                </div>
              </div>

              {/* Local */}
              <div className="p-4 bg-[#0a0a0a] border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <CloudOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                    Local Draft
                  </span>
                </div>
                <p className="text-xl font-black text-white font-mono mb-1">
                  {localCount}
                </p>
                <p className="text-[8px] text-[#555] uppercase tracking-widest mb-2">
                  nodes
                </p>
                <div className="flex items-center gap-1 text-[8px] text-[#444]">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  {fmt(conflict?.localTs)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                ref={cloudBtnRef}
                onClick={onUseCloud}
                className="flex-1 py-3 bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-black rounded-xl hover:bg-sky-500/20 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
              >
                <Cloud className="w-4 h-4" /> Use Cloud
              </button>
              <button
                onClick={onUseLocal}
                className="flex-1 py-3 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-black rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                <CloudOff className="w-4 h-4" /> Keep Local
              </button>
            </div>

            <p className="text-[8px] text-[#333] text-center mt-4">
              The other version will be discarded permanently.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
