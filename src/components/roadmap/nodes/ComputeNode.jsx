/**
 * @fileoverview ComputeNode — AI Gatekeeper Representation
 * * Visualizes AI processing, asynchronous queue states, and backoff penalties.
 */

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { Cpu, AlertOctagon } from "lucide-react";
import { NODE_STATES } from "../../../lib/roadmap/constants";
import { HANDLE_S } from "../../../lib/roadmap/layout";

export const ComputeNode = memo(({ data, selected }) => {
  const computedState = data._computed?.state || NODE_STATES.LOCKED;

  const isVerifying = computedState === NODE_STATES.VERIFYING;
  const isBackoff = computedState === NODE_STATES.FAILED_BACKOFF;
  const isVerified =
    computedState === NODE_STATES.VERIFIED ||
    computedState === NODE_STATES.VERIFIED_GHOST;

  let statusColor = "rgba(255,255,255,0.15)";
  if (isVerifying) statusColor = "#8b5cf6"; // AI Violet
  if (isBackoff) statusColor = "#ef4444"; // Penalty Crimson
  if (isVerified) statusColor = "#10b981"; // Success Emerald

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-300 rounded-full"
      style={{
        width: 56,
        height: 56,
        background: "#0d0d12",
        border: `2px solid ${isVerifying ? "transparent" : `${statusColor}50`}`,
        boxShadow: selected ? `0 0 0 2px ${statusColor}` : "none",
        zIndex: isVerifying ? 50 : 10,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_S, borderColor: statusColor }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_S, borderColor: statusColor }}
      />

      {/* ── Active AI Compute Rings ── */}
      {isVerifying && (
        <>
          <motion.div
            className="absolute inset-[-2px] rounded-full"
            style={{ border: `2px dashed ${statusColor}` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[-6px] rounded-full"
            style={{ border: `1px solid ${statusColor}40` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      )}

      {/* ── Center Icon ── */}
      <div
        className="flex items-center justify-center rounded-full w-full h-full"
        style={{ background: `${statusColor}15` }}
      >
        {isBackoff ? (
          <AlertOctagon
            className="w-5 h-5 animate-pulse"
            style={{ color: statusColor }}
          />
        ) : (
          <Cpu
            className={`w-5 h-5 ${isVerifying ? "animate-pulse" : ""}`}
            style={{ color: statusColor }}
          />
        )}
      </div>

      {/* ── Diagnostic Label ── */}
      {(isVerifying || isBackoff) && (
        <div
          className="absolute top-[115%] left-1/2 -translate-x-1/2 text-[8px] font-bold font-mono tracking-widest whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-white/10"
          style={{ color: statusColor }}
        >
          {isBackoff ? "SYS_LOCK" : "COMPUTING"}
        </div>
      )}
    </div>
  );
});

ComputeNode.displayName = "ComputeNode";
